const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Authentication Middleware
 * Validates JWT token from the Authorization header and attaches the user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token missing. Please log in to continue.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_masala_ghar_2025');

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach user (without password) to request object
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts endpoint to authorized roles ('CUSTOMER', 'VENDOR')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Access restricted. You do not have permission as a ${req.user ? req.user.role : 'Guest'}.`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
