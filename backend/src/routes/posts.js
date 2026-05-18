const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authMiddleware = async (req, res, next) => {
  const userId = req.query.userId || req.body.userId;
  if (!userId) {
    return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });
  }
  req.user = { id: parseInt(userId) };
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/posts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('只允许上传图片文件'));
    }
    cb(null, true);
  }
});

async function ensurePostsTables() {
  try {
    await query(`SELECT 1 FROM posts LIMIT 1`);
  } catch (e) {
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100) DEFAULT NULL,
        content TEXT DEFAULT NULL,
        images JSON DEFAULT NULL,
        tags JSON DEFAULT NULL,
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
  try {
    await query(`SELECT 1 FROM post_likes LIMIT 1`);
  } catch (e) {
    await query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    await ensurePostsTables();

    const posts = await query(
      `SELECT p.*, u.username, u.nickname, u.avatar,
              (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) > 0 as is_liked
       FROM posts p
        JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    const total = await query(
      'SELECT COUNT(*) as count FROM posts'
    );

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total[0].count,
          hasMore: parseInt(offset) + parseInt(limit) < total[0].count
        }
      }
    });
  } catch (error) {
    console.error('获取贴子列表失败:', error.message, error.stack);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/', authMiddleware, upload.array('images', 9), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: { message: '请输入贴子内容' } });
    }
    if (title && title.trim().length > 100) {
      return res.status(400).json({ success: false, error: { message: '标题不能超过100个字符' } });
    }
    if (content.trim().length > 10000) {
      return res.status(400).json({ success: false, error: { message: '内容不能超过10000个字符' } });
    }

    const tagRegex = /#([^#\s]+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    const images = req.files ? req.files.map(f => `/uploads/posts/${f.filename}`) : [];

    const result = await query(
      `INSERT INTO posts (user_id, content, images, tags) VALUES (?, ?, ?, ?)`,
      [req.user.id, content.trim(), JSON.stringify(images), JSON.stringify(tags)]
    );

    if (title && title.trim()) {
      try {
        await query('UPDATE posts SET title = ? WHERE id = ?', [title.trim(), result.insertId]);
      } catch (e) {
      }
    }

    const post = await query(
      `SELECT p.*, u.username, u.nickname, u.avatar
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data: { post: { ...post[0], is_liked: false } } });
  } catch (error) {
    console.error('创建贴子失败:', error.message, error.stack);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    await ensurePostsTables();
    const postId = req.params.id;
    await query(
      'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)',
      [req.user.id, postId]
    );
    await query('UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?', [postId, postId]);
    const likes = await query('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', [postId]);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: true } });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, error: { message: '点赞失败' } });
  }
});

router.post('/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    await query('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);
    await query('UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?', [postId, postId]);
    const likes = await query('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', [postId]);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: false } });
  } catch (error) {
    console.error('取消点赞失败:', error);
    res.status(500).json({ success: false, error: { message: '取消点赞失败' } });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
    if (post.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (post[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { message: '无权删除' } });
    await query('DELETE FROM post_likes WHERE post_id = ?', [req.params.id]);
    await query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: '贴子已删除' });
  } catch (error) {
    console.error('删除贴子失败:', error);
    res.status(500).json({ success: false, error: { message: '删除失败' } });
  }
});

module.exports = router;
