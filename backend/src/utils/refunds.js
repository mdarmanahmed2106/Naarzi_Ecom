const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { razorpayInstance, isMock } = require('../config/razorpay');

const shortId = (order) => order._id.toString().slice(-8).toUpperCase();

/**
 * Refund a paid order in full through Razorpay. Safe to call more than once: it only acts on
 * paid orders whose refund hasn't already been completed or started.
 *
 * Outcomes recorded on the order:
 *  - Razorpay processed it immediately → refundStatus 'completed', paymentStatus 'refunded'
 *  - Razorpay accepted it (status pending) → refundStatus 'pending' + razorpayRefundId; the
 *    refund.processed / refund.failed webhook finishes the job
 *  - Razorpay rejected it → refundStatus 'failed' + an admin notification to retry
 *
 * Returns { ok, status, message }. Never throws.
 */
const issueRefund = async (order) => {
  if (order.refundStatus === 'completed' || order.paymentStatus === 'refunded') {
    return { ok: true, status: 'completed', message: 'Refund already completed.' };
  }
  if (order.paymentStatus !== 'paid') {
    return { ok: false, status: order.refundStatus, message: 'Order has not been paid, so there is nothing to refund.' };
  }
  if (order.refundStatus === 'pending' && order.razorpayRefundId) {
    return { ok: true, status: 'pending', message: 'Refund already initiated.' };
  }
  if (!order.razorpayPaymentId) {
    order.refundStatus = 'failed';
    await order.save();
    await notifyFailure(order, 'No Razorpay payment ID is recorded for this order.');
    return { ok: false, status: 'failed', message: 'No payment ID recorded. Refund it from the Razorpay dashboard.' };
  }

  // Claim the refund so two simultaneous cancellations can't both refund
  const claim = await Order.updateOne(
    { _id: order._id, paymentStatus: 'paid', razorpayRefundId: null, refundStatus: { $ne: 'completed' } },
    { $set: { refundStatus: 'pending', razorpayRefundId: 'claimed' } }
  );
  if (claim.modifiedCount === 0) {
    return { ok: true, status: 'pending', message: 'Refund already in progress.' };
  }

  try {
    let refund;
    if (isMock) {
      refund = { id: `rfnd_mock_${Date.now()}`, status: 'processed' };
    } else {
      refund = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(order.totalAmount * 100), // paise
        speed: 'normal',
        notes: { order_id: order._id.toString() }
      });
    }

    order.razorpayRefundId = refund.id;
    if (refund.status === 'processed') {
      order.refundStatus = 'completed';
      order.paymentStatus = 'refunded';
      order.refundedAt = new Date();
    } else {
      order.refundStatus = 'pending';
    }
    await order.save();
    return {
      ok: true,
      status: order.refundStatus,
      message: order.refundStatus === 'completed' ? 'Refund processed.' : 'Refund initiated with Razorpay.'
    };
  } catch (err) {
    const reason = err?.error?.description || err?.message || 'Unknown Razorpay error';
    console.error(`Refund failed for order ${order._id}:`, reason);
    // Release the claim in the database directly: the in-memory document never saw the
    // 'claimed' marker, so setting it back to null there wouldn't be saved and the order would
    // stay locked, blocking the admin's retry.
    await Order.updateOne({ _id: order._id }, { $set: { refundStatus: 'failed', razorpayRefundId: null } });
    order.refundStatus = 'failed';
    order.razorpayRefundId = null;
    await notifyFailure(order, reason);
    return { ok: false, status: 'failed', message: `Refund failed: ${reason}` };
  }
};

const notifyFailure = async (order, reason) => {
  try {
    await Notification.create({
      title: 'Refund Failed',
      message: `Refund of ₹${order.totalAmount} for order #${shortId(order)} failed: ${reason}. Retry it from the order page.`,
      type: 'REFUND_REQUESTED',
      referenceId: order._id,
      referenceModel: 'Order'
    });
  } catch (e) {
    console.error('Failed to create refund-failure notification:', e);
  }
};

module.exports = { issueRefund };
