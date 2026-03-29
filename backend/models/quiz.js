'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Quiz = sequelize.define(
  'Quiz',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    lessonId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      field: 'lesson_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    passScore: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 80,
      field: 'pass_score',
    },
    timeLimitMinutes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'time_limit_minutes',
    },
  },
  {
    tableName: 'quizzes',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Quiz;