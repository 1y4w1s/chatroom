<template>
  <Teleport to="body">
    <div class="ui-toast-container" :class="`ui-toast--${position}`">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="ui-toast"
          :class="[`ui-toast--${toast.type}`, { 'ui-toast--closing': toast.closing }]"
          @click="dismiss(toast.id)"
        >
          <span v-if="toast.icon" class="ui-toast__icon" v-html="toast.icon"></span>
          <span class="ui-toast__text">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  position: {
    type: String,
    default: 'bottom',
    validator: v => ['top', 'top-right', 'bottom'].includes(v)
  },
  duration: { type: Number, default: 3000 }
})

const toasts = ref([])
let counter = 0

const icons = {
  success: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8L7 11L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7V11M8 5.5V5.51" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  warning: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L1 14H15L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.5" fill="currentColor"/></svg>'
}

function show(message, type = 'info', duration = props.duration) {
  const id = ++counter
  const toast = { id, message, type, icon: icons[type] || '', closing: false }
  toasts.value.push(toast)

  if (duration > 0) {
    setTimeout(() => dismiss(id), duration)
  }
  return id
}

function dismiss(id) {
  const toast = toasts.value.find(t => t.id === id)
  if (!toast) return
  toast.closing = true
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 250)
}

function success(message, duration) { return show(message, 'success', duration) }
function error(message, duration) { return show(message, 'error', duration) }
function info(message, duration) { return show(message, 'info', duration) }
function warning(message, duration) { return show(message, 'warning', duration) }

defineExpose({ show, success, error, info, warning, dismiss })
</script>

<style scoped>
.ui-toast-container {
  position: fixed;
  z-index: 5000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.ui-toast--bottom {
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.ui-toast--top {
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.ui-toast--top-right {
  top: 16px;
  right: 16px;
  align-items: flex-end;
}

.ui-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius, 8px);
  font-size: var(--text-base, 14px);
  font-weight: 500;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.1));
  cursor: pointer;
  pointer-events: auto;
  max-width: 400px;
  animation: toastIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ui-toast--closing {
  animation: toastOut 250ms ease forwards;
}

.ui-toast__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.ui-toast__icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.ui-toast--success {
  background: var(--accent-bg, #1a1a1a);
  color: white;
}

.ui-toast--error {
  background: var(--danger, #dc2626);
  color: white;
}

.ui-toast--info {
  background: var(--accent-bg, #1a1a1a);
  color: white;
}

.ui-toast--warning {
  background: #92400e;
  color: white;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastOut {
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
}
</style>
