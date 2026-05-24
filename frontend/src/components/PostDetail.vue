<template>
  <div class="post-detail">
    <div class="post-detail-header">
      <h3>贴子详情</h3>
      <div class="post-detail-actions" v-if="post.user_id === currentUserId">
        <button class="btn-icon" @click="showManageMenu = !showManageMenu">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="4.5" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="9" r="1.2" fill="currentColor"/>
            <circle cx="9" cy="13.5" r="1.2" fill="currentColor"/>
          </svg>
        </button>
        <div v-if="showManageMenu" class="post-manage-menu">
          <button @click="$emit('edit', post)">编辑</button>
          <button @click="$emit('toggleVisibility', post)">{{ post.is_public ? '设为私密' : '设为公开' }}</button>
          <button @click="$emit('toggleComments', post)">{{ post.allow_comments ? '关闭评论' : '开启评论' }}</button>
          <button class="danger" @click="$emit('delete', post)">删除</button>
        </div>
      </div>
    </div>
    <div class="post-detail-body">
      <div class="post-detail-author">
        <img :src="getAvatarUrl(post.avatar, post.nickname || post.username)" class="pd-avatar" />
        <div>
          <div class="pd-name">{{ post.nickname || post.username }}</div>
          <div class="pd-time">{{ formatTime(post.created_at) }}
            <span v-if="!post.is_public" class="pd-badge private">私密</span>
            <span v-if="post.allow_comments === false" class="pd-badge no-comment">禁评</span>
          </div>
        </div>
      </div>
      <div v-if="post.title" class="pd-title">{{ post.title }}</div>
      <div class="pd-content">{{ post.content }}</div>
      <div v-if="post.tags && post.tags.length" class="pd-tags">
        <span v-for="tag in post.tags" :key="tag" class="pd-tag">#{{ tag }}</span>
      </div>
      <div v-if="post.images && post.images.length" class="pd-images">
        <img v-for="(img, i) in post.images" :key="i" :src="getPostImageUrl(img)" class="pd-image" @click="$emit('previewImage', img)" />
      </div>
      <div class="pd-actions">
        <button class="pd-action-btn" :class="{ liked: post.is_liked }" @click="$emit('toggleLike', post)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="post.is_liked ? 'currentColor' : 'none'" :stroke="post.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.2"/>
          </svg>
          <span>{{ post.likes_count || '' }}</span>
        </button>
      </div>
      <div class="pd-comments-section">
        <div class="pd-comments-title">评论（{{ post.comments_count || 0 }}）</div>
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
              <img v-if="comment.image" :src="getPostImageUrl(comment.image)" class="pd-comment-image" @click="$emit('previewImage', comment.image)" />
              <div class="pd-comment-actions">
                <button class="pd-comment-like" :class="{ liked: comment.is_liked }" @click="$emit('toggleCommentLike', comment)">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="comment.is_liked ? 'currentColor' : 'none'" :stroke="comment.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.2"/>
                  </svg>
                  <span>{{ comment.likes_count || '' }}</span>
                </button>
                <button class="pd-comment-reply-btn" @click="startReply(comment)">回复</button>
                <button v-if="comment.user_id === currentUserId || post.user_id === currentUserId" class="pd-comment-del" @click="$emit('deleteComment', comment.id)">删除</button>
              </div>
            </div>
          </div>
          <div v-if="getReplies(comment.id).length" class="pd-replies">
            <div v-for="reply in getReplies(comment.id)" :key="reply.id" class="pd-comment pd-reply">
              <img :src="getAvatarUrl(reply.avatar, reply.nickname || reply.username)" class="pd-comment-avatar" />
              <div class="pd-comment-body">
                <div class="pd-comment-header">
                  <span class="pd-comment-name">{{ reply.nickname || reply.username }}</span>
                  <span class="pd-comment-time">{{ formatTime(reply.created_at) }}</span>
                </div>
                <div class="pd-comment-text">{{ reply.content }}</div>
                <img v-if="reply.image" :src="getPostImageUrl(reply.image)" class="pd-comment-image" @click="$emit('previewImage', reply.image)" />
                <div class="pd-comment-actions">
                  <button class="pd-comment-like" :class="{ liked: reply.is_liked }" @click="$emit('toggleCommentLike', reply)">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M8 14C8 14 2 9.5 2 5.5C2 3.5 3.5 2 5.5 2C6.9 2 8 3 8 3C8 3 9.1 2 10.5 2C12.5 2 14 3.5 14 5.5C14 9.5 8 14 8 14Z" :fill="reply.is_liked ? 'currentColor' : 'none'" :stroke="reply.is_liked ? 'currentColor' : 'var(--text-tertiary)'" stroke-width="1.2"/>
                    </svg>
                    <span>{{ reply.likes_count || '' }}</span>
                  </button>
                  <button v-if="reply.user_id === currentUserId || post.user_id === currentUserId" class="pd-comment-del" @click="$emit('deleteComment', reply.id)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="post.allow_comments !== false" class="cc-card">
          <div v-if="replyTo" class="cc-reply-hint">
            回复 @{{ replyTo.nickname || replyTo.username }}
            <button class="cc-reply-cancel" @click="cancelReply">取消</button>
          </div>
          <div class="cc-input-row">
            <input v-model="commentInput" class="cc-input" :placeholder="replyTo ? '输入回复...' : '写评论...'" @keyup.enter="submitComment" ref="commentInputRef" />
            <button v-if="showEmojiPicker" class="cc-icon-btn active" @click="showEmojiPicker = false">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="6.5" cy="7.5" r="1" fill="currentColor"/>
                <circle cx="13.5" cy="7.5" r="1" fill="currentColor"/>
                <path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </button>
            <button v-else class="cc-icon-btn" @click="showEmojiPicker = true" title="表情">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="6.5" cy="7.5" r="1" fill="currentColor"/>
                <circle cx="13.5" cy="7.5" r="1" fill="currentColor"/>
                <path d="M6 12C6 12 7.5 14.5 10 14.5C12.5 14.5 14 12 14 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </button>
            <label class="cc-icon-btn" title="图片">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
                <path d="M2.5 13L7 9L11 13L14.5 10L17.5 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              <input type="file" accept="image/*" @change="handleImageSelect" hidden />
            </label>
            <button class="cc-send-btn" @click="submitComment" :disabled="!commentInput.trim() && images.length === 0">发布</button>
          </div>
          <div v-if="images.length" class="cc-previews">
            <div v-for="(img, i) in images" :key="i" class="cc-preview-item">
              <img :src="img.preview" />
              <button class="cc-preview-del" @click="removeImage(i)">×</button>
            </div>
          </div>
          <div v-if="showEmojiPicker" ref="emojiPickerRef" class="cc-emoji-panel">
            <div v-for="category in emojiCategories" :key="category.name" class="cc-emoji-group">
              <div class="cc-emoji-label">{{ category.name }}</div>
              <div class="cc-emoji-grid">
                <button v-for="emoji in category.emojis" :key="emoji" class="cc-emoji-cell" @click="insertEmoji(emoji)">{{ emoji }}</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="pd-comments-closed">评论已关闭</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAvatarUrl, getPostImageUrl, formatTime } from '@/composables/useChatUtils'
import { emojiCategories } from '@/utils/emojis'

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits([
  'edit',
  'toggleVisibility',
  'toggleComments',
  'delete',
  'previewImage',
  'toggleLike',
  'toggleCommentLike',
  'deleteComment',
  'submitComment'
])

const topLevelComments = computed(() => props.comments.filter(c => !c.parent_id))

const getReplies = (parentId) => props.comments.filter(c => c.parent_id === parentId)

const showManageMenu = ref(false)
const commentInput = ref('')
const replyTo = ref(null)
const showEmojiPicker = ref(false)
const images = ref([])
const commentInputRef = ref(null)

const startReply = (comment) => {
  replyTo.value = comment
  commentInput.value = ''
  setTimeout(() => commentInputRef.value?.focus(), 50)
}

const cancelReply = () => {
  replyTo.value = null
  commentInput.value = ''
}

const handleImageSelect = (e) => {
  const files = e.target.files
  for (const file of files) {
    images.value.push({ file, preview: URL.createObjectURL(file) })
  }
  e.target.value = ''
}

const removeImage = (i) => {
  URL.revokeObjectURL(images.value[i].preview)
  images.value.splice(i, 1)
}

const insertEmoji = (emoji) => {
  commentInput.value += emoji
}

const submitComment = () => {
  if ((!commentInput.value.trim() && images.value.length === 0) || !props.post) return
  emit('submitComment', {
    content: commentInput.value.trim(),
    images: images.value.map(i => i.file),
    parentId: replyTo.value?.id
  })
  commentInput.value = ''
  images.value = []
  replyTo.value = null
}
</script>

<style scoped>
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
  flex-shrink: 0;
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

.pd-comment-wrapper {
  margin-bottom: 6px;
}

.cc-card {
  background: var(--bg-primary);
  border: 1px solid var(--hover);
  border-radius: 12px;
  overflow: hidden;
}

.cc-reply-hint {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--accent);
  background: var(--hover);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cc-reply-cancel {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 12px;
}

.cc-reply-cancel:hover {
  color: var(--text-secondary);
}

.cc-input-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
}

.cc-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 4px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

.cc-input::placeholder {
  color: var(--text-tertiary);
}

.cc-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: all 0.15s;
}

.cc-icon-btn:hover {
  background: var(--hover);
  color: var(--text-secondary);
}

.cc-icon-btn.active {
  color: var(--accent);
  background: rgba(99,102,241,0.08);
}

.cc-send-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.cc-send-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.cc-send-btn:not(:disabled):hover {
  opacity: 0.9;
}

.cc-previews {
  display: flex;
  gap: 8px;
  padding: 0 12px 12px;
  flex-wrap: wrap;
}

.cc-preview-item {
  position: relative;
  width: 64px;
  height: 64px;
}

.cc-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.cc-preview-del {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bubble-own);
  color: white;
  border: none;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cc-emoji-panel {
  border-top: 1px solid var(--hover);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.cc-emoji-group {
  margin-bottom: 6px;
}

.cc-emoji-label {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
  padding: 0 4px;
}

.cc-emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.cc-emoji-cell {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}

.cc-emoji-cell:hover {
  background: var(--hover);
}
</style>