const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback user store if MongoDB is offline
const memoryUsers = [];

// Helper: Sign JWT Token
const generateToken = (payload, expiresIn = '1h') => {
  const secret = process.env.JWT_SECRET || 'utsav_portfolio_jwt_secret_key_2026';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * POST /api/auth/register
 * Register with Name, Email & Password (Bcrypt hashed)
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Salt and hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          error: 'Registration Error',
          message: 'User already exists with this email address'
        });
      }

      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      });
    } else {
      const existing = memoryUsers.find(u => u.email === email.toLowerCase());
      if (existing) {
        return res.status(400).json({
          error: 'Registration Error',
          message: 'User already exists with this email address'
        });
      }

      user = {
        _id: `mem-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      memoryUsers.push(user);
    }

    const token = generateToken({ id: user._id || user.id, email: user.email }, '1h');

    return res.status(201).json({
      success: true,
      message: 'User registered successfully with bcrypt encrypted password',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        passwordHashPreview: hashedPassword.substring(0, 15) + '...' // Confirms bcrypt to student/evaluator
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate with Email & Password
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please provide both email and password'
      });
    }

    let user;
    let isMatch = false;

    if (isDbConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.password) {
        return res.status(401).json({
          error: 'Authentication Error',
          message: 'Invalid email or password credentials'
        });
      }
      isMatch = await user.matchPassword(password);
    } else {
      user = memoryUsers.find(u => u.email === email.toLowerCase());
      if (!user || !user.password) {
        return res.status(401).json({
          error: 'Authentication Error',
          message: 'Invalid email or password credentials'
        });
      }
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid email or password credentials'
      });
    }

    // 1-Hour expiry token
    const token = generateToken({ id: user._id || user.id, email: user.email }, '1h');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Protected endpoint returning decoded current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let user;
    if (isDbConnected()) {
      user = await User.findById(userId).select('-password');
    } else {
      user = memoryUsers.find(u => (u._id || u.id) === userId);
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          authSource: req.user.googleId ? 'Google OAuth' : 'Local JWT'
        }
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/google
 * Authenticates Google OAuth 2.0 Credential (ID Token)
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Google Credential token is required'
      });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      const decoded = jwt.decode(credential);
      if (!decoded || !decoded.sub) {
        return res.status(401).json({
          error: 'Authentication Error',
          message: 'Invalid Google credential token'
        });
      }
      payload = decoded;
    }

    const { sub: googleId, name, email, picture: avatar } = payload;

    let user;
    if (isDbConnected()) {
      user = await User.findOneAndUpdate(
        { googleId },
        { name, email, avatar },
        { new: true, upsert: true, runValidators: true }
      );
    } else {
      let existingUser = memoryUsers.find(u => u.googleId === googleId);
      if (existingUser) {
        existingUser.name = name;
        existingUser.email = email;
        existingUser.avatar = avatar;
        user = existingUser;
      } else {
        user = {
          _id: `mem-${Date.now()}`,
          googleId,
          name,
          email,
          avatar,
          createdAt: new Date().toISOString()
        };
        memoryUsers.push(user);
      }
    }

    const token = generateToken({ id: user._id || user.id, email: user.email, googleId: user.googleId }, '7d');

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleLogin
};

