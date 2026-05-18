﻿<template>
  <div class="profile-container">
    <div class="profile-header">
      <button class="btn btn-secondary" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        返回聊天
      </button>
      <h2>个人中心</h2>
    </div>

    <div class="profile-body">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <img :src="avatarUrl" class="profile-avatar" />
            <div class="avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>更换头像</span>
            </div>
          </div>
          <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" style="display:none" />
          <div class="avatar-info">
            <div class="display-name">{{ form.nickname || authStore.user?.nickname || authStore.user?.username }}</div>
            <div class="display-username">@{{ authStore.user?.username }}</div>
          </div>
        </div>

        <div v-if="uploading" class="upload-progress">上传中...</div>
        <div v-if="uploadError" class="msg error">{{ uploadError }}</div>
        <div v-if="uploadSuccess" class="msg success">{{ uploadSuccess }}</div>

        <div class="form-section">
          <h3>基本资料</h3>
          <div class="form-group">
            <label>昵称</label>
            <div class="input-row">
              <input v-model="form.nickname" type="text" class="input" maxlength="50" placeholder="请输入昵称" />
              <button class="btn btn-primary" @click="saveNickname" :disabled="saving">保存</button>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>在线状态</h3>
          <div class="status-options">
            <button 
              v-for="opt in statusOptions" 
              :key="opt.value" 
              class="status-btn" 
              :class="{ active: form.status === opt.value }" 
              @click="changeStatus(opt.value)"
            >
              <span class="status-icon" v-html="opt.icon"></span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <div class="form-section">
          <h3>修改密码</h3>
          <div class="form-group">
            <label>原密码</label>
            <input v-model="passwordForm.oldPassword" type="password" class="input" placeholder="请输入原密码" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="passwordForm.newPassword" type="password" class="input" placeholder="6-32位，包含大小写字母和数字" />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" class="input" placeholder="请再次输入新密码" />
          </div>
          <div v-if="passwordError" class="msg error">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="msg success">{{ passwordSuccess }}</div>
          <button class="btn btn-primary" @click="savePassword" :disabled="passwordSaving">修改密码</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const fileInput = ref(null)
const saving = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')

const form = reactive({
  nickname: '',
  status: 'online'
})

const statusOptions = [
  { 
    value: 'online', 
    label: '在线', 
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#22c55e"/></svg>' 
  },
  { 
    value: 'away', 
    label: '离开', 
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#eab308"/></svg>' 
  },
  { 
    value: 'invisible', 
    label: '隐身', 
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="#9ca3af"/><path d="M4 4L12 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>' 
  }
]

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordError = ref('')
const passwordSuccess = ref('')
const passwordSaving = ref(false)

const avatarUrl = computed(() => {
  const user = authStore.user
  if (!user) return '/default-avatar.png'
  return user.avatar || '/default-avatar.png'
})

const goBack = () => {
  router.push('/')
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event) => {
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
  uploadSuccess.value = ''
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await userAPI.uploadAvatar(authStore.userId, formData)

    if (response.success) {
      const avatarPath = response.data.avatar
      const API_BASE_URL = import.meta.env.VITE_API_URL || ''
      const fullUrl = avatarPath.startsWith('/') ? `${API_BASE_URL}${avatarPath}` : avatarPath
      authStore.user = { ...authStore.user, avatar: fullUrl }
      localStorage.setItem('user', JSON.stringify(authStore.user))
      uploadSuccess.value = '头像已更新'
    } else {
      uploadError.value = response.error?.message || '上传失败'
    }
  } catch (error) {
    uploadError.value = '上传失败，请重试'
  } finally {
    uploading.value = false
  }
}

const saveNickname = async () => {
  if (!form.nickname.trim()) return
  saving.value = true
  uploadError.value = ''
  uploadSuccess.value = ''
  try {
    const response = await userAPI.updateMe(authStore.userId, { nickname: form.nickname.trim() })
    if (response.success) {
      authStore.updateProfile({ nickname: form.nickname.trim() })
      uploadSuccess.value = '昵称已更新'
    }
  } catch (error) {
    uploadError.value = error.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const changeStatus = async (status) => {
  form.status = status
  try {
    await userAPI.changeStatus(authStore.userId, status)
    const updatedUser = { ...authStore.user, status }
    authStore.$patch({ user: updatedUser })
    localStorage.setItem('user', JSON.stringify(updatedUser))
  } catch (error) {
    console.error('修改状态失败:', error)
  }
}

const savePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (!passwordForm.oldPassword) {
    passwordError.value = '请输入原密码'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = '新密码长度至少 6 位'
    return
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
    passwordError.value = '新密码必须包含大小写字母和数字'
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }

  passwordSaving.value = true
  try {
    const response = await userAPI.changePassword(authStore.userId, passwordForm.oldPassword, passwordForm.newPassword)
    if (response.success) {
      passwordSuccess.value = '密码修改成功'
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }
  } catch (error) {
    passwordError.value = error.message || '修改密码失败'
  } finally {
    passwordSaving.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    form.nickname = authStore.user.nickname || authStore.user.username || ''
    form.status = authStore.user.status || 'online'
  }
})
</script>

<style scoped>
.profile-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.profile-header {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.profile-body {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px;
  width: 100%;
  overflow-y: auto;
}

.profile-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #f3f4f6;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 50%;
  gap: 4px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-info {
  flex: 1;
}

.display-name {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.display-username {
  font-size: 14px;
  color: #9ca3af;
}

.form-section {
  margin-bottom: 28px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.input-row .input {
  flex: 1;
}

.input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
}

.input:focus {
  outline: none;
  border-color: #1a1a1a;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.05);
}

.status-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
}

.status-btn:hover {
  border-color: #1a1a1a;
  background: #fafafa;
}

.status-btn.active {
  border-color: #1a1a1a;
  background: #1a1a1a;
  color: white;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-progress {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.msg {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
}

.msg.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.msg.success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
</style>
