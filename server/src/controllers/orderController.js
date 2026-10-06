const prisma = require('../config/db');

/**
 * @desc    Create a new order from current customer cart
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const createOrder = async (req, res) => {
  try {
    const { deliveryAddress, customerPhone } = req.body;

    if (!deliveryAddress || deliveryAddress.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Delivery address is required for checkout.',
      });
    }

    // Retrieve customer cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: true },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Your cart is empty. Please add products before checking out.',
      });
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(400).json({
          status: 'error',
          message: `Product with ID ${item.productId} was not found.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      const discount = product.discount || 0;
      const unitPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
      const itemSubtotal = unitPrice * item.quantity;
      totalAmount += itemSubtotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: Math.round(unitPrice * 100) / 100,
        vendorId: product.vendorId,
      });

      // Decrement stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity },
      });
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    // Create Order with its OrderItems and initial Payment record
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        status: 'PENDING',
        deliveryAddress,
        customerPhone: customerPhone || req.user.phone || null,
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            amount: totalAmount,
            status: 'PENDING',
            method: 'RAZORPAY',
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    // Clear the customer's cart after successful order creation
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Order created successfully. Please proceed with payment.',
      order,
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create order.',
      details: error.message,
    });
  }
};

/**
 * @desc    Get all orders for currently logged in customer
 * @route   GET /api/orders
 * @access  Private (Customer)
 */
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Could not fetch your orders.',
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Customer & Vendor)
 */
const getOrderById = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.',
      });
    }

    // Role check: customer must own it, vendor must have an item in it
    if (req.user.role === 'CUSTOMER' && order.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this order.',
      });
    }

    if (req.user.role === 'VENDOR') {
      const hasVendorItem = order.items.some((item) => item.vendorId === req.user.id);
      if (!hasVendorItem) {
        return res.status(403).json({
          status: 'error',
          message: 'This order does not contain products from your catalog.',
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to load order.',
    });
  }
};

/**
 * @desc    Get all orders containing products by currently logged-in vendor
 * @route   GET /api/orders/vendor/orders
 * @access  Private (Vendor)
 */
const getVendorOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            vendorId: req.user.id,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter order items to only those belonging to this specific vendor for privacy
    const filteredOrders = orders.map((order) => ({
      ...order,
      vendorItems: order.items.filter((item) => item.vendorId === req.user.id),
      vendorTotal: order.items
        .filter((item) => item.vendorId === req.user.id)
        .reduce((sum, item) => sum + item.price * item.quantity, 0),
    }));

    return res.status(200).json({
      status: 'success',
      count: filteredOrders.length,
      orders: filteredOrders,
    });
  } catch (error) {
    console.error('getVendorOrders error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve vendor orders.',
    });
  }
};

/**
 * @desc    Update order status (Vendor only)
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Vendor)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.',
      });
    }

    // Verify vendor has products in this order
    const hasVendorProduct = order.items.some((item) => item.vendorId === req.user.id);
    if (!hasVendorProduct) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update status for orders containing your products.',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true, payment: true },
    });

    return res.status(200).json({
      status: 'success',
      message: `Order status updated to ${status}.`,
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update order status.',
    });
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getVendorOrders,
  updateOrderStatus,
};
