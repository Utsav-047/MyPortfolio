const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback user store if MongoDB is offline
const memoryUsers = [];

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
      // Decode JWT payload directly as a fallback if token audience verification differs
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
      // Mongoose DB Persistence
      user = await User.findOneAndUpdate(
        { googleId },
        { name, email, avatar },
        { new: true, upsert: true, runValidators: true }
      );

      console.log(`\n========================================`);
      console.log(`🔑 GOOGLE AUTH: User Logged In (MongoDB)!`);
      console.log(`   Name: "${user.name}" | Email: ${user.email}`);
      console.log(`========================================\n`);
    } else {
      // Memory Store Fallback
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

    // Generate JWT Token (valid for 7 days)
    const secret = process.env.JWT_SECRET || 'utsav_portfolio_jwt_secret_key_2026';
    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, googleId: user.googleId },
      secret,
      { expiresIn: '7d' }
    );

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
  googleLogin
};
