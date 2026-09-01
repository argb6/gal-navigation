const NAVI_IS_ACTIVE = 1;
const NAVI_IS_NSFW = 2;
const NSFW_COOKIE = "gd-nsfw";
const NSFW_COOKIE_MAX_AGE = 24 * 60 * 60;

function readNsfwFlag(request) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(/(?:^|;\s*)gd-nsfw=(\d+)/);
  return m && Number(m[1]) === NAVI_IS_NSFW ? NAVI_IS_NSFW : NAVI_IS_ACTIVE;
}

function nsfwSetCookie(flag) {
  const v = flag === NAVI_IS_NSFW ? NAVI_IS_NSFW : NAVI_IS_ACTIVE;
  return `${NSFW_COOKIE}=${v}; Path=/; Max-Age=${NSFW_COOKIE_MAX_AGE}; SameSite=Lax`;
}

const DB_CATEGORY_MAP = { simulators: "simulator", websites: "site", tools: "tool", company: "company", hanhua: "hanhua" };
const ASSET_FAVICON = "https://assets.galnavi.top/favicon.png";
const ASSET_ICON = "https://assets.galnavi.top/icon.png";
const ASSET_LOGO = "https://assets.galnavi.top/logo.png";
const SECURITY_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self'; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const slashMap = { "/nav/palace": "/nav/palace/", "/nav/about": "/nav/about/", "/nav/help": "/nav/help/", "/nav/detail": "/nav/detail/" };
    if (slashMap[url.pathname]) { url.pathname = slashMap[url.pathname]; return Response.redirect(url.toString(), 301); }
    const nsfwFlag = readNsfwFlag(request);
    const [navData, heroImages, featuredKeys] = await Promise.all([fetchNavData(env), fetchHeroImages(env), fetchFeaturedKeys(env)]);
    return new Response(renderPage(navData, heroImages, featuredKeys, nsfwFlag), {
      headers: { ...SECURITY_HEADERS, "Set-Cookie": nsfwSetCookie(nsfwFlag) },
    });
  },
};
async function fetchNavData(env) {
  try {
    if (!env.DB) return [];
    const { results } = await env.DB.prepare(
      "SELECT item_key, title, category, tags, short_desc, url, icon_path, updated_at, is_active FROM navi_sites WHERE is_active IN (1, 2) ORDER BY category ASC"
    ).all();
    return results.map((row) => ({
      id: row.item_key,
      cat: DB_CATEGORY_MAP[row.category] || row.category,
      name: row.title,
      desc: row.short_desc || "",
      tags: row.tags ? row.tags.split(",") : [],
      url: row.url || "",
      icon: row.icon_path || "",
      updatedAt: row.updated_at || "",
      nsfw: Number(row.is_active) === 2,
    }));
  } catch {
    return [];
  }
}
async function fetchHeroImages(env) {
  try {
    if (!env.HERO_KV) return [];
    const raw = await env.HERO_KV.get("hero_images");
    if (!raw) return [];
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : (typeof p === "string" && p ? [p] : []);
    } catch {
      const t = raw.trim();
      return t.includes(",") ? t.split(",").map((s) => s.trim()).filter(Boolean) : (t ? [t] : []);
    }
  } catch {
    return [];
  }
}
async function fetchFeaturedKeys(env) {
  try {
    if (!env.FEATURED_KV) return [];
    const raw = await env.FEATURED_KV.get("featured_items");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      const t = raw.trim();
      return t ? t.split(",").map((k) => k.trim()).filter(Boolean) : [];
    }
  } catch {
    return [];
  }
}
function safeJson(obj) { return JSON.stringify(obj).replace(/<\//g, '<\\/'); }
function renderPage(navData, heroImages, featuredKeys, nsfwFlag) {
  const dataJson = safeJson(navData);
  const heroJson = safeJson(heroImages);
  const featJson = safeJson(featuredKeys);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>GALNAVI - ACG 二次元资源聚合导航</title>
<meta name="description" content="一个专注于 ACG 二次元资源网站聚合与收录的纯净导航站点。纯净无广，秒速响应，一站直达。">
<meta name="keywords" content="GALNAVI, ACG, 二次元, 导航, 资源聚合, Galgame, 模拟器, 汉化, 工具, 网站导航">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://galnavi.top/nav/">
<meta property="og:type" content="website">
<meta property="og:title" content="GALNAVI - ACG 二次元资源聚合导航">
<meta property="og:description" content="一个专注于 ACG 二次元资源网站聚合与收录的纯净导航站点。纯净无广，秒速响应，一站直达。">
<meta property="og:url" content="https://galnavi.top/nav/">
<meta property="og:site_name" content="GALNAVI">
<meta property="og:image" content="${ASSET_ICON}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="GALNAVI - ACG 二次元资源聚合导航">
<meta name="twitter:description" content="一个专注于 ACG 二次元资源网站聚合与收录的纯净导航站点。纯净无广，秒速响应，一站直达。">
<meta name="twitter:image" content="${ASSET_ICON}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"GALNAVI","url":"https://galnavi.top/nav/","description":"ACG 二次元资源聚合导航站","potentialAction":{"@type":"SearchAction","target":"https://galnavi.top/nav/?q={search_term_string}","query-input":"required name=search_term_string"}}
</script>
<link rel="icon" type="image/png" href="${ASSET_FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">

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

/* ===== src/foundation/tokens/gd-glass.css ===== */
/* gd-glass — 玻璃表面工具类（卡片级无模糊 / 浮层级带模糊 / 顶栏级强玻璃） */

.gd-glass {
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.gd-glass--blur {
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  backdrop-filter: var(--gd-glass-blur);
  -webkit-backdrop-filter: var(--gd-glass-blur);
}

.gd-glass--strong {
  background: var(--gd-glass-nav-bg);
  border: 1px solid var(--gd-glass-border);
  backdrop-filter: var(--gd-glass-nav-blur);
  -webkit-backdrop-filter: var(--gd-glass-nav-blur);
}

/* ===== src/foundation/layout/gd-layout.css ===== */
/* layout — 后置轻量分区，仅展示用 */

/* 全局隐藏滚动条（桌面 + 移动） */
html {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
html::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}
html::-webkit-scrollbar-track,
html::-webkit-scrollbar-thumb {
  background: transparent;
}

.gd-section { margin-bottom: 40px; }
.gd-section__title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--gd-type-title-xxl-size);
  font-weight: var(--gd-weight-bold);
  color: var(--gd-color-on-surface);
  margin: 0 0 18px;
}
.gd-section__title::before {
  content: "";
  display: block;
  width: 4px;
  height: 22px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--gd-color-primary), var(--gd-color-secondary));
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
  background-color: var(--gd-color-background);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  overflow: hidden;
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

/* ===== src/foundation/layout/gd-footer.css ===== */
.gd-footer {
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
/* 导航栏内使用：缩小到导航栏标题级别，保留发光动效 */
.gd-navbar .gd-brand__title,
.gd-navbar .gd-brand__title--shift,
.gd-navbar .gd-brand__title--palace {
  font-size: var(--gd-type-title-xxl-size);
  line-height: 1.2;
  letter-spacing: var(--gd-type-letter-spacing-tight);
  text-shadow: 0 0 14px rgba(var(--gd-color-primary-rgb), 0.35);
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
  overflow: hidden;
  transition:
    border-color 0.2s var(--gd-motion-easing-standard),
    background 0.2s var(--gd-motion-easing-standard),
    transform 0.2s var(--gd-motion-easing-standard),
    color 0.2s var(--gd-motion-easing-standard);
}
.gd-button--back::before { border-radius: inherit; }
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

/* ===== src/navigation/navbar/gd-navbar.css ===== */
/* gd-navbar — 顶栏 / 汉堡 / 抽屉 */

.gd-navbar {
  position: relative;
  z-index: 100;
  height: var(--gd-nav-height);
  background: var(--gd-chrome-bar-bg);
  backdrop-filter: var(--gd-glass-nav-blur);
  -webkit-backdrop-filter: var(--gd-glass-nav-blur);
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  box-shadow: none;
}
.gd-navbar,
.gd-navbar button,
.gd-navbar input,
.gd-navbar a,
.gd-navbar-drawer,
.gd-navbar-drawer button,
.gd-navbar-drawer a {
  font-family: var(--gd-font-sans);
}

.gd-navbar__inner {
  max-width: var(--gd-layout-max-width);
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.gd-navbar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
  margin-right: 16px;
}
.gd-navbar__logo-img {
  height: 36px;
  width: auto;
  display: block;
}
.gd-navbar__logo-text {
  margin: 0;
  padding: 0;
  font-size: var(--gd-type-title-xxl-size);
  font-weight: var(--gd-weight-extrabold);
  line-height: 1.2;
  letter-spacing: var(--gd-type-letter-spacing-tight);
  background: linear-gradient(135deg, var(--gd-gradient-title-a) 0%, var(--gd-gradient-title-b) 30%, var(--gd-gradient-title-c) 60%, var(--gd-gradient-title-d) 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gd-nav-logo-shift 8s ease infinite;
}
@keyframes gd-nav-logo-shift {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.82; }
}

.gd-navbar__links {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
  max-width: 740px;
  transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-navbar__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--gd-shape-corner-full);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-normal);
  color: var(--gd-color-on-surface-variant);
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid transparent;
  background: transparent;
  font-family: inherit;
}
.gd-navbar__link:hover {
  color: var(--gd-color-on-surface);
  background: rgba(var(--gd-color-white-rgb), 0.05);
  border-color: rgba(var(--gd-color-white-rgb), 0.06);
}
.gd-navbar__link.is-active {
  color: var(--gd-color-primary);
  background: var(--gd-color-primary-container);
  border-color: rgba(var(--gd-color-primary-rgb), 0.2);
  box-shadow: none;
}
.gd-navbar__link:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}

/* 链接数量徽章 — 复用 gd-badge（通用徽标组件） */
.gd-navbar__count { vertical-align: middle; }
.gd-navbar__link.is-active .gd-navbar__count {
  color: var(--gd-badge-blue-fg);
  background: var(--gd-badge-blue-bg);
  font-weight: var(--gd-weight-bold);
}

.gd-navbar__search {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  width: auto;
  max-width: none;
  min-width: 0;
  margin: 0 0 0 auto;
  transition: opacity 0.3s;
}
.gd-navbar__search.is-expanded,
.gd-navbar__search .gd-search.is-expanded {
  width: auto;
  max-width: 300px;
}
.gd-navbar__inner > .gd-search,
.gd-navbar__search .gd-search {
  flex: 0 0 auto;
  width: 300px;
  max-width: 300px;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-navbar__search:has(.gd-search__help) .gd-search,
.gd-navbar__inner > .gd-search:has(.gd-search__help) {
  overflow: visible;
}

.gd-navbar__right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
  position: relative;
  z-index: 2;
}
.gd-navbar__icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gd-color-on-surface-variant);
  text-decoration: none;
  transition: all 0.25s ease;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--gd-type-title-small-size);
  font-weight: var(--gd-weight-semibold);
}
.gd-navbar__icon-btn:hover {
  color: var(--gd-color-on-surface);
  background: rgba(var(--gd-color-white-rgb), 0.05);
  border-color: rgba(var(--gd-color-white-rgb), 0.06);
}
.gd-navbar__icon-btn:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}

.gd-tooltip-wrap { position: relative; display: inline-flex; }
.gd-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%) translateY(4px);
  padding: 8px 12px;
  border-radius: var(--gd-shape-corner-extra-small);
  background: var(--gd-color-overlay-float);
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.12);
  color: var(--gd-color-on-surface);
  font-size: var(--gd-type-body-small-size);
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
  z-index: 20;
}

/* 桌面端 NSFW：红底隐藏 / 绿底显示；点击闪「开/关」再回到盾牌 */
.gd-navbar__nsfw {
  position: relative;
  overflow: hidden;
  width: var(--gd-touch-target);
  height: var(--gd-touch-target);
  padding: 0;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--gd-color-background);
  background: var(--gd-color-error);
  border: none;
  box-shadow: 0 4px 18px rgba(var(--gd-color-error-rgb), 0.28);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  transition:
    color var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    background var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    filter var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    box-shadow var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-navbar__nsfw svg {
  display: block;
  width: 22px;
  height: 22px;
}
.gd-navbar__nsfw:hover {
  filter: brightness(1.06);
}
.gd-navbar__nsfw.is-on {
  color: var(--gd-color-background);
  background: var(--gd-color-success);
  box-shadow: 0 4px 18px rgba(var(--gd-color-green-light-rgb), 0.28);
}
.gd-navbar__nsfw:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-navbar__nsfw-face {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.gd-navbar__nsfw.is-flash .gd-navbar__nsfw-face { visibility: hidden; }
.gd-navbar__nsfw-msg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font: inherit;
  color: inherit;
  pointer-events: none;
  z-index: 1;
}
.gd-navbar__nsfw-msg[hidden] { display: none; }
.gd-tooltip-wrap:has([data-gd-nsfw]) .gd-tooltip {
  bottom: auto;
  top: calc(100% + 8px);
  transform: translateX(-50%) translateY(-4px);
  z-index: 120;
}
.gd-tooltip-wrap:has([data-gd-nsfw]):focus-within .gd-tooltip {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
.gd-tooltip-wrap:has([data-gd-nsfw]):hover .gd-tooltip,
.gd-navbar__nsfw:focus-visible + .gd-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .gd-navbar__nsfw,
  .gd-navbar-drawer__nsfw { transition: none; }
}

/* 汉堡：桌面隐藏；移动端显示并 order:-1 到左侧（现网） */
.gd-navbar__hamburger {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: var(--gd-shape-corner-small);
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 200;
  color: var(--gd-color-on-surface);
  padding: 0;
  flex-shrink: 0;
}
.gd-navbar.is-drawer-open {
  z-index: 230;
}
.gd-navbar.is-drawer-open .gd-navbar__hamburger {
  z-index: 240;
}
.gd-navbar__hamburger svg,
.gd-hamburger-motion svg {
  display: block;
  width: 22px;
  height: 22px;
  position: absolute;
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-navbar__hamburger .gd-navbar__icon-menu,
.gd-hamburger-motion .gd-hamburger-motion__menu {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
.gd-navbar__hamburger .gd-navbar__icon-close,
.gd-hamburger-motion .gd-hamburger-motion__close {
  opacity: 0;
  transform: rotate(-90deg) scale(0.7);
}
.gd-navbar.is-drawer-open .gd-navbar__hamburger .gd-navbar__icon-menu {
  opacity: 0;
  transform: rotate(90deg) scale(0.7);
}
.gd-navbar.is-drawer-open .gd-navbar__hamburger .gd-navbar__icon-close {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__menu {
  opacity: 0;
  transform: rotate(90deg) scale(0.7);
}
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__close {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
.gd-hamburger-motion .gd-hamburger-motion__menu {
  transform: translate(-50%, -50%) rotate(0deg) scale(1);
}
.gd-hamburger-motion .gd-hamburger-motion__close {
  transform: translate(-50%, -50%) rotate(-90deg) scale(0.7);
}
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__menu {
  transform: translate(-50%, -50%) rotate(90deg) scale(0.7);
}
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__close {
  transform: translate(-50%, -50%) rotate(0deg) scale(1);
}
.gd-navbar__hamburger:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}

/* 抽屉 */
.gd-navbar-drawer-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  z-index: 150;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}
.gd-navbar-drawer-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}
.gd-navbar-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100dvh;
  background: var(--gd-color-overlay-float);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  z-index: 160;
  padding: var(--gd-nav-height) 12px calc(56px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 4px;
  transform: translateX(-104%);
  visibility: hidden;
  pointer-events: none;
  transition:
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 0.34s;
  will-change: transform;
  border-right: 1px solid rgba(var(--gd-color-primary-rgb), 0.08);
  box-shadow: none;
  overflow-y: auto;
  scrollbar-width: none;
}
.gd-navbar-drawer::-webkit-scrollbar { display: none; }
.gd-navbar-drawer.is-open {
  transform: translateX(0);
  visibility: visible;
  pointer-events: auto;
  transition:
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 0s;
}
.gd-navbar-drawer__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gd-color-outline);
  margin-bottom: 8px;
}
.gd-navbar-drawer__logo .gd-navbar__logo-img { height: 30px; }
.gd-navbar-drawer__brand {
  font-size: var(--gd-type-title-xxl-size);
  font-weight: var(--gd-weight-extrabold);
  letter-spacing: var(--gd-type-letter-spacing-tight);
  line-height: 1.2;
  background: linear-gradient(135deg, var(--gd-gradient-title-a) 0%, var(--gd-gradient-title-b) 30%, var(--gd-gradient-title-c) 60%, var(--gd-gradient-title-d) 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gd-nav-logo-shift 8s ease infinite;
}
.gd-navbar-drawer .gd-navbar__link {
  width: 100%;
  justify-content: flex-start;
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  padding: 10px 12px;
  min-height: var(--gd-touch-target);
  border-radius: 12px;
  text-align: left;
}

/* 抽屉手风琴 */
.gd-navbar-drawer__acc { margin-bottom: 4px; }
.gd-navbar-drawer__acc-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--gd-color-on-surface);
  font-family: inherit;
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-normal);
  cursor: pointer;
  text-align: left;
}
.gd-navbar-drawer__acc-toggle:hover { rgba(var(--gd-color-white-rgb), 0.04); }
.gd-navbar-drawer__acc-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--gd-color-on-surface-variant);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-navbar-drawer__acc.is-open .gd-navbar-drawer__acc-chevron { transform: rotate(180deg); }
.gd-navbar-drawer__acc-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-navbar-drawer__acc.is-open .gd-navbar-drawer__acc-body { grid-template-rows: 1fr; }
.gd-navbar-drawer__acc-inner { overflow: hidden; min-height: 0; }
.gd-navbar-drawer__acc-inner > * {
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-navbar-drawer__acc.is-open .gd-navbar-drawer__acc-inner > * {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.06s;
}
.gd-navbar-drawer__links,
.gd-navbar-drawer__extras {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 4px 8px;
}
.gd-navbar-drawer__extra {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 0;
  color: var(--gd-color-on-surface-variant);
  text-decoration: none;
  text-align: left;
  font-family: inherit;
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-normal);
  background: transparent;
  cursor: pointer;
}
.gd-navbar-drawer__extra:hover { background: rgba(var(--gd-color-white-rgb), 0.05); }
.gd-navbar-drawer__extra-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gd-color-on-surface-variant);
}
.gd-navbar-drawer__extra-icon svg {
  display: block;
  width: 20px;
  height: 20px;
}
.gd-navbar-drawer__extra:hover .gd-navbar-drawer__extra-icon {
  color: var(--gd-color-primary);
}

.gd-navbar-drawer__footer {
  margin-top: auto;
  padding-top: 12px;
  padding-bottom: 8px;
  border-top: 1px solid rgba(var(--gd-color-primary-rgb), 0.08);
}
.gd-navbar-drawer__nsfw {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gd-space-2);
  width: 100%;
  min-height: var(--gd-touch-target);
  min-width: var(--gd-touch-target);
  padding: 10px 18px;
  border: none;
  border-radius: var(--gd-shape-corner-full);
  background: var(--gd-color-error);
  color: var(--gd-color-background);
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  line-height: var(--gd-type-label-large-line);
  letter-spacing: var(--gd-type-letter-spacing-normal);
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(var(--gd-color-error-rgb), 0.28);
  overflow: hidden;
  transition:
    background var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    filter var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    box-shadow var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-navbar-drawer__nsfw svg {
  display: block;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.gd-navbar-drawer__nsfw:hover {
  filter: brightness(1.06);
}
.gd-navbar-drawer__nsfw.is-on {
  background: var(--gd-color-success);
  color: var(--gd-color-background);
  box-shadow: 0 4px 18px rgba(var(--gd-color-green-light-rgb), 0.28);
}
.gd-navbar-drawer__nsfw.is-on:hover {
  filter: brightness(1.06);
}
.gd-navbar-drawer__nsfw:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .gd-navbar { justify-content: space-between; }
  .gd-navbar__inner { padding: 0 16px; }
  .gd-navbar__logo-text { display: none; }
  .gd-navbar__logo { margin-right: 0; }
  .gd-navbar__logo-img { height: 32px; }
  .gd-navbar__links { display: none; }
  .gd-navbar__right { display: none !important; }
  .gd-navbar__hamburger {
    display: flex;
    order: -1;
  }
  .gd-navbar-drawer-overlay { display: block; }
  .gd-navbar__search {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0 0 0 8px;
    width: auto;
    max-width: none;
  }
  .gd-navbar__search.is-expanded,
  .gd-navbar__search .gd-search.is-expanded {
    flex: 1 1 auto;
    width: auto;
    max-width: none;
  }
  .gd-navbar__inner > .gd-search,
  .gd-navbar__search .gd-search {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
    max-width: none;
    overflow: hidden;
  }
  .gd-navbar__search:has(.gd-search__help) .gd-search,
  .gd-navbar__inner > .gd-search:has(.gd-search__help) {
    overflow: visible;
  }
}

/* 展示页：强制手机布局预览（不依赖视口宽度） */
.gd-navbar-stage--mobile {
  width: 375px;
  max-width: 100%;
  isolation: isolate;
  border-radius: var(--gd-shape-corner-medium);
  overflow: hidden;
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.12);
}
.gd-navbar-stage--mobile .gd-navbar { justify-content: space-between; }
.gd-navbar-stage--mobile .gd-navbar {
  position: relative;
  z-index: auto;
}
.gd-navbar-stage--mobile .gd-navbar.is-drawer-open { z-index: auto; }
.gd-navbar-stage--mobile .gd-navbar__inner { padding: 0 16px; }
.gd-navbar-stage--mobile .gd-navbar__logo-text { display: none; }
.gd-navbar-stage--mobile .gd-navbar__logo { margin-right: 0; }
.gd-navbar-stage--mobile .gd-navbar__logo-img { height: 32px; }
.gd-navbar-stage--mobile .gd-navbar__links { display: none; }
.gd-navbar-stage--mobile .gd-navbar__right { display: none !important; }
.gd-navbar-stage--mobile .gd-navbar__hamburger {
  display: flex;
  order: -1;
  position: relative;
  z-index: 230;
}
.gd-navbar-stage--mobile .gd-navbar__search {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 0 0 8px;
  width: auto;
  max-width: none;
}
.gd-navbar-stage--mobile .gd-navbar__inner > .gd-search,
.gd-navbar-stage--mobile .gd-navbar__search .gd-search {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  max-width: none;
  overflow: hidden;
}
.gd-navbar-stage--mobile .gd-navbar__search:has(.gd-search__help) .gd-search,
.gd-navbar-stage--mobile .gd-navbar__inner > .gd-search:has(.gd-search__help) {
  overflow: visible;
}
/* 手机预览里抽屉用 absolute，避免盖住整页 */
.gd-navbar-stage--mobile {
  position: relative;
  /* 展示框整体高于内部控件，内部再按汉堡 > 抽屉排列 */
  z-index: 400;
  min-height: 720px;
  /* 预览抽屉收起时裁掉框外区域，避免左侧残留一条抽屉 */
  overflow: hidden;
}
.gd-navbar-stage--mobile.is-drawer-open {
  z-index: 400;
}
.gd-navbar-stage--mobile .gd-navbar-drawer-overlay {
  display: block;
  position: absolute;
  z-index: 200;
}
.gd-navbar-stage--mobile .gd-navbar-drawer {
  position: absolute;
  height: 100%;
  z-index: 220;
  padding-top: 72px;
}

/* 圣器殿堂分类导航 */
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

/* ===== src/navigation/search/gd-search.css ===== */
gd-search { display: contents; }

.gd-search {
  display: flex;
  align-items: center;
  width: 220px;
  flex-shrink: 0;
  transition: none;
}
.gd-search.is-expanded { width: 100%; }
.gd-search__box { width: 100%; position: relative; overflow: visible; }
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
.gd-search__clear:hover { background: rgba(var(--gd-color-white-rgb), 0.15); color: var(--gd-color-on-surface); }
.gd-search__box:has(.gd-search__help) .gd-search__input { padding-right: 64px; }
.gd-search__box:has(.gd-search__help) .gd-search__clear { right: 34px; }
.gd-search:has(.gd-search__help) {
  overflow: visible;
}
.gd-search__help-wrap {
  position: absolute;
  right: 6px;
  top: 50%;
  margin-top: -12px;
  z-index: 150;
}
.gd-search__help {
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--gd-color-on-surface-variant);
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  line-height: 1;
  cursor: help;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gd-search__help:hover,
.gd-search__help:focus-visible {
  color: var(--gd-color-on-surface);
  background: rgba(var(--gd-color-white-rgb), 0.08);
}
.gd-search__help:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-search__help-tip {
  left: auto;
  right: 0;
  bottom: auto;
  top: calc(100% + 8px);
  transform: none;
  white-space: pre-line;
  width: max-content;
  max-width: min(320px, 86vw);
  text-align: left;
  z-index: 150;
}
.gd-search__help-wrap:hover .gd-search__help-tip,
.gd-search__help-wrap:focus-within .gd-search__help-tip,
.gd-search__help-wrap.is-open .gd-search__help-tip {
  opacity: 1;
  transform: none;
  left: auto;
  right: 0;
  bottom: auto;
  top: calc(100% + 8px);
}
@media (prefers-reduced-motion: reduce) {
  .gd-search__help-tip { transition: none; }
}
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
.gd-search--group .gd-search__box:has(.gd-search__help) .gd-search__input { padding-right: 76px; }
.gd-search--group .gd-search__box:has(.gd-search__help) .gd-search__clear { right: 40px; }
.gd-search--group .gd-search__help { width: 28px; height: 28px; min-width: 28px; min-height: 28px; }
.gd-search--group .gd-search__clear:hover { background: rgba(var(--gd-color-error-rgb), 0.25); color: var(--gd-color-error-light); }

/* 搜索词高亮：蓝色（普通）/ 橙色（神魔殿堂），走 token */
.gd-search__hl,
.gd-search mark,
.gd-search .mark {
  background: rgba(var(--gd-color-primary-rgb), 0.28);
  color: var(--gd-color-on-surface);
  border-radius: 3px;
  padding: 0 2px;
  font: inherit;
}
.gd-search__hl--orange,
.gd-search mark.gd-mark--orange,
.gd-search .mark--orange {
  background: rgba(var(--gd-color-gold-rgb), 0.28);
  color: var(--gd-color-on-surface);
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
  width: min(420px, 100%);
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
  justify-content: flex-start;
}

/* 主站卡片按钮 */
.gd-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
}
.gd-card__actions .gd-button--detail,
.gd-card__actions .gd-button--link {
  flex: 1 1 0;
  width: auto;
  min-width: 0;
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

/* ===== src/display/badge/gd-badge.css ===== */
/* gd-badge — 徽标数（由 navbar 计数泛化） */

.gd-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 17px;
  min-width: 22px;
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-bold);
  line-height: 1;
  white-space: nowrap;
  padding: 0 8px;
  border-radius: 10px;
  color: var(--gd-badge-fg);
  background: var(--gd-badge-bg);
}

.gd-badge--blue {
  color: var(--gd-badge-blue-fg);
  background: var(--gd-badge-blue-bg);
}

.gd-badge--gold {
  color: var(--gd-badge-gold-fg);
  background: var(--gd-badge-gold-bg);
}

.gd-badge--pill {
  border-radius: var(--gd-shape-corner-full);
}

/* ===== src/display/hero-carousel/gd-hero-carousel.css ===== */
.gd-hero {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  border-radius: var(--gd-shape-corner-medium);
  overflow: hidden;
  position: relative;
  aspect-ratio: 2 / 1;
  max-height: 400px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(var(--gd-color-primary-rgb), 0.08);
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.08);
}
.gd-hero__track { width: 100%; height: 100%; position: relative; }
.gd-hero__slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--gd-motion-duration-medium4) var(--gd-motion-easing-standard);
  background-size: cover;
  background-position: center;
}
.gd-hero__slide.is-active { opacity: 1; }
/* 预览用渐变占位（组件库总览页） */
.gd-hero__slide--demo-1 { background-image: linear-gradient(135deg, #1e3a5f, #4f7cff); }
.gd-hero__slide--demo-2 { background-image: linear-gradient(135deg, #3b0764, #a855f7); }
.gd-hero__slide--demo-3 { background-image: linear-gradient(135deg, #831843, #ec4899); }
.gd-hero__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(var(--gd-color-navy-rgb), 0.8) 0%, rgba(var(--gd-color-navy-rgb), 0.2) 40%, transparent 60%, rgba(var(--gd-color-navy-rgb), 0.3) 100%);
  pointer-events: none;
}
.gd-hero__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border-radius: 50%;
  background: rgba(var(--gd-color-navy-rgb), 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.15);
  color: var(--gd-color-on-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard), border-color var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard), box-shadow var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard);
}
.gd-hero__arrow svg {
  display: block;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}
.gd-hero__arrow:hover {
  background: rgba(var(--gd-color-primary-rgb), 0.25);
  border-color: rgba(var(--gd-color-primary-rgb), 0.4);
  box-shadow: 0 0 20px rgba(var(--gd-color-primary-rgb), 0.2);
}
.gd-hero__arrow:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-hero__arrow--prev { left: 16px; }
.gd-hero__arrow--next { right: 16px; }
.gd-hero__dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}
.gd-hero__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: rgba(var(--gd-color-white-rgb), 0.3);
  cursor: pointer;
  transition: all var(--gd-motion-duration-medium2) var(--gd-motion-easing-standard);
}
.gd-hero__dot.is-active {
  background: var(--gd-color-primary);
  width: 32px;
  border-radius: 5px;
  box-shadow: 0 0 12px rgba(var(--gd-color-primary-rgb), 0.4);
}

.gd-hero.is-loading .gd-hero__arrow,
.gd-hero.is-loading .gd-hero__dots,
.gd-hero.is-loading .gd-hero__gradient {
  visibility: hidden;
}
.gd-hero .gd-skeleton--hero {
  position: absolute;
  inset: 0;
  z-index: 6;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  aspect-ratio: auto;
  margin: 0;
  border: 0;
  border-radius: 0;
}

/* ===== src/display/empty-state/gd-empty-state.css ===== */
.gd-empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--gd-color-on-surface-variant);
}
.gd-empty-state__icon {
  font-size: var(--gd-type-display-medium-size);
  line-height: 1;
  margin-bottom: 16px;
  opacity: 0.85;
}
.gd-empty-state__title {
  margin: 0 0 8px;
  font-size: var(--gd-type-title-large-size);
  font-weight: var(--gd-weight-bold);
  color: var(--gd-color-on-surface);
}
.gd-empty-state__desc {
  margin: 0 0 20px;
  font-size: var(--gd-type-body-medium-size);
  line-height: 1.7;
}
.gd-empty-state__actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ===== src/feedback/modal/gd-modal.css ===== */
/* gd-modal — 玻璃/遮罩数值冻结；开闭动效保留 */
.gd-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--gd-color-overlay);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard);
}
.gd-modal-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}
.gd-modal-overlay.is-open > .gd-modal {
  transform: scale(1);
}
.gd-modal {
  width: min(92vw, 400px);
  padding: 28px 24px 22px;
  border-radius: var(--gd-shape-corner-medium);
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.14);
  background: linear-gradient(180deg, var(--gd-color-card-gradient-a), var(--gd-color-card-gradient-b));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  text-align: center;
  transform: scale(0.96);
  transition: transform var(--gd-motion-duration-medium2) var(--gd-motion-easing-emphasized);
}
.gd-modal.is-demo {
  position: relative;
  width: 100%;
  max-width: 360px;
  margin: 12px auto 0;
  transform: none;
  pointer-events: none;
}
.gd-modal__title {
  margin: 0 0 12px;
  font-size: var(--gd-type-title-large-size);
  font-weight: var(--gd-weight-extrabold);
  color: var(--gd-color-on-surface);
}
/* 纳普等弹窗：标题下图片预留位 */
.gd-modal__media {
  width: min(100%, 280px);
  aspect-ratio: 1 / 1;
  margin: 0 auto 16px;
  border-radius: 14px;
  border: 1px dashed var(--gd-color-demo-dash);
  background:
    linear-gradient(135deg, rgba(var(--gd-color-primary-rgb), 0.08), rgba(var(--gd-color-secondary-rgb), 0.06)),
    rgba(var(--gd-color-white-rgb), 0.03);
  color: var(--gd-color-on-surface-variant);
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.gd-modal__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.gd-modal__media:empty::before {
  content: "图片预留位";
}
.gd-modal__body {
  margin: 0 0 22px;
  font-size: var(--gd-type-body-medium-size);
  line-height: 1.75;
  color: var(--gd-color-on-surface-variant);
}
.gd-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.gd-modal__actions--row {
  flex-direction: row;
}

/* redirect variant */
.gd-modal-overlay--redirect {
  flex-direction: column;
  background: var(--gd-color-overlay-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 9999;
}
.gd-redirect-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(var(--gd-color-primary-rgb), 0.15);
  border-top-color: var(--gd-color-primary);
  animation: gd-redirect-spin 0.8s linear infinite;
  margin-bottom: 32px;
}
@keyframes gd-redirect-spin { to { transform: rotate(360deg); } }
.gd-redirect-text {
  font-size: var(--gd-type-title-xxl-size);
  font-weight: var(--gd-weight-semibold);
  color: var(--gd-color-on-surface);
  margin-bottom: 12px;
}
.gd-redirect-countdown {
  font-size: var(--gd-type-display-medium-size);
  font-weight: var(--gd-weight-extrabold);
  background: linear-gradient(135deg, var(--gd-gradient-title-a) 0%, var(--gd-gradient-title-b) 30%, var(--gd-gradient-title-c) 60%, var(--gd-gradient-title-d) 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gd-brand-flow 3s ease-in-out infinite;
}

/* nap variant */
.gd-modal-overlay--nap {
  background: var(--gd-color-overlay);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.gd-modal--nap {
  position: relative;
  width: min(90vw, 560px);
  max-height: min(90vh, 640px);
  padding: 44px 20px 24px;
  background: linear-gradient(180deg, var(--gd-color-card-gradient-a) 0%, var(--gd-color-card-gradient-b) 100%);
  border: 1px solid var(--gd-color-primary-container);
  border-radius: var(--gd-shape-corner-medium);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38), 0 0 80px rgba(var(--gd-color-primary-rgb), 0.18);
  transform: translateY(8px) scale(0.92);
}
.gd-modal-overlay--nap.is-open .gd-modal--nap {
  transform: translateY(0) scale(1);
}
.gd-nap__image {
  width: auto;
  height: auto;
  max-width: 440px;
  max-height: 440px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32);
  display: block;
}
.gd-modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  min-width: var(--gd-touch-target);
  min-height: var(--gd-touch-target);
  border-radius: 10px;
  background: rgba(var(--gd-color-white-rgb), 0.055);
  border: 1px solid var(--gd-color-outline);
  color: rgba(var(--gd-color-muted-white-rgb), 0.44);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gd-modal__close:hover {
  background: rgba(var(--gd-color-white-rgb), 0.095);
  color: var(--gd-color-on-surface);
}
.gd-modal__close:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .gd-redirect-ring,
  .gd-redirect-countdown { animation: none; }
}

/* ===== src/feedback/skeleton/gd-skeleton.css ===== */
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
  max-width: 420px;
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
.gd-skeleton--detail .gd-skeleton__header {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
}
.gd-skeleton--detail .gd-skeleton__title {
  width: 46%;
  height: 54px;
  border-radius: 12px;
  margin-bottom: 15px;
}
.gd-skeleton--detail .gd-skeleton__desc {
  width: 68%;
  height: 25px;
  border-radius: 7px;
  margin-bottom: 15px;
}
.gd-skeleton--detail .gd-skeleton__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.gd-skeleton--detail .gd-skeleton__tag {
  width: 74px;
  height: 29px;
  border-radius: 9999px;
}
.gd-skeleton--detail .gd-skeleton__banner {
  padding: 20px 22px;
  border-radius: var(--gd-shape-corner-medium);
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.gd-skeleton--detail .gd-skeleton__banner-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.gd-skeleton--detail .gd-skeleton__banner-icon {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  flex-shrink: 0;
}
.gd-skeleton--detail .gd-skeleton__banner-label {
  width: 90px;
  height: 18px;
  border-radius: 8px;
}
.gd-skeleton--detail .gd-skeleton__banner-item {
  height: 45px;
  border-radius: 12px;
}
.gd-skeleton--detail .gd-skeleton__banner .gd-skeleton__card-line {
  display: none;
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
  gap: 12px;
  padding: 18px;
  border-radius: var(--gd-shape-corner-medium);
  background: var(--gd-glass-bg);
  border: 1px solid var(--gd-glass-border);
  box-sizing: border-box;
}
.gd-skeleton--detail .gd-skeleton__card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}
.gd-skeleton--detail .gd-skeleton__card-icon {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  flex-shrink: 0;
  color: rgba(var(--gd-color-white-rgb), 0.18);
}
.gd-skeleton--detail .gd-skeleton__card-size {
  width: 90px;
  height: 18px;
  border-radius: 8px;
}
.gd-skeleton--detail .gd-skeleton__card-line {
  width: 100%;
  height: 45px;
  border-radius: 12px;
}
.gd-skeleton--detail .gd-skeleton__card-line--sm { width: 70%; height: 45px; }

@media (max-width: 768px) {
  .gd-skeleton--detail .gd-skeleton__grid {
    grid-template-columns: 1fr;
  }
  .gd-skeleton--card {
    max-width: none;
  }
  .gd-skeleton--card .gd-skeleton__actions {
    flex-wrap: wrap;
  }
  .gd-skeleton--card .gd-skeleton__btn {
    flex: 1 1 0;
    min-width: 0;
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

*{margin:0;padding:0;box-sizing:border-box}
html{height:auto;min-height:100%;min-height:100vh;min-height:100dvh;min-height:var(--gd-vvh,100dvh);font-size:16px;-webkit-text-size-adjust:100%;text-size-adjust:100%;background:var(--gd-color-background);scroll-padding-top:calc(var(--gd-nav-height) + var(--gd-below-nav-h,80px) + 8px)}
body{font-family:var(--gd-font-sans);color:var(--gd-color-on-surface);line-height:1.65;letter-spacing:0.01em;min-height:100vh;min-height:100dvh;min-height:var(--gd-vvh,100dvh);display:flex;flex-direction:column;overflow-x:hidden;padding-top:calc(var(--gd-nav-height) + var(--gd-below-nav-h,80px));text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
a{color:var(--gd-color-link);text-decoration:none}a:hover{color:var(--gd-color-link-hover)}
::selection{background:rgba(var(--gd-color-primary-rgb),0.38);color:#fff}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}

.page-container{
  --gd-card-w:420px;
  --gd-card-h:248px;
  --gd-card-gap:14px;
  --gd-card-cols:6;
  --gd-page-gutter:32px;
  position:relative;
  z-index:1;
  width:100%;
  margin:0 auto;
  padding:16px var(--gd-page-gutter) 36px;
  flex:1 1 auto;
  min-height:0;
  box-sizing:border-box;
  max-width:calc(var(--gd-card-cols) * var(--gd-card-w) + (var(--gd-card-cols) - 1) * var(--gd-card-gap) + 2 * var(--gd-page-gutter));
}
.gd-groundback{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100dvh!important;min-width:100%!important;min-height:100%!important;z-index:0}
html{overflow-x:hidden}
.gd-footer{position:relative;z-index:1;flex-shrink:0;margin-top:auto;width:100%;box-sizing:border-box}
.gd-footer--page{padding-top:24px}

.gd-below-nav{position:fixed;top:var(--gd-nav-height);left:0;right:0;z-index:90;background:var(--gd-chrome-bar-bg);backdrop-filter:var(--gd-glass-nav-blur);-webkit-backdrop-filter:var(--gd-glass-nav-blur);border-bottom:1px solid rgba(var(--gd-color-primary-rgb),0.14)}
.gd-notice-led{height:36px;overflow:hidden;color:var(--gd-color-on-surface);font-size:var(--gd-type-label-large-size);font-weight:var(--gd-weight-semibold);cursor:default}
.gd-notice-led__track{display:flex;width:max-content;animation:gd-led-marquee var(--gd-notice-led-duration, 22s) linear infinite}
.gd-notice-led:hover .gd-notice-led__track,.gd-notice-led:focus-within .gd-notice-led__track{animation-play-state:paused}
.gd-notice-led__item{padding:0 64px;white-space:nowrap;line-height:36px}
@keyframes gd-led-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.gd-rec-tags{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:8px 16px;min-height:44px;font-size:var(--gd-type-label-large-size);color:var(--gd-color-on-surface-subtle)}
.gd-rec-tags__label{flex-shrink:0;font-weight:var(--gd-weight-semibold);color:var(--gd-color-on-surface)}
.gd-rec-tags .gd-tag{min-height:30px;-webkit-appearance:none;appearance:none;margin:0}
.gd-rec-tags__more{margin-left:4px;white-space:nowrap;min-height:48px;display:inline-flex;align-items:center;padding:0 8px}
.gd-navbar__search{position:relative;overflow:visible;z-index:3}
.gd-navbar__search .gd-search{overflow:visible}
.gd-search-hist{display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;min-width:220px;z-index:130;padding:10px 10px 8px;border-radius:12px;background:var(--gd-color-surface);border:1px solid var(--gd-glass-border);max-height:min(280px,50vh);overflow:auto}
.gd-search-hist.is-open{display:block}
.gd-search-hist__bar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.gd-search-hist__title{font-size:var(--gd-type-label-medium-size);color:var(--gd-color-on-surface-subtle);font-weight:var(--gd-weight-semibold)}
.gd-search-hist__clear{border:0;background:transparent;color:var(--gd-color-link);font:inherit;font-size:var(--gd-type-label-medium-size);font-weight:var(--gd-weight-semibold);cursor:pointer;min-height:32px;padding:4px 8px}
.gd-search-hist__clear:hover{color:var(--gd-color-link-hover)}
.gd-search-hist__clear:focus-visible{outline:2px solid var(--gd-color-primary);outline-offset:2px}
.gd-search-hist__list{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.gd-search-hist__chip{display:inline-flex;align-items:center;gap:0;max-width:100%}
.gd-search-hist__chip .gd-tag{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-top-right-radius:0;border-bottom-right-radius:0;padding-right:8px;-webkit-appearance:none;appearance:none;margin:0}
.gd-search-hist__x{display:inline-flex;align-items:center;justify-content:center;width:30px;min-width:30px;height:30px;margin:0;padding:0;border:1px solid var(--gd-tag-1-border);border-left:0;border-radius:0 var(--gd-shape-corner-full) var(--gd-shape-corner-full) 0;background:var(--gd-tag-1-bg);color:var(--gd-tag-1-fg);cursor:pointer;font-size:14px;line-height:1}
.gd-search-hist__x:hover{filter:brightness(1.15);color:var(--gd-color-error)}
.gd-search-hist__x:focus-visible{outline:2px solid var(--gd-color-primary);outline-offset:2px}
.gd-search-hist__empty{margin:0;font-size:var(--gd-type-label-medium-size);color:var(--gd-color-on-surface-subtle)}
@media(prefers-reduced-motion:reduce){
  .gd-notice-led__track{animation:none;transform:none;width:100%;justify-content:center}
  .gd-notice-led__item:not(:first-child){display:none}
}

.gd-orb{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(20px,env(safe-area-inset-bottom,0px));z-index:80;width:56px;height:56px;pointer-events:none}
.gd-orb__menu{position:absolute;right:0;bottom:66px;display:grid;grid-template-columns:auto auto;gap:8px 10px;margin:0;padding:0;transform-origin:100% 100%;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(18px) scale(0.72);transition:opacity 0.2s ease,transform 0.32s cubic-bezier(0.22,1,0.36,1),visibility 0s linear 0.32s}
.gd-orb.is-open .gd-orb__menu{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity 0.2s ease,transform 0.32s cubic-bezier(0.22,1,0.36,1),visibility 0s linear 0s}
.gd-orb__col{display:flex;flex-direction:column;gap:8px;align-items:stretch}
.gd-orb__item{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:48px;min-width:72px;padding:0 16px;border-radius:999px;border:1px solid rgba(var(--gd-color-primary-rgb),0.28);background:var(--gd-color-surface);color:var(--gd-color-on-surface);font-family:var(--gd-font-sans);font-size:var(--gd-type-label-large-size);font-weight:var(--gd-weight-semibold);letter-spacing:var(--gd-type-letter-spacing-wide);text-decoration:none;cursor:pointer;appearance:none;-webkit-appearance:none;white-space:nowrap;opacity:0;transform:translateY(12px) scale(0.88);transition:opacity 0.2s ease,transform 0.28s cubic-bezier(0.22,1,0.36,1)}
.gd-orb.is-open .gd-orb__item{opacity:1;transform:none}
.gd-orb.is-open .gd-orb__col .gd-orb__item:nth-child(1){transition-delay:0.04s}
.gd-orb.is-open .gd-orb__col .gd-orb__item:nth-child(2){transition-delay:0.08s}
.gd-orb.is-open .gd-orb__col .gd-orb__item:nth-child(3){transition-delay:0.12s}
.gd-orb.is-open .gd-orb__col .gd-orb__item:nth-child(4){transition-delay:0.16s}
.gd-orb:not(.is-open) .gd-orb__col .gd-orb__item:nth-child(1){transition-delay:0.12s}
.gd-orb:not(.is-open) .gd-orb__col .gd-orb__item:nth-child(2){transition-delay:0.08s}
.gd-orb:not(.is-open) .gd-orb__col .gd-orb__item:nth-child(3){transition-delay:0.04s}
.gd-orb:not(.is-open) .gd-orb__col .gd-orb__item:nth-child(4){transition-delay:0s}
.gd-orb__item:hover{color:var(--gd-color-on-surface);background:rgba(var(--gd-color-primary-rgb),0.12);border-color:rgba(var(--gd-color-primary-rgb),0.4)}
.gd-orb__item:focus-visible{outline:2px solid var(--gd-color-primary);outline-offset:2px}
.gd-orb__toggle{pointer-events:auto;position:absolute;right:0;bottom:0;width:56px;height:56px;min-width:56px;min-height:56px;padding:0;border:1px solid rgba(var(--gd-color-primary-rgb),0.32);border-radius:50%;background:var(--gd-color-primary);color:var(--gd-color-on-primary);cursor:pointer;appearance:none;-webkit-appearance:none}
.gd-orb__toggle:hover{filter:brightness(1.08)}
.gd-orb__toggle:focus-visible{outline:2px solid var(--gd-color-primary);outline-offset:3px}
.gd-orb__icon{display:block;width:22px;height:22px;position:absolute;top:50%;left:50%;margin:0;transition:opacity 0.22s ease,transform 0.28s cubic-bezier(0.4,0,0.2,1)}
.gd-orb__icon--grid{opacity:1;transform:translate(-50%,-50%) rotate(0deg) scale(1)}
.gd-orb__icon--close{opacity:0;transform:translate(-50%,-50%) rotate(-90deg) scale(0.7)}
.gd-orb.is-open .gd-orb__icon--grid{opacity:0;transform:translate(-50%,-50%) rotate(90deg) scale(0.7)}
.gd-orb.is-open .gd-orb__icon--close{opacity:1;transform:translate(-50%,-50%) rotate(0deg) scale(1)}
@media(prefers-reduced-motion:reduce){
  .gd-orb__menu,.gd-orb__item,.gd-orb__icon{transition:none}
  .gd-orb__menu{transform:none}
  .gd-orb.is-open .gd-orb__menu{transform:none}
  .gd-orb__item{transform:none;opacity:1}
  .gd-orb:not(.is-open) .gd-orb__item{opacity:0}
  .gd-orb__icon--grid,.gd-orb.is-open .gd-orb__icon--close{transform:translate(-50%,-50%) rotate(0deg) scale(1)}
  .gd-orb__icon--close,.gd-orb.is-open .gd-orb__icon--grid{transform:translate(-50%,-50%) rotate(0deg) scale(0.7)}
}

/* 站点推荐 + 最最近更新：上下布局 */
.home-sections{display:flex;flex-direction:column;gap:24px}

/* 卡片网格：420×212；最多 6 列；单列时宽度自适应 */
.card-grid{
  display:grid;
  gap:var(--gd-card-gap);
  width:100%;
  max-width:calc(var(--gd-card-cols) * var(--gd-card-w) + (var(--gd-card-cols) - 1) * var(--gd-card-gap));
  grid-template-columns:repeat(auto-fill, var(--gd-card-w));
  justify-content:start;
}
.gd-card--general{
  width:var(--gd-card-w);
  height:var(--gd-card-h);
  max-width:100%;
  gap:10px;
}
.gd-card--general .gd-card__header{align-items:flex-start;gap:12px}
.gd-card--general .gd-card__title-wrap{display:flex;flex-direction:column;gap:4px;min-width:0}
.gd-card--general .gd-card__title,
.gd-card--general .gd-card__subtitle{
  margin:0;min-height:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  display:block;-webkit-line-clamp:unset;-webkit-box-orient:unset
}
.gd-card--general .gd-card__tags{
  margin:0;gap:6px;justify-content:flex-start;width:100%;max-height:66px;overflow:hidden;
}
.gd-card--general .gd-card__actions{margin-top:auto}
@media(max-width:919px){
  .page-container{--gd-page-gutter:16px}
  .card-grid{grid-template-columns:1fr;max-width:none}
  .gd-card--general{width:100%}
  .gd-skeleton--card{max-width:none}
  .gd-skeleton--card .gd-skeleton__actions{flex-wrap:wrap}
  .gd-skeleton--card .gd-skeleton__btn{flex:1 1 0;min-width:0}
}
.card-grid:not(.is-active){display:none}
.card-grid.is-active{display:grid}

/* 分类页视图 */
.page-view{display:none}
.page-view.is-active{display:block}

/* 搜索结果（按栏目分组） */
.search-results{display:none;margin-top:20px}
.search-results.is-active{display:block}

/* 标签索引页 */
.gd-tag-list{display:flex;flex-wrap:wrap;gap:10px;padding:0;margin:0;list-style:none}
.tag-search-wrap{margin-bottom:20px;max-width:360px}

/* navbar 固定 + 品牌；桌面整组居中，左右到屏幕边距相等 */
.gd-navbar{position:fixed;top:0;left:0;right:0;z-index:100;justify-content:center;overflow:visible;background:var(--gd-chrome-bar-bg);backdrop-filter:var(--gd-glass-nav-blur);-webkit-backdrop-filter:var(--gd-glass-nav-blur);border-bottom:none}
.gd-navbar__inner{width:max-content;max-width:100%;padding:0 32px;display:flex;align-items:center;gap:8px;justify-content:center;flex:0 1 auto}
.gd-navbar__logo{display:flex;align-items:center;gap:6px;text-decoration:none;flex-shrink:0;cursor:pointer}
.gd-navbar__logo-img{height:28px;width:auto;display:block}
.gd-brand__title{font-size:var(--gd-type-title-large-size);line-height:28px;cursor:pointer}

/* 桌面：logo、标签、搜索、盾牌按序紧挨，空隙走 inner 的 8px gap */
.gd-navbar__links{flex:0 0 auto;width:auto;max-width:none}
.gd-navbar__search{flex:0 0 auto;width:auto;max-width:none;margin-left:0}
.gd-navbar__search .gd-search{flex:0 0 auto;width:300px;max-width:300px}
.gd-navbar__right{margin-left:0;flex-shrink:0}
@media(max-width:768px){
  .gd-navbar__inner{width:100%;max-width:none;padding:0 12px;justify-content:space-between}
  .gd-navbar__search{flex:1 1 auto;width:auto;min-width:0;max-width:none;margin-left:8px}
  .gd-navbar__search .gd-search{flex:1 1 auto;width:100%;max-width:none}
}

/* 抽屉 NSFW：关=红，开=绿；避开手机浏览器底栏；点击闪「已开启」后再回到盾牌 */
.gd-navbar-drawer{
  height:100dvh;
  padding-bottom:calc(56px + env(safe-area-inset-bottom, 0px));
}
.gd-navbar-drawer__footer{position:relative;padding-bottom:8px}
.gd-navbar-drawer__nsfw{
  position:relative;
  overflow:hidden;
  background:var(--gd-color-error);
  color:var(--gd-color-background);
  box-shadow:0 4px 18px rgba(var(--gd-color-error-rgb),0.28);
}
.gd-navbar-drawer__nsfw.is-on{
  background:var(--gd-color-success);
  color:var(--gd-color-background);
  box-shadow:0 4px 18px rgba(var(--gd-color-green-light-rgb),0.28);
}
.gd-navbar-drawer__nsfw-face{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:var(--gd-space-2);
}
.gd-navbar-drawer__nsfw.is-flash .gd-navbar-drawer__nsfw-face{visibility:hidden}
.gd-navbar-drawer__nsfw-msg{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font:inherit;
  color:inherit;
  pointer-events:none;
  z-index:1;
}
.gd-navbar-drawer__nsfw-msg[hidden]{display:none}
@media(prefers-reduced-motion:reduce){
  .gd-navbar-drawer__nsfw{transition:none}
}

/* 电脑端收紧间距 */
.gd-section{margin-bottom:24px!important}
/* 48dp 触控热区（MD3 底线） */
.gd-navbar__link{min-height:var(--gd-touch-target)!important}
.gd-hero__arrow{width:var(--gd-touch-target)!important;height:var(--gd-touch-target)!important}
/* 搜索词高亮：在卡片标题中也生效 */
.gd-search__hl{background:rgba(var(--gd-color-primary-rgb),0.28);color:var(--gd-color-on-surface);border-radius:3px;padding:0 2px;font:inherit}

/* nav links 折叠 */
.gd-navbar__links.is-collapsed{opacity:0;max-width:0;overflow:hidden;pointer-events:none}

/* 抽屉：overlay 半透明黑色覆盖 */
.gd-navbar-drawer-overlay{background:rgba(0,0,0,0.5)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;opacity:0;transition:opacity 0.2s ease;z-index:150!important}
.gd-navbar-drawer-overlay.is-open{opacity:1}
/* 抽屉展开：navbar z-index 延迟降回，避免关闭闪烁 */
.gd-navbar.is-drawer-open{z-index:230!important}
.gd-navbar__hamburger[aria-expanded="true"]{z-index:240!important}

/* redirect overlay */
.redirect-overlay{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:var(--gd-color-overlay);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);opacity:0;pointer-events:none;transition:opacity var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard)}
.redirect-overlay.is-active{opacity:1;pointer-events:auto}
.redirect-ring{width:64px;height:64px;border-radius:50%;border:3px solid rgba(var(--gd-color-primary-rgb),0.3);border-top-color:var(--gd-color-primary);animation:redirect-spin 1s linear infinite}
@keyframes redirect-spin{to{transform:rotate(360deg)}}
.redirect-text{color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-label-large-size);font-weight:var(--gd-weight-semibold)}
.redirect-countdown{color:var(--gd-color-primary);font-size:var(--gd-type-headline-small-size);font-weight:var(--gd-weight-extrabold);font-variant-numeric:tabular-nums}
.redirect-cancel{background:transparent;border:1px solid rgba(var(--gd-color-white-rgb),0.2);color:var(--gd-color-on-surface-variant);padding:10px 24px;border-radius:var(--gd-shape-corner-full);font-size:var(--gd-type-label-large-size);font-weight:var(--gd-weight-semibold);cursor:pointer;transition:all var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);font-family:var(--gd-font-sans)}
.redirect-cancel:hover{border-color:rgba(var(--gd-color-white-rgb),0.4);color:var(--gd-color-on-surface)}
</style>
</head>
<body>
<div class="gd-groundback gd-groundback--websearch" aria-hidden="true"></div>

<!-- ===== gd-navbar ===== -->
<nav class="gd-navbar" id="mainNav" role="navigation" aria-label="主导航">
  <div class="gd-navbar__inner">
    <a class="gd-navbar__logo" href="#" id="navLogo" aria-label="GALNAVI 首页">
      <img class="gd-navbar__logo-img" src="${ASSET_LOGO}" alt="GALNAVI" width="28" height="28">
      <span class="gd-brand__title gd-brand__title--shift">GALNAVI</span>
    </a>
    <div class="gd-navbar__links" id="navLinks" data-gd-nav-links>
      <button class="gd-navbar__link is-active" data-nav="home" data-nav-cat="home" aria-current="page">首页<span class="gd-badge gd-badge--blue" data-gd-nav-count data-count-home></span></button>
      <button class="gd-navbar__link" data-nav="site" data-nav-cat="site">站点<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
      <button class="gd-navbar__link" data-nav="tool" data-nav-cat="tool">工具<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
      <button class="gd-navbar__link" data-nav="simulator" data-nav-cat="simulator">模拟器<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
      <button class="gd-navbar__link" data-nav="company" data-nav-cat="company">会社<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
      <button class="gd-navbar__link" data-nav="hanhua" data-nav-cat="hanhua">汉化组<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
    </div>
    <div class="gd-navbar__search" id="navSearchWrap">
      <div class="gd-search">
        <div class="gd-search__box">
          <span class="gd-search__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
          </span>
          <input class="gd-search__input" type="search" placeholder="你要搜什么呢" id="navSearch" aria-label="搜索资源" aria-autocomplete="list" aria-controls="navSearchHist" aria-expanded="false">
          <button type="button" class="gd-search__clear" id="navSearchClear" aria-label="清除搜索">×</button>
          <span class="gd-search__help-wrap gd-tooltip-wrap">
            <button type="button" class="gd-search__help" aria-label="搜索规则" aria-describedby="navSearchHelpTip">?</button>
            <span class="gd-tooltip gd-search__help-tip" id="navSearchHelpTip" role="tooltip">ACG[空格]小说 包含ACG或小说的卡片<br>ACG[空格]+小说，同时包含ACG和小说的卡片<br>ACG[空格]-小说，包含ACG但不能有小说的卡片</span>
          </span>
        </div>
      </div>
      <div class="gd-search-hist" id="navSearchHist" role="region" aria-label="搜索记录">
        <div class="gd-search-hist__bar">
          <span class="gd-search-hist__title">搜索记录</span>
          <button type="button" class="gd-search-hist__clear" id="navSearchHistClear">全部删除</button>
        </div>
        <ul class="gd-search-hist__list" id="navSearchHistList"></ul>
      </div>
    </div>
    <div class="gd-navbar__right">
      <span class="gd-tooltip-wrap">
        <button type="button" class="gd-navbar__nsfw" data-gd-nsfw aria-pressed="false" aria-label="NSFW 内容已隐藏">
          <span class="gd-navbar__nsfw-face" data-gd-nsfw-face>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </span>
          <span class="gd-navbar__nsfw-msg" data-gd-nsfw-msg hidden>开</span>
        </button>
        <span class="gd-tooltip" data-gd-nsfw-tip role="tooltip" aria-hidden="true">NSFW 内容已隐藏</span>
      </span>
    </div>
    <button class="gd-navbar__hamburger" id="hamburger" aria-label="菜单" aria-expanded="false" data-gd-nav-toggle aria-controls="drawer">
      <svg class="gd-navbar__icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      <svg class="gd-navbar__icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </div>
</nav>

<div class="gd-below-nav" id="belowNav">
  <div class="gd-notice-led" id="noticeLed" tabindex="0" aria-label="站点通知：GALNAVI 2正式上线，本站特色是卡片的介绍详情和后续持续更新的教程体系">
    <div class="gd-notice-led__track">
      <span class="gd-notice-led__item">GALNAVI 2正式上线，本站特色是卡片的介绍详情和后续持续更新的教程体系</span>
      <span class="gd-notice-led__item" aria-hidden="true">GALNAVI 2正式上线，本站特色是卡片的介绍详情和后续持续更新的教程体系</span>
    </div>
  </div>
  <div class="gd-rec-tags" aria-label="推荐标签">
    <span class="gd-rec-tags__label">推荐标签：</span>
    <button type="button" class="gd-tag" data-rec-tag="音乐">音乐</button>
    <button type="button" class="gd-tag" data-rec-tag="小说">小说</button>
    <button type="button" class="gd-tag" data-rec-tag="漫画">漫画</button>
    <a class="gd-link gd-rec-tags__more" href="https://galnavi.top/nav/?cat=标签" data-gd-nav-tags aria-label="更多标签">更多</a>
  </div>
</div>

<!-- 移动端抽屉 -->
<div class="gd-navbar-drawer-overlay" id="drawerOverlay"></div>
<div class="gd-navbar-drawer" id="drawer" role="dialog" aria-label="移动端导航">
  <button class="gd-navbar__link" data-nav="home" data-nav-cat="home">首页<span class="gd-badge gd-badge--blue" data-gd-nav-count data-count-home></span></button>
  <button class="gd-navbar__link" data-nav="site" data-nav-cat="site">站点<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
  <button class="gd-navbar__link" data-nav="tool" data-nav-cat="tool">工具<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
  <button class="gd-navbar__link" data-nav="simulator" data-nav-cat="simulator">模拟器<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
  <button class="gd-navbar__link" data-nav="company" data-nav-cat="company">会社<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
  <button class="gd-navbar__link" data-nav="hanhua" data-nav-cat="hanhua">汉化组<span class="gd-badge gd-badge--blue" data-gd-nav-count></span></button>
  <div class="gd-navbar-drawer__footer">
    <button type="button" class="gd-button gd-button--pill gd-button--nsfw gd-navbar-drawer__nsfw" data-gd-nsfw aria-pressed="false" aria-label="NSFW 内容已隐藏">
      <span class="gd-navbar-drawer__nsfw-face" data-gd-nsfw-face>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        NSFW
      </span>
      <span class="gd-navbar-drawer__nsfw-msg" data-gd-nsfw-msg hidden>已开启</span>
    </button>
  </div>
</div>

<!-- ===== 主内容区 ===== -->
<main class="page-container gd-page-shell" id="mainContent">

  <!-- 首页视图 -->
  <div class="page-view is-active" id="view-home" role="region" aria-label="首页内容">
    <!-- 轮播图 -->
    <section class="gd-section" aria-label="轮播图">
      <div class="gd-hero is-loading" id="heroCarousel">
        <div class="gd-skeleton gd-skeleton--hero" id="heroSkeleton" aria-hidden="true"></div>
        <div class="gd-hero__gradient"></div>
        <button class="gd-hero__arrow gd-hero__arrow--prev" id="heroPrev" aria-label="上一张">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button class="gd-hero__arrow gd-hero__arrow--next" id="heroNext" aria-label="下一张">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <div class="gd-hero__dots" id="heroDots" role="group" aria-label="幻灯片导航"></div>
      </div>
    </section>

    <!-- 搜索结果（按栏目分类） -->
    <div class="search-results" id="searchResultsContainer" role="region" aria-label="搜索结果" aria-live="polite"></div>

    <!-- 站点推荐 + 最近更新（上下布局） -->
    <div class="home-sections">
      <section class="gd-section" aria-label="站点推荐">
        <h2 class="gd-section__title" id="featuredTitle">站点推荐</h2>
        <div class="card-grid is-active" id="featuredGrid"><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div></div>
      </section>
      <section class="gd-section" aria-label="最近更新">
        <h2 class="gd-section__title" id="recentTitle">最近更新</h2>
        <div class="card-grid is-active" id="recentGrid"><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div></div>
      </section>
    </div>
  </div>

  <!-- 站点页 -->
  <div class="page-view" id="view-site" role="region" aria-label="站点列表">
    <section class="gd-section">
      <h2 class="gd-section__title">站点</h2>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-title-medium-size);font-weight:var(--gd-weight-semibold);margin-bottom:8px">Galgame / ACG 站点导航</p>
      <p style="margin-bottom:8px">
        <span class="gd-tag" style="cursor:default">云盘</span>
        <span class="gd-tag" style="cursor:default">帮助文档</span>
        <span class="gd-tag" style="cursor:default">干货站</span>
        <span class="gd-tag" style="cursor:default">表里世界</span>
      </p>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-body-large-size);margin-bottom:16px">收录各类相关站点，并通过分类与标签帮助你快速了解站点特点。</p>
      <div class="card-grid is-active" id="siteGrid"><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div></div>
    </section>
  </div>

  <!-- 工具页 -->
  <div class="page-view" id="view-tool" role="region" aria-label="工具列表">
    <section class="gd-section">
      <h2 class="gd-section__title">工具</h2>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-title-medium-size);font-weight:var(--gd-weight-semibold);margin-bottom:8px">Galgame / ACG 实用工具</p>
      <p style="margin-bottom:8px">
        <span class="gd-tag" style="cursor:default">补丁</span>
        <span class="gd-tag" style="cursor:default">转区</span>
        <span class="gd-tag" style="cursor:default">解压</span>
      </p>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-body-large-size);margin-bottom:16px">整理游戏运行和使用过程中常见的实用工具，帮助解决常见问题。</p>
      <div class="card-grid is-active" id="toolGrid"><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div></div>
    </section>
  </div>

  <!-- 模拟器页 -->
  <div class="page-view" id="view-simulator" role="region" aria-label="模拟器列表">
    <section class="gd-section">
      <h2 class="gd-section__title">模拟器</h2>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-title-medium-size);font-weight:var(--gd-weight-semibold);margin-bottom:8px">游戏模拟器与运行环境</p>
      <p style="margin-bottom:8px">
        <span class="gd-tag" style="cursor:default">Android</span>
        <span class="gd-tag" style="cursor:default">windows</span>
        <span class="gd-tag" style="cursor:default">教程</span>
      </p>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-body-large-size);margin-bottom:16px">整理不同平台的模拟器及相关使用信息，方便查找对应的运行环境。</p>
      <div class="card-grid is-active" id="simulatorGrid"><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div></div>
    </section>
  </div>

  <!-- 会社页 -->
  <div class="page-view" id="view-company" role="region" aria-label="会社列表">
    <section class="gd-section">
      <h2 class="gd-section__title">会社</h2>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-title-medium-size);font-weight:var(--gd-weight-semibold);margin-bottom:8px">Galgame 会社与制作团队</p>
      <p style="margin-bottom:8px">
        <span class="gd-tag" style="cursor:default">作品</span>
        <span class="gd-tag" style="cursor:default">同人</span>
        <span class="gd-tag" style="cursor:default">制作组</span>
      </p>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-body-large-size);margin-bottom:16px">整理相关会社、制作团队及作品信息，方便了解作品来源。</p>
      <div class="card-grid is-active" id="companyGrid"><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div></div>
    </section>
  </div>

  <!-- 汉化组页 -->
  <div class="page-view" id="view-hanhua" role="region" aria-label="汉化组列表">
    <section class="gd-section">
      <h2 class="gd-section__title">汉化组</h2>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-title-medium-size);font-weight:var(--gd-weight-semibold);margin-bottom:8px">Galgame 汉化组信息</p>
      <p style="margin-bottom:8px">
        <span class="gd-tag" style="cursor:default">汉化</span>
        <span class="gd-tag" style="cursor:default">补丁</span>
        <span class="gd-tag" style="cursor:default">翻译</span>
      </p>
      <p style="color:var(--gd-color-on-surface-variant);font-size:var(--gd-type-body-large-size);margin-bottom:16px">整理汉化组及相关作品信息，方便查找汉化作品与补丁。</p>
      <div class="card-grid is-active" id="hanhuaGrid"><div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div></div>
    </section>
  </div>

  <!-- 标签索引页 -->
  <div class="page-view" id="view-tags" role="region" aria-label="标签索引">
    <section class="gd-section">
      <h2 class="gd-section__title">标签索引</h2>
      <div class="tag-search-wrap">
        <div class="gd-search gd-search--toolbar">
          <div class="gd-search__box">
            <span class="gd-search__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
            </span>
            <input class="gd-search__input" type="search" placeholder="筛选标签" id="tagSearchInput" aria-label="筛选标签">
          </div>
        </div>
      </div>
      <div class="gd-tag-list" id="tagList" role="list" aria-label="标签列表"></div>
    </section>
  </div>

</main>

<!-- ===== gd-footer ===== -->
<footer class="gd-footer gd-footer--page" role="contentinfo">
  <nav class="gd-footer__nav" aria-label="页脚导航">
    <a href="https://galnavi.top/sitemap.xml">sitemap.xml</a><span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/robots.txt">robots.txt</a><span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="mailto:galnavifeedback@protonmail.com">联系站长</a><span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/nav/donate/">赞助本站</a><span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/nav/friend/">申请友链</a><span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/status/" target="_blank" rel="noopener noreferrer">站点状态</a>
  </nav>
  <p class="gd-footer__copy">&copy; 2026 GALNAVI · 愿每一次探索都有新的收获</p>
</footer>

<div class="gd-orb" id="wsOrb">
  <div class="gd-orb__menu" id="wsOrbMenu" role="region" aria-label="快捷入口">
    <div class="gd-orb__col" role="group" aria-label="站内入口">
      <button type="button" class="gd-orb__item" data-gd-orb="tags">标签</button>
      <button type="button" class="gd-orb__item" data-gd-orb="tavern">酒馆</button>
      <a class="gd-orb__item" href="https://github.com/argb6/gal-navigation" target="_blank" rel="noopener noreferrer">仓库</a>
      <button type="button" class="gd-orb__item" data-gd-orb="popup">弹窗</button>
    </div>
    <div class="gd-orb__col" role="group" aria-label="站点页面">
      <a class="gd-orb__item" href="https://galnavi.top/nav/about/" target="_blank" rel="noopener noreferrer">关于</a>
      <a class="gd-orb__item" href="https://galnavi.top/nav/help/" target="_blank" rel="noopener noreferrer">帮助</a>
      <a class="gd-orb__item" href="https://galnavi.top/nav/friend/" target="_blank" rel="noopener noreferrer">友链</a>
      <a class="gd-orb__item" href="https://galnavi.top/nav/palace/" target="_blank" rel="noopener noreferrer">殿堂</a>
    </div>
  </div>
  <button type="button" class="gd-orb__toggle" id="wsOrbToggle" aria-expanded="false" aria-controls="wsOrbMenu" aria-label="打开快捷入口">
    <svg class="gd-orb__icon gd-orb__icon--grid" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.6" fill="currentColor"/><rect x="13" y="3" width="8" height="8" rx="1.6" fill="currentColor"/><rect x="3" y="13" width="8" height="8" rx="1.6" fill="currentColor"/><rect x="13" y="13" width="8" height="8" rx="1.6" fill="currentColor"/></svg>
    <svg class="gd-orb__icon gd-orb__icon--close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" focusable="false" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </button>
</div>

<!-- ===== 欢迎弹窗 ===== -->
<div class="gd-modal-overlay" id="welcomeModal" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle" aria-hidden="true" data-close-on-backdrop>
  <div class="gd-modal" style="max-width:680px">
    <h2 class="gd-modal__title" id="welcomeTitle">欢迎来到 GALNAVI</h2>
    <div class="gd-modal__body" style="text-align:left">
      <p style="margin-bottom:12px">一个面向 Galgame / ACG 爱好者的站点导航与信息整理平台。</p>
      <p style="margin:0 0 12px;text-align:center;font-weight:var(--gd-weight-bold)">✨ 详情：新手优先看卡片详情✨</p>
      <ul style="list-style:none;padding:0;margin:0 0 16px;display:flex;flex-direction:column;gap:8px">
        <li>🔍 <strong>搜索</strong>：范围包括标题、标签、描述和网址。组合检索：词A +词B（同时有）、词A 词B（任一）、词A -词B（有前者且无后者）；组合规则匹配标题与描述（包含）以及标签等名称，不含网址</li>
        <li>🏷️ <strong>标签</strong>：卡片仅显示数据库中的前 6 个标签</li>
        <li>📖 <strong>帮助文档</strong>：第一次使用或遇到问题，可点击帮助文档查看说明</li>
        <li>💬 <strong>问题反馈</strong>：发现错误或有建议，可以通过页面底部的联系方式进行反馈</li>
        <li>⚠️ <strong>资源说明</strong>：本站不收录、不存储、不提供游戏资源文件</li>
      </ul>
      <p style="margin-bottom:16px;text-align:center">
        <a href="https://galnavi.top/nav/help/" class="gd-link" target="_blank" rel="noopener noreferrer">帮助文档 → 点击这里</a> | <a href="https://galnavi.top/nav/about/" class="gd-link" target="_blank" rel="noopener noreferrer">了解本站 → 点击这里</a>
      </p>
      <div style="text-align:center">
        <button type="button" class="gd-button gd-button--primary" data-gd-close id="welcomeStart">开始探索</button>
      </div>
    </div>
  </div>
</div>

<!-- ===== 跳转倒计时 ===== -->
<div class="redirect-overlay" id="redirectOverlay" role="alert" aria-live="assertive" aria-hidden="true">
  <div class="redirect-ring" aria-hidden="true"></div>
  <div class="redirect-text">即将跳转</div>
  <div class="redirect-countdown" id="redirectCountdown">3</div>
  <button class="redirect-cancel" id="redirectCancel">取消跳转</button>
</div>

<script>
var allData = ${dataJson};
var HERO_IMAGES = ${heroJson};
var FEATURED_KEYS = ${featJson};
var NSFW_FLAG = ${Number(nsfwFlag) === 2 ? 2 : 1};
let currentPage = 'home';

var CARD_SKELETON = '<div class="gd-skeleton gd-skeleton--card" aria-hidden="true"><div class="gd-skeleton__header"><div class="gd-skeleton__block gd-skeleton__icon"></div><div class="gd-skeleton__title-wrap"><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--title"></div><div class="gd-skeleton__block gd-skeleton__line gd-skeleton__line--sub"></div></div></div><div class="gd-skeleton__tags"><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div><div class="gd-skeleton__block gd-skeleton__tag"></div></div><div class="gd-skeleton__actions"><div class="gd-skeleton__block gd-skeleton__btn"></div><div class="gd-skeleton__block gd-skeleton__btn"></div></div></div>';

function showCardSkeletons(containerId, count) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Array(count || 2).join(CARD_SKELETON) + CARD_SKELETON;
}

function clearSkeleton(containerId) {
  var el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function isSafeHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try { var u = new URL(url, location.origin); return u.protocol === 'http:' || u.protocol === 'https:'; } catch(e) { return false; }
}
function escapeRegExp(s) { return s.replace(/[.*+?^\${}()|[\\]\\\\]/g,'\\\\$&'); }

function buildCard(item, keyword) {
  if (keyword && (/[+-]|\\s/.test(String(keyword).trim()))) keyword = '';
  var cat = escapeHtml(item.cat || '');
  var ek = keyword ? escapeRegExp(keyword) : '';
  var hlRe = ek ? new RegExp('(' + ek + ')','gi') : null;
  function hl(s) {
    if (!s) return '';
    var esc = escapeHtml(s);
    return hlRe ? esc.replace(hlRe, '<span class="gd-search__hl">$1</span>') : esc;
  }
  var tags = (item.tags && item.tags.length)
    ? '<div class="gd-card__tags">' + item.tags.slice(0,6).map(function(t){ return '<span class="gd-tag" data-tag="' + escapeHtml(t) + '">' + hl(t) + '</span>'; }).join('') + '</div>'
    : '';
  var iconUrl = item.icon || '';
  var ico;
  if (iconUrl) {
    if (iconUrl.indexOf('http://')===0 || iconUrl.indexOf('https://')===0 || iconUrl.indexOf('/')===0) {
      ico = '<img data-src="' + escapeHtml(iconUrl) + '" alt="" style="width:40px;height:40px" class="gd-lazy-img">';
    } else { ico = '<span style="font-size:28px" aria-hidden="true">' + escapeHtml(iconUrl) + '</span>'; }
  } else { ico = '<span style="font-size:28px" aria-hidden="true">🔗</span>'; }
  var nameDisp = hl(item.name || '');
  var descDisp = hl(item.desc || '');
  var hasUrl = item.url && item.url !== 'https://...' && isSafeHttpUrl(item.url);
  var detailBtn = '<a href="https://galnavi.top/nav/detail/?item_key=' + encodeURIComponent(item.id) + '" class="gd-button gd-button--detail">介绍详情</a>';
  var linkBtn = hasUrl
    ? '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener noreferrer" class="gd-button gd-button--link">链接直达</a>'
    : '<span class="gd-button gd-button--link is-disabled" aria-disabled="true">链接直达</span>';
  return '<div class="gd-card gd-card--general" data-cat="' + cat + '"' + (item.nsfw ? ' data-nsfw="1"' : '') + '>'
    + '<div class="gd-card__header"><div class="gd-card__icon">' + ico + '</div>'
    + '<div class="gd-card__title-wrap"><div class="gd-card__title">' + nameDisp + '</div>'
    + '<div class="gd-card__subtitle">' + descDisp + '</div></div></div>'
    + tags
    + '<div class="gd-card__actions">' + detailBtn + linkBtn + '</div></div>';
}

function isNsfwOn() {
  return document.documentElement.classList.contains('gd-nsfw-on');
}
function visibleData() {
  if (isNsfwOn()) return allData;
  return allData.filter(function(it){ return !it.nsfw; });
}

function renderCards(containerId, items, keyword) {
  var el = document.getElementById(containerId);
  if (!el) return;
  if (!items.length) {
    el.innerHTML = '<div class="gd-empty-state" role="status"><div class="gd-empty-state__icon" aria-hidden="true">🔍</div><p class="gd-empty-state__title">没有找到相关内容</p></div>';
    return;
  }
  el.innerHTML = items.map(function(it){ return buildCard(it, keyword); }).join('');
}

function getByCategory(cat) { return visibleData().filter(function(it){ return it.cat === cat; }); }

function updateAllCounts() {
  var vis = visibleData();
  // 首页计数 = 当前可见总数（NSFW 关时不含 is_active=2）
  document.querySelectorAll('[data-count-home]').forEach(function(b){ b.textContent = vis.length; });
  // 分类计数（导航栏 + 抽屉均覆盖）
  ['site','tool','simulator','company','hanhua'].forEach(function(c) {
    var n = getByCategory(c).length;
    document.querySelectorAll('[data-nav-cat="' + c + '"]').forEach(function(link) {
      var badge = link.querySelector('[data-gd-nav-count]');
      if (badge) badge.textContent = n;
    });
  });
}

function getSearchQueryFromUrl() {
  try {
    var m = String(location.search || '').match(/(?:^|[?&])q=([^&]*)/);
    if (!m) return '';
    return decodeURIComponent(m[1].replace(/\\+/g, '%20'));
  } catch (e) { return ''; }
}

var PAGE_LABELS = {home:'首页',site:'站点',tool:'工具',simulator:'模拟器',company:'会社',hanhua:'汉化组',tags:'标签'};
function buildNavUrl(page, keyword) {
  var p = location.pathname || '/nav/';
  var parts = [];
  var q = (keyword||'').trim();
  if (q) parts.push('q=' + encodeURIComponent(q));
  if (page !== 'home' && PAGE_LABELS[page]) parts.push('cat=' + encodeURIComponent(PAGE_LABELS[page]));
  return p + (parts.length ? '?' + parts.join('&') : '');
}
function syncSearchUrl(kw) {
  var url = buildNavUrl(currentPage||'home', kw);
  var cur = location.pathname + location.search;
  if (url !== cur) history.replaceState({page:currentPage||'home'},'',url);
}

var CAT_TO_PAGE = {};
(function(){ Object.keys(PAGE_LABELS).forEach(function(k){ CAT_TO_PAGE[PAGE_LABELS[k]] = k; }); })();
function getPageFromUrl() {
  try {
    var cat = new URLSearchParams(location.search).get('cat');
    if (cat && CAT_TO_PAGE[cat]) return CAT_TO_PAGE[cat];
  } catch(e) {}
  return 'home';
}

function navigateTo(page, pushState) {
  if (pushState !== false) {
    var navSearchEl = document.getElementById('navSearch');
    var kw = navSearchEl ? navSearchEl.value.trim() : '';
    var url = buildNavUrl(page, kw);
    var cur = location.pathname + location.search;
    if (cur !== url) history.pushState({page:page},'',url);
  }
  if (currentPage === 'home' && page !== 'home') showHomeDefault();
  currentPage = page;
  document.querySelectorAll('.gd-navbar__link').forEach(function(l){
    l.classList.toggle('is-active', l.dataset.nav === page);
    if (l.dataset.nav === page) l.setAttribute('aria-current','page');
    else l.removeAttribute('aria-current');
  });
  document.querySelectorAll('.page-view').forEach(function(v){ v.classList.remove('is-active'); });
  var t = document.getElementById('view-' + page);
  if (t) t.classList.add('is-active');
  updateAllCounts();
  renderPageContent(page);
  if (typeof window.closeDrawer === 'function') window.closeDrawer();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderPageContent(page) {
  var ns = document.getElementById('navSearch');
  var raw = ns ? ns.value.trim() : '';
  switch(page) {
    case 'home': raw ? doHomeSearch(raw) : renderHomePage(); break;
    case 'site': case 'tool': case 'simulator': case 'company': case 'hanhua':
      // 先显示骨架屏，延迟后渲染真实数据
      var gridId = page + 'Grid';
      showCardSkeletons(gridId, 1);
      setTimeout(function() { renderCards(gridId, filterByKeyword(getByCategory(page), raw), raw); }, 400);
      break;
    case 'tags': renderTagsPage(raw); break;
  }
}

function buildTagStats() {
  var s = {};
  visibleData().forEach(function(it){ (it.tags||[]).forEach(function(t){ s[t]=(s[t]||0)+1; }); });
  return s;
}
function renderTagsPage(filterText) {
  var stats = buildTagStats();
  var entries = Object.entries(stats).sort(function(a,b){ return b[1]!==a[1] ? b[1]-a[1] : a[0].localeCompare(b[0]); });
  var q = String(filterText || '').trim().replace(/^[+-]/, '').split(/\\s+/)[0] || '';
  q = q.toLowerCase();
  var list = document.getElementById('tagList');
  if (!list) return;
  list.innerHTML = '';
  entries.forEach(function(e) {
    var name=e[0], count=e[1];
    if (q && !name.toLowerCase().includes(q)) return;
    var el = document.createElement('div');
    el.className = 'gd-tag--item';
    el.setAttribute('data-tag', name);
    el.setAttribute('role','listitem');
    el.innerHTML = '<span class="gd-tag__name">' + escapeHtml(name) + '</span><span class="gd-tag__count">' + count + '</span>';
    el.addEventListener('click', function() {
      var input = document.getElementById('navSearch');
      if (input) { input.value = name; input.dispatchEvent(new Event('input')); }
      navigateTo('home');
      window.scrollTo({top:0,behavior:'smooth'});
    });
    list.appendChild(el);
  });
}

function renderHomePage() {
  var pool = visibleData();
  var keySet = new Set(FEATURED_KEYS);
  var featured = pool.filter(function(it){ return keySet.has(it.id); })
    .map(function(it){ return {...it, tags: (it.tags||[]).filter(function(t){return t!=='推荐';})}; })
    .slice(0,6);
  if (!featured.length) {
    featured = pool.filter(function(it){ return Array.isArray(it.tags) && it.tags.includes('推荐'); }).slice(0,6).map(function(it){ return {...it, tags: it.tags.filter(function(t){return t!=='推荐';})}; });
  }
  if (!featured.length) featured = pool.slice(0, 6);
  var recent = pool.slice().sort(function(a,b){ return (Date.parse(b.updatedAt)||0) - (Date.parse(a.updatedAt)||0); }).slice(0,4);
  document.getElementById('featuredTitle').textContent = '站点推荐';
  document.getElementById('recentTitle').textContent = '最近更新';
  renderCards('featuredGrid', featured);
  renderCards('recentGrid', recent);
}

var CAT_LABELS = {site:'站点',tool:'工具',simulator:'模拟器',company:'会社',hanhua:'汉化组'};
var CAT_ORDER = ['site','tool','simulator','company','hanhua'];

function itemMatchesTerm(it, term) {
  var t = String(term || '').toLowerCase();
  if (!t) return false;
  var name = (it.name || '').toLowerCase();
  var desc = (it.desc || '').toLowerCase();
  if (name.includes(t) || desc.includes(t)) return true;
  var tags = Array.isArray(it.tags) ? it.tags : [];
  if (tags.some(function(x){ return String(x).toLowerCase() === t; })) return true;
  var cat = String(it.cat || '').toLowerCase();
  var catLabel = String(CAT_LABELS[it.cat] || '').toLowerCase();
  return cat === t || catLabel === t;
}

function parseSearchQuery(raw) {
  var s = String(raw || '').trim();
  if (!s) return { mode: 'all' };
  var tokens = s.split(/\\s+/).filter(Boolean);
  var andTerms = [];
  var orTerms = [];
  var notTerms = [];
  var hasPlus = false;
  var hasBare = false;
  var i = 0;
  var isFirst = true;
  while (i < tokens.length) {
    var t = tokens[i++];
    var op = null;
    var term = t;
    if (t === '+' || t === '-') {
      op = t;
      if (i >= tokens.length) break;
      term = tokens[i++];
      if (term.charAt(0) === '+' || term.charAt(0) === '-') term = term.slice(1);
    } else if (t.charAt(0) === '+' || t.charAt(0) === '-') {
      op = t.charAt(0);
      term = t.slice(1);
    }
    if (!term) continue;
    if (isFirst && !op) {
      andTerms.push(term);
      orTerms.push(term);
      isFirst = false;
      continue;
    }
    isFirst = false;
    if (op === '+') {
      hasPlus = true;
      andTerms.push(term);
    } else if (op === '-') {
      notTerms.push(term);
    } else {
      hasBare = true;
      orTerms.push(term);
      andTerms.push(term);
    }
  }
  var isSimple = andTerms.length === 1 && !hasPlus && !hasBare && !notTerms.length;
  if (isSimple) return { mode: 'keyword', kw: andTerms[0].toLowerCase() };
  if (hasPlus) return { mode: 'op-and', terms: andTerms, not: notTerms };
  if (hasBare) return { mode: 'op-or', terms: orTerms, not: notTerms };
  return { mode: 'op-and', terms: andTerms, not: notTerms };
}

function applyTermNots(it, notTerms) {
  if (!notTerms || !notTerms.length) return true;
  return notTerms.every(function(t){ return !itemMatchesTerm(it, t); });
}

function filterByKeyword(items, raw) {
  var q = parseSearchQuery(raw);
  if (q.mode === 'all') return items;
  if (q.mode === 'keyword') {
    var kw = q.kw;
    if (!kw) return items;
    return items.filter(function(it){
      var name = (it.name||'').toLowerCase();
      var desc = (it.desc||'').toLowerCase();
      var url = (it.url||'').toLowerCase();
      var tags = Array.isArray(it.tags) ? it.tags : [];
      return name.includes(kw) || desc.includes(kw) || url.includes(kw) || tags.some(function(t){ return String(t).toLowerCase().includes(kw); });
    });
  }
  if (q.mode === 'op-and') {
    return items.filter(function(it){
      return q.terms.every(function(t){ return itemMatchesTerm(it, t); }) && applyTermNots(it, q.not);
    });
  }
  if (q.mode === 'op-or') {
    return items.filter(function(it){
      return q.terms.some(function(t){ return itemMatchesTerm(it, t); }) && applyTermNots(it, q.not);
    });
  }
  return items;
}

function doHomeSearch(kw) {
  var filtered = filterByKeyword(visibleData(), kw);
  var container = document.getElementById('searchResultsContainer');
  var sections = document.querySelector('.home-sections');
  var heroSection = document.querySelector('#view-home .gd-section[aria-label="轮播图"]');
  if (sections) sections.style.display = 'none';
  if (heroSection) heroSection.style.display = 'none';
  if (!container) return;

  if (!filtered.length) {
    container.innerHTML = '<div class="gd-empty-state" role="status"><div class="gd-empty-state__icon" aria-hidden="true">🔍</div><p class="gd-empty-state__title">没有找到相关内容</p><p class="gd-empty-state__desc">换个关键词试试吧</p></div>';
    container.classList.add('is-active');
    return;
  }

  var html = '';
  CAT_ORDER.forEach(function(cat) {
    var items = filtered.filter(function(it){ return it.cat === cat; });
    if (!items.length) return;
    html += '<section class="gd-section" aria-label="' + escapeHtml(CAT_LABELS[cat] || cat) + '">'
      + '<h2 class="gd-section__title">' + escapeHtml(CAT_LABELS[cat] || cat) + '</h2>'
      + '<div class="card-grid is-active">'
      + items.map(function(it){ return buildCard(it, kw); }).join('')
      + '</div></section>';
  });
  container.innerHTML = html;
  container.classList.add('is-active');
}
function showHomeDefault() {
  var container = document.getElementById('searchResultsContainer');
  var sections = document.querySelector('.home-sections');
  var heroSection = document.querySelector('#view-home .gd-section[aria-label="轮播图"]');
  if (container) { container.classList.remove('is-active'); container.innerHTML = ''; }
  if (sections) sections.style.display = '';
  if (heroSection) heroSection.style.display = '';
}

function doSearch(opts) {
  var input = document.getElementById('navSearch');
  var clear = document.getElementById('navSearchClear');
  if (!input) return;
  var raw = input.value.trim();
  if (clear) clear.classList.toggle('is-visible', raw.length > 0);
  syncSearchUrl(raw);
  if (!opts || !opts.skipHistory) saveSearchHist(raw);
  if (currentPage === 'home') { raw ? doHomeSearch(raw) : (showHomeDefault(), renderHomePage()); }
  else if (currentPage === 'tags') renderTagsPage(raw);
  else { var items = getByCategory(currentPage); var gid = currentPage+'Grid'; renderCards(gid, filterByKeyword(items, raw), raw); }
}

var HIST_KEY = 'galnavi-search-history';
var HIST_MAX = 10;
function loadSearchHist() {
  try {
    var arr = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
    if (!Array.isArray(arr)) return [];
    return arr.map(function(s){ return String(s || '').trim(); }).filter(Boolean).slice(0, HIST_MAX);
  } catch (e) { return []; }
}
function saveSearchHist(q) {
  var s = String(q || '').trim();
  if (!s) return;
  var arr = loadSearchHist().filter(function(x){ return x.toLowerCase() !== s.toLowerCase(); });
  arr.unshift(s);
  try { localStorage.setItem(HIST_KEY, JSON.stringify(arr.slice(0, HIST_MAX))); } catch (e) {}
  renderSearchHist();
}
function removeSearchHist(q) {
  var s = String(q || '').trim();
  var arr = loadSearchHist().filter(function(x){ return x !== s; });
  try { localStorage.setItem(HIST_KEY, JSON.stringify(arr)); } catch (e) {}
  renderSearchHist();
}
function clearSearchHist() {
  try { localStorage.removeItem(HIST_KEY); } catch (e) {}
  renderSearchHist();
}
function renderSearchHist() {
  var list = document.getElementById('navSearchHistList');
  var hist = document.getElementById('navSearchHist');
  var clearBtn = document.getElementById('navSearchHistClear');
  if (!list) return;
  var arr = loadSearchHist();
  if (!arr.length) {
    list.innerHTML = '<li class="gd-search-hist__empty" role="status">暂无搜索记录</li>';
    if (clearBtn) clearBtn.hidden = true;
    return;
  }
  if (clearBtn) clearBtn.hidden = false;
  list.innerHTML = arr.map(function(q){
    var enc = encodeURIComponent(q);
    return '<li class="gd-search-hist__chip">'
      + '<button type="button" class="gd-tag" data-hist-q="' + enc + '">' + escapeHtml(q) + '</button>'
      + '<button type="button" class="gd-search-hist__x" data-hist-del="' + enc + '" aria-label="删除这条记录">×</button>'
      + '</li>';
  }).join('');
}

function setupNavSearch() {
  var input = document.getElementById('navSearch');
  var clear = document.getElementById('navSearchClear');
  var wrap = document.getElementById('navSearchWrap');
  var hist = document.getElementById('navSearchHist');
  if (!input) return;
  var histTimer = null;
  function openHist() {
    renderSearchHist();
    if (hist) hist.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
  }
  function closeHist() {
    if (hist) hist.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
  }
  input.addEventListener('input', function(){
    if (clear) clear.classList.toggle('is-visible', this.value.trim().length > 0);
  });
  input.addEventListener('keydown', function(e){
    if (e.key === 'Enter') { e.preventDefault(); doSearch(); closeHist(); }
    if (e.key === 'Escape') closeHist();
  });
  input.addEventListener('focus', openHist);
  input.addEventListener('click', openHist);
  input.addEventListener('blur', function(){
    histTimer = setTimeout(closeHist, 180);
  });
  if (wrap) {
    wrap.addEventListener('mousedown', function(){ clearTimeout(histTimer); });
  }
  if (hist) {
    hist.addEventListener('click', function(e){
      var del = e.target.closest('[data-hist-del]');
      if (del) {
        e.preventDefault();
        e.stopPropagation();
        removeSearchHist(decodeURIComponent(del.getAttribute('data-hist-del') || ''));
        input.focus();
        return;
      }
      var chip = e.target.closest('[data-hist-q]');
      if (!chip) return;
      e.preventDefault();
      input.value = decodeURIComponent(chip.getAttribute('data-hist-q') || '');
      input.dispatchEvent(new Event('input'));
      doSearch();
      closeHist();
    });
  }
  var histClear = document.getElementById('navSearchHistClear');
  if (histClear) {
    histClear.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      clearSearchHist();
      input.focus();
    });
  }
  document.addEventListener('click', function(e){
    if (wrap && !wrap.contains(e.target)) closeHist();
  });
  if (clear) {
    clear.addEventListener('mousedown', function(e){ e.preventDefault(); });
    clear.addEventListener('click', function(){
      input.value=''; input.dispatchEvent(new Event('input'));
      doSearch({ skipHistory: true }); input.focus();
    });
  }
  var helpWrap = wrap && wrap.querySelector('.gd-search__help-wrap');
  var helpBtn = helpWrap && helpWrap.querySelector('.gd-search__help');
  if (helpWrap && helpBtn) {
    var showHelp = function(){ helpWrap.classList.add('is-open'); };
    var hideHelp = function(){ helpWrap.classList.remove('is-open'); };
    helpWrap.addEventListener('mouseenter', showHelp);
    helpWrap.addEventListener('mouseleave', hideHelp);
    helpBtn.addEventListener('focus', showHelp);
    helpBtn.addEventListener('blur', hideHelp);
    helpBtn.addEventListener('mousedown', function(e){ e.preventDefault(); });
    helpBtn.addEventListener('click', function(e){
      e.stopPropagation();
      showHelp();
    });
    document.addEventListener('click', function(e){
      if (!helpWrap.contains(e.target)) hideHelp();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') hideHelp();
    });
  }
}

function initGdNsfwToggle() {
  var NSFW_LABEL_OFF = 'NSFW 内容已隐藏';
  var NSFW_LABEL_ON = 'NSFW 内容已显示';
  var FLASH_MS = 1200;
  var COOKIE_MAX_AGE = 86400;
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-gd-nsfw]'));
  if (!buttons.length) return;
  if (buttons.some(function(b){ return b.dataset.gdNsfwReady === '1'; })) return;
  buttons.forEach(function(b){ b.dataset.gdNsfwReady = '1'; });
  var visible = NSFW_FLAG === 2;
  var flashTimer = null;
  var reduceMotion = function() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  };
  var writeFlag = function(flag) {
    try {
      document.cookie = 'gd-nsfw=' + (flag === 2 ? '2' : '1') + '; Path=/; Max-Age=' + COOKIE_MAX_AGE + '; SameSite=Lax';
    } catch { /* 写不上也继续刷新 */ }
  };
  var clearFlash = function() {
    if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }
    buttons.forEach(function(btn) {
      if (!btn.querySelector('[data-gd-nsfw-msg]')) return;
      btn.classList.remove('is-flash');
      var face = btn.querySelector('[data-gd-nsfw-face]');
      var msg = btn.querySelector('[data-gd-nsfw-msg]');
      if (face) face.style.visibility = '';
      if (msg) msg.hidden = true;
    });
  };
  var flashMsg = function(text) {
    clearFlash();
    var delay = reduceMotion() ? 0 : FLASH_MS;
    buttons.forEach(function(btn) {
      var face = btn.querySelector('[data-gd-nsfw-face]');
      var msg = btn.querySelector('[data-gd-nsfw-msg]');
      if (!msg) return;
      msg.textContent = btn.classList.contains('gd-navbar__nsfw') ? (text === '已开启' ? '开' : '关') : text;
      btn.classList.add('is-flash');
      if (face) face.style.visibility = 'hidden';
      msg.hidden = false;
    });
    flashTimer = setTimeout(function() {
      buttons.forEach(function(btn) {
        if (!btn.querySelector('[data-gd-nsfw-msg]')) return;
        btn.classList.remove('is-flash');
        var face = btn.querySelector('[data-gd-nsfw-face]');
        var msg = btn.querySelector('[data-gd-nsfw-msg]');
        if (face) face.style.visibility = '';
        if (msg) msg.hidden = true;
      });
      flashTimer = null;
    }, delay);
  };
  var apply = function(on, persist, flash) {
    visible = !!on;
    var label = visible ? NSFW_LABEL_ON : NSFW_LABEL_OFF;
    buttons.forEach(function(btn) {
      btn.classList.toggle('is-on', visible);
      btn.setAttribute('aria-pressed', String(visible));
      btn.setAttribute('aria-label', label);
      var wrap = btn.closest('.gd-tooltip-wrap');
      var tip = wrap ? wrap.querySelector('[data-gd-nsfw-tip]') : null;
      if (tip) tip.textContent = label;
    });
    document.documentElement.classList.toggle('gd-nsfw-on', visible);
    if (persist) {
      writeFlag(visible ? 2 : 1);
      if (flash) flashMsg(visible ? '已开启' : '已关闭');
      var delay = (flash && !reduceMotion()) ? FLASH_MS : 0;
      setTimeout(function(){ location.reload(); }, delay);
    }
  };
  apply(visible, false, false);
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function(){ apply(!visible, true, true); });
  });
}

function setupDrawer() {
  var toggle = document.querySelector('[data-gd-nav-toggle]');
  var drawerId = toggle ? toggle.getAttribute('aria-controls') : null;
  var drawer = drawerId ? document.getElementById(drawerId) : null;
  var overlay = document.querySelector('.gd-navbar-drawer-overlay');
  if (!toggle || !drawer) return;
  var setOpen = function(open) {
    toggle.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
    if (overlay) overlay.classList.toggle('is-open', open);
    document.body.classList.toggle('drawer-open', open);
    if (open) {
      toggle.closest('.gd-navbar').classList.add('is-drawer-open');
    } else {
      setTimeout(function(){ toggle.closest('.gd-navbar').classList.remove('is-drawer-open'); }, 220);
    }
  };
  toggle.addEventListener('click', function(){ setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
  if (overlay) overlay.addEventListener('click', function(){ setOpen(false); });
  drawer.querySelectorAll('.gd-navbar__link').forEach(function(n){ n.addEventListener('click', function(){ setOpen(false); }); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setOpen(false); });
  window.addEventListener('resize', function(){ if(window.innerWidth>768 && toggle.getAttribute('aria-expanded')==='true') setOpen(false); });
  window.closeDrawer = function(){ setOpen(false); };
}

async function initHeroCarousel() {
  var carousel = document.getElementById('heroCarousel');
  if (!carousel) return;
  var heroSection = carousel.closest('.gd-section');
  var gradient = carousel.querySelector('.gd-hero__gradient');
  var dotsC = document.getElementById('heroDots');
  var heroSkel = document.getElementById('heroSkeleton');
  var images = HERO_IMAGES.filter(function(u){ return isSafeHttpUrl(u); });
  var slidesSpec = [];
  if (images.length) {
    await Promise.all(images.map(function(url) {
      return new Promise(function(resolve) {
        var img = new Image();
        img.onload = img.onerror = resolve;
        img.src = url;
      });
    }));
    images.forEach(function(url){ slidesSpec.push({ bg: url }); });
  } else {
    slidesSpec = [
      { cls: 'gd-hero__slide--demo-1' },
      { cls: 'gd-hero__slide--demo-2' },
      { cls: 'gd-hero__slide--demo-3' }
    ];
  }
  if (heroSection) heroSection.hidden = false;
  if (heroSkel) heroSkel.remove();
  carousel.classList.remove('is-loading');
  slidesSpec.forEach(function(spec, i) {
    var slide = document.createElement('div');
    slide.className = 'gd-hero__slide' + (spec.cls ? ' ' + spec.cls : '') + (i===0?' is-active':'');
    if (spec.bg) slide.style.backgroundImage = 'url(' + JSON.stringify(spec.bg) + ')';
    carousel.insertBefore(slide, gradient);
    var dot = document.createElement('span');
    dot.className = 'gd-hero__dot' + (i===0?' is-active':'');
    dot.setAttribute('role','button');
    dot.setAttribute('aria-label','幻灯片 '+(i+1));
    dotsC.appendChild(dot);
  });
  var slides = carousel.querySelectorAll('.gd-hero__slide');
  var dots = dotsC.querySelectorAll('.gd-hero__dot');
  var total = slides.length, heroIndex = 0;
  if (total === 0) return;
  function goTo(n) {
    if (total===0) return;
    var ni = (n+total)%total;
    if (ni===heroIndex) return;
    slides[ni].classList.add('is-active');
    if(dots[ni]) { dots[ni].classList.add('is-active'); dots[ni].setAttribute('aria-current','true'); }
    slides[heroIndex].classList.remove('is-active');
    if(dots[heroIndex]) { dots[heroIndex].classList.remove('is-active'); dots[heroIndex].removeAttribute('aria-current'); }
    heroIndex = ni;
  }
  function next(){ goTo(heroIndex+1); }
  function arm(){ clearInterval(window._heroTimer); window._heroTimer=setInterval(next,4000); }
  carousel.querySelector('.gd-hero__arrow--next').addEventListener('click',function(){ next(); arm(); });
  carousel.querySelector('.gd-hero__arrow--prev').addEventListener('click',function(){ goTo(heroIndex-1); arm(); });
  dots.forEach(function(d,i){ d.addEventListener('click',function(){ goTo(i); arm(); }); });
  goTo(0); arm();
}

var redirectTimerId, redirectCancelHandler;
function startRedirect(targetUrl) {
  var overlay = document.getElementById('redirectOverlay');
  var countdownEl = document.getElementById('redirectCountdown');
  var cancelBtn = document.getElementById('redirectCancel');
  if (!overlay || !countdownEl) { window.open(targetUrl,'_blank','noopener,noreferrer'); return; }
  if (redirectTimerId) { clearInterval(redirectTimerId); redirectTimerId=null; }
  if (redirectCancelHandler && cancelBtn) { cancelBtn.removeEventListener('click',redirectCancelHandler); redirectCancelHandler=null; }
  var sec = 3;
  overlay.classList.add('is-active');
  overlay.setAttribute('aria-hidden','false');
  countdownEl.textContent = sec;
  function tick() {
    sec--;
    if (sec<=0) {
      clearInterval(redirectTimerId); redirectTimerId=null;
      window.open(targetUrl,'_blank','noopener,noreferrer');
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden','true');
      if (redirectCancelHandler && cancelBtn) { cancelBtn.removeEventListener('click',redirectCancelHandler); redirectCancelHandler=null; }
      return;
    }
    countdownEl.textContent = sec;
  }
  redirectTimerId = setInterval(tick, 1000);
  redirectCancelHandler = function() {
    clearInterval(redirectTimerId); redirectTimerId=null;
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden','true');
    if (cancelBtn) cancelBtn.removeEventListener('click',redirectCancelHandler);
    redirectCancelHandler=null;
  };
  if (cancelBtn) cancelBtn.addEventListener('click', redirectCancelHandler);
}

document.addEventListener('DOMContentLoaded', function() {
  (function syncViewportHeight() {
    function apply() {
      var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      document.documentElement.style.setProperty('--gd-vvh', h + 'px');
    }
    apply();
    window.addEventListener('resize', apply);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', apply);
  })();
  // IntersectionObserver：图片进入视口才加载
  var lazyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        lazyObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  function observeLazyImages() {
    document.querySelectorAll('img.gd-lazy-img[data-src]').forEach(function(img) {
      lazyObserver.observe(img);
    });
  }
  // 监听 DOM 变化，自动观察新插入的懒加载图片
  var domObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('img.gd-lazy-img[data-src]')) lazyObserver.observe(node);
        if (node.querySelectorAll) node.querySelectorAll('img.gd-lazy-img[data-src]').forEach(function(img) { lazyObserver.observe(img); });
      });
    });
  });
  domObserver.observe(document.body, { childList: true, subtree: true });
  observeLazyImages();
  // nav links click
  document.querySelectorAll('.gd-navbar__link[data-nav]').forEach(function(link) {
    link.addEventListener('click', function() {
      var page = this.dataset.nav;
      if (page) navigateTo(page);
    });
  });

  // logo click → home
  document.getElementById('navLogo').addEventListener('click', function(e) {
    e.preventDefault();
    if (currentPage !== 'home') navigateTo('home');
  });

  // tag search
  var tagSearchInput = document.getElementById('tagSearchInput');
  if (tagSearchInput) tagSearchInput.addEventListener('input', function(){ renderTagsPage(this.value); });

  // tag badge click on cards
  document.addEventListener('click', function(e) {
    if (e.target.closest('#navSearchHist')) return;
    if (e.target.closest('[data-rec-tag]')) return;
    var badge = e.target.closest('.gd-tag[data-tag]');
    if (!badge) return;
    if (e.target.closest('a')) return;
    var tag = badge.getAttribute('data-tag');
    if (!tag) return;
    e.preventDefault();
    e.stopPropagation();
    var input = document.getElementById('navSearch');
    if (input) { input.value = tag; input.dispatchEvent(new Event('input')); }
    if (currentPage !== 'home') navigateTo('home');
    else doSearch();
    window.scrollTo({top:0,behavior:'smooth'});
  });

  document.addEventListener('click', function(e) {
    var rec = e.target.closest('[data-rec-tag]');
    if (!rec) return;
    e.preventDefault();
    var tag = rec.getAttribute('data-rec-tag');
    if (!tag) return;
    var input = document.getElementById('navSearch');
    if (input) { input.value = tag; input.dispatchEvent(new Event('input')); }
    if (currentPage !== 'home') navigateTo('home');
    else doSearch();
    window.scrollTo({top:0,behavior:'smooth'});
  });

  document.addEventListener('click', function(e) {
    var more = e.target.closest('[data-gd-nav-tags]');
    if (!more) return;
    e.preventDefault();
    navigateTo('tags');
  });

  // external link redirect
  document.addEventListener('click', function(e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href) return;
    var lower = href.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:')) { e.preventDefault(); e.stopPropagation(); return; }
    if (href.startsWith('https://galnavi.top/nav/') || href.startsWith('/nav/')) return;
    if (href.startsWith('#')) return;
    if (href.startsWith('mailto:')) return;
    if (anchor.closest('.gd-footer')) return;
    if (!isSafeHttpUrl(href)) return;
    try { if (new URL(href).hostname === location.hostname) return; } catch(_) { return; }
    e.preventDefault(); e.stopPropagation();
    startRedirect(href);
  });

  setupDrawer();
  initGdNsfwToggle();
  setupNavSearch();
  (function setupBelowNav() {
    var bar = document.getElementById('belowNav');
    function syncH() {
      if (!bar) return;
      document.documentElement.style.setProperty('--gd-below-nav-h', (bar.offsetHeight || 80) + 'px');
    }
    syncH();
    if (bar && typeof ResizeObserver !== 'undefined') new ResizeObserver(syncH).observe(bar);
    window.addEventListener('resize', syncH);
    var led = document.getElementById('noticeLed');
    var track = led && led.querySelector('.gd-notice-led__track');
    if (led && track) {
      var first = track.querySelector('.gd-notice-led__item');
      var text = first ? first.textContent : '';
      function fillLed() {
        if (!text) return;
        track.innerHTML = '';
        var i = 0;
        do {
          var s = document.createElement('span');
          s.className = 'gd-notice-led__item';
          s.textContent = text;
          if (i) s.setAttribute('aria-hidden', 'true');
          track.appendChild(s);
          i += 1;
        } while (track.scrollWidth < led.clientWidth * 2 && i < 12);
        if (i < 2) {
          var extra = document.createElement('span');
          extra.className = 'gd-notice-led__item';
          extra.textContent = text;
          extra.setAttribute('aria-hidden', 'true');
          track.appendChild(extra);
        }
        var half = track.scrollWidth / 2;
        var pxPerSec = 48;
        var dur = half > 0 ? (half / pxPerSec) : 22;
        track.style.setProperty('--gd-notice-led-duration', dur + 's');
      }
      fillLed();
      window.addEventListener('resize', fillLed);
    }
  })();

  var WKEY = 'galnavi-welcome-seen';
  var welcomeModal = document.getElementById('welcomeModal');
  function openWelcome() {
    if (!welcomeModal) return;
    welcomeModal.classList.add('is-open');
    welcomeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var startBtn = document.getElementById('welcomeStart');
    if (startBtn) startBtn.focus();
  }
  function closeWelcome() {
    if (!welcomeModal) return;
    welcomeModal.classList.remove('is-open');
    welcomeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    try { localStorage.setItem(WKEY, '1'); } catch(e) {}
  }
  if (welcomeModal) {
    welcomeModal.querySelectorAll('[data-gd-close]').forEach(function(n){ n.addEventListener('click', closeWelcome); });
    welcomeModal.addEventListener('click', function(e){ if (e.target === welcomeModal) closeWelcome(); });
    welcomeModal.addEventListener('keydown', function(e){
      if (e.key !== 'Tab' || !welcomeModal.classList.contains('is-open')) return;
      var nodes = welcomeModal.querySelectorAll('a[href], button:not([disabled])');
      if (!nodes.length) return;
      var first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && welcomeModal.classList.contains('is-open')) closeWelcome(); });
    var welcomeSeen = false;
    try { welcomeSeen = localStorage.getItem(WKEY) === '1'; } catch(e) {}
    if (!welcomeSeen) openWelcome();
  }

  (function setupWsOrb() {
    var root = document.getElementById('wsOrb');
    var toggle = document.getElementById('wsOrbToggle');
    var menu = document.getElementById('wsOrbMenu');
    if (!root || !toggle || !menu) return;
    function setOpen(open) {
      root.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭快捷入口' : '打开快捷入口');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      menu.inert = !open;
    }
    menu.inert = true;
    menu.setAttribute('aria-hidden', 'true');
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      setOpen(!root.classList.contains('is-open'));
    });
    menu.addEventListener('click', function(e) {
      var item = e.target.closest('[data-gd-orb]');
      if (!item) {
        if (e.target.closest('.gd-orb__item')) setOpen(false);
        return;
      }
      e.preventDefault();
      var act = item.getAttribute('data-gd-orb');
      setOpen(false);
      if (act === 'tags') navigateTo('tags');
      else if (act === 'tavern') navigateTo('home');
      else if (act === 'popup') openWelcome();
    });
    document.addEventListener('click', function(e) {
      if (root.classList.contains('is-open') && !root.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  })();

    // 骨架屏 + 异步渲染（独立并行）
    showCardSkeletons('featuredGrid', 2);
    showCardSkeletons('recentGrid', 2);
    initHeroCarousel().catch(function(e){ console.warn('hero init failed', e); });
    // 延迟渲染卡片，让浏览器先绘制骨架屏
    setTimeout(function() {
      renderHomePage();
      updateAllCounts();
    }, 600);

    var initialPage = getPageFromUrl();
    var initialQ = getSearchQueryFromUrl();
    if (initialQ) {
      var navSearchInit = document.getElementById('navSearch');
      if (navSearchInit) navSearchInit.value = initialQ;
    }
    if (initialPage === 'home') {
      if (initialQ) {
        setTimeout(function(){ doHomeSearch(initialQ.trim()); }, 600);
        var clearInit = document.getElementById('navSearchClear');
        if (clearInit) clearInit.classList.add('is-visible');
      }
    } else {
      navigateTo(initialPage, false);
    }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  // 保存滚动位置（跳转返回后恢复）
  window.addEventListener('beforeunload', function() {
    try { sessionStorage.setItem('galnavi-scroll', String(window.scrollY)); } catch(e) {}
  });
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      var sy = 0;
      try { sy = parseInt(sessionStorage.getItem('galnavi-scroll') || '0', 10); } catch(e) {}
      window.scrollTo({ top: sy, behavior: 'instant' });
    }
  });
  window.addEventListener('popstate', function(e){
    var p = getPageFromUrl();
    var q = getSearchQueryFromUrl();
    var ns = document.getElementById('navSearch');
    if (ns) { ns.value = q; var cl = document.getElementById('navSearchClear'); if(cl) cl.classList.toggle('is-visible', q.length>0); }
    navigateTo(p, false);
  });
});
</script>
</body>
</html>`;
}
