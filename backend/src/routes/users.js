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
const bcrypt = require('bcrypt');
const { authenticate } = require('../middleware/auth');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    console.log('头像上传目录:', uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('创建上传目录:', uploadDir);
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
 * 获取当前用户信息（从 Token 获取）
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    // 直接从 req.user 获取用户信息（已由中间件验证）
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
 * 更新用户信息（从 Token 获取用户 ID）
 */
router.put('/me', authenticate, [
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
    const userId = req.user.id;
    
    await query(
      `UPDATE users SET nickname = ?, signature = ? WHERE id = ?`,
      [nickname, signature, userId]
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
 * 上传头像（从 Token 获取用户 ID）
 */
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    console.log('=== 头像上传请求 ===');
    console.log('用户:', req.user.id);
    console.log('文件:', req.file);
    
    if (!req.file) {
      console.error('上传失败：没有文件');
      return res.status(400).json({
        success: false,
        error: { message: '请上传文件' }
      });
    }
    
    const userId = req.user.id;
    
    // 检查文件是否实际保存成功
    const fullFilePath = path.join(__dirname, '../../uploads/avatars', req.file.filename);
    if (!fs.existsSync(fullFilePath)) {
      console.error('上传失败：文件未保存到服务器', fullFilePath);
      return res.status(500).json({
        success: false,
        error: { message: '文件保存失败' }
      });
    }
    console.log('文件已保存:', fullFilePath);
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    console.log('头像URL:', avatarUrl);
    
    await query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, userId]
    );
    console.log('用户头像已更新，用户ID:', userId);
    
    const { getIo } = require('../server');
    const io = getIo();
    if (io) {
      io.emit('user_avatar_updated', {
        userId,
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
 * PUT /api/users/password
 * 修改密码
 */
router.put('/password', [
  body('userId').notEmpty().withMessage('缺少用户 ID'),
  body('oldPassword').notEmpty().withMessage('请输入原密码'),
  body('newPassword').isLength({ min: 6, max: 32 }).withMessage('新密码长度 6-32 个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('新密码必须包含大小写字母和数字')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { userId, oldPassword, newPassword } = req.body;

    const users = await query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '用户不存在' }
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { message: '原密码错误' }
      });
    }

    const saltRounds = 10;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHash, userId]
    );

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '修改密码失败' }
    });
  }
});

/**
 * PUT /api/users/status
 * 修改在线状态
 */
router.put('/status', [
  body('userId').notEmpty().withMessage('缺少用户 ID'),
  body('status').isIn(['online', 'offline', 'away', 'invisible']).withMessage('状态值无效')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { userId, status } = req.body;

    await query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    console.error('修改状态失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '修改状态失败' }
    });
  }
});

/**
 * GET /api/users/:id
 * 获取其他用户信息
 */
router.get('/:id', async (req, res) => {
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
router.get('/search', async (req, res) => {
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
