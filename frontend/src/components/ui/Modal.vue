<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="ui-modal-overlay" @click.self="closeOnOverlay ? $emit('close') : null">
        <div class="ui-modal" :class="[`ui-modal--${size}`]" @click.stop>
          <div v-if="$slots.header || title" class="ui-modal__header">
            <slot name="header">
              <h3 class="ui-modal__title">{{ title }}</h3>
            </slot>
            <button v-if="closable" class="ui-modal__close" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div v-if="$slots.default" class="ui-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="ui-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  visible: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg', 'xl', 'full'].includes(v)
  },
  closable: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'open'])

watch(() => props.visible, (val) => {
  if (val) {
    emit('open')
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })
</script>

<style scoped>
.ui-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay, rgba(0,0,0,0.4));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
  padding: 20px;
}

.ui-modal {
  background: var(--bg-primary, white);
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-xl, 0 16px 48px rgba(0,0,0,0.14));
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  width: 100%;
}

.ui-modal--sm { max-width: 360px; }
.ui-modal--md { max-width: 480px; }
.ui-modal--lg { max-width: 640px; }
.ui-modal--xl { max-width: 800px; }
.ui-modal--full {
  max-width: 100%;
  margin: 20px;
  max-height: calc(100vh - 40px);
  border-radius: var(--radius-md, 12px);
}

.ui-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border, #e5e7eb);
  flex-shrink: 0;
}

.ui-modal__title {
  font-size: var(--text-lg, 16px);
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
  margin: 0;
}

.ui-modal__close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--hover, #f3f4f6);
  border-radius: var(--radius-sm, 6px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, #6b7280);
  transition: all var(--transition-fast, 150ms);
}

.ui-modal__close:hover {
  background: var(--border, #e5e7eb);
  color: var(--text-primary, #1a1a1a);
}

.ui-modal__body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.ui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border, #e5e7eb);
  flex-shrink: 0;
}

/* ===== Transitions ===== */
.modal-enter-active {
  animation: modalOverlayIn 200ms ease;
}

.modal-leave-active {
  animation: modalOverlayIn 200ms ease reverse;
}

.modal-enter-active .ui-modal {
  animation: modalScaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .ui-modal {
  animation: modalScaleIn 250ms ease reverse;
}

@keyframes modalOverlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
