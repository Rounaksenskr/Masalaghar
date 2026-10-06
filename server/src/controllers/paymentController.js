const crypto = require('crypto');
const Razorpay = require('razorpay');
const prisma = require('../config/db');

// Initialize Razorpay instance if keys are configured
let razorpayInstance = null;
const hasRazorpayKeys =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id' &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_secret';

if (hasRazorpayKeys) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * @desc    Initiate Razorpay order (or development mock order)
 * @route   POST /api/payment/create-order
 * @access  Private (Customer)
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID is required to initialize payment.',
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.',
      });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized payment attempt for this order.',
      });
    }

    const amountInPaise = Math.round(order.totalAmount * 100);

    // If real Razorpay keys are provided, create official Razorpay order
    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_order_${order.id}`,
        notes: {
          orderId: order.id.toString(),
          customerEmail: req.user.email,
        },
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      // Update payment record
      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          razorpayOrderId: razorpayOrder.id,
        },
      });

      return res.status(200).json({
        status: 'success',
        isMock: false,
        key: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order.id,
      });
    }

    // DEVELOPMENT / DEMO MOCK PAYMENT MODE
    // Used when interviewer or developer tests without active Razorpay KYC credentials
    const mockRazorpayOrderId = `order_mock_${order.id}_${Date.now()}`;

    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        razorpayOrderId: mockRazorpayOrderId,
      },
    });

    return res.status(200).json({
      status: 'success',
      isMock: true,
      message: 'Masala Ghar Development Payment Mode active (simulating Razorpay test sandbox)',
      key: 'rzp_test_mock_developer_key',
      razorpayOrderId: mockRazorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      orderId: order.id,
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to initialize payment gateway order.',
      details: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature & confirm order
 * @route   POST /api/payment/verify
 * @access  Private (Customer)
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.',
      });
    }

    // Handle Development Mock Payment Verification
    if (isMock || !hasRazorpayKeys) {
      const generatedMockPaymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;

      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          razorpayOrderId: razorpay_order_id || `order_mock_${order.id}`,
          razorpayPaymentId: generatedMockPaymentId,
          razorpaySignature: 'mock_verified_signature',
          status: 'SUCCESS',
        },
      });

      const confirmedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
        include: { items: true, payment: true },
      });

      return res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully! Your spice order is confirmed.',
        order: confirmedOrder,
      });
    }

    // Official Razorpay HMAC SHA256 Signature Verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      await prisma.payment.update({
        where: { orderId: order.id },
        data: {
          status: 'FAILED',
        },
      });

      return res.status(400).json({
        status: 'error',
        message: 'Payment verification failed: Invalid Razorpay cryptographic signature.',
      });
    }

    // Payment signature verified successfully
    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'SUCCESS',
      },
    });

    const confirmedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' },
      include: { items: true, payment: true },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment successfully captured and verified via Razorpay.',
      order: confirmedOrder,
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while verifying payment.',
      details: error.message,
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
