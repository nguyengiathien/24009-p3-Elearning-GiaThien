'use strict';

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');
const validationErrorHandler = require('../middlewares/validationErrorHandler');
const uploadAvatar = require('../middlewares/uploadAvatar');
const { updateProfileValidator } = require('../validators/userValidator');

router.get(
  '/profile',
  authenticateToken,
  userController.getProfile
);

router.put(
  '/profile',
  authenticateToken,
  updateProfileValidator,
  validationErrorHandler,
  userController.updateProfile
);

router.put(
  '/profile/avatar',
  authenticateToken,
  uploadAvatar.single('avatar'),
  userController.uploadAvatar
);

module.exports = router;