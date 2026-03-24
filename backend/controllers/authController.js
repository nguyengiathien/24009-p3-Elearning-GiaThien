'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Role, User } = require('../models');

const ROLE_ID_MAP = Object.freeze({
  teacher: 2,
  student: 3,
});

const serializeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.roleInfo?.code || null,
  status: user.status,
});

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.roleInfo?.code,
      fullName: user.fullName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email đã tồn tại',
      });
    }
    const roleId = ROLE_ID_MAP[role];
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ',
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      roleId: roleId,
      status: 'active',
    });

    const freshUser = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'roleInfo', attributes: ['id', 'code', 'name'] }],
    });

    const token = generateToken(freshUser);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: serializeUser(freshUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'roleInfo', attributes: ['id', 'code', 'name'] }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    if (user.status === 'locked') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: serializeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'phone', 'avatarUrl', 'status', 'createdAt', 'updatedAt'],
      include: [{ model: Role, as: 'roleInfo', attributes: ['id', 'code', 'name'] }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
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

module.exports = {
  register,
  login,
  me,
};