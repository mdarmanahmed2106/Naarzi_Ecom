const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login or signup attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
};
