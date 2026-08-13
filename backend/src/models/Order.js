const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function (val) {
        return val.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    phone: { type: String }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
