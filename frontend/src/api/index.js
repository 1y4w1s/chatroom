import axios from 'axios'

// 使用环境变量配置 API 地址
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      const message = error.response.data?.error?.message || '请求失败'
      console.error('API 错误:', message)
      return Promise.reject(new Error(message))
    }
    
    console.error('网络错误:', error.message)
    return Promise.reject(new Error('网络连接失败，请检查网络'))
  }
)

// API 方法
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (userId) => api.post('/auth/logout', { userId }),
  verify: (userId) => api.get('/auth/verify', { params: { userId } }),
  verifyReset: (data) => api.post('/auth/verify-reset', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
}

export const userAPI = {
  getMe: (userId) => api.get('/users/me', { params: { userId } }),
  updateMe: (userId, data) => api.put('/users/me', { userId, ...data }),
  uploadAvatar: (userId, formData) => {
    formData.append('userId', userId)
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  changePassword: (userId, oldPassword, newPassword) =>
    api.put('/users/password', { userId, oldPassword, newPassword }),
  changeStatus: (userId, status) =>
    api.put('/users/status', { userId, status }),
  getUser: (userId, id) => api.get(`/users/${id}`, { params: { userId } }),
  search: (userId, q) => api.get('/users/search', { params: { userId, q } })
}

export const roomAPI = {
  getList: (params) => api.get('/rooms', { params }),
  getDetail: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  join: (id, userId) => api.post(`/rooms/${id}/join`, { userId }),
  leave: (id, userId) => api.post(`/rooms/${id}/leave`, { userId }),
  getMessages: (id, params) => api.get(`/rooms/${id}/messages`, { params }),
  
  // 成员预览
  getMembers: (id) => api.get(`/rooms/${id}/members`),
  
  // 权限管理
  changeRole: (roomId, userId, role, operatorId, reason) => 
    api.put(`/rooms/${roomId}/members/${userId}/role`, { role, operatorId, reason }),
  
  // 禁言管理
  muteMember: (roomId, userId, isMuted, duration, operatorId, reason) =>
    api.put(`/rooms/${roomId}/members/${userId}/mute`, { isMuted, duration, operatorId, reason }),
  
  // 解散聊天室
  dissolveRoom: (roomId, operatorId, reason) =>
    api.delete(`/rooms/${roomId}`, { data: { operatorId, reason } }),
  
  // 超级管理员强制删除
  forceDeleteRoom: (roomId, operatorId, reason = '') =>
    api.delete(`/rooms/${roomId}/force`, { data: { operatorId, reason } }),
  
  // 获取用户权限
  getPermissions: (roomId, userId) => api.get(`/rooms/${roomId}/members/${userId}/permissions`),
  
  // 更新聊天室信息
  updateRoom: (roomId, userId, data) => api.put(`/rooms/${roomId}`, { userId, ...data }),
  
  // 上传聊天室头像
  uploadRoomAvatar: (roomId, userId, formData) => {
    formData.append('userId', userId)
    return api.post(`/rooms/${roomId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  // 标记已读
  markRead: (roomId, userId) => api.post(`/rooms/${roomId}/read`, { userId }),
  
  // 获取未读状态
  getReadStatus: (userId) => api.get('/rooms/read-status', { params: { userId } }),
  
  // 查找或创建私聊房间
  findOrCreatePrivateRoom: (userId, friendId) => api.post('/rooms/private', { userId, friendId })
}

export const messageAPI = {
  upload: (userId, formData) => {
    formData.append('userId', userId)
    return api.post('/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  edit: (userId, id, data) => api.put(`/messages/${id}`, { userId, ...data }),
  delete: (userId, id) => api.delete(`/messages/${id}`, { data: { userId } }),
  markRead: (userId, id) => api.post(`/messages/${id}/read`, { userId })
}

export const friendAPI = {
  getList: (userId) => api.get('/friends', { params: { userId } }),
  sendRequest: (userId, data) => api.post('/friends/request', { userId, ...data }),
  getRequests: (userId) => api.get('/friends/requests', { params: { userId } }),
  respondRequest: (userId, id, action) => api.post(`/friends/requests/${id}/respond`, { userId, action }),
  delete: (userId, id) => api.delete(`/friends/${id}`, { data: { userId } })
}

export const notificationAPI = {
  getList: (userId) => api.get('/notifications', { params: { userId } }),
  markRead: (userId, id) => api.post(`/notifications/${id}/read`, { userId }),
  markAllRead: (userId) => api.post('/notifications/read-all', { userId })
}

export { api }

export const postAPI = {
  getList: (userId, params) => api.get('/posts', { params: { userId, ...params } }),
  getDetail: (userId, id) => api.get(`/posts/${id}`, { params: { userId } }),
  create: (userId, formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { userId }
  }),
  update: (userId, id, data) => api.put(`/posts/${id}`, { userId, ...data }),
  like: (userId, id) => api.post(`/posts/${id}/like`, { userId }),
  unlike: (userId, id) => api.post(`/posts/${id}/unlike`, { userId }),
  delete: (userId, id) => api.delete(`/posts/${id}`, { data: { userId } }),
  setVisibility: (userId, id, isPublic) => api.patch(`/posts/${id}/visibility`, { userId, is_public: isPublic }),
  setCommentsToggle: (userId, id, allow) => api.patch(`/posts/${id}/comments-toggle`, { userId, allow_comments: allow }),
  getComments: (userId, id) => api.get(`/posts/${id}/comments`, { params: { userId } }),
  addComment: (userId, id, content, parentId) => {
    const data = { userId, content }
    if (parentId) data.parent_id = parentId
    return api.post(`/posts/${id}/comments`, data)
  },
  addCommentWithImage: (userId, id, formData) => api.post(`/posts/${id}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { userId }
  }),
  likeComment: (userId, id) => api.post(`/comments/${id}/like`, { userId }),
  unlikeComment: (userId, id) => api.post(`/comments/${id}/unlike`, { userId }),
  deleteComment: (userId, id) => api.delete(`/comments/${id}`, { data: { userId } })
}

export default api