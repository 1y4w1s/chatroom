<template>
  <div class="message-list" ref="messageListRef">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message"
      :class="{ 'message-own': message.sender_id === currentUserId, 'message-deleted': message.is_deleted }"
      :data-message-id="message.id"
    >
      <img :src="getAvatarUrl(message.avatar, message.nickname || message.username)" class="message-avatar" @click="$emit('memberAction', message, $event)" style="cursor:pointer" />
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">{{ message.nickname || message.username }}</span>
          <span v-if="message.is_bot" class="bot-badge">🤖</span>
          <span v-if="message.is_at_all" class="at-all-badge">@all</span>
          <span class="message-time">{{ formatTime(message.created_at) }}</span>
        </div>
        <template v-if="message.is_deleted">
          <div class="message-recalled">消息已撤回</div>
        </template>
        <template v-else>
          <div v-if="message.reply_to" class="message-reply" @click="$emit('scrollToMessage', message.reply_to.id)">
            <div class="reply-sender">{{ message.reply_to.sender }}</div>
            <div class="reply-content">{{ message.reply_to.content }}</div>
          </div>
          <img v-if="message.type === 'image'" :src="getMessageImageUrl(message)" class="message-image" loading="lazy" @click="$emit('previewImage', message)" />
          <div v-else-if="message.type === 'file'" class="message-file" @click="$emit('downloadFile', message)">
            <span class="file-card-icon">{{ getFileIcon(message.file_name || message.content) }}</span>
            <div class="file-card-info">
              <div class="file-card-name">{{ message.file_name || message.content }}</div>
              <div class="file-card-size" v-if="message.file_size">{{ formatFileSize(message.file_size) }}</div>
            </div>
            <svg class="file-card-dl" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V11M4 7L8 11L12 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <div v-else class="message-text">{{ message.content }}</div>
        </template>
        <div v-if="!message.is_deleted" class="message-actions" @click.stop="$emit('toggleActions', message.id, $event)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="4" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <div v-if="showMessageActions === message.id" class="message-actions-menu" :style="messageActionsPos">
          <button @click.stop="$emit('reply', message)">回复</button>
          <button v-if="message.sender_id === currentUserId" @click.stop="$emit('recall', message)">撤回</button>
          <button v-if="message.type === 'image'" @click.stop="$emit('addToStickers', message)">添加到表情包</button>
        </div>
      </div>
    </div>
    <div ref="scrollAnchor"></div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: [Number, String],
    default: null
  },
  showMessageActions: {
    type: [Number, String, null],
    default: null
  },
  messageActionsPos: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['memberAction', 'scrollToMessage', 'previewImage', 'downloadFile', 'toggleActions', 'reply', 'recall', 'addToStickers'])

const messageListRef = ref(null)
const scrollAnchor = ref(null)

const getAvatarUrl = (avatar, name) => {
  if (!avatar) {
    return null
  }
  if (avatar.startsWith('http')) {
    return avatar
  }
  if (avatar.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL || ''}${avatar}`
  }
  return `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${avatar}`
}

const getMessageImageUrl = (message) => {
  if (!message.content) return ''
  return `${import.meta.env.VITE_API_URL || ''}/uploads/images/${message.content}`
}

const getFileIcon = (fileName) => {
  if (!fileName) return '📄'
  const ext = fileName.split('.').pop().toLowerCase()
  const icons = {
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    xls: '📗',
    xlsx: '📗',
    ppt: '📙',
    pptx: '📙',
    zip: '📦',
    rar: '📦',
    txt: '📝',
    jpg: '🖼',
    jpeg: '🖼',
    png: '🖼',
    gif: '🖼'
  }
  return icons[ext] || '📄'
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days < 7) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const scrollToBottom = (force = false) => {
  if (!messageListRef.value) return
  if (force || isAtBottom()) {
    const anchor = scrollAnchor.value
    if (anchor) {
      anchor.scrollIntoView({ block: 'nearest' })
    } else {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  }
}

const isAtBottom = () => {
  if (!messageListRef.value) return true
  const { scrollTop, scrollHeight, clientHeight } = messageListRef.value
  return scrollHeight - scrollTop - clientHeight < 50
}

defineExpose({
  messageListRef,
  scrollToBottom,
  isAtBottom
})
</script>
