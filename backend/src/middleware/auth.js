const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  let token;

  // Read token from httpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Fallback to Bearer token in headers (useful for testing API)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, no token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and attach to request (excluding password)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token invalid'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin role required'
    });
  }
};

module.exports = {
  requireAuth,
  requireAdmin
};
