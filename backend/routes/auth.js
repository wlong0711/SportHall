const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/verifyemail/:token', verifyEmail);
router.post('/resend-verification', resendVerification)
router.get('/me', auth, getMe);

module.exports = router;

