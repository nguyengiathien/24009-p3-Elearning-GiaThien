'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    instructorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'instructor_id',
    },
    categoryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      field: 'category_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'short_description',
    },
    description: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    coverImageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'cover_image_url',
    },
    trailerUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'trailer_url',
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'public', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_free',
    },
    ratingAvg: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'rating_avg',
    },
    ratingCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'rating_count',
    },
  },
  {
    tableName: 'courses',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Course;