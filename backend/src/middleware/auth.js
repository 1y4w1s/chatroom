/**
 * JWT 认证中间件
 * 提供 Token 生成和验证功能
 */
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// JWT 密钥（生产环境应从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 天有效期

/**
 * 生成 JWT Token
 * @param {Object} user - 用户对象
 * @returns {string} JWT Token
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * 验证 JWT Token（内部使用，不作为中间件）
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的数据或 null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中提取 Token
 * 支持 Authorization: Bearer <token> 或 token 参数
 */
function extractToken(req) {
  // 优先从 Authorization 头获取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 备用：从 query 或 body 获取（兼容旧方式）
  return req.query.token || req.body.token;
}

/**
 * 认证中间件（标准版）
 * 验证 Token 并将用户信息挂载到 req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: '未提供认证令牌' }
      });
    }
    
    // 验证 Token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: { message: '令牌无效或已过期' }
      });
    }
    
    // 查询用户信息并检查状态
    const users = await query(
      'SELECT id, username, email, nickname, avatar, status, is_banned FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: '用户不存在' }
      });
    }
    
    const user = users[0];
    
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        error: { message: '账号已被禁用' }
      });
    }
    
    // 将用户信息挂载到 req.user
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      status: user.status
    };
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      error: { message: '认证失败' }
    });
  }
};

/**
 * 可选认证中间件
 * 如果有 Token 则验证并挂载用户信息，没有则继续
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return next();
    }
    
    const users = await query(
      'SELECT id, username, email, nickname, avatar, status, is_banned FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length > 0 && !users[0].is_banned) {
      req.user = {
        id: users[0].id,
        username: users[0].username,
        email: users[0].email,
        nickname: users[0].nickname,
        avatar: users[0].avatar,
        status: users[0].status
      };
    }
    
    next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  authenticate,
  optionalAuth,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
