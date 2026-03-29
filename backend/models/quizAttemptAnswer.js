'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const QuizAttemptAnswer = sequelize.define(
  'QuizAttemptAnswer',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    attemptId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'attempt_id',
    },
    questionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'question_id',
    },
    answerId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'answer_id',
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_correct',
    },
  },
  {
    tableName: 'quiz_attempt_answers',
    timestamps: false,
    underscored: true,
  }
);

module.exports = QuizAttemptAnswer;