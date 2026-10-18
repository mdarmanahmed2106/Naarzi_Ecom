const crypto = require('crypto');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { razorpayInstance, isMock } = require('../config/razorpay');
const Notification = require('../models/Notification');
const { releaseOrderStock } = require('./order');

// Mark an order paid exactly once. The status check and the update are one atomic operation,
// so when the client's /verify call and Razorpay's order.paid webhook arrive together only one
// of them wins: and only the winner counts the coupon redemption.
// Returns the updated order if this call made the change, otherwise null.
const markOrderPaid = async (filter, razorpayPaymentId) => {
  const update = { paymentStatus: 'paid' };
  if (razorpayPaymentId) update.razorpayPaymentId = razorpayPaymentId;

  const order = await Order.findOneAndUpdate(
    { ...filter, paymentStatus: { $ne: 'paid' } },
    { $set: update },
    { returnDocument: 'after' }
  );

  if (order && order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }
  return order;
};

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

    // Validate minimum amount (minimum 100 paise / ₹1 for Razorpay)
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Order amount must be at least ₹1.00 (100 paise) to proceed with Razorpay checkout'
      });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString()
    };

    let razorpayOrder;

    // Reuse existing Razorpay order if already created and still in 'created' state
    if (order.razorpayOrderId && !isMock && razorpayInstance.orders.fetch) {
      try {
        const existingOrder = await razorpayInstance.orders.fetch(order.razorpayOrderId);
        if (existingOrder && existingOrder.status === 'created' && existingOrder.amount === amountInPaise) {
          razorpayOrder = existingOrder;
        }
      } catch (fetchErr) {
        razorpayOrder = null;
      }
    }

    if (!razorpayOrder) {
      try {
        razorpayOrder = await razorpayInstance.orders.create(options);
      } catch (rzpErr) {
        console.error('Razorpay Order Creation Error:', rzpErr);
        // Razorpay rejects bad/mismatched API keys with 401: surface that distinctly
        const isAuthFailure = rzpErr.statusCode === 401;
        return res.status(isAuthFailure ? 401 : 500).json({
          success: false,
          message: isAuthFailure
            ? 'Payment gateway authentication failed. Please contact support.'
            : rzpErr.error?.description || rzpErr.message || 'Failed to create Razorpay payment order'
        });
      }

      // Save Razorpay Order ID to our DB order
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    }

    res.status(200).json({
      success: true,
      // Public key ID that created this order, so the checkout modal always uses the matching key
      key: process.env.RAZORPAY_KEY_ID,
      order_id: razorpayOrder.id,
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
      // Real signature verification: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      // Constant-time comparison so the signature can't be guessed byte-by-byte from timing
      const expected = Buffer.from(expectedSignature, 'utf8');
      const received = Buffer.from(String(razorpay_signature), 'utf8');
      isVerified = expected.length === received.length && crypto.timingSafeEqual(expected, received);
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found'
      });
    }

    // Only the customer who placed the order (or an admin) may confirm its payment
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify payment for this order'
      });
    }

    // Already confirmed (e.g. by the webhook): succeed without double-counting the coupon
    if (order.paymentStatus === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order
      });
    }

    if (isVerified) {
      // Payment Successful. markOrderPaid is atomic, so if the webhook confirms the same payment
      // at the same moment, only one of them counts the coupon.
      const paidOrder = await markOrderPaid({ _id: order._id }, razorpay_payment_id);

      return res.status(200).json({
        success: true,
        message: 'Payment verified and captured successfully',
        order: paidOrder || (await Order.findById(order._id))
      });
    } else {
      // Signature mismatch: reject without touching the order. A forged or corrupted request
      // must not cancel a real order: if the payment genuinely succeeded, the webhook still
      // confirms it; if not, the abandoned-stock job releases the reserved stock later.
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

      const expected = Buffer.from(digest, 'utf8');
      const received = Buffer.from(String(signature), 'utf8');
      isValid = expected.length === received.length && crypto.timingSafeEqual(expected, received);
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

      const paymentId = payload.payment ? payload.payment.entity.id : undefined;
      const paidOrder = await markOrderPaid({ razorpayOrderId }, paymentId);
      if (paidOrder) {
        console.log(`Webhook updated Order ${paidOrder._id} to paid`);
      }
    } else if (event === 'payment.failed') {
      const razorpayPayment = payload.payment.entity;
      const razorpayOrderId = razorpayPayment.order_id;

      // Claim pending → failed atomically so this can't overwrite a payment confirmed meanwhile
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId, paymentStatus: 'pending' },
        { $set: { paymentStatus: 'failed' } },
        { returnDocument: 'after' }
      );

      if (order) {
        // Release stock back (releaseOrderStock guarantees this happens at most once per order)
        await releaseOrderStock(order);
        console.log(`Webhook updated Order ${order._id} to failed. Stock released.`);
      }
    } else if (event === 'refund.processed' || event === 'refund.failed') {
      const refund = payload.refund && payload.refund.entity;
      if (refund) {
        const order = await Order.findOne({
          $or: [{ razorpayRefundId: refund.id }, { razorpayPaymentId: refund.payment_id }]
        });
        if (order) {
          if (event === 'refund.processed') {
            order.refundStatus = 'completed';
            order.paymentStatus = 'refunded';
            order.refundedAt = new Date();
          } else {
            order.refundStatus = 'failed';
            order.razorpayRefundId = null; // allow the admin to retry
            await Notification.create({
              title: 'Refund Failed',
              message: `Razorpay could not complete the refund of ₹${order.totalAmount} for order #${order._id.toString().slice(-8).toUpperCase()}. Retry it from the order page.`,
              type: 'REFUND_REQUESTED',
              referenceId: order._id,
              referenceModel: 'Order'
            });
          }
          await order.save();
          console.log(`Webhook ${event} recorded for Order ${order._id}`);
        }
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
