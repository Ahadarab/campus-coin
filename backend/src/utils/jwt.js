const jwt = require('jsonwebtoken');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET || 'campus_coin_super_secret_jwt_key_2026_production_grade',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'campus_coin_super_secret_jwt_key_2026_production_grade'
  );
};

module.exports = {
  signToken,
  verifyToken
};
