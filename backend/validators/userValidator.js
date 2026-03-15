'use strict';

const { body } = require('express-validator');

const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Họ tên phải từ 2 đến 150 ký tự'),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 9, max: 20 })
    .withMessage('Số điện thoại không hợp lệ'),
];

module.exports = {
  updateProfileValidator,
};