/**
 * 脱敏页面副本（由 worker/new 提取）。
 * 已去除：SEO（OG/Twitter/JSON-LD/canonical/robots/sitemap）、D1/KV/API、Cookie 首访、私密地址。
 * 不含 status。仅供阅读 / 本地预览，不能当生产 Worker 部署。
 */
const ASSET_FAVICON = "https://assets.galnavi.top/favicon.png";
const ASSET_ICON = "https://assets.galnavi.top/icon.png";
const SECURITY_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://galnavi.top; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
};

export default {
  async fetch(request, env, ctx) {
    return new Response(renderPage(), { headers: SECURITY_HEADERS });
  },
};

function renderPage() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>关于 GALNAVI · 站点声明</title>
<link rel="icon" href="${ASSET_FAVICON}" type="image/png">
<link rel="apple-touch-icon" href="${ASSET_ICON}">
<style>
/* ===== 组件库（构建期内联） ===== */
/* ===== src/foundation/tokens/tokens.css ===== */
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
  --gd-color-on-surface-variant: #93a4c8;
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

/* ===== src/foundation/brand/gd-brand.css ===== */
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

/* ===== src/foundation/layout/gd-groundback.css ===== */
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

/* ===== src/extend/overview/gd-overview.css ===== */
/* gd-overview — 总览页壳层（虚线分区：正文 + 标题 + 右侧索引） */

:root {
  --ov-bg: var(--gd-color-background);
  --ov-text: var(--gd-color-on-surface);
  --ov-display: var(--gd-color-on-surface);
  --ov-tertiary: var(--gd-color-on-surface-variant);
  --ov-anchor: rgba(139, 156, 192, 0.55);
  --ov-accent: var(--gd-color-primary);
  --ov-border-soft: rgba(var(--gd-color-white-rgb), 0.14);
  --ov-toc-width: 165px;
  --ov-content-max: 811px;
  /* 窄屏：右侧不再用居中半宽留白 */
  --ov-page-max: 976px;
  --ov-shell-pad-right: 12px;
}

html {
  scroll-behavior: smooth;
  background: var(--gd-color-background);
}

body.gd-overview {
  margin: 0;
  min-height: 100%;
  color: var(--gd-color-on-surface);
  font-family: var(--gd-font-sans);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(40% 35% at 18% 12%, rgba(var(--gd-color-indigo-rgb), 0.3), transparent 70%),
    radial-gradient(35% 30% at 88% 78%, rgba(var(--gd-color-blue-deep-rgb), 0.22), transparent 70%),
    var(--gd-color-background);
  background-attachment: fixed;
}

/* 顶部分隔虚线（无导航栏，仅保留分区线） */
.gd-overview__chrome {
  height: 1px;
  width: 100%;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMSIgdmlld0JveD0iMCAwIDMyIDEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF9oKSI+CjxwYXRoIGQ9Ik0xNiAwTDE2IDFMMCAxTDAgMEwxNiAwWiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfaCI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSByb3RhdGUoLTkwKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
  background-repeat: repeat-x;
  background-position: 0 0;
}

.gd-overview__shell {
  width: 100%;
  max-width: none;
  margin: 0;
  box-sizing: border-box;
}

.gd-overview__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "post";
  width: 100%;
}

.gd-overview__content {
  grid-area: post;
  min-width: 0;
  padding: 24px 20px 64px;
}

.gd-overview__toc {
  display: none;
  grid-area: toc;
}

@media (min-width: 768px) {
  /* 右侧仅留窄边距，把空间让给正文 */
  .gd-overview__shell {
    padding-right: var(--ov-shell-pad-right);
    padding-left: 0;
  }
  .gd-overview__layout {
    grid-template-columns: minmax(0, 1fr) var(--ov-toc-width);
    grid-template-areas: "post toc";
  }
  .gd-overview__content {
    padding: 24px 28px 80px clamp(20px, 3vw, 48px);
  }
  .gd-overview__toc {
    display: block;
    padding: 28px 8px 0 12px;
    /* CF: ltr-dashed-left — 左侧竖虚线 */
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDEgMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF92KSI+CjxwYXRoIGQ9Ik0xIDE2TDAgMTZMMCAwTDEgMEwxIDE2WiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfdiI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
    background-repeat: repeat-y;
    background-position: 0 0;
  }
}

@media (min-width: 1280px) {
  :root { --ov-toc-width: 165px; }
}

/* —— 标题区 —— */
.gd-overview__date {
  display: block;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-medium);
  line-height: 1;
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--gd-color-on-surface-variant);
  margin: 0 0 16px;
}

.gd-overview__title {
  display: inline-block;
  margin: 0 0 20px;
  padding: 0;
  font-family: var(--gd-font-sans);
  font-size: clamp(var(--gd-type-display-small-size, 28px), 6vw, 52px);
  font-weight: var(--gd-weight-black);
  line-height: 1.35;
  letter-spacing: var(--gd-type-letter-spacing-wide);
  color: rgba(var(--gd-color-sky-blue-rgb), 0.9);
  text-shadow: 0 0 24px rgba(var(--gd-color-sky-blue-rgb), 0.35);
  animation: gd-brand-glow 3s linear infinite;
}

.gd-overview__lede {
  margin: 0 0 8px;
  max-width: 40rem;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-body-medium-size, 16px);
  line-height: 1.7;
  color: var(--gd-color-on-surface-variant);
}

.gd-overview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin: 20px 0 0;
  font-size: var(--gd-type-note-size);
  color: var(--ov-tertiary);
}

.gd-overview__tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--ov-text) 18%, transparent);
  color: var(--ov-tertiary);
  font-size: var(--gd-type-note-size);
  line-height: 1.3;
  text-decoration: none;
}

.gd-overview__rule {
  height: 1px;
  margin: 40px 0 8px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMSIgdmlld0JveD0iMCAwIDMyIDEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF9oKSI+CjxwYXRoIGQ9Ik0xNiAwTDE2IDFMMCAxTDAgMEwxNiAwWiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfaCI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSByb3RhdGUoLTkwKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
  background-repeat: repeat-x;
  background-position: 0 0;
}

/* —— 正文分区 —— */
.gd-overview .gd-section {
  margin: 40px 0 0;
  padding-top: 8px;
  scroll-margin-top: 24px;
}

.gd-overview .gd-section__title {
  margin: 0 0 16px;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-title-xxl-size);
  font-weight: var(--gd-weight-bold);
  line-height: 1.25;
  color: var(--gd-color-on-surface);
  gap: 0;
}

.gd-overview .gd-section__title::before {
  display: none;
}

.gd-overview .demo-note {
  margin: 0 0 12px;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-body-medium-size, 15px);
  line-height: 1.7;
  color: var(--gd-color-on-surface-variant);
}
.gd-overview .demo-note--no-margin { margin-bottom: 0; }
.gd-overview .demo-note--top { margin: 16px 0 0; }

.gd-overview .demo-preview {
  margin-top: 12px;
  padding: 20px;
  border-radius: 8px;
  border: 1px dashed rgba(var(--gd-color-grey-rgb), 0.45);
  background: rgba(var(--gd-color-white-rgb), 0.02);
}
.gd-overview .demo-preview + .demo-preview { margin-top: 16px; }
.gd-overview .demo-preview--pad-bottom { padding-bottom: 28px; }

/* groundback 背景层演示：transform 使内部 fixed 背景相对容器定位 */
.gd-overview .demo-preview--groundback {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: flex-end;
}
.gd-overview .groundback-demo-label {
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(var(--gd-color-navy-rgb), 0.55);
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.14);
  font-size: var(--gd-type-note-size);
  color: var(--gd-color-on-surface);
}
/* 年龄门演示框确认后收起 */
.gd-overview .is-hidden {
  display: none;
}

/* 扩展页 UI 演示：内容 | 竖虚线 | 右侧索引（对齐真实布局） */
.gd-overview .extend-ui-demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 18px;
}
.gd-overview .extend-ui-demo__main {
  min-width: 0;
}
/* 演示汉堡：仅窄屏显示（复用真实结构，靠右、容器内展开；边距对齐真实：上 8px 右 8px） */
.gd-overview .extend-ui-demo__toc-mobile {
  display: none;
  position: relative;
  width: fit-content;
  margin: 8px 8px 14px auto;
}
.gd-overview .extend-ui-demo__toc-mobile .gd-overview-toc-mobile__panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: min(88vw, 280px);
  max-height: min(72vh, 480px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px 8px;
  border-radius: var(--gd-shape-corner-small);
  border: 1px solid rgba(var(--gd-color-grey-rgb), 0.28);
  background: rgba(var(--gd-color-ink-3-rgb), 0.94);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
  scrollbar-width: none;
  -ms-overflow-style: none;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-10px) scale(0.96);
  transform-origin: top right;
  transition:
    opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.28s;
}
.gd-overview .extend-ui-demo__toc-mobile.is-open .gd-overview-toc-mobile__panel {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}
.gd-overview .extend-ui-demo__toc {
  padding-left: 16px;
  border-left: 1px dashed rgba(var(--gd-color-grey-rgb), 0.5);
}
@media (max-width: 767px) {
  .gd-overview .extend-ui-demo {
    grid-template-columns: minmax(0, 1fr);
  }
  .gd-overview .extend-ui-demo__toc-mobile {
    display: block;
  }
  .gd-overview .extend-ui-demo__toc {
    display: none;
  }
}

.gd-overview .demo-preview__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.gd-overview .demo-preview__label {
  font-size: var(--gd-type-note-size);
  color: var(--ov-tertiary);
  margin-bottom: 10px;
}

.gd-overview .demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}
.gd-overview .demo-row--no-margin { margin-top: 0; }

.gd-overview .demo-navbar-stage {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.12);
}

.gd-overview .demo-navbar-stage .gd-navbar {
  position: relative;
}

.gd-overview .gd-footer {
  margin-top: 56px;
  padding-top: 24px;
  border-top: none;
}
/* 尾页 footer：仅页面底部的 GALNAVI · Design 加顶部虚线分隔 */
.gd-overview .gd-footer--page {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMSIgdmlld0JveD0iMCAwIDMyIDEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF9oKSI+CjxwYXRoIGQ9Ik0xNiAwTDE2IDFMMCAxTDAgMEwxNiAwWiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfaCI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSByb3RhdGUoLTkwKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
  background-repeat: repeat-x;
  background-position: 0 0;
}

/* —— 右侧「本页内容」 —— */
.gd-otp {
  position: sticky;
  top: 40px;
  z-index: 1;
  padding-bottom: 48px;
}

.gd-otp__label {
  margin: 0 0 10px 10px;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-semibold);
  line-height: 1;
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--gd-color-on-surface-variant);
}

.gd-otp__list {
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.gd-otp__list::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.gd-otp__link {
  display: block;
  position: relative;
  padding: 6px 2px 6px 14px;
  color: var(--gd-color-on-surface-variant);
  font-family: var(--gd-font-sans);
  font-size: 13.5px;
  line-height: 1.35;
  text-decoration: none;
  transition: color 0.14s ease;
}

.gd-otp__link::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--ov-anchor);
  opacity: 0.55;
}

.gd-otp__link:hover {
  color: var(--gd-color-on-surface);
}

.gd-otp__link.is-active {
  color: var(--gd-color-link-hover);
  font-weight: var(--gd-weight-semibold);
}

.gd-otp__link.is-active::before {
  background: var(--gd-color-primary);
  opacity: 1;
  width: 2px;
  left: 6.5px;
}

/* —— 手机端：右上角裸汉堡 → 竖列标题 —— */
.gd-overview-toc-mobile {
  display: none;
}

.gd-overview-toc-mobile__btn {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(var(--gd-color-grey-rgb), 0.32);
  border-radius: 12px;
  background: rgba(var(--gd-color-ink-rgb), 0.9);
  box-shadow: none;
  color: var(--gd-color-on-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  position: relative;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}
.gd-overview-toc-mobile__btn:hover {
  color: var(--gd-color-primary);
  background: rgba(var(--gd-color-ink-2-rgb), 0.92);
  border-color: rgba(var(--gd-color-outline-blue-rgb), 0.56);
}
.gd-overview-toc-mobile__btn:active {
  transform: scale(0.92);
}
.gd-overview-toc-mobile__btn:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-overview-toc-mobile__btn svg {
  /* 图标的切换动效由 gd-hamburger-motion 与组件共用 */
  inset: 50% auto auto 50%;
}

.gd-otp__link {
  transition:
    color 0.2s ease,
    font-weight 0.2s ease,
    background-color 0.2s ease;
}
.gd-otp__link::before {
  transition: background-color 0.2s ease, width 0.2s ease, opacity 0.2s ease;
}

@media (max-width: 767px) {
  .gd-overview__content {
    padding-top: 56px;
  }

  .gd-overview-toc-mobile {
    display: block;
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 300;
  }

  .gd-overview-toc-mobile__panel {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    width: min(88vw, 280px);
    max-height: min(72vh, 480px);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 12px 8px;
    border-radius: 12px;
    border: 1px solid rgba(var(--gd-color-grey-rgb), 0.28);
    background: rgba(var(--gd-color-ink-3-rgb), 0.94);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
    /* 隐藏滚动条，仍可滑动 */
    scrollbar-width: none;
    -ms-overflow-style: none;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px) scale(0.96);
    transform-origin: top right;
    transition:
      opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0.28s;
  }
  .gd-overview-toc-mobile__panel::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-toc-mobile__panel {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }

  .gd-overview-mobile-list__label {
    margin: 0 8px 8px;
    font-size: var(--gd-type-label-small-size);
    font-weight: var(--gd-weight-bold);
    letter-spacing: var(--gd-type-letter-spacing-wide);
    text-transform: uppercase;
    color: var(--gd-color-on-surface-variant);
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 0.22s ease,
      transform 0.22s ease;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__label {
    opacity: 1;
    transform: none;
    transition-delay: 40ms;
  }

  .gd-overview-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0;
  }

  .gd-overview-mobile-list__link {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: 8px;
    color: var(--gd-color-on-surface-variant);
    font-family: var(--gd-font-sans);
    font-size: var(--gd-type-label-large-size);
    font-weight: var(--gd-weight-medium);
    line-height: 1.35;
    text-decoration: none;
    text-align: left;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity 0.22s ease,
      transform 0.24s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.18s ease,
      background-color 0.18s ease;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link {
    opacity: 1;
    transform: none;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(1) { transition-delay: 50ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(2) { transition-delay: 70ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(3) { transition-delay: 90ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(4) { transition-delay: 110ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(5) { transition-delay: 130ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(6) { transition-delay: 150ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(7) { transition-delay: 170ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(8) { transition-delay: 190ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(9) { transition-delay: 210ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(10) { transition-delay: 230ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(11) { transition-delay: 250ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(12) { transition-delay: 270ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(13) { transition-delay: 290ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(14) { transition-delay: 310ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(15) { transition-delay: 330ms; }

  .gd-overview-mobile-list__link:hover {
    color: var(--gd-color-on-surface);
    background: rgba(var(--gd-color-white-rgb), 0.05);
  }
  .gd-overview-mobile-list__link.is-active {
    color: var(--gd-color-link-hover);
    background: var(--gd-color-primary-container);
    font-weight: var(--gd-weight-bold);
  }
  .gd-otp__link:focus-visible,
  .gd-overview-mobile-list__link:focus-visible {
    outline: 2px solid var(--gd-color-link);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gd-overview-toc-mobile__btn,
  .gd-overview-toc-mobile__btn svg,
  .gd-overview-toc-mobile__panel,
  .gd-overview-mobile-list__label,
  .gd-overview-mobile-list__link,
  .gd-otp__link,
  .gd-otp__link::before {
    transition: none !important;
  }
}

/* ===== src/foundation/actions/gd-button.css ===== */
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
  background: rgba(0, 0, 0, 0.3);
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

/* ===== src/foundation/actions/gd-link.css ===== */
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

/* ===== src/display/tag/gd-tag.css ===== */
.gd-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 30px;
  padding: 0 14px;
  border-radius: var(--gd-shape-corner-full);
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-medium);
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard), filter var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
  background: var(--gd-tag-1-bg);
  color: var(--gd-tag-1-fg);
  border: 1px solid var(--gd-tag-1-border);
}
.gd-tag:hover { filter: brightness(1.1); transform: none; }
.gd-tag:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-tag--blue { background: var(--gd-tag-2-bg); color: var(--gd-tag-2-fg); border-color: var(--gd-tag-2-border); }
.gd-tag--pink { background: var(--gd-tag-3-bg); color: var(--gd-tag-3-fg); border-color: var(--gd-tag-3-border); }

/* 标签索引页（galnavi.top/nav/#tags tag-item） */
.gd-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.gd-tag--item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  height: 30px;
  padding: 0 18px;
  background: rgba(var(--gd-color-primary-rgb), 0.08);
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.15);
  border-radius: var(--gd-shape-corner-full);
  cursor: pointer;
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-regular);
  color: var(--gd-color-on-surface-variant);
  transition: all 0.25s ease;
}
.gd-tag--item:hover {
  background: rgba(var(--gd-color-primary-rgb), 0.15);
  border-color: rgba(var(--gd-color-primary-rgb), 0.3);
  color: var(--gd-color-on-surface);
  box-shadow: 0 0 16px rgba(var(--gd-color-primary-rgb), 0.12);
  filter: brightness(1.06);
  transform: none;
}
.gd-tag--item.is-active {
  background: rgba(var(--gd-color-primary-rgb), 0.2);
  border-color: var(--gd-color-primary);
  color: var(--gd-color-primary);
}
.gd-tag--item .gd-tag__name { font-weight: var(--gd-weight-semibold); }
.gd-tag--item .gd-tag__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--gd-type-label-medium-size);
  color: var(--gd-badge-fg);
  background: var(--gd-badge-bg);
  height: 17px;
  padding: 0 8px;
  border-radius: 10px;
  font-weight: var(--gd-weight-bold);
  line-height: 1;
}
.gd-tag--item.is-active .gd-tag__count {
  color: var(--gd-badge-blue-fg);
  background: var(--gd-badge-blue-bg);
  font-weight: var(--gd-weight-bold);
}

@media (prefers-reduced-motion: reduce) {
  .gd-tag { transition: none; }
  .gd-tag:hover { transform: none; }
  .gd-tag--item { transition: none; }
  .gd-tag--item:hover { transform: none; }
}

/* ===== src/display/card/gd-card.css ===== */
/* gd-card — 玻璃数值冻结；主站 / 友链 / 神魔变体 */

.gd-card {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(380px, 100%);
  height: 212px;
  padding: 20px;
  border-radius: var(--gd-shape-corner-large);
  background: var(--gd-glass-bg);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid var(--gd-glass-border);
  box-shadow: none;
  color: inherit;
  text-decoration: none;
  transition:
    transform var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard),
    background var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard),
    border-color var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard),
    box-shadow var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard);
  z-index: 1;
}
.gd-card:hover {
  background: var(--gd-glass-bg-hover);
  border-color: var(--gd-color-border-hover);
  box-shadow: 0 0 24px rgba(var(--gd-color-primary-rgb), 0.1), inset 0 1px 0 rgba(var(--gd-color-white-rgb), 0.06);
  transform: none;
  filter: brightness(1.05);
}
.gd-card--link { cursor: pointer; }

.gd-card__header { display: flex; align-items: flex-start; gap: 14px; }
.gd-card__icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--gd-shape-corner-small);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--gd-color-accent-rgb), 0.15), rgba(var(--gd-color-blue-rgb), 0.1));
  border: 1px solid rgba(var(--gd-color-accent-rgb), 0.2);
  font-size: var(--gd-type-title-large-size);
  font-weight: var(--gd-weight-extrabold);
  color: var(--gd-color-link);
}
.gd-card__icon img { width: 40px; height: 40px; object-fit: contain; }
.gd-card__title-wrap { flex: 1; min-width: 0; }
.gd-card__title {
  font-size: var(--gd-type-title-medium-size);
  font-weight: var(--gd-weight-bold);
  line-height: var(--gd-type-title-medium-line);
  color: var(--gd-color-on-surface);
  margin-bottom: 5px;
  letter-spacing: var(--gd-type-letter-spacing-wide);
}
.gd-card__subtitle {
  font-size: var(--gd-type-body-medium-size);
  color: var(--gd-color-on-surface-variant);
  line-height: 1.65;
  font-weight: var(--gd-weight-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.65em * 2);
}
.gd-card__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

/* 主站卡片按钮 */
.gd-card__actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}
.gd-card__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 0;
  border-radius: 12px;
  border: none;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  color: var(--gd-color-on-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-card__btn--detail {
  background: linear-gradient(135deg, var(--gd-gradient-primary-a), var(--gd-gradient-primary-b));
  box-shadow: none;
}
.gd-card__btn--detail:hover {
  background: linear-gradient(135deg, var(--gd-gradient-primary-hover-a), var(--gd-gradient-primary-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-card__btn--link {
  background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b));
  box-shadow: none;
}
.gd-card__btn--link:hover {
  background: linear-gradient(135deg, var(--gd-gradient-pink-hover-a), var(--gd-gradient-pink-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-card__btn:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-card__btn.is-disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
  box-shadow: none;
}

/* 友链 */
.gd-card--friend { width: auto; height: auto; max-width: 320px; }
.gd-card--friend .gd-card__icon { width: 50px; height: 50px; }
.gd-card--friend .gd-card__subtitle { min-height: 0; }
.gd-friend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 320px));
  gap: 18px;
  justify-content: start;
}

/* 神魔 / 圣器殿堂 item-card */
.gd-card--item {
  --gd-comp-item-color: #fbbf24;
  --gd-comp-item-color-light: #fcd34d;
  --gd-comp-item-color-rgb: 251, 191, 36;
  gap: 10px;
  width: auto;
  height: auto;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(var(--gd-color-white-rgb), 0.035);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.08);
  box-shadow: none;
  transform: none;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  transition:
    background 0.2s var(--gd-motion-easing-standard),
    border-color 0.2s var(--gd-motion-easing-standard);
}
.gd-card--item--demonic {
  --gd-comp-item-color: #ef4444;
  --gd-comp-item-color-light: #fca5a5;
  --gd-comp-item-color-rgb: 239, 68, 68;
}
.gd-card--item--immortal {
  --gd-comp-item-color: #10b981;
  --gd-comp-item-color-light: #6ee7b7;
  --gd-comp-item-color-rgb: 16, 185, 129;
}
.gd-card--item:hover {
  background: rgba(var(--gd-color-white-rgb), 0.05);
  border-color: rgba(var(--gd-comp-item-color-rgb), 0.28);
  box-shadow: none;
  transform: none;
}
.gd-card--item .gd-card__item-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
  width: 100%;
}
.gd-card--item .gd-card__num {
  min-width: 28px;
  padding-top: 4px;
  text-align: center;
  font-weight: var(--gd-weight-bold);
  font-variant-numeric: tabular-nums;
  font-size: var(--gd-type-title-small-size);
  line-height: 1.4;
  flex-shrink: 0;
  color: var(--gd-comp-item-color);
}
.gd-card--item .gd-card__item-body {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 10px;
  align-items: start;
}
.gd-card--item .gd-card__item-name {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
}
.gd-card--item .gd-card__name-main {
  display: block;
  min-width: 0;
  color: var(--gd-color-on-surface);
  font-weight: var(--gd-weight-semibold);
  font-size: var(--gd-type-title-small-size);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gd-card--item .gd-card__name-sub {
  display: block;
  margin-top: 3px;
  color: var(--gd-color-on-surface-subtle);
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-regular);
  line-height: 1.45;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.gd-card--item .gd-card__item-actions {
  display: contents;
}
.gd-card--item .gd-card__action-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
.gd-card--item .gd-card__action-group--primary {
  grid-column: 2;
  grid-row: 1;
  align-self: center;
}
.gd-card--item .gd-card__action-group--ext {
  grid-column: 1 / -1;
  grid-row: 2;
  width: 100%;
}
.gd-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-semibold);
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: background 0.2s var(--gd-motion-easing-standard), border-color 0.2s var(--gd-motion-easing-standard), color 0.2s var(--gd-motion-easing-standard), transform 0.15s var(--gd-motion-easing-standard);
}
.gd-card__action:hover { filter: brightness(1.1); transform: none; }
.gd-card__action:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-card__action--site {
  background: rgba(var(--gd-color-sky-blue-rgb), 0.16);
  border-color: rgba(var(--gd-color-sky-blue-rgb), 0.42);
  color: var(--gd-tag-2-fg);
}
.gd-card__action--site:hover { background: rgba(var(--gd-color-sky-blue-rgb), 0.26); color: var(--gd-color-link-hover); }
.gd-card__action--detail {
  background: rgba(var(--gd-color-white-rgb), 0.07);
  border-color: rgba(var(--gd-color-white-rgb), 0.2);
  color: rgba(var(--gd-color-muted-white-rgb), 0.96);
}
.gd-card__action--detail:hover { background: rgba(var(--gd-color-white-rgb), 0.12); border-color: rgba(255, 255, 255, 0.28); }
.gd-card__action--ext {
  background: rgba(var(--gd-comp-item-color-rgb), 0.12);
  border-color: rgba(var(--gd-comp-item-color-rgb), 0.36);
  color: var(--gd-comp-item-color-light);
}
.gd-card__action--ext:hover { filter: brightness(1.1); }

/* 桌面端（≥769px）：条目卡变横排，外链组用左分隔线 */
@media (min-width: 769px) {
  .gd-card--item { flex-direction: row; align-items: center; padding: 16px 18px; gap: 16px; }
  .gd-card--item .gd-card__item-main { flex: 1; align-items: center; }
  .gd-card--item .gd-card__num { padding-top: 0; }
  .gd-card--item .gd-card__item-body {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .gd-card--item .gd-card__item-name { flex: 1; min-width: 0; }
  .gd-card--item .gd-card__item-actions {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    gap: 0;
  }
  .gd-card--item .gd-card__action-group--primary { grid-column: auto; grid-row: auto; align-self: center; }
  .gd-card--item .gd-card__action-group--ext {
    grid-column: auto;
    grid-row: auto;
    width: auto;
    flex-shrink: 0;
    margin-left: 14px;
    padding-left: 14px;
    border-left: 1px solid rgba(var(--gd-color-white-rgb), 0.1);
  }
  .gd-card--item .gd-card__name-main { font-size: var(--gd-type-body-large-size); }
}

/* 窄屏（≤768px）：紧凑数值与按钮热区 */
@media (max-width: 768px) {
  .gd-card--item { padding: 12px; }
  .gd-card--item .gd-card__num { min-width: 24px; font-size: var(--gd-type-label-large-size); }
  .gd-card--item .gd-card__name-main { font-size: var(--gd-type-label-large-size); }
  .gd-card__action { min-height: 32px; padding: 0 9px; }
}

/* 主站大卡（≤640px）：宽度自适应 */
@media (max-width: 640px) {
  .gd-card { width: 100%; }
}

.gd-item-list {
  display: grid;
  gap: 10px;
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .gd-card,
  .gd-card__btn,
  .gd-card__action,
  .gd-tag { transition: none; }
  .gd-card__btn:hover,
  .gd-card__action:hover,
  .gd-tag:hover { transform: none; }
}

/* ===== src/display/table/gd-table.css ===== */
.gd-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid rgba(var(--gd-color-white-rgb), 0.12);
  margin: 0;
}
.gd-table th,
.gd-table td {
  text-align: left;
  vertical-align: top;
  padding: 14px 20px 14px 0;
  border-bottom: 1px solid rgba(var(--gd-color-white-rgb), 0.12);
  font-size: var(--gd-type-body-large-size);
  line-height: 1.7;
}
.gd-table th {
  width: 7.2em;
  white-space: nowrap;
  color: var(--gd-color-on-surface);
  font-weight: var(--gd-weight-semibold);
  padding-right: 28px;
}
.gd-table td {
  color: var(--gd-color-on-surface-variant);
  font-weight: var(--gd-weight-regular);
}
.gd-table tr:last-child th,
.gd-table tr:last-child td { border-bottom: 0; }

/* ===== src/foundation/layout/gd-footer.css ===== */
.gd-footer {
  text-align: center;
  padding: 28px 16px 40px;
  color: rgba(var(--gd-color-muted-white-rgb), 0.45);
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-regular);
  line-height: 1.7;
  letter-spacing: var(--gd-type-letter-spacing-normal);
  font-family: var(--gd-font-sans);
}
.gd-footer__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px 0;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}
.gd-footer__nav a {
  color: rgba(var(--gd-color-muted-white-rgb), 0.62);
  text-decoration: none;
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-medium);
  padding: 4px 8px;
  min-height: 24px;
}
.gd-footer__nav a:hover { color: var(--gd-color-link-hover); }
.gd-footer__nav a:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-footer__sep { color: rgba(var(--gd-color-muted-white-rgb), 0.28); user-select: none; font-size: var(--gd-type-label-medium-size); }
.gd-footer__copy { margin: 0; }

/* ===== about 页面特有样式 ===== */

.gd-groundback { z-index: 0; }
.gd-overview__shell { position: relative; z-index: 1; }
.gd-back-fab {
  position: fixed;
  top: max(12px, env(safe-area-inset-top, 0px));
  left: max(12px, env(safe-area-inset-left, 0px));
  z-index: 50;
}
.gd-overview__content .gd-brand__title { margin-top: 56px; }
.gd-overview__content .gd-link {
  color: var(--gd-color-link);
  text-decoration: none;
  font-weight: var(--gd-weight-semibold);
}
.gd-overview__content .gd-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}
.gd-overview__content h2 { scroll-margin-top: 90px; }
.gd-overview__content .card { background: transparent; border: none; border-radius: 0; padding: 4px 0 8px; margin-bottom: 12px; }
.gd-overview__content .card p { color: var(--gd-color-on-surface-variant); font-size: var(--gd-type-body-large-size); margin-top: 6px; line-height: 1.85; }
.gd-overview__content .card p.no-indent { text-indent: 0; }
.gd-overview__content .card a { word-break: break-all; }
.gd-overview__content ul { margin: 6px 0 8px; padding-left: 1.15em; list-style: none; }
.gd-overview__content ul li { position: relative; color: var(--gd-color-on-surface-variant); font-size: var(--gd-type-body-large-size); margin-bottom: 12px; line-height: 1.85; padding-left: .15em; }
.gd-overview__content ul li::before { content: ""; position: absolute; left: -1em; top: .72em; width: 5px; height: 5px; border-radius: 50%; background: var(--gd-color-primary); }
.gd-overview__content .gd-friend-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; justify-content: start; }
.gd-footer { padding-top: 32px; }
/* 手机端友链网格改单列，其余 gd-card 尺寸由组件库控制 */
@media (max-width: 640px) {
  .gd-overview__content .gd-friend-grid { grid-template-columns: 1fr; }
}
.gd-overview__redirect-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(8,10,20,.92); backdrop-filter: blur(16px); opacity: 0; pointer-events: none; transition: opacity .35s ease; }
.gd-overview__redirect-overlay.active { opacity: 1; pointer-events: auto; }
.gd-overview__redirect-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(251,191,36,.15); border-top-color: #fbbf24; animation: redirectSpin .8s linear infinite; margin-bottom: 32px; }
@keyframes redirectSpin { to { transform: rotate(360deg); } }
.gd-overview__redirect-text { font-size: 18px; font-weight: 600; color: var(--gd-color-on-surface); margin-bottom: 12px; }
.gd-overview__redirect-countdown { font-size: 48px; font-weight: 800; color: #fbbf24; }
.gd-overview__redirect-cancel { margin-top: 28px; padding: 10px 28px; border-radius: 999px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); color: var(--gd-color-on-surface-variant); font: inherit; font-size: 14px; cursor: pointer; }
.gd-overview__redirect-cancel:hover { color: var(--gd-color-on-surface); background: rgba(255,255,255,.08); }
.gd-hamburger-motion svg { display: block; width: 22px; height: 22px; position: absolute; transition: opacity .22s ease, transform .28s cubic-bezier(.4,0,.2,1); }
.gd-hamburger-motion .gd-hamburger-motion__menu { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) scale(1); }
.gd-hamburger-motion .gd-hamburger-motion__close { opacity: 0; transform: translate(-50%,-50%) rotate(-90deg) scale(.7); }
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__menu { opacity: 0; transform: translate(-50%,-50%) rotate(90deg) scale(.7); }
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__close { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) scale(1); }

</style>
</head>
<body class="gd-overview">
<div class="gd-groundback gd-groundback--blue" aria-hidden="true"></div>
<a class="gd-button gd-button--back gd-back-fab" href="https://galnavi.top/nav/" aria-label="返回主站">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  返回主站
</a>
<div class="gd-overview__chrome" aria-hidden="true"></div>
<div class="gd-overview__shell">
  <div class="gd-overview__layout">
    <div class="gd-overview__content">
      <div class="gd-overview-toc-mobile" data-extend-ui-toc>
        <button type="button" class="gd-overview-toc-mobile__btn gd-hamburger-motion" data-extend-ui-toc-toggle aria-expanded="false" aria-controls="aboutTocPanel" aria-label="打开本页索引">
          <svg class="gd-hamburger-motion__menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          <svg class="gd-hamburger-motion__close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="gd-overview-toc-mobile__panel" id="aboutTocPanel" data-extend-ui-toc-panel aria-hidden="true" hidden>
          <p class="gd-overview-mobile-list__label">本页内容</p>
          <nav class="gd-overview-mobile-list" aria-label="本页索引">
            <a class="gd-overview-mobile-list__link" href="#legend">起源传说</a>
            <a class="gd-overview-mobile-list__link" href="#history">发展史</a>
            <a class="gd-overview-mobile-list__link" href="#nap">纳普图片声明</a>
            <a class="gd-overview-mobile-list__link" href="#copyright">版权声明</a>
            <a class="gd-overview-mobile-list__link" href="#disclaimer">站点声明</a>
            <a class="gd-overview-mobile-list__link" href="#community">本站社群</a>
            <a class="gd-overview-mobile-list__link" href="#feedback">站点反馈</a>
          </nav>
        </div>
      </div>
      <h1 class="gd-brand__title gd-brand__title--shift gd-brand__title--demo">关于</h1>
      <p class="gd-overview__lede">了解 GALNAVI 资源中枢的起源传说、版权声明、站点声明与社群。</p>
      <div class="gd-overview__meta">
        <span class="gd-overview__tag">起源传说</span>
        <span class="gd-overview__tag">发展史</span>
        <span class="gd-overview__tag">版权声明</span>
        <span class="gd-overview__tag">站点声明</span>
        <span class="gd-overview__tag">本站社群</span>
        <span class="gd-overview__tag">站点反馈</span>
      </div>
      <div class="gd-overview__rule" aria-hidden="true"></div>
<section class="gd-section" id="legend">  <h2 class="gd-section__title">起源传说</h2><div class="card">
<p>这是一个科技与魔法的世界，在其中一个角落坐落着一个边缘小镇，很不幸，它正在遭遇一场史无前例的资源匮乏，通往各个幻想乡的道路连接中断，记录着爱与冒险的精神卷轴纷纷遗失。 就在居民们陷入水深火热时，一位披斗篷的猫耳娘站了出来。为了拯救小镇，她在荒野中日夜吟唱魔法，凭一己之力建立起了一座宏伟的灯塔——Galnavi 资源中枢。 此后，小镇的生活也是一天比一天好。人们为了纪念这位猫耳娘，在中央广场建立了荣誉雕像，并取名为猫耳娘纳普。</p>
</section>
<section class="gd-section" id="history">  <h2 class="gd-section__title">发展史</h2><table class="gd-table"><tbody>
<tr><th scope="row">2026.05.23</th><td>galnavi 的项目正式启动</td></tr>
<tr><th scope="row">2026.05.24</th><td>正式注册域名</td></tr>
<tr><th scope="row">2026.05.26</th><td>网页成功部署，开始构建 UI</td></tr>
<tr><th scope="row">2026.05.31</th><td>开始试运营</td></tr>
<tr><th scope="row">2026.06.14</th><td>搜索功能完成开发并开始公测</td></tr>
<tr><th scope="row">2026.06.23</th><td>全面转向 Cloudflare，加快响应速度</td></tr>
<tr><th scope="row">2026.06.26</th><td>完成开发并全面开放</td></tr>
<tr><th scope="row">2026.07.02</th><td>网页 UI 焕新</td></tr>
</tbody></table>
</section>
<section class="gd-section" id="nap">  <h2 class="gd-section__title">纳普图片声明</h2><div class="card"><ul><li>本站吉祥物及相关视觉形象为 GALNAVI 的品牌形象，仅限本站及经授权的用途使用。</li><li>未经许可，请勿擅自转载、修改、商用或用于其他项目。</li></ul></div></section>
<section class="gd-section" id="copyright">  <h2 class="gd-section__title">版权声明</h2><div class="card"><ul><li>本站尊重知识产权。本站展示的游戏名称、图片、简介等内容，其版权归原著作权人、开发商或发行商所有。</li><li>本站主要提供信息整理、站点导航及相关链接索引，不主张拥有第三方内容的版权。</li><li>如您认为本站展示的内容侵犯了您的合法权益，请联系我们并提供相关权利证明及具体内容。经核实后，本站将及时处理相关内容或链接。</li><li>本站不鼓励、不支持任何侵犯版权及其他违法行为。</li></ul></div></section>
<section class="gd-section" id="disclaimer">  <h2 class="gd-section__title">站点声明</h2><div class="card"><ul><li>GALNAVI 是一个 ACG、Galgame 相关的信息导航与站点聚合平台，主要提供站点收录、信息整理、标签分类及搜索服务。</li><li>本站收录的第三方网站、链接及其内容均由相应网站运营者负责，本站无法保证其内容的准确性、合法性、安全性或持续有效性。</li><li>访问第三方网站或使用其提供的内容前，请自行判断相关风险，并遵守所在地区的法律法规。</li><li>用户不得利用本站从事违法、侵权或其他不当活动。因用户访问或使用第三方网站及内容产生的相关责任，由用户自行承担。</li><li>本站有权根据实际情况调整收录内容及相关服务。</li></ul></div></section>
<section class="gd-section" id="community">  <h2 class="gd-section__title">本站社群</h2><div class="card"><ul><li>QQ群：416074347。</li><li>本群用于 GALNAVI 相关交流、反馈与 ACG/Galgame 内容讨论。</li><li>请文明交流，禁止广告、刷屏、引战及违法违规内容；分享第三方资源或链接时请注意版权与安全。</li><li>如有网站问题、收录建议或功能反馈，欢迎在群内提出。</li></ul></div></section>
<section class="gd-section" id="feedback">  <h2 class="gd-section__title">站点反馈</h2><div class="card"><p>如果你在使用 GALNAVI 时发现问题，欢迎向我们反馈。</p><ul><li><strong>网站问题</strong> — 页面异常、链接失效、显示错误等。</li><li><strong>收录建议</strong> — 推荐新的站点、工具或资源。</li><li><strong>内容问题</strong> — 信息错误、分类不当、描述需要修改。</li><li><strong>功能建议</strong> — 对网站功能或使用体验的建议。</li></ul><p>反馈时请尽量说明具体问题，并附上相关页面链接或截图，方便我们处理。</p><p>反馈邮箱：<a class="gd-link" href="mailto:feedback@galnavi.top">feedback@galnavi.top</a></p></div></section>
<div class="gd-overview__rule" aria-hidden="true"></div>
<footer class="gd-footer"><nav class="gd-footer__nav" aria-label="页脚链接"><a href="mailto:feedback@galnavi.top">联系站长</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="https://galnavi.top/nav/donate/">赞助本站</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="https://galnavi.top/nav/friend/">申请友链</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="https://galnavi.top/status/">站点状态</a></nav><p class="gd-footer__copy">© 2026 GALNAVI · 愿每一次探索都有新的收获</p></footer>
    </div>
<aside class="gd-overview__toc" aria-label="本页内容">
  <nav class="gd-otp" aria-label="本页索引">
    <p class="gd-otp__label">本页内容</p>
    <div class="gd-otp__list">
      <a class="gd-otp__link" href="#legend">起源传说</a>
      <a class="gd-otp__link" href="#history">发展史</a>
      <a class="gd-otp__link" href="#nap">纳普图片声明</a>
      <a class="gd-otp__link" href="#copyright">版权声明</a>
      <a class="gd-otp__link" href="#disclaimer">站点声明</a>
      <a class="gd-otp__link" href="#community">本站社群</a>
      <a class="gd-otp__link" href="#feedback">站点反馈</a>
    </div>
  </nav>
</aside>
  </div>
</div>
<div id="redirectOverlay" class="gd-overview__redirect-overlay" aria-live="polite" aria-atomic="true"><div class="gd-overview__redirect-ring" aria-hidden="true"></div><div class="gd-overview__redirect-text">即将跳转</div><div id="redirectCountdown" class="gd-overview__redirect-countdown">3</div><button type="button" id="redirectCancel" class="gd-overview__redirect-cancel">取消跳转</button></div>
<script>
(function() {
var root = document.querySelector('.gd-overview-toc-mobile');
var btn = root && root.querySelector('[data-extend-ui-toc-toggle]');
var panel = root && root.querySelector('[data-extend-ui-toc-panel]');
function setOpen(open) {
if (!root || !btn || !panel) return;
root.classList.toggle('is-open', open);
btn.setAttribute('aria-expanded', open ? 'true' : 'false');
btn.setAttribute('aria-label', open ? '关闭本页索引' : '打开本页索引');
panel.setAttribute('aria-hidden', String(!open));
if (!open) panel.setAttribute('hidden', '');
else panel.removeAttribute('hidden');
}
if (btn && panel) {
btn.addEventListener('click', function(e) { e.stopPropagation(); setOpen(!root.classList.contains('is-open')); });
document.addEventListener('click', function(e) {
if (root.classList.contains('is-open') && !root.contains(e.target)) setOpen(false);
});
}
var allLinks = Array.prototype.slice.call(document.querySelectorAll('.gd-otp__link[href^="#"], .gd-overview-mobile-list__link[href^="#"]'));
var sections = [];
allLinks.forEach(function(a) {
var id = a.getAttribute('href');
var el = id ? document.querySelector(id) : null;
if (el) sections.push({ link: a, el: el, id: id });
});
var activeId = null, clickLock = false, unlockTimer = null, ticking = false;
function setActive(id) {
if (!id || id === activeId) return;
activeId = id;
allLinks.forEach(function(a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
}
function pickFromScroll() {
if (!sections.length) return null;
var rootEl = document.documentElement;
var maxScroll = Math.max(0, rootEl.scrollHeight - window.innerHeight);
if (window.scrollY >= maxScroll - 24) return sections[sections.length - 1].id;
var marker = 120, current = sections[0].id;
for (var i = 0; i < sections.length; i++) {
if (sections[i].el.getBoundingClientRect().top <= marker) current = sections[i].id;
}
return current;
}
function syncActive() { if (clickLock) return; var id = pickFromScroll(); if (id) setActive(id); }
function requestSync() {
if (ticking || clickLock) return;
ticking = true;
requestAnimationFrame(function() { ticking = false; syncActive(); });
}
function unlockAfterNav() {
clearTimeout(unlockTimer);
function release() { clearTimeout(unlockTimer); clickLock = false; syncActive(); }
if ('onscrollend' in window) window.addEventListener('scrollend', release, { once: true });
unlockTimer = setTimeout(release, 1000);
}
allLinks.forEach(function(a) {
a.addEventListener('click', function(e) {
var id = a.getAttribute('href');
var target = id ? document.querySelector(id) : null;
if (!target) return;
e.preventDefault();
clickLock = true;
clearTimeout(unlockTimer);
setActive(id);
if (window.innerWidth <= 767) setOpen(false);
try { history.replaceState(null, '', id); } catch (err) {}
target.scrollIntoView({ behavior: 'smooth', block: 'start' });
unlockAfterNav();
});
});
if (sections.length) {
var hash = window.location.hash;
if (hash && sections.some(function(s) { return s.id === hash; })) setActive(hash);
else syncActive();
window.addEventListener('scroll', requestSync, { passive: true });
window.addEventListener('resize', requestSync);
}
})();
/* 外链跳转安全提示 */
(function(){
function isSafeHttpUrl(url){if(!url||typeof url!=="string")return false;try{var u=new URL(url,window.location.origin);return u.protocol==="http:"||u.protocol==="https:"}catch(e){return false}}
var timerId=null,onCancel=null;
function clearRedirect(){if(timerId){clearInterval(timerId);timerId=null}var overlay=document.getElementById("redirectOverlay"),cancelBtn=document.getElementById("redirectCancel");if(overlay){overlay.classList.remove("active");overlay.setAttribute("aria-hidden","true")}if(onCancel&&cancelBtn){cancelBtn.removeEventListener("click",onCancel);onCancel=null}}
function startRedirect(targetUrl){var overlay=document.getElementById("redirectOverlay"),countdownEl=document.getElementById("redirectCountdown"),cancelBtn=document.getElementById("redirectCancel");if(!overlay||!countdownEl){window.open(targetUrl,"_blank","noopener,noreferrer");return}clearRedirect();var seconds=3;overlay.classList.add("active");overlay.setAttribute("aria-hidden","false");countdownEl.textContent=String(seconds);timerId=setInterval(function(){seconds-=1;if(seconds<=0){clearRedirect();window.open(targetUrl,"_blank","noopener,noreferrer");return}countdownEl.textContent=String(seconds);},1000);onCancel=function(){clearRedirect()};if(cancelBtn)cancelBtn.addEventListener("click",onCancel);}
document.addEventListener("click",function(e){var anchor=e.target.closest("a");if(!anchor)return;var href=anchor.getAttribute("href");if(!href)return;var lower=href.trim().toLowerCase();if(lower.indexOf("javascript:")===0||lower.indexOf("data:")===0){e.preventDefault();return}if(href.charAt(0)==="#")return;if(href.indexOf("https://galnavi.top/nav/")===0||href.indexOf("/nav/")===0)return;if(!isSafeHttpUrl(href))return;try{if(new URL(href,window.location.origin).hostname===window.location.hostname)return}catch(err){return}e.preventDefault();startRedirect(href);});
})();
<\/script>
</body>
</html>`;
}
