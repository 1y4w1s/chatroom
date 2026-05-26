/**
 * 聊天室路由
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, optionalAuth } = require('../middleware/auth');

const roomAvatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(roomAvatarDir)) {
  fs.mkdirSync(roomAvatarDir, { recursive: true });
}
const roomAvatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, roomAvatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `room_${req.params.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage: roomAvatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// 超级管理员用户名
const SUPER_ADMIN_USERNAME = '1y4w1s';

// ==================== 权限检查中间件 ====================

/**
 * 检查用户是否为聊天室管理员
 * 优先使用 req.user.id（Token 认证），回退到 body 中的 userId/operatorId
 */
const checkAdmin = async (req, res, next) => {
  const roomId = req.params.id;
  // 优先从 Token 获取用户 ID
  const userId = req.user?.id || req.body.userId || req.body.operatorId;
  
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
 * 优先使用 req.user.id（Token 认证）
 */
const checkSuperAdmin = async (req, res, next) => {
  // 优先从 Token 获取用户 ID
  const userId = req.user?.id || req.body.userId || req.body.operatorId;
  
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
 * 获取聊天室列表（私有房间仅对成员可见）
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    // 优先使用 Token 中的用户 ID，否则回退到 query 参数
    const userId = req.user?.id || req.query.userId;
    
    let sql = `
      SELECT r.*, u.username as owner_name,
             (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count,
             r.avatar as friend_avatar,
             r.name as display_name
      FROM chat_rooms r
      JOIN users u ON r.owner_id = u.id
      WHERE r.is_active = TRUE
    `;
    
    const params = [];
    if (userId) {
      sql += ' AND r.id IN (SELECT room_id FROM room_members WHERE user_id = ?)';
      params.push(userId);
    }
    
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
 * GET /api/rooms/read-status?userId=
 * 获取所有聊天室的未读状态（必须放在 /:id 前面避免路由冲突）
 */
router.get('/read-status', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });

    const statuses = await query(
      `SELECT rm.room_id,
              (SELECT COUNT(*) FROM messages m WHERE m.room_id = rm.room_id
               AND m.id > IFNULL((SELECT last_read_message_id FROM room_read_status rrs WHERE rrs.user_id = ? AND rrs.room_id = rm.room_id), 0)
               AND m.is_mention = TRUE) > 0 as is_mentioned,
              (SELECT COUNT(*) FROM messages m WHERE m.room_id = rm.room_id
               AND m.id > IFNULL((SELECT last_read_message_id FROM room_read_status rrs WHERE rrs.user_id = ? AND rrs.room_id = rm.room_id), 0)) as unread_count
       FROM room_members rm
       WHERE rm.user_id = ?`,
      [userId, userId, userId]
    );

    res.json({ success: true, data: statuses });
  } catch (error) {
    console.error('获取未读状态失败:', error);
    res.status(500).json({ success: false, error: { message: '获取未读状态失败' } });
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
    
    // 获取成员列表，动态计算禁言状态（已过期的禁言视为未禁言）
    const members = await query(
      `SELECT u.id, u.username, u.nickname, u.avatar, u.is_bot,
              CASE WHEN u.status = 'invisible' THEN 'offline' ELSE u.status END as status,
              rm.role, rm.is_muted,
              DATE_FORMAT(rm.muted_until, '%Y-%m-%dT%T+08:00') as muted_until
       FROM room_members rm
       JOIN users u ON rm.user_id = u.id
       WHERE rm.room_id = ?`,
      [roomId]
    );
    
    // 在 JS 端判断禁言是否已过期（避免 SQL 时区问题）
    const now = new Date();
    const mappedMembers = members.map(member => {
      if (member.is_muted && member.muted_until) {
        const mutedUntil = new Date(member.muted_until);
        if (isNaN(mutedUntil.getTime()) || mutedUntil <= now) {
          member.is_muted = 0;
          member.muted_until = null;
        }
      } else if (!member.muted_until) {
        member.is_muted = 0;
      }
      return member;
    });
    
    // 如果启用了机器人，添加到成员列表
    await addBotToMembers(roomId, mappedMembers);
    
    res.json({
      success: true,
      data: {
        room: rooms[0],
        members: mappedMembers
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
      `SELECT u.id, u.username, u.nickname, u.avatar, u.is_bot,
              CASE WHEN u.status = 'invisible' THEN 'offline' ELSE u.status END as status,
              rm.role, rm.is_muted,
              DATE_FORMAT(rm.muted_until, '%Y-%m-%dT%T+08:00') as muted_until
       FROM room_members rm
       JOIN users u ON rm.user_id = u.id
       WHERE rm.room_id = ? 
       ORDER BY rm.role DESC, u.username ASC`,
      [roomId]
    );
    
    // 在 JS 端判断禁言是否已过期（避免 SQL 时区问题）
    const now = new Date();
    const mappedMembers = members.map(member => {
      if (member.is_muted && member.muted_until) {
        const mutedUntil = new Date(member.muted_until);
        if (isNaN(mutedUntil.getTime()) || mutedUntil <= now) {
          member.is_muted = 0;
          member.muted_until = null;
        }
      } else if (!member.muted_until) {
        member.is_muted = 0;
      }
      return member;
    });
    
    // 如果启用了机器人，添加到成员列表
    await addBotToMembers(roomId, mappedMembers);
    
    res.json({
      success: true,
      data: { members: mappedMembers }
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
  body('type').optional().isIn(['public']).withMessage('类型必须是 public'),
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
    
    // 广播聊天室创建事件给所有在线用户
    const { getIo } = require('../server');
    const io = getIo();
    if (io) {
      io.emit('room_created', {
        roomId: result.insertId,
        name,
        description,
        type,
        owner_id
      });
    }
    
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
      'SELECT id, owner_id FROM chat_rooms WHERE id = ? AND is_active = TRUE',
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
 * PUT /api/rooms/:id
 * 更新聊天室信息（名称/描述）
 */
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('聊天室名称 2-50 个字符'),
  body('description').optional().isLength({ max: 500 }).withMessage('描述最多 500 字符'),
  body('userId').notEmpty().withMessage('缺少用户 ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const roomId = req.params.id;
    const { name, description, userId } = req.body;

    const rooms = await query(
      'SELECT owner_id FROM chat_rooms WHERE id = ? AND is_active = TRUE', [roomId]
    );
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, error: { message: '聊天室不存在' } });
    }

    const isAdmin = await query(
      `SELECT id FROM room_members WHERE room_id = ? AND user_id = ? AND role IN ('owner', 'admin')`,
      [roomId, userId]
    );
    if (isAdmin.length === 0) {
      return res.status(403).json({ success: false, error: { message: '无权操作' } });
    }

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }

    if (updates.length > 0) {
      params.push(roomId);
      await query(`UPDATE chat_rooms SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新聊天室失败:', error);
    res.status(500).json({ success: false, error: { message: '更新失败' } });
  }
});

/**
 * POST /api/rooms/:id/avatar
 * 上传聊天室头像
 */
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: '请上传文件' } });
    }

    const roomId = req.params.id;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });
    }

    const isAdmin = await query(
      `SELECT id FROM room_members WHERE room_id = ? AND user_id = ? AND role IN ('owner', 'admin')`,
      [roomId, userId]
    );
    if (isAdmin.length === 0) {
      return res.status(403).json({ success: false, error: { message: '无权操作' } });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await query('UPDATE chat_rooms SET avatar = ? WHERE id = ?', [avatarUrl, roomId]);

    res.json({ success: true, data: { avatar: avatarUrl } });
  } catch (error) {
    console.error('上传聊天室头像失败:', error);
    res.status(500).json({ success: false, error: { message: '上传失败' } });
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
    
    // 不能禁言所有者；管理员不能禁言其他管理员
    if (targetMember[0].role === 'owner') {
      return res.status(403).json({
        success: false,
        error: { message: '不能禁言所有者' }
      });
    }
    if (targetMember[0].role === 'admin' && req.memberRole !== 'owner') {
      return res.status(403).json({
        success: false,
        error: { message: '只有群主可以禁言管理员' }
      });
    }
    
    // 计算禁言到期时间（使用服务器本地时间）
    let mutedUntil = null;
    let dbMutedUntil = null;
    if (isMuted && duration) {
      // 获取当前本地时间并加上禁言时长
      const now = new Date();
      const until = new Date(now.getTime() + duration * 60 * 1000);
      // 数据库存储格式（YYYY-MM-DD HH:mm:ss）
      const year = until.getFullYear();
      const month = String(until.getMonth() + 1).padStart(2, '0');
      const day = String(until.getDate()).padStart(2, '0');
      const hours = String(until.getHours()).padStart(2, '0');
      const minutes = String(until.getMinutes()).padStart(2, '0');
      const seconds = String(until.getSeconds()).padStart(2, '0');
      dbMutedUntil = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      // API 和 WebSocket 返回 ISO 8601 格式（含时区）
      mutedUntil = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
      
      console.log('禁言时间计算:', {
        nowLocal: now.toLocaleString('zh-CN'),
        duration,
        untilLocal: until.toLocaleString('zh-CN'),
        dbMutedUntil,
        mutedUntil
      });
    }
    
    await query(
      'UPDATE room_members SET is_muted = ?, muted_until = ? WHERE room_id = ? AND user_id = ?',
      [isMuted, dbMutedUntil, roomId, targetUserId]
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
      message: '聊天室已删除'
    });
  } catch (error) {
    console.error('强制删除聊天室失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除聊天室失败' }
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

/**
 * POST /api/rooms/:id/read
 * 标记聊天室为已读
 */
router.post('/:id/read', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });

    // 获取该房间最新消息 ID
    const lastMsg = await query(
      'SELECT MAX(id) as max_id FROM messages WHERE room_id = ?',
      [roomId]
    );
    const lastId = lastMsg[0]?.max_id || 0;

    await query(
      `INSERT INTO room_read_status (user_id, room_id, last_read_message_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE last_read_message_id = ?`,
      [userId, roomId, lastId, lastId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ success: false, error: { message: '标记已读失败' } });
  }
});

/**
 * PUT /api/rooms/:id/bot
 * 切换聊天室机器人启用状态（仅群主可用）
 */
router.put('/:id/bot', [
  body('enable').isBoolean().withMessage('enable 必须是布尔值'),
  body('userId').notEmpty().withMessage('缺少用户 ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const roomId = req.params.id;
    const { enable, userId } = req.body;

    // 检查聊天室是否存在
    const rooms = await query(
      'SELECT id, owner_id FROM chat_rooms WHERE id = ? AND is_active = TRUE',
      [roomId]
    );
    if (rooms.length === 0) {
      return res.status(404).json({ success: false, error: { message: '聊天室不存在' } });
    }

    // 检查是否为群主
    const member = await query(
      "SELECT role FROM room_members WHERE room_id = ? AND user_id = ? AND role = 'owner'",
      [roomId, userId]
    );
    if (member.length === 0) {
      return res.status(403).json({ success: false, error: { message: '仅群主可以管理机器人设置' } });
    }

    await query(
      'UPDATE chat_rooms SET enable_bot = ? WHERE id = ?',
      [enable ? 1 : 0, roomId]
    );

    // 记录系统日志
    await logAction(userId, 'toggle_bot', { roomId, enable });

    // 发送 WebSocket 通知
    emitPermissionChange(roomId, 'bot_toggled', {
      roomId,
      enable,
      operatorId: userId
    });

    res.json({
      success: true,
      message: enable ? '机器人已启用' : '机器人已禁用',
      data: { enable_bot: enable }
    });
  } catch (error) {
    console.error('切换机器人状态失败:', error);
    res.status(500).json({ success: false, error: { message: '操作失败' } });
  }
});

// ==================== 机器人成员辅助函数 ====================

/**
 * 如果聊天室启用了机器人，将机器人用户添加到成员列表中
 */
async function addBotToMembers(roomId, members) {
  try {
    const rooms = await query(
      'SELECT enable_bot FROM chat_rooms WHERE id = ?',
      [roomId]
    );
    if (rooms.length > 0 && rooms[0].enable_bot) {
      const botUsers = await query(
        `SELECT id, username, nickname, avatar, is_bot FROM users WHERE username = 'deepseek' AND is_bot = TRUE LIMIT 1`
      );
      if (botUsers.length > 0) {
        const bot = botUsers[0];
        // 检查是否已在列表中
        const alreadyInList = members.some(m => m.id === bot.id);
        if (!alreadyInList) {
          members.push({
            id: bot.id,
            username: bot.username,
            nickname: bot.nickname || 'DeepSeek AI',
            avatar: bot.avatar || '',
            status: null,
            role: 'member',
            is_muted: 0,
            muted_until: null,
            is_bot: 1
          });
        }
      }
    }
  } catch (e) {
    console.error('添加机器人到成员列表失败:', e.message);
  }
  return members;
}

// ==================== WebSocket通知函数 ====================

// 发送权限变更通知到聊天室所有成员
async function emitPermissionChange(roomId, event, data) {
  try {
    // 动态导入以避免循环依赖
    const { getIo } = require('../server');
    const io = getIo();
    if (io) {
      io.to(roomId).emit(event, data);
      console.log(`发送 WebSocket 通知：${event} 到房间 ${roomId}`, data);
    }
  } catch (error) {
    console.error(`发送 WebSocket 通知失败：${error.message}`);
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

/**
 * 确保 announcements 表存在
 */
async function ensureAnnouncementsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (e) {
    console.error('确保 announcements 表存在失败:', e.message);
  }
}

/**
 * GET /api/rooms/:id/announcements
 * 获取聊天室公告列表（时间倒序）
 */
router.get('/:id/announcements', async (req, res) => {
  try {
    await ensureAnnouncementsTable();
    const list = await query(
      `SELECT a.*, u.username, u.nickname, u.avatar
       FROM announcements a
       JOIN users u ON a.user_id = u.id
       WHERE a.room_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: { announcements: list } });
  } catch (error) {
    console.error('获取公告列表失败:', error);
    res.status(500).json({ success: false, error: { message: '获取公告列表失败' } });
  }
});

/**
 * POST /api/rooms/:id/announcements
 * 创建公告（仅管理员）
 */
router.post('/:id/announcements', checkAdmin, async (req, res) => {
  try {
    await ensureAnnouncementsTable();
    const { content, userId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: { message: '公告内容不能为空' } });
    }
    const result = await query(
      'INSERT INTO announcements (room_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, userId, content.trim()]
    );
    const newAnnouncement = await query(
      `SELECT a.*, u.username, u.nickname, u.avatar
       FROM announcements a JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [result.insertId]
    );
    emitPermissionChange(req.params.id, 'announcement_created', newAnnouncement[0]);
    res.status(201).json({ success: true, data: { announcement: newAnnouncement[0] } });
  } catch (error) {
    console.error('创建公告失败:', error);
    res.status(500).json({ success: false, error: { message: '创建公告失败' } });
  }
});

/**
 * PUT /api/rooms/:id/announcements/:announcementId
 * 编辑公告（仅公告发布者或管理员）
 */
router.put('/:id/announcements/:announcementId', async (req, res) => {
  try {
    const { content, userId } = req.body;
    const ann = await query('SELECT user_id FROM announcements WHERE id = ?', [req.params.announcementId]);
    if (ann.length === 0) return res.status(404).json({ success: false, error: { message: '公告不存在' } });
    
    const member = await query('SELECT role FROM room_members WHERE room_id = ? AND user_id = ?', [req.params.id, userId]);
    const isOwnerOrAdmin = member.length > 0 && (member[0].role === 'owner' || member[0].role === 'admin');
    const isAuthor = ann[0].user_id === parseInt(userId);
    
    if (!isAuthor && !isOwnerOrAdmin) {
      return res.status(403).json({ success: false, error: { message: '权限不足' } });
    }
    
    await query('UPDATE announcements SET content = ?, updated_at = NOW() WHERE id = ?', [content, req.params.announcementId]);
    const updated = await query(
      `SELECT a.*, u.username, u.nickname, u.avatar
       FROM announcements a JOIN users u ON a.user_id = u.id WHERE a.id = ?`,
      [req.params.announcementId]
    );
    emitPermissionChange(req.params.id, 'announcement_updated', updated[0]);
    res.json({ success: true, data: { announcement: updated[0] } });
  } catch (error) {
    console.error('编辑公告失败:', error);
    res.status(500).json({ success: false, error: { message: '编辑公告失败' } });
  }
});

/**
 * DELETE /api/rooms/:id/announcements/:announcementId
 * 删除公告（仅公告发布者或管理员）
 */
router.delete('/:id/announcements/:announcementId', async (req, res) => {
  try {
    const { userId } = req.body;
    const ann = await query('SELECT user_id FROM announcements WHERE id = ?', [req.params.announcementId]);
    if (ann.length === 0) return res.status(404).json({ success: false, error: { message: '公告不存在' } });
    
    const member = await query('SELECT role FROM room_members WHERE room_id = ? AND user_id = ?', [req.params.id, userId]);
    const isOwnerOrAdmin = member.length > 0 && (member[0].role === 'owner' || member[0].role === 'admin');
    const isAuthor = ann[0].user_id === parseInt(userId);
    
    if (!isAuthor && !isOwnerOrAdmin) {
      return res.status(403).json({ success: false, error: { message: '权限不足' } });
    }
    
    await query('DELETE FROM announcements WHERE id = ?', [req.params.announcementId]);
    emitPermissionChange(req.params.id, 'announcement_deleted', { announcementId: parseInt(req.params.announcementId) });
    res.json({ success: true, message: '公告已删除' });
  } catch (error) {
    console.error('删除公告失败:', error);
    res.status(500).json({ success: false, error: { message: '删除公告失败' } });
  }
});

module.exports = router;