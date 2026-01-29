const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); 
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword, 
  resetPassword,
  validateResetToken
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 限制每个 IP 只能尝试 5 次
  message: {
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true, // 返回 RateLimit-* 头信息
  legacyHeaders: false,
}); 

const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

router.post('/register', registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);
router.get('/verifyemail/:token', verifyEmail);
router.post('/resend-verification', resendVerification)
router.post('/forgotpassword', forgotPassword);
router.get('/resetpassword/:resettoken', validateResetToken);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', auth, getMe);

module.exports = router;

