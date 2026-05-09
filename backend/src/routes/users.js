/**
 * 用户路由
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 简单认证中间件 - 从请求参数获取 userId
const authMiddleware = async (req, res, next) => {
  const userId = req.query.userId || req.body.userId;
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: '缺少用户 ID' }
    });
  }
  req.user = { id: parseInt(userId) };
  next();
};

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// ==================== 路由 ====================

/**
 * GET /api/users/me
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = await query(
      `SELECT id, username, email, nickname, avatar, signature, status, created_at, last_login_at
       FROM users
       WHERE id = ?`,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '用户不存在' }
      });
    }
    
    res.json({
      success: true,
      data: { user: users[0] }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取用户信息失败' }
    });
  }
});

/**
 * PUT /api/users/me
 * 更新用户信息
 */
router.put('/me', authMiddleware, [
  body('nickname').optional().isLength({ min: 1, max: 50 }).withMessage('昵称 1-50 个字符'),
  body('signature').optional().isLength({ max: 200 }).withMessage('签名最多 200 字符')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { nickname, signature } = req.body;
    
    await query(
      `UPDATE users SET nickname = ?, signature = ? WHERE id = ?`,
      [nickname, signature, req.user.id]
    );
    
    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '更新失败' }
    });
  }
});

/**
 * POST /api/users/avatar
 * 上传头像
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: '请上传文件' }
      });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    await query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, req.user.id]
    );
    
    // 广播头像更新事件
    const { getIo } = require('../server');
    const io = getIo();
    if (io) {
      io.emit('user_avatar_updated', {
        userId: req.user.id,
        avatar: avatarUrl
      });
    }
    
    res.json({
      success: true,
      data: { avatar: avatarUrl }
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '上传失败' }
    });
  }
});

/**
 * GET /api/users/:id
 * 获取其他用户信息
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const users = await query(
      `SELECT id, username, nickname, avatar, signature, status
       FROM users
       WHERE id = ?`,
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '用户不存在' }
      });
    }
    
    res.json({
      success: true,
      data: { user: users[0] }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取用户信息失败' }
    });
  }
});

/**
 * GET /api/users/search
 * 搜索用户
 */
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { message: '请输入搜索关键词' }
      });
    }
    
    const users = await query(
      `SELECT id, username, nickname, avatar, signature
       FROM users
       WHERE username LIKE ? OR nickname LIKE ?
       LIMIT ?`,
      [`%${q}%`, `%${q}%`, parseInt(limit)]
    );
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '搜索失败' }
    });
  }
});

module.exports = router;
