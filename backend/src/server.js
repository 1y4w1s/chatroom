/**
 * 聊天室主服务器 v2.1
 * 集成 Express + Socket.io + 安全防护
 */
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// 全局 io 变量，供其他模块使用
let io;

// ==================== 初始化目录 ====================

// 创建上传目录
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ 创建 uploads 目录');
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log('✅ 创建 avatars 目录');
}

// ==================== 安全配置 ====================

// 1. Helmet - 安全 HTTP 头
app.use(helmet({
  contentSecurityPolicy: false, // 开发环境禁用，生产环境需要配置
  crossOriginEmbedderPolicy: false
}));

// 2. CORS - 跨域控制
const corsOptions = {
  origin: true, // 允许所有域名（开发环境）
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 配置信任代理（解决 Railway 的 X-Forwarded-For 警告）
app.set('trust proxy', true);

// 3. 速率限制 - 防止暴力破解
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 个请求
  message: '请求过于频繁，请稍后再试',
  validate: { trustProxy: false } // 禁用 trust proxy 验证
});
app.use('/api/', limiter);

// 4. 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. 数据压缩
app.use(compression());

// 6. 日志记录
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // 只记录错误日志
  }));
}

// 7. XSS 防护
app.use(xss());

// 8. 参数污染防护
app.use(hpp());

// ==================== 静态文件 ====================

// 上传文件目录 - 添加 CORS 和 CORP 支持
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// ==================== 路由 ====================

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/friends', require('./routes/friends'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  
  // 不暴露敏感信息给客户端
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : '服务器内部错误';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: '接口不存在',
      code: 'NOT_FOUND'
    }
  });
});

// ==================== Socket.io 配置 ====================

io = socketIo(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6 // 1MB
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`用户连接：${socket.id}`);
  
  socket.on('join_room', (data) => {
    const { roomId, userId, username } = data;
    socket.join(roomId);
    console.log(`用户 ${username || userId} 加入聊天室 ${roomId}`);
    
    socket.to(roomId).emit('user_joined', { userId, username, roomId });
  });
  
  socket.on('leave_room', (data) => {
    const { roomId, userId, username } = data;
    socket.leave(roomId);
    socket.to(roomId).emit('user_left', { userId, username, roomId });
  });
  
  socket.on('send_message', async (data) => {
    const { roomId, content, type, userId, username } = data;
    
    console.log(`收到消息发送请求：用户 ${username || userId} -> 房间 ${roomId}`);
    
    if (!roomId || !content) {
      socket.emit('error', { message: '消息内容不能为空' });
      return;
    }
    
    const MessageService = require('./services/messageService');
    try {
      const message = await MessageService.createMessage({
        roomId,
        userId: parseInt(userId) || 1,
        content,
        type: type || 'text'
      });
      
      io.to(roomId).emit('new_message', message);
    } catch (error) {
      console.error('发送消息失败:', error);
      socket.emit('error', { message: '发送失败' });
    }
  });
  
  socket.on('typing', (data) => {
    const { roomId, userId, username } = data;
    socket.to(roomId).emit('user_typing', { userId, username, roomId });
  });
  
  socket.on('stop_typing', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('user_stop_typing', { userId, roomId });
  });
  
  socket.on('disconnect', () => {
    console.log(`用户断开：${socket.id}`);
  });
  
  socket.on('error', (error) => {
    console.error('Socket 错误:', error);
  });
});

// ==================== 启动服务器 ====================

const PORT = process.env.PORT || 3000;

// 测试数据库连接
const { testConnection, initDatabase } = require('./config/database');

async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 初始化数据库表结构
    await initDatabase();
    
    // 启动服务器
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║     🚀 聊天室服务器已启动                      ║
╠═══════════════════════════════════════════════╣
║  端口：${PORT}                                  ║
║  环境：${process.env.NODE_ENV || 'development'}                           ║
║  时间：${new Date().toLocaleString('zh-CN')}     ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

// 导出 io 对象，方便其他模块使用
module.exports = { app, getIo: () => io, server };

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });
  
  const { closePool } = require('./config/database');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });
  
  const { closePool } = require('./config/database');
  await closePool();
  process.exit(0);
});
