const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * protect — JWT Authentication Middleware
 *
 * Reads the `Authorization: Bearer <token>` header, verifies the JWT,
 * and attaches the decoded payload as `req.user` with resolved role.
 * Returns 401 if the token is missing, expired, or invalid.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Please sign in to use the Task Manager.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'utsav_myportfolio_super_secure_jwt_secret_2026';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e1) {
      // Fallback secret check for backward-compatible sessions
      const altSecret = 'utsav_portfolio_jwt_secret_key_2026';
      decoded = jwt.verify(token, altSecret);
    }

    req.user = decoded; // { id, email, googleId, name, role }

    // Client role override header if switched in UI
    const clientRole = req.headers['x-user-role'];
    if (clientRole === 'manager' || clientRole === 'employee') {
      req.user.role = clientRole;
    }

    if (!req.user.role) {
      if (mongoose.connection.readyState === 1 && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
        try {
          const dbUser = await User.findById(req.user.id).select('role name email');
          if (dbUser) {
            req.user.role = dbUser.role || 'manager';
            if (!req.user.name && dbUser.name) req.user.name = dbUser.name;
          } else {
            req.user.role = 'manager';
          }
        } catch {
          req.user.role = 'manager';
        }
      } else {
        req.user.role = 'manager';
      }
    }

    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please sign in again.'
        : 'Invalid authentication token.';
    return res.status(401).json({
      error: 'Unauthorized',
      message
    });
  }
};

module.exports = { protect };
