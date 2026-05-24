<template>
  <div v-if="visible" class="drawer-overlay" @click="$emit('close')">
    <div class="drawer-panel" @click.stop>
      <div class="drawer-header">
        <h3>聊天室信息</h3>
        <button class="drawer-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="drawer-body">
        <div class="drawer-room-top" @click="$emit('openSettings', 'info')" style="cursor:pointer">
          <img :src="roomDetailAvatarUrl" class="drawer-room-avatar" />
          <div class="drawer-room-info">
            <div class="drawer-room-name">{{ room?.name }}</div>
            <div class="drawer-room-meta">{{ room?.owner_name }} · {{ members.length }} 人</div>
            <div class="drawer-room-desc" v-if="room?.description">{{ room?.description }}</div>
          </div>
        </div>

        <div class="drawer-divider"></div>

        <div class="drawer-section">
          <div class="drawer-section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
              <path d="M3 6L10 2V14L3 10H2C1.4 10 1 9.6 1 9V7C1 6.4 1.4 6 2 6H3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
              <path d="M11 5.5C12 6.5 12 9.5 11 10.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <path d="M13 4C15 6 15 10 13 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <span style="margin-left:6px">公告</span>
            <div class="drawer-section-actions">
              <button class="drawer-section-action" @click="$emit('showAnnouncements')">全部公告</button>
              <button v-if="permissions.isAdmin" class="drawer-section-action primary" @click="$emit('showAnnouncementEditor')">发布</button>
            </div>
          </div>
          <div class="drawer-announcement-body" v-if="announcement">
            <p>{{ announcement.content }}</p>
            <div class="drawer-announcement-meta">
              <span>{{ announcement.nickname || announcement.username }}</span>
              <span>{{ formatTime(announcement.created_at) }}</span>
            </div>
          </div>
          <div class="drawer-announcement-empty" v-else>
            <span class="text-tertiary">暂无公告</span>
          </div>
        </div>

        <div class="drawer-divider"></div>

        <div class="drawer-section">
          <div class="drawer-section-title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
              <path d="M5.5 4C5.5 2.6 6.6 1.5 8 1.5C9.4 1.5 10.5 2.6 10.5 4C10.5 5.4 9.4 6.5 8 6.5C6.6 6.5 5.5 5.4 5.5 4Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.5 14C2.5 11.5 4.5 9.5 7 9.5H9C11.5 9.5 13.5 11.5 13.5 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="margin-left:6px">成员 · {{ members.length }}</span>
            <div v-if="permissions.isOwner" class="bot-toggle-inline">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
                <rect x="3" y="5" width="10" height="8" rx="2" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="6" cy="8.5" r="0.8" fill="currentColor"/>
                <circle cx="10" cy="8.5" r="0.8" fill="currentColor"/>
                <rect x="7" y="2" width="2" height="3" stroke="currentColor" stroke-width="1.3"/>
              </svg>
              <label class="toggle-switch tiny">
                <input type="checkbox" :checked="!!room?.enable_bot" @change="$emit('toggleBot')" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="drawer-member-list">
            <div v-for="member in members" :key="member.id" class="drawer-member-item">
              <img :src="getAvatarUrl(member.avatar, member.nickname || member.username)" class="drawer-member-avatar" />
              <div class="drawer-member-info">
                <div class="drawer-member-top">
                  <span class="drawer-member-name">{{ member.nickname || member.username }}</span>
                  <span v-if="member.is_bot" class="role-badge bot">🤖</span>
                  <span v-else-if="member.role === 'owner'" class="role-badge owner">群主</span>
                  <span v-else-if="member.role === 'admin'" class="role-badge admin">管理员</span>
                </div>
                <span v-if="member.status" class="drawer-member-status" :class="member.status">{{ member.status === 'online' ? '在线' : member.status === 'away' ? '离开' : '离线' }}</span>
              </div>
              <div class="drawer-member-ops" v-if="canOperateMember(member)">
                <button v-if="canSetAdmin(member)" class="member-op-btn" @click.stop="$emit('grantAdmin', member.id)">设管理</button>
                <button v-if="canMute(member)" class="member-op-btn" @click.stop="$emit('openMuteModal', member)">{{ isEffectivelyMuted(member) ? '解除' : '禁言' }}</button>
                <button v-if="canKick(member)" class="member-op-btn danger" @click.stop="$emit('kickMember', member)">移除</button>
              </div>
              <button v-if="!member.is_bot" class="drawer-member-more" @click.stop="$emit('openMemberAction', member, $event)">⋯</button>
            </div>
          </div>
        </div>

        <div class="drawer-spacer"></div>

        <div class="drawer-section" v-if="(permissions.isOwner || isSuperAdmin) && room?.type !== 'private'">
          <div class="drawer-divider"></div>
          <div class="drawer-nav-item danger" @click="$emit('close'); $emit('showDissolveConfirm')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M5 4V2.5C5 2.2 5.2 2 5.5 2H10.5C10.8 2 11 2.2 11 2.5V4M12.5 4V13.5C12.5 13.8 12.3 14 12 14H4C3.7 14 3.5 13.8 3.5 13.5V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 7V11M9.5 7V11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <span class="nav-label" style="margin-left:8px">解散聊天室</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  room: {
    type: Object,
    default: null
  },
  members: {
    type: Array,
    default: () => []
  },
  announcement: {
    type: Object,
    default: null
  },
  permissions: {
    type: Object,
    default: () => ({ isOwner: false, isAdmin: false })
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'close', 'openSettings', 'showAnnouncements', 'showAnnouncementEditor',
  'toggleBot', 'grantAdmin', 'openMuteModal', 'kickMember', 'openMemberAction',
  'showDissolveConfirm'
])

const roomDetailAvatarUrl = () => {
  if (!props.room?.avatar) {
    return null
  }
  const avatar = props.room.avatar
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL || ''}${avatar}`
  }
  return `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${avatar}`
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

const canOperateMember = (member) => {
  if (member.is_bot) return false
  if (props.permissions.isOwner) return member.role !== 'owner'
  if (props.permissions.isAdmin) return member.role === 'member'
  return false
}

const canSetAdmin = (member) => {
  if (!props.permissions.isOwner) return false
  return member.role === 'member'
}

const canMute = (member) => {
  if (!props.permissions.isOwner && !props.permissions.isAdmin) return false
  return member.role !== 'owner' && (props.permissions.isOwner || member.role === 'member')
}

const canKick = (member) => {
  if (!props.permissions.isOwner && !props.permissions.isAdmin) return false
  return member.role !== 'owner' && (props.permissions.isOwner || member.role === 'member')
}

const isEffectivelyMuted = (member) => {
  return member.muted_until && new Date(member.muted_until) > new Date()
}
</script>
