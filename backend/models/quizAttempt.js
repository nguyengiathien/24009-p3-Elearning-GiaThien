'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const QuizAttempt = sequelize.define(
  'QuizAttempt',
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
    quizId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'quiz_id',
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    isPassed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_passed',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'submitted_at',
    },
  },
  {
    tableName: 'quiz_attempts',
    timestamps: false,
    underscored: true,
  }
);

module.exports = QuizAttempt;