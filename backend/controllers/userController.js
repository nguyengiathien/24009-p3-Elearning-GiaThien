'use strict';

const path = require('path');
const { Role, User } = require('../models');

const serializeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.roleInfo?.code || null,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'phone', 'avatarUrl', 'status', 'createdAt', 'updatedAt'],
      include: [{ model: Role, as: 'roleInfo', attributes: ['id', 'code', 'name'] }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người dùng',
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;

    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: 'roleInfo', attributes: ['id', 'code', 'name'] }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trang cá nhân thành công',
      data: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ảnh đại diện',
      });
    }

    const avatarUrl = `/uploads/avatars/${path.basename(req.file.path)}`;
    user.avatarUrl = avatarUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Tải ảnh đại diện thành công',
      data: {
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
};