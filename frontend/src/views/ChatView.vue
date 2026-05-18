﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div class="chat-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>聊天</h2>
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

      <div class="sidebar-tabs">
        <button class="sidebar-tab" :class="{ active: sidebarTab === 'rooms' }" @click="sidebarTab = 'rooms'">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 9H14M9 4V14" :stroke="sidebarTab === 'rooms' ? 'currentColor' : '#9ca3af'" :stroke-width="sidebarTab === 'rooms' ? 2.2 : 1.5" stroke-linecap="round"/>
            <circle cx="9" cy="9" r="7.5" :stroke="sidebarTab === 'rooms' ? 'currentColor' : '#9ca3af'" :fill="sidebarTab === 'rooms' ? 'currentColor' : 'none'" stroke-width="1.5"/>
          </svg>
          <span>聊天室</span>
        </button>
        <button class="sidebar-tab" :class="{ active: sidebarTab === 'friends' }" @click="sidebarTab = 'friends'; loadFriends()">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7" cy="5.5" r="3" :stroke="sidebarTab === 'friends' ? 'currentColor' : '#9ca3af'" :fill="sidebarTab === 'friends' ? 'currentColor' : 'none'" stroke-width="1.5"/>
            <path d="M2 15.5C2 12.7 4.2 10.5 7 10.5C9.8 10.5 12 12.7 12 15.5" :stroke="sidebarTab === 'friends' ? 'currentColor' : '#9ca3af'" :fill="sidebarTab === 'friends' ? 'currentColor' : 'none'" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="13" cy="5.5" r="2" :stroke="sidebarTab === 'friends' ? 'currentColor' : '#9ca3af'" stroke-width="1.2" fill="none"/>
            <path d="M16 15.5C16 13.3 14.6 11.5 13 11.5" :stroke="sidebarTab === 'friends' ? 'currentColor' : '#9ca3af'" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          </svg>
          <span>好友</span>
        </button>
        <button class="sidebar-tab" :class="{ active: sidebarTab === 'posts' }" @click="sidebarTab = 'posts'">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2.5" y="2.5" width="13" height="13" rx="2" :stroke="sidebarTab === 'posts' ? 'currentColor' : '#9ca3af'" :fill="sidebarTab === 'posts' ? 'currentColor' : 'none'" stroke-width="1.5"/>
            <path d="M5.5 7H12.5M5.5 10H10.5" :stroke="sidebarTab === 'posts' ? 'white' : '#9ca3af'" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <span>贴子</span>
        </button>
      </div>

      <div class="sidebar-content">
        <div v-show="sidebarTab === 'rooms'" class="room-list">
          <div class="room-list-header">
            <span class="room-list-title">聊天列表</span>
            <button class="btn btn-primary btn-sm" @click="showCreateModal = true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
                @click="joinRoom(room.id)"
                @mouseenter="showMemberPreview(room.id)"
                @mouseleave="hideMemberPreview"
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
                <img :src="getAvatarUrl(member.avatar)" class="preview-avatar" />
                <div class="preview-info">
                  <div class="preview-name">{{ member.nickname || member.username }}</div>
                  <div class="preview-status" :class="member.status">
                    <span class="status-dot" :class="member.status"></span>
                    {{ member.status === 'online' ? '在线' : member.status === 'away' ? '离开' : '离线' }}
                    <span v-if="member.role === 'owner' || member.role === 'admin'" class="preview-role">
                      {{ member.role === 'owner' ? '群主' : '管理员' }}
                    </span>
                  </div>
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
              <img v-if="friend.avatar" :src="getAvatarUrl(friend.avatar)" class="room-list-avatar" />
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

        <div v-show="sidebarTab === 'posts'" class="posts-placeholder">
          <div class="empty-list-hint">贴子广场 · 敬请期待</div>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-info" @click="goToProfile" title="点击进入个人中心">
          <img :src="getAvatarUrl(authStore.user?.avatar)" class="avatar" />
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
      <div v-if="currentRoomId" class="chat-wrapper">
        <header class="chat-header">
          <div class="header-left" @click="showRoomDetail = true" style="cursor:pointer">
            <h3>{{ currentRoom?.name }}</h3>
            <p>{{ currentRoom?.description }}</p>
          </div>
          <div class="header-right">
            <button 
              v-if="currentPermissions.isAdmin && currentRoom?.type !== 'private'" 
              class="btn btn-secondary btn-sm" 
              @click="openRoomSettings"
            >
              聊天室设置
            </button>
            <button 
              v-if="isSuperAdmin && currentRoom?.type !== 'private'" 
              class="btn btn-danger btn-sm" 
              @click="showDissolveConfirm = true"
            >
              删除聊天室
            </button>
            <button 
              v-else-if="currentPermissions.isOwner && currentRoom?.type !== 'private'" 
              class="btn btn-danger btn-sm" 
              @click="showDissolveConfirm = true"
            >
              解散
            </button>
          </div>
        </header>

        <div class="message-list" ref="messageListRef">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{ 'message-own': message.sender_id === authStore.user?.id }"
          >
            <img :src="message.avatar || '/default-avatar.png'" class="message-avatar" @click="openMessageMemberAction(message, $event)" style="cursor:pointer" />
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.nickname || message.username }}</span>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>
        </div>

        <footer class="message-input">
          <div v-if="hasActiveMute" class="muted-notice">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#dc2626" stroke-width="1.5"/>
              <path d="M8 4V9" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="8" cy="11.5" r="1" fill="#dc2626"/>
            </svg>
            您已被禁言，无法发送消息
          </div>
          <div class="emoji-picker-wrapper" ref="emojiPickerRef">
            <button class="emoji-btn" @click="toggleEmojiPicker" :disabled="hasActiveMute" title="选择表情">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="7" cy="8" r="1" fill="currentColor"/>
                <circle cx="13" cy="8" r="1" fill="currentColor"/>
                <path d="M6 12C6 12 7.5 14 10 14C12.5 14 14 12 14 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <div v-if="showEmojiPicker" class="emoji-picker">
              <div class="emoji-categories">
                <button
                  v-for="(cat, idx) in emojiCategories"
                  :key="idx"
                  class="emoji-cat-btn"
                  :class="{ active: currentEmojiCat === idx }"
                  @click="currentEmojiCat = idx"
                  :title="cat.name"
                >{{ cat.icon }}</button>
              </div>
              <div class="emoji-grid">
                <button
                  v-for="(emoji, eidx) in emojiCategories[currentEmojiCat].emojis"
                  :key="eidx"
                  class="emoji-item"
                  @click="insertEmoji(emoji)"
                >{{ emoji }}</button>
              </div>
            </div>
          </div>
          <input
            v-model="newMessage"
            type="text"
            class="input"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            @input="handleTyping"
            :disabled="hasActiveMute"
          />
          <button 
            class="btn btn-primary btn-sm send-btn" 
            @click="sendMessage" 
            :disabled="!newMessage.trim() || hasActiveMute"
          >
            发送
          </button>
        </footer>
      </div>

      <div v-else class="no-room">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="12" width="48" height="40" rx="4" stroke="#e5e7eb" stroke-width="2"/>
          <path d="M8 24H56" stroke="#e5e7eb" stroke-width="2"/>
          <circle cx="16" cy="18" r="2" fill="#e5e7eb"/>
          <circle cx="24" cy="18" r="2" fill="#e5e7eb"/>
          <circle cx="32" cy="18" r="2" fill="#e5e7eb"/>
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
            <div
              v-for="member in currentMembers"
              :key="member.id"
              class="member-item"
            >
              <img :src="getAvatarUrl(member.avatar)" class="member-avatar" @click="openMemberAction(member, $event)" style="cursor:pointer" />
              <div class="member-info">
                <div class="member-name">
                  {{ member.nickname || member.username }}
                  <span v-if="member.role === 'owner'" class="role-badge owner">群主</span>
                  <span v-else-if="member.role === 'admin'" class="role-badge admin">管理员</span>
                  <span v-else class="role-badge member">成员</span>
                </div>
                <div class="member-status">
                  <span class="status-dot" :class="member.status"></span>
                  {{ member.status === 'online' ? '在线' : member.status === 'away' ? '离开' : '离线' }}
                  <span v-if="isEffectivelyMuted(member)" class="muted-badge" :title="formatMuteTime(member.muted_until)">
                    已禁言{{ formatMuteDuration(member.muted_until) }}
                  </span>
                </div>
              </div>
              <div class="member-actions">
                <button 
                  v-if="currentPermissions.isOwner && member.role === 'member'"
                  class="action-btn btn-admin"
                  @click="grantAdmin(member.id)"
                >设为管理员</button>
                <button 
                  v-if="currentPermissions.isOwner && member.role === 'admin'"
                  class="action-btn btn-remove-admin"
                  @click="revokeAdmin(member.id)"
                >撤销管理员</button>
                <button 
                  v-if="currentPermissions.isAdmin && member.role === 'member' && !isEffectivelyMuted(member)"
                  class="action-btn btn-mute"
                  @click="openMuteModal(member)"
                >禁言</button>
                <button 
                  v-if="currentPermissions.isAdmin && isEffectivelyMuted(member)"
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

    <div v-if="showRoomDetail" class="modal-overlay" @click="showRoomDetail = false">
      <div class="modal room-detail-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ currentRoom?.name }}</h3>
          <button class="close-btn" @click="showRoomDetail = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="room-detail-avatar">
            <img :src="roomDetailAvatarUrl" class="detail-room-avatar" />
          </div>
          <div class="room-detail-info">
            <div class="detail-row">
              <span class="detail-label">名称</span>
              <span class="detail-value">{{ currentRoom?.name }}</span>
            </div>
            <div class="detail-row" v-if="currentRoom?.description">
              <span class="detail-label">简介</span>
              <span class="detail-value">{{ currentRoom?.description }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">类型</span>
              <span class="detail-value">{{ currentRoom?.type === 'private' ? '私有' : '公开' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">成员数</span>
              <span class="detail-value">{{ currentMembers.length }} 人</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">创建者</span>
              <span class="detail-value">{{ currentRoom?.owner_name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">创建时间</span>
              <span class="detail-value">{{ formatTime(currentRoom?.created_at) }}</span>
            </div>
          </div>
          <div class="room-detail-members">
            <h4>成员列表（{{ currentMembers.length }}）</h4>
            <div class="detail-member-list">
              <div v-for="member in currentMembers" :key="member.id" class="detail-member-item" @click="openMemberAction(member, $event)">
                <img :src="getAvatarUrl(member.avatar)" class="detail-member-avatar" />
                <div class="detail-member-name">{{ member.nickname || member.username }}</div>
                <span v-if="member.role === 'owner'" class="role-badge owner">群主</span>
                <span v-else-if="member.role === 'admin'" class="role-badge admin">管理员</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showRoomDetail = false">关闭</button>
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
              <img :src="getAvatarUrl(n.avatar)" class="notification-avatar" />
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
          <img :src="getAvatarUrl(memberActionTarget?.avatar)" class="action-member-avatar" />
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
              <circle cx="10" cy="10" r="8" stroke="#dc2626" stroke-width="1.5"/>
              <path d="M10 5V11" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="10" cy="14" r="1" fill="#dc2626"/>
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
import { roomAPI, userAPI, notificationAPI, friendAPI } from '@/api'
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

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath || !avatarPath.trim()) {
    return '/default-avatar.png'
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

const avatarColors = ['#f59e0b','#ef4444','#8b5cf6','#06b6d4','#10b981','#f97316','#ec4899','#6366f1','#14b8a6','#eab308']
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

const showRoomDetail = ref(false)

// 侧边栏 Tab
const sidebarTab = ref('rooms')
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

// 表情选择器
const showEmojiPicker = ref(false)
const currentEmojiCat = ref(0)
const emojiPickerRef = ref(null)

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function insertEmoji(emoji) {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

function handleClickOutsideEmoji(e) {
  if (emojiPickerRef.value && !emojiPickerRef.value.contains(e.target)) {
    showEmojiPicker.value = false
  }
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
  try {
    await roomAPI.join(roomId, authStore.userId)
    currentRoomId.value = roomId
    currentRoom.value = rooms.value.find(r => r.id === roomId)
    
    const response = await roomAPI.getMessages(roomId)
    const API_BASE_URL = import.meta.env.VITE_API_URL || ''
    messages.value = response.data.messages
      .map(msg => {
        let avatar = '/default-avatar.png'
        if (msg.avatar && msg.avatar.trim()) {
          const avatarPath = msg.avatar.trim()
          avatar = avatarPath.startsWith('/') 
            ? `${window.location.origin}${avatarPath}`
            : avatarPath
        }
        return { ...msg, avatar }
      })
    
    await loadMembers(roomId)
    await loadPermissions(roomId)
    authStore.joinRoom(roomId)
    markRoomRead(roomId)
    
    setTimeout(() => {
      scrollToBottom(true)
    }, 200)
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
  
  previewPosition.value = {
    position: 'fixed',
    left: '320px',
    top: '80px',
    zIndex: '1000'
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
  previewRoomId.value = null
  previewMembers.value = []
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !currentRoomId.value || hasActiveMute.value) {
    return
  }
  
  authStore.sendMessage(currentRoomId.value, newMessage.value)
  newMessage.value = ''
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
    const formData = new FormData()
    formData.append('avatar', file)
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

const openRoomSettings = () => {
  if (currentRoom.value) {
    roomEditName.value = currentRoom.value.name || ''
    roomEditDesc.value = currentRoom.value.description || ''
    roomSettingsTab.value = 'info'
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
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)
    
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
  const { scrollTop, scrollHeight, clientHeight } = messageListRef.value
  return scrollHeight - scrollTop - clientHeight < 100
}

const scrollToBottom = (force = false) => {
  if (!messageListRef.value) return
  if (force || isAtBottom()) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${year}/${month}/${day} ${hours}:${minutes}`
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
        : '/default-avatar.png'
      const messageWithAvatar = { ...message, avatar }
      messages.value.push(messageWithAvatar)
      nextTick(() => scrollToBottom())
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
    friends.value = friends.value.map(f =>
      f.id === data.userId ? { ...f, status: data.status } : f
    )
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
}

onMounted(() => {
  loadRooms()
  loadNotifications()
  setupSocketListeners()
  document.addEventListener('click', handleClickOutsideEmoji)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideEmoji)
  if (muteTickTimer) {
    clearInterval(muteTickTimer)
    muteTickTimer = null
  }
  if (muteCheckTimer) {
    clearInterval(muteCheckTimer)
    muteCheckTimer = null
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
  background: #fafafa;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
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
  color: #9ca3af;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
  white-space: nowrap;
}

.sidebar-tab:hover {
  color: #6b7280;
}

.sidebar-tab.active {
  color: #1a1a1a;
  border-bottom-color: #1a1a1a;
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
  color: #9ca3af;
  font-weight: 500;
}

.empty-list-hint {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
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
  color: #6b7280;
  position: relative;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-icon.has-notification {
  color: #1a1a1a;
}

.bell-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
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
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.btn-text:hover {
  background: #f3f4f6;
  color: #374151;
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
  background: #f9fafb;
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
  color: #374151;
  line-height: 1.4;
}

.notification-meta {
  font-size: 11px;
  color: #9ca3af;
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
  color: #9ca3af;
  font-size: 14px;
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
  color: #9ca3af;
}

.category-header:hover {
  color: #6b7280;
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
  color: #d1d5db;
  margin-left: auto;
}

.friend-list {
  padding: 4px 12px 12px;
}

.friend-count {
  font-size: 12px;
  color: #d1d5db;
}

.friend-status {
  font-size: 13px;
  color: #6b7280;
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
  background: #f5f5f5;
}

.room-item.active {
  background: #1a1a1a;
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
  background: #f5f5f5;
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
  background: #ef4444;
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
  background: #f59e0b;
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
  color: #1a1a1a;
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
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.room-members {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.member-preview {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  padding: 16px;
  min-width: 240px;
}

.preview-header {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
}

.member-count {
  color: #9ca3af;
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
  border-bottom: 1px solid #f5f5f5;
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
  color: #1a1a1a;
}

.preview-status {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-role {
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 4px;
}

.preview-more {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 8px 0;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
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
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 12px;
  color: #6b7280;
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
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-left p {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 2px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
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
  color: #1a1a1a;
  white-space: nowrap;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

.message-text {
  display: inline-block;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.5;
  word-break: break-word;
  max-width: 100%;
}

.message-own .message-text {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
}

.message-input {
  position: relative;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  align-items: center;
}

.send-btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.muted-notice {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #fecaca;
}

.emoji-picker-wrapper {
  position: relative;
  flex-shrink: 0;
}

.emoji-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fafafa;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.emoji-btn:hover {
  background: #f3f4f6;
  color: #1a1a1a;
  border-color: #d1d5db;
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
  background: white;
  border: 1px solid #e5e7eb;
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
  border-bottom: 1px solid #e5e7eb;
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
  background: #f3f4f6;
}

.emoji-cat-btn.active {
  background: #e5e7eb;
}

.emoji-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: 8px;
}

.emoji-item {
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

.emoji-item:hover {
  background: #f3f4f6;
}

.emoji-grid::-webkit-scrollbar {
  width: 4px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

/* 聊天室设置弹窗 */
.settings-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

.tab-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: #f3f4f6;
}

.tab-btn.active {
  background: #1a1a1a;
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
  background: #f3f4f6;
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

.room-detail-modal {
  max-width: 480px;
}

.room-detail-avatar {
  text-align: center;
  margin-bottom: 20px;
}

.detail-room-avatar {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  object-fit: cover;
  background: #f3f4f6;
}

.room-detail-info {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-label {
  width: 80px;
  font-size: 13px;
  color: #9ca3af;
  flex-shrink: 0;
}

.detail-value {
  font-size: 14px;
  color: #1a1a1a;
  word-break: break-word;
}

.room-detail-members h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.detail-member-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
}

.detail-member-item:hover {
  background: #f9fafb;
}

.detail-member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.detail-member-name {
  flex: 1;
  font-size: 13px;
  color: #1a1a1a;
}

/* 成员操作卡片 */
.member-action-card {
  position: fixed;
  width: 240px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 16px;
  z-index: 1100;
}

.member-action-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
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
  color: #1a1a1a;
}

.action-member-status {
  font-size: 12px;
  color: #6b7280;
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
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  text-align: left;
}

.member-action-btn:hover {
  background: #f3f4f6;
}

.form-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
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
  color: #9ca3af;
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
  color: #374151;
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
  color: #9ca3af;
  margin-top: 8px;
}

.uploading {
  text-align: center;
  color: #6b7280;
  font-size: 13px;
  margin-top: 12px;
}

.modal .error {
  color: #dc2626;
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

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.member-item:last-child {
  border-bottom: none;
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
  color: #1a1a1a;
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
  background: #e0e7ff;
  color: #3730a3;
}

.role-badge.member {
  background: #f3f4f6;
  color: #6b7280;
}

.member-status {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.muted-badge {
  background: #fee2e2;
  color: #dc2626;
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
  background: #e0e7ff;
  color: #3730a3;
}

.btn-admin:hover {
  background: #c7d2fe;
}

.btn-remove-admin {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-remove-admin:hover {
  background: #e5e7eb;
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.duration-btn:hover {
  border-color: #1a1a1a;
}

.duration-btn.active {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
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
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}

.duration-label {
  font-size: 13px;
  color: #6b7280;
}

.danger-title {
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-text {
  font-size: 14px;
  color: #374151;
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
  background: #1a1a1a;
  color: white;
}

.toast.error {
  background: #dc2626;
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
