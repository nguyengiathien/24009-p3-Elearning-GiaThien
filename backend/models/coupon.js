'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Coupon = sequelize.define(
  'Coupon',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    discountType: {
      type: DataTypes.ENUM('percent', 'fixed'),
      allowNull: false,
      field: 'discount_type',
    },
    discountValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'discount_value',
    },
    maxUses: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'max_uses',
    },
    usedCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'used_count',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expired_at',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Coupon;