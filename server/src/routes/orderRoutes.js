const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order operations require authentication
router.use(protect);

// Customer endpoints
router.post('/', authorize('CUSTOMER'), createOrder);
router.get('/', authorize('CUSTOMER'), getCustomerOrders);

// Vendor endpoints
router.get('/vendor/orders', authorize('VENDOR'), getVendorOrders);
router.patch('/:id/status', authorize('VENDOR'), updateOrderStatus);

// Shared detail endpoint
router.get('/:id', getOrderById);

module.exports = router;
