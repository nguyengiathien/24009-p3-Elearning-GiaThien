'use strict';

const { body, param } = require('express-validator');

const getQuizValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug khóa học không được để trống'),

  param('lessonId')
    .isInt({ min: 1 })
    .withMessage('lessonId không hợp lệ'),
];

const submitQuizValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug khóa học không được để trống'),

  param('lessonId')
    .isInt({ min: 1 })
    .withMessage('lessonId không hợp lệ'),

  body('answers')
    .isArray()
    .withMessage('answers phải là một mảng'),

  body('answers.*.questionId')
    .isInt({ min: 1 })
    .withMessage('questionId không hợp lệ'),

  body('answers.*.answerId')
    .isInt({ min: 1 })
    .withMessage('answerId không hợp lệ'),
];

module.exports = {
  getQuizValidator,
  submitQuizValidator,
};