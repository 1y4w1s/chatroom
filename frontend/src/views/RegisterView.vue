<template>
  <div class="register-container">
    <div class="register-card card">
      <div class="register-header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#1a1a1a"/>
            <path d="M14 24L20 30L34 16" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="register-title">注册账号</h1>
        <p class="register-subtitle">创建您的聊天室账号</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="input"
            placeholder="3-20 个字符，只能包含字母、数字和下划线"
            required
            pattern="[a-zA-Z0-9_]{3,20}"
          />
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="请输入邮箱地址"
            required
          />
        </div>

        <div class="form-group">
          <label>昵称</label>
          <input
            v-model="form.nickname"
            type="text"
            class="input"
            placeholder="请输入昵称（可选）"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="6-32 个字符，必须包含大小写字母和数字"
            required
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,32}$"
          />
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="input"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="register-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.value.password)) {
    error.value = '密码必须包含大小写字母和数字'
    return
  }

  loading.value = true

  try {
    const response = await authStore.register({
      username: form.value.username,
      email: form.value.email,
      nickname: form.value.nickname || form.value.username,
      password: form.value.password
    })

    if (response.success) {
      success.value = '注册成功！正在跳转登录...'
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      error.value = response.message || '注册失败'
    }
  } catch (err) {
    error.value = err.message || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #fafafa;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  margin-bottom: 20px;
  display: inline-block;
}

.register-title {
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
}

.register-subtitle {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 14px 16px;
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

.btn-block {
  width: 100%;
  padding: 14px 20px;
  font-size: 15px;
  margin-top: 8px;
}

.error-message {
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.success-message {
  color: #16a34a;
  font-size: 13px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
}

.register-footer a {
  color: #1a1a1a;
  font-weight: 500;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
