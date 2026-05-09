import axios from 'axios'

// 使用环境变量配置 API 地址
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://chatroom-production-4040.up.railway.app/api'

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
  verify: (userId) => api.get('/auth/verify', { params: { userId } })
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
  getUser: (userId, id) => api.get(`/users/${id}`, { params: { userId } }),
  search: (userId, q) => api.get('/users/search', { params: { userId, q } })
}

export const roomAPI = {
  getList: (params) => api.get('/rooms', { params }),
  getDetail: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  join: (id, userId) => api.post(`/rooms/${id}/join`, { userId }),
  leave: (id, userId) => api.post(`/rooms/${id}/leave`, { userId }),
  getMessages: (id, params) => api.get(`/rooms/${id}/messages`, { params })
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

export default api
