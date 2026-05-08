/**
 * 消息服务
 * 处理消息的创建、过滤、验证
 */
const { query } = require('../config/database');

class MessageService {
  /**
   * 敏感词过滤
   */
  static async filterSensitiveWords(content) {
    try {
      const sensitiveWords = await query(
        'SELECT word, replacement FROM sensitive_words WHERE is_active = TRUE'
      );
      
      let filteredContent = content;
      for (const { word, replacement } of sensitiveWords) {
        const regex = new RegExp(word, 'gi');
        filteredContent = filteredContent.replace(regex, replacement);
      }
      
      return filteredContent;
    } catch (error) {
      console.error('敏感词过滤失败:', error);
      return content; // 失败时返回原内容
    }
  }
  
  /**
   * 创建消息
   */
  static async createMessage({ roomId, senderId, content, type = 'text', fileUrl = null, fileName = null, fileSize = null }) {
    // 敏感词过滤
    const filteredContent = await this.filterSensitiveWords(content);
    
    // 插入消息
    const result = await query(
      `INSERT INTO messages (room_id, sender_id, content, type, file_url, file_name, file_size) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [roomId, senderId, filteredContent, type, fileUrl, fileName, fileSize]
    );
    
    // 获取完整的消息信息
    const message = await query(
      `SELECT m.*, 
              u.username, u.nickname, u.avatar,
              r.name as room_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       JOIN rooms r ON m.room_id = r.id
       WHERE m.id = ?`,
      [result.insertId]
    );
    
    return message[0];
  }
  
  /**
   * 获取聊天室消息历史
   */
  static async getRoomMessages(roomId, limit = 50, offset = 0) {
    const messages = await query(
      `SELECT m.*, 
              u.username, u.nickname, u.avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = ? AND m.is_deleted = FALSE
       ORDER BY m.created_at DESC`,
      [roomId]
    );
    
    // 在代码层实现分页
    const paginatedMessages = messages.slice(offset, offset + limit);
    
    // 反转顺序，让旧消息在前
    return paginatedMessages.reverse();
  }
  
  /**
   * 编辑消息
   */
  static async editMessage(messageId, userId, newContent) {
    // 验证消息所有权
    const messages = await query(
      'SELECT sender_id FROM messages WHERE id = ?',
      [messageId]
    );
    
    if (messages.length === 0) {
      throw new Error('消息不存在');
    }
    
    if (messages[0].sender_id !== userId) {
      throw new Error('无权编辑此消息');
    }
    
    // 敏感词过滤
    const filteredContent = await this.filterSensitiveWords(newContent);
    
    await query(
      `UPDATE messages 
       SET content = ?, is_edited = TRUE, edited_at = NOW() 
       WHERE id = ?`,
      [filteredContent, messageId]
    );
    
    return true;
  }
  
  /**
   * 删除消息（软删除）
   */
  static async deleteMessage(messageId, userId) {
    await query(
      'UPDATE messages SET is_deleted = TRUE WHERE id = ? AND sender_id = ?',
      [messageId, userId]
    );
    
    return true;
  }
  
  /**
   * 标记消息为已读
   */
  static async markAsRead(messageId, userId) {
    await query(
      `INSERT INTO message_read_status (message_id, user_id) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
      [messageId, userId]
    );
    
    return true;
  }
  
  /**
   * 获取未读消息数
   */
  static async getUnreadCount(roomId, userId) {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM messages m
       LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.user_id = ?
       WHERE m.room_id = ? AND m.sender_id != ? AND mrs.id IS NULL`,
      [userId, roomId, userId]
    );
    
    return result[0]?.count || 0;
  }
}

module.exports = MessageService;
