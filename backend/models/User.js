const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false, // 默认未验证
    },
    verificationToken: String, // 用于存储邮件里的验证码
    verificationTokenExpire: Date, // 验证码有效期
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  // 1. 如果密码没有被修改，直接 return 退出，不做任何事
  if (!this.isModified('password')) {
    return;
  }

  // 2. 只有密码被改了，才执行加密
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  // 1. 生成一个随机的 Token (原版)
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. 将 Token 哈希加密后存入数据库 (this.resetPasswordToken)
  // 这样数据库里存的是加密后的，更加安全
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. 设置过期时间 (10分钟)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // 4. 返回原版 Token (用于发邮件)
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);

