const cron = require('node-cron');
const Order = require('../models/Order');
const { releaseOrderStock } = require('../controllers/order');

const ABANDONED_THRESHOLD_MINUTES = 45; // adjust as needed

const releaseAbandonedOrders = async () => {
  const cutoff = new Date(Date.now() - ABANDONED_THRESHOLD_MINUTES * 60 * 1000);

  try {
    // Unpaid orders still waiting for payment (cancelled ones already returned their stock)
    const abandonedOrders = await Order.find({
      paymentStatus: 'pending',
      orderStatus: 'processing',
      createdAt: { $lt: cutoff }
    }).select('_id');

    if (abandonedOrders.length === 0) return;

    let released = 0;
    for (const { _id } of abandonedOrders) {
      // Claim the order atomically: if it was paid (or cancelled) in the meantime, this matches
      // nothing and we leave it alone instead of overwriting a successful payment.
      const order = await Order.findOneAndUpdate(
        { _id, paymentStatus: 'pending', orderStatus: 'processing' },
        { $set: { paymentStatus: 'failed' } },
        { returnDocument: 'after' }
      );
      if (!order) continue;
      if (await releaseOrderStock(order)) released++;
    }

    if (released > 0) {
      console.log(`Released stock for ${released} abandoned order(s)`);
    }
  } catch (error) {
    console.error('Error during abandoned order cleanup:', error);
  }
};

const startAbandonedOrderCleanupJob = () => {
  // Runs every 15 minutes
  cron.schedule('*/15 * * * *', releaseAbandonedOrders);
  console.log('Abandoned order cleanup job scheduled (every 15 min)');
};

module.exports = { startAbandonedOrderCleanupJob, releaseAbandonedOrders };
