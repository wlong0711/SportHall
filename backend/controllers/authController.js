const crypto = require('crypto'); // 引入 crypto 生成 token
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail'); // 引入刚才写的工具

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. 生成随机验证 Token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    
    // 2. 创建用户 (注意：不要直接发 JWT token 了)
    const user = await User.create({
      name,
      email,
      password,
      verificationToken, // 保存 token 到数据库
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24小时有效
    });

    // 3. 构造验证链接 (假设前端运行在 localhost:3000)
    // 这里的链接指向前端页面，前端页面加载时会自动调用后端 verify 接口
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;
    // 或者如果是前后端分离，通常发给前端路由：
    // const verifyUrl = `http://localhost:3000/verify/${verificationToken}`;

    const message = `Please click the link below to verify your email:\n\n${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SportHall - Email Verification',
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}. Please check your email to verify account.`
      });
    } catch (emailError) {
      // 如果邮件发送失败，为了避免死数据，可以把刚创建的用户删掉
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const verificationToken = req.params.token;

    // 查找拥有该 token 且未过期的用户
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // 验证成功，更新状态
    user.isVerified = true;
    user.verificationToken = undefined; // 清除 token
    user.verificationTokenExpire = undefined;
    await user.save();

    // 这里可以直接返回 token 让用户自动登录，或者让用户重新登录
    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      token: generateToken(user._id) // 可选：直接登录
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // --- 新增：检查是否已验证 ---
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email first' });
      }
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

