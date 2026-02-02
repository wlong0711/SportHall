const jwt = require('jsonwebtoken');

// 生成短效 Access Token (15分钟) - 用于验证身份
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m', 
  });
};

// 生成长效 Refresh Token (7天) - 用于换取新的 Access Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };