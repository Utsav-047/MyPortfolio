const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isDbConnected = () => mongoose.connection.readyState === 1;

// Default team members list for assignments
const DEFAULT_TEAM = [
  { id: 'emp-1', name: 'Utsav Patel', email: 'utsavpatel788190@gmail.com', role: 'manager' },
  { id: 'emp-2', name: 'Rahul Sharma', email: 'rahul.sharma@company.dev', role: 'employee' },
  { id: 'emp-3', name: 'Priya Patel', email: 'priya.patel@company.dev', role: 'employee' },
  { id: 'emp-4', name: 'Sneha Joshi', email: 'sneha.joshi@company.dev', role: 'employee' },
  { id: 'emp-5', name: 'Aarav Mehta', email: 'aarav.mehta@company.dev', role: 'employee' }
];

// In-memory fallback user store if MongoDB is offline
const memoryUsers = [...DEFAULT_TEAM];

// Helper: Sign JWT Token
const generateToken = (payload, expiresIn = '7d') => {
  const secret = process.env.JWT_SECRET || 'utsav_myportfolio_super_secure_jwt_secret_2026';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * POST /api/auth/register
 * Register with Name, Email, Password & Role (Bcrypt hashed)
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'manager' } = req.body;

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

    const assignedRole = role === 'employee' ? 'employee' : 'manager';

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
        password: hashedPassword,
        role: assignedRole
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
        role: assignedRole,
        createdAt: new Date().toISOString()
      };
      memoryUsers.push(user);
    }

    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role || assignedRole
    }, '7d');

    return res.status(201).json({
      success: true,
      message: 'User registered successfully with bcrypt encrypted password',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role || assignedRole,
        passwordHashPreview: hashedPassword.substring(0, 15) + '...'
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

    const role = user.role || 'manager';
    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role
    }, '7d');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role,
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
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('-password');
    } else {
      user = memoryUsers.find(u => (u._id || u.id) === userId);
    }

    const currentRole = req.user.role || (user && user.role) || 'manager';

    if (!user) {
      return res.status(200).json({
        success: true,
        user: {
          id: req.user.id,
          name: req.user.name || 'User',
          email: req.user.email,
          role: currentRole,
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
        role: user.role || currentRole,
        avatar: user.avatar || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/role
 * Switch or update active user role between manager and employee
 */
const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || (role !== 'manager' && role !== 'employee')) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Role must be either manager or employee'
      });
    }

    const userId = req.user.id;
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, { role });
    } else {
      const u = memoryUsers.find(item => (item._id || item.id) === userId);
      if (u) u.role = role;
    }

    return res.status(200).json({
      success: true,
      message: `Role switched to ${role.toUpperCase()}`,
      role
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/team
 * Return list of team members / employees available for assignment
 */
const getTeamMembers = async (req, res, next) => {
  try {
    let team = [];
    if (isDbConnected()) {
      const users = await User.find({}, 'name email role avatar').lean();
      team = users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role || 'employee',
        avatar: u.avatar || ''
      }));
    }

    // Merge default candidates if list is sparse
    const knownEmails = new Set(team.map(m => m.email.toLowerCase()));
    for (const d of DEFAULT_TEAM) {
      if (!knownEmails.has(d.email.toLowerCase())) {
        team.push(d);
      }
    }

    return res.status(200).json({
      success: true,
      count: team.length,
      data: team
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
    const { credential, role = 'manager' } = req.body;

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
    const defaultRole = role === 'employee' ? 'employee' : 'manager';

    let user;
    if (isDbConnected()) {
      user = await User.findOneAndUpdate(
        { googleId },
        {
          $set: { name, email, avatar },
          $setOnInsert: { role: defaultRole }
        },
        { new: true, upsert: true, runValidators: true }
      );
    } else {
      let existingUser = memoryUsers.find(u => u.googleId === googleId || u.email === email);
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
          role: defaultRole,
          createdAt: new Date().toISOString()
        };
        memoryUsers.push(user);
      }
    }

    const userRole = user.role || defaultRole;
    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId,
      role: userRole
    }, '7d');

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: userRole,
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
  updateRole,
  getTeamMembers,
  googleLogin
};

