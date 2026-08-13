const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook
} = require('../controllers/payment');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', requireAuth, createRazorpayOrder);
router.post('/verify', requireAuth, verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
