/**
 * 聊天室主服务器
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

// 上传文件目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

const io = socketIo(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6 // 1MB
});

// Socket.io 中间件 - 身份验证
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const { query } = socket.handshake;
  
  if (!token) {
    return next(new Error('认证失败：缺少 Token'));
  }
  
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('认证失败：Token 无效或已过期'));
    }
    socket.user = decoded;
    next();
  });
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`用户连接：${socket.user.username} (${socket.id})`);
  
  // 加入聊天室
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`用户 ${socket.user.username} 加入聊天室 ${roomId}`);
    
    // 通知房间内其他人
    socket.to(roomId).emit('user_joined', {
      userId: socket.user.id,
      username: socket.user.username,
      roomId
    });
  });
  
  // 离开聊天室
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user_left', {
      userId: socket.user.id,
      username: socket.user.username,
      roomId
    });
  });
  
  // 发送消息
  socket.on('send_message', async (data) => {
    const { roomId, content, type } = data;
    
    console.log(`收到消息发送请求：用户 ${socket.user.username} -> 房间 ${roomId}, 内容：${content}`);
    
    // 验证
    if (!roomId || !content) {
      console.error('消息验证失败：缺少 roomId 或 content');
      socket.emit('error', { message: '消息内容不能为空' });
      return;
    }
    
    // 消息验证和过滤
    const MessageService = require('./services/messageService');
    try {
      const message = await MessageService.createMessage({
        roomId,
        senderId: socket.user.id,
        content,
        type: type || 'text'
      });
      
      console.log(`消息创建成功：${message.id}, 广播给房间 ${roomId}`);
      
      // 广播消息给房间内所有人（包括发送者）
      io.to(roomId).emit('new_message', message);
    } catch (error) {
      console.error('发送消息失败:', error);
      socket.emit('error', { message: '发送失败' });
    }
  });
  
  // 输入状态
  socket.on('typing', (roomId) => {
    socket.to(roomId).emit('user_typing', {
      userId: socket.user.id,
      username: socket.user.username,
      roomId
    });
  });
  
  socket.on('stop_typing', (roomId) => {
    socket.to(roomId).emit('user_stop_typing', {
      userId: socket.user.id,
      roomId
    });
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log(`用户断开：${socket.user.username} (${socket.id})`);
    
    // 通知所有房间
    // 实际应用中应该更新用户状态为离线
  });
  
  // 错误处理
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
