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

// 从 localStorage 获取 Token
const getToken = () => localStorage.getItem('token')

// 请求拦截器：自动添加 Token
api.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并跳转登录
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 只有不在登录/注册页面时才跳转
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    
    if (error.response) {
      let message = error.response.data?.error?.message || '请求失败'
      // 处理验证错误
      if (error.response.data?.errors && error.response.data.errors.length > 0) {
        message = error.response.data.errors.map(e => e.msg).join('; ')
      }
      console.error('API 错误:', message, error.response.data)
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
  logout: () => api.post('/auth/logout'),  // Token 认证，无需传 userId
  verifyReset: (data) => api.post('/auth/verify-reset', data),
  resetPassword: (data) => api.post('/auth/reset-password', data)
}

export const userAPI = {
  getMe: () => api.get('/users/me'),  // Token 认证
  updateMe: (data) => api.put('/users/me', data),  // Token 认证
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {  // Token 认证
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (userId, oldPassword, newPassword) =>
    api.put('/users/password', { userId, oldPassword, newPassword }),
  changeStatus: (userId, status) => api.put('/users/status', { userId, status }),
  getUser: (id) => api.get(`/users/${id}`),
  search: (q) => api.get('/users/search', { params: { q } })
}

export const roomAPI = {
  getList: (params) => api.get('/rooms', { params }),  // optionalAuth
  getDetail: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  join: (id, userId) => api.post(`/rooms/${id}/join`, { userId }),
  leave: (id) => api.post(`/rooms/${id}/leave`),  // Token 认证
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
  dissolveRoom: (roomId, operatorId, reason = '') =>
    api.delete(`/rooms/${roomId}`, { data: { operatorId, reason } }),
  
  // 超级管理员强制删除
  forceDeleteRoom: (roomId, operatorId, reason = '') =>
    api.delete(`/rooms/${roomId}/force`, { data: { operatorId, reason } }),
  
  // 获取用户权限
  getPermissions: (roomId, userId) => api.get(`/rooms/${roomId}/members/${userId}/permissions`),
  
  // 更新聊天室信息
  updateRoom: (roomId, userId, data) => api.put(`/rooms/${roomId}`, { ...data, userId }),
  
  // 上传聊天室头像
  uploadRoomAvatar: (roomId, formData) => api.post(`/rooms/${roomId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // 标记已读
  markRead: (roomId, userId) => api.post(`/rooms/${roomId}/read`, { userId }),
  
  // 获取未读状态
  getReadStatus: (userId) => api.get('/rooms/read-status', { params: { userId } }),
  
  // 查找或创建私聊房间
  // findOrCreatePrivateRoom 已移除
  
  // 查找或创建私聊会话
findOrCreatePrivateChat: (userId, friendId) => api.post('/private-chats', { userId, friendId }),

// 获取私聊列表
getPrivateChats: (userId) => api.get('/private-chats', { params: { userId } }),

// 获取私聊消息
getPrivateMessages: (chatId, userId, params) => api.get(`/private-chats/${chatId}/messages`, { params: { ...params, userId } }),

// 发送私聊消息
sendPrivateMessage: (chatId, data) => api.post(`/private-chats/${chatId}/messages`, data),

// 标记私聊已读
markPrivateChatRead: (chatId, userId) => api.put(`/private-chats/${chatId}/read`, { userId }),

// 获取私聊未读总数
getPrivateUnreadCount: (userId) => api.get('/private-chats/unread-count', { params: { userId } }),

// 切换机器人状态
  toggleBot: (roomId, userId, enable) => api.put(`/rooms/${roomId}/bot`, { userId, enable })
}

export const messageAPI = {
  upload: (formData) => api.post('/messages/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  edit: (id, data) => api.put(`/messages/${id}`, data),
  delete: (id) => api.delete(`/messages/${id}`),
  recall: (id) => api.post(`/messages/${id}/recall`),
  markRead: (id) => api.post(`/messages/${id}/read`)
}

export const friendAPI = {
  getList: () => api.get('/friends'),
  sendRequest: (data) => api.post('/friends/request', data),
  getRequests: () => api.get('/friends/requests'),
  respondRequest: (id, action) => api.post(`/friends/requests/${id}/respond`, { action }),
  delete: (id) => api.delete(`/friends/${id}`)
}

export const notificationAPI = {
  getList: (userId) => api.get('/notifications', { params: { userId } }),
  markRead: (userId, id) => api.post(`/notifications/${id}/read`, { userId }),
  markAllRead: (userId) => api.post('/notifications/read-all', { userId })
}

export { api }

export const postAPI = {
  getList: (userId, params = {}) => api.get('/posts', { params: { ...params, userId } }),
  getDetail: (id) => api.get(`/posts/${id}`),
  create: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/posts/${id}`, data),
  like: (id) => api.post(`/posts/${id}/like`),
  unlike: (id) => api.post(`/posts/${id}/unlike`),
  delete: (id) => api.delete(`/posts/${id}`),
  setVisibility: (id, isPublic) => api.patch(`/posts/${id}/visibility`, { is_public: isPublic }),
  setCommentsToggle: (id, allow) => api.patch(`/posts/${id}/comments-toggle`, { allow_comments: allow }),
  getComments: (id) => api.get(`/posts/${id}/comments`),
  addComment: (id, content, parentId) => {
    const data = { content }
    if (parentId) data.parent_id = parentId
    return api.post(`/posts/${id}/comments`, data)
  },
  addCommentWithImage: (id, formData) => api.post(`/posts/${id}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  likeComment: (id) => api.post(`/posts/comments/${id}/like`),
  unlikeComment: (id) => api.post(`/posts/comments/${id}/unlike`),
  deleteComment: (id) => api.delete(`/posts/comments/${id}`)
}

export default api