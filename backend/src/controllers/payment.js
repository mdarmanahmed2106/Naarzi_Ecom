const crypto = require('crypto');
const Order = require('../models/Order');
const { razorpayInstance, isMock } = require('../config/razorpay');
const { releaseOrderStock } = require('./order');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find the DB order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this order'
      });
    }

    // Check if already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Razorpay amount in paise (multiply INR by 100)
    const amountInPaise = Math.round(order.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString()
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Save Razorpay Order ID to our DB order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment details: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'
      });
    }

    let isVerified = false;

    if (isMock) {
      // Allow verification in mock mode
      isVerified = true;
      console.log('Payment verified automatically in Razorpay MOCK mode.');
    } else {
      // Real signature verification
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isVerified = expectedSignature === razorpay_signature;
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found'
      });
    }

    if (isVerified) {
      // Payment Successful
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment verified and captured successfully',
        order
      });
    } else {
      // Payment Verification Failed
      order.paymentStatus = 'failed';
      await order.save();

      // Release stock
      await releaseOrderStock(order);

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook (Backup path)
// @route   POST /api/payment/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ success: false, message: 'Signature missing' });
    }

    let isValid = false;

    if (isMock) {
      isValid = true;
    } else {
      // Webhook validation needs the raw request body buffer
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(req.rawBody);
      const digest = shasum.digest('hex');

      isValid = digest === signature;
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Webhook event parsing
    const event = req.body.event;
    console.log(`Received Razorpay webhook event: ${event}`);

    const payload = req.body.payload;

    if (event === 'order.paid') {
      const razorpayOrder = payload.order.entity;
      const razorpayOrderId = razorpayOrder.id;

      const order = await Order.findOne({ razorpayOrderId });

      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        // Find the payment id from the webhook if available
        if (payload.payment) {
          order.razorpayPaymentId = payload.payment.entity.id;
        }
        await order.save();
        console.log(`Webhook updated Order ${order._id} to paid`);
      }
    } else if (event === 'payment.failed') {
      const razorpayPayment = payload.payment.entity;
      const razorpayOrderId = razorpayPayment.order_id;

      const order = await Order.findOne({ razorpayOrderId });

      if (order && order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed';
        await order.save();

        // Release stock back
        await releaseOrderStock(order);
        console.log(`Webhook updated Order ${order._id} to failed. Stock released.`);
      }
    }

    // Acknowledge receipt of webhook to Razorpay (200 OK)
    res.status(200).json({ success: true, status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Return 500 to tell Razorpay to retry later, or just log
    res.status(500).json({ success: false, error: error.message });
  }
};
