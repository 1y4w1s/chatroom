/**
 * 表情包管理API
 * 支持上传、获取、删除、批量删除表情包
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/emojis');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 使用时间戳+随机数生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `emoji-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 JPG、PNG、GIF、WebP 格式的图片'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 上传表情包
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // 检查用户ID
    const userId = req.body.user_id || req.query.user_id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: '缺少用户ID' }
      });
    }

    // 检查文件
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: '请上传图片文件' }
      });
    }

    // 保存到数据库
    const result = await query(
      'INSERT INTO custom_emojis (user_id, file_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        req.file.originalname,
        `/uploads/emojis/${req.file.filename}`,
        req.file.size,
        req.file.mimetype
      ]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        user_id: userId,
        file_name: req.file.originalname,
        file_path: `/uploads/emojis/${req.file.filename}`,
        file_size: req.file.size,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('上传表情包失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '上传失败' }
    });
  }
});

// 获取用户的表情包列表
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: '缺少用户ID' }
      });
    }

    const emojis = await query(
      'SELECT id, user_id, file_name, file_path, file_size, mime_type, created_at FROM custom_emojis WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: emojis
    });
  } catch (error) {
    console.error('获取表情包失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取失败' }
    });
  }
});

// 删除单个表情包
router.delete('/:id', async (req, res) => {
  try {
    const emojiId = req.params.id;
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: '缺少用户ID' }
      });
    }

    // 查询表情包信息
    const emoji = await query(
      'SELECT * FROM custom_emojis WHERE id = ? AND user_id = ?',
      [emojiId, userId]
    );

    if (emoji.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '表情包不存在或无权删除' }
      });
    }

    // 删除文件
    const filePath = path.join(__dirname, '../..', emoji[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 删除数据库记录
    await query('DELETE FROM custom_emojis WHERE id = ?', [emojiId]);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除表情包失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除失败' }
    });
  }
});

// 批量删除表情包
router.post('/batch-delete', async (req, res) => {
  try {
    const { user_id, emoji_ids } = req.body;

    if (!user_id || !emoji_ids || !Array.isArray(emoji_ids)) {
      return res.status(400).json({
        success: false,
        error: { message: '参数错误' }
      });
    }

    // 查询要删除的表情包
    const placeholders = emoji_ids.map(() => '?').join(',');
    const emojis = await query(
      `SELECT * FROM custom_emojis WHERE id IN (${placeholders}) AND user_id = ?`,
      [...emoji_ids, user_id]
    );

    // 删除文件
    for (const emoji of emojis) {
      const filePath = path.join(__dirname, '../..', emoji.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 批量删除数据库记录
    await query(
      `DELETE FROM custom_emojis WHERE id IN (${placeholders}) AND user_id = ?`,
      [...emoji_ids, user_id]
    );

    res.json({
      success: true,
      message: '批量删除成功',
      deleted_count: emojis.length
    });
  } catch (error) {
    console.error('批量删除表情包失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '批量删除失败' }
    });
  }
});

module.exports = router;
