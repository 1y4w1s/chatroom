<template>
  <div
    class="ui-avatar"
    :class="[
      `ui-avatar--${size}`,
      { 'ui-avatar--clickable': clickable }
    ]"
    :style="avatarStyle"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <img v-if="src && !imgError" :src="src" :alt="name" class="ui-avatar__img" @error="imgError = true" />
    <div v-else class="ui-avatar__fallback" :style="{ background: bgColor }">
      <span>{{ initials }}</span>
    </div>
    <span v-if="status" class="ui-avatar__status" :class="`ui-avatar__status--${status}`"></span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: String,
  name: { type: String, default: '?' },
  size: {
    type: String,
    default: 'md',
    validator: v => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v)
  },
  status: {
    type: String,
    default: null,
    validator: v => [null, 'online', 'away', 'offline', 'invisible'].includes(v)
  },
  colors: {
    type: Array,
    default: () => ['#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6','#eab308','#6366f1','#84cc16']
  },
  clickable: Boolean
})

defineEmits(['click'])

const imgError = ref(false)

const initials = computed(() => {
  if (!props.name || props.name === '?') return '?'
  const parts = props.name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return props.name.slice(0, 1).toUpperCase()
})

const bgColor = computed(() => {
  if (!props.name) return props.colors[0]
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % props.colors.length
  return props.colors[index]
})

const sizeMap = { xs: '24px', sm: '32px', md: '40px', lg: '56px', xl: '80px' }
const avatarStyle = computed(() => ({
  width: sizeMap[props.size],
  height: sizeMap[props.size],
  minWidth: sizeMap[props.size]
}))
</script>

<style scoped>
.ui-avatar {
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ui-avatar--clickable {
  cursor: pointer;
}

.ui-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ui-avatar__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  user-select: none;
}

.ui-avatar--xs .ui-avatar__fallback { font-size: 10px; }
.ui-avatar--sm .ui-avatar__fallback { font-size: 13px; }
.ui-avatar--md .ui-avatar__fallback { font-size: 16px; }
.ui-avatar--lg .ui-avatar__fallback { font-size: 22px; }
.ui-avatar--xl .ui-avatar__fallback { font-size: 30px; }

.ui-avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28%;
  height: 28%;
  border-radius: 50%;
  border: 2px solid var(--bg-primary, white);
  box-sizing: content-box;
}

.ui-avatar__status--online { background: var(--status-online, #22c55e); }
.ui-avatar__status--away { background: var(--status-away, #eab308); }
.ui-avatar__status--offline { background: var(--status-offline, #9ca3af); }
.ui-avatar__status--invisible { background: var(--status-offline, #9ca3af); }
</style>
