const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdminOrigin } = require('../config/origins');

// Verifies a JWT and returns its user, or null if the user is gone or the token was revoked
// (its version no longer matches the user's tokenVersion, e.g. after logout). Tokens issued
// before versioning carry no `v` and count as version 0.
const userFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || (decoded.v || 0) !== (user.tokenVersion || 0)) return null;
  return user;
};

// Which credential a request is authenticated with. The Bearer token comes first: it is the one
// the calling app holds itself. Otherwise the cookie belonging to the calling app is used:
// admin_token only for requests from the admin site, token for everything else. Without that
// split, a device logged into the admin would browse the storefront as the admin account.
const tokenFromRequest = (req) => {
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer ')) {
    const bearer = authorization.split(' ')[1];
    if (bearer && bearer !== 'null' && bearer !== 'undefined') return bearer;
  }
  const cookies = req.cookies || {};
  return isAdminOrigin(req.headers.origin) ? cookies.admin_token : cookies.token;
};

const requireAuth = async (req, res, next) => {
  const token = tokenFromRequest(req);

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
  const token = tokenFromRequest(req);

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
  userFromToken,
  tokenFromRequest
};
