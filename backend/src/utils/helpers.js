const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res, cookieName = 'token') => {
  const token = generateToken(user._id);

  // Default to 7 days
  const cookieExpireDays = 7;
  const cookieOptions = {
    expires: new Date(
      Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (https)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // none for cross-site cookie
  };

  // Ensure password is not in the user object
  const userResponse = user.toObject ? user.toObject() : { ...user };
  delete userResponse.password;

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
  sendTokenResponse
};
