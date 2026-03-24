'use strict';

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticateToken = require('../middlewares/authenticateToken');
const validationErrorHandler = require('../middlewares/validationErrorHandler');
const { createCourseValidator } = require('../validators/courseValidator');


router.get('/categories', courseController.getCategories);
router.get('/', courseController.getPublicCourses);
router.get('/:slug', courseController.getCourseDetail);

router.post('/',
    authenticateToken,
    createCourseValidator,
    validationErrorHandler,
    courseController.createCourse);

module.exports = router;