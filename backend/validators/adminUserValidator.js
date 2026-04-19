'use strict';

const { body, param } = require('express-validator');

const userIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('id người dùng không hợp lệ'),
];

const createUserValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Họ tên không được để trống')
    .isLength({ min: 2, max: 150 })
    .withMessage('Họ tên phải từ 2 đến 150 ký tự'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email không được để trống')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 9, max: 20 })
    .withMessage('Số điện thoại không hợp lệ'),

  body('roleId')
    .notEmpty()
    .withMessage('Vai trò không được để trống')
    .isInt({ min: 1 })
    .withMessage('roleId không hợp lệ'),

  body('status')
    .optional()
    .isIn(['active', 'locked'])
    .withMessage('Trạng thái không hợp lệ'),

  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu tối thiểu 6 ký tự'),
];

const updateUserValidator = [
  ...userIdParamValidator,

  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Họ tên không được để trống')
    .isLength({ min: 2, max: 150 })
    .withMessage('Họ tên phải từ 2 đến 150 ký tự'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email không được để trống')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 9, max: 20 })
    .withMessage('Số điện thoại không hợp lệ'),

  body('roleId')
    .notEmpty()
    .withMessage('Vai trò không được để trống')
    .isInt({ min: 1 })
    .withMessage('roleId không hợp lệ'),

  body('status')
    .notEmpty()
    .withMessage('Trạng thái không được để trống')
    .isIn(['active', 'locked'])
    .withMessage('Trạng thái không hợp lệ'),
];

const updateUserStatusValidator = [
  ...userIdParamValidator,

  body('status')
    .notEmpty()
    .withMessage('Trạng thái không được để trống')
    .isIn(['active', 'locked'])
    .withMessage('Trạng thái không hợp lệ'),
];

const resetPasswordValidator = [
  ...userIdParamValidator,

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới tối thiểu 6 ký tự'),
];

module.exports = {
  userIdParamValidator,
  createUserValidator,
  updateUserValidator,
  updateUserStatusValidator,
  resetPasswordValidator,
};