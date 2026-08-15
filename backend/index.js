const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Route files
const authRoutes = require('./src/routes/auth');
const categoryRoutes = require('./src/routes/category');
const productRoutes = require('./src/routes/product');
const orderRoutes = require('./src/routes/order');
const paymentRoutes = require('./src/routes/payment');
const wishlistRoutes = require('./src/routes/wishlist');
const uploadRoutes = require('./src/routes/upload');
const adminRoutes = require('./src/routes/admin');

const app = express();

// Set security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        const allowedOrigins = [
          process.env.CLIENT_URL || 'http://localhost:3000',
          process.env.ADMIN_CLIENT_URL || 'http://localhost:3007'
        ];
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true
  })
);

// Cookie parser
app.use(cookieParser());

// Body parser (JSON parser with verify option to capture raw body for Razorpay webhooks)
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// URL Encoded parser
app.use(express.urlencoded({ extended: true }));

// Express 5 query getter compatibility workaround for express-mongo-sanitize
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true
  });
  next();
});

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Development logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/promo-banners', require('./src/routes/promoBanner'));
app.use('/api/coupons', require('./src/routes/coupon'));

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Naarzi Backend API'
  });
});

// 404 Route handler for unhandled API endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Mount error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
