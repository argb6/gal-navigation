/**
 * 脱敏页面副本（由 worker/new 提取）。
 * 已去除：SEO（OG/Twitter/JSON-LD/canonical/robots/sitemap）、D1/KV/API、Cookie 首访、私密地址。
 * 不含 status。仅供阅读 / 本地预览，不能当生产 Worker 部署。
 */
// @ts-nocheck
// Cloudflare Worker - galnavi
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GALNAVI 永久发布页 · ACG 二次元资源导航入口</title>
<link rel="icon" href="https://assets.galnavi.top/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="https://assets.galnavi.top/icon.png">
<style>/* src/foundation/tokens/tokens.css */
/* gd tokens — 色值/玻璃为现网取值；字号/圆角/状态透明度语义对齐 MD3 */
:root {
  /* Color roles（值 = GALNAVI，禁止紫板） */
  --gd-color-background: #1c2a48;
  --gd-color-surface: #18253f;
  --gd-color-surface-variant: #223456;
  --gd-color-surface-back: #1c2a45;
  --gd-color-primary: #4f7cff;
  --gd-color-on-primary: #ffffff;
  --gd-color-primary-container: rgba(79, 124, 255, 0.12);
  --gd-color-secondary: #a855f7;
  --gd-color-tertiary: #ec4899;
  --gd-color-on-surface: #f4f7ff;
  --gd-color-on-surface-variant: #8b9cc0;
  --gd-color-on-surface-subtle: #aeb9d6;
  --gd-color-outline: #1e2a45;
  --gd-color-outline-variant: rgba(30, 42, 69, 0.8);
  --gd-color-error: #f87171;
  --gd-color-on-error: #ffffff;

  /* 链接色：静止蓝 #7aa2f7 → hover 深蓝 #9ec0ff */
  --gd-color-link: #7aa2f7;
  --gd-color-link-hover: #9ec0ff;

  /* 强调色（图标/装饰用浅紫） */
  --gd-color-accent-light: #a78bfa;

  /* RGB 通道（供 rgba(var(--gd-x-rgb), a) 组合透明度层级） */
  --gd-color-primary-rgb: 79, 124, 255;
  --gd-color-secondary-rgb: 168, 85, 247;
  --gd-color-tertiary-rgb: 236, 72, 153;
  --gd-color-accent-rgb: 139, 92, 246;
  --gd-color-sky-rgb: 56, 189, 248;
  --gd-color-sky-blue-rgb: 96, 165, 250;
  --gd-color-blue-rgb: 59, 130, 246;
  --gd-color-blue-deep-rgb: 37, 99, 235;
  --gd-color-indigo-rgb: 91, 141, 239;
  --gd-color-link-rgb: 122, 162, 247;
  --gd-color-gold-rgb: 251, 191, 36;
  --gd-color-gold-deep-rgb: 245, 158, 11;
  --gd-color-error-rgb: 239, 68, 68;
  --gd-color-green-rgb: 34, 197, 94;
  --gd-color-green-light-rgb: 134, 239, 172;
  --gd-color-white-rgb: 255, 255, 255;
  --gd-color-muted-white-rgb: 232, 238, 255;
  --gd-color-grey-rgb: 139, 156, 192;
  --gd-color-text-rgb: 244, 247, 255;

  /* 深色层级（遮罩/浮层/卡片渐变底） */
  --gd-color-navy-rgb: 8, 12, 24;
  --gd-color-navy-deep-rgb: 6, 10, 20;
  --gd-color-navy-panel-rgb: 8, 10, 20;
  --gd-color-navy-card-rgb: 22, 28, 48;
  --gd-color-navy-card-deep-rgb: 12, 16, 28;
  --gd-color-navy-modal-rgb: 14, 21, 37;
  --gd-color-ink-rgb: 20, 30, 56;
  --gd-color-ink-2-rgb: 38, 54, 94;
  --gd-color-ink-3-rgb: 12, 18, 36;
  --gd-color-ink-4-rgb: 24, 34, 65;
  --gd-color-outline-blue-rgb: 126, 153, 255;
  --gd-color-blue-soft-rgb: 191, 219, 254;

  /* 语义层级便捷变量 */
  --gd-color-overlay: rgba(var(--gd-color-navy-deep-rgb), 0.88);
  --gd-color-overlay-strong: rgba(var(--gd-color-navy-panel-rgb), 0.92);
  --gd-color-overlay-float: rgba(var(--gd-color-navy-rgb), 0.95);
  --gd-color-card-gradient-a: rgba(var(--gd-color-navy-card-rgb), 0.96);
  --gd-color-card-gradient-b: rgba(var(--gd-color-navy-card-deep-rgb), 0.98);
  --gd-color-modal-gradient-a: rgba(var(--gd-color-navy-modal-rgb), 0.96);
  --gd-color-modal-gradient-b: rgba(var(--gd-color-navy-rgb), 0.98);
  --gd-color-border-hover: rgba(var(--gd-color-sky-rgb), 0.28);
  --gd-color-border-accent: rgba(var(--gd-color-accent-rgb), 0.22);
  --gd-color-demo-dash: rgba(var(--gd-color-grey-rgb), 0.45);

  /* 补充语义色（release-modal 等引用） */
  --gd-color-success: #86efac;
  --gd-color-error-light: #fca5a5;
  --gd-color-sky: #38bdf8;
  --gd-color-blue: #3b82f6;
  --gd-color-blue-deep: #2563eb;
  --gd-color-accent-pink: #ff85c0;
  --gd-color-cyan: #22d3ee;
  --gd-color-cyan-light: #67e8f9;
  --gd-color-cyan-rgb: 34, 211, 238;
  --gd-color-cyan-light-rgb: 103, 232, 249;

  /* 渐变专用色（按钮/标题渐变端点） */
  --gd-gradient-primary-a: #7c3aed;
  --gd-gradient-primary-b: #6d28d9;
  --gd-gradient-primary-hover-a: #8b5cf6;
  --gd-gradient-primary-hover-b: #7c3aed;
  --gd-gradient-pink-a: #ec4899;
  --gd-gradient-pink-b: #db2777;
  --gd-gradient-pink-hover-a: #f472b6;
  --gd-gradient-pink-hover-b: #ec4899;
  --gd-gradient-title-a: #c4b5fd;
  --gd-gradient-title-b: #e9d5ff;
  --gd-gradient-title-c: #a78bfa;
  --gd-gradient-title-d: #8b5cf6;

  /* 彩点色（filter-bar 等胶囊按钮的圆点循环色：三色循环 + 中性兜底） */
  --gd-dot-1: var(--gd-color-primary);
  --gd-dot-2: var(--gd-color-secondary);
  --gd-dot-3: var(--gd-color-tertiary);
  --gd-dot-neutral: #5a6a8a;

  /* 标签色（卡片标签三色循环） */
  --gd-tag-1-bg: rgba(168, 85, 247, 0.12);
  --gd-tag-1-fg: #c4b5fd;
  --gd-tag-1-border: rgba(168, 85, 247, 0.2);
  --gd-tag-2-bg: rgba(59, 130, 246, 0.12);
  --gd-tag-2-fg: #93c5fd;
  --gd-tag-2-border: rgba(59, 130, 246, 0.2);
  --gd-tag-3-bg: rgba(236, 72, 153, 0.12);
  --gd-tag-3-fg: #f9a8d4;
  --gd-tag-3-border: rgba(236, 72, 153, 0.2);

  /* 徽标色 */
  --gd-badge-bg: var(--gd-glass-border);
  --gd-badge-fg: #d7e2ff;
  --gd-badge-blue-bg: rgba(79, 124, 255, 0.28);
  --gd-badge-blue-fg: #eaf0ff;
  --gd-badge-gold-bg: rgba(251, 191, 36, 0.14);
  --gd-badge-gold-fg: #fcd34d;

  /* Shape — 语义 MD3 scale；数值贴现网 */
  --gd-shape-corner-none: 0;
  --gd-shape-corner-extra-small: 8px;
  --gd-shape-corner-small: 14px;
  --gd-shape-corner-medium: 18px;
  --gd-shape-corner-large: 20px;
  --gd-shape-corner-extra-large: 28px;
  --gd-shape-corner-full: 9999px;

  /* Type — 角色名 MD3；字号贴近现网 */
--gd-type-display-small-size: 36px;
--gd-type-display-small-line: 1.1;
--gd-type-display-medium-size: 48px;
--gd-type-headline-small-size: 24px;
--gd-type-headline-small-line: 1.3;
--gd-type-title-large-size: 22px;
--gd-type-title-large-line: 1.3;
--gd-type-title-medium-size: 16px;
--gd-type-title-medium-line: 1.4;
--gd-type-title-small-size: 15px;
--gd-type-title-small-line: 1.4;
--gd-type-label-large-size: 14px;
--gd-type-label-large-line: 1.4;
--gd-type-label-medium-size: 12px;
--gd-type-label-small-size: 11px;
--gd-type-body-large-size: 16px;
--gd-type-body-medium-size: 14px;
--gd-type-body-small-size: 12px;
--gd-type-note-size: 13px;
--gd-type-title-xxl-size: 18px;

/* 字距 */
--gd-type-letter-spacing-tight: -0.5px;
--gd-type-letter-spacing-normal: 0.01em;
--gd-type-letter-spacing-wide: 0.1em;
--gd-type-letter-spacing-extra-wide: 0.24em;

/* 字重（语义档位） */
--gd-weight-regular: 400;
--gd-weight-medium: 500;
--gd-weight-semibold: 600;
--gd-weight-bold: 700;
--gd-weight-extrabold: 800;
--gd-weight-black: 900;

  --gd-font-sans: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  /* State layer opacities（MD3） */
  --gd-state-hover: 0.08;
  --gd-state-focus: 0.12;
  --gd-state-pressed: 0.12;
  --gd-state-dragged: 0.16;
  --gd-state-disabled: 0.38;

  /* Motion（MD3 short/medium + easing） */
  --gd-motion-duration-short2: 100ms;
  --gd-motion-duration-short4: 200ms;
  --gd-motion-duration-medium1: 250ms;
  --gd-motion-duration-medium2: 300ms;
  --gd-motion-duration-medium4: 400ms;
  --gd-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --gd-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);

  /* Layout */
  --gd-nav-height: 64px;
  --gd-layout-max-width: 1200px;
  --gd-space-1: 4px;
  --gd-space-2: 8px;
  --gd-space-3: 12px;
  --gd-space-4: 16px;
  --gd-space-5: 20px;
  --gd-space-6: 24px;
  --gd-touch-target: 48px;

  /* Elevation 别名（不替代玻璃） */
  --gd-elevation-level2: 0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3);
  --gd-elevation-glow: 0 0 40px rgba(79, 124, 255, 0.2), 0 0 80px rgba(168, 85, 247, 0.08);

  /* 玻璃 — 冻结现网数值，禁止借「整理」改 blur/透明度 */
  --gd-glass-bg: rgba(18, 22, 40, 0.42);
  --gd-glass-bg-hover: rgba(22, 28, 48, 0.52);
  --gd-glass-blur: blur(18px) saturate(165%);
  --gd-glass-border: rgba(255, 255, 255, 0.14);
  --gd-glass-nav-bg: rgba(8, 12, 24, 0.75);
  --gd-glass-nav-blur: blur(20px) saturate(180%);
}


/* ===== 组件库内联: gd-link.css ===== */
/* gd-link — 文字链接（导航型操作，非按钮） */

.gd-link {
  display: inline;
  background: transparent;
  border: none;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-body-medium-size);
  font-weight: var(--gd-weight-semibold);
  line-height: inherit;
  text-decoration: none;
  cursor: pointer;
  color: var(--gd-color-link);
  transition: color var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-link:hover {
  color: var(--gd-color-link-hover);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.gd-link:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}
.gd-link:disabled,
.gd-link[aria-disabled="true"] {
  opacity: var(--gd-state-disabled);
  pointer-events: none;
  cursor: not-allowed;
}


/* ===== 组件库内联: gd-a11y.css ===== */
/* gd-a11y — 无障碍基础：跳过链接 + Windows 高对比模式 */

.gd-skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 20000;
  padding: 10px 16px;
  border-radius: var(--gd-shape-corner-extra-small);
  background: var(--gd-color-primary);
  color: var(--gd-color-on-primary);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  text-decoration: none;
  transform: translateY(-200%);
  transition: transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-skip-link:focus-visible {
  transform: translateY(0);
  outline: 2px solid var(--gd-color-on-primary);
  outline-offset: 2px;
}

/* Windows 高对比模式 — 保证边框与图标可见 */
@media (forced-colors: active) {
  .gd-card,
  .gd-navbar,
  .gd-navbar-drawer,
  .gd-cat-dock,
  .gd-modal,
  .gd-button,
  .gd-search__input,
  .gd-search__clear,
  .gd-tag,
  .gd-filter-bar,
  .gd-filter-bar__tag,
  .gd-toast,
  .gd-tooltip,
  .gd-empty-state,
  .gd-table th,
  .gd-table td,
  .gd-card__icon,
  .gd-card__btn,
  .gd-card__action {
    border: 1px solid CanvasText;
  }
  .gd-navbar__logo-text,
  .gd-navbar-drawer__brand,
  .gd-brand__title,
  .gd-filter-bar__stat strong {
    background: none;
    -webkit-text-fill-color: CanvasText;
    color: CanvasText;
  }
  .gd-card__icon img,
  .gd-navbar__logo-img,
  .gd-hero__arrow svg,
  .gd-search__icon svg {
    forced-color-adjust: none;
  }
}

</style>

<style>/* src/foundation/layout/gd-groundback.css */
/* gd-groundback：页面背景层
   用法：<div class="gd-groundback gd-groundback--blue" aria-hidden="true"></div>
   变体：--blue（默认，主站） / --gold（殿堂）
   蓝色参考原版发布页（galnavi.js）背景：三层光斑 + 对角渐变 + 点阵网格 + 底部光带。 */
.gd-groundback {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: var(--gd-color-background);
}

.gd-groundback::before,
.gd-groundback::after {
  content: "";
  position: absolute;
  inset: 0;
}

/* 蓝色（默认）：三层光斑 + 深蓝对角渐变 */
.gd-groundback--blue {
  background:
    radial-gradient(circle at 22% 18%, rgba(var(--gd-color-blue-rgb), 0.2), transparent 34%),
    radial-gradient(circle at 78% 76%, rgba(var(--gd-color-cyan-rgb), 0.14), transparent 32%),
    radial-gradient(circle at 50% 50%, rgba(var(--gd-color-secondary-rgb), 0.06), transparent 52%),
    linear-gradient(145deg, var(--gd-color-background) 0%, var(--gd-color-surface) 45%, var(--gd-color-surface-variant) 100%);
}

/* 点阵网格（原版 body::before，渐隐 mask） */
.gd-groundback--blue::before {
  background-image: radial-gradient(circle at 1px 1px, rgba(var(--gd-color-white-rgb), 0.04) 1px, transparent 0);
  background-size: 40px 40px;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.34));
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.34));
}

/* 底部光带 + 底部蓝光晕（原版 body::after） */
.gd-groundback--blue::after {
  background:
    linear-gradient(90deg, transparent, rgba(var(--gd-color-white-rgb), 0.028), transparent),
    radial-gradient(circle at 50% 110%, rgba(var(--gd-color-blue-rgb), 0.12), transparent 36%);
}

/* 殿堂金：深色底 + 金色光晕（参考现网 shenmo 背景） */
.gd-groundback--gold {
  background: linear-gradient(145deg, #06070e 0%, #0a0c16 48%, #0e1322 100%);
}

.gd-groundback--gold::before {
  background:
    radial-gradient(40% 35% at 18% 14%, rgba(var(--gd-color-gold-rgb), 0.12), transparent 70%),
    radial-gradient(36% 32% at 86% 82%, rgba(var(--gd-color-error-rgb), 0.10), transparent 70%);
}

/* prefers-reduced-motion：背景静态无动画，无额外处理 */

</style>

<style>/* src/foundation/brand/gd-brand.css */
.gd-brand {
  margin-bottom: var(--gd-space-6);
  overflow: visible;
  padding-bottom: 8px;
}
/* 不用 background-clip:text，避免 g / y 下行被裁 */
.gd-brand__title {
  display: inline-block;
  max-width: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--gd-font-sans);
  font-size: clamp(var(--gd-type-display-small-size), 6vw, 52px);
  line-height: 1.35;
  font-weight: var(--gd-weight-black);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  color: var(--gd-color-primary);
  text-shadow: 0 0 20px rgba(var(--gd-color-primary-rgb), 0.45);
  /* linear：全程匀速，避免 ease 在关键帧处顿挫 */
  animation: gd-brand-glow 3s linear infinite;
}
/* 蓝 → 青 → 紫 → 蓝，等距关键帧 + 中间过渡色，连续丝滑 */
@keyframes gd-brand-glow {
  0% {
    color: var(--gd-color-primary);
    text-shadow: 0 0 18px rgba(var(--gd-color-primary-rgb), 0.48);
  }
  16.67% {
    color: rgba(var(--gd-color-sky-rgb), 0.78);
    text-shadow: 0 0 18px rgba(var(--gd-color-sky-rgb), 0.4);
  }
  33.33% {
    color: var(--gd-color-cyan);
    text-shadow: 0 0 16px rgba(var(--gd-color-cyan-rgb), 0.36);
  }
  50% {
    color: var(--gd-color-cyan-light);
    text-shadow: 0 0 14px rgba(var(--gd-color-cyan-light-rgb), 0.28);
  }
  66.67% {
    color: rgba(var(--gd-color-sky-blue-rgb), 0.7);
    text-shadow: 0 0 16px rgba(var(--gd-color-sky-blue-rgb), 0.38);
  }
  83.33% {
  color: var(--gd-color-secondary);
  text-shadow: 0 0 20px rgba(var(--gd-color-secondary-rgb), 0.48);
  }
  100% {
    color: var(--gd-color-primary);
    text-shadow: 0 0 18px rgba(var(--gd-color-primary-rgb), 0.48);
  }
}
.gd-brand__title--shift {
  animation: gd-brand-glow 3s linear infinite;
}
/* 神魔殿堂：橙 → 绿 → 红 循环（殿堂主题色） */
.gd-brand__title--palace {
  animation: gd-brand-glow-palace 2.25s linear infinite alternate;
}
@keyframes gd-brand-glow-palace {
  0% {
    color: rgba(var(--gd-color-green-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-green-rgb), 0.4);
  }
  33.33% {
    color: rgba(var(--gd-color-error-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-error-rgb), 0.45);
  }
  66.67% {
    color: rgba(var(--gd-color-gold-deep-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-gold-deep-rgb), 0.45);
  }
  100% {
    color: rgba(var(--gd-color-gold-deep-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-gold-deep-rgb), 0.45);
  }
}
/* 预览用中等尺寸（组件库总览页） */
.gd-brand__title--demo {
  font-size: clamp(28px, 5vw, 40px);
  margin: 8px 0 0;
}
@media (prefers-reduced-motion: reduce) {
  .gd-brand__title,
  .gd-brand__title--shift,
  .gd-brand__title--palace { animation: none; }
}

</style>

<style>/* src/foundation/actions/gd-button.css */
/* gd-button — 按钮（热区 ≥48；状态层用 MD3 透明度） */

.gd-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gd-space-2);
  min-height: var(--gd-touch-target);
  min-width: var(--gd-touch-target);
  padding: 10px 18px;
  border-radius: var(--gd-shape-corner-small);
  border: 1px solid transparent;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  line-height: var(--gd-type-label-large-line);
  text-decoration: none;
  cursor: pointer;
  color: var(--gd-color-on-surface);
  background: transparent;
  transition:
    background var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    border-color var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
  overflow: hidden;
}
.gd-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-button:hover::before { opacity: var(--gd-state-hover); }
.gd-button:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-button:focus-visible::before { opacity: var(--gd-state-focus); }
.gd-button:active::before { opacity: var(--gd-state-pressed); }
.gd-button:disabled,
.gd-button[aria-disabled="true"] {
  opacity: var(--gd-state-disabled);
  pointer-events: none;
  cursor: not-allowed;
}
.gd-button--primary {
  background: linear-gradient(135deg, var(--gd-color-primary), var(--gd-gradient-primary-a));
  color: var(--gd-color-on-primary);
  box-shadow: 0 4px 18px rgba(var(--gd-color-primary-rgb), 0.28);
}
.gd-button--primary:hover { filter: brightness(1.06); transform: none; }
.gd-button--secondary {
  background: rgba(var(--gd-color-white-rgb), 0.04);
  border-color: rgba(var(--gd-color-white-rgb), 0.12);
  color: var(--gd-color-on-surface-variant);
}
.gd-button--secondary:hover {
  background: rgba(var(--gd-color-white-rgb), 0.08);
  border-color: rgba(var(--gd-color-white-rgb), 0.2);
  color: var(--gd-color-on-surface);
}
.gd-button--danger {
  background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b));
  color: var(--gd-color-on-primary);
}
.gd-button--pill { border-radius: var(--gd-shape-corner-full); }

/* 卡片按钮变体（gd-card__btn--detail/link 同款）：固定宽高、紫/粉渐变、13px 字 */
.gd-button--detail,
.gd-button--link {
  flex: 0 0 auto;
  width: 164px;
  height: 39px;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border-radius: 12px;
  border: none;
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-align: center;
  color: var(--gd-color-on-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-button--detail {
  background: linear-gradient(135deg, var(--gd-gradient-primary-a), var(--gd-gradient-primary-b));
  box-shadow: none;
}
.gd-button--detail:hover {
  background: linear-gradient(135deg, var(--gd-gradient-primary-hover-a), var(--gd-gradient-primary-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-button--link {
  background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b));
  box-shadow: none;
}
.gd-button--link:hover {
  background: linear-gradient(135deg, var(--gd-gradient-pink-hover-a), var(--gd-gradient-pink-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-button--detail.is-disabled,
.gd-button--link.is-disabled,
.gd-button--detail:disabled,
.gd-button--link:disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
  box-shadow: none;
}

/* 幽灵按钮（发布页弹窗同款）：紫描边 + 紫底 + 浅紫文字 */
.gd-button--ghost {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(var(--gd-color-accent-rgb), 0.3);
  border-radius: 12px;
  background: rgba(var(--gd-color-accent-rgb), 0.15);
  color: var(--gd-tag-1-fg);
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-bold);
}
.gd-button--ghost:hover {
  background: rgba(var(--gd-color-accent-rgb), 0.25);
  border-color: rgba(var(--gd-color-accent-rgb), 0.45);
  color: var(--gd-color-on-primary);
}
.gd-button--ghost.is-disabled,
.gd-button--ghost:disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
}

/* 全宽按钮（年龄门同款）：15px 粗体 */
.gd-button--wide {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: var(--gd-type-title-small-size);
  font-weight: var(--gd-weight-bold);
}

/* 返回主站 */
.gd-button--back {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  min-height: 0;
  min-width: 0;
  padding: 0 16px 0 12px;
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.12);
  border-radius: 10px;
  background: var(--gd-color-surface-back);
  color: var(--gd-color-on-surface);
  font-size: var(--gd-type-title-small-size);
  font-weight: var(--gd-weight-bold);
  line-height: 1.2;
  box-shadow: none;
  overflow: visible;
  transition:
    border-color 0.2s var(--gd-motion-easing-standard),
    background 0.2s var(--gd-motion-easing-standard),
    transform 0.2s var(--gd-motion-easing-standard),
    color 0.2s var(--gd-motion-easing-standard);
}
.gd-button--back::before { display: none; }
.gd-button--back svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: block;
}
.gd-button--back:hover {
  border-color: rgba(var(--gd-color-indigo-rgb), 0.45);
  background: var(--gd-color-surface);
  transform: translateX(-2px);
  color: var(--gd-color-on-primary);
  filter: none;
}
/* 返回主站（殿堂橙边框变体） */
.gd-button--back--orange:hover {
  border-color: rgba(var(--gd-color-gold-deep-rgb), 0.6);
  background: rgba(var(--gd-color-gold-deep-rgb), 0.12);
  color: var(--gd-color-on-surface);
  filter: none;
}
.gd-button--back:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
@media (max-width: 640px) {
  .gd-button--back {
    font-size: var(--gd-type-label-large-size);
    height: 44px;
    padding: 0 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .gd-button,
  .gd-button::before {
    transition: none;
  }
  .gd-button--primary:hover,
  .gd-button--back:hover { transform: none; }
}

</style>

<style>/* src/feedback/modal/gd-publish-card.css */
/* gd-publish-card — 发布卡片弹窗（独立组件，不依赖 gd-modal.css）
   用法：
     <div class="gd-publish-card-overlay" id="publishCard" role="dialog" aria-modal="true" aria-labelledby="publishCardTitle" aria-hidden="true" data-close-on-backdrop>
       <div class="gd-publish-card">…</div>
     </div>
   打开/关闭：bindGdModal("#publishCard", "#btnOpen")（切换 .is-open） */

.gd-publish-card-overlay {
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--gd-color-overlay);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
}
.gd-publish-card-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}

.gd-publish-card {
  width: min(100%, 480px);
  max-height: min(86vh, 640px);
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.14);
  border-radius: var(--gd-shape-corner-medium, 18px);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  transform: translateY(18px) scale(0.97);
  opacity: 0;
  transition:
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  font-family: var(--gd-font-sans);
  font-style: normal;
  letter-spacing: var(--gd-type-letter-spacing-normal);
}
.gd-publish-card-overlay.is-open .gd-publish-card {
  transform: translateY(0) scale(1);
  opacity: 1;
}

/* 预览：内嵌展示，悬停动效保留 */
.gd-publish-card.is-demo {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: none;
  margin: 12px auto 0;
  transform: none !important;
  opacity: 1;
  pointer-events: auto;
}

.gd-publish-card__header {
  position: relative;
  padding: 28px 28px 18px;
  border-bottom: 1px solid rgba(var(--gd-color-white-rgb), 0.07);
  text-align: center;
}
.gd-publish-card__close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.1);
  border-radius: var(--gd-shape-corner-small);
  background: rgba(var(--gd-color-white-rgb), 0.05);
  color: rgba(var(--gd-color-white-rgb), 0.62);
  cursor: pointer;
  padding: 0;
  transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
}
.gd-publish-card__close:hover {
  background: rgba(var(--gd-color-white-rgb), 0.1);
  color: var(--gd-color-on-primary);
  border-color: rgba(var(--gd-color-white-rgb), 0.2);
}
.gd-publish-card__close:focus-visible {
  outline: 3px solid rgba(var(--gd-color-sky-blue-rgb), 0.42);
  outline-offset: 2px;
}
.gd-publish-card__close svg {
  width: 16px;
  height: 16px;
  display: block;
}
.gd-publish-card__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 40px;
  margin: 0 0 14px;
}
.gd-publish-card__logo {
  width: 160px;
  height: 160px;
  border-radius: 0;
  object-fit: cover;
}
.gd-publish-card__wordmark {
  margin: 0;
  font-size: clamp(26px, 5vw, 36px);
}
.gd-publish-card__lead {
  margin: 10px auto 0;
  max-width: 400px;
  color: var(--gd-color-on-surface-variant);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-normal);
  line-height: 1.75;
  text-align: center;
}

.gd-publish-card__body {
  padding: 22px 28px 8px;
  overflow-y: auto;
  color: rgba(var(--gd-color-white-rgb), 0.62);
  font-size: var(--gd-type-title-small-size);
  line-height: 1.75;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--gd-color-sky-rgb), 0.22) transparent;
}
.gd-publish-card__body::-webkit-scrollbar { width: 6px; }
.gd-publish-card__body::-webkit-scrollbar-thumb {
  border-radius: var(--gd-shape-corner-full);
  background: rgba(var(--gd-color-sky-rgb), 0.22);
}
.gd-publish-card__note {
  margin: 0;
  padding: 14px 16px;
  border-left: 3px solid rgba(var(--gd-color-sky-rgb), 0.55);
  border-radius: 0 12px 12px 0;
  background: rgba(var(--gd-color-white-rgb), 0.03);
  color: rgba(var(--gd-color-white-rgb), 0.72);
  font-size: var(--gd-type-label-large-size);
  line-height: 1.75;
}
.gd-publish-card__note + .gd-publish-card__note { margin-top: 12px; }
.gd-publish-card__note strong { color: var(--gd-color-on-surface); font-weight: var(--gd-weight-bold); }

.gd-publish-card__footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 18px 28px 24px;
  border-top: 1px solid rgba(var(--gd-color-white-rgb), 0.07);
}
.gd-publish-card__action {
  min-width: 120px;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: var(--gd-shape-corner-small);
  background: linear-gradient(135deg, var(--gd-color-primary), var(--gd-gradient-primary-a));
  color: var(--gd-color-on-primary);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-bold);
  font-family: inherit;
  font-style: normal;
  letter-spacing: var(--gd-type-letter-spacing-normal);
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(var(--gd-color-primary-rgb), 0.28);
  transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
}
.gd-publish-card__action:hover {
  filter: brightness(1.06);
  box-shadow: 0 4px 18px rgba(var(--gd-color-primary-rgb), 0.28);
  transform: none;
}
.gd-publish-card__action:focus-visible {
  outline: 3px solid rgba(var(--gd-color-sky-blue-rgb), 0.42);
  outline-offset: 2px;
}

/* 预览态：悬停动效保留，点击无效 */
.gd-publish-card.is-demo .gd-publish-card__action {
  cursor: default;
}
.gd-publish-card.is-demo .gd-publish-card__action:hover {
  filter: brightness(1.06);
}
.gd-publish-card.is-demo .gd-publish-card__action:active {
  transform: none;
}

@media (max-width: 640px) {
  .gd-publish-card-overlay {
    padding: 16px;
    align-items: flex-end;
  }
  .gd-publish-card:not(.is-demo) {
    width: 100%;
    max-height: 88vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .gd-publish-card__header,
  .gd-publish-card__body,
  .gd-publish-card__footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  .gd-publish-card__action {
    width: 100%;
  }
  .gd-publish-card__footer {
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .gd-publish-card {
    transition: none;
  }
}

</style>

<style>
/* 沙盒发布页基础样式：组件外观一律来自组件库（/src/ 引用） */
*{box-sizing:border-box;margin:0;padding:0}
/* 底色放 html，body 透明，让 gd-groundback（z-index:-1）光晕可见 */
html{background-color:var(--gd-color-background);background-attachment:fixed!important}
body{background:transparent!important}
body{font-family:var(--gd-font-sans);color:var(--gd-color-on-surface);line-height:1.65;-webkit-font-smoothing:antialiased}
body.modal-open{overflow:hidden}
.page{position:relative;min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px}
.page .gd-publish-card{width:min(100%,480px);margin:0;max-height:none}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{transition-duration:0.01ms !important;animation-duration:0.01ms !important;animation-iteration-count:1 !important}}
</style>
</head><body>
  <a class="gd-skip-link" href="#main">跳到主要内容</a>
<main class="page" id="main" aria-label="GALNAVI 发布页">
<div class="gd-groundback gd-groundback--blue" aria-hidden="true"></div>
<div class="gd-publish-card is-demo">
<header class="gd-publish-card__header">
<div class="gd-publish-card__brand">
<img class="gd-publish-card__logo" alt="GALNAVI 品牌标" src="https://assets.galnavi.top/logo.png">
</div>
<h1 class="gd-brand__title gd-brand__title--demo gd-publish-card__wordmark">GALNAVI</h1>
<p class="gd-publish-card__lead">一个专注于 ACG 二次元资源网站聚合与收录的纯净导航站点。纯净无广，秒速响应，一站直达。</p>
</header>
<div class="gd-publish-card__body">
<p class="gd-publish-card__note">建议使用 <a class="gd-link" href="https://www.mozilla.org/firefox/new/" target="_blank" rel="noopener noreferrer">Firefox</a>、<a class="gd-link" href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer">Edge</a>、<a class="gd-link" href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">Chrome</a> 等浏览器访问。</p>
<p class="gd-publish-card__note">按 <strong>Ctrl + D</strong> 保存收藏</p>
</div>
<footer class="gd-publish-card__footer">
<a class="gd-button gd-button--primary" href="https://galnavi.top/nav/" target="_blank" rel="noopener noreferrer" style="min-width:160px;min-height:48px">进入主站</a>
</footer>
</div>
</main>

<script>
(function() {
    var logo=document.querySelector(".publish-card__logo");
    if(!logo)return;
    var clickCount=0;
    var resetTimer=null;
    logo.addEventListener("click",function() {
      clickCount++;
      if(clickCount >=5) {
        clickCount=0;
        clearTimeout(resetTimer);
        window.location.href="#";
        return;

      }clearTimeout(resetTimer);
      resetTimer=setTimeout(function() {
        clickCount=0;

      },3000);

    });

})();
</script>
  <div id="gd-live-region" aria-live="polite" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></div>
</body>
</html>`;


export default {
  async fetch() {
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://galnavi.top; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
      }
    });
  }
}