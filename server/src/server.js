const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Route handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security HTTP Headers (Helmet)
// Hardens headers against Clickjacking, MIME sniffing, and removes 'X-Powered-By: Express'
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Let React frontend load Unsplash / Razorpay assets smoothly
  })
);

// 2. Strict CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Request Payload Size Defense (Prevents large body buffer exhaustion / memory attacks)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 4. Rate Limiting (Abuse & Brute-Force Prevention)
// General API Limiter: 300 requests per 15 minutes per IP
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

// Strict Auth Limiter: Max 20 authentication attempts per 15 minutes (Blocks password dictionary attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts. For security reasons, please wait 15 minutes.',
  },
});

// Apply rate limiters
app.use('/api', generalApiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Masala Ghar API is up and running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    security: {
      headers: 'Protected with Helmet',
      rateLimiter: 'Active',
      cors: 'Whitelisted',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Root API overview
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Masala Ghar API',
    description: 'Clean Full-Stack Indian Spices & Organic Seeds Marketplace',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (POST /register, POST /login, GET /me)',
      products: '/api/products (GET /, GET /:id, POST /, PUT /:id, DELETE /:id)',
      cart: '/api/cart (GET /, POST /, PUT /:itemId, DELETE /:itemId, DELETE /)',
      orders: '/api/orders (POST /, GET /, GET /vendor/orders, PATCH /:id/status)',
      payment: '/api/payment (POST /create-order, POST /verify)',
      health: '/api/health',
    },
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// 5. Production-Safe Global Error Handler
// Prevents internal stack traces and database paths from leaking to client responses
app.use((err, req, res, next) => {
  console.error('[Masala Ghar Error]:', err.message || err);

  const statusCode = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 && !isDev ? 'An unexpected server error occurred.' : err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
});

// Server Initialization - only listen directly when run via node/nodemon
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌿 Masala Ghar API running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🛡️  Security Shield Active: Helmet + Rate Limiter + CORS Whitelist`);
  });
}

module.exports = app;
