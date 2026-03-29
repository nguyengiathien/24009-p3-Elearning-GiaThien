'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const LessonProgress = sequelize.define(
  'LessonProgress',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    enrollmentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'enrollment_id',
    },
    lessonId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'lesson_id',
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_completed',
    },
    watchedSeconds: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'watched_seconds',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
  },
  {
    tableName: 'lesson_progresses',
    timestamps: false,
    underscored: true,
  }
);

module.exports = LessonProgress;