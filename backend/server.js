'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const sequelize = require('./config/config');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const orderRoutes = require('./routes/orderRoutes');

const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

const server = express();
const PORT = process.env.PORT || 5000;

server.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  })
);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(requestLogger);

server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

server.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'Backend E-Learning đang hoạt động',
  });
});

server.use('/api/auth', authRoutes);
server.use('/api/users', userRoutes);
server.use('/api/courses', courseRoutes);
server.use('/api/orders', orderRoutes);

server.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công');

    server.listen(PORT, () => {
      console.log(`Server chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error.message);
  }
};

startServer();