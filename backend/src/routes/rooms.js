/**
 * 聊天室路由
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// 超级管理员用户名
const SUPER_ADMIN_USERNAME = '1y4w1s';

// 获取Socket.io实例
const { getIo } = require('../server');

// ==================== 权限检查中间件 ====================

/**
 * 检查用户是否为聊天室管理员
 */
const checkAdmin = async (req, res, next) => {
  const roomId = req.params.id;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: '缺少用户 ID' }
    });
  }
  
  try {
    const member = await query(
      'SELECT role FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (member.length === 0) {
      return res.status(403).json({
        success: false,
        error: { message: '您不是该聊天室成员' }
      });
    }
    
    if (member[0].role !== 'owner' && member[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: '权限不足，需要管理员权限' }
      });
    }
    
    req.memberRole = member[0].role;
    next();
  } catch (error) {
    console.error('权限检查失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '权限检查失败' }
    });
  }
};

/**
 * 检查用户是否为超级管理员
 */
const checkSuperAdmin = async (req, res, next) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: '缺少用户 ID' }
    });
  }
  
  try {
    const user = await query(
      'SELECT username FROM users WHERE id = ?',
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '用户不存在' }
      });
    }
    
    if (user[0].username !== SUPER_ADMIN_USERNAME) {
      return res.status(403).json({
        success: false,
        error: { message: '权限不足，需要超级管理员权限' }
      });
    }
    
    next();
  } catch (error) {
    console.error('超级管理员检查失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '权限检查失败' }
    });
  }
};

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
      FROM chat_rooms r
      JOIN users u ON r.owner_id = u.id
      WHERE r.is_active = TRUE
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
       FROM chat_rooms r
       JOIN users u ON r.owner_id = u.id
       WHERE r.id = ? AND r.is_active = TRUE`,
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
      `SELECT u.id, u.username, u.nickname, u.avatar, u.status, rm.role, rm.is_muted, rm.muted_until
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
 * GET /api/rooms/:id/members
 * 获取聊天室成员列表（用于预览）
 */
router.get('/:id/members', async (req, res) => {
  try {
    const roomId = req.params.id;
    
    // 检查聊天室是否存在
    const room = await query(
      'SELECT id FROM chat_rooms WHERE id = ? AND is_active = TRUE',
      [roomId]
    );
    
    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '聊天室不存在' }
      });
    }
    
    const members = await query(
      `SELECT u.id, u.username, u.nickname, u.avatar, u.status, rm.role
       FROM room_members rm
       JOIN users u ON rm.user_id = u.id
       WHERE rm.room_id = ?
       ORDER BY rm.role DESC, u.username ASC`,
      [roomId]
    );
    
    res.json({
      success: true,
      data: { members }
    });
  } catch (error) {
    console.error('获取成员列表失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取成员列表失败' }
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
      `INSERT INTO chat_rooms (name, description, type, owner_id, max_members) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || '', type, owner_id, maxMembers]
    );
    
    await query(
      `INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, 'owner')`,
      [result.insertId, owner_id]
    );
    
    // 记录系统日志
    await logAction(owner_id, 'create_room', { roomId: result.insertId, name });
    
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
    
    // 检查聊天室是否存在
    const room = await query(
      'SELECT id FROM chat_rooms WHERE id = ? AND is_active = TRUE',
      [roomId]
    );
    
    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '聊天室不存在' }
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
    
    // 检查是否为所有者
    const member = await query(
      'SELECT role FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (member.length === 0) {
      return res.json({
        success: true,
        message: '您不在该聊天室中'
      });
    }
    
    if (member[0].role === 'owner') {
      return res.status(403).json({
        success: false,
        error: { message: '聊天室所有者不能离开，请先转让所有权或解散聊天室' }
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
 * PUT /api/rooms/:id/members/:userId/role
 * 修改成员角色（授予/撤销管理员权限）
 */
router.put('/:id/members/:userId/role', checkAdmin, [
  body('role').isIn(['admin', 'member']).withMessage('角色必须是 admin 或 member'),
  body('operatorId').notEmpty().withMessage('缺少操作者 ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const roomId = req.params.id;
    const targetUserId = req.params.userId;
    const { role, operatorId, reason } = req.body;
    
    // 检查目标用户是否为所有者
    const targetMember = await query(
      'SELECT role FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, targetUserId]
    );
    
    if (targetMember.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '目标用户不在该聊天室中' }
      });
    }
    
    if (targetMember[0].role === 'owner') {
      return res.status(403).json({
        success: false,
        error: { message: '不能修改聊天室所有者的角色' }
      });
    }
    
    // 检查操作者是否为所有者（只能所有者可以撤销管理员）
    if (req.memberRole === 'admin' && role === 'member') {
      return res.status(403).json({
        success: false,
        error: { message: '管理员不能撤销其他管理员的权限' }
      });
    }
    
    await query(
      'UPDATE room_members SET role = ? WHERE room_id = ? AND user_id = ?',
      [role, roomId, targetUserId]
    );
    
    // 记录系统日志
    await logAction(operatorId, 'change_role', { 
      roomId, 
      targetUserId, 
      role, 
      reason 
    });
    
    // 发送WebSocket通知
    emitPermissionChange(roomId, 'role_changed', {
      roomId,
      targetUserId,
      role,
      operatorId,
      reason
    });
    
    res.json({
      success: true,
      message: role === 'admin' ? '授予管理员权限成功' : '撤销管理员权限成功'
    });
  } catch (error) {
    console.error('修改角色失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '修改角色失败' }
    });
  }
});

/**
 * PUT /api/rooms/:id/members/:userId/mute
 * 禁言/解除禁言成员
 */
router.put('/:id/members/:userId/mute', checkAdmin, [
  body('isMuted').isBoolean().withMessage('isMuted 必须是布尔值'),
  body('operatorId').notEmpty().withMessage('缺少操作者 ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const roomId = req.params.id;
    const targetUserId = req.params.userId;
    const { isMuted, duration, operatorId, reason } = req.body;
    
    // 检查目标用户是否在聊天室中
    const targetMember = await query(
      'SELECT role FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, targetUserId]
    );
    
    if (targetMember.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '目标用户不在该聊天室中' }
      });
    }
    
    // 不能禁言所有者或其他管理员
    if (targetMember[0].role === 'owner' || targetMember[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: '不能禁言管理员' }
      });
    }
    
    // 计算禁言到期时间
    let mutedUntil = null;
    if (isMuted && duration) {
      mutedUntil = new Date(Date.now() + duration * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    }
    
    await query(
      'UPDATE room_members SET is_muted = ?, muted_until = ? WHERE room_id = ? AND user_id = ?',
      [isMuted, mutedUntil, roomId, targetUserId]
    );
    
    // 记录系统日志
    await logAction(operatorId, isMuted ? 'mute_member' : 'unmute_member', { 
      roomId, 
      targetUserId, 
      duration,
      reason 
    });
    
    // 发送WebSocket通知
    emitPermissionChange(roomId, isMuted ? 'member_muted' : 'member_unmuted', {
      roomId,
      targetUserId,
      isMuted,
      mutedUntil,
      operatorId,
      reason
    });
    
    res.json({
      success: true,
      message: isMuted ? '禁言成功' : '解除禁言成功'
    });
  } catch (error) {
    console.error('禁言操作失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '禁言操作失败' }
    });
  }
});

/**
 * DELETE /api/rooms/:id
 * 解散聊天室（需要二次确认）
 */
router.delete('/:id', checkAdmin, [
  body('operatorId').notEmpty().withMessage('缺少操作者 ID'),
  body('reason').isLength({ min: 10, max: 500 }).withMessage('请提供解散原因（10-500字符）')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const roomId = req.params.id;
    const { operatorId, reason } = req.body;
    
    // 获取聊天室信息用于日志记录
    const room = await query(
      'SELECT name FROM chat_rooms WHERE id = ?',
      [roomId]
    );
    
    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '聊天室不存在' }
      });
    }
    
    // 只有所有者可以解散聊天室
    if (req.memberRole !== 'owner') {
      return res.status(403).json({
        success: false,
        error: { message: '只有聊天室所有者可以解散聊天室' }
      });
    }
    
    // 软删除聊天室
    await query(
      'UPDATE chat_rooms SET is_active = FALSE WHERE id = ?',
      [roomId]
    );
    
    // 记录系统日志
    await logAction(operatorId, 'dissolve_room', { 
      roomId, 
      roomName: room[0].name, 
      reason 
    });
    
    // 发送WebSocket通知
    emitPermissionChange(roomId, 'room_dissolved', {
      roomId,
      roomName: room[0].name,
      operatorId,
      reason
    });
    
    res.json({
      success: true,
      message: '聊天室已解散'
    });
  } catch (error) {
    console.error('解散聊天室失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '解散聊天室失败' }
    });
  }
});

/**
 * DELETE /api/rooms/:id/force
 * 超级管理员强制删除聊天室
 */
router.delete('/:id/force', checkSuperAdmin, [
  body('operatorId').notEmpty().withMessage('缺少操作者 ID')
], async (req, res) => {
  console.log('DELETE /force 请求体:', req.body);
  console.log('req.params:', req.params);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const roomId = req.params.id;
    const { operatorId, reason } = req.body;
    
    // 获取聊天室信息用于日志记录
    const room = await query(
      'SELECT name, owner_id FROM chat_rooms WHERE id = ?',
      [roomId]
    );
    
    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '聊天室不存在' }
      });
    }
    
    // 硬删除聊天室（会级联删除关联数据）
    await query(
      'DELETE FROM chat_rooms WHERE id = ?',
      [roomId]
    );
    
    // 记录系统日志
    await logAction(operatorId, 'force_delete_room', { 
      roomId, 
      roomName: room[0].name, 
      ownerId: room[0].owner_id,
      reason 
    });
    
    // 发送WebSocket通知
    emitPermissionChange(roomId, 'room_deleted', {
      roomId,
      roomName: room[0].name,
      operatorId,
      reason
    });
    
    res.json({
      success: true,
      message: '聊天室已被强制删除'
    });
  } catch (error) {
    console.error('强制删除聊天室失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '强制删除聊天室失败' }
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

/**
 * 获取用户在聊天室中的权限
 */
router.get('/:id/members/:userId/permissions', async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.params.userId;
    
    const member = await query(
      'SELECT role, is_muted, muted_until FROM room_members WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (member.length === 0) {
      return res.json({
        success: true,
        data: {
          hasPermission: false,
          isAdmin: false,
          isOwner: false,
          isMuted: false,
          canSendMessage: false
        }
      });
    }
    
    const isMuted = member[0].is_muted && (!member[0].muted_until || new Date(member[0].muted_until) > new Date());
    
    res.json({
      success: true,
      data: {
        hasPermission: true,
        isAdmin: member[0].role === 'admin' || member[0].role === 'owner',
        isOwner: member[0].role === 'owner',
        isMuted,
        canSendMessage: !isMuted
      }
    });
  } catch (error) {
    console.error('获取权限失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取权限失败' }
    });
  }
});

// ==================== WebSocket通知函数 ====================

/**
 * 发送权限变更通知到聊天室所有成员
 */
function emitPermissionChange(roomId, event, data) {
  const io = getIo();
  if (io) {
    io.to(roomId).emit(event, data);
    console.log(`发送WebSocket通知: ${event} 到房间 ${roomId}`, data);
  }
}

// ==================== 日志记录函数 ====================

async function logAction(userId, action, details) {
  try {
    await query(
      `INSERT INTO system_logs (user_id, action, details) VALUES (?, ?, ?)`,
      [userId, action, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('记录日志失败:', error);
  }
}

module.exports = router;