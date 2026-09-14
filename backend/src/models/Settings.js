const mongoose = require('mongoose');

// Singleton document — always fetched/updated as the one row in this collection.
const settingsSchema = new mongoose.Schema({
  freeShippingThreshold: {
    type: Number,
    default: 0,
    min: [0, 'Free shipping threshold cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  }
}, {
  timestamps: true
});

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
