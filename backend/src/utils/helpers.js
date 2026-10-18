const jwt = require('jsonwebtoken');

// `v` is the user's tokenVersion: requireAuth rejects a token whose version is out of date
const generateToken = (user) => {
  return jwt.sign({ id: user._id, v: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Shared by login and logout: a browser only replaces/clears a cookie set with matching
// attributes, so logout must use exactly these (Secure + SameSite=None in production).
const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true in production (https)
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // none for cross-site cookie
});

const sendTokenResponse = (user, statusCode, res, cookieName = 'token') => {
  const token = generateToken(user);

  // Default to 7 days
  const cookieExpireDays = 7;
  const cookieOptions = {
    ...authCookieOptions(),
    expires: new Date(
      Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
    )
  };

  // Ensure password is not in the user object
  const userResponse = user.toObject ? user.toObject() : { ...user };
  delete userResponse.password;
  delete userResponse.tokenVersion;

  res
    .status(statusCode)
    .cookie(cookieName, token, cookieOptions)
    .json({
      success: true,
      token,
      user: userResponse
    });
};

module.exports = {
  generateToken,
  authCookieOptions,
  sendTokenResponse
};
