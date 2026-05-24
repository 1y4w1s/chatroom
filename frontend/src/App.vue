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
  /* ===== 基础色板 (oklch) ===== */
  --color-white: oklch(1 0 0);
  --color-black: oklch(0 0 0);
  --color-gray-50: oklch(98.5% 0.003 290);
  --color-gray-100: oklch(96.5% 0.005 290);
  --color-gray-200: oklch(93% 0.007 290);
  --color-gray-300: oklch(87% 0.01 290);
  --color-gray-400: oklch(74% 0.015 290);
  --color-gray-500: oklch(62% 0.02 290);
  --color-gray-600: oklch(48% 0.025 290);
  --color-gray-700: oklch(38% 0.03 290);
  --color-gray-800: oklch(28% 0.03 290);
  --color-gray-900: oklch(18% 0.02 290);
  --color-gray-950: oklch(12% 0.015 290);

  /* ===== 语义颜色 ===== */
  --accent-h: 220;
  --accent-s: 15%;
  --accent-l: 15%;
  --danger-h: 0;
  --danger-s: 72%;
  --danger-l: 51%;
  --success-h: 160;
  --success-s: 84%;
  --success-l: 39%;

  /* ===== 背景色 ===== */
  --bg-primary: oklch(1 0 0);
  --bg-secondary: oklch(98.5% 0.003 290);
  --bg-tertiary: oklch(96% 0.005 290);
  --bg-card: oklch(1 0 0);
  --bg-input: oklch(1 0 0);
  --bg-body: oklch(97% 0.003 290);
  --bg-elevated: oklch(1 0 0);
  --bg-glass: oklch(1 0 0 / 0.7);

  /* ===== 聊天气泡 ===== */
  --bubble-own: oklch(22% 0.02 260);
  --bubble-own-text: oklch(98% 0 0);
  --bubble-own-shadow: oklch(22% 0.02 260 / 0.15);
  --bubble-other: oklch(96% 0.005 290);
  --bubble-other-text: oklch(18% 0.02 290);
  --bubble-other-shadow: oklch(0 0 0 / 0.04);

  /* ===== 文本色 ===== */
  --text-primary: oklch(15% 0.02 290);
  --text-secondary: oklch(45% 0.02 290);
  --text-tertiary: oklch(65% 0.015 290);
  --text-placeholder: oklch(75% 0.01 290);
  --text-on-accent: oklch(98% 0 0);
  --text-on-danger: oklch(98% 0 0);

  /* ===== 边框 ===== */
  --border: oklch(90% 0.005 290);
  --border-light: oklch(85% 0.008 290);
  --border-accent: oklch(70% 0.02 260);

  /* ===== 强调色 ===== */
  --accent: hsl(var(--accent-h) var(--accent-s) var(--accent-l));
  --accent-light: hsl(var(--accent-h) var(--accent-s) 30%);
  --accent-bg: hsl(var(--accent-h) var(--accent-s) var(--accent-l));
  --accent-soft: hsl(var(--accent-h) 20% 95%);
  --accent-glow: hsl(var(--accent-h) 20% 15% / 0.08);

  /* ===== 状态色 ===== */
  --danger: hsl(var(--danger-h) var(--danger-s) var(--danger-l));
  --danger-bg: hsl(var(--danger-h) 80% 95%);
  --danger-border: hsl(var(--danger-h) 80% 88%);
  --success: hsl(var(--success-h) var(--success-s) var(--success-l));
  --success-bg: hsl(var(--success-h) 60% 95%);
  --status-online: oklch(55% 0.18 160);
  --status-away: oklch(70% 0.18 85);
  --status-offline: oklch(65% 0.01 290);

  /* ===== 交互 ===== */
  --hover: oklch(95% 0.005 290);
  --hover-light: oklch(97% 0.003 290);
  --active: oklch(90% 0.008 290);

  /* ===== 阴影 ===== */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.04), 0 1px 1px oklch(0 0 0 / 0.02);
  --shadow: 0 1px 3px oklch(0 0 0 / 0.05), 0 1px 2px oklch(0 0 0 / 0.03);
  --shadow-md: 0 4px 12px oklch(0 0 0 / 0.08);
  --shadow-lg: 0 8px 24px oklch(0 0 0 / 0.10);
  --shadow-xl: 0 16px 48px oklch(0 0 0 / 0.14);
  --shadow-glow: 0 0 20px oklch(0.5 0.2 260 / 0.15);

  /* ===== 覆盖层 ===== */
  --overlay: oklch(0 0 0 / 0.35);
  --overlay-heavy: oklch(0 0 0 / 0.55);
  --overlay-glass: oklch(1 1 0 / 0.6);

  /* ===== 圆角 ===== */
  --radius-sm: 6px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* ===== 间距系统 (4px 网格) ===== */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* ===== 过渡 ===== */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ===== 字体 ===== */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  /* ===== 字号 ===== */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 20px;
  --text-3xl: 24px;
}

[data-theme="dark"] {
  /* ===== 背景色 ===== */
  --bg-primary: oklch(14% 0.015 290);
  --bg-secondary: oklch(12% 0.01 290);
  --bg-tertiary: oklch(18% 0.015 290);
  --bg-card: oklch(16% 0.015 290);
  --bg-input: oklch(18% 0.015 290);
  --bg-body: oklch(10% 0.01 290);
  --bg-elevated: oklch(18% 0.015 290);
  --bg-glass: oklch(14% 0.015 290 / 0.8);

  /* ===== 聊天气泡 ===== */
  --bubble-own: oklch(30% 0.04 260);
  --bubble-own-text: oklch(95% 0.005 260);
  --bubble-own-shadow: oklch(0 0 0 / 0.25);
  --bubble-other: oklch(20% 0.015 290);
  --bubble-other-text: oklch(90% 0.005 290);
  --bubble-other-shadow: oklch(0 0 0 / 0.1);

  /* ===== 文本色 ===== */
  --text-primary: oklch(92% 0.005 290);
  --text-secondary: oklch(72% 0.01 290);
  --text-tertiary: oklch(55% 0.015 290);
  --text-placeholder: oklch(40% 0.02 290);
  --text-on-accent: oklch(95% 0 0);
  --text-on-danger: oklch(95% 0 0);

  /* ===== 边框 ===== */
  --border: oklch(28% 0.02 290);
  --border-light: oklch(35% 0.02 290);
  --border-accent: oklch(40% 0.04 260);

  /* ===== 强调色 ===== */
  --accent: hsl(var(--accent-h) 15% 65%);
  --accent-light: hsl(var(--accent-h) 12% 45%);
  --accent-bg: hsl(var(--accent-h) 10% 30%);
  --accent-soft: hsl(var(--accent-h) 10% 22%);
  --accent-glow: hsl(var(--accent-h) 30% 65% / 0.08);

  /* ===== 状态色 ===== */
  --danger: hsl(var(--danger-h) 70% 65%);
  --danger-bg: hsl(var(--danger-h) 40% 18%);
  --danger-border: hsl(var(--danger-h) 40% 28%);
  --success: hsl(var(--success-h) 70% 60%);
  --success-bg: hsl(var(--success-h) 30% 15%);
  --status-online: oklch(65% 0.18 160);
  --status-away: oklch(75% 0.18 85);
  --status-offline: oklch(45% 0.02 290);

  /* ===== 交互 ===== */
  --hover: oklch(22% 0.015 290);
  --hover-light: oklch(18% 0.01 290);
  --active: oklch(26% 0.02 290);

  /* ===== 阴影 ===== */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.2), 0 1px 1px oklch(0 0 0 / 0.15);
  --shadow: 0 1px 3px oklch(0 0 0 / 0.25), 0 1px 2px oklch(0 0 0 / 0.2);
  --shadow-md: 0 4px 12px oklch(0 0 0 / 0.3);
  --shadow-lg: 0 8px 24px oklch(0 0 0 / 0.35);
  --shadow-xl: 0 16px 48px oklch(0 0 0 / 0.4);
  --shadow-glow: 0 0 20px oklch(0.4 0.15 260 / 0.12);

  /* ===== 覆盖层 ===== */
  --overlay: oklch(0 0 0 / 0.55);
  --overlay-heavy: oklch(0 0 0 / 0.7);
  --overlay-glass: oklch(0 0 0 / 0.6);
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
