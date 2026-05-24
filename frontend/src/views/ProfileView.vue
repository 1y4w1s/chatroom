<template>
  <div class="profile-container">
    <div class="profile-header">
      <UiButton variant="ghost" @click="goBack">
        <template #icon>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        返回聊天
      </UiButton>
      <h2>个人中心</h2>
    </div>

    <div class="profile-body">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper" @click="triggerFileInput">
            <UiAvatar :src="avatarUrl" :name="authStore.user?.nickname || authStore.user?.username" size="xl" />
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
              <UiInput v-model="form.nickname" type="text" maxlength="50" placeholder="请输入昵称" />
              <UiButton variant="primary" @click="saveNickname" :disabled="saving" size="md">保存</UiButton>
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
            <UiInput v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <UiInput v-model="passwordForm.newPassword" type="password" placeholder="6-32位，包含大小写字母和数字" />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <UiInput v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
          </div>
          <div v-if="passwordError" class="msg error">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="msg success">{{ passwordSuccess }}</div>
          <UiButton variant="primary" @click="savePassword" :disabled="passwordSaving" :loading="passwordSaving">
            修改密码
          </UiButton>
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
import UiAvatar from '@/components/ui/Avatar.vue'
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

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
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="var(--status-online)"/></svg>'
  },
  {
    value: 'away',
    label: '离开',
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="var(--status-away)"/></svg>'
  },
  {
    value: 'invisible',
    label: '隐身',
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" fill="var(--text-tertiary)"/><path d="M4 4L12 12" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
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
  if (!user) return ''
  return user.avatar || ''
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
  background: var(--bg-body);
}

.profile-header {
  padding: 20px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-header h2 {
  font-size: var(--text-xl, 18px);
  font-weight: 600;
  color: var(--text-primary);
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
  background: var(--bg-primary);
  border-radius: var(--radius-lg, 16px);
  padding: 28px;
  box-shadow: var(--shadow);
  border: 1px solid var(--hover);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay, rgba(0,0,0,0.5));
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs, 11px);
  opacity: 0;
  transition: opacity var(--transition, 200ms);
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
  font-size: var(--text-xl, 18px);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.display-username {
  font-size: var(--text-base, 14px);
  color: var(--text-tertiary);
}

.form-section {
  margin-bottom: 28px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  font-size: var(--text-lg, 16px);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-row :deep(.ui-input__container) {
  flex: 1;
  min-width: 0;
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
  border: 1px solid var(--border);
  border-radius: var(--radius, 8px);
  background: var(--bg-primary);
  cursor: pointer;
  font-size: var(--text-base, 14px);
  color: var(--text-primary);
  transition: all var(--transition-fast, 150ms);
}

.status-btn:hover {
  border-color: var(--text-primary);
  background: var(--hover);
}

.status-btn.active {
  border-color: var(--text-primary);
  background: var(--accent-bg);
  color: var(--text-on-accent, white);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-progress {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-base, 14px);
  margin-bottom: 16px;
  padding: 12px;
  background: var(--hover-light);
  border-radius: var(--radius, 8px);
}

.msg {
  padding: 12px 14px;
  border-radius: var(--radius, 8px);
  font-size: var(--text-sm, 13px);
  margin-bottom: 16px;
}

.msg.error {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger-border);
}

.msg.success {
  background: var(--success-bg);
  color: var(--success);
  border: 1px solid #bbf7d0;
}
</style>
