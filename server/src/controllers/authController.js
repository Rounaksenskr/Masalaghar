const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Helper to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_masala_ghar_2025',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a new Customer or Vendor
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'CUSTOMER', phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, email, and password are required.',
      });
    }

    if (!['CUSTOMER', 'VENDOR'].includes(role.toUpperCase())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user role. Allowed roles are CUSTOMER or VENDOR.',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role.toUpperCase(),
        phone: phone || null,
        address: address || null,
      },
    });

    // Auto-create an empty cart for customers
    if (newUser.role === 'CUSTOMER') {
      try {
        await prisma.cart.create({
          data: { userId: newUser.id },
        });
      } catch (err) {
        // Cart might already exist or handled
      }
    }

    const token = generateToken(newUser.id, newUser.role);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      createdAt: newUser.createdAt,
    };

    return res.status(201).json({
      status: 'success',
      message: `${newUser.role === 'VENDOR' ? 'Vendor' : 'Customer'} account created successfully.`,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during registration.',
      details: error.message,
    });
  }
};

/**
 * @desc    Login existing user (Customer or Vendor)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials.',
      });
    }

    // Check if role matches if requiredRole is passed (e.g. logging in through vendor login portal)
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        status: 'error',
        message: `Account is registered as ${user.role}. Please use the ${user.role === 'VENDOR' ? 'Vendor' : 'Customer'} login portal.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user.id, user.role);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during login.',
      details: error.message,
    });
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    const { password, ...safeUser } = user;
    return res.status(200).json({
      status: 'success',
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
