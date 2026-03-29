'use strict';

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const validationErrorHandler = require('../middlewares/validationErrorHandler');
const {
  createCourseValidator,
  createSectionValidator,
  createLessonValidator,
} = require('../validators/courseValidator');

router.get('/categories', courseController.getCategories);
router.get('/', courseController.getPublicCourses);
router.get('/:slug', courseController.getCourseDetail);

router.post(
  '/',
  authenticateToken,
  authorizeRole('admin', 'instructor'),
  createCourseValidator,
  validationErrorHandler,
  courseController.createCourse
);

router.post(
  '/:courseId/sections',
  authenticateToken,
  authorizeRole('admin', 'instructor'),
  createSectionValidator,
  validationErrorHandler,
  courseController.createSection
);

router.post(
  '/:courseId/lessons',
  authenticateToken,
  authorizeRole('admin', 'instructor'),
  createLessonValidator,
  validationErrorHandler,
  courseController.createLesson
);

module.exports = router;