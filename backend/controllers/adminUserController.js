'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { Role, User } = require('../models');

const serializeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  roleId: user.roleId,
  role: user.roleInfo?.code || null,
  roleName: user.roleInfo?.name || null,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-10);
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'code', 'name'],
      order: [['id', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const keyword = (req.query.keyword || '').trim();
    const roleId = req.query.roleId;
    const status = req.query.status;

    const where = {};

    if (keyword) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (roleId) {
      where.roleId = Number(roleId);
    }

    if (status) {
      where.status = status;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: [
        'id',
        'roleId',
        'fullName',
        'email',
        'phone',
        'avatarUrl',
        'status',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Role,
          as: 'roleInfo',
          attributes: ['id', 'code', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: {
        items: rows.map(serializeUser),
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages: Math.max(1, Math.ceil(count / limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        'id',
        'roleId',
        'fullName',
        'email',
        'phone',
        'avatarUrl',
        'status',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Role,
          as: 'roleInfo',
          attributes: ['id', 'code', 'name'],
        },
      ],
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

const createUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, roleId, status, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email đã tồn tại',
      });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò không tồn tại',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone: phone || null,
      roleId,
      status: status || 'active',
      passwordHash,
    });

    const freshUser = await User.findByPk(user.id, {
      attributes: [
        'id',
        'roleId',
        'fullName',
        'email',
        'phone',
        'avatarUrl',
        'status',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Role,
          as: 'roleInfo',
          attributes: ['id', 'code', 'name'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: serializeUser(freshUser),
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, roleId, status } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const duplicatedEmail = await User.findOne({
      where: {
        email,
        id: {
          [Op.ne]: user.id,
        },
      },
    });

    if (duplicatedEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email đã tồn tại',
      });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Vai trò không tồn tại',
      });
    }

    user.fullName = fullName;
    user.email = email;
    user.phone = phone || null;
    user.roleId = roleId;
    user.status = status;

    await user.save();

    const freshUser = await User.findByPk(user.id, {
      attributes: [
        'id',
        'roleId',
        'fullName',
        'email',
        'phone',
        'avatarUrl',
        'status',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Role,
          as: 'roleInfo',
          attributes: ['id', 'code', 'name'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: serializeUser(freshUser),
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'roleInfo',
          attributes: ['id', 'code', 'name'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'roleInfo',
          attributes: ['id', 'code', 'name'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const nextPassword = password || generateTempPassword();
    const passwordHash = await bcrypt.hash(nextPassword, 10);

    user.passwordHash = passwordHash;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
      data: {
        user: serializeUser(user),
        temporaryPassword: nextPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  getUsers,
  getUserDetail,
  createUser,
  updateUser,
  updateUserStatus,
  resetPassword,
};