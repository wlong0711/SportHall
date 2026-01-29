const crypto = require('crypto'); // 引入 crypto 生成 token
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail'); // 引入刚才写的工具

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 如果有错误，返回 400 和具体错误信息
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

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
      // 验证失败时的简单 HTML 提示
      return res.status(400).send(`
        <html>
          <body style="text-align: center; padding-top: 50px; font-family: sans-serif;">
            <h1 style="color: red;">Verification Failed</h1>
            <p>The link is invalid or has expired.</p>
          </body>
        </html>
      `);
    }

    // 验证成功，更新状态
    user.isVerified = true;
    user.verificationToken = undefined; // 清除 token
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).send(`
      <html>
        <body style="text-align: center; padding-top: 50px; font-family: sans-serif;">
          <h1 style="color: green;">Email Verified Successfully!</h1>
          <p>Thank you, ${user.name}. Your account has been verified.</p>
          <p>You can now close this window or log in to your account.</p>
          
          <a href="http://localhost:3000/login" style="
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;">
            Go to Login
          </a>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send('Server Error');
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });

    // 为了安全起见，即使用户不存在，我们通常也不直接告诉前端“查无此人”，
    // 但为了开发方便，这里先明确返回 User not found。
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please login.' });
    }

    // 1. 生成新的验证 Token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // 2. 更新用户数据
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 重置为24小时有效

    await user.save();

    // 3. 发送邮件 (逻辑和 Register 里的一样)
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;
    // 如果是前后端分离，记得用前端的 URL，例如:
    // const verifyUrl = `http://localhost:3000/verify/${verificationToken}`;

    const message = `Please click the link below to verify your email:\n\n${verifyUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SportHall - Email Verification (Resend)',
        message,
      });

      res.status(200).json({
        success: true,
        message: `Verification email resent to ${user.email}.`
      });
    } catch (emailError) {
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. 获取重置 Token (调用刚才在 Model 里写的方法)
    const resetToken = user.getResetPasswordToken();

    // 2. 保存到数据库 (注意：我们要关掉 validation，否则可能会报错说缺少 password 等)
    await user.save({ validateBeforeSave: false });

    // 3. 构造重置链接 (指向前端页面)
    // 假设前端路由是 /resetpassword/:resetToken
    // const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    // 如果是前后端分离，通常是前端地址:
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SportHall - Password Reset Token',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      // 发送失败，清除字段
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if reset token is valid (Get request)
// @route   GET /api/auth/resetpassword/:resettoken
// @access  Public
exports.validateResetToken = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    res.status(200).json({ success: true, message: 'Token is valid' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // 1. 获取 URL 里的 token，并进行同样的哈希加密 (因为数据库里存的是哈希过的)
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // 2. 查找用户：Token 匹配 且 没有过期
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // 3. 设置新密码
    user.password = req.body.password;
    
    // 4. 清除重置字段
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // 5. 保存 (中间件会自动加密新密码)
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully! Please login with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

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

