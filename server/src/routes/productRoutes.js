const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyVendorProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public catalog endpoints
router.get('/', getProducts);
router.get('/vendor/my-products', protect, authorize('VENDOR'), getMyVendorProducts);
router.get('/:id', getProductById);

// Vendor-protected CRUD endpoints
router.post('/', protect, authorize('VENDOR'), createProduct);
router.put('/:id', protect, authorize('VENDOR'), updateProduct);
router.delete('/:id', protect, authorize('VENDOR'), deleteProduct);

module.exports = router;
