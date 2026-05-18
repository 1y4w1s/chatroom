const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authMiddleware = async (req, res, next) => {
  const userId = req.query.userId || req.body.userId;
  if (!userId) return res.status(400).json({ success: false, error: { message: '缺少用户 ID' } });
  req.user = { id: parseInt(userId) };
  next();
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/posts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('只允许图片')) });

async function hasCol(table, col) {
  try {
    const [r] = await pool.query(`SELECT COUNT(*) as c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}' AND COLUMN_NAME = '${col}'`);
    return r[0].c > 0;
  } catch (e) { return false; }
}

async function colSql(table, col, def) {
  return (await hasCol(table, col)) ? col : `'${def}' as ${col}`;
}

// ==================== 贴子 API ====================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 20, offset = (page - 1) * limit;
    const titleCol = await colSql('posts', 'title', ''), isPublicCol = await colSql('posts', 'is_public', '1'), allowCommentsCol = await colSql('posts', 'allow_comments', '1');
    let hasLikes = false; try { await pool.query('SELECT 1 FROM post_likes LIMIT 0'); hasLikes = true; } catch (e) {}
    const likedCol = hasLikes ? `EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${req.user.id})` : 'FALSE';
    const [posts] = await pool.query(`SELECT p.id, p.user_id, ${titleCol}, p.content, p.images, p.tags, p.likes_count, p.comments_count, ${isPublicCol}, ${allowCommentsCol}, p.created_at, u.username, u.nickname, u.avatar, ${likedCol} as is_liked FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    const [total] = await pool.query('SELECT COUNT(*) as count FROM posts');
    res.json({ success: true, data: { posts, pagination: { page, limit, total: total[0].count, hasMore: offset + limit < total[0].count } } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const titleCol = await colSql('posts', 'title', ''), isPublicCol = await colSql('posts', 'is_public', '1'), allowCommentsCol = await colSql('posts', 'allow_comments', '1');
    let hasLikes = false; try { await pool.query('SELECT 1 FROM post_likes LIMIT 0'); hasLikes = true; } catch (e) {}
    const likedCol = hasLikes ? `EXISTS (SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ${req.user.id})` : 'FALSE';
    const [posts] = await pool.query(`SELECT p.id, p.user_id, ${titleCol}, p.content, p.images, p.tags, p.likes_count, p.comments_count, ${isPublicCol}, ${allowCommentsCol}, p.created_at, u.username, u.nickname, u.avatar, ${likedCol} as is_liked FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ${parseInt(req.params.id)}`);
    if (posts.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    res.json({ success: true, data: { post: posts[0] } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.post('/', authMiddleware, upload.array('images', 9), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, error: { message: '请输入标题' } });
    if (title.trim().length > 100) return res.status(400).json({ success: false, error: { message: '标题不超过100字符' } });
    if (!content || !content.trim()) return res.status(400).json({ success: false, error: { message: '请输入内容' } });
    if (content.trim().length > 10000) return res.status(400).json({ success: false, error: { message: '内容不超过10000字符' } });
    const tags = []; let m; const re = /#([^#\s]+)/g; while ((m = re.exec(content)) !== null) tags.push(m[1]);
    const images = req.files ? req.files.map(f => `/uploads/posts/${f.filename}`) : [];
    const [result] = await pool.execute('INSERT INTO posts (user_id, content, images, tags) VALUES (?, ?, ?, ?)', [req.user.id, content.trim(), JSON.stringify(images), JSON.stringify(tags)]);
    try { await pool.execute('UPDATE posts SET title = ? WHERE id = ?', [title.trim(), result.insertId]); } catch (e) {}
    const titleCol = await colSql('posts', 'title', ''), isPublicCol = await colSql('posts', 'is_public', '1'), allowCommentsCol = await colSql('posts', 'allow_comments', '1');
    const [post] = await pool.query(`SELECT p.id, p.user_id, ${titleCol}, p.content, p.images, p.tags, p.likes_count, p.comments_count, ${isPublicCol}, ${allowCommentsCol}, p.created_at, u.username, u.nickname, u.avatar, FALSE as is_liked FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ${result.insertId}`);
    res.status(201).json({ success: true, data: { post: post[0] } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const [posts] = await pool.query(`SELECT user_id FROM posts WHERE id = ${parseInt(req.params.id)}`);
    if (posts.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (posts[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { message: '无权编辑' } });
    if (!content || !content.trim()) return res.status(400).json({ success: false, error: { message: '内容不能为空' } });
    if (title && title.trim()) {
      try { await pool.execute('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title.trim(), content.trim(), parseInt(req.params.id)]); } catch (e) {
        await pool.execute('UPDATE posts SET content = ? WHERE id = ?', [content.trim(), parseInt(req.params.id)]);
      }
    } else await pool.execute('UPDATE posts SET content = ? WHERE id = ?', [content.trim(), parseInt(req.params.id)]);
    res.json({ success: true, message: '贴子已更新' });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.patch('/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const { is_public } = req.body;
    const [posts] = await pool.query(`SELECT user_id FROM posts WHERE id = ${parseInt(req.params.id)}`);
    if (posts.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (posts[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { message: '无权操作' } });
    await pool.execute('UPDATE posts SET is_public = ? WHERE id = ?', [is_public ? 1 : 0, parseInt(req.params.id)]);
    res.json({ success: true, message: is_public ? '贴子已设为公开' : '贴子已设为私密' });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.patch('/:id/comments-toggle', authMiddleware, async (req, res) => {
  try {
    const { allow_comments } = req.body;
    const [posts] = await pool.query(`SELECT user_id FROM posts WHERE id = ${parseInt(req.params.id)}`);
    if (posts.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (posts[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { message: '无权操作' } });
    await pool.execute('UPDATE posts SET allow_comments = ? WHERE id = ?', [allow_comments ? 1 : 0, parseInt(req.params.id)]);
    res.json({ success: true, message: allow_comments ? '已开启评论' : '已关闭评论' });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await pool.execute('INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId]);
    await pool.query(`UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ${postId}) WHERE id = ${postId}`);
    const [likes] = await pool.query(`SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${postId}`);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: true } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.post('/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    await pool.execute('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId]);
    await pool.query(`UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ${postId}) WHERE id = ${postId}`);
    const [likes] = await pool.query(`SELECT COUNT(*) as count FROM post_likes WHERE post_id = ${postId}`);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: false } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [posts] = await pool.query(`SELECT user_id FROM posts WHERE id = ${parseInt(req.params.id)}`);
    if (posts.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (posts[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { message: '无权删除' } });
    await pool.query(`DELETE FROM posts WHERE id = ${parseInt(req.params.id)}`);
    res.json({ success: true, message: '贴子已删除' });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

// ==================== 评论 API ====================

// 确保 parent_id 列存在（楼中楼）
async function ensureCommentParentId() {
  try {
    if (!(await hasCol('post_comments', 'parent_id'))) {
      await pool.query('ALTER TABLE post_comments ADD COLUMN parent_id INT DEFAULT NULL AFTER id, ADD COLUMN image VARCHAR(500) DEFAULT NULL AFTER content');
    }
  } catch (e) {}
}

router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    await ensureCommentParentId();
    let hasLikes = false; try { await pool.query('SELECT 1 FROM comment_likes LIMIT 0'); hasLikes = true; } catch (e) {}
    const likedCol = hasLikes ? `EXISTS (SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ${req.user.id})` : 'FALSE';
    const [comments] = await pool.query(`SELECT c.*, u.username, u.nickname, u.avatar, ${likedCol} as is_liked FROM post_comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ${parseInt(req.params.id)} ORDER BY c.created_at ASC`);
    res.json({ success: true, data: { comments } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.post('/:id/comments', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    await ensureCommentParentId();
    const postId = parseInt(req.params.id);
    const { content, parent_id } = req.body;
    if ((!content || !content.trim()) && !req.file) return res.status(400).json({ success: false, error: { message: '请输入评论内容或选择图片' } });
    if (content && content.trim().length > 1000) return res.status(400).json({ success: false, error: { message: '评论不超过1000字符' } });

    const allowCol = await colSql('posts', 'allow_comments', '1');
    const [posts] = await pool.query(`SELECT user_id, ${allowCol} as allow_comments FROM posts WHERE id = ${postId}`);
    if (posts.length === 0) return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    if (!posts[0].allow_comments) return res.status(403).json({ success: false, error: { message: '该贴子已关闭评论' } });

    const image = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const parentId = parent_id ? parseInt(parent_id) : null;

    const [result] = await pool.execute('INSERT INTO post_comments (post_id, user_id, content, image, parent_id) VALUES (?, ?, ?, ?, ?)', [postId, req.user.id, (content || '').trim(), image, parentId]);
    await pool.query(`UPDATE posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ${postId}) WHERE id = ${postId}`);

    let hasLikes = false; try { await pool.query('SELECT 1 FROM comment_likes LIMIT 0'); hasLikes = true; } catch (e) {}
    const [comment] = await pool.query(`SELECT c.*, u.username, u.nickname, u.avatar, ${hasLikes ? 'FALSE' : 'FALSE'} as is_liked FROM post_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ${result.insertId}`);
    res.status(201).json({ success: true, data: { comment: comment[0] } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.post('/comments/:id/like', authMiddleware, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    await pool.execute('INSERT IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [req.user.id, commentId]);
    await pool.query(`UPDATE post_comments SET likes_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = ${commentId}) WHERE id = ${commentId}`);
    const [likes] = await pool.query(`SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ${commentId}`);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: true } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.post('/comments/:id/unlike', authMiddleware, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    await pool.execute('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?', [req.user.id, commentId]);
    await pool.query(`UPDATE post_comments SET likes_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = ${commentId}) WHERE id = ${commentId}`);
    const [likes] = await pool.query(`SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ${commentId}`);
    res.json({ success: true, data: { likes_count: likes[0].count, is_liked: false } });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

router.delete('/comments/:id', authMiddleware, async (req, res) => {
  try {
    const [comments] = await pool.query(`SELECT user_id, post_id FROM post_comments WHERE id = ${parseInt(req.params.id)}`);
    if (comments.length === 0) return res.status(404).json({ success: false, error: { message: '评论不存在' } });
    const [posts] = await pool.query(`SELECT user_id FROM posts WHERE id = ${comments[0].post_id}`);
    const isPostAuthor = posts.length > 0 && posts[0].user_id === req.user.id;
    if (comments[0].user_id !== req.user.id && !isPostAuthor) return res.status(403).json({ success: false, error: { message: '无权删除' } });
    await pool.query(`DELETE FROM post_comments WHERE id = ${parseInt(req.params.id)}`);
    if (comments[0].post_id) await pool.query(`UPDATE posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ${comments[0].post_id}) WHERE id = ${comments[0].post_id}`);
    res.json({ success: true, message: '评论已删除' });
  } catch (error) { res.status(500).json({ success: false, error: { message: error.message } }); }
});

module.exports = router;
