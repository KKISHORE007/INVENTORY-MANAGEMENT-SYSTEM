const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const setTokenCookie = (res, token) => {
  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.cookie('token', token, options);
};

module.exports = { generateToken, setTokenCookie };
