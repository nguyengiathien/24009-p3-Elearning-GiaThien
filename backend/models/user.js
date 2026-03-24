'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'role_id',
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'avatar_url',
    },
    status: {
      type: DataTypes.ENUM('active', 'locked', 'pending'),
      allowNull: false,
      defaultValue: 'active',
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verified_at',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;