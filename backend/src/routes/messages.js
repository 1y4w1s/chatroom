/**
 * 消息路由
 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 简单认证中间件 - 从请求参数获取 userId
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

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// ==================== 路由 ====================

/**
 * POST /api/messages/upload
 * 上传文件/图片
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: '请上传文件' }
      });
    }
    
    const fileUrl = `/uploads/files/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '上传失败' }
    });
  }
});

/**
 * PUT /api/messages/:id
 * 编辑消息
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const messageId = req.params.id;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: '消息内容不能为空' }
      });
    }
    
    const MessageService = require('../services/messageService');
    await MessageService.editMessage(messageId, req.user.id, content);
    
    res.json({
      success: true,
      message: '编辑成功'
    });
  } catch (error) {
    console.error('编辑消息失败:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || '编辑失败' }
    });
  }
});

/**
 * DELETE /api/messages/:id
 * 删除消息
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const MessageService = require('../services/messageService');
    await MessageService.deleteMessage(messageId, req.user.id);
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除失败' }
    });
  }
});

/**
 * POST /api/messages/:id/read
 * 标记消息为已读
 */
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const MessageService = require('../services/messageService');
    await MessageService.markAsRead(messageId, req.user.id);
    
    res.json({
      success: true,
      message: '已标记为已读'
    });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({
      success: false,
      error: { message: '标记失败' }
    });
  }
});

module.exports = router;
