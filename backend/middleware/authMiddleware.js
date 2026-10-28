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
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server Error', message: 'JWT_SECRET is not configured.' });
    }
    const decoded = jwt.verify(token, secret);
    // Attach decoded user and ensure role is present (support active role switcher header)
    const headerRole = req.headers['x-user-role'];
    decoded.role = (headerRole === 'manager' || headerRole === 'employee') ? headerRole : (decoded.role || 'manager');
    req.user = decoded; // { id, email, googleId, role, name }
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
