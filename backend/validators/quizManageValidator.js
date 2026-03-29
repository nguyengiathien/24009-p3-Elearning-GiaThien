'use strict';

const { body, param } = require('express-validator');

const createQuizValidator = [
  param('lessonId')
    .isInt({ min: 1 })
    .withMessage('lessonId không hợp lệ'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tiêu đề quiz không được để trống')
    .isLength({ min: 2, max: 255 })
    .withMessage('Tiêu đề quiz phải từ 2 đến 255 ký tự'),

  body('passScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('passScore phải từ 0 đến 100'),

  body('timeLimitMinutes')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('timeLimitMinutes phải lớn hơn 0'),
]

const createQuestionValidator = [
  param('quizId')
    .isInt({ min: 1 })
    .withMessage('quizId không hợp lệ'),

  body('questionText')
    .trim()
    .notEmpty()
    .withMessage('Nội dung câu hỏi không được để trống')
    .isLength({ min: 2 })
    .withMessage('Nội dung câu hỏi quá ngắn'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('sortOrder không hợp lệ'),
]

const createAnswerValidator = [
  param('questionId')
    .isInt({ min: 1 })
    .withMessage('questionId không hợp lệ'),

  body('answerText')
    .trim()
    .notEmpty()
    .withMessage('Nội dung đáp án không được để trống'),

  body('isCorrect')
    .isBoolean()
    .withMessage('isCorrect phải là true hoặc false'),
]

module.exports = {
  createQuizValidator,
  createQuestionValidator,
  createAnswerValidator,
};