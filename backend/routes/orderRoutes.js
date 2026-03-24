'use strict';

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const orderController = require('../controllers/orderController');

router.use(authenticateToken, authorizeRole('student'));

router.get('/checkout/:slug', orderController.getCheckoutSummary);
router.post('/create-payment-intent', orderController.createPaymentIntent);
router.post('/confirm-payment', orderController.confirmPayment);

module.exports = router;