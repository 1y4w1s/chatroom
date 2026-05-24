<template>
  <div class="sticker-grid">
    <div class="sticker-header">
      <button v-if="!editMode" class="sticker-edit-btn" @click="$emit('update:editMode', true)">编辑</button>
      <template v-if="editMode">
        <span class="sticker-selected-count">{{ selectedCount }} 已选择</span>
        <button class="sticker-delete-btn" @click="$emit('batchDelete')" :disabled="selectedCount === 0">删除</button>
        <button class="sticker-cancel-btn" @click="$emit('cancel')">取消</button>
      </template>
    </div>
    <div class="sticker-upload-area" v-if="!editMode">
      <label class="sticker-upload-btn">
        <input type="file" accept="image/*" @change="(e) => { const file = e.target.files[0]; if(file) $emit('upload', file); e.target.value = '' }" />
        <span>+ 上传表情包</span>
      </label>
    </div>
    <div v-if="serverStickers.length === 0 && localStickers.length === 0" class="sticker-empty">
      还没有收藏的表情包<br>点击上方按钮上传或从图片消息添加
    </div>
    <div class="sticker-list">
      <div v-for="sticker in serverStickers" :key="'srv-' + sticker.id" class="sticker-item-wrapper" :class="{ selected: serverSelected.includes(sticker.id) }">
        <button class="sticker-cell" @click.stop="editMode ? $emit('selectServer', sticker.id) : $emit('send', sticker.file_path)">
          <img :src="sticker.file_path" class="sticker-img" />
          <span v-if="editMode" class="sticker-check" :class="{ checked: serverSelected.includes(sticker.id) }">✓</span>
        </button>
      </div>
      <div v-for="(sticker, i) in localStickers" :key="'loc-' + i" class="sticker-item-wrapper" :class="{ selected: localSelected.includes(i) }">
        <button class="sticker-cell" @click.stop="editMode ? $emit('selectLocal', i) : $emit('send', sticker)">
          <img :src="sticker" class="sticker-img" />
          <span v-if="editMode" class="sticker-check" :class="{ checked: localSelected.includes(i) }">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  editMode: Boolean,
  serverStickers: { type: Array, default: () => [] },
  localStickers: { type: Array, default: () => [] },
  serverSelected: { type: Array, default: () => [] },
  localSelected: { type: Array, default: () => [] },
  selectedCount: { type: Number, default: 0 }
})

defineEmits([
  'update:editMode', 'upload', 'send',
  'selectServer', 'selectLocal',
  'batchDelete', 'cancel'
])
</script>

<style scoped>
.sticker-grid {
  padding: var(--space-2, 8px);
}

.sticker-header {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-2, 8px);
  padding-bottom: var(--space-2, 8px);
  border-bottom: 1px solid var(--border);
}

.sticker-edit-btn,
.sticker-delete-btn,
.sticker-cancel-btn {
  padding: 4px 12px;
  border-radius: var(--radius-sm, 6px);
  border: none;
  font-size: var(--text-xs, 11px);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.sticker-edit-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.sticker-edit-btn:hover {
  background: var(--border);
}

.sticker-selected-count {
  font-size: var(--text-xs, 11px);
  color: var(--text-secondary);
  flex: 1;
  font-weight: 500;
}

.sticker-delete-btn {
  background: var(--danger);
  color: white;
}

.sticker-delete-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.sticker-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sticker-cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.sticker-cancel-btn:hover {
  background: var(--border);
}

.sticker-upload-area {
  margin-bottom: var(--space-2, 8px);
}

.sticker-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border);
  border-radius: var(--radius, 8px);
  color: var(--text-secondary);
  font-size: var(--text-sm, 13px);
  cursor: pointer;
  transition: all var(--transition, 200ms);
}

.sticker-upload-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.sticker-upload-btn input {
  display: none;
}

.sticker-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2, 8px);
  max-height: 180px;
  overflow-y: auto;
}

.sticker-item-wrapper {
  position: relative;
}

.sticker-item-wrapper.selected .sticker-cell {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.sticker-cell {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid var(--border);
  border-radius: var(--radius, 8px);
  background: var(--bg-primary);
  cursor: pointer;
  padding: 4px;
  transition: all var(--transition-fast, 150ms);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sticker-cell:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-sm);
}

.sticker-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.sticker-check {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--border);
  color: transparent;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.sticker-check.checked {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  transform: scale(1.1);
}

.sticker-empty {
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--text-sm, 13px);
  padding: var(--space-6, 24px) var(--space-2, 8px);
  line-height: 1.6;
}
</style>
