'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'order_id',
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'stripe',
    },
    providerPaymentId: {
      type: DataTypes.STRING(191),
      allowNull: true,
      field: 'provider_payment_id',
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at',
    },
  },
  {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Payment;