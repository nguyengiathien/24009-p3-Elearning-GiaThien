'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const QuizQuestion = sequelize.define(
  'QuizQuestion',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    quizId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'quiz_id',
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'question_text',
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    tableName: 'quiz_questions',
    timestamps: true,
    underscored: true,
  }
);

module.exports = QuizQuestion;