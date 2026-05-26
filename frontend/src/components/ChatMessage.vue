<template>
  <div
    class="message"
    :class="{ 'message-own': isOwn, 'message-deleted': message.is_deleted }"
    :data-message-id="message.id"
  >
    <img
      :src="getAvatarUrl(message.avatar, message.nickname || message.username)"
      class="message-avatar"
      @click="$emit('openMemberAction', message, $event)"
    />
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
          <svg class="reply-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 1L1 3.5L3 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 3.5H6.5C7.8 3.5 9 4.5 9 6V8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <span class="reply-label">{{ message.reply_to.sender }}</span>
        </div>
        <img
          v-if="message.type === 'image'"
          :src="getMessageImageUrl(message)"
          class="message-image"
          @click="$emit('previewImage', message)"
        />
        <div v-else-if="message.type === 'file'" class="message-file" @click="$emit('downloadFile', message)">
          <span class="file-card-icon">{{ getFileIcon(message.file_name || message.content) }}</span>
          <div class="file-card-info">
            <div class="file-card-name">{{ message.file_name || message.content }}</div>
            <div class="file-card-size" v-if="message.file_size">{{ formatFileSize(message.file_size) }}</div>
          </div>
          <svg class="file-card-dl" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V11M4 7L8 11L12 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 13H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
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
      <div v-if="showActions" class="message-actions-menu" :style="actionsPos">
        <button @click.stop="$emit('reply', message)">回复</button>
        <button v-if="canRecall" @click.stop="$emit('recall', message)">撤回</button>
        <button v-if="message.type === 'image'" @click.stop="$emit('addToStickers', message)">添加到表情包</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: { type: Object, required: true },
  isOwn: Boolean,
  showActions: Boolean,
  actionsPos: { type: Object, default: () => ({}) },
  canRecall: Boolean,
  getAvatarUrl: { type: Function, required: true },
  getMessageImageUrl: { type: Function, required: true },
  formatTime: { type: Function, required: true },
  formatFileSize: { type: Function, required: true },
  getFileIcon: { type: Function, required: true }
})

defineEmits([
  'previewImage', 'downloadFile', 'toggleActions',
  'reply', 'recall', 'addToStickers',
  'scrollToMessage', 'openMemberAction'
])
</script>

<style scoped>
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
  cursor: pointer;
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

.message-own .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 1;
}

.message-own .message-header {
  flex-direction: row-reverse;
}

.message-own .message-text {
  text-align: left;
}

.message-sender {
  font-size: var(--text-sm, 13px);
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
  font-size: var(--text-xs, 11px);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.message-text {
  display: inline-block;
  background: var(--bubble-other);
  padding: 12px 16px;
  border-radius: var(--radius-md, 12px);
  font-size: var(--text-base, 14px);
  color: var(--bubble-other-text, var(--text-primary));
  line-height: 1.5;
  word-break: break-word;
  max-width: 100%;
  box-shadow: var(--bubble-other-shadow, 0 1px 2px rgba(0,0,0,0.04));
  transition: box-shadow var(--transition-fast, 150ms);
}

.message-image {
  display: block;
  max-width: 280px;
  max-height: 300px;
  border-radius: var(--radius-md, 12px);
  cursor: pointer;
  object-fit: cover;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.04));
  transition: transform var(--transition-fast, 150ms), box-shadow var(--transition-fast, 150ms);
}

.message-image:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08));
}

.message-own .message-image {
  border: none;
}

.message-own .message-text {
  background: var(--bubble-own);
  color: var(--bubble-own-text, white);
  box-shadow: var(--bubble-own-shadow, 0 2px 8px rgba(0,0,0,0.12));
}

.message-deleted {
  opacity: 0.5;
  pointer-events: none;
}

.message-deleted .message-avatar {
  filter: grayscale(1);
}

.message-recalled {
  font-size: var(--text-sm, 13px);
  color: var(--text-tertiary);
  font-style: italic;
  padding: 4px 0;
}

.message-own .message-recalled {
  color: #aaa;
}

.message-reply {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 1px 7px 1px 5px;
  margin-bottom: 4px;
  background: var(--hover);
  border-radius: 4px;
  transition: background 0.15s;
  line-height: 1;
}

.message-reply:hover {
  background: var(--border);
}

.reply-arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.reply-label {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius, 8px);
  cursor: pointer;
  transition: background var(--transition-fast, 150ms);
}

.message-own .message-file {
  background: rgba(255,255,255,0.1);
}

.message-file:hover {
  background: var(--hover);
}

.file-card-icon {
  font-size: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-card-info {
  flex: 1;
  min-width: 0;
}

.file-card-name {
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-card-size {
  font-size: var(--text-xs, 11px);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.file-card-dl {
  flex-shrink: 0;
  opacity: 0.5;
}

.message-actions {
  position: relative;
  display: flex;
  margin-top: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--transition-fast, 150ms);
}

.message:hover .message-actions {
  opacity: 0.6;
}

.message-actions:hover {
  opacity: 1 !important;
}

.message-own .message-actions {
  justify-content: flex-end;
}

.message-actions-menu {
  position: absolute;
  top: 100%;
  background: var(--bg-elevated, white);
  border: 1px solid var(--border);
  border-radius: var(--radius, 8px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.1));
  z-index: 100;
  min-width: 120px;
  overflow: hidden;
}

.message-own .message-actions-menu {
  right: 0;
}

.message-actions-menu button {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  font-size: var(--text-sm, 13px);
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast, 150ms);
}

.message-actions-menu button:hover {
  background: var(--hover);
}
</style>
