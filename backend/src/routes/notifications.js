const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

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

router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await query(
      `SELECT n.*, u.username, u.nickname, u.avatar
       FROM notifications n
       LEFT JOIN users u ON n.from_user_id = u.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const unreadCount = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount[0].count
      }
    });
  } catch (error) {
    console.error('获取通知失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取通知失败' }
    });
  }
});

router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '标记已读失败' }
    });
  }
});

router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('标记全部已读失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '标记全部已读失败' }
    });
  }
});

module.exports = router;
