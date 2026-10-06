const prisma = require('../config/db');

/**
 * @desc    Get all products (with optional filtering by category, search, or vendor)
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, vendorId } = req.query;
    const where = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (vendorId) {
      where.vendorId = Number(vendorId);
    }

    if (search && search.trim() !== '') {
      where.name = { contains: search.trim() };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true, address: true } },
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve products.',
      details: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID format.',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, name: true, address: true, email: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      product,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error fetching product details.',
    });
  }
};

/**
 * @desc    Create a new product (Vendor only)
 * @route   POST /api/products
 * @access  Private (Vendor)
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, category, origin, unit, price, discount, stock, image } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, description, category, price, and stock are required fields.',
      });
    }

    // Default fallback image if none provided
    const productImage = image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80';

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        category,
        origin: origin || 'India',
        unit: unit || '250g',
        price: parseFloat(price),
        discount: discount !== undefined ? parseFloat(discount) : 0,
        stock: parseInt(stock, 10),
        image: productImage,
        vendorId: req.user.id,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product listed successfully.',
      product: newProduct,
    });
  } catch (error) {
    console.error('createProduct error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Could not create product.',
      details: error.message,
    });
  }
};

/**
 * @desc    Update a product (Vendor only, ownership checked)
 * @route   PUT /api/products/:id
 * @access  Private (Vendor)
 */
const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    // Security check: Vendor can only edit their own products
    if (existingProduct.vendorId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You can only edit your own products.',
      });
    }

    const { name, description, category, price, discount, stock, image } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(discount !== undefined && { discount: parseFloat(discount) }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(image && { image }),
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update product.',
      details: error.message,
    });
  }
};

/**
 * @desc    Delete a product (Vendor only, ownership checked)
 * @route   DELETE /api/products/:id
 * @access  Private (Vendor)
 */
const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    // Security check: Vendor can only delete their own products
    if (existingProduct.vendorId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You can only delete your own products.',
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete product.',
      details: error.message,
    });
  }
};

/**
 * @desc    Get products listed by the currently logged-in vendor
 * @route   GET /api/products/vendor/my-products
 * @access  Private (Vendor)
 */
const getMyVendorProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { vendorId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch vendor products.',
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyVendorProducts,
};
