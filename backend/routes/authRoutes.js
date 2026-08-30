const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register with Email & Password (bcrypt)
router.post('/register', registerUser);

// POST /api/auth/login - Login with Email & Password
router.post('/login', loginUser);

// GET /api/auth/me - Get current authenticated user profile (Protected)
router.get('/me', protect, getMe);

// POST /api/auth/google - Authenticate Google OAuth token
router.post('/google', googleLogin);

module.exports = router;

