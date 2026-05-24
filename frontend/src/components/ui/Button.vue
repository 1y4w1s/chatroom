<template>
  <component
    :is="tag"
    :class="[
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      {
        'ui-button--block': block,
        'ui-button--loading': loading,
        'ui-button--icon-only': iconOnly,
        'ui-button--disabled': disabled
      }
    ]"
    :disabled="disabled || loading"
    :type="type"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="ui-button__spinner"></span>
    <span v-if="icon" class="ui-button__icon"><slot name="icon"><span v-html="icon"></span></slot></span>
    <span v-if="$slots.default && !iconOnly" class="ui-button__text"><slot /></span>
  </component>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'danger', 'ghost', 'text'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  block: Boolean,
  loading: Boolean,
  disabled: Boolean,
  iconOnly: Boolean,
  icon: String,
  tag: {
    type: String,
    default: 'button'
  },
  type: {
    type: String,
    default: 'button'
  }
})

defineEmits(['click'])
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: var(--radius, 8px);
  font-family: var(--font-sans, inherit);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast, 150ms);
  position: relative;
  overflow: hidden;
  text-decoration: none;
  line-height: 1;
}

.ui-button:active:not(.ui-button--disabled) {
  transform: scale(0.97);
}

.ui-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* ===== Sizes ===== */
.ui-button--sm {
  padding: 6px 12px;
  font-size: var(--text-sm, 13px);
  border-radius: var(--radius-sm, 6px);
  height: 32px;
}

.ui-button--md {
  padding: 10px 20px;
  font-size: var(--text-base, 14px);
  height: 40px;
}

.ui-button--lg {
  padding: 14px 24px;
  font-size: var(--text-lg, 16px);
  height: 48px;
  border-radius: var(--radius-md, 12px);
}

.ui-button--block {
  width: 100%;
}

.ui-button--icon-only {
  padding: 0;
  width: var(--size, 36px);
  height: var(--size, 36px);
  border-radius: var(--radius, 8px);
}

/* ===== Variants ===== */
.ui-button--primary {
  background: var(--accent-bg, #1a1a1a);
  color: var(--text-on-accent, white);
}

.ui-button--primary:hover:not(.ui-button--disabled) {
  background: var(--accent-light, #333);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08));
}

.ui-button--secondary {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1a1a1a);
  border: 1px solid var(--border, #e5e7eb);
}

.ui-button--secondary:hover:not(.ui-button--disabled) {
  background: var(--hover, #e5e7eb);
}

.ui-button--danger {
  background: var(--danger, #dc2626);
  color: var(--text-on-danger, white);
}

.ui-button--danger:hover:not(.ui-button--disabled) {
  opacity: 0.9;
  box-shadow: 0 4px 12px oklch(0.5 0.22 25 / 0.3);
}

.ui-button--ghost {
  background: transparent;
  color: var(--text-primary, #1a1a1a);
}

.ui-button--ghost:hover:not(.ui-button--disabled) {
  background: var(--hover, #f3f4f6);
}

.ui-button--text {
  background: transparent;
  color: var(--accent, #1a1a1a);
  padding: 4px 8px;
  height: auto;
}

.ui-button--text:hover:not(.ui-button--disabled) {
  opacity: 0.7;
}

/* ===== Loading ===== */
.ui-button--loading {
  pointer-events: none;
}

.ui-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ui-button__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.ui-button__icon :deep(svg) {
  width: 16px;
  height: 16px;
}
</style>
