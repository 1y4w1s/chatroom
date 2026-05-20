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

// 3. 速率限制 - 仅用于敏感接口（登录注册）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: '请求过于频繁，请稍后再试',
  validate: { trustProxy: false }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/posts', require('./routes/posts'));

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
  pingTimeout: 15000,
  pingInterval: 10000,
  maxHttpBufferSize: 1e6 // 1MB
});

// 跟踪用户的连接数（支持多标签页）
const userConnections = new Map();
// 记录用户最后活跃时间（用于心跳检测）
const userLastActive = new Map();

// ==================== 心跳检测机制 ====================
// 每15秒检查一次用户连接状态，将断线用户设置为离线
setInterval(async () => {
  try {
    const now = Date.now();
    const staleTimeout = 25000; // 25秒无活动视为断线
    
    for (const [userId, connections] of userConnections.entries()) {
      if (connections.size === 0) {
        userConnections.delete(userId);
        userLastActive.delete(userId);
        try {
          const { query } = require('./config/database');
          await query('UPDATE users SET status = ? WHERE id = ? AND status != ?', ['offline', userId, 'offline']);
        } catch (e) {}
      }
    }
    
    // 清理过期活跃记录
    for (const [userId, lastActive] of userLastActive.entries()) {
      if (!userConnections.has(userId) || userConnections.get(userId).size === 0) {
        userLastActive.delete(userId);
      }
    }
  } catch (e) {
    console.error('心跳检测错误:', e.message);
  }
}, 30000);

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`用户连接：${socket.id}`);
  
  socket.on('join_room', (data) => {
    const { roomId, userId, username } = data;
    socket.join(roomId);
    socket.userId = userId;
    socket.username = username;
    console.log(`用户 ${username || userId} 加入聊天室 ${roomId}`);
    
    socket.to(roomId).emit('user_joined', { userId, username, roomId });
  });
  
  socket.on('leave_room', (data) => {
    const { roomId, userId, username } = data;
    socket.leave(roomId);
    socket.to(roomId).emit('user_left', { userId, username, roomId });
  });
  
  // 客户端心跳heartbeat，更新活跃时间
  socket.on('heartbeat', () => {
    if (socket.userId) {
      userLastActive.set(socket.userId, Date.now());
      socket.emit('heartbeat_ack');
    }
  });

  // 客户端主动更新在线状态
  socket.on('update_status', async (data) => {
    const { userId, status } = data;
    if (!userId) return;
    
    socket.userId = userId;
    userLastActive.set(userId, Date.now());
    
    // 记录用户连接
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(socket.id);
    
    console.log(`用户 ${userId} 状态更新为: ${status}, 当前连接数: ${userConnections.get(userId).size}`);
    
    // 广播状态变化
    socket.broadcast.emit('user_status_changed', { userId, status });
    
    try {
      const { query } = require('./config/database');
      await query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    } catch (e) {
      console.error('更新用户状态失败:', e.message);
    }
  });
  
  socket.on('send_message', async (data) => {
    const { roomId, content, type, userId, username, file_name, file_size } = data;
    
    console.log(`收到消息发送请求：用户 ${username || userId} -> 房间 ${roomId}, 内容: ${content}`);
    console.log('完整数据:', data);
    
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
        type: type || 'text',
        fileName: file_name,
        fileSize: file_size
      });
      
      console.log('消息创建成功:', message);
      io.to(roomId).emit('new_message', message);
      
      // @全体成员：广播通知给所有在线成员
      if (message.is_at_all) {
        io.to(roomId).emit('at_all_notification', {
          roomId,
          userId: message.user_id,
          username: message.nickname || message.username
        });
      }
      
      // @提及：通知所有客户端刷新未读状态（被@用户可能不在当前房间）
      if (message.is_mention) {
        io.emit('read_status_update', { roomId });
      }
      
      // @DeepSeek 检测：如果消息中包含 @deepseek 或 @DeepSeek，调用 AI 回复
      const contentLower = content.toLowerCase();
      if (contentLower.includes('@deepseek')) {
        // 先检查该聊天室是否启用了机器人
        try {
          const { query } = require('./config/database');
          const roomCheck = await query(
            'SELECT enable_bot FROM chat_rooms WHERE id = ?',
            [roomId]
          );
          if (roomCheck.length > 0 && roomCheck[0].enable_bot) {
            callDeepSeek(roomId, userId, username, content, socket).catch(err => {
              console.error('DeepSeek AI 调用失败:', err.message);
            });
          }
        } catch (e) {
          console.error('检查机器人启用状态失败:', e.message);
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error.message);
      console.error('堆栈:', error.stack);
      socket.emit('error', { message: `发送失败: ${error.message}` });
    }
  });
  
  socket.on('recall_message', (data) => {
    const { roomId, messageId, userId } = data;
    if (roomId && messageId) {
      io.to(roomId).emit('message_recalled', { messageId, roomId, userId });
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
  
  socket.on('disconnect', async () => {
    console.log(`用户断开：${socket.id}`);
    if (socket.userId) {
      // 从连接记录中移除
      const connections = userConnections.get(socket.userId);
      if (connections) {
        connections.delete(socket.id);
        console.log(`用户 ${socket.userId} 剩余连接数: ${connections.size}`);
        
        // 只有当用户没有任何连接时才设置为离线
        if (connections.size === 0) {
          userConnections.delete(socket.userId);
          console.log(`用户 ${socket.userId} 所有连接已断开，设置为离线`);
          socket.broadcast.emit('user_status_changed', { userId: socket.userId, status: 'offline' });
          try {
            const { query } = require('./config/database');
            await query('UPDATE users SET status = ? WHERE id = ?', ['offline', socket.userId]);
          } catch (e) {}
        }
      } else {
        // 没有连接记录，直接设为离线
        socket.broadcast.emit('user_status_changed', { userId: socket.userId, status: 'offline' });
        try {
          const { query } = require('./config/database');
          await query('UPDATE users SET status = ? WHERE id = ?', ['offline', socket.userId]);
        } catch (e) {}
      }
    }
  });
  
  socket.on('error', (error) => {
    console.error('Socket 错误:', error);
  });
});

// ==================== DeepSeek AI 机器人 ====================

/**
 * 获取或创建机器人用户 ID
 */
async function getBotUserId() {
  const { query } = require('./config/database');
  
  // 先尝试查找已存在的机器人账号
  let botUsers;
  try {
    botUsers = await query('SELECT id FROM users WHERE username = ?', ['deepseek']);
  } catch (e) {
    console.error('查找机器人用户失败:', e.message);
  }
  
  if (botUsers && botUsers.length > 0) {
    return botUsers[0].id;
  }
  
  // 没找到则尝试创建机器人账号
  try {
    const { pool } = require('./config/database');
    if (!pool) {
      console.error('数据库连接不可用，无法创建机器人账号');
      return null;
    }
    const hashedPassword = '$2b$10$placeholder';
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, nickname, is_bot) VALUES (?, ?, ?, ?, TRUE)',
      ['deepseek', 'bot@deepseek.ai', hashedPassword, 'DeepSeek AI']
    );
    console.log('✅ 动态创建 DeepSeek 机器人账号，ID:', result.insertId);
    return result.insertId;
  } catch (e) {
    console.error('创建机器人账号失败:', e.message);
    return null;
  }
}

/**
 * 调用 DeepSeek API 获取 AI 回复
 */
async function callDeepSeek(roomId, userId, username, userContent, socket) {
  const API_KEY = process.env.DEEPSEEK_API_KEY;
  
  if (!API_KEY) {
    console.error('DeepSeek API Key 未配置');
    return;
  }
  
  // 获取机器人用户 ID（如果获取不到则放弃发送）
  const botUserId = await getBotUserId();
  if (!botUserId) {
    console.error('无法获取机器人用户 ID，放弃回复');
    return;
  }
  
  // 构造发送者标识
  const senderName = username || `用户${userId}`;
  
  // 调用 DeepSeek API
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个友好的聊天机器人，名叫DeepSeek。请用中文回复，保持简洁有趣的风格。' },
          { role: 'user', content: userContent }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API 响应错误:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    // 保存机器人消息到数据库
    const MessageService = require('./services/messageService');
    const botMessage = await MessageService.createMessage({
      roomId,
      userId: botUserId,
      content: reply,
      type: 'text'
    });
    
    // 广播机器人消息到聊天室（io 是模块级变量，直接使用）
    io.to(roomId).emit('new_message', botMessage);
    
    console.log(`DeepSeek AI 回复消息已发送到房间 ${roomId}`);
  } catch (error) {
    console.error('调用 DeepSeek API 失败:', error.message);
  }
}

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
