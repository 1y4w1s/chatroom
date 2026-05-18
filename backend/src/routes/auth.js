/**
 * 认证路由
 * 注册、登录
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

// ==================== 验证规则 ====================

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度 3-20 个字符')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  
  body('password')
    .isLength({ min: 6, max: 32 })
    .withMessage('密码长度 6-32 个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含大小写字母和数字')
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('请输入用户名或邮箱'),
  
  body('password')
    .notEmpty()
    .withMessage('请输入密码')
];

// ==================== 路由处理 ====================

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  const { username, email, password, nickname } = req.body;
  
  try {
    // 检查用户名是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          message: '用户名或邮箱已被注册',
          code: 'USER_EXISTS'
        }
      });
    }
    
    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 插入用户
    const result = await query(
      `INSERT INTO users (username, email, password_hash, nickname) 
       VALUES (?, ?, ?, ?)`,
      [username, email, passwordHash, nickname || username]
    );
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.insertId,
          username,
          email,
          nickname: nickname || username
        }
      }
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '注册失败，请稍后重试',
        code: 'REGISTER_FAILED'
      }
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  const { username, password } = req.body;
  
  try {
    // 查找用户
    const users = await query(
      `SELECT id, username, email, password_hash, avatar, status, is_banned, nickname 
       FROM users 
       WHERE username = ? OR email = ?`,
      [username, username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          message: '用户名或密码错误',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    const user = users[0];
    
    // 检查是否被封禁
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        error: {
          message: `账号已被封禁：${user.ban_reason || '违反社区规定'}`,
          code: 'ACCOUNT_BANNED'
        }
      });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          message: '用户名或密码错误',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    // 更新登录时间和状态
    await query(
      `UPDATE users 
       SET last_login_at = NOW(), status = 'online' 
       WHERE id = ?`,
      [user.id]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          nickname: user.nickname || user.username,
          status: 'online'
        }
      }
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '登录失败，请稍后重试',
        code: 'LOGIN_FAILED'
      }
    });
  }
});

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: '缺少用户 ID' }
    });
  }
  
  try {
    // 更新用户状态为离线
    await query(
      'UPDATE users SET status = ? WHERE id = ?',
      ['offline', userId]
    );
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: '登出失败' }
    });
  }
});

/**
 * GET /api/auth/verify
 * 验证用户（简化版）
 */
router.get('/verify', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: '缺少用户 ID' }
    });
  }
  
  try {
    const users = await query(
      'SELECT id, username, email, avatar, status, nickname FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '用户不存在' }
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          ...users[0],
          nickname: users[0].nickname || users[0].username
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: '验证失败' }
    });
  }
});

/**
 * POST /api/auth/verify-reset
 * 验证用户名和邮箱是否匹配（找回密码第一步）
 */
router.post('/verify-reset', async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({
      success: false,
      error: { message: '请填写用户名和邮箱' }
    });
  }

  try {
    const users = await query(
      'SELECT id, username, email FROM users WHERE (username = ? OR email = ?) AND email = ?',
      [username, username, email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '用户名与邮箱不匹配' }
      });
    }

    res.json({
      success: true,
      data: { userId: users[0].id }
    });
  } catch (error) {
    console.error('验证失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '验证失败' }
    });
  }
});

/**
 * POST /api/auth/reset-password
 * 重置密码（找回密码第二步）
 */
router.post('/reset-password', async (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({
      success: false,
      error: { message: '参数不完整' }
    });
  }

  if (newPassword.length < 6 || newPassword.length > 32) {
    return res.status(400).json({
      success: false,
      error: { message: '密码长度 6-32 个字符' }
    });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );

    res.json({
      success: true,
      message: '密码已重置，请使用新密码登录'
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '重置密码失败' }
    });
  }
});

module.exports = router;
