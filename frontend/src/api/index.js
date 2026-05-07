import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      // Token 过期或无效
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      
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
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify')
}

export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  uploadAvatar: (formData) => 
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getUser: (id) => api.get(`/users/${id}`),
  search: (q) => api.get('/users/search', { params: { q } })
}

export const roomAPI = {
  getList: (params) => api.get('/rooms', { params }),
  getDetail: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  join: (id) => api.post(`/rooms/${id}/join`),
  leave: (id) => api.post(`/rooms/${id}/leave`),
  getMessages: (id, params) => api.get(`/rooms/${id}/messages`, { params })
}

export const messageAPI = {
  upload: (formData) =>
    api.post('/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  edit: (id, data) => api.put(`/messages/${id}`, data),
  delete: (id) => api.delete(`/messages/${id}`),
  markRead: (id) => api.post(`/messages/${id}/read`)
}

export const friendAPI = {
  getList: () => api.get('/friends'),
  sendRequest: (data) => api.post('/friends/request', data),
  getRequests: () => api.get('/friends/requests'),
  respondRequest: (id, action) => api.post(`/friends/requests/${id}/respond`, { action }),
  delete: (id) => api.delete(`/friends/${id}`)
}

export default api
