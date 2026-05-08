-- 数据库迁移脚本
-- 用于添加缺失的字段到现有表

-- 1. 检查并添加 users 表的字段
-- 添加 nickname 字段
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'users' 
                   AND COLUMN_NAME = 'nickname');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE users ADD COLUMN nickname VARCHAR(50) DEFAULT NULL', 
              'SELECT "Column nickname already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 signature 字段
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'users' 
                   AND COLUMN_NAME = 'signature');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE users ADD COLUMN signature VARCHAR(200) DEFAULT NULL', 
              'SELECT "Column signature already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 status 字段
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'users' 
                   AND COLUMN_NAME = 'status');
SET @sql = IF(@col_exists = 0, 
              "ALTER TABLE users ADD COLUMN status ENUM('online', 'offline', 'away') DEFAULT 'offline'", 
              'SELECT "Column status already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 is_banned 字段
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'users' 
                   AND COLUMN_NAME = 'is_banned');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE', 
              'SELECT "Column is_banned already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 ban_reason 字段
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'users' 
                   AND COLUMN_NAME = 'ban_reason');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE users ADD COLUMN ban_reason VARCHAR(255) DEFAULT NULL', 
              'SELECT "Column ban_reason already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加 last_login_at 字段
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'users' 
                   AND COLUMN_NAME = 'last_login_at');
SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL', 
              'SELECT "Column last_login_at already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 检查并添加 room_members 表的字段
-- 添加 role 字段
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'room_members' 
                   AND COLUMN_NAME = 'role');
SET @sql = IF(@col_exists = 0, 
              "ALTER TABLE room_members ADD COLUMN role ENUM('member', 'admin', 'owner') DEFAULT 'member'", 
              'SELECT "Column role already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 显示最终表结构
SELECT 'Migration completed!' as Status;
DESCRIBE users;
DESCRIBE room_members;
