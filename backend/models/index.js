'use strict';

const sequelize = require('../config/config');
const Role = require('./role');
const User = require('./user');
const Category = require('./category');
const Course = require('./course');
const CourseSection = require('./courseSection');
const Lesson = require('./lesson');
const Enrollment = require('./enrollment');
const Coupon = require('./coupon');
const Order = require('./order');
const Payment = require('./payment');

Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'roleInfo' });

User.hasMany(Course, { foreignKey: 'instructorId', as: 'instructedCourses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

Category.hasMany(Course, { foreignKey: 'categoryId', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Course.hasMany(CourseSection, { foreignKey: 'courseId', as: 'sections' });
CourseSection.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

CourseSection.hasMany(Lesson, { foreignKey: 'sectionId', as: 'lessons' });
Lesson.belongsTo(CourseSection, { foreignKey: 'sectionId', as: 'section' });

Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.hasMany(Order, { foreignKey: 'courseId', as: 'orders' });
Order.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Coupon.hasMany(Order, { foreignKey: 'couponId', as: 'orders' });
Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });

Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

const db = {
  sequelize,
  Role,
  User,
  Category,
  Course,
  CourseSection,
  Lesson,
  Enrollment,
  Coupon,
  Order,
  Payment,
};

module.exports = db;