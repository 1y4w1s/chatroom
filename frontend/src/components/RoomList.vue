<template>
  <div class="room-list-container">
    <div class="room-list-header">
      <span class="room-list-title">聊天列表</span>
      <button class="btn btn-primary btn-sm" @click="$emit('create')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2V12M2 7H12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        新建群聊
      </button>
    </div>

    <div class="room-category">
      <div class="category-header" @click="showGroupChats = !showGroupChats">
        <span class="category-arrow" :class="{ expanded: showGroupChats }">▸</span>
        <span class="category-label">群聊</span>
        <span class="category-count">{{ groupRooms.length }}</span>
      </div>
      <div v-show="showGroupChats">
        <div
          v-for="room in groupRooms"
          :key="room.id"
          class="room-item"
          :class="{ active: currentRoomId === room.id }"
          @click="$emit('select', room.id)"
          @mouseenter="$emit('preview', room.id, $event)"
          @mouseleave="$emit('preview', null)"
          @touchstart="$emit('touchStart', room.id, $event)"
          @touchend="$emit('touchEnd')"
        >
          <div class="room-icon">
            <img v-if="getRoomListAvatar(room)" :src="getRoomListAvatar(room)" class="room-list-avatar" />
            <div v-else class="default-avatar" :style="{ background: nameColor(room.display_name || room.name) }">
              <span>{{ (room.display_name || room.name)[0] }}</span>
            </div>
            <span v-if="getRoomUnread(room.id)" class="unread-badge">{{ formatUnread(getRoomUnread(room.id)) }}</span>
            <span v-if="getRoomMention(room.id)" class="mention-badge">@</span>
          </div>
          <div class="room-info">
            <div class="room-name">{{ room.display_name || room.name }}</div>
            <div class="room-desc" v-if="room.description">{{ room.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="room-category">
      <div class="category-header" @click="showPrivateChats = !showPrivateChats">
        <span class="category-arrow" :class="{ expanded: showPrivateChats }">▸</span>
        <span class="category-label">私聊</span>
        <span class="category-count">{{ privateRooms.length }}</span>
      </div>
      <div v-show="showPrivateChats">
        <div
          v-for="room in privateRooms"
          :key="room.id"
          class="room-item"
          :class="{ active: currentRoomId === room.id }"
          @click="$emit('select', room.id)"
        >
          <div class="room-icon">
            <img v-if="getRoomListAvatar(room)" :src="getRoomListAvatar(room)" class="room-list-avatar" />
            <div v-else class="default-avatar" :style="{ background: nameColor(room.display_name || room.name) }">
              <span>{{ (room.display_name || room.name)[0] }}</span>
            </div>
            <span v-if="getRoomUnread(room.id)" class="unread-badge">{{ formatUnread(getRoomUnread(room.id)) }}</span>
          </div>
          <div class="room-info">
            <div class="room-name">{{ room.display_name || room.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="previewRoomId && previewMembers.length > 0" 
      class="member-preview"
      :style="previewPosition"
    >
      <div class="preview-header">
        <span>{{ rooms.find(r => r.id === previewRoomId)?.name || '成员列表' }}</span>
        <span class="member-count">{{ previewMembers.length }}人</span>
      </div>
      <div class="preview-list">
        <div
          v-for="member in previewMembers.slice(0, 6)"
          :key="member.id"
          class="preview-member"
        >
          <img :src="getAvatarUrl(member.avatar, member.nickname || member.username)" class="preview-avatar" />
          <div class="preview-info">
            <div class="preview-name">{{ member.nickname || member.username }}</div>
            <template v-if="!member.is_bot">
              <div class="preview-status" :class="member.status">
                <span class="status-dot" :class="member.status"></span>
                {{ member.status === 'online' ? '在线' : member.status === 'away' ? '离开' : '离线' }}
              </div>
            </template>
            <div v-else class="preview-status bot-status">🤖 机器人</div>
          </div>
        </div>
        <div v-if="previewMembers.length > 6" class="preview-more">
          还有 {{ previewMembers.length - 6 }} 位成员...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rooms: {
    type: Array,
    default: () => []
  },
  currentRoomId: {
    type: [Number, String],
    default: null
  },
  previewMembers: {
    type: Array,
    default: () => []
  },
  previewRoomId: {
    type: [Number, String],
    default: null
  },
  previewPosition: {
    type: Object,
    default: () => ({})
  },
  roomUnreads: {
    type: Object,
    default: () => ({})
  },
  roomMentions: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['create', 'select', 'preview', 'touchStart', 'touchEnd'])

const showGroupChats = ref(true)
const showPrivateChats = ref(true)

const groupRooms = computed(() => props.rooms.filter(r => r.type !== 'private'))
const privateRooms = computed(() => props.rooms.filter(r => r.type === 'private'))

const nameColor = (name) => {
  if (!name) return '#ccc'
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getRoomListAvatar = (room) => {
  if (!room) return null
  if (room.avatar) {
    const avatar = room.avatar
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL || ''}${avatar}`
    }
    return `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${avatar}`
  }
  return null
}

const getAvatarUrl = (avatar, name) => {
  if (!avatar) {
    return null
  }
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL || ''}${avatar}`
  }
  return `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${avatar}`
}

const getRoomUnread = (roomId) => {
  return props.roomUnreads[roomId] || 0
}

const getRoomMention = (roomId) => {
  return props.roomMentions[roomId] || 0
}

const formatUnread = (count) => {
  return count > 99 ? '99+' : count
}
</script>
