import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 初始化 WebSocket 连接
const authStore = useAuthStore()
if (authStore.user) {
  console.log('检测到已登录用户，正在连接 WebSocket...')
  authStore.connectSocket()
}

app.use(router)
app.mount('#app')
