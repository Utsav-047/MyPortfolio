const jwt = require('jsonwebtoken');

/**
 * protect — JWT Authentication Middleware
 *
 * Reads the `Authorization: Bearer <token>` header, verifies the JWT,
 * and attaches the decoded payload as `req.user`.
 * Returns 401 if the token is missing, expired, or invalid.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Please sign in with Google to use the Task Manager.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'utsav_portfolio_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { id, email, googleId }
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
