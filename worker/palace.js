/**
 * Cloudflare Worker - palace.js
 * 路由: /nav/palace/
 * 圣器殿堂 —— 神器、魔器、仙器总览
 *
 * 数据来源: Cloudflare D1（绑定名 group1），纯查询，无硬编码 fallback。
 * 原版备份: shenmo.js.bak
 */
const SECURITY_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://galnavi.top; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 若路由同时绑了无尾斜杠，统一到 /nav/palace/
    if (url.pathname === "/nav/palace") {
      url.pathname = "/nav/palace/";
      return Response.redirect(url.toString(), 301);
    }

    let data = [];
    let fetchFailed = false;

    if (env && env.group1) {
      try {
        const { results } = await env.group1.prepare(
          "SELECT * FROM resources ORDER BY category, id"
        ).all();
        data = results || [];
      } catch {
        data = [];
        fetchFailed = true;
      }
    }

    const html = renderPage(data, fetchFailed);
    return new Response(html, {
      status: fetchFailed ? 503 : 200,
      headers: SECURITY_HEADERS,
    });
  },
};

function renderPage(data, fetchFailed) {
  const bootJson = JSON.stringify({ data: data || [], failed: !!fetchFailed }).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>圣器殿堂</title>
<meta name="description" content="GALNAVI 圣器殿堂 —— 神器、魔器、仙器总览。">
<meta name="keywords" content="GALNAVI, 圣器殿堂, 神器, 魔器, 仙器, ACG, Galgame, 导航">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://galnavi.top/nav/palace/">
<link rel="icon" href="https://assets.galnavi.top/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="https://assets.galnavi.top/icon.png">
<link rel="sitemap" type="application/xml" title="Sitemap" href="https://galnavi.top/sitemap.xml">
<meta property="og:type" content="website">
<meta property="og:title" content="圣器殿堂 · GALNAVI">
<meta property="og:description" content="GALNAVI 圣器殿堂 —— 神器、魔器、仙器总览。">
<meta property="og:url" content="https://galnavi.top/nav/palace/">
<meta property="og:site_name" content="GALNAVI">
<meta property="og:image" content="https://assets.galnavi.top/icon.png">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="圣器殿堂 · GALNAVI">
<meta name="twitter:description" content="GALNAVI 圣器殿堂 —— 神器、魔器、仙器总览。">
<meta name="twitter:image" content="https://assets.galnavi.top/icon.png">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","name":"圣器殿堂 · GALNAVI","url":"https://galnavi.top/nav/palace/","description":"GALNAVI 圣器殿堂 —— 神器、魔器、仙器总览。","isPartOf":{"@type":"WebSite","name":"GALNAVI","url":"https://galnavi.top/"}}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
/* ===== 组件库内联: src/foundation/tokens/tokens.css ===== */
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

/* ===== 组件库内联: src/foundation/actions/gd-button.css ===== */
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

/* ===== 组件库内联: src/foundation/layout/gd-groundback.css ===== */
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

/* prefers-reduced-motion：背景静态无动画，无额外处理 */

/* ===== 组件库内联: src/foundation/brand/gd-brand.css ===== */
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


  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #1c2a48; --border: rgba(255,255,255,.1); --text: #f4f7ff; --muted: rgba(232,238,255,.58);
    --subtle: rgba(232,238,255,.38); --accent: #60a5fa; --cyan: #22d3ee; --gold: #fbbf24; --red: #ef4444;
    --emerald: #10b981; --radius: 16px; --ease: cubic-bezier(.22,1,.36,1);
  }
  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-behavior: smooth; scrollbar-width: none; scrollbar-color: transparent transparent; }
  body { scrollbar-width: none; scrollbar-color: transparent transparent; }
  html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
  html::-webkit-scrollbar-track, body::-webkit-scrollbar-track, html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: transparent; }
  body {
    min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; font-family: "Noto Sans SC","Outfit",sans-serif; color: var(--text); -webkit-font-smoothing: antialiased; overflow-x: hidden;
    background: transparent;
  }
  .gd-groundback { z-index: 0; }
  body::before, body::after { display: none; }
  .glow { display:none!important; position: fixed; z-index: 0; width: 520px; height: 520px; border-radius: 999px; filter: blur(118px); opacity: .3; pointer-events: none; will-change: transform,opacity; --gx: 0; --gy: 0; --gdx: 8%; --gdy: 6%; --go1: .28; --go2: .38; --gs: 1.08; animation: glowPulse 11s ease-in-out infinite; }
  .glow.one { top: -210px; left: -140px; background: #f59e0b; }
  .glow.two { right: -170px; bottom: -220px; background: #ef4444; --gdx: -7%; --gdy: -9%; --go1: .24; --go2: .34; --gs: 1.1; animation-duration: 13s; animation-delay: -5s; }
  .glow.three { top: 48%; left: 50%; width: 400px; height: 400px; background: #8b5cf6; opacity: .14; --gx: -50%; --gy: -50%; --gdx: 4%; --gdy: -4%; --go1: .12; --go2: .2; --gs: 1.12; animation-duration: 15s; animation-delay: -2.5s; }
  .particles { display:none!important; position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .particle { position: absolute; bottom: -12px; border-radius: 50%; opacity: 0; animation: particleFloat linear infinite; will-change: transform,opacity; }
  @keyframes auraDrift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(2.5%,-1.8%) scale(1.05); } }
  @keyframes lightFlow { 0% { background-position: 120% 40%,0 0; opacity: .5; } 50% { opacity: .85; } 100% { background-position: -40% 60%,0 0; opacity: .5; } }
  @keyframes glowPulse {
    0%, 100% { transform: translate(var(--gx),var(--gy)) scale(1); opacity: var(--go1); }
    50% { transform: translate(calc(var(--gx) + var(--gdx)), calc(var(--gy) + var(--gdy))) scale(var(--gs)); opacity: var(--go2); }
  }
  @keyframes particleFloat {
    0% { transform: translate3d(0,0,0) rotate(0deg); opacity: 0; }
    8% { opacity: .55; } 85% { opacity: .45; }
    100% { transform: translate3d(var(--drift,18px),calc(-100vh - 40px),0) rotate(540deg); opacity: 0; }
  }
  .gd-back-fab {
    position: fixed; top: max(12px, env(safe-area-inset-top, 0px)); left: max(12px, env(safe-area-inset-left, 0px)); z-index: 50;
  }
  .page {
    position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 56px 24px 80px;
    padding-left: max(24px,env(safe-area-inset-left,0px)); padding-right: max(24px,env(safe-area-inset-right,0px));
    padding-bottom: max(80px,calc(48px + env(safe-area-inset-bottom,0px)));
    display: flex; flex-direction: column; flex: 1 1 auto; width: 100%; box-sizing: border-box;
    min-height: 100vh; min-height: 100dvh;
  }
  .brand-lockup { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 24px; text-align: center; }
  .brand-title {
    font-family: "Outfit","Noto Sans SC",sans-serif; font-size: clamp(32px,5.5vw,48px); line-height: 1.08; font-weight: 800; letter-spacing: .1em;
    color: #fde68a; background: none; -webkit-text-fill-color: currentColor; filter: none; animation: none;
  }
  .brand-subtitle { font-size: var(--gd-type-title-small-size); color: var(--gd-color-on-surface-variant); letter-spacing: var(--gd-type-letter-spacing-wide); font-weight: var(--gd-weight-regular); }
  .brand-legend { margin-top: 2px; }
  @keyframes titleFlow { 0%,100% { background-position: 0% center; } 50% { background-position: 100% center; } }
  .name-hl { background: rgba(251,191,36,.28); color: #fef3c7; border-radius: 3px; padding: 0 2px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  mark.name-hl { font: inherit; }
  .toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
  .search-box { position: relative; width: 100%; max-width: 520px; margin: 0 auto; }
  .search-box svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--subtle); pointer-events: none; }
  .search-input {
    width: 100%; height: 48px; padding: 0 44px 0 46px; border-radius: 14px; border: 1px solid rgba(251,191,36,.28);
    background: rgba(10,12,24,.72); color: var(--text); font: inherit; font-size: 15px; outline: none;
    box-shadow: 0 0 0 1px rgba(251,191,36,.06),0 0 18px rgba(251,191,36,.18),0 0 36px rgba(245,158,11,.08);
    transition: border-color .25s var(--ease), box-shadow .25s var(--ease);
  }
  .search-input::placeholder { color: var(--subtle); }
  .search-input:focus { border-color: rgba(251,191,36,.55); box-shadow: 0 0 0 3px rgba(251,191,36,.16),0 0 24px rgba(251,191,36,.32),0 0 48px rgba(245,158,11,.16); }
  .search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; border: none; border-radius: 50%; background: rgba(255,255,255,.08); color: var(--muted); font-size: 16px; cursor: pointer; display: none; align-items: center; justify-content: center; }
  .search-clear.show { display: inline-flex; }
  .search-clear:hover { background: rgba(239,68,68,.25); color: #fca5a5; }
  .search-clear:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .search-meta { text-align: center; font-size: 13px; color: var(--subtle); }
  .search-meta:empty { display: none; }
  .search-input::-webkit-search-cancel-button { display: none; }
  .cat-nav-bar { position: sticky; top: max(10px,env(safe-area-inset-top,0px)); z-index: 40; display: flex; justify-content: center; width: 100%; margin: 0 0 20px; box-sizing: border-box; pointer-events: none; }
  .cat-dock {
    pointer-events: auto; display: flex; align-items: center; gap: 0; width: fit-content; max-width: 100%; padding: 8px 14px; box-sizing: border-box;
    border-radius: 14px; background: rgba(8,10,18,.92); border: 1px solid rgba(255,255,255,.12); backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: none;
  }
  .nav-back { display: none; flex-shrink: 0; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; color: var(--muted); text-decoration: none; background: transparent; border: none; transition: background .2s var(--ease), color .2s var(--ease); }
  .nav-back:hover { background: rgba(255,255,255,.07); color: #93c5fd; }
  .nav-back:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .nav-sep { display: none; flex-shrink: 0; width: 1px; height: 20px; margin: 0 4px 0 2px; background: linear-gradient(to bottom,transparent,rgba(255,255,255,.22),transparent); }
  .cat-nav { display: flex; gap: 8px; justify-content: center; flex-wrap: nowrap; min-width: 0; padding: 0; margin: 0; border: none; background: transparent; box-shadow: none; }
  .cat-tab { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: var(--muted); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .25s var(--ease); }
  .cat-tab:hover { color: var(--text); background: rgba(255,255,255,.05); }
  .cat-tab:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .cat-tab.active { color: var(--text); background: rgba(255,255,255,.08); border-color: rgba(var(--cr),.45); box-shadow: none; }
  .cat-count { min-width: 22px; height: 22px; padding: 0 7px; border-radius: 8px; font-size: 12px; font-weight: 700; line-height: 22px; text-align: center; background: rgba(255,255,255,.08); color: var(--subtle); }
  .cat-tab .cat-count { color: var(--c2); background: rgba(var(--cr),.14); }
  .section.divine, .cat-tab.divine { --c: #fbbf24; --c2: #fcd34d; --cr: 251,191,36; }
  .section.demonic, .cat-tab.demonic { --c: #ef4444; --c2: #fca5a5; --cr: 239,68,68; }
  .section.immortal, .cat-tab.immortal { --c: #10b981; --c2: #6ee7b7; --cr: 16,185,129; }
  .section { margin-bottom: 8px; min-width: 0; }
  .section[hidden] { display: none !important; }
  .empty-state { text-align: center; padding: 48px 20px; color: var(--muted); border: 1px dashed rgba(255,255,255,.12); border-radius: var(--radius); background: rgba(255,255,255,.02); }
  .empty-state strong { color: var(--text); }
  .card-list { display: grid; gap: 10px; min-width: 0; }
  .item-card { display: flex; flex-direction: column;   gap: 10px;
  width: auto;
  height: auto;
  padding: 14px 16px; border-radius: 14px; background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.08); transition: background .2s var(--ease), border-color .2s var(--ease); min-width: 0; max-width: 100%; overflow: hidden; }
  .item-card:hover { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.14); }
  .section .item-card:hover { border-color: rgba(var(--cr),.28); }
  .item-card-main { display: flex; gap: 12px; align-items: flex-start; min-width: 0; width: 100%; }
  .row-num { min-width: 28px; padding-top: 4px; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; font-size: 15px; line-height: 1.4; flex-shrink: 0; color: var(--c); }
  .item-body { flex: 1; min-width: 0; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 8px 10px; align-items: start; }
  .item-name { grid-column: 1; grid-row: 1; min-width: 0; }
  .item-actions { display: contents; }
  .name-main { display: block; min-width: 0; color: var(--text); font-weight: 600; font-size: 15px; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .name-sub { display: block; margin-top: 3px; color: var(--subtle); font-size: 12px; font-weight: 400; line-height: 1.45; overflow: hidden; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; display: -webkit-box; }
  .action-group { display: inline-flex; flex-wrap: wrap; gap: 6px; align-items: center; flex-shrink: 0; }
  .action-group--primary, .empty-actions { grid-column: 2; grid-row: 1; align-self: center; }
  .action-group--ext { grid-column: 1 / -1; grid-row: 2; width: 100%; }
  .action-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 0 10px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; border: 1px solid transparent; cursor: pointer; white-space: nowrap; transition: background .2s var(--ease), border-color .2s var(--ease), color .2s var(--ease), transform .15s var(--ease); user-select: none; }
  .action-btn:hover { transform: translateY(-1px); }
  .action-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .action-btn--site { background: rgba(96,165,250,.16); border-color: rgba(96,165,250,.42); color: #93c5fd; }
  .action-btn--site:hover { background: rgba(96,165,250,.26); color: #bfdbfe; }
  .action-btn--detail { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.2); color: #e8eefc; }
  .action-btn--detail:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.28); }
  .action-btn--ext { background: rgba(var(--cr),.12); border-color: rgba(var(--cr),.36); color: var(--c2); }
  .action-btn--ext:hover { filter: brightness(1.1); }
  .empty-actions { font-size: 12px; color: var(--subtle); }
  @media (min-width: 769px) {
    .item-card { flex-direction: row; align-items: center; padding: 16px 18px; gap: 16px; }
    .item-card-main { flex: 1; align-items: center; }
    .row-num { padding-top: 0; }
    .item-body { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; }
    .item-name { flex: 1; min-width: 0; }
    .item-actions { display: inline-flex; flex-direction: row; align-items: center; flex-shrink: 0; gap: 0; }
    .action-group--primary, .empty-actions { grid-column: auto; grid-row: auto; align-self: center; }
    .action-group--ext { grid-column: auto; grid-row: auto; width: auto; flex-shrink: 0; margin-left: 14px; padding-left: 14px; border-left: 1px solid rgba(255,255,255,.1); }
    .name-main { font-size: 16px; }
  }
  footer { text-align: center; margin-top: 64px; padding-top: 28px; border-top: none; color: var(--muted); font-size: 13px; line-height: 2; }
  footer a { color: var(--muted); }
  .redirect-overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(8,10,20,.92); backdrop-filter: blur(16px); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .35s ease; }
  .redirect-overlay.active { opacity: 1; pointer-events: auto; }
  .redirect-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(251,191,36,.15); border-top-color: #fbbf24; animation: redirectSpin .8s linear infinite; margin-bottom: 32px; }
  @keyframes redirectSpin { to { transform: rotate(360deg); } }
  .redirect-text { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 12px; }
  .redirect-host { font-size: 13px; color: var(--subtle); margin-bottom: 8px; max-width: 80vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .redirect-countdown { font-size: 48px; font-weight: 800; color: #fbbf24; background: none; -webkit-text-fill-color: currentColor; animation: none; }
  .redirect-cancel { margin-top: 28px; padding: 10px 28px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); color: var(--muted); font: inherit; font-size: 14px; cursor: pointer; transition: all .25s ease; }
  .redirect-cancel:hover { color: var(--text); background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.2); }
  .redirect-cancel:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .modal-overlay { position: fixed; inset: 0; z-index: 1000; display: none; align-items: center; justify-content: center; padding: max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px)); background: rgba(0,0,0,.72); backdrop-filter: blur(8px); }
  .modal-overlay.open { display: flex; animation: fadeIn .28s ease; }
  .modal-overlay.closing { animation: fadeOut .28s ease forwards; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes modalIn { from { opacity: 0; transform: translateY(-18px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .modal { background: linear-gradient(145deg,#16182a,#12182a); border: 1px solid rgba(251,191,36,.28); border-radius: 18px; width: min(100%,560px); max-height: min(85vh,calc(100dvh - 32px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))); overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,.45); animation: modalIn .35s var(--ease); }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid rgba(251,191,36,.16); }
  .modal-title { font-size: 20px; font-weight: 800; letter-spacing: .08em; color: #fde68a; background: none; -webkit-text-fill-color: currentColor; }
  .modal-close { width: 36px; height: 36px; border: none; border-radius: 50%; background: rgba(255,255,255,.08); color: var(--muted); font-size: 22px; cursor: pointer; }
  .modal-close:hover { background: rgba(239,68,68,.28); color: #ef4444; }
  .modal-close:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .modal-body { padding: 22px 24px; overflow-y: auto; max-height: 48vh; }
  .modal-body p { color: var(--muted); font-size: 14px; line-height: 1.9; margin-bottom: 14px; text-indent: 2em; }
  .modal-footer { padding: 16px 24px 22px; display: flex; justify-content: center; border-top: 1px solid rgba(251,191,36,.12); }
  .modal-btn { padding: 11px 36px; border: none; border-radius: 999px; background: linear-gradient(135deg,#fbbf24,#f59e0b); color: #1a1a2e; font-size: 15px; font-weight: 700; letter-spacing: .08em; cursor: pointer; box-shadow: 0 4px 18px rgba(251,191,36,.35); }
  .modal-btn:hover { filter: brightness(1.06); }
  .modal-btn:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  @media (max-width: 768px) {
    .page { padding-top: 56px; padding-left: max(12px,env(safe-area-inset-left,0px)); padding-right: max(12px,env(safe-area-inset-right,0px)); padding-bottom: max(72px,calc(40px + env(safe-area-inset-bottom,0px))); }
    .cat-dock { width: 100%; border-radius: 18px; padding: 5px 6px 5px 5px; gap: 0; }
    .nav-back { display: inline-flex; }
    .nav-sep { display: block; }
    .cat-nav { flex: 1 1 auto; justify-content: space-evenly; gap: 4px; min-width: 0; }
    .brand-title { font-size: clamp(28px,9vw,40px); letter-spacing: .08em; }
    .brand-subtitle { letter-spacing: .16em; font-size: 12px; padding: 0 8px; }
    .cat-tab { padding: 8px 10px; font-size: 12.5px; gap: 6px; flex: 1 1 0; justify-content: center; min-width: 0; }
    .cat-count { min-width: 20px; padding: 0 6px; font-size: 11px; }
    .search-input { height: 44px; font-size: 16px; }
    .action-btn { min-height: 32px; padding: 0 9px; }
    .name-main { font-size: 14px; }
    .item-card { padding: 12px; }
    .row-num { min-width: 24px; font-size: 14px; }
    .modal-header { padding: 16px; }
    .modal-body { padding: 16px; font-size: 14px; }
    .modal-footer { padding: 12px 16px 16px; }
    .modal-title { font-size: 18px; }
  }
  @media (max-width: 360px) {
    .nav-back { width: 36px; height: 36px; }
    .nav-sep { margin: 0 2px 0 0; height: 18px; }
    .cat-ico { display: none; }
    .cat-tab { padding: 8px 6px; font-size: 12px; gap: 4px; }
    .cat-dock { padding: 4px; border-radius: 16px; }
    .action-btn { font-size: 11px; padding: 0 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
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


/* ===== 组件库内联: gd-search.css ===== */
gd-search { display: contents; }

.gd-search {
  display: flex;
  align-items: center;
  width: 220px;
  flex-shrink: 0;
  transition: none;
}
.gd-search.is-expanded { width: 100%; }
.gd-search__box { width: 100%; position: relative; }
.gd-search__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  pointer-events: none;
  color: var(--gd-color-on-surface-variant);
  opacity: 0.85;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gd-search__icon svg {
  width: 100%;
  height: 100%;
  display: block;
}
.gd-search__box:focus-within .gd-search__icon {
  color: var(--gd-color-primary);
  opacity: 1;
}
.gd-search__input {
  width: 100%;
  height: 40px;
  min-height: 40px;
  padding: 0 36px 0 38px;
  border-radius: 22px;
  border: 1px solid rgba(var(--gd-color-sky-blue-rgb), 0.28);
  background: rgba(var(--gd-color-white-rgb), 0.07);
  color: var(--gd-color-on-surface);
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-medium);
  line-height: 40px;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: border-color var(--gd-motion-duration-short4) var(--gd-motion-easing-standard), background var(--gd-motion-duration-short4) var(--gd-motion-easing-standard), box-shadow var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-search__input::placeholder { color: rgba(var(--gd-color-muted-white-rgb), 0.62); opacity: 1; }
.gd-search__input:hover {
  border-color: rgba(var(--gd-color-sky-blue-rgb), 0.38);
  background: rgba(var(--gd-color-white-rgb), 0.09);
}
.gd-search__input:focus {
  border-color: rgba(var(--gd-color-primary-rgb), 0.65);
  background: rgba(var(--gd-color-primary-rgb), 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 3px rgba(var(--gd-color-primary-rgb), 0.14);
  outline: 0px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-search__clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(var(--gd-color-white-rgb), 0.08);
  color: var(--gd-color-on-surface-variant);
  font-size: var(--gd-type-note-size);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
}
.gd-search__clear.is-visible { display: flex; }
.gd-search__clear:hover { background: rgba(255, 255, 255, 0.15); color: var(--gd-color-on-surface); }
/* 禁用浏览器原生清除按钮（避免与 gd-search__clear 重复显示 ×） */
.gd-search__input::-webkit-search-cancel-button,
.gd-search__input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
.gd-search--toolbar { width: 100%; max-width: 420px; }
.gd-search--toolbar.is-expanded { width: 100%; }

/* 圣器殿堂搜索框 */
.gd-search--group { width: 100%; max-width: 420px; margin: 0 auto; }
.gd-search--group .gd-search {
  width: 100%;
  max-width: 420px;
  transition: none;
}
.gd-search--group .gd-search.is-expanded { width: 100%; }
.gd-search--group .gd-search__box { width: 100%; }
.gd-search--group .gd-search__icon { left: 16px; }
/* 圣器殿堂搜索框：focus/触发时图标颜色与金色输入框一致 */
.gd-search--group .gd-search__box:focus-within .gd-search__icon {
  color: rgba(var(--gd-color-gold-rgb), 1);
  opacity: 1;
}
.gd-search--group .gd-search__input {
  height: 48px;
  min-height: 48px;
  padding: 0 44px 0 46px;
  border-radius: 14px;
  border: 1px solid rgba(var(--gd-color-gold-rgb), 0.28);
  background: rgba(var(--gd-color-navy-rgb), 0.72);
  color: var(--gd-color-on-surface);
  font-size: var(--gd-type-title-small-size);
  font-weight: var(--gd-weight-regular);
  line-height: 48px;
  box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.06), 0 0 18px rgba(251, 191, 36, 0.18), 0 0 36px rgba(245, 158, 11, 0.08);
  transition: border-color 0.25s var(--gd-motion-easing-standard), box-shadow 0.25s var(--gd-motion-easing-standard);
}
.gd-search--group .gd-search__input::placeholder { color: var(--gd-color-on-surface-subtle); }
.gd-search--group .gd-search__input:hover {
  border-color: rgba(var(--gd-color-gold-rgb), 0.4);
  background: rgba(var(--gd-color-navy-rgb), 0.72);
}
.gd-search--group .gd-search__input:focus {
  border-color: rgba(var(--gd-color-gold-rgb), 0.55);
  background: rgba(var(--gd-color-navy-rgb), 0.72);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.16), 0 0 24px rgba(251, 191, 36, 0.32), 0 0 48px rgba(245, 158, 11, 0.16);
  outline: 0px solid rgba(var(--gd-color-gold-rgb), 0.55);
  outline-offset: 2px;
}
.gd-search--group .gd-search__clear {
  right: 10px;
  width: 28px;
  height: 28px;
  font-size: var(--gd-type-body-large-size);
}
.gd-search--group .gd-search__clear:hover { background: rgba(var(--gd-color-error-rgb), 0.25); color: var(--gd-color-error-light); }


/* ===== 组件库内联: gd-navbar.css（圣器殿堂分类导航） ===== */
.gd-cat-nav-bar {
  position: sticky;
  top: max(10px, env(safe-area-inset-top, 0px));
  z-index: 40;
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0 0 20px;
  box-sizing: border-box;
  pointer-events: none;
}
.gd-cat-dock {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0;
  width: fit-content;
  max-width: 100%;
  padding: 8px 14px;
  box-sizing: border-box;
  border-radius: 14px;
  background: var(--gd-glass-nav-bg);
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.12);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}
.gd-cat-nav-back {
  position: absolute;
  top: 6px;
  left: 12px;
  display: none;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: rgba(var(--gd-color-muted-white-rgb), 0.58);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s var(--gd-motion-easing-standard), color 0.2s var(--gd-motion-easing-standard);
}
.gd-cat-nav-back:hover { background: rgba(var(--gd-color-white-rgb), 0.07); color: var(--gd-tag-2-fg); }
.gd-cat-nav-back:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-cat-nav {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: nowrap;
  min-width: 0;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}
.gd-cat-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(var(--gd-color-muted-white-rgb), 0.58);
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  cursor: pointer;
  transition: all 0.25s var(--gd-motion-easing-standard);
}
.gd-cat-tab:hover { color: var(--gd-color-on-surface); background: rgba(var(--gd-color-white-rgb), 0.05); }
.gd-cat-tab:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-cat-tab.is-active {
  color: var(--gd-color-on-surface);
  background: rgba(var(--gd-color-white-rgb), 0.08);
  border-color: rgba(var(--gd-comp-cat-color-rgb), 0.45);
  box-shadow: none;
}
.gd-cat-tab--divine { --gd-comp-cat-color: #fbbf24; --gd-comp-cat-color-light: #fcd34d; --gd-comp-cat-color-rgb: 251, 191, 36; }
.gd-cat-tab--demonic { --gd-comp-cat-color: #ef4444; --gd-comp-cat-color-light: #fca5a5; --gd-comp-cat-color-rgb: 239, 68, 68; }
.gd-cat-tab--immortal { --gd-comp-cat-color: #10b981; --gd-comp-cat-color-light: #6ee7b7; --gd-comp-cat-color-rgb: 16, 185, 129; }
.gd-cat-count {
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 8px;
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-bold);
  line-height: 22px;
  text-align: center;
  background: rgba(var(--gd-color-white-rgb), 0.08);
  color: var(--gd-color-on-surface-subtle);
  box-sizing: border-box;
}
.gd-cat-tab .gd-cat-count {
  color: var(--gd-comp-cat-color-light);
  background: rgba(var(--gd-comp-cat-color-rgb), 0.14);
}
@media (max-width: 768px) {
  .gd-cat-nav-bar { padding: 0 12px 0 52px; }
  .gd-cat-dock { width: 100%; border-radius: 18px; padding: 5px 6px; gap: 0; }
  .gd-cat-nav-back { display: none; }
  .gd-cat-nav { flex: 1 1 auto; justify-content: space-evenly; gap: 4px; min-width: 0; }
  .gd-cat-tab { padding: 8px 10px; font-size: 12.5px; gap: 6px; flex: 1 1 0; justify-content: center; min-width: 0; }
  .gd-cat-count { min-width: 20px; padding: 0 6px; font-size: var(--gd-type-label-small-size); }
}


/* ===== 组件库内联: gd-card.css ===== */
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
  isolation: isolate;
  transition:
    background 0.2s var(--gd-motion-easing-standard),
    border-color 0.2s var(--gd-motion-easing-standard);
}
.gd-card--item::before {
  content: "";
  position: absolute;
  inset: -24px;
  z-index: 0;
  pointer-events: none;
  background-image: url("https://assets.galnavi.top/%E7%BA%BF%E6%9D%A1%E5%9B%BE%E6%A1%88.png");
  background-repeat: repeat;
  background-position: 0 0;
  background-size: auto;
  opacity: 0.16;
  mix-blend-mode: screen;
  filter: blur(10.8px);
}
.gd-card--item > * {
  position: relative;
  z-index: 1;
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

/* ===== 组件库内联: gd-footer.css ===== */
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
  padding: 0 8px;
}
.gd-footer__nav a:hover { color: var(--gd-color-link-hover); }
.gd-footer__nav a:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-footer__sep { color: rgba(var(--gd-color-muted-white-rgb), 0.28); user-select: none; font-size: var(--gd-type-label-medium-size); }
.gd-footer__copy { margin: 0; }
.gd-footer--page {
  margin-top: auto;
  padding-top: 24px;
}


/* ===== 组件库内联: gd-skeleton.css ===== */
/* gd-skeleton — 数据加载占位（骨架屏） */

.gd-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.gd-skeleton__block {
  position: relative;
  overflow: hidden;
  border-radius: var(--gd-shape-corner-extra-small);
  background: rgba(var(--gd-color-white-rgb), 0.06);
}

.gd-skeleton__block::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--gd-color-white-rgb), 0.08),
    transparent
  );
  animation: gd-skeleton-shimmer 1.6s infinite;
}

.gd-skeleton__line {
  height: 12px;
}
.gd-skeleton__line--sm { width: 60%; height: 10px; }
.gd-skeleton__line--md { width: 80%; }
.gd-skeleton__line--lg { width: 100%; height: 16px; }

.gd-skeleton__rect {
  height: 140px;
  border-radius: var(--gd-shape-corner-small);
}

.gd-skeleton__circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.gd-skeleton__row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

/* 卡片轮廓变体（padding/radius/gap/玻璃/宽度同主站卡片） */
.gd-skeleton--card {
  gap: 14px;
  padding: 20px;
  border-radius: var(--gd-shape-corner-large);
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  box-sizing: border-box;
  width: 100%;
  max-width: 380px;
}
.gd-skeleton--card .gd-skeleton__icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--gd-shape-corner-small);
}
.gd-skeleton--card .gd-skeleton__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
}
.gd-skeleton--card .gd-skeleton__title-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gd-skeleton--card .gd-skeleton__line--title { width: 55%; height: 16px; }
.gd-skeleton--card .gd-skeleton__line--sub { width: 80%; height: 12px; }
.gd-skeleton--card .gd-skeleton__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.gd-skeleton--card .gd-skeleton__tag {
  width: 52px;
  height: 26px;
  border-radius: var(--gd-shape-corner-full);
}
.gd-skeleton--card .gd-skeleton__actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: auto;
}
.gd-skeleton--card .gd-skeleton__btn {
  flex: 1;
  height: 42px;
  border-radius: 12px;
}

/* 轮播原尺寸变体（1000px / 2:1 / max-height 400px），带流光加载动效 */
.gd-skeleton--hero {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  border-radius: var(--gd-shape-corner-medium);
  aspect-ratio: 2 / 1;
  max-height: 400px;
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  box-sizing: border-box;
}
.gd-skeleton--hero::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--gd-color-white-rgb), 0.08),
    transparent
  );
  animation: gd-skeleton-shimmer 1.6s infinite;
}

/* 详情页变体 — 亮点横幅长条 + 三列卡片网格（数量随数据） */
.gd-skeleton--detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.gd-skeleton--detail .gd-skeleton__banner {
  height: 88px;
  border-radius: var(--gd-shape-corner-medium);
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  position: relative;
  overflow: hidden;
}
.gd-skeleton--detail .gd-skeleton__banner::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--gd-color-white-rgb), 0.08),
    transparent
  );
  animation: gd-skeleton-shimmer 1.6s infinite;
}
.gd-skeleton--detail .gd-skeleton__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}
.gd-skeleton--detail .gd-skeleton__card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: var(--gd-shape-corner-medium);
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  box-sizing: border-box;
}
.gd-skeleton--detail .gd-skeleton__card-line {
  width: 100%;
  height: 34px;
  border-radius: 12px;
}
.gd-skeleton--detail .gd-skeleton__card-line--sm { width: 70%; height: 34px; }

@media (max-width: 768px) {
  .gd-skeleton--detail .gd-skeleton__grid {
    grid-template-columns: 1fr;
  }
}

/* 神魔条目卡变体 — 尺寸/结构同 gd-card--item（序号 + 名称长条 + 操作按钮长条） */
.gd-skeleton--item {
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}
.gd-skeleton--item .gd-skeleton__main {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  min-width: 0;
}
.gd-skeleton--item .gd-skeleton__num {
  width: 28px;
  height: 16px;
  flex-shrink: 0;
}
.gd-skeleton--item .gd-skeleton__body {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 10px;
  align-items: start;
}
.gd-skeleton--item .gd-skeleton__name {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.gd-skeleton--item .gd-skeleton__line--title { width: 55%; height: 16px; }
.gd-skeleton--item .gd-skeleton__line--sub { width: 80%; height: 12px; }
.gd-skeleton--item .gd-skeleton__line--sub2 { width: 60%; height: 12px; }
.gd-skeleton--item .gd-skeleton__actions {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  gap: 6px;
  align-items: center;
  align-self: center;
}
.gd-skeleton--item .gd-skeleton__btn {
  width: 40px;
  height: 28px;
  border-radius: 8px;
}

@keyframes gd-skeleton-shimmer {
  100% { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .gd-skeleton__block::after { animation: none; }
}


  /* 数据加载骨架：第二张距第一张 10px */
  #sections .gd-skeleton--item + .gd-skeleton--item { margin-top: 10px; }
</style>
</head>
<body>
  <div class="gd-groundback gd-groundback--gold" aria-hidden="true"></div>
  <a class="gd-button gd-button--back gd-button--back--orange gd-back-fab" href="https://galnavi.top/nav/" aria-label="返回主站">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    返回主站
  </a>

  <main class="page">
    <header class="brand-lockup">
      <h1 class="gd-brand__title gd-brand__title--palace gd-brand__title--demo">圣器殿堂</h1>
      <p class="brand-subtitle">神器 · 魔器 · 仙器</p>
      <button type="button" class="gd-link brand-legend" id="openLegend">阅读圣器传说</button>
    </header>

    <div class="toolbar">
      <div class="gd-search--group" id="searchBox">
      <div class="gd-search">
        <div class="gd-search__box">
          <span class="gd-search__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
          </span>
          <input class="gd-search__input" id="searchInput" type="search" placeholder="搜索游戏名（中文 / 日文）" aria-label="搜索游戏">
          <button type="button" class="gd-search__clear" id="searchClear" aria-label="清除">&times;</button>
        </div>
      </div>
    </div>
      <p class="search-meta" id="searchMeta" aria-live="polite"></p>
    </div>
    <div class="gd-cat-nav-bar" id="catNavBar" style="display:none">
      <a class="gd-cat-nav-back" href="https://galnavi.top/nav/" aria-label="返回主站">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </a>
      <div class="gd-cat-dock">
        <nav class="gd-cat-nav" id="catNav" aria-label="分类切换"></nav>
      </div>
    </div>

    <div id="sections" aria-busy="true">
      <div class="gd-skeleton gd-skeleton--item" aria-hidden="true">
        <div class="gd-skeleton__main">
          <div class="gd-skeleton__block gd-skeleton__num"></div>
          <div class="gd-skeleton__body">
            <div class="gd-skeleton__name">
              <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div>
              <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div>
              <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub2"></div>
            </div>
            <div class="gd-skeleton__actions">
              <div class="gd-skeleton__block gd-skeleton__btn"></div>
              <div class="gd-skeleton__block gd-skeleton__btn"></div>
              <div class="gd-skeleton__block gd-skeleton__btn"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="gd-skeleton gd-skeleton--item" aria-hidden="true">
        <div class="gd-skeleton__main">
          <div class="gd-skeleton__block gd-skeleton__num"></div>
          <div class="gd-skeleton__body">
            <div class="gd-skeleton__name">
              <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div>
              <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div>
              <div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub2"></div>
            </div>
            <div class="gd-skeleton__actions">
              <div class="gd-skeleton__block gd-skeleton__btn"></div>
              <div class="gd-skeleton__block gd-skeleton__btn"></div>
              <div class="gd-skeleton__block gd-skeleton__btn"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="gd-footer gd-footer--page">
      <nav class="gd-footer__nav" aria-label="页脚链接">
        <a href="https://galnavi.top/sitemap.xml">sitemap.xml</a><span class="gd-footer__sep" aria-hidden="true">|</span>
        <a href="https://galnavi.top/robots.txt">robots.txt</a><span class="gd-footer__sep" aria-hidden="true">|</span>
        <a href="mailto:feedback@galnavi.top">联系站长</a><span class="gd-footer__sep" aria-hidden="true">|</span>
        <a href="https://galnavi.top/nav/donate/">赞助本站</a><span class="gd-footer__sep" aria-hidden="true">|</span>
        <a href="https://galnavi.top/nav/friend/">申请友链</a><span class="gd-footer__sep" aria-hidden="true">|</span>
        <a href="https://galnavi.top/status/">站点状态</a>
      </nav>
      <p class="gd-footer__copy">© 2026 GALNAVI · 愿每一次探索都有新的收获</p>
    </footer>
  </main>

  <div class="modal-overlay" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" hidden>
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title" id="modalTitle">圣器传说</h2>
        <button class="modal-close" id="modalClose" aria-label="关闭">&times;</button>
      </div>
      <div class="modal-body">
        <p>在科学与魔法的世界诞生之间，由三界划分天下，他们是人族掌握科技，魔族掌握魔法，仙族掌握神力，三界都为了那点权利陷入了一片混乱之中。</p>
        <p>为了平息这场纷争，天神倾尽全力，打造了一件非凡的圣器。这件圣器由三件不同凡响的器物组成——神器、魔器和仙器，它们是针对三族弱点量身定制，每一个都蕴含着不可思议的力量，非凡人驾驭之物。</p>
        <p>圣器将混乱平息之后，三界三族融为一体，成了现在的科技与魔法的世界。另一边，天神为了防止圣器落入邪恶之手，他将每一件圣器分为大小不一的碎片，并将它们的碎片散布到世界各地。正是此举，才有了我们今天所知的十二神器、十二魔器和十六仙器。</p>
      </div>
      <div class="modal-footer">
        <button class="modal-btn" id="modalEnter">踏入殿堂</button>
      </div>
    </div>
  </div>

  <div id="redirectOverlay" class="redirect-overlay" aria-live="polite" aria-atomic="true">
    <div class="redirect-ring" aria-hidden="true"></div>
    <div class="redirect-text">即将跳转</div>
    <div class="redirect-host" id="redirectHost"></div>
    <div id="redirectCountdown" class="redirect-countdown">3</div>
    <button type="button" id="redirectCancel" class="redirect-cancel">取消跳转</button>
  </div>

<script type="application/json" id="boot-data">${bootJson}</script>
<script>
(function(){function a(){var h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;document.documentElement.style.setProperty("--gd-vvh",h+"px");}a();window.addEventListener("resize",a);if(window.visualViewport)window.visualViewport.addEventListener("resize",a);})();
/* 组件库内联: gd-search.js（initGdSearch） */
function initGdSearch(root) {
  const el = typeof root === "string" ? document.querySelector(root) : root;
  if (!el) return;
  const input = el.querySelector(".gd-search__input");
  const clear = el.querySelector(".gd-search__clear");
  if (!input) return;

  const sync = () => {
    const has = Boolean(input.value);
    clear?.classList.toggle("is-visible", has);
    el.classList.toggle("is-expanded", has || document.activeElement === input);
  };

  input.addEventListener("focus", () => el.classList.add("is-expanded"));
  input.addEventListener("blur", () => {
    if (!input.value) el.classList.remove("is-expanded");
  });
  input.addEventListener("input", sync);
  clear?.addEventListener("click", () => {
    input.value = "";
    input.focus();
    sync();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  sync();
}


var BOOT = JSON.parse(document.getElementById("boot-data").textContent);
var SAMPLE = Array.isArray(BOOT.data) ? BOOT.data : [];
var FETCH_FAILED = !!BOOT.failed;


const CAT={
  "神器":{id:"divine",icon:"⚔️"},
  "魔器":{id:"demonic",icon:"🔥"},
  "仙器":{id:"immortal",icon:"✨"},
};
const CATS=Object.keys(CAT);
const ID_CAT=Object.fromEntries(Object.entries(CAT).map(([k,v])=>[v.id,k]));
const LEGEND_KEY="shenmo_legend_seen_v1";
let currentCat="神器", query="";

function escHtml(str){
  if(!str) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function isSafeHttpUrl(url){
  if(!url||typeof url!=="string") return false;
  try{ const u=new URL(url); return u.protocol==="http:"||u.protocol==="https:"; }catch(e){ return false; }
}
function hostLabel(url){
  try{ return new URL(url).hostname.replace(/^www\\./,""); }catch(e){ return "外链"; }
}
function highlightText(text, rawQuery){
  const src=String(text||""), q=String(rawQuery||"").trim();
  if(!q||!src) return escHtml(src);
  const normSrc=src.toLowerCase().replace(/\\s+/g,""), normQ=q.toLowerCase().replace(/\\s+/g,"");
  if(!normQ||!normSrc.includes(normQ)) return escHtml(src);
  const map=[];
  for(let i=0;i<src.length;i++){ if(!/\\s/.test(src[i])) map.push(i); }
  const startNorm=normSrc.indexOf(normQ);
  if(startNorm<0) return escHtml(src);
  const endNorm=startNorm+normQ.length-1, start=map[startNorm], end=map[endNorm];
  if(start==null||end==null) return escHtml(src);
  return escHtml(src.slice(0,start))+\`<mark class="name-hl">\${escHtml(src.slice(start,end+1))}</mark>\`+escHtml(src.slice(end+1));
}
function formatName(name){
  if(!name) return {main:"",sub:""};
  const match=String(name).match(/^(《[^》]+》)([（(][^)）]+[）)])$/);
  if(match) return {main:highlightText(match[1],query),sub:highlightText(match[2],query)};
  return {main:highlightText(name,query),sub:""};
}
function fmtAction(val,label,kind){
  if(!isSafeHttpUrl(val)) return "";
  return \`<a class="gd-card__action gd-card__action--\${kind}" href="\${escHtml(val)}" target="_blank" rel="noopener noreferrer">\${escHtml(label)}</a>\`;
}
function linkTags(r){
  return [r.link1,r.link2,r.link3].filter(isSafeHttpUrl).map((url,i)=>
    \`<a class="gd-card__action gd-card__action--ext" href="\${escHtml(url)}" target="_blank" rel="noopener noreferrer" title="\${escHtml(hostLabel(url))}">外链\${i+1}</a>\`
  ).join("");
}
function renderCard(r,index){
  const name=formatName(r.name);
  const primary=fmtAction(r.official_url,"官网","site")+fmtAction(r.details_url,"详情","detail");
  const ext=linkTags(r);
  const primaryHtml=primary?\`<div class="gd-card__action-group gd-card__action-group--primary">\${primary}</div>\`:"";
  const extHtml=ext?\`<div class="gd-card__action-group gd-card__action-group--ext">\${ext}</div>\`:"";
  const emptyHtml=(!primary&&!ext)?\`<span class="empty-actions">暂无链接</span>\`:"";
  const subHtml=name.sub?\`<span class="gd-card__name-sub">\${name.sub}</span>\`:"";
  return \`<article class="gd-card gd-card--item"><div class="gd-card__item-main"><span class="gd-card__num">\${index+1}</span><div class="gd-card__item-body"><div class="gd-card__item-name"><span class="gd-card__name-main">\${name.main}</span>\${subHtml}</div><div class="gd-card__item-actions">\${primaryHtml}\${extHtml}\${emptyHtml}</div></div></div></article>\`;
}
function normalize(s){ return String(s||"").toLowerCase().replace(/\\s+/g,""); }
function matchQuery(item,q){ return !q||normalize(item.name).includes(q); }
function getFiltered(cat){ const q=normalize(query); return SAMPLE.filter(r=>r.category===cat&&matchQuery(r,q)); }
function totalCounts(){
  const counts={}; CATS.forEach(cat=>{ counts[cat]=SAMPLE.filter(r=>r.category===cat).length; }); return counts;
}
function readUrlState(){
  try{
    const sp=new URLSearchParams(location.search), catParam=sp.get("cat");
    if(catParam==="divinity") currentCat="神器";     else if(catParam==="all") currentCat="神器";     else if(catParam&&ID_CAT[catParam]) currentCat=ID_CAT[catParam];
    const q=sp.get("q");
    if(q!=null){ query=q; const input=document.getElementById("searchInput"); if(input) input.value=q; }
  }catch(e){}
}
function writeUrlState(){   try{     const sp=new URLSearchParams();     const catId = currentCat==="神器" ? "divinity" : (CAT[currentCat]?.id || "divine");     sp.set("cat",catId);
    if(query.trim()) sp.set("q",query.trim());
    const qs=sp.toString(), next=qs?\`\${location.pathname}?\${qs}\`:location.pathname;
    if(next!==location.pathname+location.search) history.replaceState(null,"",next);
  }catch(e){}
}
function renderNav(){
  const counts=totalCounts();
  if(!counts[currentCat]){ const first=CATS.find(c=>counts[c]>0); if(first) currentCat=first; }
  const nav=document.getElementById("catNav");
  nav.innerHTML=CATS.map(cat=>{
    const cfg=CAT[cat], n=counts[cat]||0;
    if(!n) return "";
    const on=currentCat===cat;
    return \`<button type="button" class="gd-cat-tab gd-cat-tab--\${cfg.id}\${on?" is-active":""}" data-cat="\${cat}" aria-pressed="\${on}"><span class="gd-cat-label">\${cat}</span><span class="gd-cat-count">\${n}</span></button>\`;
  }).join("");
  nav.querySelectorAll(".gd-cat-tab").forEach(btn=>{
    btn.addEventListener("click",()=>{ currentCat=btn.dataset.cat; renderView(); });
  });
}
function paintContent(opts){
  const doScroll=!!(opts&&opts.scroll);
  renderNav();
  var catNavBar=document.getElementById("catNavBar"); if(catNavBar) catNavBar.style.display="";
  writeUrlState();
  const sectionsEl=document.getElementById("sections"), meta=document.getElementById("searchMeta");
  document.getElementById("searchClear").classList.toggle("show",!!query.trim());
  const cfg=CAT[currentCat], items=getFiltered(currentCat), shown=items.length;
  let html=items.length
    ? \`<section class="section \${cfg.id}" aria-label="\${escHtml(currentCat)}"><div class="card-list">\${items.map((r,i)=>renderCard(r,i)).join("")}</div></section>\`
    : "";
  if(!html){
    if(typeof FETCH_FAILED!=="undefined"&&FETCH_FAILED&&!SAMPLE.length){
      html='<div class="empty-state">数据暂时无法加载，请稍后再试</div>';
    }else if(query.trim()){
      html='<div class="empty-state">没有找到与「<strong>'+escHtml(query.trim())+'</strong>」相关的游戏</div>';
    }else{
      html='<div class="empty-state">该分类暂无内容</div>';
    }
  }
  sectionsEl.innerHTML=html;
  meta.textContent=query.trim()?\`在「\${currentCat}」中找到 \${shown} 款\`:"";
  if(doScroll) window.scrollTo({top:0,behavior:"smooth"});
}
function renderView(){ paintContent({scroll:true}); }

const modal=document.getElementById("modal");
const modalClose=document.getElementById("modalClose");
const modalEnter=document.getElementById("modalEnter");
let lastFocus=null;
function openModal(){
  lastFocus=document.activeElement; modal.hidden=false; modal.classList.add("open"); modalEnter.focus();
  document.addEventListener("keydown",onModalKey);
}
function closeModal(markSeen){
  if(markSeen){ try{ localStorage.setItem(LEGEND_KEY,"1"); }catch(e){} }
  modal.classList.add("closing");
  setTimeout(()=>{
    modal.classList.remove("open","closing"); modal.hidden=true;
    document.removeEventListener("keydown",onModalKey);
    if(lastFocus&&lastFocus.focus) lastFocus.focus();
  },260);
}
function onModalKey(e){
  if(e.key==="Escape") closeModal(true);
  if(e.key!=="Tab") return;
  const focusables=modal.querySelectorAll("button");
  if(!focusables.length) return;
  const first=focusables[0], last=focusables[focusables.length-1];
  if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
}
modalClose.addEventListener("click",()=>closeModal(true));
modalEnter.addEventListener("click",()=>closeModal(true));
modal.addEventListener("click",e=>{ if(e.target===modal) closeModal(true); });
document.getElementById("openLegend").addEventListener("click",openModal);

initGdSearch(document.getElementById("searchBox"));
  const searchInput=document.getElementById("searchInput");
const searchClear=document.getElementById("searchClear");
let searchTimer=null;
searchInput.addEventListener("input",()=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{ query=searchInput.value; paintContent({scroll:false}); },120);
});
searchClear.addEventListener("click",()=>{
  searchInput.value=""; query=""; searchInput.focus(); paintContent({scroll:false});
});
readUrlState();
  // 数据调取：导航栏下先显示 2 张骨架，数据渲染完成后骨架被替换消失
  setTimeout(function(){ paintContent({scroll:false}); document.getElementById("sections").setAttribute("aria-busy","false"); }, 350);

(function initParticles(){
  return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host=document.getElementById("particles");
  if(!host) return;
  const colors=["#fbbf24","#ef4444","#10b981","#8b5cf6","#3b82f6"];
  const count=window.matchMedia("(max-width: 768px)").matches?14:22;
  const frag=document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const p=document.createElement("span"); p.className="particle";
    const size=(Math.random()*3.2+1.8).toFixed(1);
    p.style.width=size+"px"; p.style.height=size+"px";
    p.style.left=(Math.random()*100).toFixed(2)+"%";
    p.style.backgroundColor=colors[i%colors.length];
    p.style.animationDuration=(Math.random()*7+9).toFixed(2)+"s";
    p.style.animationDelay=(-Math.random()*12).toFixed(2)+"s";
    p.style.setProperty("--drift",((Math.random()*48)-24).toFixed(1)+"px");
    frag.appendChild(p);
  }
  host.appendChild(frag);
})();

let redirectTimerId=null, redirectCleanup=null;
function startRedirect(targetUrl){
  const overlay=document.getElementById("redirectOverlay");
  const countdownEl=document.getElementById("redirectCountdown");
  const cancelBtn=document.getElementById("redirectCancel");
  const hostEl=document.getElementById("redirectHost");
  if(!overlay||!countdownEl){ window.open(targetUrl,"_blank","noopener,noreferrer"); return; }
  if(redirectCleanup) redirectCleanup();
  let pendingWin=null;
  try{ pendingWin=window.open("about:blank","_blank"); }catch(e){ pendingWin=null; }
  let seconds=3;
  overlay.classList.add("active");
  countdownEl.textContent=seconds;
  if(hostEl) hostEl.textContent=hostLabel(targetUrl);
  function onRedirectKey(ev){ if(ev.key==="Escape") cleanupRedirect(true); }
  function cleanupRedirect(closePending){
    if(redirectTimerId){ clearInterval(redirectTimerId); redirectTimerId=null; }
    overlay.classList.remove("active");
    if(cancelBtn) cancelBtn.removeEventListener("click",onCancel);
    document.removeEventListener("keydown",onRedirectKey);
    if(closePending&&pendingWin&&!pendingWin.closed){ try{ pendingWin.close(); }catch(e){} }
    pendingWin=null; redirectCleanup=null;
  }
  function onCancel(){ cleanupRedirect(true); }
  function tick(){
    seconds--;
    if(seconds<=0){
      if(pendingWin&&!pendingWin.closed){ try{ pendingWin.location.href=targetUrl; }catch(e){ window.location.href=targetUrl; } }
      else window.location.href=targetUrl;
      cleanupRedirect(false); return;
    }
    countdownEl.textContent=seconds;
  }
  redirectTimerId=setInterval(tick,1000);
  redirectCleanup=()=>cleanupRedirect(true);
  if(cancelBtn) cancelBtn.addEventListener("click",onCancel);
  document.addEventListener("keydown",onRedirectKey);
}
document.addEventListener("click",function(e){
  const anchor=e.target.closest("a");
  if(!anchor) return;
  const href=anchor.getAttribute("href");
  if(!href) return;
  const lower=href.trim().toLowerCase();
  if(lower.startsWith("javascript:")||lower.startsWith("data:")){ e.preventDefault(); e.stopPropagation(); return; }
  if(href.startsWith("https://galnavi.top/nav/")||href.startsWith("/nav/")||href.startsWith("#")) return;
  if(!isSafeHttpUrl(href)) return;
  try{ if(new URL(href).hostname===window.location.hostname) return; }catch(_){ return; }
  e.preventDefault(); e.stopPropagation(); startRedirect(href);
});
try{ if(!localStorage.getItem(LEGEND_KEY)) openModal(); }catch(e){ openModal(); }

</script>
</body>
</html>`;
}
