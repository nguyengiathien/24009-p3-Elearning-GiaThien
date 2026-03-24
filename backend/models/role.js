'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Role = sequelize.define(
  'Role',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Role;