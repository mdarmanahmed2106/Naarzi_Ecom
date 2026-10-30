const crypto = require('crypto');
const User = require('../models/User');
const EmailOtp = require('../models/EmailOtp');
const { sendLoginCodeEmail } = require('../utils/email');
const { auth: firebaseAuth } = require('../config/firebaseAdmin');
const { sendTokenResponse, authCookieOptions } = require('../utils/helpers');
const { userFromToken } = require('../middleware/auth');

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

// Email-code and Google sign-in are for customers. An admin account found this way is refused,
// so the admin panel stays behind its own password login.
const ADMIN_REFUSED = 'This account signs in through the admin panel.';

// Finds the customer with this (proven) email, or creates one
const findOrCreateEmailCustomer = async (email, name) => {
  let user = await User.findOne({ email });
  if (user) {
    if (!user.emailVerified || (name && user.name === 'New Customer')) {
      user.emailVerified = true;
      if (name && user.name === 'New Customer') {
        user.name = name;
        user.profileComplete = true;
      }
      await user.save();
    }
    return user;
  }
  return User.create({
    email,
    emailVerified: true,
    name: name || 'New Customer',
    role: 'customer',
    profileComplete: Boolean(name),
  });
};

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_AFTER_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;
const hashCode = (email, code) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET || 'naarzi').update(`${email}:${code}`).digest('hex');

// @desc    Email a 6-digit login code
// @route   POST /api/auth/email/send
// @access  Public
exports.sendEmailCode = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const existing = await User.findOne({ email }).select('role');
    if (existing?.role === 'admin') {
      return res.status(403).json({ success: false, message: ADMIN_REFUSED });
    }

    const live = await EmailOtp.findOne({ email });
    if (live && Date.now() - live.sentAt.getTime() < RESEND_AFTER_MS) {
      return res.status(429).json({ success: false, message: 'A code was just sent. Please wait a few seconds before asking for another.' });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await EmailOtp.findOneAndUpdate(
      { email },
      { codeHash: hashCode(email, code), attempts: 0, sentAt: new Date(), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
      { upsert: true }
    );

    try {
      await sendLoginCodeEmail(email, code);
    } catch (err) {
      console.error('Login code email failed:', err.message);
      await EmailOtp.deleteOne({ email });
      return res.status(502).json({ success: false, message: 'We could not send the code right now. Please try again in a moment.' });
    }

    res.status(200).json({ success: true, message: 'Code sent.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign in with the emailed code
// @route   POST /api/auth/email/verify
// @access  Public
exports.verifyEmailCode = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const code = String(req.body.code).trim();
    const invalid = () => res.status(401).json({ success: false, message: 'That code is wrong or has expired. Please try again.' });

    const otp = await EmailOtp.findOne({ email });
    if (!otp || otp.expiresAt < new Date() || otp.attempts >= MAX_ATTEMPTS) return invalid();

    const expected = Buffer.from(otp.codeHash, 'hex');
    const given = Buffer.from(hashCode(email, code), 'hex');
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
      await EmailOtp.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
      return invalid();
    }
    await EmailOtp.deleteOne({ _id: otp._id }); // single use

    const existing = await User.findOne({ email }).select('role');
    if (existing?.role === 'admin') {
      return res.status(403).json({ success: false, message: ADMIN_REFUSED });
    }

    const user = await findOrCreateEmailCustomer(email);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Sign in with Google (Firebase ID token)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google sign-in token is required' });
    }

    const decoded = await firebaseAuth.verifyIdToken(idToken);
    if (decoded.firebase?.sign_in_provider !== 'google.com' || !decoded.email || !decoded.email_verified) {
      return res.status(401).json({ success: false, message: 'Google sign-in could not be verified. Please try again.' });
    }

    const email = decoded.email.toLowerCase();
    const existing = await User.findOne({ email }).select('role');
    if (existing?.role === 'admin') {
      return res.status(403).json({ success: false, message: ADMIN_REFUSED });
    }

    const user = await findOrCreateEmailCustomer(email, (decoded.name || '').trim() || undefined);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return res.status(401).json({ success: false, message: 'Google sign-in expired. Please try again.' });
    }
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    // phone is deliberately not accepted here: a phone number is only ever attached from a
    // verified Firebase OTP token (phoneAuth). Taking it unverified would let someone sign up
    // with a victim's number, and the victim's later OTP login would land in their account.
    const { name, email, password } = req.body;

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
      password
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

    // Revoke the session server-side: bumping tokenVersion invalidates every token this user
    // holds (cookie or the Bearer copy kept in localStorage), so a copied token stops working too.
    const bearer = req.headers.authorization && req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null;
    const token = req.cookies[cookieName] || bearer;
    if (token) {
      try {
        const user = await userFromToken(token);
        if (user) await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });
      } catch {
        // invalid or expired token: nothing to revoke
      }
    }

    // Clear with the same attributes the cookie was set with, or production browsers keep it
    res.clearCookie(cookieName, authCookieOptions());

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

    // profileComplete now reflects "do we at least have a real name" : 
    // email is tracked separately via hasEmail, not folded into this flag
    user.profileComplete = Boolean(user.name && user.name !== 'New Customer');
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

// @desc    Update a shipping address
// @route   PUT /api/auth/me/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const user = req.user;
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const { street, city, state, postalCode, country, phone, isDefault } = req.body;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (phone !== undefined) address.phone = phone;

    if (isDefault) {
      // Unset default on every other address, set it on this one
      user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === address._id.toString();
      });
    }

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
