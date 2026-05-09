/**
 * 聊天室路由
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// ==================== 路由 ====================

/**
 * GET /api/rooms
 * 获取聊天室列表
 */
router.get('/', async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT r.*, u.username as owner_name,
             (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count
      FROM rooms r
      JOIN users u ON r.owner_id = u.id
    `;
    
    const params = [];
    
    if (type) {
      sql += ' AND r.type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY r.created_at DESC';
    
    const allRooms = await query(sql, params);
    const rooms = allRooms.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('获取聊天室列表失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取聊天室列表失败' }
    });
  }
});

/**
 * GET /api/rooms/:id
 * 获取聊天室详情
 */
router.get('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    
    const rooms = await query(
      `SELECT r.*, u.username as owner_name,
              (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count
       FROM rooms r
       JOIN users u ON r.owner_id = u.id
       WHERE r.id = ?`,
      [roomId]
    );
    
    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '聊天室不存在' }
      });
    }
    
    // 获取成员列表
    const members = await query(
      `SELECT u.id, u.username, u.nickname, u.avatar, u.status, rm.role
       FROM room_members rm
       JOIN users u ON rm.user_id = u.id
       WHERE rm.room_id = ?`,
      [roomId]
    );
    
    res.json({
      success: true,
      data: {
        room: rooms[0],
        members
      }
    });
  } catch (error) {
    console.error('获取聊天室详情失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取聊天室详情失败' }
    });
  }
});

/**
 * POST /api/rooms
 * 创建聊天室
 */
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('聊天室名称 2-50 个字符'),
  body('description').optional().isLength({ max: 500 }).withMessage('描述最多 500 字符'),
  body('type').optional().isIn(['public', 'private']).withMessage('类型必须是 public 或 private'),
  body('owner_id').notEmpty().withMessage('缺少创建者 ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { name, description, type = 'public', maxMembers = 100, owner_id } = req.body;
    
    const result = await query(
      `INSERT INTO rooms (name, description, type, owner_id, max_members) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || '', type, owner_id, maxMembers]
    );
    
    await query(
      `INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, 'owner')`,
      [result.insertId, owner_id]
    );
    
    res.status(201).json({
      success: true,
      data: {
        room: {
          id: result.insertId,
          name,
          description,
          type,
          owner_id
        }
      }
    });
  } catch (error) {
    console.error('创建聊天室失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '创建聊天室失败' }
    });
  }
});

/**
 * POST /api/rooms/:id/join
 * 加入聊天室
 */
router.post('/:id/join', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: '缺少用户 ID' }
      });
    }
    
    const existing = await query(
      'SELECT id FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (existing.length > 0) {
      return res.json({
        success: true,
        message: '已在聊天室中',
        alreadyJoined: true
      });
    }
    
    await query(
      `INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, 'member')`,
      [roomId, userId]
    );
    
    res.json({
      success: true,
      message: '加入聊天室成功'
    });
  } catch (error) {
    console.error('加入聊天室失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '加入聊天室失败' }
    });
  }
});

/**
 * POST /api/rooms/:id/leave
 * 离开聊天室
 */
router.post('/:id/leave', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: '缺少用户 ID' }
      });
    }
    
    await query(
      'DELETE FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    res.json({
      success: true,
      message: '离开聊天室成功'
    });
  } catch (error) {
    console.error('离开聊天室失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '离开聊天室失败' }
    });
  }
});

/**
 * GET /api/rooms/:id/messages
 * 获取聊天室消息历史
 */
router.get('/:id/messages', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const MessageService = require('../services/messageService');
    const messages = await MessageService.getRoomMessages(
      roomId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('获取消息历史失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取消息历史失败' }
    });
  }
});

module.exports = router;
