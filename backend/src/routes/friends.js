/**
 * 好友路由
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// 认证中间件
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: '未授权' }
    });
  }
  
  const jwt = require('jsonwebtoken');
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Token 无效' }
    });
  }
};

// ==================== 路由 ====================

/**
 * GET /api/friends
 * 获取好友列表
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const friends = await query(
      `SELECT u.id, u.username, u.nickname, u.avatar, u.status, f.created_at as friend_since
       FROM friendships f
       JOIN users u ON (f.friend_id = u.id OR f.user_id = u.id)
       WHERE (f.user_id = ? OR f.friend_id = u.id) 
         AND f.status = 'accepted'
         AND u.id != ?
       ORDER BY u.status DESC, f.created_at DESC`,
      [req.user.id, req.user.id]
    );
    
    res.json({
      success: true,
      data: { friends }
    });
  } catch (error) {
    console.error('获取好友列表失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取好友列表失败' }
    });
  }
});

/**
 * POST /api/friends/request
 * 发送好友申请
 */
router.post('/request', authMiddleware, [
  body('friendId').isInt().withMessage('无效的用户 ID'),
  body('message').optional().isLength({ max: 200 }).withMessage('申请信息最多 200 字符')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { friendId, message } = req.body;
    const userId = req.user.id;
    
    if (friendId === userId) {
      return res.status(400).json({
        success: false,
        error: { message: '不能添加自己为好友' }
      });
    }
    
    // 检查是否已是好友
    const existing = await query(
      'SELECT id FROM friendships WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [userId, friendId, friendId, userId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: '已是好友或已有申请' }
      });
    }
    
    // 创建好友申请
    await query(
      `INSERT INTO friend_requests (sender_id, receiver_id, message) VALUES (?, ?, ?)`,
      [userId, friendId, message || '我想加你为好友']
    );
    
    res.json({
      success: true,
      message: '好友申请已发送'
    });
  } catch (error) {
    console.error('发送好友申请失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '发送好友申请失败' }
    });
  }
});

/**
 * GET /api/friends/requests
 * 获取好友申请列表
 */
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const requests = await query(
      `SELECT fr.*, u.username, u.nickname, u.avatar
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      data: { requests }
    });
  } catch (error) {
    console.error('获取好友申请失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取好友申请失败' }
    });
  }
});

/**
 * POST /api/friends/requests/:id/respond
 * 响应好友申请
 */
router.post('/requests/:id/respond', authMiddleware, [
  body('action').isIn(['accept', 'reject']).withMessage('操作必须是 accept 或 reject')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const requestId = req.params.id;
    const { action } = req.body;
    
    // 获取申请信息
    const requests = await query(
      'SELECT sender_id, receiver_id FROM friend_requests WHERE id = ?',
      [requestId]
    );
    
    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '申请不存在' }
      });
    }
    
    const request = requests[0];
    
    if (request.receiver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: '无权操作此申请' }
      });
    }
    
    if (action === 'accept') {
      // 接受申请，创建好友关系
      await query(
        `INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'accepted')`,
        [request.sender_id, request.receiver_id]
      );
    }
    
    // 更新申请状态
    await query(
      `UPDATE friend_requests SET status = ?, responded_at = NOW() WHERE id = ?`,
      [action === 'accept' ? 'accepted' : 'rejected', requestId]
    );
    
    res.json({
      success: true,
      message: action === 'accept' ? '已添加为好友' : '已拒绝申请'
    });
  } catch (error) {
    console.error('响应好友申请失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '响应失败' }
    });
  }
});

/**
 * DELETE /api/friends/:id
 * 删除好友
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const friendId = req.params.id;
    const userId = req.user.id;
    
    await query(
      `DELETE FROM friendships 
       WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId]
    );
    
    res.json({
      success: true,
      message: '好友已删除'
    });
  } catch (error) {
    console.error('删除好友失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除失败' }
    });
  }
});

module.exports = router;
