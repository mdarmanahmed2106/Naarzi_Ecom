const User = require('../models/User');
const { auth: firebaseAuth } = require('../config/firebaseAdmin');
const { sendTokenResponse } = require('../utils/helpers');

// @desc    Phone Auth (Firebase OTP)
// @route   POST /api/auth/phone
// @access  Public
exports.phoneAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Firebase ID token is required' });
    }

    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'No phone number found in token' });
    }

    let user = await User.findOne({ phone: phoneNumber });

    if (!user) {
      user = await User.create({
        phone: phoneNumber,
        name: 'New Customer',
        role: 'customer',
        profileComplete: false,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return res.status(401).json({ success: false, message: 'Invalid or expired verification. Please try again.' });
    }
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create user
    // role is never taken from client input - always defaults to 'customer'
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user (must explicitly select password since select: false)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Cookie name is derived from the user's REAL role, never from client-supplied input
    const cookieName = user.role === 'admin' ? 'admin_token' : 'token';
    sendTokenResponse(user, 200, res, cookieName);
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  try {
    const cookieName = req.body.source === 'admin' ? 'admin_token' : 'token';
    res.cookie(cookieName, 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.me = async (req, res, next) => {
  try {
    // req.user is already populated by requireAuth middleware
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete User Profile (Name + Email)
// @route   PUT /api/auth/complete-profile
// @access  Private
exports.completeProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'This email is already in use.' });
      }
      user.email = email;
    }

    user.profileComplete = Boolean(user.name && user.name !== 'New Customer' && user.email);
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
// @desc    Add a shipping address
// @route   POST /api/auth/me/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const user = req.user;
    
    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    } else if (req.body.isDefault) {
      // If setting this as default, unset others
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a shipping address
// @route   DELETE /api/auth/me/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = req.user;
    
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Only allow updating name and email
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    
    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
