const cron = require('node-cron');
const Order = require('../models/Order');
const { releaseOrderStock } = require('../controllers/order');

const ABANDONED_THRESHOLD_MINUTES = 45; // adjust as needed

const releaseAbandonedOrders = async () => {
  const cutoff = new Date(Date.now() - ABANDONED_THRESHOLD_MINUTES * 60 * 1000);

  try {
    const abandonedOrders = await Order.find({
      paymentStatus: 'pending',
      createdAt: { $lt: cutoff }
    });

    if (abandonedOrders.length === 0) return;

    console.log(`Releasing stock for ${abandonedOrders.length} abandoned order(s)`);

    for (const order of abandonedOrders) {
      await releaseOrderStock(order);
      order.paymentStatus = 'failed'; 
      await order.save();
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
