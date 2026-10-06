const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect, authorize } = require('../middleware/auth');

// All cart actions require authenticated Customer
router.use(protect, authorize('CUSTOMER'));

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItemQuantity);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
