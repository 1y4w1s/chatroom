<template>
  <div class="room-container">
    <div class="room-header">
      <button class="btn btn-secondary" @click="goBack">← 返回</button>
      <h2>聊天室：{{ roomName }}</h2>
    </div>
    <div class="room-content">
      <p>聊天室详情页面（后续开发）</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const roomName = '公共聊天室'

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.room-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.room-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.room-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
}
</style>
