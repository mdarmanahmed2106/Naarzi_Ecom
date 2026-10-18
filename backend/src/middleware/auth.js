const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies a JWT and returns its user, or null if the user is gone or the token was revoked
// (its version no longer matches the user's tokenVersion, e.g. after logout). Tokens issued
// before versioning carry no `v` and count as version 0.
const userFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || (decoded.v || 0) !== (user.tokenVersion || 0)) return null;
  return user;
};

const requireAuth = async (req, res, next) => {
  let token;

  // Read token from httpOnly cookie
  if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  } else if (req.cookies && req.cookies.token) {
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
    // Verify token, fetch user and attach to request (excluding password)
    const user = await userFromToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session has ended, please log in again'
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

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const user = await userFromToken(token);
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // ignore invalid token in optionalAuth
    }
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
  userFromToken
};
