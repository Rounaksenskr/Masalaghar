const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('CUSTOMER'));

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

module.exports = router;
