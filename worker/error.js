/**
 * Cloudflare Worker - error（路由兜底分发）
 * 路由: *galnavi.top/* 的未匹配路径（由路由配置兜底到此 Worker）
 *
 * 行为：
 *  - 运行时拉取 index 的 sitemap.xml 生成白名单 → service binding 转发到对应 Worker，原样返回。
 *  - 未命中 → 返回 404 错误页。本页不设置任何 cookie，无首访检测，无外链跳转层。
 *
 * 构建：由 temp/build-error.mjs 生成（内联组件 tokens/groundback/gd-publish-card）。
 */

const SECURITY_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://galnavi.top; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
};
const fallbackHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#1c2a48">
<title>GALNAVI · 你是不走错地方了</title>
<meta name="description" content="这个地址没有对应页面。回到 GALNAVI，继续搜索 Galgame、ACG 二次元站点、汉化补丁和模拟器工具。">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://galnavi.top/">
<link rel="icon" href="https://assets.galnavi.top/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="https://assets.galnavi.top/icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_CN">
<meta property="og:title" content="GALNAVI · 你是不走错地方了">
<meta property="og:description" content="这个地址没有对应页面。回到 GALNAVI，继续搜索 Galgame、ACG 二次元站点、汉化补丁和模拟器工具。">
<meta property="og:url" content="https://galnavi.top/">
<meta property="og:site_name" content="GALNAVI">
<meta property="og:image" content="https://assets.galnavi.top/icon.png">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="GALNAVI · 你是不走错地方了">
<meta name="twitter:description" content="这个地址没有对应页面。回到 GALNAVI，继续搜索 Galgame、ACG 二次元站点、汉化补丁和模拟器工具。">
<meta name="twitter:image" content="https://assets.galnavi.top/icon.png">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","name":"GALNAVI · 你是不走错地方了","url":"https://galnavi.top/","description":"这个地址没有对应页面。回到 GALNAVI，继续搜索 Galgame、ACG 二次元站点、汉化补丁和模拟器工具。","isPartOf":{"@type":"WebSite","name":"GALNAVI","url":"https://galnavi.top/"}}
</script>
<style>
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
  --gd-color-on-surface: #f4f7ff;
  --gd-color-on-surface-variant: #93a4c8;
  --gd-color-on-surface-subtle: #aeb9d6;
  --gd-color-outline: #1e2a45;
  --gd-color-error: #f87171;

  /* 链接色：静止蓝 #7aa2f7 → hover 深蓝 #9ec0ff */
  --gd-color-link: #7aa2f7;
  --gd-color-link-hover: #9ec0ff;

  /* 强调色（图标/装饰用浅紫） */
  --gd-color-accent-light: #a78bfa;

  /* RGB 通道（供 rgba(var(--gd-x-rgb), a) 组合透明度层级） */
  --gd-color-primary-rgb: 79, 124, 255;
  --gd-color-secondary-rgb: 168, 85, 247;
  --gd-color-accent-rgb: 139, 92, 246;
  --gd-color-sky-rgb: 56, 189, 248;
  --gd-color-sky-blue-rgb: 96, 165, 250;
  --gd-color-blue-rgb: 59, 130, 246;
  --gd-color-blue-deep-rgb: 37, 99, 235;
  --gd-color-indigo-rgb: 91, 141, 239;
  --gd-color-gold-rgb: 251, 191, 36;
  --gd-color-gold-deep-rgb: 245, 158, 11;
  --gd-color-error-rgb: 239, 68, 68;
  --gd-color-green-rgb: 34, 197, 94;
  --gd-color-green-light-rgb: 134, 239, 172;
  --gd-color-white-rgb: 255, 255, 255;
  --gd-color-muted-white-rgb: 232, 238, 255;
  --gd-color-grey-rgb: 139, 156, 192;

  /* 深色层级（遮罩/浮层/卡片渐变底） */
  --gd-color-navy-rgb: 8, 12, 24;
  --gd-color-navy-deep-rgb: 6, 10, 20;
  --gd-color-navy-panel-rgb: 8, 10, 20;
  --gd-color-navy-card-rgb: 22, 28, 48;
  --gd-color-navy-card-deep-rgb: 12, 16, 28;
  --gd-color-ink-rgb: 20, 30, 56;
  --gd-color-ink-2-rgb: 38, 54, 94;
  --gd-color-ink-3-rgb: 12, 18, 36;
  --gd-color-ink-4-rgb: 24, 34, 65;
  --gd-color-outline-blue-rgb: 126, 153, 255;

  /* 语义层级便捷变量 */
  --gd-color-overlay: rgba(var(--gd-color-navy-deep-rgb), 0.88);
  --gd-color-overlay-strong: rgba(var(--gd-color-navy-panel-rgb), 0.92);
  --gd-color-overlay-float: rgba(var(--gd-color-navy-rgb), 0.95);
  --gd-color-card-gradient-a: rgba(var(--gd-color-navy-card-rgb), 0.96);
  --gd-color-card-gradient-b: rgba(var(--gd-color-navy-card-deep-rgb), 0.98);
  --gd-color-border-hover: rgba(var(--gd-color-sky-rgb), 0.28);
  --gd-color-border-accent: rgba(var(--gd-color-accent-rgb), 0.22);
  --gd-color-demo-dash: rgba(var(--gd-color-grey-rgb), 0.45);

  /* 补充语义色 */
  --gd-color-success: #86efac;
  --gd-color-error-light: #fca5a5;
  --gd-color-sky: #38bdf8;
  --gd-color-blue: #3b82f6;
  --gd-color-blue-deep: #2563eb;
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
  --gd-shape-corner-extra-small: 8px;
  --gd-shape-corner-small: 14px;
  --gd-shape-corner-medium: 18px;
  --gd-shape-corner-large: 20px;
  --gd-shape-corner-full: 9999px;

  /* Type — 角色名 MD3；字号贴近现网 */
  --gd-type-display-small-size: 36px;
  --gd-type-display-medium-size: 48px;
  --gd-type-headline-small-size: 24px;
  --gd-type-title-large-size: 22px;
  --gd-type-title-medium-size: 16px;
  --gd-type-title-medium-line: 1.4;
  --gd-type-title-small-size: 15px;
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
  --gd-state-disabled: 0.38;

  /* Motion（MD3 short/medium + easing） */
  --gd-motion-duration-short4: 200ms;
  --gd-motion-duration-medium1: 250ms;
  --gd-motion-duration-medium2: 300ms;
  --gd-motion-duration-medium4: 400ms;
  --gd-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --gd-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);

  /* Layout */
  --gd-nav-height: 64px;
  --gd-layout-max-width: 1200px;
  --gd-space-2: 8px;
  --gd-space-6: 24px;
  --gd-touch-target: 48px;

  /* 玻璃 — 冻结现网数值，禁止借「整理」改 blur/透明度 */
  --gd-glass-bg: rgba(18, 22, 40, 0.42);
  --gd-glass-bg-hover: rgba(22, 28, 48, 0.52);
  --gd-glass-blur: blur(18px) saturate(165%);
  --gd-glass-border: rgba(255, 255, 255, 0.14);
  --gd-glass-nav-bg: rgba(8, 12, 24, 0.75);
  --gd-glass-nav-blur: blur(20px) saturate(180%);
  --gd-chrome-bar-bg: rgba(18, 22, 40, 0.92);
}

/* ===== src/foundation/accessibility/gd-a11y.css ===== */
/* gd-a11y — Windows 高对比模式：边框与图标可见 */

@media (forced-colors: active) {
  .gd-card,
  .gd-navbar,
  .gd-navbar-drawer,
  .gd-cat-dock,
  .gd-modal,
  .gd-button,
  .gd-search__input,
  .gd-search__clear,
  .gd-search__help,
  .gd-tag,
  .gd-orb__toggle,
  .gd-orb__item,
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
  .gd-brand__title {
    background: none;
    -webkit-text-fill-color: CanvasText;
    color: CanvasText;
  }
  .gd-card__icon img,
  .gd-navbar__logo-img,
  .gd-hero__arrow svg,
  .gd-search__icon svg,
  .gd-navbar__nsfw svg,
  .gd-navbar-drawer__nsfw svg {
    forced-color-adjust: none;
  }
}

/* ===== src/foundation/layout/gd-groundback.css ===== */
/* gd-groundback：页面背景层
   用法：<div class="gd-groundback gd-groundback--websearch" aria-hidden="true"></div>
   变体：--blue（点阵） / --websearch（线条模糊，除殿堂外全站） / --gold（殿堂）
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

/* 殿堂金：深色底 + 金色光晕 + 与全站同款线条模糊 */
.gd-groundback--gold {
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(145deg, #06070e 0%, #0a0c16 48%, #0e1322 100%);
}

.gd-groundback--gold::before {
  background:
    radial-gradient(40% 35% at 18% 14%, rgba(var(--gd-color-gold-rgb), 0.12), transparent 70%),
    radial-gradient(36% 32% at 86% 82%, rgba(var(--gd-color-error-rgb), 0.10), transparent 70%);
}

.gd-groundback--gold::after {
  inset: -24px;
  background-image: url("https://assets.galnavi.top/%E7%BA%BF%E6%9D%A1%E5%9B%BE%E6%A1%88.png");
  background-repeat: repeat;
  background-position: 0 0;
  background-size: auto;
  opacity: 0.16;
  mix-blend-mode: screen;
  filter: blur(10.8px);
}

/* websearch：主站蓝底 + 线条图案平铺；screen 去掉 PNG 黑底 */
.gd-groundback--websearch {
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(circle at 22% 18%, rgba(var(--gd-color-blue-rgb), 0.2), transparent 34%),
    radial-gradient(circle at 78% 76%, rgba(var(--gd-color-cyan-rgb), 0.14), transparent 32%),
    radial-gradient(circle at 50% 50%, rgba(var(--gd-color-secondary-rgb), 0.06), transparent 52%),
    linear-gradient(145deg, var(--gd-color-background) 0%, var(--gd-color-surface) 45%, var(--gd-color-surface-variant) 100%);
}

.gd-groundback--websearch::before {
  inset: -24px;
  background-image: url("https://assets.galnavi.top/%E7%BA%BF%E6%9D%A1%E5%9B%BE%E6%A1%88.png");
  background-repeat: repeat;
  background-position: 0 0;
  background-size: auto;
  opacity: 0.16;
  mix-blend-mode: screen;
  filter: blur(10.8px);
  -webkit-mask-image: none;
  mask-image: none;
}

.gd-groundback--websearch::after {
  background:
    linear-gradient(90deg, transparent, rgba(var(--gd-color-white-rgb), 0.028), transparent),
    radial-gradient(circle at 50% 110%, rgba(var(--gd-color-blue-rgb), 0.12), transparent 36%);
}

/* prefers-reduced-motion：背景静态无动画，无额外处理 */

/* ===== src/feedback/modal/gd-publish-card.css ===== */
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

/* 404 页布局（发布页同款 .page，仅定位用） */
html {
  height: 100%;
  background-color: var(--gd-color-background);
  background-attachment: fixed !important;
  -webkit-font-smoothing: antialiased;
}
body {
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0;
  display: flex;
  flex-direction: column;
  background: transparent !important;
  font-family: var(--gd-font-sans);
  color: var(--gd-color-on-surface);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
.page {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.gd-footer {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  margin-top: auto;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  padding: 28px 16px 40px;
  color: rgba(var(--gd-color-muted-white-rgb), 0.62);
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
  line-height: 1.5;
  padding: 4px 8px;
  min-height: 24px;
}
.gd-footer__nav a:hover { color: var(--gd-color-link-hover); }
.gd-footer__nav a:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-footer__sep { color: rgba(var(--gd-color-muted-white-rgb), 0.28); user-select: none; font-size: var(--gd-type-label-medium-size); }
.gd-footer__copy { margin: 0; }
.page .gd-publish-card {
  width: min(100%, 480px);
  margin: 0;
  max-height: none;
}
.gd-publish-card__wordmark-404 {
  margin: 0;
  font-size: clamp(72px, 24vw, 96px);
  line-height: 1.1;
  letter-spacing: 0.04em;
  font-weight: var(--gd-weight-black);
  color: var(--gd-color-on-surface);
}
.gd-publish-card__title-404 {
  font-weight: var(--gd-weight-bold);
  color: var(--gd-color-on-surface);
}
.gd-publish-card__path {
  display: block;
  margin-top: 6px;
  word-break: break-all;
  color: var(--gd-color-on-surface-subtle);
}
.gd-publish-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
<style>
/* gd-orb */
.gd-orb{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(20px,env(safe-area-inset-bottom,0px));z-index:80;width:56px;height:56px;pointer-events:none}
.gd-orb:not(.is-placed){visibility:hidden}
.gd-orb__menu{position:absolute;right:0;bottom:66px;display:flex;flex-direction:column;align-items:stretch;gap:8px;margin:0;padding:0;transform-origin:100% 100%;opacity:1;visibility:hidden;pointer-events:none;transform:translateY(18px) scale(0.72);transition:transform 0.32s cubic-bezier(0.22,1,0.36,1),visibility 0s linear 0.32s}
.gd-orb.is-open .gd-orb__menu{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:transform 0.32s cubic-bezier(0.22,1,0.36,1),visibility 0s linear 0s}
.gd-orb__item{display:inline-flex;align-items:center;justify-content:flex-start;gap:8px;box-sizing:border-box;min-height:48px;min-width:120px;padding:0 16px;border-radius:999px;border:1px solid rgba(var(--gd-color-primary-rgb),0.28);background:var(--gd-color-surface);color:var(--gd-color-on-surface);font-family:var(--gd-font-sans);font-size:var(--gd-type-label-large-size);font-weight:var(--gd-weight-semibold);letter-spacing:var(--gd-type-letter-spacing-wide);text-decoration:none;cursor:pointer;appearance:none;-webkit-appearance:none;white-space:nowrap;opacity:1;transform:translateY(12px) scale(0.88);transition:transform 0.28s cubic-bezier(0.22,1,0.36,1)}
.gd-orb.is-open .gd-orb__item{opacity:1;transform:none}
.gd-orb.is-open .gd-orb__item:nth-child(1){transition-delay:0.04s}
.gd-orb.is-open .gd-orb__item:nth-child(2){transition-delay:0.08s}
.gd-orb.is-open .gd-orb__item:nth-child(3){transition-delay:0.12s}
.gd-orb.is-open .gd-orb__item:nth-child(4){transition-delay:0.16s}
.gd-orb:not(.is-open) .gd-orb__item:nth-child(1){transition-delay:0.12s}
.gd-orb:not(.is-open) .gd-orb__item:nth-child(2){transition-delay:0.08s}
.gd-orb:not(.is-open) .gd-orb__item:nth-child(3){transition-delay:0.04s}
.gd-orb:not(.is-open) .gd-orb__item:nth-child(4){transition-delay:0s}
.gd-orb__item:hover,.gd-orb__item:active{color:var(--gd-color-on-surface);background:var(--gd-color-surface);border-color:rgba(var(--gd-color-primary-rgb),0.45);filter:brightness(1.08);opacity:1}
.gd-orb__item:focus-visible{outline:2px solid var(--gd-color-primary);outline-offset:2px}
.gd-orb__toggle{pointer-events:auto;position:absolute;right:0;bottom:0;width:56px;height:56px;min-width:56px;min-height:56px;padding:0;border:1px solid rgba(var(--gd-color-primary-rgb),0.32);border-radius:50%;background:var(--gd-color-primary);color:var(--gd-color-on-primary);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;appearance:none;-webkit-appearance:none}
.gd-orb.is-dragging .gd-orb__toggle{cursor:grabbing}
.gd-orb.is-menu-down .gd-orb__menu{bottom:auto;top:66px;transform-origin:100% 0%}
.gd-orb.is-menu-right .gd-orb__menu{right:auto;left:0;transform-origin:0% 100%}
.gd-orb.is-menu-down.is-menu-right .gd-orb__menu{transform-origin:0% 0%}
.gd-orb__toggle:hover,.gd-orb__toggle:active{filter:brightness(1.08);opacity:1;background:var(--gd-color-primary)}
.gd-orb__toggle:focus-visible{outline:2px solid var(--gd-color-primary);outline-offset:3px}
.gd-orb__icon{display:block;width:22px;height:22px;position:absolute;top:50%;left:50%;margin:0;transition:transform 0.28s cubic-bezier(0.4,0,0.2,1)}
.gd-orb__icon--grid{opacity:1;transform:translate(-50%,-50%) rotate(0deg) scale(1)}
.gd-orb__icon--close{opacity:0;transform:translate(-50%,-50%) rotate(-90deg) scale(0.7)}
.gd-orb.is-open .gd-orb__icon--grid{opacity:0;transform:translate(-50%,-50%) rotate(90deg) scale(0.7)}
.gd-orb.is-open .gd-orb__icon--close{opacity:1;transform:translate(-50%,-50%) rotate(0deg) scale(1)}
@media(prefers-reduced-motion:reduce){
  .gd-orb__menu,.gd-orb__item,.gd-orb__icon{transition:none}
  .gd-orb__menu{transform:none}
  .gd-orb.is-open .gd-orb__menu{transform:none}
  .gd-orb__item{transform:none;opacity:1}
  
  .gd-orb__icon--grid,.gd-orb.is-open .gd-orb__icon--close{transform:translate(-50%,-50%) rotate(0deg) scale(1)}
  .gd-orb__icon--close,.gd-orb.is-open .gd-orb__icon--grid{transform:translate(-50%,-50%) rotate(0deg) scale(0.7)}
}
</style>
</head>
<body>
<div class="gd-groundback gd-groundback--websearch" aria-hidden="true"></div>
<main class="page" id="main" aria-label="404 页面不存在">
<div class="gd-publish-card is-demo">
<header class="gd-publish-card__header">
<div class="gd-publish-card__brand">
<div class="gd-publish-card__wordmark-404" aria-hidden="true">404</div>
</div>
<h1 class="gd-publish-card__lead gd-publish-card__title-404">你是不走错地方了</h1>
<p class="gd-publish-card__lead gd-publish-card__path">你要访问的网址不存在或已被移除。\${path}</p>
</header>
<footer class="gd-publish-card__footer">
<a class="gd-publish-card__action" href="https://galnavi.top/nav/" aria-label="返回主站">进入主站</a>
</footer>
</div>
</main>
<footer class="gd-footer" role="contentinfo">
<nav class="gd-footer__nav" aria-label="页脚导航">
<a href="https://galnavi.top/nav/">主站首页</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="https://galnavi.top/nav/help/">帮助文档</a>
<span class="gd-footer__sep" aria-hidden="true">|</span>
<a href="https://galnavi.top/nav/about/">关于本站</a>
<span class="gd-footer__sep" aria-hidden="true">|</span>
<a href="https://galnavi.top/nav/about/#friend">友情链接</a>
<span class="gd-footer__sep" aria-hidden="true">|</span>
<a href="https://galnavi.top/nav/about/#feedback">联系站长</a>

</nav>
<p class="gd-footer__copy">© 2026 GALNAVI · 愿每一次探索都有新的收获</p>
</footer>
<div class="gd-orb" id="gdOrb">
  <div class="gd-orb__menu" id="gdOrbMenu" role="region" aria-label="快捷入口">
    <a class="gd-orb__item" href="https://galnavi.top/nav/?cat=标签">🏷️ 标签</a>
    <a class="gd-orb__item" href="https://galnavi.top/nav/?welcome=1">💬 弹窗</a>
    <a class="gd-orb__item" href="https://github.com/argb6/gal-navigation" target="_blank" rel="noopener noreferrer">📦 仓库</a>
    <a class="gd-orb__item" href="https://galnavi.top/nav/palace/" target="_blank" rel="noopener noreferrer">🏛️ 殿堂</a>
  </div>
  <button type="button" class="gd-orb__toggle" id="gdOrbToggle" aria-expanded="false" aria-controls="gdOrbMenu" aria-label="打开快捷入口">
    <svg class="gd-orb__icon gd-orb__icon--grid" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path fill="currentColor" d="M12 2.2 14.9 8.7 22 9.4 16.7 14.1 18.2 21.1 12 17.5 5.8 21.1 7.3 14.1 2 9.4 9.1 8.7Z"/></svg>
    <svg class="gd-orb__icon gd-orb__icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" focusable="false" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>
</div>
<script>
(function(){
  var root=document.getElementById('gdOrb');
  var toggle=document.getElementById('gdOrbToggle');
  var menu=document.getElementById('gdOrbMenu');
  if(!root||!toggle||!menu)return;
  function setOpen(open){
    root.classList.toggle('is-open',open);
    toggle.setAttribute('aria-expanded',open?'true':'false');
    toggle.setAttribute('aria-label',open?'关闭快捷入口':'打开快捷入口');
    menu.setAttribute('aria-hidden',open?'false':'true');
    menu.inert=!open;
  }
  menu.inert=true;
  menu.setAttribute('aria-hidden','true');
  var POS_KEY='galnavi-orb-pos';
  var dragging=false,moved=false,suppressClick=false,startX=0,startY=0,originL=0,originT=0;
  function dragClamp(left,top){
    var edge=8,s=56;
    var maxL=Math.max(edge,window.innerWidth-s-edge);
    var minT=edge;
    var ceiling=window.innerHeight-s-edge;
    var below=document.getElementById('belowNav')||document.querySelector('.gd-below-nav');
    if(below){
      var bb=below.getBoundingClientRect().bottom;
      if(bb>0&&bb<ceiling)minT=Math.max(edge,Math.ceil(bb));
    }else{
      var nav=document.getElementById('mainNav')||document.querySelector('.gd-navbar');
      if(nav){
        var nb=nav.getBoundingClientRect().bottom;
        if(nb>0&&nb<ceiling)minT=Math.max(edge,Math.ceil(nb));
      }
    }
    var maxT=Math.max(minT,ceiling);
    return{left:Math.min(Math.max(edge,left),maxL),top:Math.min(Math.max(minT,top),maxT)};
  }
  function screenClamp(left,top){
    var edge=8,s=56;
    var maxL=Math.max(edge,window.innerWidth-s-edge);
    var maxT=Math.max(edge,window.innerHeight-s-edge);
    return{left:Math.min(Math.max(edge,left),maxL),top:Math.min(Math.max(edge,top),maxT)};
  }
  function offsetsOf(left,top){
    return{right:Math.round(window.innerWidth-(left+56)),bottom:Math.round(window.innerHeight-(top+56))};
  }
  function pointOf(saved){
    return screenClamp(window.innerWidth-saved.right-56,window.innerHeight-saved.bottom-56);
  }
  function writePos(left,top){
    try{localStorage.setItem(POS_KEY,JSON.stringify(offsetsOf(left,top)));}catch(err){}
  }
  function placeMenu(){
    var rect=root.getBoundingClientRect();
    var menuW=menu.offsetWidth||160;
    var menuH=menu.offsetHeight||220;
    var need=menuH+10;
    root.classList.toggle('is-menu-down',rect.top<need&&(window.innerHeight-rect.bottom)>rect.top);
    root.classList.toggle('is-menu-right',rect.right<menuW+8&&(window.innerWidth-rect.left)>rect.right);
  }
  function place(left,top){
    var p=dragClamp(left,top);
    root.style.left=p.left+'px';
    root.style.top=p.top+'px';
    root.style.right='auto';
    root.style.bottom='auto';
    placeMenu();
    return p;
  }
  function showAt(left,top){
    root.style.left=left+'px';
    root.style.top=top+'px';
    root.style.right='auto';
    root.style.bottom='auto';
    root.classList.add('is-placed');
    placeMenu();
  }
  function restore(){
    var shown=false;
    try{
      var raw=localStorage.getItem(POS_KEY);
      if(raw){
        var p=JSON.parse(raw);
        if(p&&typeof p.right==='number'&&typeof p.bottom==='number'){
          var xy=pointOf(p);
          showAt(xy.left,xy.top);
          shown=true;
        }else if(p&&typeof p.left==='number'&&typeof p.top==='number'){
          var old=screenClamp(p.left,p.top);
          writePos(old.left,old.top);
          showAt(old.left,old.top);
          shown=true;
        }
      }
    }catch(err){}
    if(!shown)root.classList.add('is-placed');
    placeMenu();
  }
  toggle.addEventListener('pointerdown',function(e){
    if(e.button!=null&&e.button!==0)return;
    dragging=true;moved=false;
    var rect=root.getBoundingClientRect();
    startX=e.clientX;startY=e.clientY;originL=rect.left;originT=rect.top;
    try{toggle.setPointerCapture(e.pointerId);}catch(err){}
  });
  toggle.addEventListener('pointermove',function(e){
    if(!dragging)return;
    var dx=e.clientX-startX,dy=e.clientY-startY;
    if(!moved&&(dx*dx+dy*dy)<36)return;
    if(!moved){moved=true;root.classList.add('is-dragging');}
    place(originL+dx,originT+dy);
  });
  function endDrag(e){
    if(!dragging)return;
    dragging=false;
    root.classList.remove('is-dragging');
    if(moved){
      suppressClick=true;
      var rect=root.getBoundingClientRect();
      var saved=dragClamp(rect.left,rect.top);
      writePos(saved.left,saved.top);
    }
    try{if(e&&toggle.hasPointerCapture(e.pointerId))toggle.releasePointerCapture(e.pointerId);}catch(err){}
  }
  toggle.addEventListener('pointerup',endDrag);
  toggle.addEventListener('pointercancel',endDrag);
  toggle.addEventListener('click',function(e){
    e.stopPropagation();
    if(suppressClick){suppressClick=false;e.preventDefault();return;}
    setOpen(!root.classList.contains('is-open'));
    placeMenu();
  });
  window.addEventListener('resize',function(){restore();});
  restore();
  document.addEventListener('click',function(e){
    if(root.classList.contains('is-open')&&!root.contains(e.target))setOpen(false);
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&root.classList.contains('is-open')){setOpen(false);toggle.focus();}
  });
})();
</script>
</body>
</html>`;

/* 动态路由：路径 -> service
   规则（与线上 actual Worker 命名一致）：
     /                    -> index
     /nav/                -> websearch
     /nav/<name>/         -> <name>（同 slug 的 service binding，缺绑定则 404）
     /robots.txt|/sitemap.xml|/favicon.ico -> index
     /nav/api/*           -> websearch
   sitemap.xml 由 index Worker 动态生成，本页运行时通过 index binding 拉取，
   白名单随 sitemap 变更自动更新；拉取失败或未部署时回退静态默认表。 */
const SITEMAP_TTL_MS = 300_000;
const SITEMAP_URL = "https://galnavi.top/sitemap.xml";

const DEFAULT_ROUTES = {
  "/": "index",
  "/robots.txt": "index",
  "/sitemap.xml": "index",
  "/favicon.ico": "index",
  "/YOUR_INDEXNOW_KEY.txt": "index",
  "/indexnow": "index",
  "/nav/": "websearch",
  "/nav/detail/": "detail",
  "/nav/about/": "about",
  "/nav/help/": "help",
  "/nav/palace/": "palace",
};
const API_PREFIX = "/nav/api/";

let sitemapCache = { routes: null, ts: 0 };

function deriveRoutes(xml) {
  const routes = {};
  const re = /<loc[^>]*>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    let path;
    try {
      path = new URL(m[1].trim()).pathname;
    } catch {
      continue;
    }
    if (path === "/") {
      routes[path] = "index";
      continue;
    }
    if (path === "/robots.txt" || path === "/sitemap.xml" || path === "/favicon.ico") {
      routes[path] = "index";
      continue;
    }
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "nav" && parts.length === 2) {
      routes[path] = parts[1];
    }
  }
  return routes;
}

async function loadRoutes(env) {
  const now = Date.now();
  if (sitemapCache.routes && now - sitemapCache.ts < SITEMAP_TTL_MS) {
    return sitemapCache.routes;
  }
  const fallbackRoutes = { ...DEFAULT_ROUTES };
  if (env && env.index) {
    try {
      const resp = await env.index.fetch(new Request(SITEMAP_URL));
      if (resp.ok) {
        const xml = await resp.text();
        const derived = deriveRoutes(xml);
        if (Object.keys(derived).length > 0) {
          const routes = { ...DEFAULT_ROUTES, ...derived };
          sitemapCache = { routes, ts: now };
          return routes;
        }
      }
    } catch {
      /* sitemap 拉取失败则用默认路由 */
    }
  }
  sitemapCache = { routes: fallbackRoutes, ts: now };
  return fallbackRoutes;
}

async function resolveService(path, env) {
  const routes = await loadRoutes(env);
  if (routes[path]) return routes[path];
  if (path.startsWith(API_PREFIX)) return "websearch";
  return null;
}

function render404(path) {
  return fallbackHtml.replace("${path}", path);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const service = await resolveService(path, env);
    if (service) {
      const target = env[service];
      if (!target) {
        return new Response(render404(path), {
          status: 404,
          headers: SECURITY_HEADERS,
        });
      }
      return target.fetch(request);
    }

    return new Response(render404(path), {
      status: 404,
      headers: SECURITY_HEADERS,
    });
  },
};
