<template>
  <main class="chat-main">
    <div v-if="currentRoomId" class="main-tabs">
      <button class="main-tab" :class="{ active: activeMainTab === 'chat' }" @click="$emit('switchTab', 'chat')">聊天室</button>
      <button class="main-tab" :class="{ active: activeMainTab === 'post' }" @click="$emit('switchTab', 'post')" v-if="hasPostDetail">帖子详情</button>
    </div>

    <div v-if="currentRoomId" class="chat-wrapper">
      <div class="chat-header">
        <div class="header-left">
          <h3>{{ currentRoom?.name || '聊天室' }}</h3>
          <p v-if="currentRoom?.description">{{ currentRoom.description }}</p>
        </div>
        <div class="header-right">
          <button class="header-more-btn" @click="$emit('openDrawer')" title="聊天室信息">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="5.5" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="14.5" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      <MessageList
        ref="messageListRef"
        :messages="messages"
        :currentUserId="currentUserId"
        :showMessageActions="showMessageActions"
        :messageActionsPos="messageActionsPos"
        @memberAction="$emit('memberAction', $event)"
        @scrollToMessage="$emit('scrollToMessage', $event)"
        @previewImage="$emit('previewImage', $event)"
        @downloadFile="$emit('downloadFile', $event)"
        @toggleActions="toggleMessageActions"
        @reply="$emit('reply', $event)"
        @recall="$emit('recall', $event)"
        @addToStickers="$emit('addToStickers', $event)"
      />

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
              <span class="reply-bar-label">回复 @{{ replyTarget.sender }}</span>
              <span class="reply-bar-content">{{ replyTarget.display }}</span>
            </div>
            <button class="reply-bar-close" @click="$emit('clearReply')">×</button>
          </div>
          <div class="cc-input-row">
            <div class="cc-input-wrap">
              <input v-model="newMessage" class="cc-input" placeholder="输入消息..." @keyup.enter="sendMessage" @input="handleInput" @keydown="handleMentionKeydown" @paste="handlePaste" />
              <div v-if="showMentionPanel" class="mention-panel" ref="mentionPanelRef">
                <div class="mention-panel-header">
                  <span>成员列表</span>
                  <span class="mention-count">{{ filteredMentionMembers.length }}人</span>
                </div>
                <div class="mention-panel-list">
                  <div v-for="(member, index) in filteredMentionMembers" :key="member.id" class="mention-panel-item" :class="{ active: mentionSelectedIndex === index }" @click="selectMentionMember(member)" @mouseenter="mentionSelectedIndex = index">
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
            <button v-if="showChatEmoji" class="cc-icon-btn active" @click="showChatEmoji = false">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            </button>
            <button v-else class="cc-icon-btn" @click="showChatEmoji = true" title="表情">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            </button>
            <label class="cc-icon-btn" title="图片">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="8" r="1.5" fill="currentColor"/><path d="M2.5 13L7 9L11 13L14.5 10L17.5 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              <input type="file" accept="image/*" multiple @change="handleChatImageSelect" hidden />
            </label>
            <button class="cc-send-btn" @click="sendMessage" :disabled="!newMessage.trim() && chatImages.length === 0">发送</button>
          </div>
          <div v-if="chatImages.length" class="cc-previews">
            <div v-for="(img, i) in chatImages" :key="i" class="cc-preview-item">
              <img :src="img.preview" />
              <button class="cc-preview-del" @click="removeChatImage(i)">×</button>
            </div>
          </div>
          <div v-if="showChatEmoji" ref="chatEmojiRef" class="cc-emoji-panel">
            <div class="emoji-panel-tabs">
              <button class="emoji-panel-tab" :class="{ active: emojiTab === 'emoji' }" @click="emojiTab = 'emoji'" title="表情">😊</button>
              <button class="emoji-panel-tab" :class="{ active: emojiTab === 'stickers' }" @click="emojiTab = 'stickers'" :title="'收藏表情 (' + myStickers.length + ')'">
                <svg width="16" height="16" viewBox="0 0 16 16" :fill="emojiTab === 'stickers' ? 'var(--danger)' : 'none'" stroke="currentColor" stroke-width="1.3">
                  <path d="M8 2.5L9.5 6L13 6.5L10.5 9L11 12.5L8 11L5 12.5L5.5 9L3 6.5L6.5 6L8 2.5Z"/>
                </svg>
              </button>
            </div>
            <div v-if="emojiTab === 'emoji'">
              <div v-for="category in emojiCategories" :key="category.name" class="cc-emoji-group">
                <div class="cc-emoji-label">{{ category.name }}</div>
                <div class="cc-emoji-grid">
                  <button v-for="emoji in category.emojis" :key="emoji" class="cc-emoji-cell" @click="insertChatEmoji(emoji)">{{ emoji }}</button>
                </div>
              </div>
            </div>
            <div v-if="emojiTab === 'stickers'" class="sticker-grid">
              <div v-if="myStickers.length === 0" class="sticker-empty">还没有收藏的表情包<br>在图片消息上点击 ⋯ 添加</div>
              <button v-for="(sticker, i) in myStickers" :key="i" class="sticker-cell" @click="sendSticker(sticker)">
                <img :src="sticker" class="sticker-img" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <div v-if="!currentRoomId && !hasPostDetail" class="no-room">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="12" width="48" height="40" rx="4" stroke="var(--border)" stroke-width="2"/>
        <path d="M8 24H56" stroke="var(--border)" stroke-width="2"/>
        <circle cx="16" cy="18" r="2" fill="var(--border)"/>
        <circle cx="24" cy="18" r="2" fill="var(--border)"/>
        <circle cx="32" cy="18" r="2" fill="var(--border)"/>
      </svg>
      <p>请选择一个聊天室</p>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import MessageList from './MessageList.vue'
import { emojiCategories } from '@/utils/emojis'
import { getAvatarUrl, getMessageImageUrl, compressImage } from '@/composables/useChatUtils'

const props = defineProps({
  currentRoomId: { type: [Number, String], default: null },
  currentRoom: { type: Object, default: null },
  messages: { type: Array, default: () => [] },
  currentUserId: { type: [Number, String], default: null },
  hasActiveMute: { type: Boolean, default: false },
  replyTarget: { type: Object, default: null },
  activeMainTab: { type: String, default: 'chat' },
  hasPostDetail: { type: Boolean, default: false },
  members: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'switchTab', 'openDrawer',
  'sendMessage', 'sendImage', 'typing',
  'clearReply', 'reply', 'recall', 'addToStickers',
  'downloadFile', 'previewImage', 'scrollToMessage',
  'memberAction'
])

const messageListRef = ref(null)
const newMessage = ref('')
const showChatEmoji = ref(false)
const chatImages = ref([])
const chatEmojiRef = ref(null)
const showMentionPanel = ref(false)
const mentionQuery = ref('')
const mentionSelectedIndex = ref(0)
const mentionPanelRef = ref(null)
const emojiTab = ref('emoji')
const stickerVersion = ref(0)
const showMessageActions = ref(null)
const messageActionsPos = ref({})

const myStickers = computed(() => {
  void stickerVersion.value
  try {
    return JSON.parse(localStorage.getItem('my_stickers') || '[]')
  } catch { return [] }
})

const filteredMentionMembers = computed(() => {
  if (!showMentionPanel.value) return []
  const cursorPos = getCursorPosition()
  if (cursorPos === -1) return []
  const textBefore = newMessage.value.slice(0, cursorPos)
  const atIndex = textBefore.lastIndexOf('@')
  if (atIndex === -1) return props.members

  const searchStr = textBefore.slice(atIndex + 1).toLowerCase()
  return props.members.filter(m =>
    (m.nickname || m.username).toLowerCase().includes(searchStr)
  )
})

function getCursorPosition() {
  const input = document.querySelector('.cc-input-wrap .cc-input')
  if (!input) return -1
  return input.selectionStart
}

function handleInput(event) {
  const cursorPos = event.target.selectionStart
  if (cursorPos === -1) { showMentionPanel.value = false; return }
  const textBefore = newMessage.value.slice(0, cursorPos)
  const atIndex = textBefore.lastIndexOf('@')
  if (atIndex !== -1) {
    const afterAt = textBefore.slice(atIndex + 1)
    const charBeforeAt = atIndex > 0 ? textBefore[atIndex - 1] : ' '
    const isNewMention = charBeforeAt === ' ' || charBeforeAt === '\n' || textBefore.length === 1
    if (isNewMention && afterAt.length <= 20 && !afterAt.includes(' ')) {
      mentionQuery.value = afterAt
      mentionSelectedIndex.value = 0
      showMentionPanel.value = true
      emit('typing')
      return
    }
  }
  showMentionPanel.value = false
  emit('typing')
}

function handleMentionKeydown(e) {
  if (!showMentionPanel.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    mentionSelectedIndex.value = Math.min(mentionSelectedIndex.value + 1, filteredMentionMembers.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    mentionSelectedIndex.value = Math.max(mentionSelectedIndex.value - 1, 0)
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (filteredMentionMembers.value.length > 0 && mentionSelectedIndex.value >= 0) {
      e.preventDefault()
      selectMentionMember(filteredMentionMembers.value[mentionSelectedIndex.value])
    }
  } else if (e.key === 'Escape') {
    showMentionPanel.value = false
  }
}

function selectMentionMember(member) {
  const cursorPos = getCursorPosition()
  if (cursorPos === -1) return
  const textBefore = newMessage.value.slice(0, cursorPos)
  const atIndex = textBefore.lastIndexOf('@')
  if (atIndex === -1) return
  const name = member.nickname || member.username || member.username
  const beforeAt = textBefore.slice(0, atIndex)
  const afterAt = newMessage.value.slice(cursorPos)
  newMessage.value = beforeAt + '@' + name + ' ' + afterAt
  showMentionPanel.value = false
  nextTick(() => {
    const input = document.querySelector('.cc-input-wrap .cc-input')
    if (input) {
      const newPos = beforeAt.length + name.length + 2
      input.setSelectionRange(newPos, newPos)
      input.focus()
    }
  })
}

function handlePaste(e) {
  const items = e.clipboardData.items
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) {
        chatImages.value.push({ file, preview: URL.createObjectURL(file) })
      }
      break
    }
  }
}

function handleChatImageSelect(e) {
  for (const file of e.target.files) {
    chatImages.value.push({ file, preview: URL.createObjectURL(file) })
  }
  e.target.value = ''
}

function removeChatImage(i) {
  URL.revokeObjectURL(chatImages.value[i].preview)
  chatImages.value.splice(i, 1)
}

function insertChatEmoji(emoji) {
  newMessage.value += emoji
}

function toggleMessageActions(messageId, event) {
  if (showMessageActions.value === messageId) {
    showMessageActions.value = null
    return
  }
  showMessageActions.value = messageId
  const msgEl = event.currentTarget.closest('.message')
  if (msgEl) {
    const rect = msgEl.getBoundingClientRect()
    messageActionsPos.value = {
      position: 'fixed',
      left: rect.left + 'px',
      top: (rect.bottom + 4) + 'px',
      zIndex: '2100'
    }
  }
}

async function sendMessage() {
  if ((!newMessage.value.trim() && chatImages.value.length === 0)) return
  const text = newMessage.value.trim()
  if (text) {
    emit('sendMessage', text)
  }
  for (const img of chatImages.value) {
    emit('sendImage', img.file)
  }
  newMessage.value = ''
  chatImages.value = []
}

async function sendSticker(url) {
  emit('sendMessage', url)
  showChatEmoji.value = false
}

function scrollToBottom(force = false) {
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom(force)
  }
}

watch(showChatEmoji, (val) => {
  if (!val) {
    showMentionPanel.value = false
  }
})

defineExpose({
  newMessage,
  scrollToBottom,
  messageListRef
})
</script>