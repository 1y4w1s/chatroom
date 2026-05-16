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
          @mouseenter="showMemberPreview(room.id)"
          @mouseleave="hideMemberPreview"
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
        
        <!-- 成员预览悬浮层 - 独立于房间列表项 -->
        <div 
          v-if="previewRoomId && previewMembers.length > 0" 
          class="member-preview"
          :style="previewPosition"
        >
          <div class="preview-header">
            <span>{{ rooms.find(r => r.id === previewRoomId)?.name || '成员列表' }} - 成员列表</span>
            <span class="member-count">{{ previewMembers.length }}人</span>
          </div>
          <div class="preview-list">
            <div
              v-for="member in previewMembers.slice(0, 6)"
              :key="member.id"
              class="preview-member"
            >
              <img :src="getAvatarUrl(member.avatar)" class="preview-avatar" />
              <div class="preview-info">
                <div class="preview-name">{{ member.nickname || member.username }}</div>
                <div class="preview-status" :class="member.status">
                  <span class="status-dot" :class="member.status"></span>
                  {{ member.status === 'online' ? '在线' : '离线' }}
                  <span v-if="member.role === 'owner' || member.role === 'admin'" class="preview-role">
                    {{ member.role === 'owner' ? '群主' : '管理员' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="previewMembers.length > 6" class="preview-more">
              还有 {{ previewMembers.length - 6 }} 位成员...
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-info" @click="showAvatarUpload = true" title="点击更换头像">
          <img :src="getAvatarUrl(authStore.user?.avatar)" class="avatar" />
          <div class="user-details">
            <div class="username">{{ authStore.user?.nickname || authStore.user?.username }}</div>
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
          <div class="header-left">
            <h3>{{ currentRoom?.name }}</h3>
            <p>{{ currentRoom?.description }}</p>
          </div>
          <div class="header-right">
            <button 
              v-if="currentPermissions.isAdmin" 
              class="btn btn-secondary btn-sm" 
              @click="showMemberManagement = true"
            >
              管理成员
            </button>
            <!-- 超级管理员始终可以看到删除聊天室按钮 -->
            <button 
              v-if="isSuperAdmin" 
              class="btn btn-danger btn-sm" 
              @click="showDissolveConfirm = true"
            >
              删除聊天室
            </button>
            <!-- 群主可以解散聊天室 -->
            <button 
              v-else-if="currentPermissions.isOwner" 
              class="btn btn-danger btn-sm" 
              @click="showDissolveConfirm = true"
            >
              解散
            </button>
          </div>
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
                <span class="message-sender">{{ message.nickname || message.username }}</span>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <footer class="message-input">
          <div v-if="currentPermissions.isMuted" class="muted-notice">
            ⚠️ 您已被禁言，无法发送消息
          </div>
          <input
            v-model="newMessage"
            type="text"
            class="input"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            @input="handleTyping"
            :disabled="currentPermissions.isMuted"
          />
          <button 
            class="btn btn-primary" 
            @click="sendMessage" 
            :disabled="!newMessage.trim() || currentPermissions.isMuted"
          >
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

    <!-- 成员管理弹窗 -->
    <div v-if="showMemberManagement" class="modal-overlay" @click="showMemberManagement = false">
      <div class="modal member-management-modal" @click.stop>
        <div class="modal-header">
          <h3>成员管理 - {{ currentRoom?.name }}</h3>
          <button class="close-btn" @click="showMemberManagement = false">×</button>
        </div>
        <div class="modal-body">
          <div class="member-list">
            <div
              v-for="member in currentMembers"
              :key="member.id"
              class="member-item"
            >
              <img :src="getAvatarUrl(member.avatar)" class="member-avatar" />
              <div class="member-info">
                <div class="member-name">
                  {{ member.nickname || member.username }}
                  <span v-if="member.role === 'owner'" class="role-badge owner">群主</span>
                  <span v-else-if="member.role === 'admin'" class="role-badge admin">管理员</span>
                  <span v-else class="role-badge member">成员</span>
                </div>
                <div class="member-status">
                  <span class="status-dot" :class="member.status"></span>
                  {{ member.status === 'online' ? '在线' : '离线' }}
                  <span v-if="member.is_muted" class="muted-badge" :title="formatMuteTime(member.muted_until)">
                    已禁言{{ formatMuteDuration(member.muted_until) }}
                  </span>
                </div>
              </div>
              <div class="member-actions">
                <!-- 权限管理 -->
                <button 
                  v-if="currentPermissions.isOwner && member.role === 'member'"
                  class="action-btn btn-admin"
                  @click="grantAdmin(member.id)"
                >
                  设为管理员
                </button>
                <button 
                  v-if="currentPermissions.isOwner && member.role === 'admin'"
                  class="action-btn btn-remove-admin"
                  @click="revokeAdmin(member.id)"
                >
                  撤销管理员
                </button>
                
                <!-- 禁言管理 -->
                <button 
                  v-if="currentPermissions.isAdmin && member.role === 'member' && !member.is_muted"
                  class="action-btn btn-mute"
                  @click="openMuteModal(member)"
                >
                  禁言
                </button>
                <button 
                  v-if="currentPermissions.isAdmin && member.is_muted"
                  class="action-btn btn-unmute"
                  @click="unmuteMember(member.id)"
                >
                  解除禁言
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showMemberManagement = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 禁言设置弹窗 -->
    <div v-if="showMuteModal" class="modal-overlay" @click="showMuteModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>设置禁言</h3>
          <button class="close-btn" @click="showMuteModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择禁言时长</label>
            <div class="duration-options">
              <button class="duration-btn" :class="{ active: muteDuration === 5 }" @click="muteDuration = 5">5 分钟</button>
              <button class="duration-btn" :class="{ active: muteDuration === 30 }" @click="muteDuration = 30">30 分钟</button>
              <button class="duration-btn" :class="{ active: muteDuration === 60 }" @click="muteDuration = 60">1 小时</button>
              <button class="duration-btn" :class="{ active: muteDuration === 1440 }" @click="muteDuration = 1440">24 小时</button>
              <button class="duration-btn custom-btn" :class="{ active: muteDuration === 'custom' }" @click="muteDuration = 'custom'">自定义</button>
            </div>
          </div>
          <div v-if="muteDuration === 'custom'" class="form-group">
            <label>自定义时长</label>
            <div class="custom-duration-input">
              <div class="duration-input-group">
                <input 
                  v-model.number="customDays" 
                  type="number" 
                  class="input-small" 
                  placeholder="00"
                  min="0"
                  max="29"
                />
                <span class="duration-label">天</span>
              </div>
              <div class="duration-input-group">
                <input 
                  v-model.number="customHours" 
                  type="number" 
                  class="input-small" 
                  placeholder="00"
                  min="0"
                  max="23"
                />
                <span class="duration-label">小时</span>
              </div>
              <div class="duration-input-group">
                <input 
                  v-model.number="customMinutes" 
                  type="number" 
                  class="input-small" 
                  placeholder="00"
                  min="0"
                  max="59"
                />
                <span class="duration-label">分钟</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>禁言原因</label>
            <textarea 
              v-model="muteReason" 
              class="input" 
              rows="3" 
              placeholder="请输入禁言原因（可选）"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showMuteModal = false">取消</button>
          <button class="btn btn-danger" @click="confirmMute">确认禁言</button>
        </div>
      </div>
    </div>

    <!-- 解散/删除确认弹窗 -->
    <div v-if="showDissolveConfirm" class="modal-overlay" @click="showDissolveConfirm = false">
      <div class="modal danger-modal" @click.stop>
        <div class="modal-header">
          <h3 class="danger-title">⚠️ {{ isSuperAdmin ? '删除聊天室' : '解散聊天室' }}</h3>
          <button class="close-btn" @click="showDissolveConfirm = false">×</button>
        </div>
        <div class="modal-body">
          <p class="warning-text">
            {{ isSuperAdmin 
              ? '此操作将永久删除该聊天室及其所有消息记录，且无法恢复！' 
              : '此操作将解散该聊天室，所有成员将被移出，消息记录将被保留但无法继续发送消息。' 
            }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDissolveConfirm = false">取消</button>
          <button 
            class="btn btn-danger" 
            @click="confirmDissolve"
          >
            {{ isSuperAdmin ? '删除' : '确认解散' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 操作结果提示 -->
    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { roomAPI, userAPI } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

// 超级管理员用户名
const SUPER_ADMIN_USERNAME = '1y4w1s'

// 判断是否为超级管理员
const isSuperAdmin = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return false
  try {
    const user = JSON.parse(userStr)
    const username = user.username || user.userName || user.name || user.UserName
    return username === '1y4w1s'
  } catch (e) {
    console.error('parse user error:', e)
    return false
  }
})

// 统一处理头像URL
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath || !avatarPath.trim()) {
    return '/default-avatar.png'
  }
  const path = avatarPath.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `${window.location.origin}${path}`
  }
  return `${window.location.origin}/${path}`
}

const rooms = ref([])
const currentRoomId = ref(null)
const currentRoom = ref(null)
const currentMembers = ref([])
const currentPermissions = ref({
  hasPermission: false,
  isAdmin: false,
  isOwner: false,
  isMuted: false,
  canSendMessage: true
})
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

// 成员预览相关
const previewRoomId = ref(null)
const previewMembers = ref([])
const previewPosition = ref({})

// 成员管理相关
const showMemberManagement = ref(false)
const showMuteModal = ref(false)
const selectedMember = ref(null)
const muteDuration = ref(30)
const customDays = ref(0)
const customHours = ref(0)
const customMinutes = ref(0)
const muteReason = ref('')
const muteDurationOptions = [
  { label: '5 分钟', value: 5 },
  { label: '30 分钟', value: 30 },
  { label: '1 小时', value: 60 },
  { label: '24 小时', value: 1440 }
]

// 解散确认相关
const showDissolveConfirm = ref(false)

// 操作提示
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

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
    await roomAPI.join(roomId, authStore.userId)
    currentRoomId.value = roomId
    currentRoom.value = rooms.value.find(r => r.id === roomId)
    
    // 加载消息历史
    const response = await roomAPI.getMessages(roomId)
    const API_BASE_URL = import.meta.env.VITE_API_URL || ''
    messages.value = response.data.messages
      .map(msg => {
        let avatar = '/default-avatar.png'
        if (msg.avatar && msg.avatar.trim()) {
          const avatarPath = msg.avatar.trim()
          avatar = avatarPath.startsWith('/') 
            ? `${window.location.origin}${avatarPath}`
            : avatarPath
        }
        return { ...msg, avatar }
      })
    
    // 加载成员列表
    await loadMembers(roomId)
    
    // 获取用户权限
    await loadPermissions(roomId)
    
    // 加入 WebSocket 房间
    authStore.joinRoom(roomId)
    
    setTimeout(() => {
      scrollToBottom(true)
    }, 200)
  } catch (error) {
    console.error('加入聊天室失败:', error)
  }
}

// 加载成员列表
const loadMembers = async (roomId) => {
  try {
    const response = await roomAPI.getMembers(roomId)
    currentMembers.value = response.data.members
  } catch (error) {
    console.error('加载成员列表失败:', error)
  }
}

// 加载用户权限
const loadPermissions = async (roomId) => {
  try {
    const response = await roomAPI.getPermissions(roomId, authStore.userId)
    currentPermissions.value = response.data
  } catch (error) {
    console.error('加载权限失败:', error)
  }
}

// 成员预览
const showMemberPreview = async (roomId, event) => {
  previewRoomId.value = roomId
  
  // 设置预览位置（悬浮在房间列表右侧）
  previewPosition.value = {
    position: 'fixed',
    left: '320px',
    top: '80px',
    zIndex: '1000'
  }
  
  try {
    const response = await roomAPI.getMembers(roomId)
    previewMembers.value = response.data.members
    console.log('成员预览数据:', previewMembers.value)
  } catch (error) {
    console.error('加载预览成员失败:', error)
    previewMembers.value = []
  }
}

const hideMemberPreview = () => {
  previewRoomId.value = null
  previewMembers.value = []
}

// 发送消息
const sendMessage = () => {
  if (!newMessage.value.trim() || !currentRoomId.value || currentPermissions.value.isMuted) {
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
    const response = await roomAPI.create({ ...newRoom.value, owner_id: authStore.userId })
    await loadRooms()
    showCreateModal.value = false
    joinRoom(response.data.room.id)
    newRoom.value = { name: '', description: '', type: 'public' }
    showToastMessage('聊天室创建成功！')
  } catch (error) {
    console.error('创建聊天室失败:', error)
    showToastMessage('创建聊天室失败', 'error')
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
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    uploadError.value = '只支持 JPG、PNG、GIF、WebP 格式'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '文件大小不能超过 5MB'
    return
  }
  
  uploadError.value = ''
  selectedFile.value = file
  
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
    
    const response = await userAPI.uploadAvatar(authStore.userId, formData)
    
    if (response.success) {
      const avatarPath = response.data.avatar
      let avatarUrl = avatarPath
      if (avatarPath.startsWith('/')) {
        avatarUrl = `${window.location.origin}${avatarPath}`
      }
      const updatedUser = { ...authStore.user, avatar: avatarUrl }
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      showAvatarUpload.value = false
      selectedFile.value = null
      avatarPreview.value = null
      
      showToastMessage('头像上传成功！')
    } else {
      uploadError.value = response.error?.message || '上传失败'
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    uploadError.value = '上传失败，请重试'
  } finally {
    uploading.value = false
  }
}

// 权限管理方法
const grantAdmin = async (userId) => {
  try {
    const response = await roomAPI.changeRole(
      currentRoomId.value,
      userId,
      'admin',
      authStore.userId,
      '授予管理员权限'
    )
    if (response.success) {
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('授予管理员权限失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const revokeAdmin = async (userId) => {
  try {
    const response = await roomAPI.changeRole(
      currentRoomId.value,
      userId,
      'member',
      authStore.userId,
      '撤销管理员权限'
    )
    if (response.success) {
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('撤销管理员权限失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const openMuteModal = (member) => {
  selectedMember.value = member
  muteDuration.value = 30
  customDays.value = 0
  customHours.value = 0
  customMinutes.value = 0
  muteReason.value = ''
  showMuteModal.value = true
}

const confirmMute = async () => {
  if (!selectedMember.value) return
  
  // 如果是自定义时长，计算总分钟数
  let duration
  if (muteDuration.value === 'custom') {
    // 限制最大值：29 天 23 小时 59 分钟
    const days = Math.min(customDays.value || 0, 29)
    const hours = Math.min(customHours.value || 0, 23)
    const minutes = Math.min(customMinutes.value || 0, 59)
    
    // 如果超过最大值，设置为 30 天 0 小时 0 分钟
    if (customDays.value > 29 || customHours.value > 23 || customMinutes.value > 59) {
      duration = 30 * 24 * 60 // 30 天 = 43200 分钟
    } else {
      duration = days * 24 * 60 + hours * 60 + minutes
    }
  } else {
    duration = muteDuration.value
  }
  
  // 如果时长为 0，不允许提交
  if (duration === 0) {
    showToastMessage('禁言时长不能为 0', 'error')
    return
  }
  
  try {
    const response = await roomAPI.muteMember(
      currentRoomId.value,
      selectedMember.value.id,
      true,
      duration,
      authStore.userId,
      muteReason.value || '违反聊天室规定'
    )
    if (response.success) {
      showMuteModal.value = false
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('禁言失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const unmuteMember = async (userId) => {
  try {
    const response = await roomAPI.muteMember(
      currentRoomId.value,
      userId,
      false,
      null,
      authStore.userId,
      '解除禁言'
    )
    if (response.success) {
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('解除禁言失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const confirmDissolve = async () => {
  try {
    let response
    if (isSuperAdmin.value) {
      response = await roomAPI.forceDeleteRoom(
        currentRoomId.value,
        authStore.userId
      )
    } else {
      response = await roomAPI.dissolveRoom(
        currentRoomId.value,
        authStore.userId
      )
    }
    
    if (response.success) {
      showDissolveConfirm.value = false
      currentRoomId.value = null
      currentRoom.value = null
      currentMembers.value = []
      messages.value = []
      await loadRooms()
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('操作失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

// 检查用户是否在底部
const isAtBottom = () => {
  if (!messageListRef.value) return true
  const { scrollTop, scrollHeight, clientHeight } = messageListRef.value
  return scrollHeight - scrollTop - clientHeight < 100
}

// 滚动到底部
const scrollToBottom = (force = false) => {
  if (!messageListRef.value) return
  if (force || isAtBottom()) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

const formatMuteDuration = (mutedUntil) => {
  if (!mutedUntil) {
    console.log('禁言时间为空:', mutedUntil)
    return ''
  }
  
  const now = new Date()
  const until = new Date(mutedUntil)
  const diffMs = until - now
  
  console.log('禁言时间计算:', {
    mutedUntil,
    until: until.toISOString(),
    now: now.toISOString(),
    diffMs
  })
  
  if (isNaN(diffMs) || diffMs <= 0) return '（已到期）'
  
  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    const remainingHours = diffHours % 24
    const remainingMinutes = diffMinutes % 60
    return `（${diffDays}天${remainingHours}小时${remainingMinutes}分钟）`
  } else if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60
    return `（${diffHours}小时${remainingMinutes}分钟）`
  } else {
    return `（${diffMinutes}分钟）`
  }
}

const formatMuteTime = (mutedUntil) => {
  if (!mutedUntil) return ''
  const until = new Date(mutedUntil)
  if (isNaN(until.getTime())) return ''
  return `禁言至：${formatTime(until)}`
}

// WebSocket 事件监听
const setupSocketListeners = () => {
  const socket = authStore.socket
  
  if (!socket) return
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || ''
  
  socket.on('new_message', (message) => {
    if (message.room_id === currentRoomId.value) {
      const avatar = message.avatar && message.avatar.trim()
        ? `${API_BASE_URL}${message.avatar}`
        : '/default-avatar.png'
      const messageWithAvatar = { ...message, avatar }
      messages.value.push(messageWithAvatar)
      nextTick(() => scrollToBottom())
    }
  })
  
  socket.on('user_avatar_updated', (data) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || ''
    messages.value = messages.value.map(msg => {
      if (msg.user_id === data.userId) {
        return { ...msg, avatar: `${API_BASE_URL}${data.avatar}` }
      }
      return msg
    })
  })
  
  socket.on('user_joined', (data) => {
    console.log('用户加入:', data.username)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
    }
  })
  
  socket.on('user_left', (data) => {
    console.log('用户离开:', data.username)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
    }
  })
  
  // 权限变更通知
  socket.on('role_changed', (data) => {
    console.log('角色变更:', data)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
      loadPermissions(currentRoomId.value)
      showToastMessage(
        data.role === 'admin' 
          ? '成员已被授予管理员权限' 
          : '成员管理员权限已被撤销'
      )
    }
  })
  
  // 禁言通知
  socket.on('member_muted', (data) => {
    console.log('成员被禁言:', data)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
      loadPermissions(currentRoomId.value)
      showToastMessage(`成员已被禁言`)
    }
  })
  
  // 解除禁言通知
  socket.on('member_unmuted', (data) => {
    console.log('成员解除禁言:', data)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
      loadPermissions(currentRoomId.value)
      showToastMessage(`成员已解除禁言`)
    }
  })
  
  // 聊天室解散通知
  socket.on('room_dissolved', (data) => {
    console.log('聊天室解散:', data)
    if (data.roomId === currentRoomId.value) {
      currentRoomId.value = null
      currentRoom.value = null
      currentMembers.value = []
      messages.value = []
      loadRooms()
      showToastMessage('聊天室已被解散', 'error')
    }
  })
  
  // 聊天室删除通知（超级管理员）
  socket.on('room_deleted', (data) => {
    console.log('聊天室被删除:', data)
    if (data.roomId === currentRoomId.value) {
      currentRoomId.value = null
      currentRoom.value = null
      currentMembers.value = []
      messages.value = []
      loadRooms()
      showToastMessage('聊天室已被强制删除', 'error')
    }
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
  width: 320px;
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
  position: relative;
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

/* 成员预览悬浮层 */
.member-preview {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 280px;
  overflow: hidden;
}

.preview-header {
  padding: 12px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
}

.member-count {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.preview-list {
  max-height: 300px;
  overflow-y: auto;
}

.preview-member {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  transition: background 0.1s;
}

.preview-member:hover {
  background: #f5f5f5;
}

.preview-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 3px;
}

.preview-status {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
}

.status-dot.online {
  background: #28a745;
}

.status-dot.offline {
  background: #999;
}

.status-dot.busy {
  background: #dc3545;
}

.status-dot.away {
  background: #ffc107;
}

.preview-role {
  background: #007bff;
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 4px;
  margin-left: 5px;
}

.preview-more {
  padding: 10px 15px;
  text-align: center;
  color: #999;
  font-size: 12px;
  background: #f8f9fa;
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
  overflow: hidden;
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
  overflow: hidden;
}

.chat-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h3 {
  color: #333;
  margin-bottom: 5px;
}

.header-left p {
  color: #666;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
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

.muted-notice {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #dc3545;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
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
  max-width: 450px;
  position: relative;
}

.danger-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  color: #333;
  margin: 0;
}

.danger-title {
  color: #dc3545;
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

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group .input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea.input {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0069d9;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* 成员管理弹窗 */
.member-management-modal {
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.member-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 15px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.role-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.role-badge.owner {
  background: #dc3545;
  color: white;
}

.role-badge.admin {
  background: #007bff;
  color: white;
}

.role-badge.member {
  background: #e9ecef;
  color: #495057;
}

.member-status {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.muted-badge {
  background: #dc3545;
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 4px;
}

.member-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 5px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-admin {
  background: #28a745;
  color: white;
}

.btn-admin:hover {
  background: #218838;
}

.btn-remove-admin {
  background: #ffc107;
  color: #333;
}

.btn-remove-admin:hover {
  background: #e0a800;
}

.btn-mute {
  background: #dc3545;
  color: white;
}

.btn-mute:hover {
  background: #c82333;
}

.btn-unmute {
  background: #6c757d;
  color: white;
}

.btn-unmute:hover {
  background: #5a6268;
}

/* 禁言时长选项 */
.duration-options {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
}

.duration-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.duration-btn:hover {
  border-color: #007bff;
}

.duration-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.duration-btn.custom-btn {
  order: 5;
}

.custom-duration-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.duration-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-small {
  width: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.input-small:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.duration-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 危险操作确认 */
.warning-text {
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 20px;
}

.confirm-check {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.confirm-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

/* Toast 提示 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 2000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #28a745;
}

.toast.error {
  background: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>