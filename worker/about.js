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
const GITHUB_URL = "https://github.com/argb6/gal-navigation";
const QR_ALIPAY = "";
const QR_WECHAT = "";
const DONORS_KV_KEY = "donors";
const NAME_MAX = 40;
const NOTE_MAX = 80;
const AMOUNT_MAX = 24;
const DATE_MAX = 32;

export default {
  async fetch(request, env) {
    const donors = await loadDonors(env);
    const linksHtml = await renderFriendLinks(env);
    return new Response(renderPage(donors, linksHtml), { headers: SECURITY_HEADERS });
  },
};

async function loadDonors(env) {
  if (!env?.DONATE_KV) return [];
  try {
    const raw = await env.DONATE_KV.get(DONORS_KV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeDonor).filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeDonor(row) {
  if (!row || typeof row !== "object") return null;
  const name = clampText(row.name, NAME_MAX);
  if (!name) return null;
  return {
    name,
    amount: clampText(row.amount, AMOUNT_MAX),
    note: clampText(row.note, NOTE_MAX),
    date: clampText(row.date, DATE_MAX),
  };
}

function clampText(v, max) {
  if (v == null) return "";
  const s = String(v).trim().replace(/\s+/g, " ");
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

function escapeHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function isSafeHttpUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function renderQrCard(label, src) {
  const title = escapeHtml(label);
  if (isSafeHttpUrl(src)) {
    return '<div class="gd-donate-card"><p class="gd-donate-card__label">' + title + '</p><img class="gd-donate-card__qr" src="' + escapeAttr(src) + '" alt="' + title + '收款码" loading="lazy" referrerpolicy="no-referrer" width="180" height="180"></div>';
  }
  return '<div class="gd-donate-card gd-donate-card--empty"><p class="gd-donate-card__label">' + title + '</p><div class="gd-donate-card__slot" role="img" aria-label="' + title + '收款码筹备中">收款码筹备中</div></div>';
}

function renderDonorTable(donors) {
  const rows = donors.length ? donors.map((d) => {
    const cell = (v) => (v ? escapeHtml(v) : "—");
    return "<tr><td>" + escapeHtml(d.name) + "</td><td>" + cell(d.amount) + "</td><td>" + cell(d.note) + "</td><td>" + cell(d.date) + "</td></tr>";
  }).join("") : '<tr><td colspan="4">暂无捐赠记录</td></tr>';
  const count = donors.length ? '<span class="gd-section__count">' + donors.length + "</span>" : "";
  return '<h3>捐款名单' + count + '</h3><div class="gd-donate-table-wrap"><table class="gd-donate-table" aria-label="捐款名单"><thead><tr><th scope="col">昵称</th><th scope="col">金额</th><th scope="col">备注</th><th scope="col">日期</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
}

async function renderFriendLinks(env) {
  try {
    if (!env?.FRIEND_DB) return "<p>友链数据暂时不可用。</p>";
    const { results } = await env.FRIEND_DB.prepare("SELECT id, name, url, des, favicon_url, catalog FROM sites").all();
    const sortedSites = (results || []).filter((f) => isSafeHttpUrl(f.url)).sort((a, b) => a.id - b.id);
    if (sortedSites.length === 0) return "<p>暂无友链，欢迎申请。</p>";
    const groups = {};
    sortedSites.forEach((f) => {
      const cat = f.catalog || "其他";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    const sortedCats = Object.keys(groups).sort((a, b) => {
      const minId = (cat) => groups[cat].reduce((min, f) => Math.min(min, f.id), Infinity);
      return minId(a) - minId(b);
    });
    return sortedCats.map((cat) => {
      const cards = groups[cat].sort((a, b) => a.id - b.id).map(renderFriendCard).join("");
      return '<h3 id="cat-' + escapeAttr(cat) + '">' + escapeHtml(cat) + '</h3><div class="gd-friend-grid">' + cards + "</div>";
    }).join("");
  } catch {
    return "<p>友链数据暂时不可用。</p>";
  }
}

function renderFriendCard(f) {
  const name = escapeHtml(f.name || "未命名");
  const desc = escapeHtml(f.des || "");
  const url = escapeAttr(f.url);
  const icon = f.favicon_url && isSafeHttpUrl(f.favicon_url)
    ? '<img src="' + escapeAttr(f.favicon_url) + '" alt="" loading="lazy" width="22" height="22">'
    : '<span aria-hidden="true">' + name.charAt(0) + "</span>";
  const tip = desc ? '<span class="gd-friend-tip" role="tooltip">' + desc + "</span>" : "";
  return '<a class="gd-card gd-card--friend gd-card--link" href="' + url + '" target="_blank" rel="noopener noreferrer"><div class="gd-card__header"><div class="gd-card__icon">' + icon + '</div><div class="gd-card__title-wrap"><div class="gd-card__title">' + name + '</div><div class="gd-card__subtitle">' + desc + "</div></div></div>" + tip + "</a>";
}

function renderPage(donors, linksHtml) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>GALNAVI · 关于这个的一切都在这</title>
<meta name="description" content="来历、版权和免责声明、友情链接，关于 GALNAVI（纳普）的都在这。本站是 ACG 二次元与 Galgame 导航，汉化、补丁和下载由原站负责。">
<meta name="keywords" content="GALNAVI, 纳普, 关于GALNAVI, ACG导航, Galgame导航, 二次元, 站点声明, 版权声明, 友情链接">
<meta name="author" content="GALNAVI">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://galnavi.top/nav/about/">
<link rel="icon" href="${ASSET_FAVICON}" type="image/png">
<link rel="apple-touch-icon" href="${ASSET_ICON}">
<link rel="sitemap" type="application/xml" title="Sitemap" href="https://galnavi.top/sitemap.xml">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_CN">
<meta property="og:site_name" content="GALNAVI">
<meta property="og:title" content="GALNAVI · 关于这个的一切都在这">
<meta property="og:description" content="来历、版权和免责声明、友情链接，关于 GALNAVI（纳普）的都在这。本站是 ACG 二次元与 Galgame 导航，汉化、补丁和下载由原站负责。">
<meta property="og:url" content="https://galnavi.top/nav/about/">
<meta property="og:image" content="${ASSET_ICON}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="GALNAVI · 关于这个的一切都在这">
<meta name="twitter:description" content="来历、版权和免责声明、友情链接，关于 GALNAVI（纳普）的都在这。本站是 ACG 二次元与 Galgame 导航，汉化、补丁和下载由原站负责。">
<meta name="twitter:image" content="${ASSET_ICON}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebPage","name":"GALNAVI · 关于这个的一切都在这","url":"https://galnavi.top/nav/about/","description":"来历、版权和免责声明、友情链接，关于 GALNAVI（纳普）的都在这。本站是 ACG 二次元与 Galgame 导航，汉化、补丁和下载由原站负责。","isPartOf":{"@type":"WebSite","name":"GALNAVI","url":"https://galnavi.top/"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"首页","item":"https://galnavi.top/nav/"},{"@type":"ListItem","position":2,"name":"关于","item":"https://galnavi.top/nav/about/"}]}
</script>
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
  color-scheme: dark;
  scroll-behavior: smooth;
  background: var(--gd-color-background);
  min-height: 100%;
}

body.gd-overview {
  margin: 0;
  min-height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  min-height: var(--gd-vvh, 100dvh);
  display: flex;
  flex-direction: column;
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
  flex: 1 1 auto;
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

.gd-overview .gd-footer--page {
  margin-top: auto;
  padding-top: 24px;
  border-top: none;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
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
.gd-button:hover,
.gd-button:focus-visible {
  color: var(--gd-color-on-surface);
}
.gd-button::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
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
  filter: none;
}
/* 返回主站（殿堂橙边框变体） */
.gd-button--back--orange:hover {
  border-color: rgba(var(--gd-color-gold-deep-rgb), 0.6);
  background: rgba(var(--gd-color-gold-deep-rgb), 0.12);
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
.gd-card__btn:hover,
.gd-card__btn:focus-visible {
  color: var(--gd-color-on-primary);
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
.gd-card--friend {
  width: 320px;
  height: 100px;
  max-width: 320px;
  overflow: visible;
  justify-content: center;
}
.gd-card--friend .gd-card__icon { width: 50px; height: 50px; }
.gd-card--friend .gd-card__subtitle {
  min-height: 0;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gd-card--friend .gd-friend-tip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  z-index: 20;
  width: max-content;
  max-width: 280px;
  padding: 8px 12px;
  border-radius: var(--gd-shape-corner-extra-small);
  background: var(--gd-color-overlay-float);
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.12);
  color: var(--gd-color-on-surface);
  font-size: var(--gd-type-body-small-size);
  line-height: 1.4;
  white-space: normal;
  text-align: left;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(4px);
  transition:
    opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-card--friend:hover,
.gd-card--friend:focus-visible { z-index: 5; }
.gd-card--friend:hover .gd-friend-tip,
.gd-card--friend:focus-visible .gd-friend-tip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.gd-friend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 320px);
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
  background: var(--gd-glass-bg);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid var(--gd-glass-border);
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
  background: var(--gd-glass-bg-hover);
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
  padding: 4px 8px;
  min-height: 24px;
}
.gd-footer__nav a:hover { color: var(--gd-color-link-hover); }
.gd-footer__nav a:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-footer__sep { color: rgba(var(--gd-color-muted-white-rgb), 0.28); user-select: none; font-size: var(--gd-type-label-medium-size); }
.gd-footer__copy { margin: 0; }

/* ===== about 页面特有样式 ===== */

.gd-groundback { z-index: 0; }
.gd-overview__shell { position: relative; z-index: 1; flex: 1 0 auto; }
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
.gd-overview__content .card h3 {
  margin: 20px 0 8px;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-title-medium-size);
  font-weight: var(--gd-weight-semibold);
  line-height: var(--gd-type-title-medium-line);
  color: var(--gd-color-on-surface);
}
.gd-overview__content .card h3:first-child { margin-top: 0; }
.gd-overview__content .card p { color: var(--gd-color-on-surface-variant); font-size: var(--gd-type-body-large-size); margin-top: 6px; line-height: 1.85; }
.gd-overview__content .card p.no-indent { text-indent: 0; }
.gd-overview__content .card a { word-break: break-all; }
.gd-overview__content ul { margin: 6px 0 8px; padding-left: 1.15em; list-style: none; }
.gd-overview__content ul li { position: relative; color: var(--gd-color-on-surface-variant); font-size: var(--gd-type-body-large-size); margin-bottom: 12px; line-height: 1.85; padding-left: .15em; }
.gd-overview__content ul li::before { content: ""; position: absolute; left: -1em; top: .72em; width: 5px; height: 5px; border-radius: 50%; background: var(--gd-color-primary); }
.gd-overview__content .gd-friend-grid { display: grid; grid-template-columns: repeat(auto-fill, 320px); gap: 18px; justify-content: start; }
.gd-overview__content .gd-card--friend { width: 320px; height: 100px; max-width: 320px; }
.gd-footer { padding-top: 32px; }
.gd-overview-toc-mobile,
.gd-overview__toc { display: none !important; }
@media (min-width: 768px) {
  .gd-overview__layout { grid-template-columns: minmax(0, 1fr); }
}
.gd-help-hub { container-type: inline-size; }
.gd-help-topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  justify-content: start;
  gap: 20px;
  margin: 8px 0 24px;
}
.gd-help-topic {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  box-sizing: border-box;
  width: 300px;
  height: 400px;
  margin: 0;
  padding: 22px 21px 16px;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  color: var(--gd-color-on-surface);
  font-family: inherit;
  border-radius: 18px;
  border: 1px solid var(--gd-glass-border);
  background: var(--gd-glass-bg);
  appearance: none;
  -webkit-appearance: none;
}
.gd-help-topic:hover {
  background: var(--gd-glass-bg-hover);
  border-color: var(--gd-color-border-hover);
  filter: brightness(1.05);
}
.gd-help-topic:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 3px; }
.gd-help-topic__media {
  display: block;
  width: 100%;
  height: 256px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(var(--gd-color-primary-rgb), 0.14);
}
.gd-help-topic__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gd-help-topic__no,
.gd-help-topic__title,
.gd-help-topic__sum { width: 100%; }
.gd-help-topic__no { font-size: 13px; font-weight: var(--gd-weight-bold); color: var(--gd-color-link); }
.gd-help-topic__title { font-size: 20px; font-weight: var(--gd-weight-bold); line-height: 1.25; }
.gd-help-topic__sum {
  color: var(--gd-color-on-surface-variant);
  font-size: 14px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.gd-help-back { margin: 56px 0 8px; }
.gd-help-detail .gd-section { display: none; }
.gd-help-detail .gd-section.is-on { display: block; }
.gd-help-hub[hidden],
.gd-help-detail[hidden] { display: none !important; }
.gd-donate-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin: 8px 0 0; }
.gd-donate-card { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 22px 18px; border-radius: 20px; background: var(--gd-glass-bg); border: 1px solid var(--gd-glass-border); font-family: var(--gd-font-sans); }
.gd-donate-card__label { font-size: var(--gd-type-title-small-size); font-weight: var(--gd-weight-bold); color: var(--gd-color-on-surface); }
.gd-donate-card__qr { width: 180px; height: 180px; object-fit: contain; border-radius: 12px; background: var(--gd-color-on-primary); padding: 8px; display: block; }
.gd-donate-card__slot { width: 180px; height: 180px; border-radius: 12px; background: rgba(var(--gd-color-ink-4-rgb), 0.72); border: 1px dashed rgba(var(--gd-color-grey-rgb), 0.56); display: flex; align-items: center; justify-content: center; color: var(--gd-color-on-surface-subtle); font-size: var(--gd-type-note-size); font-weight: var(--gd-weight-semibold); box-sizing: border-box; }
.gd-donate-card--empty { min-height: 220px; justify-content: center; }
.gd-donate-note { margin: 14px 0 0; font-size: var(--gd-type-label-large-size); line-height: 1.6; color: var(--gd-color-on-surface-subtle); }
.gd-donate-table-wrap { overflow-x: auto; }
.gd-donate-table { width: 100%; border-collapse: collapse; min-width: 480px; font-size: var(--gd-type-label-large-size); }
.gd-donate-table th, .gd-donate-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid rgba(var(--gd-color-white-rgb), 0.08); }
.gd-donate-table thead th { font-size: var(--gd-type-note-size); font-weight: var(--gd-weight-bold); color: var(--gd-color-on-surface-variant); white-space: nowrap; }
.gd-donate-table tbody td { color: var(--gd-color-on-surface-variant); line-height: 1.55; }
.gd-donate-table tbody td:first-child { color: var(--gd-color-on-surface); font-weight: var(--gd-weight-bold); }
.gd-section__count { margin-left: 8px; font-size: var(--gd-type-note-size); font-weight: var(--gd-weight-semibold); color: var(--gd-color-on-surface-subtle); }
.gd-help-detail h3 { margin: 22px 0 8px; font-size: 18px; color: var(--gd-color-on-surface); scroll-margin-top: 90px; }
@container (max-width: 619px) {
  .gd-help-topics { grid-template-columns: 300px; justify-content: center; }
  .gd-help-topic { width: 300px; }
}
/* 窄屏友链卡仍是 320×100，不拉满容器 */
@media (max-width: 640px) {
  .gd-overview__content .gd-friend-grid { grid-template-columns: 320px; justify-content: center; }
  .gd-overview__content .gd-card--friend { width: 320px; height: 100px; }
}

.gd-leave { position: relative; z-index: 3; overflow: visible; }
.gd-leave-svg { position: absolute; pointer-events: none; z-index: 4; overflow: visible; animation: gd-leave-fade 2.4s linear both; }
.gd-leave-svg svg { display: block; width: 100%; height: 100%; overflow: visible; }
@keyframes gd-leave-fade { 0% { opacity: 0; } 18% { opacity: 1; } 82% { opacity: 1; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .gd-leave-svg { animation: none; } }
.gd-hamburger-motion svg { display: block; width: 22px; height: 22px; position: absolute; transition: opacity .22s ease, transform .28s cubic-bezier(.4,0,.2,1); }
.gd-hamburger-motion .gd-hamburger-motion__menu { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) scale(1); }
.gd-hamburger-motion .gd-hamburger-motion__close { opacity: 0; transform: translate(-50%,-50%) rotate(-90deg) scale(.7); }
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__menu { opacity: 0; transform: translate(-50%,-50%) rotate(90deg) scale(.7); }
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__close { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) scale(1); }

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
<body class="gd-overview">
<div class="gd-groundback gd-groundback--websearch" aria-hidden="true"></div>
<a class="gd-button gd-button--back gd-back-fab" href="https://galnavi.top/nav/" aria-label="返回主站">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  返回主站
</a>
<div class="gd-overview__chrome" aria-hidden="true"></div>
<div class="gd-overview__shell">
  <div class="gd-overview__layout">
    <div class="gd-overview__content">
      <div id="helpHub" class="gd-help-hub">
      <h1 class="gd-brand__title gd-brand__title--shift gd-brand__title--demo">关于</h1>
      <p class="gd-overview__lede">关于这个的一切都在这。点开卡片看来历、声明和友链。</p>
      <div class="gd-help-topics">
        <button type="button" class="gd-help-topic" data-help-topic="origin"><span class="gd-help-topic__media" aria-hidden="true"><img src="https://assets.galnavi.top/about/%E7%81%AF%E5%A1%94.png" alt="" width="256" height="256"></span><span class="gd-help-topic__no">01</span><span class="gd-help-topic__title">起源与发展</span><span class="gd-help-topic__sum">猫耳娘纳普点亮灯塔的故事，以及从立项到网页焕新的时间线。</span></button>
        <button type="button" class="gd-help-topic" data-help-topic="components"><span class="gd-help-topic__media" aria-hidden="true"><img src="https://assets.galnavi.top/about/%E6%8A%80%E6%9C%AF.png" alt="" width="256" height="256"></span><span class="gd-help-topic__no">02</span><span class="gd-help-topic__title">组件与技术</span><span class="gd-help-topic__sum">自研 gd 组件，加上 Cloudflare Workers、D1、KV 和 R2。</span></button>
        <button type="button" class="gd-help-topic" data-help-topic="statements"><span class="gd-help-topic__media" aria-hidden="true"><img src="https://assets.galnavi.top/about/%E5%A3%B0%E6%98%8E.png" alt="" width="256" height="256"></span><span class="gd-help-topic__no">03</span><span class="gd-help-topic__title">声明</span><span class="gd-help-topic__sum">纳普图片、版权和站点收录，这三项声明放在一起。</span></button>
        <button type="button" class="gd-help-topic" data-help-topic="community"><span class="gd-help-topic__media" aria-hidden="true"><img src="https://assets.galnavi.top/about/%E7%A4%BE%E7%BE%A4.png" alt="" width="256" height="256"></span><span class="gd-help-topic__no">04</span><span class="gd-help-topic__title">本站社群</span><span class="gd-help-topic__sum">闲聊群和 B 站账号。</span></button>
        <button type="button" class="gd-help-topic" data-help-topic="feedback"><span class="gd-help-topic__media" aria-hidden="true"><img src="https://assets.galnavi.top/about/%E5%8F%8D%E9%A6%88.png" alt="" width="256" height="256"></span><span class="gd-help-topic__no">05</span><span class="gd-help-topic__title">站点反馈</span><span class="gd-help-topic__sum">页面问题、收录建议和功能建议怎么提。</span></button>
        <button type="button" class="gd-help-topic" data-help-topic="donate"><span class="gd-help-topic__media" aria-hidden="true"><img src="https://assets.galnavi.top/about/%E6%8D%90%E7%8C%AE.png" alt="" width="256" height="256"></span><span class="gd-help-topic__no">06</span><span class="gd-help-topic__title">捐献</span><span class="gd-help-topic__sum">自愿支持站点维护。扫码、其他方式和捐款名单都在这里。</span></button>
        <button type="button" class="gd-help-topic" data-help-topic="friend"><span class="gd-help-topic__media" aria-hidden="true"><img src="https://assets.galnavi.top/about/%E5%8F%8B%E9%93%BE.png" alt="" width="256" height="256"></span><span class="gd-help-topic__no">07</span><span class="gd-help-topic__title">友链</span><span class="gd-help-topic__sum">怎么申请友链，以及已经合作的站点。</span></button>
      </div>
      </div>
      <div id="helpDetail" class="gd-help-detail" hidden>
      <button type="button" class="gd-button gd-button--back gd-help-back" id="helpBackTopics">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        返回专题
      </button>
<section class="gd-section" id="origin"><h2 class="gd-section__title">起源与发展</h2><div class="card">
<h3 id="legend">起源传说</h3>
<p>这是一个科技与魔法的世界，在其中一个角落坐落着一个边缘小镇，很不幸，它正在遭遇一场史无前例的资源匮乏，通往各个幻想乡的道路连接中断，记录着爱与冒险的精神卷轴纷纷遗失。 就在居民们陷入水深火热时，一位披斗篷的猫耳娘站了出来。为了拯救小镇，她在荒野中日夜吟唱魔法，凭一己之力建立起了一座宏伟的灯塔——Galnavi 资源中枢。 此后，小镇的生活也是一天比一天好。人们为了纪念这位猫耳娘，在中央广场建立了荣誉雕像，并取名为猫耳娘纳普。</p>
<h3 id="history">发展史</h3>
<table class="gd-table"><tbody>
<tr><th scope="row">2026.05.23</th><td>galnavi 的项目正式启动</td></tr>
<tr><th scope="row">2026.05.24</th><td>正式注册域名</td></tr>
<tr><th scope="row">2026.05.26</th><td>网页成功部署，开始构建 UI</td></tr>
<tr><th scope="row">2026.05.31</th><td>开始试运营</td></tr>
<tr><th scope="row">2026.06.14</th><td>搜索功能完成开发并开始公测</td></tr>
<tr><th scope="row">2026.06.23</th><td>全面转向 Cloudflare，加快响应速度</td></tr>
<tr><th scope="row">2026.06.26</th><td>完成开发并全面开放</td></tr>
<tr><th scope="row">2026.07.02</th><td>网页 UI 焕新</td></tr>
</tbody></table>
</div></section>
<section class="gd-section" id="components"><h2 class="gd-section__title">组件与技术</h2><div class="card">
<p>每个页面一份 Cloudflare Worker，HTML / CSS / JS 打在同一个文件里。界面是自研 <strong>gd</strong>（GalNavi Design）：深色玻璃拟态。</p>
<h3>GALNAVI Design</h3>
<p>gd 统一视觉和交互：</p>
<ul>
<li><strong>Foundation</strong>：Token、布局、品牌</li>
<li><strong>Navigation</strong>：顶栏、搜索</li>
<li><strong>Display</strong>：卡片、标签、徽章</li>
<li><strong>Feedback</strong>：弹窗、提示</li>
<li><strong>Extend</strong>：主站快捷按钮、详情、捐献</li>
</ul>
<h3 id="tech">技术栈</h3>
<table class="gd-table"><tbody>
<tr><th scope="row">Runtime</th><td>Cloudflare Workers</td></tr>
<tr><th scope="row">Database</th><td>Cloudflare D1</td></tr>
<tr><th scope="row">Storage</th><td>Cloudflare KV、R2</td></tr>
<tr><th scope="row">UI</th><td>GD（GALNAVI Design）</td></tr>
<tr><th scope="row">Frontend</th><td>HTML / CSS / JavaScript</td></tr>
</tbody></table>
<p>数据：D1 放导航、友链、殿堂；KV 放轮播、推荐、捐款和公告；图标与品牌图在 R2。</p>
</div></section>
<section class="gd-section" id="statements"><h2 class="gd-section__title">声明</h2><div class="card">
<h3 id="nap">纳普图片声明</h3>
<ul><li>本站吉祥物及相关视觉形象为 GALNAVI 的品牌形象，仅限本站及经授权的用途使用。</li><li>未经许可，请勿擅自转载、修改、商用或用于其他项目。</li></ul>
<h3 id="copyright">版权声明</h3>
<ul><li>本站尊重知识产权。本站展示的游戏名称、图片、简介等内容，其版权归原著作权人、开发商或发行商所有。</li><li>本站主要提供信息整理、站点导航及相关链接索引，不主张拥有第三方内容的版权。</li><li>如您认为本站展示的内容侵犯了您的合法权益，请联系我们并提供相关权利证明及具体内容。经核实后，本站将及时处理相关内容或链接。</li><li>本站不鼓励、不支持任何侵犯版权及其他违法行为。</li></ul>
<h3 id="disclaimer">站点声明</h3>
<ul><li>GALNAVI 是一个 ACG、Galgame 相关的信息导航与站点聚合平台，主要提供站点收录、信息整理、标签分类及搜索服务。</li><li>本站收录的第三方网站、链接及其内容均由相应网站运营者负责，本站无法保证其内容的准确性、合法性、安全性或持续有效性。</li><li>访问第三方网站或使用其提供的内容前，请自行判断相关风险，并遵守所在地区的法律法规。</li><li>用户不得利用本站从事违法、侵权或其他不当活动。因用户访问或使用第三方网站及内容产生的相关责任，由用户自行承担。</li><li>本站有权根据实际情况调整收录内容及相关服务。</li></ul>
</div></section>
<section class="gd-section" id="community">  <h2 class="gd-section__title">本站社群</h2><div class="card">
<h3>交流群</h3>
<ul>
<li>本站<a class="gd-link" href="https://qm.qq.com/q/mYzxtmRVy8" target="_blank" rel="noopener noreferrer">闲聊群</a>。</li>
<li>本群用于 GALNAVI 相关交流、反馈与 ACG/Galgame 内容讨论。</li>
<li>请文明交流，禁止广告、刷屏、引战及违法违规内容；分享第三方资源或链接时请注意版权与安全。</li>
<li>如有网站问题、收录建议或功能反馈，欢迎在群内提出。</li>
</ul>
<h3>B站</h3>
<ul>
<li>账号：<a class="gd-link" href="https://space.bilibili.com/3744946343382123" rel="noopener noreferrer">@纳普小镇</a></li>
</ul>
</div></section>
<section class="gd-section" id="feedback">  <h2 class="gd-section__title">站点反馈</h2><div class="card"><p>如果你在使用 GALNAVI 时发现问题，欢迎向我们反馈。</p><ul><li><strong>网站问题</strong> — 页面异常、链接失效、显示错误等。</li><li><strong>收录建议</strong> — 推荐新的站点、工具或资源。</li><li><strong>内容问题</strong> — 信息错误、分类不当、描述需要修改。</li><li><strong>功能建议</strong> — 对网站功能或使用体验的建议。</li></ul><p>反馈时请尽量说明具体问题，并附上相关页面链接或截图，方便我们处理。</p><p>目前暂不提供公开邮箱；可通过 <a class="gd-link" href="https://github.com/argb6/gal-navigation" target="_blank" rel="noopener noreferrer">GitHub Issue</a> 提交反馈，或关注本站后续公布的联系渠道。</p></div></section>
<section class="gd-section" id="donate">
  <h2 class="gd-section__title">捐献</h2>
  <div class="card"><p>支持 GALNAVI 资源中枢的日常维护。自愿捐献，感谢每一份心意。</p>
    <h3>为何支持</h3>
    <ul>
      <li>GALNAVI 是非营利的 ACG 资源导航站。灯塔要亮着，需要持续整理收录、维护页面，以及支付基础的托管与域名开销。</li>
      <li>如果你觉得这里帮到过你，可以自愿支持一点点——金额不论大小，心意我们都收下。捐款不会换取会员特权或特殊权限，仅用于支持网站的持续运营与维护。</li>
    </ul>
    <h3>扫码支持</h3>
    <div class="gd-donate-grid">${renderQrCard("支付宝", QR_ALIPAY)}${renderQrCard("微信", QR_WECHAT)}</div>
    <p class="gd-donate-note">相关信息请在付款界面备注</p>
    <h3>其他方式</h3>
    <ul>
      <li>捐献相关问题可通过 <a class="gd-link" href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub Issue</a> 说明</li>
      <li><a class="gd-link" href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a> — 给一颗 Star 支持一下</li>
    </ul>
    ${renderDonorTable(donors)}
    <h3>说明</h3>
    <p>请确认你正在官方域名 galnavi.top 上操作。本页不会通过弹窗、私信或不明链接索要转账。未成年人请在监护人同意下再考虑支持。感谢每一位愿意支持 GALNAVI 的朋友。</p>
  </div>
</section>
<section class="gd-section" id="friend">
  <h2 class="gd-section__title">友链</h2>
  <div class="card">
    <h3 id="apply">申请友链</h3>
    <ul>
      <li>本站名称：GALNAVI</li>
      <li>本站描述：ACG 二次元资源导航网站</li>
      <li>本站链接：<a class="gd-link" href="https://galnavi.top/">https://galnavi.top/</a></li>
      <li>本站图标：<a class="gd-link" href="https://assets.galnavi.top/icon.png">https://assets.galnavi.top/icon.png</a></li>
      <li>联系方式：见本页 <a class="gd-link" href="#feedback">反馈</a></li>
    </ul>
    <h3 id="links">友情链接</h3>
    ${linksHtml}
  </div>
</section>
      </div>
    </div>
  </div>
</div>
<footer class="gd-footer gd-footer--page"><nav class="gd-footer__nav" aria-label="页脚链接"><a href="https://galnavi.top/nav/">主站首页</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="https://galnavi.top/nav/help/">帮助文档</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="https://galnavi.top/nav/about/">关于本站</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="https://galnavi.top/nav/about/#friend">友情链接</a>
<span class="gd-footer__sep" aria-hidden="true">|</span>
<a href="#feedback">联系站长</a></nav><p class="gd-footer__copy">© 2026 GALNAVI · 愿每一次探索都有新的收获</p></footer>

<script>
(function(){function a(){var h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;document.documentElement.style.setProperty("--gd-vvh",h+"px");}a();window.addEventListener("resize",a);if(window.visualViewport)window.visualViewport.addEventListener("resize",a);})();
(function() {
  var hub = document.getElementById('helpHub');
  var detail = document.getElementById('helpDetail');
  var back = document.getElementById('helpBackTopics');
  if (!hub || !detail) return;
  var sections = Array.prototype.slice.call(detail.querySelectorAll('.gd-section[id]'));
  var alias = { legend: 'origin', history: 'origin', nap: 'statements', copyright: 'statements', disclaimer: 'statements', tech: 'components', apply: 'friend', links: 'friend' };
  function showTopic(id) {
    var target = alias[id] || id;
    var found = false;
    sections.forEach(function(sec) {
      var on = sec.id === target;
      sec.classList.toggle('is-on', on);
      if (on) found = true;
    });
    if (!found) return;
    hub.hidden = true;
    detail.hidden = false;
    var sub = alias[id] ? document.getElementById(id) : null;
    if (sub) requestAnimationFrame(function() { sub.scrollIntoView({ block: 'start' }); });
    else window.scrollTo(0, 0);
  }
  function showHub() {
    detail.hidden = true;
    hub.hidden = false;
    sections.forEach(function(sec) { sec.classList.remove('is-on'); });
    window.scrollTo(0, 0);
  }
  hub.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-help-topic]');
    if (!btn || !hub.contains(btn)) return;
    var id = btn.getAttribute('data-help-topic');
    showTopic(id);
    try { history.pushState({ helpTopic: id }, '', '#' + id); } catch (err) {}
  });
  if (back) back.addEventListener('click', function() {
    showHub();
    try { history.pushState({ helpTopic: '' }, '', location.pathname + location.search); } catch (err) {}
  });
  window.addEventListener('popstate', function() {
    var id = (location.hash || '').replace(/^#/, '');
    if (id) showTopic(id);
    else showHub();
  });
  var initial = (location.hash || '').replace(/^#/, '');
  if (initial) showTopic(initial);
})();
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

function leaveTone(el){var cs=getComputedStyle(el);var buttonLike=el.matches("button, .gd-button, .gd-card__btn, .gd-card__action, .gd-section-card__link, input[type='button'], input[type='submit']");if(!buttonLike){var img=cs.backgroundImage&&cs.backgroundImage!=="none";var bgm=(cs.backgroundColor||"").match(/rgba?\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+(?:\\s*,\\s*([\\d.]+))?\\)/);var alpha=bgm?(bgm[1]==null?1:parseFloat(bgm[1])):0;var filled=img||alpha>0.25;var inline=cs.display==="inline"||(cs.display==="inline-block"&&(parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight)<16));buttonLike=filled&&!inline}if(!buttonLike)return"#ffffff";var stops=(cs.backgroundImage||"").match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)/);var src=stops?[+stops[1],+stops[2],+stops[3]]:null;if(!src){var solid=(cs.backgroundColor||"").match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)/);if(solid)src=[+solid[1],+solid[2],+solid[3]]}if(!src)return"#ffffff";return"rgb("+src.map(function(n){return Math.round(n+(255-n)*0.42)}).join(",")+")"}
var LEAVE_MS=2400;
function paintLeave(el,onEnd){if(!el||window.matchMedia("(prefers-reduced-motion: reduce)").matches){if(onEnd)setTimeout(onEnd,LEAVE_MS);return}var prev=el.querySelector(".gd-leave-svg");if(prev)prev.remove();var color=leaveTone(el);var text=color==="#ffffff";var w=el.offsetWidth,h=el.offsetHeight;if(!w||!h){if(onEnd)setTimeout(onEnd,LEAVE_MS);return}var radius=parseFloat(getComputedStyle(el).borderRadius)||0;var stroke=3,half=stroke/2;var entry=el.classList.contains("gd-section-card__link");var outside=text?6:(entry?half:0);var bw=w+outside*2,bh=h+outside*2;var rx=text?Math.min(bw,bh)/2:Math.max(0,Math.min(radius+outside,bw/2,bh/2));var wrap=document.createElement("span");wrap.className="gd-leave-svg";wrap.setAttribute("aria-hidden","true");wrap.style.left=(-(outside+half))+"px";wrap.style.top=(-(outside+half))+"px";wrap.style.right="auto";wrap.style.bottom="auto";wrap.style.width=(bw+stroke)+"px";wrap.style.height=(bh+stroke)+"px";var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 "+(bw+stroke)+" "+(bh+stroke));var rect=document.createElementNS("http://www.w3.org/2000/svg","rect");rect.setAttribute("x",String(half));rect.setAttribute("y",String(half));rect.setAttribute("width",String(bw));rect.setAttribute("height",String(bh));rect.setAttribute("rx",String(rx));rect.setAttribute("fill","none");rect.setAttribute("stroke",color);rect.setAttribute("stroke-width",String(stroke));rect.setAttribute("stroke-linecap","round");rect.setAttribute("stroke-linejoin","round");rect.setAttribute("pathLength","100");rect.setAttribute("stroke-dasharray","18 82");rect.style.filter="drop-shadow(0 0 4px "+color+")";var spin=document.createElementNS("http://www.w3.org/2000/svg","animate");spin.setAttribute("attributeName","stroke-dashoffset");spin.setAttribute("from","0");spin.setAttribute("to","-200");spin.setAttribute("dur","2.4s");spin.setAttribute("fill","freeze");rect.appendChild(spin);if(onEnd)wrap.addEventListener("animationend",onEnd);svg.appendChild(rect);wrap.appendChild(svg);el.appendChild(wrap)}
function startRedirect(targetUrl,sourceEl){if(timerId)return;var jumped=false;var waitId=0;function go(){if(jumped)return;jumped=true;clearTimeout(waitId);timerId=null;if(sourceEl){sourceEl.classList.remove("gd-leave");sourceEl.removeAttribute("aria-busy");var mark=sourceEl.querySelector(".gd-leave-svg");if(mark)mark.remove()}onCancel=null;var pending=null;try{pending=window.open(targetUrl,"_blank")}catch(e){pending=null}if(!pending)window.location.href=targetUrl}if(sourceEl){onCancel=sourceEl;sourceEl.classList.add("gd-leave");sourceEl.setAttribute("aria-busy","true");paintLeave(sourceEl,go)}waitId=setTimeout(go,LEAVE_MS+80);timerId=waitId;}
document.addEventListener("click",function(e){var anchor=e.target.closest("a");if(!anchor)return;var href=anchor.getAttribute("href");if(!href)return;var lower=href.trim().toLowerCase();if(lower.indexOf("javascript:")===0||lower.indexOf("data:")===0){e.preventDefault();return}if(href.charAt(0)==="#")return;if(href.indexOf("https://galnavi.top/nav/")===0||href.indexOf("/nav/")===0)return;if(!isSafeHttpUrl(href))return;if(anchor.closest(".gd-below-nav"))return;try{if(new URL(href,window.location.origin).hostname===window.location.hostname)return}catch(err){return}e.preventDefault();startRedirect(href,anchor);},true);
})();
</script>
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
}
