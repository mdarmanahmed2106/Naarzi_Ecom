const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Fallback to Google / Cloudflare DNS if local DNS fails SRV lookup on Windows
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_) {}

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

