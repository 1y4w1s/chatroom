<template>
  <footer class="chat-input-footer">
    <div v-if="hasActiveMute" class="muted-notice">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="var(--danger)" stroke-width="1.5"/>
        <path d="M8 4V9" stroke="var(--danger)" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="8" cy="11.5" r="1" fill="var(--danger)"/>
      </svg>
      您已被禁言，无法发送消息
    </div>
    <div class="cc-card" v-else>
      <div v-if="replyTarget" class="reply-bar">
        <div class="reply-bar-left">
          <span class="reply-bar-label">回复 @{{ replyTarget.nickname || replyTarget.username }}</span>
          <span class="reply-bar-content">{{ replyTarget.display }}</span>
        </div>
        <button class="reply-bar-close" @click="$emit('clearReply')">×</button>
      </div>
      <div class="cc-input-row">
        <div class="cc-input-wrap">
          <input v-model="newMessage" class="cc-input" placeholder="输入消息..." @keyup.enter="$emit('send')" @input="handleInput" @keydown="handleKeydown" @paste="handlePaste" />
          <div v-if="showMentionPanel" class="mention-panel" ref="mentionPanelRef">
            <div class="mention-panel-header">
              <span>成员列表</span>
              <span class="mention-count">{{ filteredMentionMembers.length }}人</span>
            </div>
            <div class="mention-panel-list">
              <div v-for="(member, index) in filteredMentionMembers" :key="member.id" class="mention-panel-item" :class="{ active: mentionSelectedIndex === index }" @click="$emit('selectMention', member)" @mouseenter="mentionSelectedIndex = index">
                <img :src="getAvatarUrl(member.avatar, member.nickname || member.username)" class="mention-avatar" />
                <div class="mention-info">
                  <span class="mention-name">{{ member.nickname || member.username }}</span>
                  <span v-if="member.is_bot" class="bot-tag">🤖</span>
                </div>
                <span v-if="member.role === 'owner'" class="role-badge owner">群主</span>
                <span v-else-if="member.role === 'admin'" class="role-badge admin">管理员</span>
              </div>
              <div v-if="filteredMentionMembers.length === 0" class="mention-panel-empty">无匹配成员</div>
            </div>
          </div>
        </div>
        <button v-if="showEmoji" class="cc-icon-btn active" @click="$emit('toggleEmoji')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        </button>
        <button v-else class="cc-icon-btn" @click="$emit('toggleEmoji')" title="表情">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        </button>
        <label class="cc-icon-btn" title="图片">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="8" r="1.5" fill="currentColor"/><path d="M2.5 13L7 9L11 13L14.5 10L17.5 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          <input type="file" accept="image/*" multiple @change="handleImageSelect" hidden />
        </label>
        <label class="cc-icon-btn" title="文件">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4C4 3 4.5 2 6 2H12L17 7V16C17 17 16 18 15 18H6C5 18 4 17 4 16V4Z" stroke="currentColor" stroke-width="1.3"/><path d="M12 2V6H17" stroke="currentColor" stroke-width="1.3"/></svg>
          <input type="file" accept=".pdf,.doc,.docx,.zip,.rar,.txt,.xls,.xlsx,.ppt,.pptx" @change="handleFileSelect" hidden />
        </label>
        <button class="cc-send-btn" @click="$emit('send')" :disabled="!newMessage.trim() && images.length === 0 && files.length === 0">发送</button>
      </div>
      <div v-if="images.length" class="cc-previews">
        <div v-for="(img, i) in images" :key="i" class="cc-preview-item">
          <img :src="img.preview" />
          <button class="cc-preview-del" @click="$emit('removeImage', i)">×</button>
        </div>
      </div>
      <div v-if="files.length" class="cc-previews">
        <div v-for="(f, i) in files" :key="i" class="cc-file-preview">
          <span class="cc-file-icon">{{ getFileIcon(f.file.name) }}</span>
          <div class="cc-file-info">
            <div class="cc-file-name">{{ f.file.name }}</div>
            <div class="cc-file-size">{{ formatFileSize(f.file.size) }}</div>
          </div>
          <button class="cc-preview-del" @click="$emit('removeFile', i)">×</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  hasActiveMute: {
    type: Boolean,
    default: false
  },
  replyTarget: {
    type: Object,
    default: null
  },
  showEmoji: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    default: () => []
  },
  files: {
    type: Array,
    default: () => []
  },
  members: {
    type: Array,
    default: () => []
  },
  mentionSelectedIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['send', 'clearReply', 'toggleEmoji', 'selectMention', 'removeImage', 'removeFile', 'imageSelect', 'fileSelect', 'typing', 'mentionInput', 'mentionKeydown', 'paste'])

const newMessage = ref('')
const showMentionPanel = ref(false)
const mentionPanelRef = ref(null)

const filteredMentionMembers = computed(() => {
  if (!showMentionPanel.value) return []
  const lastAtIndex = newMessage.value.lastIndexOf('@')
  if (lastAtIndex === -1) return props.members
  
  const searchStr = newMessage.value.slice(lastAtIndex + 1).toLowerCase()
  return props.members.filter(m => 
    (m.nickname || m.username).toLowerCase().includes(searchStr)
  )
})

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

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const handleInput = (event) => {
  const value = event.target.value
  const lastAtIndex = value.lastIndexOf('@')
  
  if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
    showMentionPanel.value = true
  } else if (lastAtIndex !== -1) {
    const afterAt = value.slice(lastAtIndex + 1)
    if (afterAt.length > 0 && !afterAt.includes(' ')) {
      showMentionPanel.value = true
    } else {
      showMentionPanel.value = false
    }
  } else {
    showMentionPanel.value = false
  }
  
  emit('typing')
  emit('mentionInput', event)
}

const handleKeydown = (event) => {
  if (showMentionPanel.value && filteredMentionMembers.value.length > 0) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      emit('mentionKeydown', 'down')
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      emit('mentionKeydown', 'up')
    } else if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault()
      const selectedMember = filteredMentionMembers.value[mentionSelectedIndex.value]
      if (selectedMember) {
        emit('selectMention', selectedMember)
      }
    }
  }
}

const handlePaste = (event) => {
  emit('paste', event)
}

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files)
  emit('imageSelect', files)
  event.target.value = ''
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  emit('fileSelect', files)
  event.target.value = ''
}

watch(() => props.showEmoji, (val) => {
  if (!val) {
    showMentionPanel.value = false
  }
})

defineExpose({
  newMessage,
  showMentionPanel
})
</script>

<style scoped>
:deep(.cc-file-preview) {
  position: relative !important;
  display: flex;
  align-items: center;
}

:deep(.cc-preview-del) {
  position: absolute !important;
  top: -7px !important;
  right: -7px !important;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
