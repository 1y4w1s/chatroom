<template>
  <div class="chat-container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>聊天室列表</h2>
        <button class="btn btn-primary btn-sm" @click="showCreateModal = true">
          + 新建
        </button>
      </div>

      <div class="room-list">
        <div
          v-for="room in rooms"
          :key="room.id"
          class="room-item"
          :class="{ active: currentRoomId === room.id }"
          @click="joinRoom(room.id)"
        >
          <div class="room-icon">
            <span v-if="room.type === 'public'">🌐</span>
            <span v-else>🔒</span>
          </div>
          <div class="room-info">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-members">{{ room.member_count }} 人</div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-info" @click="showAvatarUpload = true" title="点击更换头像">
          <img :src="authStore.user?.avatar || '/default-avatar.png'" class="avatar" />
          <div class="user-details">
            <div class="username">{{ authStore.user?.nickname }}</div>
            <div class="user-status">在线</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" @click="handleLogout">退出</button>
      </div>
    </aside>

    <!-- 头像上传弹窗 -->
    <div v-if="showAvatarUpload" class="modal-overlay" @click="showAvatarUpload = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>更换头像</h3>
          <button class="close-btn" @click="showAvatarUpload = false">×</button>
        </div>
        <div class="modal-body">
          <div class="avatar-preview">
            <img :src="avatarPreview || authStore.user?.avatar || '/default-avatar.png'" class="preview-image" />
          </div>
          <div class="upload-area">
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              @change="handleFileChange"
              style="display: none"
            />
            <button class="btn btn-primary" @click="$refs.fileInput.click()">
              选择图片
            </button>
            <p class="upload-hint">支持 JPG、PNG 格式，最大 5MB</p>
          </div>
          <div v-if="uploading" class="uploading">上传中...</div>
          <div v-if="uploadError" class="error">{{ uploadError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAvatarUpload = false">取消</button>
          <button class="btn btn-primary" @click="uploadAvatar" :disabled="!selectedFile || uploading">
            确认上传
          </button>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <main class="chat-main">
      <div v-if="currentRoomId" class="chat-wrapper">
        <!-- 聊天室头部 -->
        <header class="chat-header">
          <h3>{{ currentRoom?.name }}</h3>
          <p>{{ currentRoom?.description }}</p>
        </header>

        <!-- 消息列表 -->
        <div class="message-list" ref="messageListRef">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{ 'message-own': message.sender_id === authStore.user?.id }"
          >
            <img :src="message.avatar || '/default-avatar.png'" class="message-avatar" />
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.nickname }}</span>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <footer class="message-input">
          <input
            v-model="newMessage"
            type="text"
            class="input"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            @input="handleTyping"
          />
          <button class="btn btn-primary" @click="sendMessage" :disabled="!newMessage.trim()">
            发送
          </button>
        </footer>
      </div>

      <div v-else class="no-room">
        <p>请选择一个聊天室</p>
      </div>
    </main>

    <!-- 创建聊天室弹窗 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <h3>创建聊天室</h3>
        <form @submit.prevent="createRoom">
          <div class="form-group">
            <label>聊天室名称</label>
            <input v-model="newRoom.name" type="text" class="input" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="newRoom.description" class="input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="newRoom.type" class="input">
              <option value="public">公开</option>
              <option value="private">私有</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
            <button type="submit" class="btn btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { roomAPI } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const rooms = ref([])
const currentRoomId = ref(null)
const currentRoom = ref(null)
const messages = ref([])
const newMessage = ref('')
const showCreateModal = ref(false)
const messageListRef = ref(null)

const newRoom = ref({
  name: '',
  description: '',
  type: 'public'
})

// 头像上传相关
const showAvatarUpload = ref(false)
const selectedFile = ref(null)
const avatarPreview = ref(null)
const uploading = ref(false)
const uploadError = ref('')

// 加载聊天室列表
const loadRooms = async () => {
  try {
    const response = await roomAPI.getList()
    rooms.value = response.data.rooms
  } catch (error) {
    console.error('加载聊天室失败:', error)
  }
}

// 加入聊天室
const joinRoom = async (roomId) => {
  try {
    await roomAPI.join(roomId)
    currentRoomId.value = roomId
    currentRoom.value = rooms.value.find(r => r.id === roomId)
    
    // 加载消息历史
    const response = await roomAPI.getMessages(roomId)
    // 转换头像 URL 为完整路径，并反转数组（最早的在前，最新的在后）
    const API_BASE_URL = 'https://chatroom-production-4040.up.railway.app'
    messages.value = response.data.messages
      .reverse() // 反转数组
      .map(msg => {
        const avatar = msg.avatar && msg.avatar.trim() 
          ? `${API_BASE_URL}${msg.avatar}` 
          : '/default-avatar.png'
        return { ...msg, avatar }
      })
    
    // 加入 WebSocket 房间
    authStore.joinRoom(roomId)
    
    // 滚动到底部（强制）
    await nextTick()
    scrollToBottom(true)
  } catch (error) {
    console.error('加入聊天室失败:', error)
  }
}

// 发送消息
const sendMessage = () => {
  console.log('尝试发送消息:', {
    roomId: currentRoomId.value,
    content: newMessage.value,
    socket: authStore.socket ? '已连接' : '未连接'
  })
  
  if (!newMessage.value.trim() || !currentRoomId.value) {
    console.error('消息发送失败：消息为空或聊天室未选择')
    return
  }
  
  authStore.sendMessage(currentRoomId.value, newMessage.value)
  newMessage.value = ''
}

// 输入状态
let typingTimeout = null
const handleTyping = () => {
  if (currentRoomId.value) {
    authStore.sendTyping(currentRoomId.value)
    
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      authStore.sendStopTyping(currentRoomId.value)
    }, 1000)
  }
}

// 创建聊天室
const createRoom = async () => {
  try {
    const response = await roomAPI.create(newRoom.value)
    await loadRooms()
    showCreateModal.value = false
    joinRoom(response.data.room.id)
    newRoom.value = { name: '', description: '', type: 'public' }
  } catch (error) {
    console.error('创建聊天室失败:', error)
  }
}

// 登出
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// 头像上传相关方法
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    uploadError.value = '只支持 JPG、PNG、GIF、WebP 格式'
    return
  }
  
  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '文件大小不能超过 5MB'
    return
  }
  
  uploadError.value = ''
  selectedFile.value = file
  
  // 预览
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadAvatar = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  uploadError.value = ''
  
  try {
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)
    
    const API_BASE_URL = 'https://chatroom-production-4040.up.railway.app'
    const response = await fetch(`${API_BASE_URL}/api/users/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      // 更新用户信息 - 添加完整的 Railway URL
      const API_BASE_URL = 'https://chatroom-production-4040.up.railway.app'
      const updatedUser = { ...authStore.user, avatar: `${API_BASE_URL}${result.data.avatar}` }
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      showAvatarUpload.value = false
      selectedFile.value = null
      avatarPreview.value = null
      
      alert('头像上传成功！')
    } else {
      uploadError.value = result.error?.message || '上传失败'
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    uploadError.value = '上传失败，请重试'
  } finally {
    uploading.value = false
  }
}

// 检查用户是否在底部
const isAtBottom = () => {
  if (!messageListRef.value) return true
  const { scrollTop, scrollHeight, clientHeight } = messageListRef.value
  // 距离底部小于 100px 就认为是在底部
  return scrollHeight - scrollTop - clientHeight < 100
}

// 滚动到底部
const scrollToBottom = (force = false) => {
  if (!messageListRef.value) return
  // 只有当用户在底部或强制滚动时才滚动
  if (force || isAtBottom()) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// WebSocket 事件监听
const setupSocketListeners = () => {
  const socket = authStore.socket
  
  if (!socket) return
  
  const API_BASE_URL = 'https://chatroom-production-4040.up.railway.app'
  
  socket.on('new_message', (message) => {
    if (message.room_id === currentRoomId.value) {
      // 转换头像 URL 为完整路径
      const API_BASE_URL = 'https://chatroom-production-4040.up.railway.app'
      const avatar = message.avatar && message.avatar.trim()
        ? `${API_BASE_URL}${message.avatar}`
        : '/default-avatar.png'
      const messageWithAvatar = { ...message, avatar }
      messages.value.push(messageWithAvatar)
      // 只有当用户在底部时才自动滚动
      nextTick(() => scrollToBottom())
    }
  })
  
  // 监听头像更新事件
  socket.on('user_avatar_updated', (data) => {
    // 更新消息列表中的头像
    const API_BASE_URL = 'https://chatroom-production-4040.up.railway.app'
    messages.value = messages.value.map(msg => {
      if (msg.user_id === data.userId) {
        return { ...msg, avatar: `${API_BASE_URL}${data.avatar}` }
      }
      return msg
    })
  })
  
  socket.on('user_joined', (data) => {
    console.log('用户加入:', data.username)
  })
  
  socket.on('user_left', (data) => {
    console.log('用户离开:', data.username)
  })
}

onMounted(() => {
  loadRooms()
  setupSocketListeners()
})

onUnmounted(() => {
  if (currentRoomId.value) {
    authStore.leaveRoom(currentRoomId.value)
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 18px;
  color: #333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.room-list {
  flex: 1;
  overflow-y: auto;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.room-item:hover {
  background: #f5f5f5;
}

.room-item.active {
  background: #e3f2fd;
  border-left: 3px solid #007bff;
}

.room-icon {
  font-size: 24px;
  margin-right: 12px;
}

.room-info {
  flex: 1;
}

.room-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.room-members {
  font-size: 12px;
  color: #999;
}

.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 500;
  color: #333;
}

.user-status {
  font-size: 12px;
  color: #28a745;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden; /* 防止内容溢出 */
}

.no-room {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 18px;
}

.chat-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.chat-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header h3 {
  color: #333;
  margin-bottom: 5px;
}

.chat-header p {
  color: #666;
  font-size: 14px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0; /* 关键！允许 flex 子项正确滚动 */
}

.message {
  display: flex;
  margin-bottom: 15px;
}

.message-own {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 10px;
}

.message-content {
  max-width: 60%;
}

.message-own .message-content {
  align-items: flex-end;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.message-sender {
  font-weight: 500;
  color: #333;
  margin-right: 10px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-text {
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  word-wrap: break-word;
}

.message-own .message-text {
  background: #007bff;
  color: white;
}

.message-input {
  display: flex;
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
  gap: 10px;
}

.message-input .input {
  flex: 1;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
}

.modal h3 {
  margin-bottom: 20px;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 头像上传弹窗样式 */
.user-info {
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-info:hover {
  opacity: 0.8;
}

.avatar-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.preview-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0e0e0;
}

.upload-area {
  text-align: center;
  padding: 20px;
}

.upload-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.uploading {
  text-align: center;
  padding: 10px;
  color: #007bff;
  font-weight: 500;
}

.error {
  text-align: center;
  padding: 10px;
  color: #dc3545;
  font-size: 14px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}
</style>
