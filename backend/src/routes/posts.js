const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 启动时自动确保 posts 表有 title 列（延迟到首次请求时执行）
let titleColumnReady = false;
async function ensureTitleColumn() {
  if (titleColumnReady) return true;
  try {
    const check = await query(
      `SELECT COUNT(*) as count FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'title'`
    );
    if (check[0].count > 0) {
      titleColumnReady = true;
      return true;
    }
    await query(`ALTER TABLE posts ADD COLUMN title VARCHAR(100) DEFAULT NULL AFTER user_id`);
    console.log('✅ 添加 posts.title 字段成功');
    titleColumnReady = true;
    return true;
  } catch (e) {
    console.log('⚠️ 添加 title 字段跳过:', e.message);
    return false;
  }
}

async function getTitleCol() {
  try {
    await query('SELECT title FROM posts LIMIT 0');
    return 'p.title';
  } catch (e) {
    return 'NULL as title';
  }
}

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

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let isLikedCol = 'FALSE as is_liked';
    try {
      await query('SELECT 1 FROM post_likes LIMIT 0');
      isLikedCol = `EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${parseInt(req.user.id)}) as is_liked`;
    } catch (e) {
    }

    await ensureTitleColumn();

    const titleCol = await getTitleCol();

    const posts = await query(
      `SELECT p.id, p.user_id, ${titleCol}, p.content, p.images, p.tags, p.likes_count, p.comments_count, p.created_at,
              u.username, u.nickname, u.avatar, ${isLikedCol}
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    let totalCount = 0;
    try {
      const total = await query('SELECT COUNT(*) as count FROM posts');
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

    await ensureTitleColumn();

    const tags = [];
    const tagRegex = /#([^#\s]+)/g;
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

    const titleCol = await getTitleCol();

    const post = await query(
      `SELECT p.id, p.user_id, ${titleCol}, p.content, p.images, p.tags, p.likes_count, p.comments_count, p.created_at,
              u.username, u.nickname, u.avatar
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data: { post: { ...post[0], is_liked: false } } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await query('INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId]);
    await query('UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?', [postId, postId]);
    const likes = await query('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', [postId]);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await query('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);
    await query('UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?', [postId, postId]);
    const likes = await query('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', [postId]);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: false } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await query('SELECT user_id FROM posts WHERE id = ?', [parseInt(req.params.id)]);
    if (post.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (post[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { message: '无权删除' } });
    await query('DELETE FROM posts WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ success: true, message: '贴子已删除' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
