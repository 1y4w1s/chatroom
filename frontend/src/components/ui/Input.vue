<template>
  <div class="ui-input-wrapper" :class="{ 'ui-input--error': error, 'ui-input--disabled': disabled }">
    <label v-if="label" class="ui-input__label" :for="inputId">{{ label }}</label>
    <div class="ui-input__container">
      <span v-if="$slots.prepend || prependIcon" class="ui-input__prepend">
        <slot name="prepend"><span v-html="prependIcon"></span></slot>
      </span>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        class="ui-input"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @keyup.enter="$emit('enter', $event)"
      />
      <span v-if="$slots.append || appendIcon" class="ui-input__append">
        <slot name="append"><span v-html="appendIcon"></span></slot>
      </span>
      <button v-if="clearable && modelValue" class="ui-input__clear" @click="$emit('update:modelValue', '')">×</button>
    </div>
    <p v-if="hint && !error" class="ui-input__hint">{{ hint }}</p>
    <p v-if="error" class="ui-input__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  label: String,
  placeholder: String,
  disabled: Boolean,
  readonly: Boolean,
  maxlength: [Number, String],
  clearable: Boolean,
  error: String,
  hint: String,
  prependIcon: String,
  appendIcon: String
})

defineEmits(['update:modelValue', 'focus', 'blur', 'enter'])

let idCounter = 0
const inputId = computed(() => `ui-input-${++idCounter}`)
</script>

<style scoped>
.ui-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ui-input__label {
  font-size: var(--text-sm, 13px);
  font-weight: 500;
  color: var(--text-secondary, #374151);
}

.ui-input__container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: var(--radius, 8px);
  background: var(--bg-input, white);
  transition: all var(--transition-fast, 150ms);
  min-height: 40px;
}

.ui-input__container:focus-within {
  border-color: var(--accent, #1a1a1a);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(0,0,0,0.05));
}

.ui-input--error .ui-input__container {
  border-color: var(--danger, #dc2626);
}

.ui-input--error .ui-input__container:focus-within {
  box-shadow: 0 0 0 3px oklch(0.5 0.22 25 / 0.1);
}

.ui-input--disabled .ui-input__container {
  opacity: 0.5;
  background: var(--bg-secondary, #fafafa);
}

.ui-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-base, 14px);
  color: var(--text-primary, #1a1a1a);
  font-family: var(--font-sans, inherit);
  padding: 10px 0;
  min-width: 0;
}

.ui-input::placeholder {
  color: var(--text-placeholder, #9ca3af);
}

.ui-input__prepend,
.ui-input__append {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--text-tertiary, #9ca3af);
}

.ui-input__prepend :deep(svg),
.ui-input__append :deep(svg) {
  width: 16px;
  height: 16px;
}

.ui-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: var(--text-tertiary, #9ca3af);
  color: white;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
}

.ui-input__clear:hover {
  background: var(--text-secondary, #6b7280);
}

.ui-input__hint {
  font-size: var(--text-xs, 11px);
  color: var(--text-tertiary, #9ca3af);
  margin: 0;
}

.ui-input__error {
  font-size: var(--text-xs, 11px);
  color: var(--danger, #dc2626);
  margin: 0;
}
</style>
