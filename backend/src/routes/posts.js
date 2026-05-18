const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
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

// 直接用 pool.query（非预处理）避免参数数量不匹配问题
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let hasLikesTable = false;
    try {
      await pool.execute('SELECT 1 FROM post_likes LIMIT 0');
      hasLikesTable = true;
    } catch (e) {
    }

    const sql = `SELECT p.id, p.user_id, p.content, p.images, p.tags, p.likes_count, p.comments_count, p.created_at,
                        u.username, u.nickname, u.avatar
                        ${hasLikesTable ? `, EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${req.user.id}) as is_liked` : ', FALSE as is_liked'}
                 FROM posts p
                 JOIN users u ON p.user_id = u.id
                 ORDER BY p.created_at DESC
                 LIMIT ${limit} OFFSET ${offset}`;

    const [posts] = await pool.query(sql);

    let totalCount = 0;
    try {
      const [total] = await pool.query('SELECT COUNT(*) as count FROM posts');
      totalCount = total[0].count;
    } catch (e) {
    }

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore: offset + limit < totalCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/', authMiddleware, upload.array('images', 9), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: { message: '请输入标题' } });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ success: false, error: { message: '标题不能超过100个字符' } });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: { message: '请输入贴子内容' } });
    }
    if (content.trim().length > 10000) {
      return res.status(400).json({ success: false, error: { message: '内容不能超过10000个字符' } });
    }

    const tags = [];
    const tagRegex = /#([^#\s]+)/g;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    const images = req.files ? req.files.map(f => `/uploads/posts/${f.filename}`) : [];

    const [result] = await pool.execute(
      `INSERT INTO posts (user_id, content, images, tags) VALUES (?, ?, ?, ?)`,
      [req.user.id, content.trim(), JSON.stringify(images), JSON.stringify(tags)]
    );

    if (title && title.trim()) {
      try {
        await pool.execute('UPDATE posts SET title = ? WHERE id = ?', [title.trim(), result.insertId]);
      } catch (e) {
      }
    }

    const [posts] = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.images, p.tags, p.likes_count, p.comments_count, p.created_at,
              u.username, u.nickname, u.avatar, FALSE as is_liked
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.id = ${result.insertId}`
    );

    res.status(201).json({ success: true, data: { post: posts[0] } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await pool.execute('INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId]);
    await pool.query(`UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ${postId}) WHERE id = ${postId}`);
    const [likes] = await pool.query(`SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${postId}`);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await pool.execute('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);
    await pool.query(`UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ${postId}) WHERE id = ${postId}`);
    const [likes] = await pool.query(`SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${postId}`);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: false } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [posts] = await pool.query(`SELECT user_id FROM posts WHERE id = ${parseInt(req.params.id)}`);
    if (posts.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (posts[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { message: '无权删除' } });
    await pool.query(`DELETE FROM posts WHERE id = ${parseInt(req.params.id)}`);
    res.json({ success: true, message: '贴子已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
