﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="chat-container">
    <aside class="sidebar" :class="{ open: showMobileDrawer }">
      <div class="sidebar-header">
        <h2>聊天</h2>
        <div class="sidebar-header-actions">
          <button class="btn-icon theme-toggle" @click="toggleTheme" :title="isDark ? '切换到浅色模式' : '切换到深色模式'">
            <svg v-if="isDark" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.3"/>
              <path d="M8 1V2.5M8 13.5V15M3.5 8H2M14 8H12.5M4.5 4.5L3.5 3.5M12.5 12.5L11.5 11.5M4.5 11.5L3.5 12.5M12.5 3.5L11.5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5V3M8 13V14.5M3 8H1.5M14.5 8H13M4.5 4.5L3.5 3.5M12.5 12.5L11.5 11.5M4.5 11.5L3.5 12.5M12.5 3.5L11.5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3"/>
            </svg>
          </button>
          <button class="btn-icon" @click="showNotificationPanel = true" :class="{ 'has-notification': notificationUnread > 0 }">
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
        <button class="sidebar-tab" :class="{ active: sidebarTab === 'rooms' }" @click="sidebarTab = 'rooms'; showMobileDrawer = false">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 4C3 3.4 3.4 3 4 3H14C14.6 3 15 3.4 15 4V12C15 12.6 14.6 13 14 13H10L8 15V13H4C3.4 13 3 12.6 3 12V4Z" :stroke="sidebarTab === 'rooms' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="sidebarTab === 'rooms' ? 'currentColor' : 'none'"/>
            <circle cx="7.5" cy="8" r="1.5" :fill="sidebarTab === 'rooms' ? 'white' : 'var(--text-tertiary)'"/>
            <circle cx="10.5" cy="8" r="1.5" :fill="sidebarTab === 'rooms' ? 'white' : 'var(--text-tertiary)'"/>
          </svg>
          <span>聊天室</span>
        </button>
        <button class="sidebar-tab" :class="{ active: sidebarTab === 'friends' }" @click="sidebarTab = 'friends'; showMobileDrawer = false; loadFriends()">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5.5 4C5.5 2.6 6.6 1.5 8 1.5C9.4 1.5 10.5 2.6 10.5 4C10.5 5.4 9.4 6.5 8 6.5C6.6 6.5 5.5 5.4 5.5 4Z" :stroke="sidebarTab === 'friends' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="sidebarTab === 'friends' ? 'currentColor' : 'none'"/>
            <path d="M2.5 15C2.5 12.5 4.5 10.5 7 10.5H9C11.5 10.5 13.5 12.5 13.5 15" :stroke="sidebarTab === 'friends' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :fill="sidebarTab === 'friends' ? 'currentColor' : 'none'"/>
            <path d="M12 4.5C13.4 4.5 14.5 5.6 14.5 7C14.5 7.8 14.2 8.5 13.7 9" :stroke="sidebarTab === 'friends' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M16.5 10.5C16.5 11.4 16.2 12.2 15.7 12.9C15.5 13.2 15.2 13.4 14.9 13.6" :stroke="sidebarTab === 'friends' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          </svg>
          <span>好友</span>
        </button>
        <button class="sidebar-tab" :class="{ active: sidebarTab === 'posts' }" @click="sidebarTab = 'posts'; showMobileDrawer = false">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" :stroke="sidebarTab === 'posts' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" :fill="sidebarTab === 'posts' ? 'currentColor' : 'none'"/>
            <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.5" :stroke="sidebarTab === 'posts' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" :fill="sidebarTab === 'posts' ? 'currentColor' : 'none'"/>
            <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.5" :stroke="sidebarTab === 'posts' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" :fill="sidebarTab === 'posts' ? 'currentColor' : 'none'"/>
            <rect x="10" y="10" width="6.5" height="6.5" rx="1.5" :stroke="sidebarTab === 'posts' ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.5" :fill="sidebarTab === 'posts' ? 'currentColor' : 'none'"/>
          </svg>
          <span>贴子</span>
        </button>
      </div>

      <div class="sidebar-content">
        <div v-show="sidebarTab === 'rooms'" class="room-list">
          <div class="room-list-header">
            <span class="room-list-title">聊天列表</span>
            <button class="btn btn-primary btn-sm" @click="showCreateModal = true">
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
                @click="handleRoomClick(room.id)"
                @mouseenter="showMemberPreview(room.id, $event)"
                @mouseleave="hideMemberPreview"
                @touchstart="handleTouchStart(room.id, $event)"
                @touchend="handleTouchEnd"
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
                @click="joinRoom(room.id)"
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

        <div v-show="sidebarTab === 'friends'" class="friend-list">
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
            @click="openChatWithFriend(friend)"
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

        <div v-show="sidebarTab === 'posts'" class="post-list">
          <div class="room-list-header">
            <span class="room-list-title">贴子广场</span>
            <button class="btn btn-primary btn-sm" @click="showCreatePost = true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              发贴
            </button>
          </div>
          <div v-if="posts.length === 0 && !postsLoading" class="empty-list-hint">暂无贴子，快来发第一条吧</div>
          <div v-if="postsLoading" class="empty-list-hint" style="padding:20px">加载中...</div>
          <div class="posts-scroll">
            <div v-for="post in posts" :key="post.id" class="post-card" @click="openPostDetail(post)" style="cursor:pointer">
              <div class="post-header">
                <img :src="getAvatarUrl(post.avatar, post.nickname || post.username)" class="post-avatar" />
                <div class="post-author">
                  <span class="post-name">{{ post.nickname || post.username }}</span>
                  <span class="post-time">{{ formatTime(post.created_at) }}</span>
                </div>
                <button v-if="post.user_id === authStore.userId" class="post-delete-btn" @click="deletePost(post.id)">×</button>
              </div>
              <div v-if="post.title" class="post-title">{{ post.title }}</div>
              <div class="post-content">{{ post.content }}</div>
              <div v-if="post.tags && post.tags.length" class="post-tags">
                <span v-for="tag in post.tags" :key="tag" class="post-tag">#{{ tag }}</span>
              </div>
              <div v-if="post.images && post.images.length" class="post-images" :class="'grid-' + Math.min(post.images.length, 3)">
                <img v-for="(img, i) in post.images.slice(0, 9)" :key="i" :src="getPostImageUrl(img)" class="post-image" @click="previewPostImage(img)" />
              </div>
              <div class="post-actions">
                <button class="post-action-btn" :class="{ liked: post.is_liked }" @click.stop="toggleLike(post)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="post.is_liked ? 'currentColor' : 'none'" :stroke="post.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.2"/>
                  </svg>
                  <span>{{ post.likes_count || '' }}</span>
                </button>
              </div>
            </div>
            <div v-if="postsHasMore" class="load-more" @click="loadMorePosts">加载更多</div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-info" @click="goToProfile(); showMobileDrawer = false" title="点击进入个人中心">
          <img :src="getAvatarUrl(authStore.user?.avatar, authStore.user?.nickname || authStore.user?.username)" class="avatar" />
          <div class="user-details">
            <div class="username">{{ authStore.user?.nickname || authStore.user?.username }}</div>
            <div class="user-status">
              <span class="status-dot" :class="userStatus.dot"></span>
              {{ userStatus.text }}
            </div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" @click="handleLogout">退出</button>
      </div>
    </aside>

    <div v-if="showMobileDrawer" class="mobile-overlay" @click="showMobileDrawer = false"></div>

    <header class="mobile-header">
      <button class="mobile-menu-btn" @click="showMobileDrawer = true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <h3 class="mobile-title">{{ currentRoom?.name || '聊天' }}</h3>
      <div class="mobile-header-right"></div>
    </header>

    <div v-if="showAvatarUpload" class="modal-overlay" @click="showAvatarUpload = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>更换头像</h3>
          <button class="close-btn" @click="showAvatarUpload = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="avatar-preview">
            <img :src="avatarPreview || authStore.user?.avatar || '/default-avatar.png'" class="preview-image" />
          </div>
          <div class="upload-area">
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              @change="handleFileChange"
              style="display: none"
            />
            <button class="btn btn-primary" @click="$refs.fileInput.click()">
              选择图片
            </button>
            <p class="upload-hint">支持 JPG、PNG 格式，最大 5MB</p>
          </div>
          <div v-if="uploading" class="uploading">上传中...</div>
          <div v-if="uploadError" class="error">{{ uploadError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAvatarUpload = false">取消</button>
          <button class="btn btn-primary" @click="uploadAvatar" :disabled="!selectedFile || uploading">
            确认上传
          </button>
        </div>
      </div>
    </div>

    <main class="chat-main">
      <div v-if="selectedPost || currentRoomId" class="main-tabs">
         <button class="main-tab" :class="{ active: activeMainTab === 'chat' }" @click="switchToChat" v-if="currentRoomId">
          聊天室
        </button>
        <button class="main-tab" :class="{ active: activeMainTab === 'post' }" @click="switchToPost" v-if="selectedPost">
          帖子详情
        </button>
      </div>
      <div v-if="activeMainTab === 'post' && selectedPost" class="post-detail">
        <div class="post-detail-header">
          <h3>贴子详情</h3>
          <div class="post-detail-actions" v-if="selectedPost.user_id === authStore.userId">
            <button class="btn-icon" @click="showPostManageMenu = !showPostManageMenu">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="4.5" r="1.2" fill="currentColor"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="13.5" r="1.2" fill="currentColor"/></svg>
            </button>
            <div v-if="showPostManageMenu" class="post-manage-menu">
              <button @click="openEditPost">编辑</button>
              <button @click="togglePostVisibility">{{ selectedPost.is_public ? '设为私密' : '设为公开' }}</button>
              <button @click="togglePostComments">{{ selectedPost.allow_comments ? '关闭评论' : '开启评论' }}</button>
              <button class="danger" @click="deletePostFromDetail">删除</button>
            </div>
          </div>
        </div>
        <div class="post-detail-body">
          <div class="post-detail-author">
            <img :src="getAvatarUrl(selectedPost.avatar, selectedPost.nickname || selectedPost.username)" class="pd-avatar" />
            <div>
              <div class="pd-name">{{ selectedPost.nickname || selectedPost.username }}</div>
              <div class="pd-time">{{ formatTime(selectedPost.created_at) }}
                <span v-if="!selectedPost.is_public" class="pd-badge private">私密</span>
                <span v-if="selectedPost.allow_comments === false" class="pd-badge no-comment">禁评</span>
              </div>
            </div>
          </div>
          <div v-if="selectedPost.title" class="pd-title">{{ selectedPost.title }}</div>
          <div class="pd-content">{{ selectedPost.content }}</div>
          <div v-if="selectedPost.tags && selectedPost.tags.length" class="pd-tags">
            <span v-for="tag in selectedPost.tags" :key="tag" class="pd-tag">#{{ tag }}</span>
          </div>
          <div v-if="selectedPost.images && selectedPost.images.length" class="pd-images">
            <img v-for="(img, i) in selectedPost.images" :key="i" :src="getPostImageUrl(img)" class="pd-image" @click="previewPostImage(img)" />
          </div>
          <div class="pd-actions">
            <button class="pd-action-btn" :class="{ liked: selectedPost.is_liked }" @click="toggleLike(selectedPost)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="selectedPost.is_liked ? 'currentColor' : 'none'" :stroke="selectedPost.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.2"/></svg>
              <span>{{ selectedPost.likes_count || '' }}</span>
            </button>
          </div>
          <div class="pd-comments-section">
            <div class="pd-comments-title">评论（{{ selectedPost.comments_count || 0 }}）</div>
            <div v-if="topLevelComments.length === 0" class="pd-no-comments">暂无评论</div>
            <div v-for="comment in topLevelComments" :key="comment.id" class="pd-comment-wrapper">
              <div class="pd-comment">
                <img :src="getAvatarUrl(comment.avatar, comment.nickname || comment.username)" class="pd-comment-avatar" />
                <div class="pd-comment-body">
                  <div class="pd-comment-header">
                    <span class="pd-comment-name">{{ comment.nickname || comment.username }}</span>
                    <span class="pd-comment-time">{{ formatTime(comment.created_at) }}</span>
                  </div>
                  <div class="pd-comment-text">{{ comment.content }}</div>
                  <img v-if="comment.image" :src="getPostImageUrl(comment.image)" class="pd-comment-image" @click="previewPostImage(comment.image)" />
                  <div class="pd-comment-actions">
                    <button class="pd-comment-like" :class="{ liked: comment.is_liked }" @click="toggleCommentLike(comment)">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="comment.is_liked ? 'currentColor' : 'none'" :stroke="comment.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.2"/></svg>
                      <span>{{ comment.likes_count || '' }}</span>
                    </button>
                    <button class="pd-comment-reply-btn" @click="startReply(comment)">回复</button>
                    <button v-if="comment.user_id === authStore.userId || selectedPost.user_id === authStore.userId" class="pd-comment-del" @click="deleteComment(comment.id)">删除</button>
                  </div>
                </div>
              </div>
              <div v-if="commentReplies(comment.id).length" class="pd-replies">
                <div v-for="reply in commentReplies(comment.id)" :key="reply.id" class="pd-comment pd-reply">
                  <img :src="getAvatarUrl(reply.avatar, reply.nickname || reply.username)" class="pd-comment-avatar" />
                  <div class="pd-comment-body">
                    <div class="pd-comment-header">
                      <span class="pd-comment-name">{{ reply.nickname || reply.username }}</span>
                      <span class="pd-comment-time">{{ formatTime(reply.created_at) }}</span>
                    </div>
                    <div class="pd-comment-text">{{ reply.content }}</div>
                    <img v-if="reply.image" :src="getPostImageUrl(reply.image)" class="pd-comment-image" @click="previewPostImage(reply.image)" />
                    <div class="pd-comment-actions">
                      <button class="pd-comment-like" :class="{ liked: reply.is_liked }" @click="toggleCommentLike(reply)">
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="reply.is_liked ? 'currentColor' : 'none'" :stroke="reply.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.2"/></svg>
                        <span>{{ reply.likes_count || '' }}</span>
                      </button>
                      <button v-if="reply.user_id === authStore.userId || selectedPost.user_id === authStore.userId" class="pd-comment-del" @click="deleteComment(reply.id)">删除</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="selectedPost.allow_comments !== false" class="cc-card">
              <div v-if="replyTo" class="cc-reply-hint">
                回复 @{{ replyTo.nickname || replyTo.username }}
                <button class="cc-reply-cancel" @click="cancelReply">取消</button>
              </div>
              <div class="cc-input-row">
                <input v-model="commentInput" class="cc-input" :placeholder="replyTo ? '输入回复...' : '写评论...'" @keyup.enter="submitComment" ref="commentInputRef" />
                <button v-if="showCommentEmojiPicker" class="cc-icon-btn active" @click="showCommentEmojiPicker = false">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>
                <button v-else class="cc-icon-btn" @click="showCommentEmojiPicker = true" title="表情">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><circle cx="6.5" cy="7.5" r="1" fill="currentColor"/><circle cx="13.5" cy="7.5" r="1" fill="currentColor"/><path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                </button>
                <label class="cc-icon-btn" title="图片">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="8" r="1.5" fill="currentColor"/><path d="M2.5 13L7 9L11 13L14.5 10L17.5 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  <input type="file" accept="image/*" multiple @change="handleCommentImageSelect" hidden />
                </label>
                <button class="cc-send-btn" @click="submitComment" :disabled="!commentInput.trim() && commentImages.length === 0">发布</button>
              </div>
              <div v-if="commentImages.length" class="cc-previews">
                <div v-for="(img, i) in commentImages" :key="i" class="cc-preview-item">
                  <img :src="img.preview" />
                  <button class="cc-preview-del" @click="removeCommentImage(i)">×</button>
                </div>
              </div>
              <div v-if="showCommentEmojiPicker" ref="commentEmojiPickerRef" class="cc-emoji-panel">
                <div v-for="category in emojiCategories" :key="category.name" class="cc-emoji-group">
                  <div class="cc-emoji-label">{{ category.name }}</div>
                  <div class="cc-emoji-grid">
                    <button v-for="emoji in category.emojis" :key="emoji" class="cc-emoji-cell" @click="insertCommentEmoji(emoji)">{{ emoji }}</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="pd-comments-closed">评论已关闭</div>
          </div>
        </div>
      </div>
      <div v-if="activeMainTab === 'chat' && currentRoomId" class="chat-wrapper">
        <header class="chat-header">
          <div class="header-left" @click="showRoomDrawer = true" style="cursor:pointer">
            <h3>{{ currentRoom?.name }}</h3>
            <p>{{ currentRoom?.description }}</p>
          </div>
          <button class="header-more-btn" @click="showRoomDrawer = true" title="更多">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </header>
        <div class="message-list" ref="messageListRef">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{ 'message-own': message.sender_id === authStore.user?.id, 'message-deleted': message.is_deleted }"
            :data-message-id="message.id"
          >
            <img :src="getAvatarUrl(message.avatar, message.nickname || message.username)" class="message-avatar" @click="openMessageMemberAction(message, $event)" style="cursor:pointer" />
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
                <div v-if="message.reply_to" class="message-reply" @click="scrollToMessage(message.reply_to.id)">
                  <div class="reply-sender">{{ message.reply_to.sender }}</div>
                  <div class="reply-content">{{ message.reply_to.content }}</div>
                </div>
                <img v-if="message.type === 'image'" :src="getMessageImageUrl(message)" class="message-image" @click="previewMessageImage(message)" />
                <div v-else-if="message.type === 'file'" class="message-file" @click="downloadFile(message)">
                  <span class="file-card-icon">{{ getFileIcon(message.file_name || message.content) }}</span>
                  <div class="file-card-info">
                    <div class="file-card-name">{{ message.file_name || message.content }}</div>
                    <div class="file-card-size" v-if="message.file_size">{{ formatFileSize(message.file_size) }}</div>
                  </div>
                  <svg class="file-card-dl" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V11M4 7L8 11L12 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </div>
                <div v-else class="message-text">{{ message.content }}</div>
              </template>
              <div v-if="!message.is_deleted" class="message-actions" @click.stop="toggleMessageActions(message.id, $event)">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="4" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <div v-if="showMessageActions === message.id" class="message-actions-menu" :style="messageActionsPos">
                <button @click.stop="replyMessage(message)">回复</button>
                <button v-if="message.sender_id === authStore.user?.id" @click.stop="recallMessage(message)">撤回</button>
                <button v-if="message.type === 'image'" @click.stop="addToStickers(message)">添加到表情包</button>
              </div>
            </div>
          </div>
        </div>

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
              <button class="reply-bar-close" @click="replyTarget = null">×</button>
            </div>
            <div class="cc-input-row">
              <div class="cc-input-wrap">
                <input v-model="newMessage" class="cc-input" placeholder="输入消息..." @keyup.enter="sendMessage" @input="handleMentionInput($event); handleTyping()" @keydown="handleMentionKeydown" @paste="handlePaste" />
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
              <label class="cc-icon-btn" title="文件">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4C4 3 4.5 2 6 2H12L17 7V16C17 17 16 18 15 18H6C5 18 4 17 4 16V4Z" stroke="currentColor" stroke-width="1.3"/><path d="M12 2V6H17" stroke="currentColor" stroke-width="1.3"/></svg>
                <input type="file" accept=".pdf,.doc,.docx,.zip,.rar,.txt,.xls,.xlsx,.ppt,.pptx" @change="handleChatFileSelect" hidden />
              </label>
              <button class="cc-send-btn" @click="sendMessage" :disabled="!newMessage.trim() && chatImages.length === 0 && chatFiles.length === 0">发送</button>
            </div>
            <div v-if="chatImages.length" class="cc-previews">
              <div v-for="(img, i) in chatImages" :key="i" class="cc-preview-item">
                <img :src="img.preview" />
                <button class="cc-preview-del" @click="removeChatImage(i)">×</button>
              </div>
            </div>
            <div v-if="chatFiles.length" class="cc-previews">
              <div v-for="(f, i) in chatFiles" :key="i" class="cc-file-preview">
                <span class="cc-file-icon">{{ getFileIcon(f.file.name) }}</span>
                <div class="cc-file-info">
                  <div class="cc-file-name">{{ f.file.name }}</div>
                  <div class="cc-file-size">{{ formatFileSize(f.file.size) }}</div>
                </div>
                <button class="cc-preview-del" @click="removeChatFile(i)">×</button>
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

      <div v-if="!selectedPost && !currentRoomId" class="no-room">
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

    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <h3>创建聊天室</h3>
        <form @submit.prevent="createRoom">
          <div class="form-group">
            <label>聊天室名称</label>
            <input v-model="newRoom.name" type="text" class="input" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="newRoom.description" class="input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select v-model="newRoom.type" class="input">
              <option value="public">公开</option>
              <option value="private">私有</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">取消</button>
            <button type="submit" class="btn btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showRoomSettings" class="modal-overlay" @click="showRoomSettings = false">
      <div class="modal room-settings-modal" @click.stop>
        <div class="modal-header">
          <h3>聊天室设置 - {{ currentRoom?.name }}</h3>
          <button class="close-btn" @click="showRoomSettings = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="settings-tabs">
            <button class="tab-btn" :class="{ active: roomSettingsTab === 'info' }" @click="roomSettingsTab = 'info'">基本资料</button>
            <button class="tab-btn" :class="{ active: roomSettingsTab === 'members' }" @click="roomSettingsTab = 'members'">成员管理</button>
          </div>

          <div v-if="roomSettingsTab === 'info'">
            <div class="form-section">
              <h4>聊天室头像</h4>
              <div class="room-avatar-upload">
                <div class="room-avatar-wrapper" @click="$refs.roomAvatarInput.click()">
                  <img :src="roomAvatarUrl" class="room-settings-avatar" />
                  <div class="room-avatar-overlay">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2V14M2 8H14" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                <input type="file" ref="roomAvatarInput" accept="image/*" @change="handleRoomAvatarChange" style="display:none" />
                <div v-if="roomAvatarUploading" class="upload-progress">上传中...</div>
              </div>
            </div>
            <div class="form-group">
              <label>聊天室名称</label>
              <input v-model="roomEditName" type="text" class="input" maxlength="50" />
            </div>
            <div class="form-group">
              <label>聊天室简介</label>
              <textarea v-model="roomEditDesc" class="input" rows="3" maxlength="500"></textarea>
            </div>
            <button class="btn btn-primary" @click="saveRoomSettings" :disabled="roomSaving">保存修改</button>
            <div v-if="roomSettingsMsg" class="msg" :class="roomSettingsMsgType">{{ roomSettingsMsg }}</div>
          </div>

          <div v-if="roomSettingsTab === 'members'" class="member-list">
            <div class="member-list-header">
              <span class="member-list-title">成员管理</span>
              <div v-if="currentPermissions.isOwner" class="member-list-bot-switch">
                <span class="bot-toggle-label">🤖 机器人</span>
                <label class="toggle-switch inline">
                  <input type="checkbox" :checked="!!currentRoom?.enable_bot" @change="toggleBot" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="bot-toggle-status" :class="{ enabled: currentRoom?.enable_bot }">
                  {{ currentRoom?.enable_bot ? '已启用' : '已禁用' }}
                </span>
              </div>
            </div>
            <div
              v-for="member in sortedMembers"
              :key="member.id"
              class="member-item"
              :class="{ 'bot-member': member.is_bot }"
            >
              <img :src="getAvatarUrl(member.avatar, member.nickname || member.username)" class="member-avatar" @click="member.is_bot ? null : openMemberAction(member, $event)" style="cursor:pointer" />
              <div class="member-info">
                <div class="member-name">
                  {{ member.nickname || member.username }}
                  <span v-if="member.is_bot" class="role-badge bot">🤖 机器人</span>
                  <span v-else-if="member.role === 'owner'" class="role-badge owner">群主</span>
                  <span v-else-if="member.role === 'admin'" class="role-badge admin">管理员</span>
                  <span v-else class="role-badge member">成员</span>
                </div>
                <div class="member-status">
                  <template v-if="!member.is_bot">
                    <span class="status-dot" :class="member.status"></span>
                    {{ member.status === 'online' ? '在线' : member.status === 'away' ? '离开' : '离线' }}
                    <span v-if="isEffectivelyMuted(member)" class="muted-badge" :title="formatMuteTime(member.muted_until)">
                      已禁言{{ formatMuteDuration(member.muted_until) }}
                    </span>
                  </template>
                  <span v-else class="no-status">-</span>
                </div>
              </div>
              <div class="member-actions">
                <button 
                  v-if="currentPermissions.isOwner && member.role === 'member' && !member.is_bot"
                  class="action-btn btn-admin"
                  @click="grantAdmin(member.id)"
                >设为管理员</button>
                <button 
                  v-if="currentPermissions.isOwner && member.role === 'admin' && !member.is_bot"
                  class="action-btn btn-remove-admin"
                  @click="revokeAdmin(member.id)"
                >撤销管理员</button>
                <button 
                  v-if="((currentPermissions.isOwner && member.role !== 'owner') || (currentPermissions.isAdmin && member.role === 'member')) && !member.is_bot && !isEffectivelyMuted(member)"
                  class="action-btn btn-mute"
                  @click="openMuteModal(member)"
                >禁言</button>
                <button 
                  v-if="((currentPermissions.isOwner && member.role !== 'owner') || (currentPermissions.isAdmin && member.role === 'member')) && isEffectivelyMuted(member) && !member.is_bot"
                  class="action-btn btn-unmute"
                  @click="unmuteMember(member.id)"
                >解除禁言</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRoomSettings = false">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="showMuteModal" class="modal-overlay" @click="showMuteModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>设置禁言</h3>
          <button class="close-btn" @click="showMuteModal = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择禁言时长</label>
            <div class="duration-options">
              <button class="duration-btn" :class="{ active: muteDuration === 5 }" @click="muteDuration = 5">5 分钟</button>
              <button class="duration-btn" :class="{ active: muteDuration === 30 }" @click="muteDuration = 30">30 分钟</button>
              <button class="duration-btn" :class="{ active: muteDuration === 60 }" @click="muteDuration = 60">1 小时</button>
              <button class="duration-btn" :class="{ active: muteDuration === 1440 }" @click="muteDuration = 1440">24 小时</button>
              <button class="duration-btn custom-btn" :class="{ active: muteDuration === 'custom' }" @click="muteDuration = 'custom'">自定义</button>
            </div>
          </div>
          <div v-if="muteDuration === 'custom'" class="form-group">
            <label>自定义时长</label>
            <div class="custom-duration-input">
              <div class="duration-input-group">
                <input 
                  v-model.number="customDays" 
                  type="number" 
                  class="input-small" 
                  placeholder="00"
                  min="0"
                  max="29"
                />
                <span class="duration-label">天</span>
              </div>
              <div class="duration-input-group">
                <input 
                  v-model.number="customHours" 
                  type="number" 
                  class="input-small" 
                  placeholder="00"
                  min="0"
                  max="23"
                />
                <span class="duration-label">小时</span>
              </div>
              <div class="duration-input-group">
                <input 
                  v-model.number="customMinutes" 
                  type="number" 
                  class="input-small" 
                  placeholder="00"
                  min="0"
                  max="59"
                />
                <span class="duration-label">分钟</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>禁言原因</label>
            <textarea 
              v-model="muteReason" 
              class="input" 
              rows="3" 
              placeholder="请输入禁言原因（可选）"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showMuteModal = false">取消</button>
          <button class="btn btn-danger" @click="confirmMute">确认禁言</button>
        </div>
      </div>
    </div>

    <div v-if="showRoomDrawer" class="drawer-overlay" @click="showRoomDrawer = false">
      <div class="drawer-panel" @click.stop>
        <div class="drawer-header">
          <h3>聊天室信息</h3>
          <button class="drawer-close" @click="showRoomDrawer = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="drawer-body">
          <div class="drawer-room-top" @click="openRoomSettings('info')" style="cursor:pointer">
            <img :src="roomDetailAvatarUrl" class="drawer-room-avatar" />
            <div class="drawer-room-info">
              <div class="drawer-room-name">{{ currentRoom?.name }}</div>
              <div class="drawer-room-meta">{{ currentRoom?.owner_name }} · {{ currentMembers.length }} 人</div>
              <div class="drawer-room-desc" v-if="currentRoom?.description">{{ currentRoom?.description }}</div>
            </div>
          </div>

          <div class="drawer-divider"></div>

          <div class="drawer-section">
            <div class="drawer-section-title">
              <span>📢 公告</span>
              <div class="drawer-section-actions">
                <button class="drawer-section-action" @click="showAnnouncementList = true">全部公告</button>
                <button v-if="currentPermissions.isAdmin" class="drawer-section-action primary" @click="showAnnouncementEditor = true">发布</button>
              </div>
            </div>
            <div class="drawer-announcement-body" v-if="roomAnnouncement">
              <p>{{ roomAnnouncement.content }}</p>
              <div class="drawer-announcement-meta">
                <span>{{ roomAnnouncement.nickname || roomAnnouncement.username }}</span>
                <span>{{ formatTime(roomAnnouncement.created_at) }}</span>
              </div>
            </div>
            <div class="drawer-announcement-empty" v-else>
              <span class="text-tertiary">暂无公告</span>
            </div>
          </div>

          <div class="drawer-divider"></div>

          <div class="drawer-section">
            <div class="drawer-section-title">
              <span>👥 成员 · {{ currentMembers.length }}</span>
              <div v-if="currentPermissions.isOwner" class="bot-toggle-inline">
                <span class="bot-label">🤖</span>
                <label class="toggle-switch tiny">
                  <input type="checkbox" :checked="!!currentRoom?.enable_bot" @change="toggleBot" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            <div class="drawer-member-list">
              <div v-for="member in currentMembers" :key="member.id" class="drawer-member-item">
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
                  <button v-if="canSetAdmin(member)" class="member-op-btn" @click.stop="grantAdmin(member.id)">设管理</button>
                  <button v-if="canMute(member)" class="member-op-btn" @click.stop="openMuteModal(member)">{{ isEffectivelyMuted(member) ? '解除' : '禁言' }}</button>
                  <button v-if="canKick(member)" class="member-op-btn danger" @click.stop="kickMember(member)">移除</button>
                </div>
                <button v-if="!member.is_bot" class="drawer-member-more" @click.stop="openMemberAction(member, $event)">⋯</button>
              </div>
            </div>
          </div>

          <div class="drawer-spacer"></div>

          <div class="drawer-section" v-if="(currentPermissions.isOwner || isSuperAdmin) && currentRoom?.type !== 'private'">
            <div class="drawer-divider"></div>
            <div class="drawer-nav-item danger" @click="showRoomDrawer = false; showDissolveConfirm = true">
              <span class="nav-icon">🗑</span>
              <span class="nav-label">解散聊天室</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告历史列表弹窗 -->
    <div v-if="showAnnouncementList" class="modal-overlay" @click="showAnnouncementList = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>全部公告</h3>
          <button class="close-btn" @click="showAnnouncementList = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="modal-body" style="max-height:60vh;overflow-y:auto">
          <div v-if="roomAnnouncements.length === 0" class="text-tertiary" style="text-align:center;padding:32px">暂无公告</div>
          <div v-for="ann in roomAnnouncements" :key="ann.id" class="announcement-history-item">
            <div class="announcement-history-header">
              <span class="announcement-history-author">{{ ann.nickname || ann.username }}</span>
              <span class="announcement-history-time">{{ formatTime(ann.created_at) }}</span>
            </div>
            <div class="announcement-history-content">{{ ann.content }}</div>
            <div class="announcement-history-ops" v-if="canEditAnnouncement(ann)">
              <button class="btn btn-sm" @click="editAnnouncement(ann)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="deleteAnnouncement(ann)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告编辑弹窗 -->
    <div v-if="showAnnouncementEditor" class="modal-overlay" @click="showAnnouncementEditor = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingAnnouncement ? '编辑公告' : '发布公告' }}</h3>
          <button class="close-btn" @click="showAnnouncementEditor = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <textarea v-model="announcementFormContent" class="input" rows="5" maxlength="2000" placeholder="输入公告内容..."></textarea>
          <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
            <button class="btn btn-secondary" @click="showAnnouncementEditor = false">取消</button>
            <button class="btn btn-primary" @click="submitAnnouncement" :disabled="!announcementFormContent.trim()">{{ editingAnnouncement ? '保存' : '发布' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 发贴弹窗 -->
    <div v-if="showCreatePost" class="modal-overlay" @click="showCreatePost = false">
      <div class="modal create-post-modal" @click.stop>
        <div class="modal-header">
          <h3>发贴</h3>
          <button class="close-btn" @click="showCreatePost = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <input v-model="postTitle" class="post-title-input" placeholder="标题" maxlength="100" required />
          <div class="post-title-counter">{{ postTitle.length }}/100</div>
          <textarea v-model="postContent" class="post-input" placeholder="说点什么… 使用 #话题 添加标签" rows="4" maxlength="10000"></textarea>
          <div class="post-content-counter">{{ postContent.length }}/10000</div>
          <div class="post-image-preview" v-if="postImages.length">
            <div v-for="(img, i) in postImages" :key="i" class="post-image-thumb">
              <img :src="img.url" />
              <button class="remove-image" @click="postImages.splice(i, 1)">×</button>
            </div>
          </div>
          <div class="post-toolbar">
            <label class="btn-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="3" width="14" height="12" rx="2" stroke="var(--text-secondary)" stroke-width="1.3"/>
                <circle cx="6" cy="7" r="1.5" fill="var(--text-secondary)"/>
                <path d="M2 12L6 8L10 12L13 9L16 12" stroke="var(--text-secondary)" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              <input type="file" accept="image/*" multiple @change="handlePostImageSelect" hidden />
            </label>
          </div>
          <div v-if="postError" class="error-message">{{ postError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreatePost = false">取消</button>
          <button class="btn btn-primary" @click="submitPost" :disabled="postSubmitting || !postTitle.trim() || !postContent.trim()">
            {{ postSubmitting ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="showPostImagePreview" class="modal-overlay" @click="showPostImagePreview = false">
      <img :src="previewImageUrl" class="post-image-full" @click.stop />
    </div>

    <!-- 编辑贴子弹窗 -->
    <div v-if="showEditPost" class="modal-overlay" @click="showEditPost = false">
      <div class="modal create-post-modal" @click.stop>
        <div class="modal-header">
          <h3>编辑贴子</h3>
          <button class="close-btn" @click="showEditPost = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <input v-model="editTitle" class="post-title-input" placeholder="标题" maxlength="100" />
          <div class="post-title-counter">{{ editTitle.length }}/100</div>
          <textarea v-model="editContent" class="post-input" placeholder="内容" rows="6" maxlength="10000"></textarea>
          <div class="post-content-counter">{{ editContent.length }}/10000</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditPost = false">取消</button>
          <button class="btn btn-primary" @click="submitEditPost" :disabled="!editContent.trim()">保存</button>
        </div>
      </div>
    </div>

    <!-- 通知面板 -->
    <div v-if="showNotificationPanel" class="modal-overlay" @click="showNotificationPanel = false">
      <div class="modal notification-modal" @click.stop>
        <div class="modal-header">
          <h3>通知</h3>
          <div class="modal-header-actions">
            <button v-if="notificationUnread > 0" class="btn btn-text btn-xs" @click="markAllNotificationsRead">全部已读</button>
            <button class="close-btn" @click="showNotificationPanel = false">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="modal-body">
          <div v-if="notifications.length === 0" class="empty-state">
            <p>暂无通知</p>
          </div>
          <div v-else class="notification-list">
            <div
              v-for="n in notifications"
              :key="n.id"
              class="notification-item"
              :class="{ unread: !n.is_read }"
            >
              <img :src="getAvatarUrl(n.avatar, n.nickname || n.username)" class="notification-avatar" />
              <div class="notification-content">
                <div class="notification-text">
                  <strong>{{ n.nickname || n.username }}</strong>
                  <span v-if="n.type === 'friend_request'"> 请求加你为好友</span>
                  <span v-else-if="n.type === 'friend_accepted'"> 接受了你的好友请求</span>
                  <span v-else-if="n.type === 'room_invite'"> 邀请你加入聊天室</span>
                </div>
                <div class="notification-meta">{{ formatTime(n.created_at) }}</div>
              </div>
              <div class="notification-actions" v-if="n.type === 'friend_request' && !n.is_read">
                <button class="btn btn-primary btn-xs" @click="acceptFriendRequest(n)">接受</button>
                <button class="btn btn-secondary btn-xs" @click="rejectFriendRequest(n)">拒绝</button>
              </div>
              <button v-if="!n.is_read && n.type !== 'friend_request'" class="btn btn-text btn-xs" @click="markNotificationRead(n.id)">标记已读</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showNotificationPanel = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 成员操作卡片 -->
    <div v-if="showMemberAction" class="modal-overlay" @click="showMemberAction = false">
      <div class="member-action-card" :style="memberActionStyle" @click.stop>
        <div class="member-action-header">
          <img :src="getAvatarUrl(memberActionTarget?.avatar, (memberActionTarget?.nickname || memberActionTarget?.username))" class="action-member-avatar" />
          <div class="action-member-info">
            <div class="action-member-name">{{ memberActionTarget?.nickname || memberActionTarget?.username }}</div>
            <div class="action-member-status">
              <span class="status-dot" :class="memberActionTarget?.status"></span>
              {{ memberActionTarget?.status === 'online' ? '在线' : memberActionTarget?.status === 'away' ? '离开' : '离线' }}
            </div>
          </div>
        </div>
        <div class="member-action-buttons">
          <button class="member-action-btn" @click="mentionMember" v-if="memberActionTarget?.id !== authStore.userId">
            @ 提及
          </button>
          <button class="member-action-btn" @click="addFriend" v-if="memberActionTarget?.id !== authStore.userId">
            添加好友
          </button>
          <template v-if="currentPermissions.isAdmin && memberActionTarget?.id !== authStore.userId">
            <button class="member-action-btn action-mute" @click="muteFromCard" v-if="!isEffectivelyMuted(memberActionTarget)">
              禁言
            </button>
            <button class="member-action-btn action-unmute" @click="unmuteFromCard" v-if="isEffectivelyMuted(memberActionTarget)">
              解除禁言
            </button>
          </template>
        </div>
      </div>
    </div>

    <div v-if="showDissolveConfirm" class="modal-overlay" @click="showDissolveConfirm = false">
      <div class="modal danger-modal" @click.stop>
        <div class="modal-header">
          <h3 class="danger-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="var(--danger)" stroke-width="1.5"/>
              <path d="M10 5V11" stroke="var(--danger)" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="10" cy="14" r="1" fill="var(--danger)"/>
            </svg>
            {{ isSuperAdmin ? '删除聊天室' : '解散聊天室' }}
          </h3>
          <button class="close-btn" @click="showDissolveConfirm = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="warning-text">
            {{ isSuperAdmin 
              ? '此操作将永久删除该聊天室及其所有消息记录，且无法恢复！' 
              : '此操作将解散该聊天室，所有成员将被移出，消息记录将被保留但无法继续发送消息。' 
            }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDissolveConfirm = false">取消</button>
          <button 
            class="btn btn-danger" 
            @click="confirmDissolve"
          >
            {{ isSuperAdmin ? '删除' : '确认解散' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast" :class="toastType">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { roomAPI, userAPI, notificationAPI, friendAPI, postAPI, messageAPI, api } from '@/api'
import { emojiCategories } from '@/utils/emojis'

const router = useRouter()
const authStore = useAuthStore()

const SUPER_ADMIN_USERNAME = '1y4w1s'

const isSuperAdmin = computed(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return false
  try {
    const user = JSON.parse(userStr)
    const username = user.username || user.userName || user.name || user.UserName
    return username === '1y4w1s'
  } catch (e) {
    console.error('parse user error:', e)
    return false
  }
})

const getAvatarUrl = (avatarPath, name) => {
  if (!avatarPath || !avatarPath.trim() || avatarPath.trim() === '/default-avatar.png') {
    const n = String(name || '?')
    const color = nameColor(n)
    const letter = n[0].toUpperCase()
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="${color}"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-weight="600" font-family="system-ui,sans-serif">${letter}</text></svg>`)}`
  }
  const path = avatarPath.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  if (path.startsWith('/')) {
    return `${window.location.origin}${path}`
  }
  return `${window.location.origin}/${path}`
}

const getRoomListAvatar = (room) => {
  const avatar = room.type === 'private' ? (room.friend_avatar || '') : (room.avatar || '')
  if (!avatar) return null
  const path = avatar.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${window.location.origin}${path}`
  return `${window.location.origin}/${path}`
}

const avatarColors = ['var(--status-away)','#ef4444','#8b5cf6','#06b6d4','var(--status-online)','#f97316','#ec4899','var(--accent)','#14b8a6','#eab308']
const nameColor = (name) => {
  if (!name) return avatarColors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function isEffectivelyMuted(member) {
  if (!member.is_muted) return false
  if (!member.muted_until) return true
  return new Date(member.muted_until).getTime() > Date.now()
}

const hasActiveMute = computed(() => {
  const me = currentMembers.value.find(m => m.id === authStore.userId)
  if (me) return isEffectivelyMuted(me)
  return currentPermissions.value.isMuted
})

const userStatus = computed(() => {
  const u = authStore.user
  let s = u?.status
  if (!s) {
    try { s = JSON.parse(localStorage.getItem('user') || 'null')?.status } catch {}
    s = s || 'online'
  }
  const dot = s === 'invisible' ? 'offline' : s
  let text
  if (s === 'invisible') text = '离线'
  else if (s === 'away') text = '离开'
  else if (s === 'offline') text = '离线'
  else text = '在线'
  return { dot, text }
})

const rooms = ref([])
const currentRoomId = ref(null)
const currentRoom = ref(null)
const currentMembers = ref([])
const sortedMembers = computed(() => {
  return [...currentMembers.value].sort((a, b) => {
    if (a.is_bot && !b.is_bot) return 1
    if (!a.is_bot && b.is_bot) return -1
    return 0
  })
})
const currentPermissions = ref({
  hasPermission: false,
  isAdmin: false,
  isOwner: false,
  isMuted: false,
  canSendMessage: true
})
const messages = ref([])
const newMessage = ref('')
const showCreateModal = ref(false)
const messageListRef = ref(null)
const showMessageActions = ref(null)
const messageActionsPos = ref({})

const newRoom = ref({
  name: '',
  description: '',
  type: 'public'
})

const showAvatarUpload = ref(false)
const selectedFile = ref(null)
const avatarPreview = ref(null)
const uploading = ref(false)
const uploadError = ref('')

const previewRoomId = ref(null)
const previewMembers = ref([])
const previewPosition = ref({})
const longPressTimer = ref(null)
const longPressTriggered = ref(false)

const showMemberManagement = ref(false)
const showMuteModal = ref(false)
const selectedMember = ref(null)
const muteDuration = ref(30)
const customDays = ref(0)
const customHours = ref(0)
const customMinutes = ref(0)
const muteReason = ref('')
const muteDurationOptions = [
  { label: '5 分钟', value: 5 },
  { label: '30 分钟', value: 30 },
  { label: '1 小时', value: 60 },
  { label: '24 小时', value: 1440 }
]

const showDissolveConfirm = ref(false)

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 聊天室设置
const showRoomSettings = ref(false)
const roomSettingsTab = ref('info')
const roomEditName = ref('')
const roomEditDesc = ref('')
const roomSaving = ref(false)
const roomSettingsMsg = ref('')
const roomSettingsMsgType = ref('')
const roomAvatarUploading = ref(false)

const roomAvatarUrl = computed(() => {
  if (!currentRoom.value) return '/default-avatar.png'
  const avatar = currentRoom.value.avatar
  if (!avatar) return '/default-avatar.png'
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/')) return `${window.location.origin}${avatar}`
  return avatar
})

const roomDetailAvatarUrl = computed(() => {
  if (!currentRoom.value) return '/default-avatar.png'
  const avatar = currentRoom.value.avatar
  if (!avatar) return '/default-avatar.png'
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/')) return `${window.location.origin}${avatar}`
  return avatar
})

const showRoomDrawer = ref(false)

// 侧边栏 Tab
const sidebarTab = ref('rooms')
const showMobileDrawer = ref(false)
const isDark = ref(document.documentElement.getAttribute('data-theme') === 'dark')

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
}
const showGroupChats = ref(true)
const showPrivateChats = ref(true)
const groupRooms = computed(() => rooms.value.filter(r => r.type !== 'private'))
const privateRooms = computed(() => rooms.value.filter(r => r.type === 'private'))
const friends = ref([])
const currentFriendRoomId = ref(null)

const loadFriends = async () => {
  if (!authStore.userId) return
  try {
    const response = await friendAPI.getList(authStore.userId)
    friends.value = response.data.friends
  } catch (e) {
  }
}

const openChatWithFriend = async (friend) => {
  try {
    const response = await roomAPI.findOrCreatePrivateRoom(authStore.userId, friend.id)
    if (response.success) {
      currentFriendRoomId.value = friend.id
      await joinRoom(response.data.room_id)
      sidebarTab.value = 'rooms'
    }
  } catch (e) {
  }
}

let readStatusTimer = null
const debouncedLoadReadStatus = () => {
  if (readStatusTimer) clearTimeout(readStatusTimer)
  readStatusTimer = setTimeout(() => {
    loadReadStatus()
  }, 3000)
}

// 贴子
const showCreatePost = ref(false)
const postTitle = ref('')
const postContent = ref('')
const postImages = ref([])
const postSubmitting = ref(false)
const postError = ref('')
const posts = ref([])
const postsLoading = ref(false)
const postsPage = ref(1)
const postsHasMore = ref(true)
const showPostImagePreview = ref(false)
const previewImageUrl = ref('')

const loadPosts = async (reset = false) => {
  if (postsLoading.value) return
  if (reset) { posts.value = []; postsPage.value = 1; postsHasMore.value = true }
  postsLoading.value = true
  try {
    const response = await postAPI.getList(authStore.userId, { page: postsPage.value, limit: 20 })
    const normalizeIsLiked = (p) => { p.is_liked = p.is_liked === 1 || p.is_liked === true || p.is_liked === '1'; return p }
    const normalizeNums = (p) => { p.likes_count = Number(p.likes_count) || 0; p.comments_count = Number(p.comments_count) || 0; return p }
    const normalized = (response.data.posts || []).map(p => normalizeNums(normalizeIsLiked(p)))
    if (reset) {
      posts.value = normalized
    } else {
      posts.value = [...posts.value, ...normalized]
    }
    postsHasMore.value = response.data.pagination.hasMore
  } catch (e) {
  }
  postsLoading.value = false
}

const loadMorePosts = () => {
  if (!postsHasMore.value || postsLoading.value) return
  postsPage.value++
  loadPosts()
}

const handlePostImageSelect = (e) => {
  for (const file of e.target.files) {
    postImages.value.push({ file, url: URL.createObjectURL(file) })
  }
  e.target.value = ''
}

const submitPost = async () => {
  if (!postContent.value.trim() || postSubmitting.value) return
  postSubmitting.value = true
  postError.value = ''
  try {
    const formData = new FormData()
    formData.append('title', postTitle.value.trim())
    formData.append('content', postContent.value.trim())
    for (const img of postImages.value) {
      formData.append('images', img.file)
    }
    await postAPI.create(authStore.userId, formData)
    showCreatePost.value = false
    postTitle.value = ''
    postContent.value = ''
    postImages.value = []
    loadPosts(true)
  } catch (e) {
    postError.value = e.message
  }
  postSubmitting.value = false
}

const toggleLike = async (post) => {
  try {
    if (post.is_liked) {
      const response = await postAPI.unlike(authStore.userId, post.id)
      post.likes_count = response.data.likes_count
      post.is_liked = false
      if (selectedPost.value && selectedPost.value.id === post.id) {
        selectedPost.value.likes_count = response.data.likes_count
        selectedPost.value.is_liked = false
      }
    } else {
      const response = await postAPI.like(authStore.userId, post.id)
      post.likes_count = response.data.likes_count
      post.is_liked = true
      if (selectedPost.value && selectedPost.value.id === post.id) {
        selectedPost.value.likes_count = response.data.likes_count
        selectedPost.value.is_liked = true
      }
    }
  } catch (e) {
  }
}

const deletePost = async (id) => {
  try {
    await postAPI.delete(authStore.userId, id)
    posts.value = posts.value.filter(p => p.id !== id)
  } catch (e) {
  }
}

const previewPostImage = (img) => {
  previewImageUrl.value = getPostImageUrl(img)
  showPostImagePreview.value = true
}

const getPostImageUrl = (imgPath) => {
  if (!imgPath) return ''
  const path = imgPath.trim()
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/')) return `${window.location.origin}${path}`
  return `${window.location.origin}/${path}`
}

const getMessageImageUrl = (msg) => {
  const url = msg.file_url || msg.content
  return getPostImageUrl(url)
}

const previewMessageImage = (msg) => {
  previewImageUrl.value = getMessageImageUrl(msg)
  showPostImagePreview.value = true
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 2592000) return Math.floor(diff / 86400) + '天前'
  return d.toLocaleDateString('zh-CN')
}

// 贴子详情
const activeMainTab = ref('chat')
const selectedPost = ref(null)

const switchToChat = () => { activeMainTab.value = 'chat' }
const switchToPost = () => { activeMainTab.value = 'post' }
const postComments = ref([])
const commentInput = ref('')
const showEditPost = ref(false)
const editTitle = ref('')
const editContent = ref('')
const showPostManageMenu = ref(false)
const replyTo = ref(null)
const showCommentEmojiPicker = ref(false)
const commentImages = ref([])
const commentInputRef = ref(null)

const topLevelComments = computed(() => postComments.value.filter(c => !c.parent_id))

const commentReplies = (parentId) => postComments.value.filter(c => c.parent_id === parentId)

const startReply = (comment) => {
  replyTo.value = comment
  commentInput.value = ''
  setTimeout(() => commentInputRef.value?.focus(), 50)
}

const cancelReply = () => {
  replyTo.value = null
  commentInput.value = ''
}

const handleCommentImageSelect = (e) => {
  const files = e.target.files
  for (const file of files) {
    commentImages.value.push({ file, preview: URL.createObjectURL(file) })
  }
  e.target.value = ''
}

const removeCommentImage = (i) => {
  URL.revokeObjectURL(commentImages.value[i].preview)
  commentImages.value.splice(i, 1)
}

const insertCommentEmoji = (emoji) => {
  commentInput.value += emoji
}

const normalizeIsLiked = (obj) => { if (obj) obj.is_liked = obj.is_liked === 1 || obj.is_liked === true || obj.is_liked === '1' }

const normalizePost = (p) => {
  if (!p) return p
  normalizeIsLiked(p)
  p.likes_count = Number(p.likes_count) || 0
  p.comments_count = Number(p.comments_count) || 0
  return p
}

const openPostDetail = async (post) => {
  showMobileDrawer.value = false
  activeMainTab.value = 'post'
  try {
    const response = await postAPI.getDetail(authStore.userId, post.id)
    selectedPost.value = normalizePost(response.data.post)
  } catch (e) {
    selectedPost.value = normalizePost(post)
  }
  loadComments(post.id)
}

const closePostDetail = () => {
  selectedPost.value = null
  postComments.value = []
  replyTo.value = null
  commentImages.value = []
}

const loadComments = async (postId) => {
  try {
    const response = await postAPI.getComments(authStore.userId, postId)
    postComments.value = (response.data.comments || []).map(c => { normalizeIsLiked(c); c.likes_count = Number(c.likes_count) || 0; return c })
  } catch (e) {
  }
}

const submitComment = async () => {
  if ((!commentInput.value.trim() && commentImages.value.length === 0) || !selectedPost.value) return
  try {
    let response
    if (commentImages.value.length) {
      const formData = new FormData()
      if (commentInput.value.trim()) formData.append('content', commentInput.value.trim())
      formData.append('image', commentImages.value[0].file)
      if (replyTo.value) formData.append('parent_id', replyTo.value.id)
      response = await postAPI.addCommentWithImage(authStore.userId, selectedPost.value.id, formData)
    } else {
      response = await postAPI.addComment(authStore.userId, selectedPost.value.id, commentInput.value.trim(), replyTo.value?.id)
    }
    normalizeIsLiked(response.data.comment)
    response.data.comment.likes_count = Number(response.data.comment.likes_count) || 0
    postComments.value.push(response.data.comment)
    selectedPost.value.comments_count = (selectedPost.value.comments_count || 0) + 1
    commentInput.value = ''
    commentImages.value = []
    replyTo.value = null
    const p = posts.value.find(p => p.id === selectedPost.value.id)
    if (p) p.comments_count = selectedPost.value.comments_count
  } catch (e) {
  }
}

const toggleCommentLike = async (comment) => {
  try {
    if (comment.is_liked) {
      const response = await postAPI.unlikeComment(authStore.userId, comment.id)
      comment.likes_count = response.data.likes_count
      comment.is_liked = false
    } else {
      const response = await postAPI.likeComment(authStore.userId, comment.id)
      comment.likes_count = response.data.likes_count
      comment.is_liked = true
    }
  } catch (e) {
  }
}

const deleteComment = async (commentId) => {
  try {
    await postAPI.deleteComment(authStore.userId, commentId)
    postComments.value = postComments.value.filter(c => c.id !== commentId)
    if (selectedPost.value) {
      selectedPost.value.comments_count = Math.max(0, (selectedPost.value.comments_count || 0) - 1)
      const p = posts.value.find(p => p.id === selectedPost.value.id)
      if (p) p.comments_count = selectedPost.value.comments_count
    }
  } catch (e) {
  }
}

const openEditPost = () => {
  if (!selectedPost.value) return
  editTitle.value = selectedPost.value.title || ''
  editContent.value = selectedPost.value.content || ''
  showEditPost.value = true
  showPostManageMenu.value = false
}

const submitEditPost = async () => {
  if (!editContent.value.trim() || !selectedPost.value) return
  try {
    await postAPI.update(authStore.userId, selectedPost.value.id, { title: editTitle.value.trim(), content: editContent.value.trim() })
    selectedPost.value.title = editTitle.value.trim()
    selectedPost.value.content = editContent.value.trim()
    showEditPost.value = false
    const p = posts.value.find(p => p.id === selectedPost.value.id)
    if (p) { p.title = editTitle.value.trim(); p.content = editContent.value.trim() }
  } catch (e) {
  }
}

const togglePostVisibility = async () => {
  if (!selectedPost.value) return
  try {
    const isPublic = !selectedPost.value.is_public
    await postAPI.setVisibility(authStore.userId, selectedPost.value.id, isPublic)
    selectedPost.value.is_public = isPublic
    showPostManageMenu.value = false
    const p = posts.value.find(p => p.id === selectedPost.value.id)
    if (p) p.is_public = isPublic
  } catch (e) {
  }
}

const togglePostComments = async () => {
  if (!selectedPost.value) return
  try {
    const allow = !selectedPost.value.allow_comments
    await postAPI.setCommentsToggle(authStore.userId, selectedPost.value.id, allow)
    selectedPost.value.allow_comments = allow
    showPostManageMenu.value = false
  } catch (e) {
  }
}

const deletePostFromDetail = async () => {
  if (!selectedPost.value) return
  try {
    await postAPI.delete(authStore.userId, selectedPost.value.id)
    posts.value = posts.value.filter(p => p.id !== selectedPost.value.id)
    showPostManageMenu.value = false
    closePostDetail()
  } catch (e) {
  }
}

// 通知
const showNotificationPanel = ref(false)
const notifications = ref([])
const notificationUnread = computed(() => notifications.value.filter(n => !n.is_read).length)

const loadNotifications = async () => {
  if (!authStore.userId) return
  try {
    const response = await notificationAPI.getList(authStore.userId)
    notifications.value = response.data.notifications
  } catch (e) {
  }
}

const markNotificationRead = async (id) => {
  try {
    await notificationAPI.markRead(authStore.userId, id)
    notifications.value = notifications.value.map(n =>
      n.id === id ? { ...n, is_read: 1 } : n
    )
  } catch (e) {
  }
}

const markAllNotificationsRead = async () => {
  try {
    await notificationAPI.markAllRead(authStore.userId)
    notifications.value = notifications.value.map(n => ({ ...n, is_read: 1 }))
  } catch (e) {
  }
}

const acceptFriendRequest = async (notification) => {
  try {
    const requests = await friendAPI.getRequests(authStore.userId)
    const pending = requests.data.requests.find(r => r.sender_id === notification.from_user_id)
    if (pending) {
      await friendAPI.respondRequest(authStore.userId, pending.id, 'accept')
    }
    await notificationAPI.markRead(authStore.userId, notification.id)
    notifications.value = notifications.value.map(n =>
      n.id === notification.id ? { ...n, is_read: 1 } : n
    )
    loadRooms()
  } catch (e) {
  }
}

const rejectFriendRequest = async (notification) => {
  try {
    const requests = await friendAPI.getRequests(authStore.userId)
    const pending = requests.data.requests.find(r => r.sender_id === notification.from_user_id)
    if (pending) {
      await friendAPI.respondRequest(authStore.userId, pending.id, 'reject')
    }
    await notificationAPI.markRead(authStore.userId, notification.id)
    notifications.value = notifications.value.map(n =>
      n.id === notification.id ? { ...n, is_read: 1 } : n
    )
  } catch (e) {
  }
}

// 未读状态
const roomReadStatus = ref({})

const getRoomUnread = (roomId) => {
  return Number(roomReadStatus.value[roomId]?.unread_count) || 0
}

const getRoomMention = (roomId) => {
  const val = roomReadStatus.value[roomId]?.is_mentioned
  return val === true || val === 1 || val === '1'
}

const formatUnread = (count) => {
  return count > 99 ? '99+' : String(count)
}

const loadReadStatus = async () => {
  if (!authStore.userId) return
  try {
    const response = await roomAPI.getReadStatus(authStore.userId)
    const map = {}
    for (const s of response.data) {
      map[s.room_id] = { unread_count: Number(s.unread_count), is_mentioned: s.is_mentioned == '1' || s.is_mentioned === true }
    }
    if (currentRoomId.value && map[currentRoomId.value]) {
      map[currentRoomId.value].unread_count = 0
      map[currentRoomId.value].is_mentioned = false
    }
    roomReadStatus.value = map
  } catch (e) {
  }
}

const markRoomRead = async (roomId) => {
  if (!authStore.userId) return
  try {
    await roomAPI.markRead(roomId, authStore.userId)
    const map = { ...roomReadStatus.value }
    if (map[roomId]) {
      map[roomId].unread_count = 0
      map[roomId].is_mentioned = false
    }
    roomReadStatus.value = map
  } catch (e) {
    // 静默失败
  }
}

// 成员操作卡片
const showMemberAction = ref(false)
const memberActionTarget = ref(null)
const memberActionStyle = ref({})

function openMemberAction(member, event) {
  memberActionTarget.value = member
  const rect = event.currentTarget.getBoundingClientRect()
  memberActionStyle.value = {
    position: 'fixed',
    left: Math.min(rect.left, window.innerWidth - 280) + 'px',
    top: Math.min(rect.bottom + 4, window.innerHeight - 180) + 'px',
    zIndex: 1100
  }
  showMemberAction.value = true
}

function mentionMember() {
  if (memberActionTarget.value && currentRoomId.value) {
    const username = memberActionTarget.value.nickname || memberActionTarget.value.username
    newMessage.value += `@${username} `
    showMemberAction.value = false
  }
}

function addFriend() {
  showMemberAction.value = false
  if (memberActionTarget.value && authStore.userId) {
    friendAPI.sendRequest(authStore.userId, { friendId: memberActionTarget.value.id })
      .then(() => {
        showToastMessage('好友申请已发送')
        loadRooms()
      })
      .catch(err => {
        showToastMessage(err.message || '发送好友申请失败', 'error')
      })
  }
}

function muteFromCard() {
  if (memberActionTarget.value) {
    const member = memberActionTarget.value
    showMemberAction.value = false
    openMuteModal(member)
  }
}

function unmuteFromCard() {
  if (memberActionTarget.value) {
    const memberId = memberActionTarget.value.id
    showMemberAction.value = false
    unmuteMember(memberId)
  }
}

function openMessageMemberAction(message, event) {
  const member = currentMembers.value.find(m => m.id === message.sender_id)
  if (member) {
    openMemberAction(member, event)
  } else {
    memberActionTarget.value = {
      id: message.sender_id,
      username: message.username,
      nickname: message.nickname,
      avatar: message.avatar,
      status: 'offline'
    }
    const rect = event.currentTarget.getBoundingClientRect()
    memberActionStyle.value = {
      position: 'fixed',
      left: Math.min(rect.left, window.innerWidth - 280) + 'px',
      top: Math.min(rect.bottom + 4, window.innerHeight - 180) + 'px',
      zIndex: 1100
    }
    showMemberAction.value = true
  }
}

// 聊天输入表情和图片
const showChatEmoji = ref(false)
const emojiTab = ref('emoji')
const stickerVersion = ref(0)
const myStickers = computed(() => {
  void stickerVersion.value
  try {
    return JSON.parse(localStorage.getItem('my_stickers') || '[]')
  } catch { return [] }
})

function sendSticker(url) {
  if (currentRoomId.value) {
    authStore.sendMessage(currentRoomId.value, url, 'image')
    showChatEmoji.value = false
  }
}
const currentEmojiCat = ref(0)
const chatImages = ref([])
const chatFiles = ref([])

function handleChatFileSelect(e) {
  for (const file of e.target.files) {
    chatFiles.value.push({ file })
  }
  e.target.value = ''
}

function removeChatFile(i) {
  chatFiles.value.splice(i, 1)
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📽', pptx: '📽', zip: '📦', rar: '📦', txt: '📃' }
  return icons[ext] || '📎'
}

function compressImage(file) {
  return new Promise((resolve) => {
    if (file.type === 'image/gif') {
      resolve(file)
      return
    }

    const maxWidth = 1920
    const maxSize = 1 * 1024 * 1024

    if (file.size < maxSize) {
      resolve(file)
      return
    }

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > maxWidth) {
        h = h * maxWidth / w
        w = maxWidth
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file)
          return
        }
        const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })
        resolve(compressedFile)
      }, 'image/jpeg', 0.85)
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}
const chatEmojiRef = ref(null)

// @ 提及功能
const showMentionPanel = ref(false)
const mentionQuery = ref('')
const mentionSelectedIndex = ref(0)
const mentionPanelRef = ref(null)

const filteredMentionMembers = computed(() => {
  if (!mentionQuery.value) return currentMembers.value
  const q = mentionQuery.value.toLowerCase()
  return currentMembers.value.filter(m => {
    const name = (m.nickname || m.username || '').toLowerCase()
    return name.includes(q)
  })
})

function insertChatEmoji(emoji) {
  newMessage.value += emoji
}

const handleChatImageSelect = (e) => {
  for (const file of e.target.files) {
    chatImages.value.push({ file, preview: URL.createObjectURL(file) })
  }
  e.target.value = ''
}

const removeChatImage = (i) => {
  URL.revokeObjectURL(chatImages.value[i].preview)
  chatImages.value.splice(i, 1)
}

// @ 提及处理
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

function handleMentionInput(event) {
  const cursorPos = getCursorPosition(event)
  if (cursorPos === -1) {
    showMentionPanel.value = false
    return
  }
  
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
      return
    }
  }
  
  showMentionPanel.value = false
}

function getCursorPosition(event) {
  if (event && event.target) {
    return event.target.selectionStart
  }
  const input = document.querySelector('.cc-input-wrap .cc-input')
  if (!input) return -1
  return input.selectionStart
}

function handleMentionKeydown(e) {
  if (!showMentionPanel.value) return
  
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    mentionSelectedIndex.value = Math.min(
      mentionSelectedIndex.value + 1,
      filteredMentionMembers.value.length - 1
    )
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

const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const loadRooms = async () => {
  try {
    const response = await roomAPI.getList({ userId: authStore.userId })
    rooms.value = response.data.rooms
    if (currentRoomId.value) {
      currentRoom.value = rooms.value.find(r => r.id === currentRoomId.value) || currentRoom.value
    }
    loadReadStatus()
  } catch (error) {
    console.error('加载聊天室失败:', error)
  }
}

const joinRoom = async (roomId) => {
  showMobileDrawer.value = false
  activeMainTab.value = 'chat'
  try {
    await roomAPI.join(roomId, authStore.userId)
    currentRoomId.value = roomId
    currentRoom.value = { ...(rooms.value.find(r => r.id === roomId)), enable_bot: rooms.value.find(r => r.id === roomId)?.enable_bot || 0 }
    
    const response = await roomAPI.getMessages(roomId)
    const API_BASE_URL = import.meta.env.VITE_API_URL || ''
    messages.value = response.data.messages
      .map(msg => {
        let avatar = ''
        if (msg.avatar && msg.avatar.trim()) {
          const avatarPath = msg.avatar.trim()
          avatar = avatarPath.startsWith('/') 
            ? `${window.location.origin}${avatarPath}`
            : avatarPath
        }
        return parseReplyContent({ ...msg, avatar })
      })
    
    await loadMembers(roomId)
    await loadPermissions(roomId)
    loadAnnouncements(roomId)
    authStore.joinRoom(roomId)
    markRoomRead(roomId)
  } catch (error) {
    console.error('加入聊天室失败:', error)
  }
}

const loadPermissions = async (roomId) => {
  try {
    const response = await roomAPI.getPermissions(roomId, authStore.userId)
    currentPermissions.value = response.data
  } catch (error) {
    console.error('加载权限失败:', error)
  }
}

let muteTickTimer = null

function startMuteTick() {
  muteTickTimer = setInterval(() => {
    if (currentMembers.value.length > 0) {
      currentMembers.value = [...currentMembers.value]
    }
  }, 1000)
}

const loadMembers = async (roomId) => {
  try {
    const response = await roomAPI.getMembers(roomId)
    currentMembers.value = response.data.members
  } catch (error) {
    console.error('加载成员列表失败:', error)
  }
}

const showMemberPreview = async (roomId, event) => {
  previewRoomId.value = roomId
  
  if (event && event.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect()
    previewPosition.value = {
      position: 'fixed',
      left: rect.left + 'px',
      top: (rect.bottom + 4) + 'px',
      width: rect.width + 'px',
      zIndex: '1000'
    }
  } else {
    previewPosition.value = {
      position: 'fixed',
      left: '320px',
      top: '80px',
      zIndex: '1000'
    }
  }
  
  try {
    const response = await roomAPI.getMembers(roomId)
    previewMembers.value = response.data.members
    console.log('成员预览数据:', previewMembers.value)
  } catch (error) {
    console.error('加载预览成员失败:', error)
    previewMembers.value = []
  }
}

const hideMemberPreview = () => {
  if (longPressTriggered.value) return
  previewRoomId.value = null
  previewMembers.value = []
}

function handleTouchStart(roomId, event) {
  longPressTriggered.value = false
  const target = event.currentTarget
  longPressTimer.value = setTimeout(() => {
    longPressTriggered.value = true
    showMemberPreview(roomId, { currentTarget: target })
  }, 500)
}

function handleTouchEnd() {
  clearTimeout(longPressTimer.value)
}

function handleRoomClick(id) {
  if (longPressTriggered.value) {
    longPressTriggered.value = false
    previewRoomId.value = null
    previewMembers.value = []
    return
  }
  joinRoom(id)
}

watch(showMobileDrawer, (val) => {
  if (!val) {
    longPressTriggered.value = false
    previewRoomId.value = null
    previewMembers.value = []
  }
})

const replyTarget = ref(null)
const roomAnnouncements = ref([])
const roomAnnouncement = computed(() => roomAnnouncements.value[0] || null)
const showAnnouncementList = ref(false)
const showAnnouncementEditor = ref(false)
const editingAnnouncement = ref(null)
const announcementFormContent = ref('')

async function loadAnnouncements(roomId) {
  try {
    const res = await api.get(`/rooms/${roomId}/announcements`)
    roomAnnouncements.value = res.data.announcements || []
  } catch (e) {
    console.error('loadAnnouncements 失败:', e)
  }
}

function replyMessage(message) {
  const display = message.type === 'image' ? '[图片]' : message.content
  replyTarget.value = {
    id: message.id,
    sender: message.nickname || message.username,
    display: display.length > 50 ? display.slice(0, 50) + '...' : display
  }
  showMessageActions.value = null
  document.querySelector('.cc-input-wrap .cc-input')?.focus()
}

function parseReplyContent(msg) {
  if (msg.reply_to) return msg
  try {
    const parsed = JSON.parse(msg.content)
    if (parsed && parsed.replyTo) {
      msg.reply_to = parsed.replyTo
      msg.content = parsed.text
    }
  } catch {}
  return msg
}

function scrollToMessage(messageId) {
  if (!messageListRef.value) return
  const el = messageListRef.value.querySelector(`[data-message-id="${messageId}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('highlight-flash')
    setTimeout(() => el.classList.remove('highlight-flash'), 1500)
  }
}

const sendMessage = async () => {
  if ((!newMessage.value.trim() && chatImages.value.length === 0) || !currentRoomId.value || hasActiveMute.value) {
    return
  }

  const roomId = currentRoomId.value
  let text = newMessage.value.trim()

  if (text && replyTarget.value) {
    text = JSON.stringify({ text, replyTo: replyTarget.value })
    replyTarget.value = null
  }

  if (text) {
    authStore.sendMessage(roomId, text)
    nextTick(() => scrollToBottom(true))
  }

  for (const img of chatImages.value) {
    const formData = new FormData()
    const compressed = await compressImage(img.file)
    formData.append('file', compressed)
    try {
      const res = await messageAPI.upload(authStore.userId, formData)
      if (res && res.data && res.data.url) {
        authStore.sendMessage(roomId, res.data.url, 'image')
      } else {
        console.error('图片上传返回异常:', res)
      }
    } catch (e) {
      console.error('图片上传失败:', e)
    }
  }

  for (const f of chatFiles.value) {
    const formData = new FormData()
    formData.append('file', f.file)
    try {
      const res = await messageAPI.upload(authStore.userId, formData)
      if (res && res.data && res.data.url) {
        authStore.sendMessage(roomId, res.data.url, 'file', { file_name: res.data.filename, file_size: res.data.size })
      } else {
        console.error('文件上传返回异常:', res)
      }
    } catch (e) {
      console.error('文件上传失败:', e)
    }
  }

  newMessage.value = ''
  chatImages.value = []
  chatFiles.value = []
}

let typingTimeout = null
const handleTyping = () => {
  if (currentRoomId.value) {
    authStore.sendTyping(currentRoomId.value)
    
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      authStore.sendStopTyping(currentRoomId.value)
    }, 1000)
  }
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

async function recallMessage(message) {
  try {
    await messageAPI.recall(authStore.userId, message.id)
    authStore.socket.emit('recall_message', {
      roomId: currentRoomId.value,
      messageId: message.id,
      userId: authStore.userId
    })
    message.is_deleted = true
    showMessageActions.value = null
  } catch (e) {
    console.error('撤回失败:', e)
  }
}

async function addToStickers(message) {
  const url = getMessageImageUrl(message)
  if (!url) return
  try {
    const stickers = JSON.parse(localStorage.getItem('my_stickers') || '[]')
    if (!stickers.includes(url)) {
      stickers.unshift(url)
      localStorage.setItem('my_stickers', JSON.stringify(stickers))
      stickerVersion.value++
    }
    showMessageActions.value = null
    showToastMessage('已添加到表情包')
  } catch (e) {
    console.error('添加表情失败:', e)
  }
}

function downloadFile(message) {
  const url = getMessageImageUrl(message)
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = message.file_name || message.content || 'file'
  a.target = '_blank'
  a.click()
}

function canOperateMember(member) {
  if (member.is_bot || member.id === authStore.user?.id) return false
  if (currentPermissions.isOwner) return true
  if (currentPermissions.isAdmin && member.role === 'member') return true
  return false
}

function canSetAdmin(member) {
  return currentPermissions.isOwner && member.role === 'member' && !member.is_bot
}

function canMute(member) {
  if (member.is_bot) return false
  if (currentPermissions.isOwner && member.role !== 'owner') return true
  if (currentPermissions.isAdmin && member.role === 'member') return true
  return false
}

function canKick(member) {
  if (member.is_bot) return false
  if (currentPermissions.isOwner && member.role !== 'owner') return true
  if (currentPermissions.isAdmin && member.role === 'member') return true
  return false
}

function canEditAnnouncement(ann) {
  if (!authStore.user) return false
  if (currentPermissions.isOwner || currentPermissions.isAdmin) return true
  return ann.user_id === authStore.user.id
}

async function kickMember(member) {
  if (!confirm(`确定将 ${member.nickname || member.username} 移出聊天室？`)) return
  try {
    await roomAPI.removeMember(currentRoomId.value, member.id, authStore.userId)
    await loadMembers(currentRoomId.value)
    showToastMessage('已移除')
  } catch (e) {
    showToastMessage(e.message || '操作失败', 'error')
  }
}

function editAnnouncement(ann) {
  editingAnnouncement.value = ann
  announcementFormContent.value = ann.content
  showAnnouncementList.value = false
  showAnnouncementEditor.value = true
}

async function deleteAnnouncement(ann) {
  if (!confirm('确定删除此公告？')) return
  try {
    await api.delete(`/rooms/${currentRoomId.value}/announcements/${ann.id}`, { data: { userId: authStore.userId } })
    await loadAnnouncements(currentRoomId.value)
    showToastMessage('公告已删除')
  } catch (e) {
    showToastMessage(e.message || '删除失败', 'error')
  }
}

async function submitAnnouncement() {
  const content = announcementFormContent.value.trim()
  if (!content) return
  try {
    if (editingAnnouncement.value) {
      await api.put(`/rooms/${currentRoomId.value}/announcements/${editingAnnouncement.value.id}`, { content, userId: authStore.userId })
      showToastMessage('公告已更新')
    } else {
      await api.post(`/rooms/${currentRoomId.value}/announcements`, { content, userId: authStore.userId })
      showToastMessage('公告已发布')
    }
    await loadAnnouncements(currentRoomId.value)
    showAnnouncementEditor.value = false
    editingAnnouncement.value = null
    announcementFormContent.value = ''
  } catch (e) {
    showToastMessage(e.message || '操作失败', 'error')
  }
}

const createRoom = async () => {
  try {
    const response = await roomAPI.create({ ...newRoom.value, owner_id: authStore.userId })
    await loadRooms()
    showCreateModal.value = false
    joinRoom(response.data.room.id)
    newRoom.value = { name: '', description: '', type: 'public' }
    showToastMessage('聊天室创建成功！')
  } catch (error) {
    console.error('创建聊天室失败:', error)
    showToastMessage('创建聊天室失败', 'error')
  }
}

const saveRoomSettings = async () => {
  if (!roomEditName.value.trim()) return
  roomSaving.value = true
  roomSettingsMsg.value = ''
  try {
    const response = await roomAPI.updateRoom(currentRoomId.value, authStore.userId, {
      name: roomEditName.value.trim(),
      description: roomEditDesc.value.trim()
    })
    if (response.success) {
      currentRoom.value = { ...currentRoom.value, name: roomEditName.value.trim(), description: roomEditDesc.value.trim() }
      rooms.value = rooms.value.map(r =>
        r.id === currentRoomId.value ? { ...r, name: roomEditName.value.trim(), description: roomEditDesc.value.trim() } : r
      )
      roomSettingsMsg.value = '保存成功'
      roomSettingsMsgType.value = 'success'
    }
  } catch (error) {
    roomSettingsMsg.value = error.message || '保存失败'
    roomSettingsMsgType.value = 'error'
  } finally {
    roomSaving.value = false
  }
}

const handleRoomAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) return
  if (file.size > 5 * 1024 * 1024) return

  roomAvatarUploading.value = true
  try {
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append('avatar', compressed)
    const response = await roomAPI.uploadRoomAvatar(currentRoomId.value, authStore.userId, formData)
    if (response.success) {
      const avatarPath = response.data.avatar
      const fullUrl = avatarPath.startsWith('/') ? `${window.location.origin}${avatarPath}` : avatarPath
      currentRoom.value = { ...currentRoom.value, avatar: fullUrl }
      rooms.value = rooms.value.map(r =>
        r.id === currentRoomId.value ? { ...r, avatar: fullUrl } : r
      )
    }
  } catch (error) {
    console.error('上传聊天室头像失败:', error)
  } finally {
    roomAvatarUploading.value = false
    event.target.value = ''
  }
}

const toggleBot = async (event) => {
  try {
    const enable = event ? event.target.checked : !currentRoom.value?.enable_bot
    const response = await roomAPI.toggleBot(currentRoomId.value, authStore.userId, enable)
    if (response.success) {
      currentRoom.value = { ...currentRoom.value, enable_bot: enable ? 1 : 0 }
      if (enable) {
        await loadMembers(currentRoomId.value)
      } else {
        currentMembers.value = currentMembers.value.filter(m => !m.is_bot)
      }
      showToastMessage(response.message)
    }
  } catch (error) {
    showToastMessage(error.message || '操作失败', 'error')
  }
}

const openRoomSettings = (tab = 'info') => {
  if (currentRoom.value) {
    roomEditName.value = currentRoom.value.name || ''
    roomEditDesc.value = currentRoom.value.description || ''
    roomSettingsTab.value = tab
    roomSettingsMsg.value = ''
    showRoomSettings.value = true
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    uploadError.value = '只支持 JPG、PNG、GIF、WebP 格式'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '文件大小不能超过 5MB'
    return
  }
  
  uploadError.value = ''
  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const uploadAvatar = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  uploadError.value = ''
  
  try {
    const compressed = await compressImage(selectedFile.value)
    const formData = new FormData()
    formData.append('avatar', compressed)
    
    const response = await userAPI.uploadAvatar(authStore.userId, formData)
    
    if (response.success) {
      const avatarPath = response.data.avatar
      let avatarUrl = avatarPath
      if (avatarPath.startsWith('/')) {
        avatarUrl = `${window.location.origin}${avatarPath}`
      }
      const updatedUser = { ...authStore.user, avatar: avatarUrl }
      authStore.user = updatedUser
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      showAvatarUpload.value = false
      selectedFile.value = null
      avatarPreview.value = null
      
      showToastMessage('头像上传成功！')
    } else {
      uploadError.value = response.error?.message || '上传失败'
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    uploadError.value = '上传失败，请重试'
  } finally {
    uploading.value = false
  }
}

const grantAdmin = async (userId) => {
  try {
    const response = await roomAPI.changeRole(
      currentRoomId.value,
      userId,
      'admin',
      authStore.userId,
      '授予管理员权限'
    )
    if (response.success) {
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('授予管理员权限失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const revokeAdmin = async (userId) => {
  try {
    const response = await roomAPI.changeRole(
      currentRoomId.value,
      userId,
      'member',
      authStore.userId,
      '撤销管理员权限'
    )
    if (response.success) {
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('撤销管理员权限失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const openMuteModal = (member) => {
  selectedMember.value = member
  muteDuration.value = 30
  customDays.value = 0
  customHours.value = 0
  customMinutes.value = 0
  muteReason.value = ''
  showMuteModal.value = true
}

const confirmMute = async () => {
  if (!selectedMember.value) return
  
  let duration
  if (muteDuration.value === 'custom') {
    const days = Math.min(customDays.value || 0, 29)
    const hours = Math.min(customHours.value || 0, 23)
    const minutes = Math.min(customMinutes.value || 0, 59)
    
    if (customDays.value > 29 || customHours.value > 23 || customMinutes.value > 59) {
      duration = 30 * 24 * 60
    } else {
      duration = days * 24 * 60 + hours * 60 + minutes
    }
  } else {
    duration = muteDuration.value
  }
  
  if (duration === 0) {
    showToastMessage('禁言时长不能为 0', 'error')
    return
  }
  
  try {
    const response = await roomAPI.muteMember(
      currentRoomId.value,
      selectedMember.value.id,
      true,
      duration,
      authStore.userId,
      muteReason.value || '违反聊天室规定'
    )
    if (response.success) {
      showMuteModal.value = false
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('禁言失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const unmuteMember = async (userId) => {
  try {
    const response = await roomAPI.muteMember(
      currentRoomId.value,
      userId,
      false,
      null,
      authStore.userId,
      '解除禁言'
    )
    if (response.success) {
      await loadMembers(currentRoomId.value)
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('解除禁言失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

let muteCheckTimer = null
let friendStatusTimer = null

watch(currentRoomId, (val) => {
  if (muteTickTimer) {
    clearInterval(muteTickTimer)
    muteTickTimer = null
  }
  if (muteCheckTimer) {
    clearInterval(muteCheckTimer)
    muteCheckTimer = null
  }
  if (val) {
    startMuteTick()
    muteCheckTimer = setInterval(() => {
      loadMembers(val)
      loadPermissions(val)
    }, 20000)
  }
})

const confirmDissolve = async () => {
  try {
    let response
    if (isSuperAdmin.value) {
      response = await roomAPI.forceDeleteRoom(
        currentRoomId.value,
        authStore.userId
      )
    } else {
      response = await roomAPI.dissolveRoom(
        currentRoomId.value,
        authStore.userId
      )
    }
    
    if (response.success) {
      showDissolveConfirm.value = false
      currentRoomId.value = null
      currentRoom.value = null
      currentMembers.value = []
      messages.value = []
      await loadRooms()
      showToastMessage(response.message)
    }
  } catch (error) {
    console.error('操作失败:', error)
    showToastMessage('操作失败', 'error')
  }
}

const isAtBottom = () => {
  if (!messageListRef.value) return true
  return messageListRef.value.scrollTop < 100
}

const scrollToBottom = (force = false) => {
  if (!messageListRef.value) return
  if (force || isAtBottom()) {
    messageListRef.value.scrollTop = 0
  }
}

const formatMuteDuration = (mutedUntil) => {
  if (!mutedUntil) {
    console.log('禁言时间为空:', mutedUntil)
    return ''
  }
  
  const now = new Date()
  const until = new Date(mutedUntil)
  const diffMs = until - now
  
  console.log('禁言时间计算:', {
    mutedUntil,
    until: until.toISOString(),
    now: now.toISOString(),
    diffMs
  })
  
  if (isNaN(diffMs) || diffMs <= 0) return ''
  
  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    const remainingHours = diffHours % 24
    const remainingMinutes = diffMinutes % 60
    return `（${diffDays}天${remainingHours}小时${remainingMinutes}分钟）`
  } else if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60
    return `（${diffHours}小时${remainingMinutes}分钟）`
  } else {
    return `（${diffMinutes}分钟）`
  }
}

const formatMuteTime = (mutedUntil) => {
  if (!mutedUntil) return ''
  const until = new Date(mutedUntil)
  if (isNaN(until.getTime())) return ''
  return `禁言至：${formatTime(until)}`
}

const setupSocketListeners = () => {
  const socket = authStore.socket
  
  if (!socket) return
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || ''
  
  socket.on('new_message', (message) => {
    if (message.room_id === currentRoomId.value) {
      const avatar = message.avatar && message.avatar.trim()
        ? `${API_BASE_URL}${message.avatar}`
        : ''
      const messageWithAvatar = parseReplyContent({ ...message, avatar })
      messages.value.unshift(messageWithAvatar)
      if (isAtBottom()) nextTick(() => scrollToBottom(true))
    }
    const map = { ...roomReadStatus.value }
    if (!map[message.room_id]) {
      map[message.room_id] = { unread_count: 0, is_mentioned: false }
    }
    if (message.room_id !== currentRoomId.value) {
      map[message.room_id].unread_count++
    }
    if (message.is_mention == 1 || message.is_mention === true) {
      map[message.room_id].is_mentioned = true
    }
    roomReadStatus.value = map
    debouncedLoadReadStatus()
  })
  
  socket.on('read_status_update', () => {
    loadReadStatus()
  })

  socket.on('notification_update', () => {
    loadNotifications()
  })

  socket.on('user_status_changed', (data) => {
    // 更新好友列表
    friends.value = friends.value.map(f =>
      f.id === data.userId ? { ...f, status: data.status } : f
    )
    
    // 更新当前聊天室成员列表
    currentMembers.value = currentMembers.value.map(m =>
      m.id === data.userId ? { ...m, status: data.status } : m
    )

    // 更新成员预览中的状态
    previewMembers.value = previewMembers.value.map(m =>
      m.id === data.userId ? { ...m, status: data.status } : m
    )

    // 如果状态变更的是当前用户自己，同步到本地存储
    if (authStore.user && data.userId === authStore.user.id) {
      const stored = JSON.parse(localStorage.getItem('user') || 'null')
      if (stored) {
        stored.status = data.status
        localStorage.setItem('user', JSON.stringify(stored))
      }
    }
  })

  socket.on('at_all_notification', (data) => {
    if (data.roomId === currentRoomId.value) {
      showToastMessage(`${data.username} 发出了 @全体成员`, 'info')
    }
  })

  socket.on('announcement_updated', (data) => {
    if (data.roomId === currentRoomId.value) {
      roomAnnouncement.value = data.announcement
    }
  })

  socket.on('announcement_created', () => {
    if (currentRoomId.value) loadAnnouncements(currentRoomId.value)
  })

  socket.on('announcement_deleted', () => {
    if (currentRoomId.value) loadAnnouncements(currentRoomId.value)
  })

  socket.on('user_avatar_updated', (data) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || ''
    messages.value = messages.value.map(msg => {
      if (msg.user_id === data.userId) {
        return { ...msg, avatar: `${API_BASE_URL}${data.avatar}` }
      }
      return msg
    })
  })
  
  socket.on('user_joined', (data) => {
    console.log('用户加入:', data.username)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
    }
  })
  
  socket.on('user_left', (data) => {
    console.log('用户离开:', data.username)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
    }
  })
  
  socket.on('role_changed', (data) => {
    console.log('角色变更:', data)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
      loadPermissions(currentRoomId.value)
      showToastMessage(
        data.role === 'admin' 
          ? '成员已被授予管理员权限' 
          : '成员管理员权限已被撤销'
      )
    }
  })
  
  socket.on('member_muted', (data) => {
    console.log('成员被禁言:', data)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
      loadPermissions(currentRoomId.value)
      showToastMessage(`成员已被禁言`)
    }
  })
  
  socket.on('member_unmuted', (data) => {
    console.log('成员解除禁言:', data)
    if (data.roomId === currentRoomId.value) {
      loadMembers(currentRoomId.value)
      loadPermissions(currentRoomId.value)
      showToastMessage(`成员已解除禁言`)
    }
  })
  
  socket.on('message_recalled', (data) => {
    if (data.roomId === currentRoomId.value) {
      const msg = messages.value.find(m => m.id === data.messageId)
      if (msg) {
        msg.is_deleted = true
      }
    }
  })
  
  socket.on('room_dissolved', (data) => {
    console.log('聊天室解散:', data)
    if (data.roomId === currentRoomId.value) {
      currentRoomId.value = null
      currentRoom.value = null
      currentMembers.value = []
      messages.value = []
      loadRooms()
      showToastMessage('聊天室已被解散', 'error')
    }
  })
  
  socket.on('room_deleted', (data) => {
    console.log('聊天室被删除:', data)
    if (data.roomId === currentRoomId.value) {
      currentRoomId.value = null
      currentRoom.value = null
      currentMembers.value = []
      messages.value = []
      loadRooms()
      showToastMessage('聊天室已被删除', 'error')
    }
  })
  
  socket.on('bot_toggled', (data) => {
    console.log('机器人状态变更:', data)
    if (data.roomId === currentRoomId.value) {
      if (currentRoom.value) {
        currentRoom.value = { ...currentRoom.value, enable_bot: data.enable }
      }
      if (data.enable) {
        loadMembers(currentRoomId.value)
      } else {
        currentMembers.value = currentMembers.value.filter(m => !m.is_bot)
      }
    }
  })
}

onMounted(() => {
  loadRooms()
  loadNotifications()
  loadPosts()
  setupSocketListeners()
  // 每30秒刷新好友状态
  friendStatusTimer = setInterval(() => {
    if (authStore.userId) {
      friendAPI.getList(authStore.userId)
        .then(response => {
          friends.value = response.data.friends
        })
        .catch(() => {})
    }
  }, 30000)
  
  document.addEventListener('click', () => {
    showMessageActions.value = null
  })
})

onUnmounted(() => {
  if (muteTickTimer) {
    clearInterval(muteTickTimer)
    muteTickTimer = null
  }
  if (muteCheckTimer) {
    clearInterval(muteCheckTimer)
    muteCheckTimer = null
  }
  if (friendStatusTimer) {
    clearInterval(friendStatusTimer)
    friendStatusTimer = null
  }
  if (currentRoomId.value) {
    authStore.leaveRoom(currentRoomId.value)
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background: var(--bg-secondary);
}

.sidebar {
  width: 300px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.sidebar-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.theme-toggle {
  color: var(--text-tertiary);
  transition: color 0.15s;
}

.theme-toggle:hover {
  color: var(--text-primary);
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  padding: 0 12px;
  gap: 2px;
}

.sidebar-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 4px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--text-tertiary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
  white-space: nowrap;
}

.sidebar-tab:hover {
  color: var(--text-secondary);
}

.sidebar-tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--text-primary);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.room-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
}

.room-list-title {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.empty-list-hint {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  position: relative;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: var(--hover);
  color: var(--text-secondary);
}

.btn-icon.has-notification {
  color: var(--text-primary);
}

.bell-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--danger);
  color: white;
  font-size: 9px;
  font-weight: 700;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.btn-text:hover {
  background: var(--hover);
  color: var(--text-secondary);
}

.btn-xs {
  padding: 2px 8px;
  font-size: 12px;
}

.notification-modal {
  max-width: 420px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.15s;
}

.notification-item.unread {
  background: #f0f7ff;
}

.notification-item:hover {
  background: var(--hover-light);
}

.notification-item.unread:hover {
  background: #e8f2ff;
}

.notification-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.notification-meta {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.notification-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  align-items: center;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* ==================== 贴子广场 ==================== */
.post-list {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.posts-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.post-card {
  background: var(--bg-primary);
  border: 1px solid var(--hover);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.post-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.post-author {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.post-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.post-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.post-delete-btn {
  background: none;
  border: none;
  color: var(--border-light);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.post-delete-btn:hover {
  color: var(--danger);
}

.post-content {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.post-tag {
  font-size: 12px;
  color: var(--accent);
  cursor: pointer;
}

.post-images {
  display: grid;
  gap: 4px;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.post-images.grid-1 { grid-template-columns: 1fr; }
.post-images.grid-2 { grid-template-columns: 1fr 1fr; }
.post-images.grid-3 { grid-template-columns: 1fr 1fr 1fr; }

.post-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  cursor: pointer;
  border-radius: 4px;
}

.post-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--hover);
}

.post-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.15s;
}

.post-action-btn:hover {
  background: var(--danger-bg);
  color: var(--danger);
}

.post-action-btn.liked {
  color: var(--danger);
}

.post-action-btn.liked:hover {
  background: var(--hover);
  color: var(--danger);
}

.load-more {
  text-align: center;
  padding: 16px;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
}

.load-more:hover {
  text-decoration: underline;
}

.create-post-modal {
  max-width: 480px;
}

.post-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;
}

.post-input:focus {
  outline: none;
  border-color: var(--text-primary);
}

.post-image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.post-image-thumb {
  position: relative;
  width: 80px;
  height: 80px;
}

.post-image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.remove-image {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--bubble-own);
  color: white;
  border: none;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-toolbar {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.post-toolbar .btn-icon {
  cursor: pointer;
}

.post-title-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  margin-bottom: 10px;
  transition: border-color 0.15s;
}

.post-title-input:focus {
  outline: none;
  border-color: var(--text-primary);
}

.post-title-counter,
.post-content-counter {
  text-align: right;
  font-size: 11px;
  color: var(--border-light);
  margin-top: 4px;
  margin-bottom: 8px;
}

.post-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.4;
}

.post-image-full {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  object-fit: contain;
}

/* ==================== 主区域 Tab 切换 ==================== */
.main-tabs {
  display: flex;
  border-bottom: 1px solid var(--hover);
  background: var(--bg-primary);
  flex-shrink: 0;
}

.main-tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: color 0.15s;
}

.main-tab:hover { color: var(--text-primary); }

.main-tab.active {
  color: var(--accent);
}

.main-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2.5px;
  background: var(--accent);
  border-radius: 2px 2px 0 0;
}

/* ==================== 贴子详情 ==================== */
.post-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.post-detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--hover);
  position: relative;
}

.post-detail-back {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  display: flex;
}

.post-detail-back:hover {
  color: var(--text-primary);
}

.post-detail-header h3 {
  font-size: 15px;
  font-weight: 600;
  flex: 1;
}

.post-detail-actions {
  position: relative;
}

.post-manage-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--hover);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  min-width: 130px;
  z-index: 50;
  padding: 4px;
}

.post-manage-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
}

.post-manage-menu button:hover {
  background: var(--hover);
}

.post-manage-menu button.danger {
  color: var(--danger);
}

.post-manage-menu button.danger:hover {
  background: var(--danger-bg);
}

.post-detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.post-detail-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.pd-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.pd-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.pd-time {
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pd-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.pd-badge.private {
  background: #fef3c7;
  color: #d97706;
}

.pd-badge.no-comment {
  background: var(--hover);
  color: var(--text-secondary);
}

.pd-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.pd-content {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.pd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.pd-tag {
  font-size: 13px;
  color: var(--accent);
}

.pd-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  border-radius: 10px;
  overflow: hidden;
}

.pd-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  cursor: pointer;
  border-radius: 6px;
}

.pd-actions {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--hover);
  margin-bottom: 16px;
}

.pd-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.15s;
}

.pd-action-btn:hover { background: var(--danger-bg); color: var(--danger); }
.pd-action-btn.liked { color: var(--danger); }

.pd-comments-section {
  margin-top: 4px;
}

.pd-comments-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.pd-no-comments, .pd-comments-closed {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.pd-comment {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.pd-comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.pd-comment-body {
  flex: 1;
  min-width: 0;
}

.pd-comment-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.pd-comment-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.pd-comment-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.pd-comment-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.pd-comment-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.pd-comment-like {
  display: flex;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  font-size: 11px;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 1px 4px;
  border-radius: 4px;
}

.pd-comment-like:hover { color: var(--danger); }
.pd-comment-like.liked { color: var(--danger); }

.pd-comment-del {
  font-size: 11px;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 1px 4px;
}

.pd-comment-del:hover {
  color: var(--danger);
}

.pd-comment-input-area {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--hover);
  margin-top: 4px;
}

.pd-comment-input-area .input {
  flex: 1;
}

/* ==================== 评论列表 ==================== */
.pd-comment-wrapper {
  margin-bottom: 6px;
}

.pd-comment {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.pd-comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.pd-comment-body { flex: 1; min-width: 0; }

.pd-comment-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.pd-comment-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.pd-comment-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.pd-comment-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.pd-comment-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 6px;
  cursor: pointer;
  object-fit: cover;
}

.pd-comment-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.pd-comment-like {
  display: flex;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  font-size: 11px;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.1s;
}

.pd-comment-like:hover { color: var(--danger); }
.pd-comment-like.liked { color: var(--danger); }

.pd-comment-reply-btn {
  font-size: 11px;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.pd-comment-reply-btn:hover { background: rgba(99,102,241,0.06); }

.pd-comment-del {
  font-size: 11px;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.pd-comment-del:hover { color: var(--danger); background: var(--danger-bg); }

.pd-replies {
  margin-left: 38px;
  border-left: 2px solid var(--hover);
  padding-left: 12px;
  margin-top: 2px;
  margin-bottom: 10px;
}

.pd-no-comments {
  text-align: center;
  padding: 24px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.pd-comments-closed {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 13px;
}

/* ==================== 卡片式评论区输入 ==================== */
.cc-card {
  background: var(--bg-tertiary);
  border-radius: 14px;
  padding: 14px 16px 16px;
  margin: 12px 0 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.cc-reply-hint {
  font-size: 13px;
  color: var(--accent);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-reply-cancel {
  font-size: 12px;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.cc-reply-cancel:hover { color: var(--danger); }

.cc-input-wrap {
  position: relative;
  flex: 1;
}

.cc-input-wrap .cc-input {
  width: 100%;
}

.cc-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-input {
  flex: 1;
  height: 48px;
  padding: 0 16px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  background: var(--bg-primary);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.cc-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}

.cc-input::placeholder {
  color: var(--text-tertiary);
}

.mention-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  max-height: 240px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1100;
}

.mention-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--hover);
  flex-shrink: 0;
}

.mention-count {
  font-size: 11px;
}

.mention-panel-list {
  overflow-y: auto;
  flex: 1;
  padding: 4px;
}

.mention-panel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.1s;
}

.mention-panel-item:hover,
.mention-panel-item.active {
  background: var(--hover);
}

.mention-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.mention-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mention-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bot-tag {
  font-size: 14px;
  line-height: 1;
}

.mention-panel-empty {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: var(--text-tertiary);
}

.cc-icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.cc-icon-btn:hover {
  background: var(--border);
  color: var(--text-primary);
}

.cc-icon-btn.active {
  color: var(--accent);
  background: rgba(99,102,241,0.08);
}

.cc-send-btn {
  height: 38px;
  padding: 0 18px;
  border: none;
  border-radius: 10px;
  background: var(--bubble-own);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.cc-send-btn:hover { background: #333; }

.cc-send-btn:disabled {
  background: var(--border-light);
  cursor: not-allowed;
}

.cc-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.cc-preview-item {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.cc-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cc-file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  min-width: 0;
}

.cc-file-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.cc-file-info {
  flex: 1;
  min-width: 0;
}

.cc-file-name {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cc-file-size {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 1px;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--hover);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 200px;
}

.message-file:hover {
  background: var(--border);
}

.file-card-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.file-card-info {
  flex: 1;
  min-width: 0;
}

.file-card-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-card-size {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.file-card-dl {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.message-own .message-file {
  background: var(--bubble-own);
  border-color: transparent;
}

.message-own .message-file .file-card-name {
  color: white;
}

.message-own .message-file .file-card-size {
  color: rgba(255,255,255,0.6);
}

.message-own .message-file .file-card-dl {
  color: rgba(255,255,255,0.6);
}

.cc-preview-del {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--danger);
  color: white;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.1s;
}

.cc-preview-del:hover { transform: scale(1.15); }

.cc-emoji-panel {
  margin-top: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-primary);
  padding: 10px;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

.cc-emoji-group {
  margin-bottom: 6px;
}

.cc-emoji-label {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
  padding: 0 2px;
}

.cc-emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.cc-emoji-cell {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 19px;
  border-radius: 6px;
  transition: background 0.1s;
}

.cc-emoji-cell:hover { background: var(--hover); }

.emoji-panel-tabs {
  display: flex;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}

.emoji-panel-tab {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  color: var(--text-tertiary);
}

.emoji-panel-tab:hover {
  background: var(--hover);
}

.emoji-panel-tab.active {
  background: var(--hover);
  color: var(--text-primary);
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.sticker-cell {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  cursor: pointer;
  padding: 4px;
  transition: border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sticker-cell:hover {
  border-color: var(--accent);
}

.sticker-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.sticker-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
  padding: 24px 8px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .cc-card { padding: 12px; }
  .cc-input { height: 38px; font-size: 13px; }
  .cc-icon-btn { width: 32px; height: 32px; }
  .cc-send-btn { height: 34px; padding: 0 14px; font-size: 13px; }
  .cc-emoji-cell { width: 30px; height: 30px; font-size: 17px; }
}

/* ==================== 深色模式覆写 ==================== */
[data-theme="dark"] .notification-item.unread {
  background: var(--accent-light);
}

[data-theme="dark"] .role-badge.owner {
  background: #3a2a0a;
  color: #fbbf24;
}

[data-theme="dark"] .muted-badge {
  background: #3a1a1a;
}

[data-theme="dark"] .btn-mute {
  background: #3a2a0a;
  color: #fbbf24;
}

[data-theme="dark"] .btn-mute:hover {
  background: #4a3a1a;
}

[data-theme="dark"] .btn-unmute {
  background: #1a2a1a;
  color: #34d399;
}

[data-theme="dark"] .btn-unmute:hover {
  background: #2a4a2a;
}

[data-theme="dark"] .btn-admin {
  background: #374151;
  color: #93c5fd;
}

[data-theme="dark"] .btn-admin:hover {
  background: #4b5563;
}

[data-theme="dark"] .btn-remove-admin {
  background: #374151;
  color: #d1d5db;
}

[data-theme="dark"] .btn-remove-admin:hover {
  background: #4b5563;
}

[data-theme="dark"] .role-badge.admin {
  background: #374151;
  color: #93c5fd;
}

[data-theme="dark"] .role-badge.bot {
  background: #374151;
  color: #c4b5fd;
}

[data-theme="dark"] .pd-badge.private {
  background: #3a2a0a;
  color: #fbbf24;
}

[data-theme="dark"] .msg.error {
  background: #3a1a1a;
  color: var(--danger);
  border-color: #5c2020;
}

[data-theme="dark"] .pd-comment-del:hover {
  color: var(--danger);
}

[data-theme="dark"] .member-action-btn {
  color: #d1d5db;
}

[data-theme="dark"] .member-action-btn:hover {
  background: #374151;
}

[data-theme="dark"] .member-action-btn.action-mute {
  color: #fbbf24;
}

[data-theme="dark"] .member-action-btn.action-unmute {
  color: #34d399;
}

/* ==================== 移动端响应式 ==================== */
.mobile-header {
  display: none;
}

.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 85vw;
    max-width: 340px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.4);
    z-index: 199;
  }

  .mobile-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    gap: 12px;
    flex-shrink: 0;
  }

  .mobile-menu-btn {
    background: none;
    border: none;
    padding: 4px;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .mobile-title {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-header-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-header-btn:hover {
    background: var(--hover);
  }

  .chat-container {
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .chat-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .chat-main > .no-room {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .chat-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .message-list {
    flex: 1;
    overflow-y: auto;
  }

  .chat-input-footer .cc-card {
    margin: 6px 12px 10px;
  }

  .modal {
    width: 92vw;
    max-width: 92vw;
  }

  .room-settings-modal {
    width: 92vw;
  }
}

.room-list {
  padding: 4px 12px 12px;
}

.room-category {
  margin-bottom: 2px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px 4px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: var(--text-tertiary);
}

.category-header:hover {
  color: var(--text-secondary);
}

.category-arrow {
  font-size: 10px;
  transition: transform 0.15s;
  line-height: 1;
}

.category-arrow.expanded {
  transform: rotate(90deg);
}

.category-label {
  font-weight: 500;
}

.category-count {
  font-size: 11px;
  color: var(--border-light);
  margin-left: auto;
}

.friend-list {
  padding: 4px 12px 12px;
}

.friend-count {
  font-size: 12px;
  color: var(--border-light);
}

.friend-status {
  font-size: 13px;
  color: var(--text-secondary);
}

.room-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}

.room-item:hover {
  background: var(--bg-body);
}

.room-item.active {
  background: var(--bubble-own);
}

.room-item.active .room-name {
  color: white;
}

.room-item.active .room-members {
  color: rgba(255,255,255,0.7);
}

.room-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-body);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
}

.room-list-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.default-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.default-avatar span {
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--danger);
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 2;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.mention-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--status-away);
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.mention-badge ~ .unread-badge {
  top: -4px;
  right: 14px;
}

.room-item.active .room-icon {
  background: rgba(255,255,255,0.15);
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
}

.private-badge {
  font-size: 12px;
  flex-shrink: 0;
}

.room-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.room-members {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.member-preview {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  padding: 16px;
  min-width: 240px;
}

.preview-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--bubble-other);
  display: flex;
  justify-content: space-between;
}

.member-count {
  color: var(--text-tertiary);
  font-weight: 400;
}

.preview-list {
  max-height: 280px;
  overflow-y: auto;
}

.preview-member {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.preview-member:not(:last-child) {
  border-bottom: 1px solid var(--bg-body);
}

.preview-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.preview-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-role {
  background: var(--hover);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 4px;
}

.preview-more {
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  padding: 8px 0;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 16px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-left p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.header-more-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.header-more-btn:hover {
  background: var(--hover);
  color: var(--text-primary);
}

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
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
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
}

.drawer-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.drawer-room-top {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  align-items: center;
}

.drawer-room-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
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
}

.drawer-section {
  padding: 12px 20px;
}

.drawer-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.drawer-section-action {
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.drawer-section-action:hover {
  background: var(--hover);
  color: var(--text-primary);
}

.drawer-section-action.primary {
  color: var(--accent);
}

.drawer-section-action.primary:hover {
  background: var(--accent-light);
}

.drawer-section-actions {
  display: flex;
  gap: 2px;
}

.drawer-announcement-body {
  background: var(--hover);
  border-radius: 8px;
  padding: 12px;
}

.drawer-announcement-body p {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
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
}

.drawer-divider {
  height: 1px;
  background: var(--hover);
  margin: 0 20px;
}

.drawer-member-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-radius: 6px;
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
  gap: 6px;
}

.drawer-member-name {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  gap: 4px;
  flex-shrink: 0;
}

.member-op-btn {
  padding: 2px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.member-op-btn:hover {
  background: var(--hover);
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.member-op-btn.danger {
  color: var(--danger);
  border-color: var(--danger);
}

.member-op-btn.danger:hover {
  background: var(--danger-bg);
}

.drawer-member-more {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
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

.bot-label {
  font-size: 14px;
  line-height: 1;
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

.announcement-history-item {
  padding: 14px 0;
  border-bottom: 1px solid var(--hover);
}

.announcement-history-item:last-child {
  border-bottom: none;
}

.announcement-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.announcement-history-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.announcement-history-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.announcement-history-content {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
}

.announcement-history-ops {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

.drawer-spacer {
  flex: 1;
}

.drawer-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 14px;
  border-radius: 8px;
  color: var(--text-primary);
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

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  color: inherit;
}

.nav-arrow {
  color: var(--text-tertiary);
  font-size: 14px;
}

.drawer-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
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

.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column-reverse;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 70%;
}

.message-own {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-content {
  max-width: 100%;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-own .message-header {
  flex-direction: row-reverse;
}

.message-own .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 1;
}

.message-own .message-text {
  text-align: left;
}

.message-sender {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.bot-badge {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}

.at-all-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  background: var(--danger);
  color: white;
  padding: 1px 5px;
  border-radius: 4px;
  line-height: 1.4;
  flex-shrink: 0;
}

.message-time {
  font-size: 11px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.message-text {
  display: inline-block;
  background: var(--bubble-other);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--bubble-other);
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  word-break: break-word;
  max-width: 100%;
}

.message-image {
  display: block;
  max-width: 280px;
  max-height: 300px;
  border-radius: 12px;
  cursor: pointer;
  object-fit: cover;
  border: 1px solid var(--bubble-other);
}

.message-own .message-image {
  border-color: transparent;
}

.message-own .message-text {
  background: var(--bubble-own);
  color: white;
  border-color: var(--bubble-other);
}

.message-deleted {
  opacity: 0.5;
  pointer-events: none;
}

.message-deleted .message-avatar {
  filter: grayscale(1);
}

.message-recalled {
  font-size: 13px;
  color: var(--text-tertiary);
  font-style: italic;
  padding: 4px 0;
}

.message-own .message-recalled {
  color: #aaa;
}

.reply-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--hover);
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.reply-bar-left {
  flex: 1;
  min-width: 0;
}

.reply-bar-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.reply-bar-content {
  display: block;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.reply-bar-close {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reply-bar-close:hover {
  color: var(--text-primary);
}

.message-reply {
  padding: 6px 10px;
  margin-bottom: 6px;
  background: var(--hover);
  border-left: 3px solid var(--accent);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.message-reply:hover {
  background: var(--border);
}

.reply-sender {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 2px;
}

.reply-content {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.highlight-flash {
  animation: flashHighlight 1.5s ease;
}

@keyframes flashHighlight {
  0% { background: var(--accent-light); }
  100% { background: transparent; }
}

.message-actions {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.15s, background 0.15s;
  margin-top: 4px;
}

.message-actions:hover {
  opacity: 1;
  background: rgba(0,0,0,0.05);
}

.message-actions-menu {
  position: fixed;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  overflow: hidden;
  z-index: 2100;
}

.message-actions-menu button {
  display: block;
  width: 100%;
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition: background 0.1s;
}

.message-actions-menu button:hover {
  background: var(--hover);
}

.chat-input-footer {
  padding: 0;
  background: transparent;
  border: none;
}

.chat-input-footer .muted-notice {
  padding: 10px 24px;
  background: var(--danger-bg);
  color: var(--danger);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--danger-border);
}

.emoji-picker-wrapper {
  position: relative;
  flex-shrink: 0;
}

.emoji-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.emoji-btn:hover {
  background: var(--hover);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.emoji-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.emoji-picker {
  position: absolute;
  bottom: 48px;
  left: 0;
  width: 330px;
  height: 320px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.emoji-categories {
  display: flex;
  gap: 2px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-shrink: 0;
}

.emoji-cat-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
  padding: 0;
}

.emoji-cat-btn:hover {
  background: var(--hover);
}

.emoji-cat-btn.active {
  background: var(--border);
}

.emoji-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: 8px;
}

.emoji-item, .emoji-cell {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
  padding: 0;
}

.emoji-item:hover, .emoji-cell:hover {
  background: var(--hover);
}

.emoji-grid::-webkit-scrollbar {
  width: 4px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 2px;
}

/* 聊天室设置弹窗 */
.settings-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: var(--hover);
}

.tab-btn.active {
  background: var(--bubble-own);
  color: white;
}

.room-avatar-upload {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.room-avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.room-settings-avatar {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  display: block;
  background: var(--hover);
}

.room-avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 12px;
}

.room-avatar-wrapper:hover .room-avatar-overlay {
  opacity: 1;
}

.room-settings-modal {
  max-width: 560px;
}

  /* ==================== 成员操作卡片 ==================== */
.member-action-card {
  position: fixed;
  width: 240px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 16px;
  z-index: 3100;
}

.member-action-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--hover);
}

.action-member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.action-member-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.action-member-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.member-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
}

.member-action-btn:hover {
  background: var(--hover);
}

.form-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.msg {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 12px;
}

.msg.success {
  background: #f0fff4;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.msg.error {
  background: #fff0f0;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
}

.no-room {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.no-room svg {
  margin-bottom: 16px;
}

.no-room p {
  font-size: 15px;
}

.modal .form-group {
  margin-bottom: 16px;
}

.modal .form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.modal textarea.input {
  resize: vertical;
  min-height: 80px;
}

.modal select.input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 16px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-area {
  text-align: center;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.uploading {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 12px;
}

.modal .error {
  color: var(--danger);
  font-size: 13px;
  margin-top: 12px;
  text-align: center;
}

.member-management-modal {
  max-width: 600px;
}

.member-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 16px;
  border-bottom: 1px solid var(--bubble-other);
  margin-bottom: 8px;
}

.member-list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.member-list-bot-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bot-toggle-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.bot-toggle-status {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  min-width: 40px;
}

.bot-toggle-status.enabled {
  color: #059669;
}

.toggle-switch.inline {
  margin: 0;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--bubble-other);
}

.member-item:last-child {
  border-bottom: none;
}

.member-item.bot-member {
  opacity: 0.7;
}

.bot-member .member-status {
  color: var(--border-light);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.role-badge.owner {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.admin {
  background: var(--hover);
  color: var(--text-secondary);
}

.role-badge.member {
  background: var(--hover);
  color: var(--text-secondary);
}

.role-badge.bot {
  background: var(--hover);
  color: var(--text-primary);
}

.member-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.no-status {
  color: var(--border-light);
}

.bot-status {
  font-size: 12px;
  color: #7c3aed;
}

.bot-settings-section {
  border-top: 1px solid var(--bubble-other);
  padding: 16px 0;
  margin-top: 8px;
}

.bot-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.bot-settings-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.bot-settings-icon {
  font-size: 24px;
  line-height: 1;
}

.bot-settings-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bot-settings-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.bot-settings-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
}

.bot-settings-control {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.bot-status-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  transition: color 0.2s;
}

.bot-status-text.enabled {
  color: #059669;
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
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--accent);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.muted-badge {
  background: #fee2e2;
  color: var(--danger);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 4px;
}

.member-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.btn-admin {
  background: var(--hover);
  color: var(--text-primary);
}

.btn-admin:hover {
  background: var(--border);
}

.btn-remove-admin {
  background: var(--hover);
  color: var(--text-secondary);
}

.btn-remove-admin:hover {
  background: var(--border);
}

.btn-mute {
  background: #fef3c7;
  color: #92400e;
}

.btn-mute:hover {
  background: #fde68a;
}

.btn-unmute {
  background: #f0fdf4;
  color: #166534;
}

.btn-unmute:hover {
  background: #dcfce7;
}

.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.duration-btn {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.duration-btn:hover {
  border-color: var(--text-primary);
}

.duration-btn.active {
  background: var(--bubble-own);
  color: white;
  border-color: var(--text-primary);
}

.custom-duration-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.duration-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-small {
  width: 60px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}

.duration-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.danger-title {
  color: var(--danger);
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

.toast.success {
  background: var(--bubble-own);
  color: white;
}

.toast.error {
  background: var(--danger);
  color: white;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
