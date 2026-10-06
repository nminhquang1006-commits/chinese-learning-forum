const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'userName là bắt buộc'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'password là bắt buộc'],
  },
  apiKey: {
    type: String,
    default: null,
  }
});

module.exports = mongoose.model('User', userSchema);