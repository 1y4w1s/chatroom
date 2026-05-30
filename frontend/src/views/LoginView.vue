<template>
  <div class="login-container">
    <div class="login-card card">
      <div class="login-header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#1a1a1a"/>
            <path d="M14 18C14 15.8 15.8 14 18 14H30C32.2 14 34 15.8 34 18V28C34 30.2 32.2 32 30 32H24L18 36V32H18C15.8 32 14 30.2 14 28V18Z" fill="white"/>
            <path d="M20 22H28M20 26H25" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="login-title">{{ showForgot ? '找回密码' : '1y4w1s Chat' }}</h1>
        <p class="login-subtitle">{{ showForgot ? (resetStep === 1 ? '验证您的身份' : '设置新密码') : '登录您的账号继续' }}</p>
      </div>

      <form v-if="!showForgot" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名或邮箱</label>
          <UiInput
            v-model="form.username"
            type="text"
            placeholder="请输入用户名或邮箱"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <UiInput
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <UiButton type="submit" variant="primary" block :loading="loading" class="btn-block">
          {{ loading ? '登录中...' : '登录' }}
        </UiButton>

        <div class="forgot-link" @click="openForgot">忘记密码？</div>
      </form>

      <form v-else-if="resetStep === 1" @submit.prevent="handleVerify">
        <div class="form-group">
          <label>用户名</label>
          <UiInput
            v-model="resetForm.username"
            type="text"
            placeholder="请输入注册时的用户名"
          />
        </div>

        <div class="form-group">
          <label>注册邮箱</label>
          <UiInput
            v-model="resetForm.email"
            type="email"
            placeholder="请输入注册时的邮箱"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <UiButton type="submit" variant="primary" block :loading="loading" class="btn-block">
          {{ loading ? '验证中...' : '验证' }}
        </UiButton>

        <div class="forgot-link" @click="closeForgot">返回登录</div>
      </form>

      <form v-else @submit.prevent="handleReset">
        <div class="form-group">
          <label>新密码</label>
          <UiInput
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-32位）"
          />
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <UiInput
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="再次输入新密码"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <UiButton type="submit" variant="primary" block :loading="loading" class="btn-block">
          {{ loading ? '重置中...' : '重置密码' }}
        </UiButton>

        <div class="forgot-link" @click="closeForgot">返回登录</div>
      </form>

      <div v-if="!showForgot" class="login-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api'
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const showForgot = ref(false)
const resetStep = ref(1)
const resetForm = ref({
  username: '',
  email: '',
  newPassword: '',
  confirmPassword: ''
})
const resetUserId = ref(null)

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const result = await authStore.login(form.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.message
  }

  loading.value = false
}

const openForgot = () => {
  showForgot.value = true
  resetStep.value = 1
  error.value = ''
  resetForm.value = { username: '', email: '', newPassword: '', confirmPassword: '' }
}

const closeForgot = () => {
  showForgot.value = false
  error.value = ''
}

const handleVerify = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await authAPI.verifyReset({
      username: resetForm.value.username,
      email: resetForm.value.email
    })
    resetUserId.value = response.data.userId
    resetStep.value = 2
    error.value = ''
  } catch (e) {
    error.value = e.message
  }

  loading.value = false
}

const handleReset = async () => {
  loading.value = true
  error.value = ''

  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    error.value = '两次密码不一致'
    loading.value = false
    return
  }

  if (resetForm.value.newPassword.length < 6) {
    error.value = '密码长度至少 6 位'
    loading.value = false
    return
  }

  try {
    await authAPI.resetPassword({
      userId: resetUserId.value,
      newPassword: resetForm.value.newPassword
    })
    showForgot.value = false
    resetStep.value = 1
    error.value = ''
    form.value.password = ''
  } catch (e) {
    error.value = e.message
  }

  loading.value = false
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--bg-body, #fafafa);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  margin-bottom: 20px;
  display: inline-block;
}

.login-title {
  text-align: center;
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 8px;
  font-size: var(--text-3xl, 24px);
  font-weight: 600;
}

.login-subtitle {
  text-align: center;
  color: var(--text-secondary, #6b7280);
  font-size: var(--text-base, 14px);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  color: var(--text-secondary, #374151);
  margin-bottom: 8px;
}

.btn-block {
  margin-top: 8px;
}

.error-message {
  color: var(--danger, #dc2626);
  font-size: var(--text-sm, 13px);
  margin-bottom: 16px;
  padding: 12px;
  background: var(--danger-bg, #fef2f2);
  border-radius: var(--radius, 8px);
  border: 1px solid var(--danger-border, #fecaca);
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: var(--text-base, 14px);
  color: var(--text-secondary, #6b7280);
}

.login-footer a {
  color: var(--accent, #1a1a1a);
  font-weight: 500;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.forgot-link {
  text-align: center;
  margin-top: 16px;
  font-size: var(--text-sm, 13px);
  color: var(--text-tertiary, #6b7280);
  cursor: pointer;
  user-select: none;
}

.forgot-link:hover {
  color: var(--text-primary, #1a1a1a);
  text-decoration: underline;
}
</style>
