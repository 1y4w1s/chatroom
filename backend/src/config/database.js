/**
 * 数据库配置模块
 * 使用连接池提高性能
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'chatroom',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'chatroom_db',
  waitForConnections: true,
  connectionLimit: 10, // 最大连接数
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+08:00', // 东八区时间
  supportBigNumbers: true,
  bigNumberStrings: true
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功！');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 初始化数据库表结构
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('正在初始化数据库表结构...');
    
    // 创建用户表（包含所有字段）
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nickname VARCHAR(50) DEFAULT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        signature VARCHAR(200) DEFAULT NULL,
        status ENUM('online', 'offline', 'away') DEFAULT 'offline',
        is_banned BOOLEAN DEFAULT FALSE,
        ban_reason VARCHAR(255) DEFAULT NULL,
        is_bot BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ users 表已创建');
    
    // 添加缺失的字段（如果表已存在）
    try {
      // 检查并添加 nickname 字段
      const hasNickname = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nickname'
      `);
      if (hasNickname[0].count === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN nickname VARCHAR(50) DEFAULT NULL`);
        console.log('✅ 添加 nickname 字段');
      }
      
      // 检查并添加 signature 字段
      const hasSignature = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'signature'
      `);
      if (hasSignature[0].count === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN signature VARCHAR(200) DEFAULT NULL`);
        console.log('✅ 添加 signature 字段');
      }
      
      // 检查并添加 status 字段
      const hasStatus = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
      `);
      if (hasStatus[0].count === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN status ENUM('online', 'offline', 'away', 'invisible') DEFAULT 'offline'`);
        console.log('✅ 添加 status 字段');
      } else {
        // 确保 invisible 在枚举中
        const statusCol = await connection.query(`
          SELECT COLUMN_TYPE FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
        `);
        if (statusCol[0] && !statusCol[0].COLUMN_TYPE.includes('invisible')) {
          await connection.query(`ALTER TABLE users MODIFY COLUMN status ENUM('online', 'offline', 'away', 'invisible') DEFAULT 'offline'`);
          console.log('✅ 更新 status 字段，添加 invisible');
        }
      }
      
      // 检查并添加 is_banned 字段
      const hasIsBanned = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_banned'
      `);
      if (hasIsBanned[0].count === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE`);
        console.log('✅ 添加 is_banned 字段');
      }
      
      // 检查并添加 ban_reason 字段
      const hasBanReason = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'ban_reason'
      `);
      if (hasBanReason[0].count === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN ban_reason VARCHAR(255) DEFAULT NULL`);
        console.log('✅ 添加 ban_reason 字段');
      }
      
      console.log('✅ users 表字段已更新');
    } catch (err) {
      console.log('⚠️ users 表字段更新跳过:', err.message);
    }
    
    // 独立处理 is_bot 字段迁移（不依赖前面的 migration 代码）
    try {
      const hasIsBot = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_bot'
      `);
      if (hasIsBot[0].count === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN is_bot BOOLEAN DEFAULT FALSE`);
        console.log('✅ 添加 is_bot 字段');
      }
    } catch (err) {
      console.log('⚠️ is_bot 字段迁移跳过:', err.message);
    }
    
    // 独立处理 last_login_at 字段迁移
    try {
      const hasLastLoginAt = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_at'
      `);
      if (hasLastLoginAt[0].count === 0) {
        await connection.query(`ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL`);
        console.log('✅ 添加 last_login_at 字段');
      }
      
      console.log('✅ users 表字段已更新');
    } catch (err) {
      console.log('⚠️ users 表字段更新跳过:', err.message);
    }
    
    // 创建聊天室表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        max_members INT DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ rooms 表已创建');
    
    // 给 rooms/chat_rooms 表添加缺失字段
    try {
      // 检查实际表名（兼容 rooms 和 chat_rooms）
      const tableNameResult = await connection.query(`
        SELECT TABLE_NAME FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('rooms', 'chat_rooms')
        ORDER BY TABLE_NAME DESC LIMIT 1
      `);
      const roomTable = tableNameResult[0]?.TABLE_NAME || 'rooms';
      
      // 检查并添加 avatar 字段
      const hasRoomAvatar = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'avatar'
      `, [roomTable]);
      if (hasRoomAvatar[0].count === 0) {
        await connection.query(`ALTER TABLE ?? ADD COLUMN avatar VARCHAR(255) DEFAULT NULL`, [roomTable]);
        console.log(`✅ 添加 ${roomTable}.avatar 字段`);
      }
      
      // 检查并添加 announcement 字段
      const hasAnnouncement = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'announcement'
      `, [roomTable]);
      if (hasAnnouncement[0].count === 0) {
        await connection.query(`ALTER TABLE ?? ADD COLUMN announcement TEXT DEFAULT NULL`, [roomTable]);
        console.log(`✅ 添加 ${roomTable}.announcement 字段`);
      }
      
      // 检查并添加 type 字段
      const hasType = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'type'
      `, [roomTable]);
      if (hasType[0].count === 0) {
        await connection.query(`ALTER TABLE ?? ADD COLUMN type ENUM('public', 'private') DEFAULT 'public'`, [roomTable]);
        console.log(`✅ 添加 ${roomTable}.type 字段`);
      }
      
      // 检查并添加 owner_id 字段
      const hasOwnerId = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'owner_id'
      `, [roomTable]);
      if (hasOwnerId[0].count === 0) {
        await connection.query(`ALTER TABLE ?? ADD COLUMN owner_id INT DEFAULT NULL`, [roomTable]);
        console.log(`✅ 添加 ${roomTable}.owner_id 字段`);
      }
      
      // 检查并添加 is_active 字段
      const hasIsActive = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'is_active'
      `, [roomTable]);
      if (hasIsActive[0].count === 0) {
        await connection.query(`ALTER TABLE ?? ADD COLUMN is_active BOOLEAN DEFAULT TRUE`, [roomTable]);
        console.log(`✅ 添加 ${roomTable}.is_active 字段`);
      }
      
      // 检查并添加 enable_bot 字段
      const hasEnableBot = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'enable_bot'
      `, [roomTable]);
      if (hasEnableBot[0].count === 0) {
        await connection.query(`ALTER TABLE ?? ADD COLUMN enable_bot BOOLEAN DEFAULT FALSE`, [roomTable]);
        console.log(`✅ 添加 ${roomTable}.enable_bot 字段`);
      }
    } catch (err) {
      console.log('⚠️ rooms 表字段更新跳过:', err.message);
    }
    
    // 创建好友关系表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        status ENUM('pending', 'accepted') DEFAULT 'accepted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ friendships 表已创建');
    
    // 创建好友申请表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT DEFAULT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP NULL,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ friend_requests 表已创建');
    
    // 创建通知表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('friend_request', 'friend_accepted', 'room_invite') NOT NULL,
        from_user_id INT DEFAULT NULL,
        room_id INT DEFAULT NULL,
        message TEXT DEFAULT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ notifications 表已创建');
    
    // 创建贴子表
    await connection.query(`
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
    console.log('✅ posts 表已创建');
    
    // 创建贴子点赞表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ post_likes 表已创建');
    
    // 创建消息表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        type ENUM('text', 'image', 'file') DEFAULT 'text',
        file_url VARCHAR(255) DEFAULT NULL,
        file_name VARCHAR(255) DEFAULT NULL,
        file_size BIGINT DEFAULT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ messages 表已创建');
    
    // 添加缺失的字段到已有的messages表
    try {
      // 检查并添加 file_url 字段
      const hasFileUrl = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'file_url'
      `);
      if (hasFileUrl[0].count === 0) {
        await connection.query(`ALTER TABLE messages ADD COLUMN file_url VARCHAR(255) DEFAULT NULL`);
        console.log('✅ 添加 file_url 字段');
      }
      
      // 检查并添加 file_name 字段
      const hasFileName = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'file_name'
      `);
      if (hasFileName[0].count === 0) {
        await connection.query(`ALTER TABLE messages ADD COLUMN file_name VARCHAR(255) DEFAULT NULL`);
        console.log('✅ 添加 file_name 字段');
      }
      
      // 检查并添加 file_size 字段
      const hasFileSize = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'file_size'
      `);
      if (hasFileSize[0].count === 0) {
        await connection.query(`ALTER TABLE messages ADD COLUMN file_size BIGINT DEFAULT NULL`);
        console.log('✅ 添加 file_size 字段');
      }
      
      // 检查并添加 is_deleted 字段
      const hasIsDeleted = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'is_deleted'
      `);
      if (hasIsDeleted[0].count === 0) {
        await connection.query(`ALTER TABLE messages ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE`);
        console.log('✅ 添加 is_deleted 字段');
      }
      
      // 检查并添加 is_edited 字段
      const hasIsEdited = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'is_edited'
      `);
      if (hasIsEdited[0].count === 0) {
        await connection.query(`ALTER TABLE messages ADD COLUMN is_edited BOOLEAN DEFAULT FALSE`);
        console.log('✅ 添加 is_edited 字段');
      }
      
      // 检查并添加 edited_at 字段
      const hasEditedAt = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'edited_at'
      `);
      if (hasEditedAt[0].count === 0) {
        await connection.query(`ALTER TABLE messages ADD COLUMN edited_at TIMESTAMP NULL`);
        console.log('✅ 添加 edited_at 字段');
      }
      
      console.log('✅ messages 表字段已更新');
    } catch (err) {
      console.log('⚠️ messages 表字段更新跳过:', err.message);
    }
    
    // 创建公告表
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS announcements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          room_id INT NOT NULL,
          user_id INT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ announcements 表已创建');
    } catch (err) {
      console.log('⚠️ announcements 表创建失败:', err.message);
    }
    
    // 检查 posts 表是否有 title 字段
    try {
      const hasPostTitle = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'title'
      `);
      if (hasPostTitle[0].count === 0) {
        await connection.query(`ALTER TABLE posts ADD COLUMN title VARCHAR(100) DEFAULT NULL AFTER user_id`);
        console.log('✅ 添加 posts.title 字段');
      }
    } catch (err) {
      console.log('⚠️ posts 表字段更新跳过:', err.message);
    }
    
    // 创建聊天室成员表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS room_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role ENUM('member', 'admin', 'owner') DEFAULT 'member',
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_room_user (room_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ room_members 表已创建');
    
    // 创建敏感词表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sensitive_words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(100) NOT NULL,
        replacement VARCHAR(100) DEFAULT '*',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ sensitive_words 表已创建');
    
    // 创建消息已读状态表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS room_read_status (
        user_id INT NOT NULL,
        room_id INT NOT NULL,
        last_read_message_id INT DEFAULT 0,
        is_mentioned BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, room_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ room_read_status 表已创建');
    
    // 给 messages 表添加 is_mention 字段
    try {
      const hasIsMention = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'is_mention'
      `);
      if (hasIsMention[0].count === 0) {
        await connection.query(`ALTER TABLE messages ADD COLUMN is_mention BOOLEAN DEFAULT FALSE`);
        console.log('✅ 添加 messages.is_mention 字段');
      }
    } catch (err) {
      console.log('⚠️ messages 字段更新跳过:', err.message);
    }
    
    // 插入默认聊天室（如果不存在）
    try {
      await connection.query(`
        INSERT INTO rooms (name, description, max_members) VALUES
        ('公共聊天室', '欢迎大家！请文明交流~', 100),
        ('技术交流', '编程、技术讨论专区', 50),
        ('休闲娱乐', '灌水、摸鱼专区', 50),
        ('音乐分享', '分享你喜欢的音乐', 50)
      `);
      console.log('✅ 默认聊天室已创建');
    } catch (err) {
      console.log('⚠️ 默认聊天室已存在，跳过');
    }
    
    // 创建 DeepSeek 机器人账号（如果不存在）
    try {
      const [botUserRows] = await connection.query(
        'SELECT id FROM users WHERE username = ?',
        ['deepseek']
      );
      if (botUserRows.length === 0) {
        const hashedPassword = '$2b$10$placeholder'; // 占位密码，无法用于登录
        await connection.query(
          'INSERT INTO users (username, email, password_hash, nickname, is_bot) VALUES (?, ?, ?, ?, TRUE)',
          ['deepseek', 'bot@deepseek.ai', hashedPassword, 'DeepSeek AI']
        );
        console.log('✅ 创建 DeepSeek 机器人账号');
      } else {
        console.log('⚠️ 机器人账号已存在');
      }
    } catch (err) {
      console.log('⚠️ 机器人账号创建跳过:', err.message);
    }
    
    connection.release();
    console.log('🎉 数据库初始化完成！');
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  }
}

// 执行查询（参数化查询，防止 SQL 注入）
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error.message);
    throw error;
  }
}

// 获取单个记录
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// 事务执行
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 关闭连接池
async function closePool() {
  await pool.end();
  console.log('数据库连接池已关闭');
}

module.exports = {
  pool,
  query,
  queryOne,
  transaction,
  testConnection,
  initDatabase,
  closePool
};
