<template>
  <div class="register-container">
    <div class="register-card card">
      <h1 class="register-title">注册账号</h1>
      <p class="register-subtitle">创建您的聊天室账号</p>

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

        <button type="submit" class="btn btn-primary" :disabled="loading">
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

  // 验证密码
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  if (form.value.password.length < 6 || form.value.password.length > 32) {
    error.value = '密码长度必须在 6-32 个字符之间'
    return
  }

  // 密码强度验证
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  if (!passwordRegex.test(form.value.password)) {
    error.value = '密码必须包含大小写字母和数字'
    return
  }

  loading.value = true

  const { confirmPassword, ...registerData } = form.value
  const result = await authStore.register(registerData)

  if (result.success) {
    success.value = '注册成功，正在跳转...'
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else {
    error.value = result.message
  }

  loading.value = false
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.register-title {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.register-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 10px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-footer a {
  color: #007bff;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
