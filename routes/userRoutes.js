const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ userName, email và password.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được sử dụng trên hệ thống.'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản học tiếng Trung thành công!',
      data: {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và password.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    const randomstring = crypto.randomBytes(8).toString('hex');
    const apiKey = `mern-$${user._id}$-$${user.email}$-$${randomstring}$`;

    user.apiKey = apiKey;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      apiKey,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;