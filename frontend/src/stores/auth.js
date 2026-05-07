import { defineStore } from 'pinia'
import { authAPI, userAPI } from '@/api'
import { io } from 'socket.io-client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    socket: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    // 登录
    async login(credentials) {
      try {
        const response = await authAPI.login(credentials)
        this.setAuth(response.data)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    // 注册
    async register(userData) {
      try {
        const response = await authAPI.register(userData)
        this.setAuth(response.data)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    // 设置认证信息
    setAuth(data) {
      this.user = data.user
      this.token = data.token
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      this.connectSocket()
    },

    // 登出
    async logout() {
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        this.clearAuth()
      }
    },

    // 清除认证信息
    clearAuth() {
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.disconnectSocket()
    },

    // 验证 Token
    async verifyToken() {
      if (!this.token) return false
      
      try {
        const response = await authAPI.verify()
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(this.user))
        return true
      } catch (error) {
        this.clearAuth()
        return false
      }
    },

    // 连接 WebSocket
    connectSocket() {
      if (this.socket) {
        console.log('WebSocket 已连接，跳过')
        return
      }

      if (!this.token) {
        console.log('缺少 Token，无法连接 WebSocket')
        return
      }

      console.log('正在连接 WebSocket...')
      this.socket = io('http://localhost:3000', {
        auth: {
          token: this.token
        },
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        console.log('WebSocket 已连接，Socket ID:', this.socket.id)
      })

      this.socket.on('disconnect', () => {
        console.log('WebSocket 已断开')
        this.socket = null
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket 连接错误:', error.message)
        this.socket = null
      })

      this.socket.on('error', (error) => {
        console.error('WebSocket 错误:', error)
      })
    },

    // 断开 WebSocket
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    },

    // 加入聊天室
    joinRoom(roomId) {
      if (this.socket) {
        this.socket.emit('join_room', roomId)
      }
    },

    // 离开聊天室
    leaveRoom(roomId) {
      if (this.socket) {
        this.socket.emit('leave_room', roomId)
      }
    },

    // 发送消息
    sendMessage(roomId, content, type = 'text') {
      console.log('authStore.sendMessage 被调用:', { roomId, content, type, socketConnected: !!this.socket })
      if (this.socket) {
        console.log('通过 WebSocket 发送消息:', { roomId, content, type })
        this.socket.emit('send_message', { roomId, content, type })
      } else {
        console.error('WebSocket 未连接，无法发送消息')
      }
    },

    // 输入状态
    sendTyping(roomId) {
      if (this.socket) {
        this.socket.emit('typing', roomId)
      }
    },

    // 停止输入
    sendStopTyping(roomId) {
      if (this.socket) {
        this.socket.emit('stop_typing', roomId)
      }
    }
  }
})
