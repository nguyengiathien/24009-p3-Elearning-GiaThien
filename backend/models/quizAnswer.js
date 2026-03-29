'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const QuizAnswer = sequelize.define(
  'QuizAnswer',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    questionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'question_id',
    },
    answerText: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'answer_text',
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_correct',
    },
  },
  {
    tableName: 'quiz_answers',
    timestamps: true,
    underscored: true,
  }
);

module.exports = QuizAnswer;