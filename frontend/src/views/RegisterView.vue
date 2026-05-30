<template>
  <div class="register-container">
    <div class="register-card card">
      <div class="register-header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#1a1a1a"/>
            <path d="M14 18C14 15.8 15.8 14 18 14H30C32.2 14 34 15.8 34 18V28C34 30.2 32.2 32 30 32H24L18 36V32H18C15.8 32 14 30.2 14 28V18Z" fill="white"/>
            <path d="M20 22H28M20 26H25" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="register-title">注册账号</h1>
        <p class="register-subtitle">创建您的聊天室账号</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <UiInput
            v-model="form.username"
            type="text"
            placeholder="3-20 个字符，只能包含字母、数字和下划线"
          />
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <UiInput
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱地址"
          />
        </div>

        <div class="form-group">
          <label>昵称</label>
          <UiInput
            v-model="form.nickname"
            type="text"
            placeholder="请输入昵称（可选）"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <UiInput
            v-model="form.password"
            type="password"
            placeholder="6-32 个字符，必须包含大小写字母和数字"
          />
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <UiInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>

        <UiButton type="submit" variant="primary" block :loading="loading" class="btn-block">
          {{ loading ? '注册中...' : '注册' }}
        </UiButton>
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
import UiInput from '@/components/ui/Input.vue'
import UiButton from '@/components/ui/Button.vue'

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
  background: var(--bg-body, #fafafa);
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
  color: var(--text-primary, #1a1a1a);
  margin-bottom: 8px;
  font-size: var(--text-3xl, 24px);
  font-weight: 600;
}

.register-subtitle {
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

.success-message {
  color: var(--success, #16a34a);
  font-size: var(--text-sm, 13px);
  margin-bottom: 16px;
  padding: 12px;
  background: var(--success-bg, #f0fdf4);
  border-radius: var(--radius, 8px);
  border: 1px solid #bbf7d0;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: var(--text-base, 14px);
  color: var(--text-secondary, #6b7280);
}

.register-footer a {
  color: var(--accent, #1a1a1a);
  font-weight: 500;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
