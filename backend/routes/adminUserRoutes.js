'use strict';

const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const validationErrorHandler = require('../middlewares/validationErrorHandler');
const adminUserController = require('../controllers/adminUserController');
const {
  userIdParamValidator,
  createUserValidator,
  updateUserValidator,
  updateUserStatusValidator,
  resetPasswordValidator,
} = require('../validators/adminUserValidator');

router.use(authenticateToken, authorizeRole('admin'));

router.get('/roles', adminUserController.getRoles);
router.get('/users', adminUserController.getUsers);

router.get(
  '/users/:id',
  userIdParamValidator,
  validationErrorHandler,
  adminUserController.getUserDetail
);

router.post(
  '/users',
  createUserValidator,
  validationErrorHandler,
  adminUserController.createUser
);

router.put(
  '/users/:id',
  updateUserValidator,
  validationErrorHandler,
  adminUserController.updateUser
);

router.patch(
  '/users/:id/status',
  updateUserStatusValidator,
  validationErrorHandler,
  adminUserController.updateUserStatus
);

router.post(
  '/users/:id/reset-password',
  resetPasswordValidator,
  validationErrorHandler,
  adminUserController.resetPassword
);

module.exports = router;