require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const dns = require('dns');

// Models
const Order = require('../models/Order');
const Notification = require('../models/Notification');

async function clearOrdersAndRevenue() {
  try {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_) {}

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Count existing orders
    const orderCount = await Order.countDocuments();
    console.log(`Found ${orderCount} existing order(s).`);

    // Delete all orders
    const orderResult = await Order.deleteMany({});
    console.log(`Successfully deleted ${orderResult.deletedCount} order(s).`);

    // Delete order-related notifications if any
    const notificationResult = await Notification.deleteMany({
      $or: [
        { type: { $in: ['NEW_ORDER', 'ORDER_CANCELLED', 'REFUND_REQUESTED'] } },
        { referenceModel: 'Order' }
      ]
    });
    console.log(`Successfully deleted ${notificationResult.deletedCount} order notification(s).`);

    console.log('\n--- SUMMARY ---');
    console.log(`Total Orders Deleted: ${orderResult.deletedCount}`);
    console.log(`Total Revenue Reset to: ₹0`);
    console.log('Orders and revenue cleared successfully!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing orders:', error.message);
    process.exit(1);
  }
}

clearOrdersAndRevenue();
