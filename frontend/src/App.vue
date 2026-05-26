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
  --color-gray-50: oklch(98.5% 0.003 270);
  --color-gray-100: oklch(96.5% 0.005 270);
  --color-gray-200: oklch(93% 0.007 270);
  --color-gray-300: oklch(87% 0.01 270);
  --color-gray-400: oklch(74% 0.015 270);
  --color-gray-500: oklch(62% 0.02 270);
  --color-gray-600: oklch(48% 0.025 270);
  --color-gray-700: oklch(38% 0.03 270);
  --color-gray-800: oklch(28% 0.03 270);
  --color-gray-900: oklch(18% 0.02 270);
  --color-gray-950: oklch(12% 0.015 270);

  /* ===== 品牌色 - 现代靛蓝 ===== */
  --brand-h: 235;
  --brand-s: 60%;
  --brand-l: 52%;

  /* ===== 语义颜色 ===== */
  --danger-h: 0;
  --danger-s: 72%;
  --danger-l: 51%;
  --success-h: 155;
  --success-s: 72%;
  --success-l: 42%;
  --warning-h: 35;
  --warning-s: 90%;
  --warning-l: 52%;

  /* ===== 背景色 ===== */
  --bg-primary: oklch(1 0 0);
  --bg-secondary: oklch(98.5% 0.004 270);
  --bg-tertiary: oklch(96.5% 0.006 270);
  --bg-card: oklch(1 0 0);
  --bg-input: oklch(98% 0.004 270);
  --bg-body: oklch(97.5% 0.003 270);
  --bg-elevated: oklch(1 0 0);
  --bg-glass: oklch(1 0 0 / 0.72);
  --bg-chat: oklch(96.8% 0.006 270);

  /* ===== 聊天气泡 ===== */
  --bubble-own: hsl(var(--brand-h) 45% 42%);
  --bubble-own-text: oklch(98% 0 0);
  --bubble-own-shadow: hsl(var(--brand-h) 40% 35% / 0.18);
  --bubble-other: oklch(98% 0.005 270);
  --bubble-other-text: oklch(18% 0.02 270);
  --bubble-other-shadow: oklch(0 0 0 / 0.04);
  --bubble-other-border: oklch(92% 0.008 270);

  /* ===== 文本色 ===== */
  --text-primary: oklch(15% 0.015 270);
  --text-secondary: oklch(42% 0.018 270);
  --text-tertiary: oklch(62% 0.012 270);
  --text-placeholder: oklch(72% 0.01 270);
  --text-on-accent: oklch(98% 0 0);
  --text-on-danger: oklch(98% 0 0);

  /* ===== 边框 ===== */
  --border: oklch(90% 0.006 270);
  --border-light: oklch(85% 0.008 270);
  --border-accent: hsl(var(--brand-h) 30% 78%);

  /* ===== 品牌色阶 ===== */
  --accent: hsl(var(--brand-h) var(--brand-s) var(--brand-l));
  --accent-light: hsl(var(--brand-h) var(--brand-s) 58%);
  --accent-dark: hsl(var(--brand-h) var(--brand-s) 38%);
  --accent-bg: hsl(var(--brand-h) var(--brand-s) var(--brand-l));
  --accent-soft: hsl(var(--brand-h) 30% 94%);
  --accent-glow: hsl(var(--brand-h) 55% 50% / 0.12);
  --accent-ring: hsl(var(--brand-h) 50% 48% / 0.3);

  /* ===== 状态色 ===== */
  --danger: hsl(var(--danger-h) var(--danger-s) var(--danger-l));
  --danger-bg: hsl(var(--danger-h) 75% 95%);
  --danger-border: hsl(var(--danger-h) 75% 88%);
  --danger-ring: hsl(var(--danger-h) 72% 51% / 0.3);
  --success: hsl(var(--success-h) var(--success-s) var(--success-l));
  --success-bg: hsl(var(--success-h) 55% 94%);
  --warning: hsl(var(--warning-h) var(--warning-s) var(--warning-l));
  --warning-bg: hsl(var(--warning-h) 80% 94%);
  --status-online: oklch(58% 0.18 155);
  --status-away: oklch(72% 0.18 80);
  --status-offline: oklch(62% 0.01 270);
  --status-dnd: oklch(55% 0.2 25);

  /* ===== 交互 ===== */
  --hover: oklch(95% 0.005 270);
  --hover-light: oklch(97% 0.003 270);
  --active: oklch(90% 0.008 270);

  /* ===== 阴影 ===== */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.04), 0 1px 1px oklch(0 0 0 / 0.02);
  --shadow: 0 1px 3px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.03);
  --shadow-md: 0 4px 12px oklch(0 0 0 / 0.07), 0 2px 4px oklch(0 0 0 / 0.04);
  --shadow-lg: 0 8px 28px oklch(0 0 0 / 0.09), 0 3px 8px oklch(0 0 0 / 0.05);
  --shadow-xl: 0 16px 48px oklch(0 0 0 / 0.12), 0 6px 16px oklch(0 0 0 / 0.06);
  --shadow-glow: 0 0 24px hsl(var(--brand-h) 55% 50% / 0.18);

  /* ===== 覆盖层 ===== */
  --overlay: oklch(0 0 0 / 0.32);
  --overlay-heavy: oklch(0 0 0 / 0.55);
  --overlay-glass: oklch(1 1 0 / 0.6);

  /* ===== 圆角 ===== */
  --radius-sm: 6px;
  --radius: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
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
  --text-4xl: 28px;

  /* ===== 字重 ===== */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* ===== 行高 ===== */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}

[data-theme="dark"] {
  /* ===== 背景色 ===== */
  --bg-primary: oklch(15% 0.012 270);
  --bg-secondary: oklch(12% 0.01 270);
  --bg-tertiary: oklch(19% 0.015 270);
  --bg-card: oklch(17% 0.012 270);
  --bg-input: oklch(19% 0.015 270);
  --bg-body: oklch(10% 0.008 270);
  --bg-elevated: oklch(19% 0.015 270);
  --bg-glass: oklch(15% 0.012 270 / 0.82);
  --bg-chat: oklch(11% 0.01 270);

  /* ===== 聊天气泡 ===== */
  --bubble-own: hsl(var(--brand-h) 40% 32%);
  --bubble-own-text: oklch(95% 0.005 260);
  --bubble-own-shadow: oklch(0 0 0 / 0.25);
  --bubble-other: oklch(20% 0.015 270);
  --bubble-other-text: oklch(88% 0.008 270);
  --bubble-other-shadow: oklch(0 0 0 / 0.1);
  --bubble-other-border: oklch(28% 0.02 270);

  /* ===== 文本色 ===== */
  --text-primary: oklch(92% 0.006 270);
  --text-secondary: oklch(70% 0.01 270);
  --text-tertiary: oklch(52% 0.015 270);
  --text-placeholder: oklch(38% 0.018 270);
  --text-on-accent: oklch(95% 0 0);
  --text-on-danger: oklch(95% 0 0);

  /* ===== 边框 ===== */
  --border: oklch(28% 0.018 270);
  --border-light: oklch(35% 0.02 270);
  --border-accent: hsl(var(--brand-h) 20% 42%);

  /* ===== 品牌色阶 ===== */
  --accent: hsl(var(--brand-h) 55% 62%);
  --accent-light: hsl(var(--brand-h) 50% 52%);
  --accent-dark: hsl(var(--brand-h) 40% 38%);
  --accent-bg: hsl(var(--brand-h) 20% 28%);
  --accent-soft: hsl(var(--brand-h) 15% 22%);
  --accent-glow: hsl(var(--brand-h) 55% 60% / 0.1);
  --accent-ring: hsl(var(--brand-h) 50% 58% / 0.35);

  /* ===== 状态色 ===== */
  --danger: hsl(var(--danger-h) 65% 62%);
  --danger-bg: hsl(var(--danger-h) 35% 18%);
  --danger-border: hsl(var(--danger-h) 35% 28%);
  --danger-ring: hsl(var(--danger-h) 65% 62% / 0.35);
  --success: hsl(var(--success-h) 55% 58%);
  --success-bg: hsl(var(--success-h) 25% 15%);
  --warning: hsl(var(--warning-h) 75% 58%);
  --warning-bg: hsl(var(--warning-h) 35% 16%);
  --status-online: oklch(65% 0.18 155);
  --status-away: oklch(78% 0.18 80);
  --status-offline: oklch(45% 0.02 270);
  --status-dnd: oklch(60% 0.2 25);

  /* ===== 交互 ===== */
  --hover: oklch(22% 0.015 270);
  --hover-light: oklch(18% 0.01 270);
  --active: oklch(27% 0.02 270);

  /* ===== 阴影 ===== */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.25), 0 1px 1px oklch(0 0 0 / 0.2);
  --shadow: 0 1px 3px oklch(0 0 0 / 0.3), 0 1px 2px oklch(0 0 0 / 0.25);
  --shadow-md: 0 4px 12px oklch(0 0 0 / 0.35), 0 2px 4px oklch(0 0 0 / 0.25);
  --shadow-lg: 0 8px 28px oklch(0 0 0 / 0.4), 0 3px 8px oklch(0 0 0 / 0.3);
  --shadow-xl: 0 16px 48px oklch(0 0 0 / 0.45), 0 6px 16px oklch(0 0 0 / 0.35);
  --shadow-glow: 0 0 24px hsl(var(--brand-h) 55% 55% / 0.12);

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
