'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Enrollment = sequelize.define(
  'Enrollment',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    courseId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'course_id',
    },
    enrolledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'enrolled_at',
    },
    progressPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'progress_percent',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
  },
  {
    tableName: 'enrollments',
    timestamps: false,
    underscored: true,
  }
);

module.exports = Enrollment;