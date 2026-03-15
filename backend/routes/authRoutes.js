'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validationErrorHandler = require('../middlewares/validationErrorHandler');
const authenticateToken = require('../middlewares/authenticateToken');

router.post(
  '/register',
  registerValidator,
  validationErrorHandler,
  authController.register
);

router.post(
  '/login',
  loginValidator,
  validationErrorHandler,
  authController.login
);

router.get(
  '/me',
  authenticateToken,
  authController.me
);

module.exports = router;