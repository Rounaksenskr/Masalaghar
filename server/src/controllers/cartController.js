const prisma = require('../config/db');

// Reusable Prisma include clause to populate items AND their related product
const cartInclude = {
  items: {
    include: {
      product: true,
    },
    orderBy: { createdAt: 'asc' },
  },
};

// Helper to calculate totals from cart items
const formatCartResponse = (cart) => {
  if (!cart) {
    return { items: [], itemCount: 0, subtotal: 0, totalDiscount: 0, total: 0 };
  }
  let subtotal = 0;
  let totalDiscount = 0;

  const items = (cart.items || []).map((item) => {
    const originalPrice = item.product ? item.product.price : 0;
    const discount = item.product && item.product.discount ? item.product.discount : 0;
    const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
    const itemTotal = finalPrice * item.quantity;
    const itemDiscount = (originalPrice - finalPrice) * item.quantity;

    subtotal += originalPrice * item.quantity;
    totalDiscount += itemDiscount;

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      unitPrice: originalPrice,
      effectivePrice: Math.round(finalPrice * 100) / 100,
      itemTotal: Math.round(itemTotal * 100) / 100,
    };
  });

  const total = Math.round((subtotal - totalDiscount) * 100) / 100;

  return {
    cartId: cart.id,
    userId: cart.userId,
    items,
    itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    total: Math.max(0, total),
  };
};

/**
 * @desc    Get current customer's cart
 * @route   GET /api/cart
 * @access  Private (Customer)
 */
const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: cartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
      cart.items = [];
    }

    return res.status(200).json({
      status: 'success',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    console.error('getCart error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve shopping cart.',
    });
  }
};

/**
 * @desc    Add product to cart (or increment quantity if already exists)
 * @route   POST /api/cart
 * @access  Private (Customer)
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required.',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product does not exist.',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Only ${product.stock} units available in stock.`,
      });
    }

    // Get or create customer cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: Number(productId),
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot add more. Reached maximum available stock of ${product.stock}.`,
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          quantity: Number(quantity),
        },
      });
    }

    // Return updated cart with product details included
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });

    return res.status(200).json({
      status: 'success',
      message: `${product.name} added to cart.`,
      cart: formatCartResponse(updatedCart),
    });
  } catch (error) {
    console.error('addToCart error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add product to cart.',
    });
  }
};

/**
 * @desc    Update quantity of a cart item
 * @route   PUT /api/cart/:itemId
 * @access  Private (Customer)
 */
const updateCartItemQuantity = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be at least 1. Use DELETE to remove the item.',
      });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found.',
      });
    }

    // Verify stock
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (product && product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Only ${product.stock} units are currently available.`,
      });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Number(quantity) },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: cartInclude,
    });

    return res.status(200).json({
      status: 'success',
      cart: formatCartResponse(updatedCart),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Could not update item quantity.',
    });
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private (Customer)
 */
const removeCartItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: cartInclude,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Item removed from cart.',
      cart: formatCartResponse(updatedCart),
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Could not remove item.',
    });
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private (Customer)
 */
const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully.',
      cart: { items: [], itemCount: 0, subtotal: 0, total: 0 },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart.',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
