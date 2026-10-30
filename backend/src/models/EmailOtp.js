const mongoose = require('mongoose');

// A 6-digit login code sent by email. One live code per address; only its hash is stored, and
// MongoDB deletes the document by itself once it expires.
const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  codeHash: {
    type: String,
    required: true
  },
  // Wrong guesses against this code; it stops working after MAX_ATTEMPTS
  attempts: {
    type: Number,
    default: 0
  },
  // When the code was sent, to space out resends
  sentAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
});

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
