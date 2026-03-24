'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    courseId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'course_id',
    },
    couponId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'coupon_id',
    },
    orderCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_code',
    },
    originalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'original_price',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'discount_amount',
    },
    finalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'final_price',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status',
    },
    paymentMethod: {
      type: DataTypes.ENUM('stripe'),
      allowNull: false,
      defaultValue: 'stripe',
      field: 'payment_method',
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;