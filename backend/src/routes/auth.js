/**
 * 认证路由
 * 注册、登录、Token 刷新
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
    
    // 生成 Token
    const token = jwt.sign(
      { id: result.insertId, username, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.insertId,
          username,
          email,
          nickname: nickname || username
        },
        token
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
      `SELECT id, username, email, password_hash, avatar, status, is_banned 
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
    
    // 生成 Token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          status: 'online'
        },
        token
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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: '未授权' }
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 更新用户状态为离线
    await query(
      'UPDATE users SET status = ? WHERE id = ?',
      ['offline', decoded.id]
    );
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Token 无效' }
    });
  }
});

/**
 * GET /api/auth/verify
 * 验证 Token
 */
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: '未授权' }
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 检查用户是否存在
    const users = await query(
      'SELECT id, username, email, avatar, status FROM users WHERE id = ?',
      [decoded.id]
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
        user: users[0]
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Token 无效或已过期' }
    });
  }
});

module.exports = router;
