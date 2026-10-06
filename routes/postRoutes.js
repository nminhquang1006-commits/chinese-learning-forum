const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

const authenticateApiKey = async (req, res, next) => {
  try {
    const { apiKey } = req.query;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu apiKey để thực hiện thao tác này.'
      });
    }

    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'apiKey không hợp lệ hoặc phiên đăng nhập đã hết hạn.'
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

router.post('/', authenticateApiKey, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'content bài post là bắt buộc.'
      });
    }

    const newPost = await Post.create({
      userId: req.currentUser._id,
      content: content.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo bài đăng chia sẻ kinh nghiệm tiếng Trung thành công!',
      data: newPost
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung cập nhật content là bắt buộc.'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài post với ID đã cung cấp.'
      });
    }

    if (post.userId.toString() !== req.currentUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bài post này.'
      });
    }

    post.content = content.trim();
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bài post thành công!',
      data: post
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'userName email').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;