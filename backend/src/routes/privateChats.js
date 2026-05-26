/**
 * 私聊路由
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// ==================== 路由 ====================

/**
 * POST /api/private-chats
 * 查找或创建私聊会话
 */
router.post('/', [
  body('userId').notEmpty().withMessage('缺少用户 ID'),
  body('friendId').notEmpty().withMessage('缺少好友 ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { userId, friendId } = req.body;
    const a = Math.min(parseInt(userId), parseInt(friendId));
    const b = Math.max(parseInt(userId), parseInt(friendId));

    // 检查是否为好友关系
    const friendship = await query(
      `SELECT id FROM friendships 
       WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
       AND status = 'accepted'`,
      [userId, friendId, friendId, userId]
    );
    if (friendship.length === 0) {
      return res.status(403).json({ success: false, error: { message: '仅好友之间可发起私聊' } });
    }

    // 查找已有会话
    let chat = await query(
      'SELECT id, user_a_id, user_b_id, created_at FROM private_chats WHERE user_a_id = ? AND user_b_id = ?',
      [a, b]
    );

    if (chat.length > 0) {
      return res.json({ success: true, data: { chat: chat[0] } });
    }

    // 创建新会话
    const result = await query(
      'INSERT INTO private_chats (user_a_id, user_b_id) VALUES (?, ?)',
      [a, b]
    );

    chat = [{
      id: result.insertId,
      user_a_id: a,
      user_b_id: b,
      created_at: new Date()
    }];

    res.status(201).json({ success: true, data: { chat: chat[0] } });
  } catch (error) {
    console.error('创建私聊会话失败:', error);
    res.status(500).json({ success: false, error: { message: '创建私聊会话失败' } });
  }
});

/**
 * GET /api/private-chats
 * 获取当前用户的私聊会话列表
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });
    }

    const chats = await query(
      `SELECT pc.id, pc.user_a_id, pc.user_b_id, pc.created_at,
              pc.updated_at,
              u.id as friend_id, u.username, u.nickname, u.avatar, u.status,
              (SELECT COUNT(*) FROM private_messages pm 
               WHERE pm.chat_id = pc.id AND pm.sender_id != ? AND pm.is_read = FALSE) as unread_count,
              (SELECT pm.content FROM private_messages pm 
               WHERE pm.chat_id = pc.id 
               ORDER BY pm.created_at DESC LIMIT 1) as last_message,
              (SELECT pm.created_at FROM private_messages pm 
               WHERE pm.chat_id = pc.id 
               ORDER BY pm.created_at DESC LIMIT 1) as last_message_time
       FROM private_chats pc
       JOIN users u ON u.id = CASE WHEN pc.user_a_id = ? THEN pc.user_b_id ELSE pc.user_a_id END
       WHERE pc.user_a_id = ? OR pc.user_b_id = ?
       ORDER BY COALESCE(last_message_time, pc.created_at) DESC`,
      [userId, userId, userId, userId]
    );

    // 格式化状态
    const mapped = chats.map(c => ({
      ...c,
      friend_status: c.status === 'invisible' ? 'offline' : c.status
    }));

    res.json({ success: true, data: { chats: mapped } });
  } catch (error) {
    console.error('获取私聊列表失败:', error);
    res.status(500).json({ success: false, error: { message: '获取私聊列表失败' } });
  }
});

/**
 * GET /api/private-chats/:id/messages
 * 获取私聊消息历史
 */
router.get('/:id/messages', async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });
    }

    // 验证用户是否在会话中
    const chat = await query(
      'SELECT id FROM private_chats WHERE id = ? AND (user_a_id = ? OR user_b_id = ?)',
      [chatId, userId, userId]
    );
    if (chat.length === 0) {
      return res.status(403).json({ success: false, error: { message: '无权访问该会话' } });
    }

    const messages = await query(
      `SELECT pm.id, pm.chat_id, pm.sender_id, pm.content, pm.type,
              pm.file_url, pm.file_name, pm.file_size, pm.is_read, pm.created_at,
              u.username, u.nickname, u.avatar
       FROM private_messages pm
       JOIN users u ON pm.sender_id = u.id
       WHERE pm.chat_id = ?
       ORDER BY pm.created_at DESC
       LIMIT ? OFFSET ?`,
      [chatId, limit, offset]
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: { page, limit }
      }
    });
  } catch (error) {
    console.error('获取私聊消息失败:', error);
    res.status(500).json({ success: false, error: { message: '获取私聊消息失败' } });
  }
});

/**
 * POST /api/private-chats/:id/messages
 * 发送私聊消息
 */
router.post('/:id/messages', [
  body('senderId').notEmpty().withMessage('缺少发送者 ID'),
  body('content').notEmpty().withMessage('消息内容不能为空')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const chatId = req.params.id;
    const { senderId, content, type = 'text', fileUrl, fileName, fileSize } = req.body;

    // 验证用户是否在会话中
    const chat = await query(
      'SELECT id, user_a_id, user_b_id FROM private_chats WHERE id = ? AND (user_a_id = ? OR user_b_id = ?)',
      [chatId, senderId, senderId]
    );
    if (chat.length === 0) {
      return res.status(403).json({ success: false, error: { message: '无权发送消息' } });
    }

    const result = await query(
      `INSERT INTO private_messages (chat_id, sender_id, content, type, file_url, file_name, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [chatId, senderId, content, type, fileUrl || null, fileName || null, fileSize || null]
    );

    const message = await query(
      `SELECT pm.*, u.username, u.nickname, u.avatar
       FROM private_messages pm
       JOIN users u ON pm.sender_id = u.id
       WHERE pm.id = ?`,
      [result.insertId]
    );

    // 更新会话时间
    await query('UPDATE private_chats SET updated_at = NOW() WHERE id = ?', [chatId]);

    res.status(201).json({ success: true, data: { message: message[0] } });
  } catch (error) {
    console.error('发送私聊消息失败:', error);
    res.status(500).json({ success: false, error: { message: '发送私聊消息失败' } });
  }
});

/**
 * PUT /api/private-chats/:id/read
 * 标记私聊消息为已读
 */
router.put('/:id/read', async (req, res) => {
  try {
    const chatId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });
    }

    await query(
      `UPDATE private_messages SET is_read = TRUE 
       WHERE chat_id = ? AND sender_id != ? AND is_read = FALSE`,
      [chatId, userId]
    );

    res.json({ success: true, message: '已标记为已读' });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({ success: false, error: { message: '操作失败' } });
  }
});

/**
 * GET /api/private-chats/unread-count
 * 获取未读私聊总数
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });
    }

    const result = await query(
      `SELECT COUNT(*) as total FROM private_messages pm
       JOIN private_chats pc ON pm.chat_id = pc.id
       WHERE (pc.user_a_id = ? OR pc.user_b_id = ?)
       AND pm.sender_id != ? AND pm.is_read = FALSE`,
      [userId, userId, userId]
    );

    res.json({ success: true, data: { unread_count: result[0].total } });
  } catch (error) {
    console.error('获取未读数失败:', error);
    res.status(500).json({ success: false, error: { message: '操作失败' } });
  }
});

module.exports = router;