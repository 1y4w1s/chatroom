/**
 * 消息服务单元测试
 */
const MessageService = require('../src/services/messageService');

// 模拟数据库查询
jest.mock('../src/config/database', () => ({
  query: jest.fn()
}));

const { query } = require('../src/config/database');

describe('MessageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('filterSensitiveWords', () => {
    it('应该过滤敏感词', async () => {
      query.mockResolvedValue([
        { word: '广告', replacement: '***' },
        { word: '赌博', replacement: '***' }
      ]);
      
      const result = await MessageService.filterSensitiveWords('这是一条广告消息，涉及赌博内容');
      expect(result).toBe('这是一条***消息，涉及***内容');
    });
    
    it('当敏感词表不存在时应该返回原内容', async () => {
      query.mockRejectedValue(new Error('Table not found'));
      
      const result = await MessageService.filterSensitiveWords('正常消息内容');
      expect(result).toBe('正常消息内容');
    });
    
    it('应该处理空内容', async () => {
      query.mockResolvedValue([]);
      
      const result = await MessageService.filterSensitiveWords('');
      expect(result).toBe('');
    });
  });
  
  describe('createMessage', () => {
    it('应该创建消息并返回完整信息', async () => {
      query
        .mockResolvedValueOnce({ insertId: 1 })
        .mockResolvedValueOnce([{
          id: 1,
          room_id: 1,
          user_id: 1,
          content: '测试消息',
          type: 'text',
          username: 'testuser',
          nickname: '测试用户',
          avatar: '/avatars/test.png',
          room_name: '测试房间'
        }]);
      
      const result = await MessageService.createMessage({
        roomId: 1,
        userId: 1,
        content: '测试消息'
      });
      
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('sender_id', 1);
      expect(result.content).toBe('测试消息');
    });
    
    it('应该过滤消息中的敏感词', async () => {
      query
        .mockResolvedValueOnce([{ word: '广告', replacement: '***' }])
        .mockResolvedValueOnce({ insertId: 2 })
        .mockResolvedValueOnce([{
          id: 2,
          room_id: 1,
          user_id: 1,
          content: '***内容',
          type: 'text',
          username: 'testuser',
          nickname: '测试用户',
          avatar: '/avatars/test.png',
          room_name: '测试房间'
        }]);
      
      const result = await MessageService.createMessage({
        roomId: 1,
        userId: 1,
        content: '广告内容'
      });
      
      expect(result.content).toBe('***内容');
    });
  });
  
  describe('getRoomMessages', () => {
    it('应该返回分页消息列表', async () => {
      query.mockResolvedValue([
        { id: 2, room_id: 1, user_id: 1, content: '消息2', created_at: '2024-01-02' },
        { id: 1, room_id: 1, user_id: 1, content: '消息1', created_at: '2024-01-01' }
      ]);
      
      const result = await MessageService.getRoomMessages(1, 10, 0);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1); // 旧消息在前
      expect(result[1].id).toBe(2);
      expect(result[0]).toHaveProperty('sender_id', 1);
    });
    
    it('应该返回空数组当没有消息', async () => {
      query.mockResolvedValue([]);
      
      const result = await MessageService.getRoomMessages(1, 10, 0);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
  
  describe('editMessage', () => {
    it('应该编辑消息内容', async () => {
      query
        .mockResolvedValueOnce([{ user_id: 1 }])
        .mockResolvedValueOnce([]);
      
      const result = await MessageService.editMessage(1, 1, '新内容');
      
      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE messages'),
        expect.any(Array)
      );
    });
    
    it('应该拒绝非消息所有者的编辑请求', async () => {
      query.mockResolvedValueOnce([{ user_id: 2 }]);
      
      await expect(
        MessageService.editMessage(1, 1, '新内容')
      ).rejects.toThrow('无权编辑此消息');
    });
    
    it('应该抛出错误当消息不存在', async () => {
      query.mockResolvedValueOnce([]);
      
      await expect(
        MessageService.editMessage(999, 1, '新内容')
      ).rejects.toThrow('消息不存在');
    });
  });
  
  describe('deleteMessage', () => {
    it('应该软删除消息', async () => {
      query.mockResolvedValueOnce({ affectedRows: 1 });
      
      const result = await MessageService.deleteMessage(1, 1);
      
      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        'UPDATE messages SET is_deleted = TRUE WHERE id = ? AND user_id = ?',
        [1, 1]
      );
    });
  });
  
  describe('markAsRead', () => {
    it('应该标记消息为已读', async () => {
      query.mockResolvedValueOnce({ insertId: 1 });
      
      const result = await MessageService.markAsRead(1, 1);
      
      expect(result).toBe(true);
      expect(query).toHaveBeenCalled();
    });
  });
  
  describe('getUnreadCount', () => {
    it('应该返回未读消息数量', async () => {
      query.mockResolvedValueOnce([{ count: 5 }]);
      
      const result = await MessageService.getUnreadCount(1, 1);
      
      expect(result).toBe(5);
    });
    
    it('应该返回0当没有未读消息', async () => {
      query.mockResolvedValueOnce([{ count: 0 }]);
      
      const result = await MessageService.getUnreadCount(1, 1);
      
      expect(result).toBe(0);
    });
  });
});