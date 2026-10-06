const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId là bắt buộc'],
  },
  content: {
    type: String,
    required: [true, 'content là bắt buộc'],
    trim: true,
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);