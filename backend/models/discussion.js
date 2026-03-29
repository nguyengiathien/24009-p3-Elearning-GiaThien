'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Discussion = sequelize.define(
  'Discussion',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    lessonId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'lesson_id',
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    parentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'parent_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'discussions',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Discussion;