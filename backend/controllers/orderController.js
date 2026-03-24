'use strict';

const Stripe = require('stripe');
const { sequelize, Coupon, Course, Enrollment, Order, Payment } = require('../models');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const generateOrderCode = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const normalizeAmount = (value) => Number(Number(value || 0).toFixed(2));

const validateCoupon = async (couponCode, originalPrice) => {
  if (!couponCode) {
    return {
      coupon: null,
      discountAmount: 0,
    };
  }

  const coupon = await Coupon.findOne({
    where: {
      code: couponCode,
      isActive: true,
    },
  });

  if (!coupon) {
    const err = new Error('Mã giảm giá không tồn tại hoặc đã ngưng hoạt động');
    err.status = 400;
    throw err;
  }

  const now = new Date();

  if (coupon.startedAt && new Date(coupon.startedAt) > now) {
    const err = new Error('Mã giảm giá chưa đến thời gian áp dụng');
    err.status = 400;
    throw err;
  }

  if (coupon.expiredAt && new Date(coupon.expiredAt) < now) {
    const err = new Error('Mã giảm giá đã hết hạn');
    err.status = 400;
    throw err;
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    const err = new Error('Mã giảm giá đã hết lượt sử dụng');
    err.status = 400;
    throw err;
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = normalizeAmount((originalPrice * Number(coupon.discountValue)) / 100);
  } else {
    discountAmount = normalizeAmount(coupon.discountValue);
  }

  discountAmount = Math.min(discountAmount, originalPrice);

  return {
    coupon,
    discountAmount,
  };
};

const getCheckoutCourse = async (slug) => {
  const course = await Course.findOne({
    where: {
      slug,
      status: 'public',
    },
    attributes: ['id', 'title', 'slug', 'shortDescription', 'coverImageUrl', 'price', 'isFree'],
  });

  if (!course) {
    const err = new Error('Không tìm thấy khóa học');
    err.status = 404;
    throw err;
  }

  return course;
};

const buildCheckoutSummary = async ({ userId, courseSlug, couponCode }) => {
  const course = await getCheckoutCourse(courseSlug);

  const existingEnrollment = await Enrollment.findOne({
    where: {
      userId,
      courseId: course.id,
    },
  });

  const originalPrice = normalizeAmount(course.price);
  const { coupon, discountAmount } = await validateCoupon(couponCode, originalPrice);
  const finalPrice = Math.max(0, normalizeAmount(originalPrice - discountAmount));

  return {
    course,
    coupon,
    originalPrice,
    discountAmount,
    finalPrice,
    isEnrolled: Boolean(existingEnrollment),
  };
};

const enrollUserToCourse = async (userId, courseId, transaction) => {
  const [enrollment] = await Enrollment.findOrCreate({
    where: { userId, courseId },
    defaults: {
      userId,
      courseId,
      enrolledAt: new Date(),
      progressPercent: 0,
    },
    transaction,
  });

  return enrollment;
};

const getCheckoutSummary = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const couponCode = (req.query.couponCode || '').trim().toUpperCase();

    const summary = await buildCheckoutSummary({
      userId: req.user.id,
      courseSlug: slug,
      couponCode,
    });

    return res.status(200).json({
      success: true,
      data: {
        course: summary.course,
        coupon: summary.coupon
          ? {
              id: summary.coupon.id,
              code: summary.coupon.code,
            }
          : null,
        originalPrice: summary.originalPrice,
        discountAmount: summary.discountAmount,
        finalPrice: summary.finalPrice,
        isEnrolled: summary.isEnrolled,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createPaymentIntent = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const couponCode = (req.body.couponCode || '').trim().toUpperCase();
    const courseSlug = req.body.courseSlug;

    const summary = await buildCheckoutSummary({
      userId: req.user.id,
      courseSlug,
      couponCode,
    });

    if (summary.isEnrolled) {
      await transaction.rollback();
      return res.status(200).json({
        success: true,
        data: {
          enrolled: true,
          message: 'Bạn đã mua khóa học này trước đó',
        },
      });
    }

    const order = await Order.create(
      {
        userId: req.user.id,
        courseId: summary.course.id,
        couponId: summary.coupon?.id || null,
        orderCode: generateOrderCode(),
        originalPrice: summary.originalPrice,
        discountAmount: summary.discountAmount,
        finalPrice: summary.finalPrice,
        paymentStatus: summary.finalPrice === 0 ? 'paid' : 'pending',
        paymentMethod: 'stripe',
      },
      { transaction }
    );

    if (summary.finalPrice === 0) {
      await enrollUserToCourse(req.user.id, summary.course.id, transaction);

      if (summary.coupon) {
        summary.coupon.usedCount += 1;
        await summary.coupon.save({ transaction });
      }

      await Payment.create(
        {
          orderId: order.id,
          provider: 'stripe',
          providerPaymentId: null,
          amount: 0,
          currency: 'USD',
          status: 'succeeded',
          paidAt: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      return res.status(200).json({
        success: true,
        data: {
          enrolled: true,
          orderId: order.id,
        },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(summary.finalPrice * 100),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: String(order.id),
        userId: String(req.user.id),
        courseId: String(summary.course.id),
      },
    });

    await Payment.create(
      {
        orderId: order.id,
        provider: 'stripe',
        providerPaymentId: paymentIntent.id,
        amount: summary.finalPrice,
        currency: 'USD',
        status: 'pending',
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        clientSecret: paymentIntent.client_secret,
        finalPrice: summary.finalPrice,
        enrolled: false,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      const err = new Error('Không tìm thấy đơn hàng');
      err.status = 404;
      throw err;
    }

    if (order.paymentStatus === 'paid') {
      await enrollUserToCourse(req.user.id, order.courseId, transaction);
      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: 'Đơn hàng đã được xác nhận trước đó',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      const err = new Error('Thanh toán chưa hoàn tất');
      err.status = 400;
      throw err;
    }

    const payment = await Payment.findOne({
      where: {
        orderId: order.id,
        providerPaymentId: paymentIntentId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment) {
      const err = new Error('Không tìm thấy bản ghi thanh toán');
      err.status = 404;
      throw err;
    }

    order.paymentStatus = 'paid';
    await order.save({ transaction });

    payment.status = 'succeeded';
    payment.paidAt = new Date();
    await payment.save({ transaction });

    if (order.couponId) {
      const coupon = await Coupon.findByPk(order.couponId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save({ transaction });
      }
    }

    await enrollUserToCourse(req.user.id, order.courseId, transaction);
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Thanh toán thành công và đã ghi danh khóa học',
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  getCheckoutSummary,
  createPaymentIntent,
  confirmPayment,
};