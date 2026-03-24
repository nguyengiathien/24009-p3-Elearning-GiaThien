'use strict';

const { body } = require('express-validator');

const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tên khóa học không được để trống')
    .isLength({ min: 3, max: 255 })
    .withMessage('Tên khóa học phải từ 3 đến 255 ký tự'),

  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug không được để trống')
    .isLength({ min: 3, max: 255 })
    .withMessage('Slug phải từ 3 đến 255 ký tự'),

  body('categoryId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('categoryId không hợp lệ'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá khóa học phải lớn hơn hoặc bằng 0'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level không hợp lệ'),

  body('status')
    .optional()
    .isIn(['draft', 'public', 'archived'])
    .withMessage('Trạng thái không hợp lệ'),

  body('isFree')
    .optional()
    .isBoolean()
    .withMessage('isFree phải là true hoặc false'),
];

module.exports = {
  createCourseValidator,
};