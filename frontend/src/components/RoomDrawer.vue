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
          <img v-if="room?.avatar" :src="roomDetailAvatarUrl" class="drawer-room-avatar" />
          <div v-else class="drawer-room-avatar drawer-room-avatar--default" :style="{ background: nameColor(room?.name) }">
            <span>{{ (room?.name || '?')[0] }}</span>
          </div>
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
                <input type="checkbox" :checked="!!room?.enable_bot" @change="$emit('toggleBot', ($event.target).checked)" />
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
                <button v-if="canSetAdmin(member)" class="member-op-btn" @click.stop="member.role === 'admin' ? $emit('revokeAdmin', member.id) : $emit('grantAdmin', member.id)">{{ member.role === 'admin' ? '撤销管理' : '设管理' }}</button>
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
import { computed } from 'vue'
import { getAvatarUrl as getUtilsAvatarUrl } from '@/composables/useChatUtils'

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
  'toggleBot', 'grantAdmin', 'revokeAdmin', 'openMuteModal', 'kickMember', 'openMemberAction',
  'showDissolveConfirm'
])

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

const roomDetailAvatarUrl = computed(() => {
  if (!props.room?.avatar) {
    return null
  }
  const avatar = props.room.avatar
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_API_URL || ''}${avatar}`
  }
  return `${import.meta.env.VITE_API_URL || ''}/uploads/avatars/${avatar}`
})

const getAvatarUrl = (avatar, name) => {
  return getUtilsAvatarUrl(avatar, name)
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
  return member.role === 'member' || member.role === 'admin'
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

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: 320px;
  max-width: 85vw;
  height: 100%;
  background: var(--bg-primary);
  box-shadow: -4px 0 25px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  animation: drawerSlideIn 0.2s ease;
}

@keyframes drawerSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.drawer-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.drawer-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.drawer-close:hover {
  background: var(--hover);
  color: var(--text-primary);
}

.drawer-room-top {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  align-items: center;
  transition: background 0.15s;
  border-radius: 4px;
  margin: 4px;
}

.drawer-room-top:hover {
  background: var(--hover-light);
}

.drawer-room-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
}

.drawer-room-avatar--default {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.drawer-room-info {
  flex: 1;
  min-width: 0;
}

.drawer-room-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.drawer-room-meta {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.drawer-room-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.drawer-divider {
  height: 1px;
  background: var(--border);
  margin: 0 20px;
}

.drawer-section {
  padding: 12px 20px;
}

.drawer-section-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  gap: 6px;
}

.drawer-section-actions {
  margin-left: auto;
  display: flex;
  gap: 2px;
}

.drawer-section-action {
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.drawer-section-action:hover {
  background: var(--hover);
  color: var(--text-primary);
}

.drawer-section-action.primary {
  color: var(--accent);
}

.drawer-section-action.primary:hover {
  background: var(--accent-soft);
}

.drawer-announcement-body {
  background: var(--hover);
  border-radius: 10px;
  padding: 12px;
}

.drawer-announcement-body p {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0 0 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.drawer-announcement-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.drawer-announcement-empty {
  font-size: 13px;
  padding: 8px 0;
  color: var(--text-tertiary);
}

.drawer-member-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.drawer-member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  border-radius: 8px;
  transition: background 0.15s;
}

.drawer-member-item:hover {
  background: var(--hover-light);
}

.drawer-member-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.drawer-member-info {
  flex: 1;
  min-width: 0;
}

.drawer-member-top {
  display: flex;
  align-items: center;
  gap: 4px;
}

.drawer-member-name {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.drawer-member-status {
  font-size: 11px;
  color: var(--text-tertiary);
}

.drawer-member-status.online {
  color: var(--success);
}

.drawer-member-ops {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.member-op-btn {
  padding: 2px 7px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1;
  height: 22px;
  display: inline-flex;
  align-items: center;
}

.member-op-btn:hover {
  background: var(--hover);
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.member-op-btn.danger {
  color: var(--danger);
  border-color: var(--danger-border, var(--danger));
}

.member-op-btn.danger:hover {
  background: var(--danger-bg);
}

.drawer-member-more {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.15s;
  flex-shrink: 0;
  opacity: 0;
}

.drawer-member-item:hover .drawer-member-more {
  opacity: 1;
}

.drawer-member-more:hover {
  background: var(--hover);
  color: var(--text-primary);
}

.bot-toggle-inline {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-switch.tiny input + .toggle-slider {
  width: 28px;
  height: 16px;
}

.toggle-switch.tiny input + .toggle-slider:before {
  width: 12px;
  height: 12px;
}

.toggle-switch.tiny input:checked + .toggle-slider:before {
  transform: translateX(12px);
}

.drawer-spacer {
  flex: 1;
}

.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 14px;
  border-radius: 10px;
  color: var(--text-primary);
  margin: 8px 0;
}

.drawer-nav-item:hover {
  background: var(--hover);
}

.drawer-nav-item.danger {
  color: var(--danger);
}

.drawer-nav-item.danger:hover {
  background: var(--danger-bg);
}

.nav-label {
  flex: 1;
  color: inherit;
}

.role-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  line-height: 1.4;
  display: inline-flex;
  align-items: center;
  height: 22px;
}

.role-badge.owner {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.admin {
  background: var(--hover);
  color: var(--text-secondary);
}

.role-badge.bot {
  background: var(--hover);
  color: var(--text-primary);
}

[data-theme="dark"] .role-badge.owner {
  background: #3a2a0a;
  color: #fbbf24;
}

[data-theme="dark"] .role-badge.admin {
  background: #374151;
  color: #93c5fd;
}

[data-theme="dark"] .role-badge.bot {
  background: #374151;
  color: #c4b5fd;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--border-light);
  border-radius: 24px;
  transition: all 0.2s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: var(--bg-primary);
  border-radius: 50%;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--accent);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}
</style>
