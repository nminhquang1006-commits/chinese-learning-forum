require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chinese_forum_db';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', userRoutes);
app.use('/posts', postRoutes);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Đã kết nối thành công với MongoDB Local!');
    app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
  });