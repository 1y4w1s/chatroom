<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --bg-tertiary: #f8f9fa;
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --bg-body: #f5f5f5;
  --bubble-own: #1a1a1a;
  --bubble-other: #f0f0f0;
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-placeholder: #9ca3af;
  --border: #e5e7eb;
  --border-light: #d1d5db;
  --accent: #1a1a1a;
  --accent-light: #333333;
  --accent-bg: #1a1a1a;
  --danger: #dc2626;
  --danger-bg: #fef2f2;
  --danger-border: #fecaca;
  --success: #10b981;
  --success-bg: #f0fdf4;
  --hover: #f3f4f6;
  --hover-light: #f9fafb;
  --shadow: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --overlay: rgba(0,0,0,0.4);
  --status-online: #10b981;
  --status-away: #f59e0b;
  --status-offline: #9ca3af;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #141414;
  --bg-tertiary: #2a2a2a;
  --bg-card: #1e1e1e;
  --bg-input: #2a2a2a;
  --bg-body: #141414;
  --bubble-own: #4a4a4a;
  --bubble-other: #2a2a2a;
  --text-primary: #f3f4f6;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  --text-placeholder: #6b7280;
  --border: #374151;
  --border-light: #4b5563;
  --accent: #9ca3af;
  --accent-light: #374151;
  --accent-bg: #4b5563;
  --danger: #f87171;
  --danger-bg: #3a1a1a;
  --danger-border: #7f1d1d;
  --success: #34d399;
  --success-bg: #1a2a1a;
  --hover: #374151;
  --hover-light: #2a2a2a;
  --shadow: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
  --overlay: rgba(0,0,0,0.7);
  --status-online: #34d399;
  --status-away: #fbbf24;
  --status-offline: #6b7280;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-body);
  color: var(--text-primary);
}

#app {
  width: 100%;
  height: 100vh;
}

a {
  color: var(--accent);
  text-decoration: none;
}
</style>
