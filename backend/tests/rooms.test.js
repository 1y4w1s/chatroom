/**
 * 聊天室权限管理单元测试
 */
const request = require('supertest');
const { app, server } = require('../src/server');

// 模拟用户数据
const mockUser = {
  id: 1,
  username: 'testuser',
  password: 'password123'
};

const mockAdminUser = {
  id: 2,
  username: 'adminuser',
  password: 'password123'
};

describe('聊天室权限管理 API', () => {
  let agent;
  
  beforeAll(async () => {
    agent = request.agent(app);
  });
  
  afterAll(async () => {
    server.close();
  });
  
  describe('GET /api/rooms', () => {
    it('应该返回聊天室列表', async () => {
      const response = await agent.get('/api/rooms');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.rooms)).toBe(true);
    });
  });
  
  describe('GET /api/rooms/:id/members', () => {
    it('应该返回聊天室成员列表', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.get(`/api/rooms/${roomId}/members`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.members)).toBe(true);
      }
    });
    
    it('应该返回404当聊天室不存在', async () => {
      const response = await agent.get('/api/rooms/9999/members');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/rooms/:id/members/:userId/role', () => {
    it('应该拒绝非管理员的权限变更请求', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.put(`/api/rooms/${roomId}/members/2/role`)
          .send({ role: 'admin', operatorId: 9999 });
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      }
    });
  });
  
  describe('PUT /api/rooms/:id/members/:userId/mute', () => {
    it('应该拒绝非管理员的禁言请求', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.put(`/api/rooms/${roomId}/members/2/mute`)
          .send({ isMuted: true, operatorId: 9999 });
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      }
    });
  });
  
  describe('DELETE /api/rooms/:id', () => {
    it('应该拒绝非管理员的解散请求', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.delete(`/api/rooms/${roomId}`)
          .send({ operatorId: 9999, reason: '测试' });
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      }
    });
  });
  
  describe('DELETE /api/rooms/:id/force', () => {
    it('应该拒绝非超级管理员的强制删除请求', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.delete(`/api/rooms/${roomId}/force`)
          .send({ operatorId: 9999, reason: '测试' });
        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      }
    });
  });
  
  describe('GET /api/rooms/:id/members/:userId/permissions', () => {
    it('应该返回用户权限信息', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.get(`/api/rooms/${roomId}/members/1/permissions`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(typeof response.body.data).toBe('object');
      }
    });
  });
});

describe('聊天室创建和管理', () => {
  let agent;
  
  beforeAll(async () => {
    agent = request.agent(app);
  });
  
  describe('POST /api/rooms', () => {
    it('应该创建新聊天室', async () => {
      const response = await agent.post('/api/rooms')
        .send({
          name: '测试聊天室',
          description: '测试描述',
          type: 'public',
          owner_id: 1
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.room).toHaveProperty('id');
      expect(response.body.data.room.name).toBe('测试聊天室');
    });
    
    it('应该验证聊天室名称长度', async () => {
      const response = await agent.post('/api/rooms')
        .send({
          name: 'A',
          owner_id: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/rooms/:id/join', () => {
    it('应该加入聊天室', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.post(`/api/rooms/${roomId}/join`)
          .send({ userId: 1 });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });
  
  describe('POST /api/rooms/:id/leave', () => {
    it('应该离开聊天室', async () => {
      const roomsResponse = await agent.get('/api/rooms');
      const roomId = roomsResponse.body.data.rooms[0]?.id;
      
      if (roomId) {
        const response = await agent.post(`/api/rooms/${roomId}/leave`)
          .send({ userId: 9999 });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });
});