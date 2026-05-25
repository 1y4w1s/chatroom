<template>
  <aside class="sidebar" :class="{ open: showMobileDrawer }">
    <div class="sidebar-header">
      <h2>聊天</h2>
      <div class="sidebar-header-actions">
        <button class="btn-icon theme-toggle" @click="$emit('toggleTheme')" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M8 1V2.5M8 13.5V15M3.5 8H2M14 8H12.5M4.5 4.5L3.5 3.5M12.5 12.5L11.5 11.5M4.5 11.5L3.5 12.5M12.5 3.5L11.5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5V3M8 13V14.5M3 8H1.5M14.5 8H13M4.5 4.5L3.5 3.5M12.5 12.5L11.5 11.5M4.5 11.5L3.5 12.5M12.5 3.5L11.5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3"/>
          </svg>
        </button>
        <button class="btn-icon" @click="$emit('openNotification')" :class="{ 'has-notification': notificationUnread > 0 }">
          <svg v-if="notificationUnread === 0" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.8 2 4 3.8 4 6V9L3 11H13L12 9V6C12 3.8 10.2 2 8 2Z" stroke="currentColor" stroke-width="1.3"/>
            <path d="M6.5 11V12C6.5 12.8 7.2 13.5 8 13.5C8.8 13.5 9.5 12.8 9.5 12V11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.8 2 4 3.8 4 6V9L3 11H13L12 9V6C12 3.8 10.2 2 8 2Z" fill="currentColor" stroke="currentColor" stroke-width="1.3"/>
            <path d="M6.5 11V12C6.5 12.8 7.2 13.5 8 13.5C8.8 13.5 9.5 12.8 9.5 12V11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <span v-if="notificationUnread > 0" class="bell-badge">{{ notificationUnread > 99 ? '99+' : notificationUnread }}</span>
        </button>
      </div>
    </div>

    <div class="sidebar-tabs">
      <button class="sidebar-tab" :class="{ active: activeTab === 'rooms' }" @click="$emit('tabChange', 'rooms')">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 4C3 3.4 3.4 3 4 3H14C14.6 3 15 3.4 15 4V12C15 12.6 14.6 13 14 13H10L8 15V13H4C3.4 13 3 12.6 3 12V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="activeTab === 'rooms' ? 'currentColor' : 'none'"/>
            <circle cx="7.5" cy="8" r="1.5" :fill="activeTab === 'rooms' ? 'white' : 'currentColor'"/>
            <circle cx="10.5" cy="8" r="1.5" :fill="activeTab === 'rooms' ? 'white' : 'currentColor'"/>
        </svg>
        <span>聊天室</span>
      </button>
      <button class="sidebar-tab" :class="{ active: activeTab === 'friends' }" @click="$emit('tabChange', 'friends')">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5.5 4C5.5 2.6 6.6 1.5 8 1.5C9.4 1.5 10.5 2.6 10.5 4C10.5 5.4 9.4 6.5 8 6.5C6.6 6.5 5.5 5.4 5.5 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="activeTab === 'friends' ? 'currentColor' : 'none'"/>
            <path d="M2.5 15C2.5 12.5 4.5 10.5 7 10.5H9C11.5 10.5 13.5 12.5 13.5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="activeTab === 'friends' ? 'currentColor' : 'none'"/>
            <path d="M12 4.5C13.4 4.5 14.5 5.6 14.5 7C14.5 7.8 14.2 8.5 13.7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M16.5 10.5C16.5 11.4 16.2 12.2 15.7 12.9C15.5 13.2 15.2 13.4 14.9 13.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        </svg>
        <span>好友</span>
      </button>
      <button class="sidebar-tab" :class="{ active: activeTab === 'posts' }" @click="$emit('tabChange', 'posts')">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" stroke-width="1.5" :fill="activeTab === 'posts' ? 'currentColor' : 'none'"/>
          <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" stroke-width="1.5" :fill="activeTab === 'posts' ? 'currentColor' : 'none'"/>
          <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.5" stroke="currentColor" stroke-width="1.5" :fill="activeTab === 'posts' ? 'currentColor' : 'none'"/>
          <rect x="10" y="10" width="6.5" height="6.5" rx="1.5" stroke="currentColor" stroke-width="1.5" :fill="activeTab === 'posts' ? 'currentColor' : 'none'"/>
        </svg>
        <span>贴子</span>
      </button>
    </div>

    <div class="sidebar-content">
      <div v-show="activeTab === 'rooms'" class="room-list">
        <RoomList
          :rooms="rooms"
          :currentRoomId="currentRoomId"
          :previewMembers="previewMembers"
          :previewRoomId="previewRoomId"
          :previewPosition="previewPosition"
          :roomUnreads="roomUnreads"
          :roomMentions="roomMentions"
          @create="$emit('createRoom')"
          @select="$emit('selectRoom', $event)"
          @preview="handlePreview"
          @touchStart="$emit('touchStart', $event)"
          @touchEnd="$emit('touchEnd')"
        />
        <div ref="scrollAnchor"></div>
      </div>

      <div v-show="activeTab === 'friends'" class="friend-list">
        <div class="room-list-header">
          <span class="room-list-title">好友列表</span>
          <span class="friend-count">{{ friends.length }}</span>
        </div>
        <div v-if="friends.length === 0" class="empty-list-hint">暂无好友</div>
        <div
          v-for="friend in friends"
          :key="friend.id"
          class="room-item"
          :class="{ active: currentFriendRoomId === friend.id }"
          @click="$emit('selectFriend', friend)"
        >
          <div class="room-icon">
            <img v-if="friend.avatar" :src="getAvatarUrl(friend.avatar, friend.nickname || friend.username)" class="room-list-avatar" />
            <div v-else class="default-avatar" :style="{ background: nameColor(friend.nickname || friend.username) }">
              <span>{{ (friend.nickname || friend.username)[0] }}</span>
            </div>
          </div>
          <div class="room-info">
            <div class="room-name">{{ friend.nickname || friend.username }}</div>
            <div class="friend-status" :class="friend.status">
              <span class="status-dot" :class="friend.status"></span>
              {{ friend.status === 'online' ? '在线' : friend.status === 'away' ? '离开' : '离线' }}
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'posts'" class="post-list">
        <div class="room-list-header">
          <span class="room-list-title">贴子广场</span>
          <button class="btn btn-primary btn-sm" @click="$emit('createPost')">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            发贴
          </button>
        </div>
        <div v-if="posts.length === 0 && !postsLoading" class="empty-list-hint">暂无贴子，快来发第一条吧</div>
        <div v-if="postsLoading" class="empty-list-hint" style="padding:20px">加载中...</div>
        <div class="posts-scroll">
          <div v-for="post in posts" :key="post.id" class="post-card" @click="$emit('openPost', post)" style="cursor:pointer">
            <div class="post-header">
              <img :src="getAvatarUrl(post.avatar, post.nickname || post.username)" class="post-avatar" />
              <div class="post-author">
                <span class="post-name">{{ post.nickname || post.username }}</span>
                <span class="post-time">{{ formatTime(post.created_at) }}</span>
              </div>
              <button v-if="post.user_id === currentUserId" class="post-delete-btn" @click.stop="$emit('deletePost', post.id)">×</button>
            </div>
            <div v-if="post.title" class="post-title">{{ post.title }}</div>
            <div class="post-content">{{ post.content }}</div>
            <div v-if="post.tags && post.tags.length" class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="post-tag">#{{ tag }}</span>
            </div>
            <div v-if="post.images && post.images.length" class="post-images" :class="'grid-' + Math.min(post.images.length, 3)">
              <img v-for="(img, i) in post.images.slice(0, 9)" :key="i" :src="getPostImageUrl(img)" class="post-image" @click.stop="$emit('previewImage', img)" />
            </div>
            <div class="post-actions">
              <button class="post-action-btn" :class="{ liked: post.is_liked }" @click.stop="$emit('toggleLike', post)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="post.is_liked ? 'currentColor' : 'none'" :stroke="post.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.3"/>
                </svg>
                <span>{{ post.likes_count || '' }}</span>
              </button>
            </div>
          </div>
          <div v-if="postsHasMore" class="load-more" @click="$emit('loadMorePosts')">加载更多</div>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-info" @click="$emit('goToProfile')" title="点击进入个人中心">
        <img :src="getAvatarUrl(authStoreUser?.avatar, authStoreUser?.nickname || authStoreUser?.username)" class="avatar" />
        <div class="user-details">
          <div class="username">{{ authStoreUser?.nickname || authStoreUser?.username }}</div>
          <div class="user-status">
            <span class="status-dot" :class="userStatus.dot"></span>
            {{ userStatus.text }}
          </div>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" @click="$emit('logout')">退出</button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import RoomList from './RoomList.vue'
import { getAvatarUrl, nameColor, getPostImageUrl, formatTime, getRoomListAvatar, formatUnread } from '@/composables/useChatUtils'

const props = defineProps({
  rooms: { type: Array, default: () => [] },
  currentRoomId: { type: [Number, String], default: null },
  currentFriendRoomId: { type: [Number, String], default: null },
  friends: { type: Array, default: () => [] },
  posts: { type: Array, default: () => [] },
  postsLoading: { type: Boolean, default: false },
  postsHasMore: { type: Boolean, default: false },
  notificationUnread: { type: Number, default: 0 },
  isDark: { type: Boolean, default: false },
  userStatus: { type: Object, default: () => ({ dot: 'online', text: '在线' }) },
  authStoreUser: { type: Object, default: null },
  activeTab: { type: String, default: 'rooms' },
  showMobileDrawer: { type: Boolean, default: false },
  previewMembers: { type: Array, default: () => [] },
  previewRoomId: { type: [Number, String], default: null },
  previewPosition: { type: Object, default: () => ({}) },
  roomUnreads: { type: Object, default: () => ({}) },
  roomMentions: { type: Object, default: () => ({}) },
  currentUserId: { type: [Number, String], default: null }
})

const emit = defineEmits([
  'toggleTheme', 'openNotification', 'tabChange',
  'createRoom', 'selectRoom', 'selectFriend', 'createPost',
  'openPost', 'deletePost', 'previewImage', 'toggleLike', 'loadMorePosts',
  'goToProfile', 'logout',
  'previewMembers', 'hidePreview', 'touchStart', 'touchEnd'
])

function handlePreview(roomId, event) {
  if (roomId) {
    emit('previewMembers', roomId, event)
  } else {
    emit('hidePreview')
  }
}
</script>