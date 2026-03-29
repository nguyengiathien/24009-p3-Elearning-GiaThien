'use strict';

const sequelize = require('../config/config');
const Role = require('./role');
const User = require('./user');
const Category = require('./category');
const Course = require('./course');
const CourseSection = require('./courseSection');
const Lesson = require('./lesson');
const Enrollment = require('./enrollment');
const LessonProgress = require('./lessonProgress');
const Discussion = require('./discussion');
const Quiz = require('./quiz');
const QuizQuestion = require('./quizQuestion');
const QuizAnswer = require('./quizAnswer');
const QuizAttempt = require('./quizAttempt');
const QuizAttemptAnswer = require('./quizAttemptAnswer');
const Coupon = require('./coupon');
const Order = require('./order');
const Payment = require('./payment');

Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'roleInfo' });

User.hasMany(Course, { foreignKey: 'instructorId', as: 'instructedCourses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

Category.hasMany(Course, { foreignKey: 'categoryId', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Course.hasMany(CourseSection, { foreignKey: 'courseId', as: 'sections' });
CourseSection.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

CourseSection.hasMany(Lesson, { foreignKey: 'sectionId', as: 'lessons' });
Lesson.belongsTo(CourseSection, { foreignKey: 'sectionId', as: 'section' });

Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Enrollment.hasMany(LessonProgress, { foreignKey: 'enrollmentId', as: 'lessonProgresses' });
LessonProgress.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });

Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId', as: 'progresses' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

Lesson.hasMany(Discussion, { foreignKey: 'lessonId', as: 'discussions' });
Discussion.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

User.hasMany(Discussion, { foreignKey: 'userId', as: 'discussions' });
Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Discussion.belongsTo(Discussion, { foreignKey: 'parentId', as: 'parent' });
Discussion.hasMany(Discussion, { foreignKey: 'parentId', as: 'replies' });

Lesson.hasOne(Quiz, { foreignKey: 'lessonId', as: 'quiz' });
Quiz.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

Quiz.hasMany(QuizQuestion, { foreignKey: 'quizId', as: 'questions' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

QuizQuestion.hasMany(QuizAnswer, { foreignKey: 'questionId', as: 'answers' });
QuizAnswer.belongsTo(QuizQuestion, { foreignKey: 'questionId', as: 'question' });

Enrollment.hasMany(QuizAttempt, { foreignKey: 'enrollmentId', as: 'quizAttempts' });
QuizAttempt.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });

Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

QuizAttempt.hasMany(QuizAttemptAnswer, { foreignKey: 'attemptId', as: 'answers' });
QuizAttemptAnswer.belongsTo(QuizAttempt, { foreignKey: 'attemptId', as: 'attempt' });

QuizQuestion.hasMany(QuizAttemptAnswer, { foreignKey: 'questionId', as: 'attemptAnswers' });
QuizAttemptAnswer.belongsTo(QuizQuestion, { foreignKey: 'questionId', as: 'question' });

QuizAnswer.hasMany(QuizAttemptAnswer, { foreignKey: 'answerId', as: 'attemptAnswers' });
QuizAttemptAnswer.belongsTo(QuizAnswer, { foreignKey: 'answerId', as: 'answer' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.hasMany(Order, { foreignKey: 'courseId', as: 'orders' });
Order.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Coupon.hasMany(Order, { foreignKey: 'couponId', as: 'orders' });
Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });

Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

const db = {
  sequelize,
  Role,
  User,
  Category,
  Course,
  CourseSection,
  Lesson,
  Enrollment,
  LessonProgress,
  Discussion,
  Quiz,
  QuizQuestion,
  QuizAnswer,
  QuizAttempt,
  QuizAttemptAnswer,
  Coupon,
  Order,
  Payment,
};

module.exports = db;