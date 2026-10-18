const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { isAllowedOrigin } = require('./src/config/origins');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const { startAbandonedOrderCleanupJob } = require('./src/jobs/releaseAbandonedStock');
startAbandonedOrderCleanupJob();

// Route files
const authRoutes = require('./src/routes/auth');
const categoryRoutes = require('./src/routes/category');
const productRoutes = require('./src/routes/product');
const orderRoutes = require('./src/routes/order');
const paymentRoutes = require('./src/routes/payment');
const wishlistRoutes = require('./src/routes/wishlist');
const uploadRoutes = require('./src/routes/upload');
const adminRoutes = require('./src/routes/admin');
const notificationRoutes = require('./src/routes/notification');

const app = express();

// Render (and most hosts) sit one proxy in front of the app. Trusting that single hop makes
// req.ip the visitor's real IP instead of the proxy's, so rate limits apply per visitor rather
// than to everyone at once (which let one person lock all customers out of login).
app.set('trust proxy', 1);

// Set security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        const err = new Error('Not allowed by CORS');
        err.statusCode = 403;
        callback(err);
      }
    },
    credentials: true
  })
);

// Cookie parser
app.use(cookieParser());

// CSRF protection. The login cookie is SameSite=None (the shop and API are on different sites),
// so the browser attaches it even to requests another website triggers. Any state-changing
// request that carries a login cookie must therefore come from one of our own origins, judged
// by the Origin header (or Referer when a browser leaves Origin out). Requests without a login
// cookie (Razorpay webhooks, Bearer-token calls) are not at risk and pass through.
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const requestOrigin = (req) => {
  if (req.headers.origin) return req.headers.origin;
  try {
    return req.headers.referer ? new URL(req.headers.referer).origin : null;
  } catch {
    return null;
  }
};
app.use((req, res, next) => {
  const hasAuthCookie = req.cookies && (req.cookies.token || req.cookies.admin_token);
  if (SAFE_METHODS.includes(req.method) || !hasAuthCookie) return next();
  const origin = requestOrigin(req);
  if (origin && isAllowedOrigin(origin)) return next();
  return res.status(403).json({ success: false, message: 'Request blocked: unrecognised origin' });
});

// Body parser (JSON parser with verify option to capture raw body for Razorpay webhooks)
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

// No urlencoded parser: both apps send JSON (and multipart for uploads). Form-encoded bodies are
// what a plain cross-site <form> posts, so the API doesn't accept them at all.
// Express 5 leaves req.body undefined when no parser ran (no body, or a type we don't parse);
// default it so handlers and validation answer with a clean 4xx instead of crashing with a 500.
app.use((req, res, next) => {
  if (req.body === undefined) req.body = {};
  next();
});

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
// General per-visitor rate limit for the whole API (auth routes add a stricter one on top)
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promo-banners', require('./src/routes/promoBanner'));
app.use('/api/coupons', require('./src/routes/coupon'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/settings', require('./src/routes/settings'));

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
