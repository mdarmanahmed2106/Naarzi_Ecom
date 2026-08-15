const mongoose = require('mongoose');

const promoBannerSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Banner message is required'],
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PromoBanner', promoBannerSchema);
