'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const CourseSection = sequelize.define(
  'CourseSection',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'course_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    tableName: 'course_sections',
    timestamps: true,
    underscored: true,
  }
);

module.exports = CourseSection;