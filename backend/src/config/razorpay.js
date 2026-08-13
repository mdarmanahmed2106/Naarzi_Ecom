const Razorpay = require('razorpay');

const isMock = process.env.RAZORPAY_KEY_ID === 'rzp_test_mockkeyid123';

let razorpayInstance;

if (isMock) {
  console.warn('WARNING: Razorpay is running in MOCK mode. Payment order creation will be simulated.');
  // Create a mock instance with the same interface
  razorpayInstance = {
    orders: {
      create: async (options) => {
        return {
          id: `rzp_mock_order_${Math.random().toString(36).substring(2, 11)}`,
          entity: 'order',
          amount: options.amount,
          amount_paid: 0,
          amount_due: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
          status: 'created',
          attempts: 0,
          notes: options.notes,
          created_at: Math.floor(Date.now() / 1000)
        };
      }
    }
  };
} else {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

module.exports = {
  razorpayInstance,
  isMock,
};
