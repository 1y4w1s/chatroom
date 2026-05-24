import { defineStore } from 'pinia'
import { authAPI, userAPI } from '@/api'
import { io } from 'socket.io-client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,  // 新增：存储 JWT Token
    socket: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    currentUser: (state) => state.user,
    userId: (state) => state.user?.id || null,
    isLoggedIn: (state) => !!state.token  // 兼容旧代码
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

    // 设置认证信息 - 处理头像URL 和 Token
    setAuth(data) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || ''
      
      // 保存 Token（如果有）
      if (data.token) {
        this.token = data.token
        localStorage.setItem('token', data.token)
      }
      
      const user = data.user
      // 处理头像URL，将相对路径转换为完整URL
      if (user.avatar && user.avatar.startsWith('/')) {
        user.avatar = `${API_BASE_URL}${user.avatar}`
      }
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
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

    // 验证用户（使用 Token）
    async verifyUser() {
      if (!this.token) return false
      
      try {
        const response = await userAPI.getMe()
        const API_BASE_URL = import.meta.env.VITE_API_URL || ''
        const user = response.data?.user || response.user
        // 处理头像URL，将相对路径转换为完整URL
        if (user.avatar && user.avatar.startsWith('/')) {
          user.avatar = `${API_BASE_URL}${user.avatar}`
        }
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
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

      if (!this.user) {
        console.log('缺少用户信息，无法连接 WebSocket')
        return
      }

      console.log('正在连接 WebSocket...')
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      })

      this.socket.on('connect', () => {
        console.log('WebSocket 已连接，Socket ID:', this.socket.id)
        if (this.user) {
          const status = this.user.status || 'online'
          this.socket.emit('update_status', { userId: this.user.id, status })
        }
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

      // 双重心跳：每10秒发送heartbeat，接收服务器ack
      this._heartbeatTimer = setInterval(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit('heartbeat')
        }
      }, 10000)

      // 重新连接时自动同步在线状态
      this.socket.on('reconnect', () => {
        console.log('WebSocket 重新连接')
        if (this.user) {
          const status = this.user.status || 'online'
          this.socket.emit('update_status', { userId: this.user.id, status })
        }
      })

      // 页面关闭时通知服务器设置为离线
      window.addEventListener('beforeunload', () => {
        if (this.socket && this.user) {
          this.socket.emit('update_status', { userId: this.user.id, status: 'offline' })
        }
      })
    },

    // 断开 WebSocket
    disconnectSocket() {
      if (this._heartbeatTimer) {
        clearInterval(this._heartbeatTimer)
        this._heartbeatTimer = null
      }
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    },

    // 加入聊天室
    joinRoom(roomId) {
      if (this.socket) {
        this.socket.emit('join_room', { roomId, userId: this.user.id, username: this.user.username })
      }
    },

    // 离开聊天室
    leaveRoom(roomId) {
      if (this.socket) {
        this.socket.emit('leave_room', { roomId, userId: this.user.id, username: this.user.username })
      }
    },

    // 发送消息
    sendMessage(roomId, content, type = 'text', extra = {}) {
      if (this.socket) {
        this.socket.emit('send_message', { roomId, content, type, userId: this.user.id, username: this.user.username, ...extra })
      } else {
        console.error('WebSocket 未连接，无法发送消息')
      }
    },

    // 输入状态
    sendTyping(roomId) {
      if (this.socket) {
        this.socket.emit('typing', { roomId, userId: this.user.id, username: this.user.username })
      }
    },

    // 停止输入
    sendStopTyping(roomId) {
      if (this.socket) {
        this.socket.emit('stop_typing', { roomId, userId: this.user.id })
      }
    },

    // 更新用户资料（昵称/状态），确保所有组件能响应
    updateProfile(fields) {
      this.$patch((state) => {
        if (state.user) {
          state.user = { ...state.user, ...fields }
          localStorage.setItem('user', JSON.stringify(state.user))
        }
      })
    }
  }
})
