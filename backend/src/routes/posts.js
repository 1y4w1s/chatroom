const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

// ==================== 输入验证规则 ====================

// 贴子 ID 验证
const validatePostId = [
  param('id').isInt({ min: 1 }).withMessage('无效的贴子 ID').toInt()
];

// 评论 ID 验证
const validateCommentId = [
  param('id').isInt({ min: 1 }).withMessage('无效的评论 ID').toInt()
];

// 贴子内容验证
const validatePostContent = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('标题不超过100字符'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 10000 }).withMessage('内容不超过10000字符')
];

// 评论内容验证
const validateCommentContent = [
  body('content')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('评论不超过1000字符')
];

// 分页参数验证
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码至少为1').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量1-100').toInt()
];

// ==================== 文件上传配置 ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/posts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    cb(null, safeName + ext);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('只允许图片文件'), false);
      return;
    }
    cb(null, true);
  }
});

// ==================== 辅助函数 ====================

// 检查表是否存在指定列
async function hasCol(table, col) {
  try {
    const [r] = await pool.execute(
      `SELECT COUNT(*) as c FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, col]
    );
    return r[0].c > 0;
  } catch (e) { 
    return false; 
  }
}

// 安全获取列名（避免 SQL 注入）
async function getColumnName(table, col, defaultValue) {
  const validColumns = ['title', 'is_public', 'allow_comments'];
  if (!validColumns.includes(col)) {
    // 直接返回字符串字面量，避免参数绑定问题
    if (typeof defaultValue === 'string') {
      return `'' as ${col}`;
    }
    return `${defaultValue} as ${col}`;
  }
  const exists = await hasCol(table, col);
  if (exists) {
    return col;
  }
  // 列不存在，返回默认值作为字面量
  if (typeof defaultValue === 'string') {
    return `'' as ${col}`;
  }
  return `${defaultValue} as ${col}`;
}

// ==================== 贴子 API ====================

/**
 * GET /api/posts
 * 获取贴子列表
 */
router.get('/', validatePagination, authenticate, async (req, res) => {
  try {
    // 验证分页参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100); // 最多100条
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // 动态获取列名
    const titleCol = await getColumnName('posts', 'title', '');
    const isPublicCol = await getColumnName('posts', 'is_public', 1);
    const allowCommentsCol = await getColumnName('posts', 'allow_comments', 1);

    // 检查 post_likes 表是否存在
    let hasLikes = false;
    try {
      await pool.execute('SELECT 1 FROM post_likes LIMIT 1');
      hasLikes = true;
    } catch (e) {}

    // 完全不使用参数绑定，直接拼接所有值
    if (hasLikes) {
      const [posts] = await pool.execute(`
        SELECT p.id, p.user_id, p.title, p.content, p.images, p.tags, 
               p.likes_count, p.comments_count, 
               p.created_at, u.username, u.nickname, u.avatar, 
               CASE WHEN pl.post_id IS NOT NULL THEN TRUE ELSE FALSE END as is_liked 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.user_id = ${userId}
        ORDER BY p.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `);
      const [[{ count: total }]] = await pool.execute('SELECT COUNT(*) as count FROM posts');

      res.json({ 
        success: true, 
        data: { 
          posts, 
          pagination: { 
            page, 
            limit, 
            total, 
            hasMore: offset + posts.length < total 
          } 
        } 
      });
    } else {
      const [posts] = await pool.execute(`
        SELECT p.id, p.user_id, p.title, p.content, p.images, p.tags, 
               p.likes_count, p.comments_count, 
               p.created_at, u.username, u.nickname, u.avatar, 
               FALSE as is_liked 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `);
      const [[{ count: total }]] = await pool.execute('SELECT COUNT(*) as count FROM posts');

      res.json({ 
        success: true, 
        data: { 
          posts, 
          pagination: { 
            page, 
            limit, 
            total, 
            hasMore: offset + posts.length < total 
          } 
        } 
      });
    }
  } catch (error) { 
    console.error('获取贴子列表失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * GET /api/posts/:id
 * 获取贴子详情
 */
router.get('/:id', validatePostId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    const titleCol = await getColumnName('posts', 'title', '');
    const isPublicCol = await getColumnName('posts', 'is_public', 1);
    const allowCommentsCol = await getColumnName('posts', 'allow_comments', 1);

    let hasLikes = false;
    try {
      await pool.execute('SELECT 1 FROM post_likes LIMIT 1');
      hasLikes = true;
    } catch (e) {}

    let likedSubquery = 'FALSE';
    if (hasLikes) {
      likedSubquery = `IFNULL((SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?), FALSE)`;
    }

    const sql = `
      SELECT p.id, p.user_id, ${titleCol}, p.content, p.images, p.tags, 
             p.likes_count, p.comments_count, ${isPublicCol}, ${allowCommentsCol}, 
             p.created_at, u.username, u.nickname, u.avatar, 
             ${likedSubquery} as is_liked 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `;

    const [posts] = await pool.execute(sql, hasLikes ? [userId, postId] : [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    }
    
    res.json({ success: true, data: { post: posts[0] } });
  } catch (error) { 
    console.error('获取贴子详情失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * POST /api/posts
 * 创建贴子
 */
router.post('/', validatePostContent, authenticate, upload.array('images', 9), async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    // 验证必填字段
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: { message: '请输入标题' } });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: { message: '请输入内容' } });
    }

    // 提取标签
    const tags = [];
    let match;
    const tagRegex = /#([^#\s]{1,30})/g; // 最多30字符
    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    const images = req.files ? req.files.map(f => `/uploads/posts/${f.filename}`) : [];

    // 插入贴子
    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, title, content, images, tags) VALUES (?, ?, ?, ?, ?)',
      [userId, title.trim(), content.trim(), JSON.stringify(images), JSON.stringify(tags)]
    );

    const postId = result.insertId;

    // 获取刚创建的贴子
    const titleCol = await getColumnName('posts', 'title', '');
    const isPublicCol = await getColumnName('posts', 'is_public', 1);
    const allowCommentsCol = await getColumnName('posts', 'allow_comments', 1);

    const [[post]] = await pool.execute(
      `SELECT p.id, p.user_id, ${titleCol}, p.content, p.images, p.tags, 
              p.likes_count, p.comments_count, ${isPublicCol}, ${allowCommentsCol}, 
              p.created_at, u.username, u.nickname, u.avatar, FALSE as is_liked 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [postId]
    );

    res.status(201).json({ success: true, data: { post } });
  } catch (error) { 
    console.error('创建贴子失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * PUT /api/posts/:id
 * 更新贴子
 */
router.put('/:id', [...validatePostId, ...validatePostContent], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;
    const { title, content } = req.body;

    // 检查贴子是否存在且属于当前用户
    const [[post]] = await pool.execute(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    }
    if (post.user_id !== userId) {
      return res.status(403).json({ success: false, error: { message: '无权编辑' } });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: { message: '内容不能为空' } });
    }

    // 检查是否支持 title 列
    const hasTitle = await hasCol('posts', 'title');

    if (hasTitle && title && title.trim()) {
      await pool.execute(
        'UPDATE posts SET title = ?, content = ? WHERE id = ?',
        [title.trim(), content.trim(), postId]
      );
    } else {
      await pool.execute(
        'UPDATE posts SET content = ? WHERE id = ?',
        [content.trim(), postId]
      );
    }

    res.json({ success: true, message: '贴子已更新' });
  } catch (error) { 
    console.error('更新贴子失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * PATCH /api/posts/:id/visibility
 * 设置贴子可见性
 */
router.patch('/:id/visibility', [
  ...validatePostId,
  body('is_public').isBoolean().withMessage('is_public 必须是布尔值')
], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;
    const isPublic = req.body.is_public === true || req.body.is_public === 'true';

    // 检查贴子是否存在且属于当前用户
    const [[post]] = await pool.execute(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    }
    if (post.user_id !== userId) {
      return res.status(403).json({ success: false, error: { message: '无权操作' } });
    }

    // 检查是否支持 is_public 列
    if (await hasCol('posts', 'is_public')) {
      await pool.execute(
        'UPDATE posts SET is_public = ? WHERE id = ?',
        [isPublic ? 1 : 0, postId]
      );
    }

    res.json({ success: true, message: isPublic ? '贴子已设为公开' : '贴子已设为私密' });
  } catch (error) { 
    console.error('设置可见性失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * PATCH /api/posts/:id/comments-toggle
 * 开关评论
 */
router.patch('/:id/comments-toggle', [
  ...validatePostId,
  body('allow_comments').isBoolean().withMessage('allow_comments 必须是布尔值')
], authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;
    const allowComments = req.body.allow_comments === true || req.body.allow_comments === 'true';

    // 检查贴子是否存在且属于当前用户
    const [[post]] = await pool.execute(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    }
    if (post.user_id !== userId) {
      return res.status(403).json({ success: false, error: { message: '无权操作' } });
    }

    // 检查是否支持 allow_comments 列
    if (await hasCol('posts', 'allow_comments')) {
      await pool.execute(
        'UPDATE posts SET allow_comments = ? WHERE id = ?',
        [allowComments ? 1 : 0, postId]
      );
    }

    res.json({ success: true, message: allowComments ? '已开启评论' : '已关闭评论' });
  } catch (error) { 
    console.error('设置评论开关失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * POST /api/posts/:id/like
 * 点赞
 */
router.post('/:id/like', validatePostId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    // 检查贴子是否存在
    const [[post]] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    }

    // 使用 INSERT IGNORE 避免重复点赞
    await pool.execute(
      'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)',
      [userId, postId]
    );

    // 更新点赞数
    await pool.execute(
      'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?',
      [postId, postId]
    );

    // 获取最新点赞数
    const [[{ count: likesCount }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
      [postId]
    );

    res.json({ success: true, data: { likes_count: likesCount, is_liked: true } });
  } catch (error) { 
    console.error('点赞失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * POST /api/posts/:id/unlike
 * 取消点赞
 */
router.post('/:id/unlike', validatePostId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    // 更新点赞数
    await pool.execute(
      'UPDATE posts SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) WHERE id = ?',
      [postId, postId]
    );

    // 获取最新点赞数
    const [[{ count: likesCount }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
      [postId]
    );

    res.json({ success: true, data: { likes_count: likesCount, is_liked: false } });
  } catch (error) { 
    console.error('取消点赞失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * DELETE /api/posts/:id
 * 删除贴子
 */
router.delete('/:id', validatePostId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    const [[post]] = await pool.execute(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    }
    if (post.user_id !== userId) {
      return res.status(403).json({ success: false, error: { message: '无权删除' } });
    }

    await pool.execute('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ success: true, message: '贴子已删除' });
  } catch (error) { 
    console.error('删除贴子失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

// ==================== 评论 API ====================

// 确保评论表有必要的列
async function ensureCommentColumns() {
  try {
    if (!(await hasCol('post_comments', 'parent_id'))) {
      await pool.execute(
        'ALTER TABLE post_comments ADD COLUMN parent_id INT DEFAULT NULL AFTER id'
      );
    }
    if (!(await hasCol('post_comments', 'image'))) {
      await pool.execute(
        'ALTER TABLE post_comments ADD COLUMN image VARCHAR(500) DEFAULT NULL AFTER content'
      );
    }
  } catch (e) {
    console.error('确保评论列失败:', e);
  }
}

/**
 * GET /api/posts/:id/comments
 * 获取评论列表
 */
router.get('/:id/comments', validatePostId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    await ensureCommentColumns();

    // 检查 comment_likes 表
    let hasLikes = false;
    try {
      await pool.execute('SELECT 1 FROM comment_likes LIMIT 1');
      hasLikes = true;
    } catch (e) {}

    let likedSubquery = 'FALSE';
    if (hasLikes) {
      likedSubquery = `IFNULL((SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?), FALSE)`;
    }

    const sql = `
      SELECT c.*, u.username, u.nickname, u.avatar, ${likedSubquery} as is_liked 
      FROM post_comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = ? 
      ORDER BY c.created_at ASC
    `;

    const [comments] = await pool.execute(sql, hasLikes ? [userId, postId] : [postId]);
    res.json({ success: true, data: { comments } });
  } catch (error) { 
    console.error('获取评论失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * POST /api/posts/:id/comments
 * 添加评论
 */
router.post('/:id/comments', validatePostId, authenticate, upload.single('image'), async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { content, parent_id } = req.body;

    // 验证内容
    if ((!content || !content.trim()) && !req.file) {
      return res.status(400).json({ success: false, error: { message: '请输入评论内容或选择图片' } });
    }
    if (content && content.trim().length > 1000) {
      return res.status(400).json({ success: false, error: { message: '评论不超过1000字符' } });
    }

    // 检查贴子是否存在
    const [[post]] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, error: { message: '贴子不存在' } });
    }

    // 检查是否允许评论
    if (await hasCol('posts', 'allow_comments')) {
      const [[postWithCommentSetting]] = await pool.execute(
        'SELECT allow_comments FROM posts WHERE id = ?',
        [postId]
      );
      if (postWithCommentSetting && postWithCommentSetting.allow_comments === 0) {
        return res.status(403).json({ success: false, error: { message: '该贴子已关闭评论' } });
      }
    }

    await ensureCommentColumns();

    const image = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const parentId = parent_id ? parseInt(parent_id, 10) : null;

    const [result] = await pool.execute(
      'INSERT INTO post_comments (post_id, user_id, content, image, parent_id) VALUES (?, ?, ?, ?, ?)',
      [postId, userId, (content || '').trim(), image, parentId]
    );

    // 更新评论数
    await pool.execute(
      'UPDATE posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ?) WHERE id = ?',
      [postId, postId]
    );

    // 获取刚创建的评论
    const [[comment]] = await pool.execute(
      `SELECT c.*, u.username, u.nickname, u.avatar, FALSE as is_liked 
       FROM post_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) { 
    console.error('添加评论失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * POST /api/posts/comments/:id/like
 * 评论点赞
 */
router.post('/comments/:id/like', validateCommentId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const commentId = req.params.id;
    const userId = req.user.id;

    // 检查评论是否存在
    const [[comment]] = await pool.execute('SELECT id FROM post_comments WHERE id = ?', [commentId]);
    if (!comment) {
      return res.status(404).json({ success: false, error: { message: '评论不存在' } });
    }

    await pool.execute(
      'INSERT IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
      [userId, commentId]
    );

    await pool.execute(
      'UPDATE post_comments SET likes_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = ?) WHERE id = ?',
      [commentId, commentId]
    );

    const [[{ count: likesCount }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );

    res.json({ success: true, data: { likes_count: likesCount, is_liked: true } });
  } catch (error) { 
    console.error('评论点赞失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * POST /api/posts/comments/:id/unlike
 * 取消评论点赞
 */
router.post('/comments/:id/unlike', validateCommentId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const commentId = req.params.id;
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
      [userId, commentId]
    );

    await pool.execute(
      'UPDATE post_comments SET likes_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = ?) WHERE id = ?',
      [commentId, commentId]
    );

    const [[{ count: likesCount }]] = await pool.execute(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );

    res.json({ success: true, data: { likes_count: likesCount, is_liked: false } });
  } catch (error) { 
    console.error('取消评论点赞失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

/**
 * DELETE /api/posts/comments/:id
 * 删除评论
 */
router.delete('/comments/:id', validateCommentId, authenticate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const commentId = req.params.id;
    const userId = req.user.id;

    // 获取评论信息
    const [[comment]] = await pool.execute(
      'SELECT user_id, post_id FROM post_comments WHERE id = ?',
      [commentId]
    );

    if (!comment) {
      return res.status(404).json({ success: false, error: { message: '评论不存在' } });
    }

    // 检查权限：评论作者或贴子作者可以删除
    const [[post]] = await pool.execute('SELECT user_id FROM posts WHERE id = ?', [comment.post_id]);
    const isPostAuthor = post && post.user_id === userId;

    if (comment.user_id !== userId && !isPostAuthor) {
      return res.status(403).json({ success: false, error: { message: '无权删除' } });
    }

    await pool.execute('DELETE FROM post_comments WHERE id = ?', [commentId]);

    // 更新评论数
    if (comment.post_id) {
      await pool.execute(
        'UPDATE posts SET comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = ?) WHERE id = ?',
        [comment.post_id, comment.post_id]
      );
    }

    res.json({ success: true, message: '评论已删除' });
  } catch (error) { 
    console.error('删除评论失败:', error);
    res.status(500).json({ success: false, error: { message: '服务器错误' } }); 
  }
});

module.exports = router;
