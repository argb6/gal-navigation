// GALNAVI Worker - Open Source Version
// Sensitive information has been redacted.

export default {
async fetch(request, env, ctx) {
const url = new URL(request.url);
let itemKey = url.searchParams.get("item_key");
if (!itemKey) {
itemKey = url.searchParams.get("");
}
if (!itemKey) {
const parts = url.pathname.replace(/\/+$/, "").split("/");
const last = parts[parts.length - 1];
if (last && last !== "detail" && last !== "nav") {
itemKey = last;
}
}
if (!itemKey) {
return new Response("Missing item_key", { status: 400 });
}
const stmt = env.DB.prepare(
"SELECT title, short_desc, tags, md_content, category FROM sites WHERE item_key = ?"
);
const row = await stmt.bind(itemKey).first();
if (!row) {
return new Response("Not Found", { status: 404 });
}
const ALLOWED_CATEGORIES = new Set([
  "websites", "tools", "simulators", "site", "tool", "simulator",
  "company", "hanhua",
]);
const category = String(row.category || "").toLowerCase();
if (!ALLOWED_CATEGORIES.has(category)) {
return new Response("Not Found", { status: 404 });
}
const { title, short_desc, tags, md_content } = row;
const branches = parseMdContent(md_content || "");
const tagList = tags
? tags.split(",").map(t => t.trim()).filter(Boolean)
: [];
const html = renderPage(title || "", short_desc || "", tagList, branches, itemKey, category);
return new Response(html, {
headers: {
"Content-Type": "text/html; charset=utf-8",
"Cache-Control": "private, no-store",
"X-Content-Type-Options": "nosniff",
"X-Frame-Options": "SAMEORIGIN",
"Referrer-Policy": "strict-origin-when-cross-origin",
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://example.com; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
},
});
},
};
function parseMdContent(md) {
const branches = [];
const regex = /## (.+?)(?=\n## |$)/gs;
let match;
let isFirst = true;
while ((match = regex.exec(md)) !== null) {
if (isFirst) {
isFirst = false;
continue;
}
const block = match[0];
const titleEnd = block.indexOf("\n");
const heading = titleEnd > -1 ? block.slice(3, titleEnd).trim() : block.slice(3).trim();
const body = titleEnd > -1 ? block.slice(titleEnd + 1).trim() : "";
const leaves = parseLeaves(body);
branches.push({ heading, leaves });
}
return branches;
}
function parseLeaves(body) {
const leaves = [];
const lines = body.split("\n");
for (const line of lines) {
const trimmed = line.trim();
if (!trimmed.startsWith("- ") && !trimmed.startsWith("* ")) continue;
const content = trimmed.slice(2).trim();
if (!content) continue;
const colonIdx = content.search(/[：:]/);
let label = "";
let value = content;
if (colonIdx > 0) {
label = content.slice(0, colonIdx).trim();
value = content.slice(colonIdx + 1).trim();
}
const linkInfo = extractLink(value);
leaves.push({ label, value, ...linkInfo });
}
return leaves;
}
function extractLink(text) {
const mdLink = text.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/i);
if (mdLink) {
return {
url: mdLink[2],
linkText: mdLink[1],
desc: text.replace(mdLink[0], "").trim().replace(/^[—\-–]\s*/, ""),
};
}
const bareUrl = text.match(/(https?:\/\/[^\s]+)/);
if (bareUrl) {
const url = bareUrl[1];
const desc = text.replace(url, "").trim().replace(/^[—\-–]\s*/, "");
return { url, linkText: url, desc };
}
const mailto = text.match(/(mailto:[^\s]+)/i);
if (mailto) {
const url = mailto[1];
const email = url.replace(/^mailto:/i, "");
const desc = text.replace(mailto[0], "").trim().replace(/^[—\-–]\s*/, "");
return { url, linkText: email, desc };
}
const bareEmail = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
if (bareEmail) {
const email = bareEmail[1];
const desc = text.replace(email, "").trim().replace(/^[—\-–]\s*/, "");
return { url: "mailto:" + email, linkText: email, desc };
}
return { url: null, linkText: null, desc: text };
}
function pageTypeLabel(category) {
if (category === "company") return "会社详情";
if (category === "hanhua") return "汉化组详情";
return "站点详情";
}
function formatLeafText(l) {
const body = l.desc || l.value || "";
if (l.label) return `${l.label}：${body}`;
return body;
}
function renderPage(title, shortDesc, tags, branches, itemKey, category) {
const typeLabel = pageTypeLabel(category);
const canonical = itemKey
? `/nav/detail/?item_key=${encodeURIComponent(itemKey)}`
: "/nav/detail/";
return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} - ${escapeHtml(typeLabel)}</title>
<meta name="robots" content="index, follow">
<link rel="icon" href="https://your-cdn.example.com/assets/icon/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="https://your-cdn.example.com/assets/icon/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
<style>
/* ===== 组件库（构建期内联） ===== */
/* ===== src/foundation/tokens/tokens.css ===== */
:root {
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
  --gd-color-link: #7aa2f7;
  --gd-color-link-hover: #9ec0ff;
  --gd-color-accent-light: #a78bfa;
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
  --gd-dot-1: var(--gd-color-primary);
  --gd-dot-2: var(--gd-color-secondary);
  --gd-dot-3: var(--gd-color-tertiary);
  --gd-dot-neutral: #5a6a8a;
  --gd-tag-1-bg: rgba(168, 85, 247, 0.12);
  --gd-tag-1-fg: #c4b5fd;
  --gd-tag-1-border: rgba(168, 85, 247, 0.2);
  --gd-tag-2-bg: rgba(59, 130, 246, 0.12);
  --gd-tag-2-fg: #93c5fd;
  --gd-tag-2-border: rgba(59, 130, 246, 0.2);
  --gd-tag-3-bg: rgba(236, 72, 153, 0.12);
  --gd-tag-3-fg: #f9a8d4;
  --gd-tag-3-border: rgba(236, 72, 153, 0.2);
  --gd-badge-bg: var(--gd-glass-border);
  --gd-badge-fg: #d7e2ff;
  --gd-badge-blue-bg: rgba(79, 124, 255, 0.28);
  --gd-badge-blue-fg: #eaf0ff;
  --gd-badge-gold-bg: rgba(251, 191, 36, 0.14);
  --gd-badge-gold-fg: #fcd34d;
  --gd-shape-corner-none: 0;
  --gd-shape-corner-extra-small: 8px;
  --gd-shape-corner-small: 14px;
  --gd-shape-corner-medium: 18px;
  --gd-shape-corner-large: 20px;
  --gd-shape-corner-extra-large: 28px;
  --gd-shape-corner-full: 9999px;
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
  --gd-type-letter-spacing-tight: -0.5px;
  --gd-type-letter-spacing-normal: 0.01em;
  --gd-type-letter-spacing-wide: 0.1em;
  --gd-type-letter-spacing-extra-wide: 0.24em;
  --gd-weight-regular: 400;
  --gd-weight-medium: 500;
  --gd-weight-semibold: 600;
  --gd-weight-bold: 700;
  --gd-weight-extrabold: 800;
  --gd-weight-black: 900;
  --gd-font-sans: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --gd-state-hover: 0.08;
  --gd-state-focus: 0.12;
  --gd-state-pressed: 0.12;
  --gd-state-dragged: 0.16;
  --gd-state-disabled: 0.38;
  --gd-motion-duration-short2: 100ms;
  --gd-motion-duration-short4: 200ms;
  --gd-motion-duration-medium1: 250ms;
  --gd-motion-duration-medium2: 300ms;
  --gd-motion-duration-medium4: 400ms;
  --gd-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --gd-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --gd-nav-height: 64px;
  --gd-layout-max-width: 1200px;
  --gd-space-1: 4px;
  --gd-space-2: 8px;
  --gd-space-3: 12px;
  --gd-space-4: 16px;
  --gd-space-5: 20px;
  --gd-space-6: 24px;
  --gd-touch-target: 48px;
  --gd-elevation-level2: 0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3);
  --gd-elevation-glow: 0 0 40px rgba(79, 124, 255, 0.2), 0 0 80px rgba(168, 85, 247, 0.08);
  --gd-glass-bg: rgba(18, 22, 40, 0.42);
  --gd-glass-bg-hover: rgba(22, 28, 48, 0.52);
  --gd-glass-blur: blur(18px) saturate(165%);
  --gd-glass-border: rgba(255, 255, 255, 0.14);
  --gd-glass-nav-bg: rgba(8, 12, 24, 0.75);
  --gd-glass-nav-blur: blur(20px) saturate(180%);
}

/* ===== src/foundation/brand/gd-brand.css ===== */
.gd-brand { margin-bottom: var(--gd-space-6); overflow: visible; padding-bottom: 8px; }
.gd-brand__title { display: inline-block; max-width: 100%; margin: 0; padding: 0; font-family: var(--gd-font-sans); font-size: clamp(var(--gd-type-display-small-size), 6vw, 52px); line-height: 1.35; font-weight: var(--gd-weight-black); letter-spacing: var(--gd-type-letter-spacing-wide); color: var(--gd-color-primary); text-shadow: 0 0 20px rgba(var(--gd-color-primary-rgb), 0.45); animation: gd-brand-glow 3s linear infinite; }
@keyframes gd-brand-glow { 0% { color: var(--gd-color-primary); text-shadow: 0 0 18px rgba(var(--gd-color-primary-rgb), 0.48); } 16.67% { color: rgba(var(--gd-color-sky-rgb), 0.78); text-shadow: 0 0 18px rgba(var(--gd-color-sky-rgb), 0.4); } 33.33% { color: var(--gd-color-cyan); text-shadow: 0 0 16px rgba(var(--gd-color-cyan-rgb), 0.36); } 50% { color: var(--gd-color-cyan-light); text-shadow: 0 0 14px rgba(var(--gd-color-cyan-light-rgb), 0.28); } 66.67% { color: rgba(var(--gd-color-sky-blue-rgb), 0.7); text-shadow: 0 0 16px rgba(var(--gd-color-sky-blue-rgb), 0.38); } 83.33% { color: var(--gd-color-secondary); text-shadow: 0 0 20px rgba(var(--gd-color-secondary-rgb), 0.48); } 100% { color: var(--gd-color-primary); text-shadow: 0 0 18px rgba(var(--gd-color-primary-rgb), 0.48); } }
.gd-brand__title--shift { animation: gd-brand-glow 3s linear infinite; }
.gd-brand__title--palace { animation: gd-brand-glow-palace 2.25s linear infinite alternate; }
@keyframes gd-brand-glow-palace { 0% { color: rgba(var(--gd-color-green-rgb), 1); text-shadow: 0 0 18px rgba(var(--gd-color-green-rgb), 0.4); } 33.33% { color: rgba(var(--gd-color-error-rgb), 1); text-shadow: 0 0 18px rgba(var(--gd-color-error-rgb), 0.45); } 66.67% { color: rgba(var(--gd-color-gold-deep-rgb), 1); text-shadow: 0 0 18px rgba(var(--gd-color-gold-deep-rgb), 0.45); } 100% { color: rgba(var(--gd-color-gold-deep-rgb), 1); text-shadow: 0 0 18px rgba(var(--gd-color-gold-deep-rgb), 0.45); } }
.gd-brand__title--demo { font-size: clamp(28px, 5vw, 40px); margin: 8px 0 0; }
@media (prefers-reduced-motion: reduce) { .gd-brand__title, .gd-brand__title--shift, .gd-brand__title--palace { animation: none; } }

/* ===== src/foundation/layout/gd-groundback.css ===== */
.gd-groundback { position: fixed; inset: 0; z-index: -1; pointer-events: none; background: var(--gd-color-background); }
.gd-groundback::before, .gd-groundback::after { content: ""; position: absolute; inset: 0; }
.gd-groundback--blue { background: radial-gradient(circle at 22% 18%, rgba(var(--gd-color-blue-rgb), 0.2), transparent 34%), radial-gradient(circle at 78% 76%, rgba(var(--gd-color-cyan-rgb), 0.14), transparent 32%), radial-gradient(circle at 50% 50%, rgba(var(--gd-color-secondary-rgb), 0.06), transparent 52%), linear-gradient(145deg, var(--gd-color-background) 0%, var(--gd-color-surface) 45%, var(--gd-color-surface-variant) 100%); }
.gd-groundback--blue::before { background-image: radial-gradient(circle at 1px 1px, rgba(var(--gd-color-white-rgb), 0.04) 1px, transparent 0); background-size: 40px 40px; -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.34)); mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.34)); }
.gd-groundback--blue::after { background: linear-gradient(90deg, transparent, rgba(var(--gd-color-white-rgb), 0.028), transparent), radial-gradient(circle at 50% 110%, rgba(var(--gd-color-blue-rgb), 0.12), transparent 36%); }
.gd-groundback--gold { background: linear-gradient(145deg, #06070e 0%, #0a0c16 48%, #0e1322 100%); }
.gd-groundback--gold::before { background: radial-gradient(40% 35% at 18% 14%, rgba(var(--gd-color-gold-rgb), 0.12), transparent 70%), radial-gradient(36% 32% at 86% 82%, rgba(var(--gd-color-error-rgb), 0.10), transparent 70%); }

/* ===== src/foundation/actions/gd-button.css ===== */
.gd-button { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: var(--gd-space-2); min-height: var(--gd-touch-target); min-width: var(--gd-touch-target); padding: 10px 18px; border-radius: var(--gd-shape-corner-small); border: 1px solid transparent; font-family: var(--gd-font-sans); font-size: var(--gd-type-label-large-size); font-weight: var(--gd-weight-semibold); line-height: var(--gd-type-label-large-line); text-decoration: none; cursor: pointer; color: var(--gd-color-on-surface); background: transparent; transition: background var(--gd-motion-duration-short4) var(--gd-motion-easing-standard), border-color var(--gd-motion-duration-short4) var(--gd-motion-easing-standard), transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard), opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard); overflow: hidden; }
.gd-button::before { content: ""; position: absolute; inset: 0; background: currentColor; opacity: 0; pointer-events: none; transition: opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard); }
.gd-button:hover::before { opacity: var(--gd-state-hover); }
.gd-button:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-button:focus-visible::before { opacity: var(--gd-state-focus); }
.gd-button:active::before { opacity: var(--gd-state-pressed); }
.gd-button:disabled, .gd-button[aria-disabled="true"] { opacity: var(--gd-state-disabled); pointer-events: none; cursor: not-allowed; }
.gd-button--primary { background: linear-gradient(135deg, var(--gd-color-primary), var(--gd-gradient-primary-a)); color: var(--gd-color-on-primary); box-shadow: 0 4px 18px rgba(var(--gd-color-primary-rgb), 0.28); }
.gd-button--primary:hover { filter: brightness(1.06); transform: none; }
.gd-button--secondary { background: rgba(var(--gd-color-white-rgb), 0.04); border-color: rgba(var(--gd-color-white-rgb), 0.12); color: var(--gd-color-on-surface-variant); }
.gd-button--secondary:hover { background: rgba(var(--gd-color-white-rgb), 0.08); border-color: rgba(var(--gd-color-white-rgb), 0.2); color: var(--gd-color-on-surface); }
.gd-button--danger { background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b)); color: var(--gd-color-on-primary); }
.gd-button--pill { border-radius: var(--gd-shape-corner-full); }
.gd-button--detail, .gd-button--link { flex: 0 0 auto; width: 164px; height: 39px; min-width: 0; min-height: 0; padding: 0; border-radius: 12px; border: none; font-size: var(--gd-type-note-size); font-weight: var(--gd-weight-semibold); letter-spacing: var(--gd-type-letter-spacing-wide); text-align: center; color: var(--gd-color-on-primary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.gd-button--detail { background: linear-gradient(135deg, var(--gd-gradient-primary-a), var(--gd-gradient-primary-b)); box-shadow: none; }
.gd-button--detail:hover { background: linear-gradient(135deg, var(--gd-gradient-primary-hover-a), var(--gd-gradient-primary-hover-b)); filter: brightness(1.06); transform: none; }
.gd-button--link { background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b)); box-shadow: none; }
.gd-button--link:hover { background: linear-gradient(135deg, var(--gd-gradient-pink-hover-a), var(--gd-gradient-pink-hover-b)); filter: brightness(1.06); transform: none; }
.gd-button--detail.is-disabled, .gd-button--link.is-disabled, .gd-button--detail:disabled, .gd-button--link:disabled { opacity: 0.3; pointer-events: none; cursor: not-allowed; box-shadow: none; }
.gd-button--ghost { flex: 0 0 auto; min-height: 38px; padding: 0 16px; border: 1px solid rgba(var(--gd-color-accent-rgb), 0.3); border-radius: 12px; background: rgba(var(--gd-color-accent-rgb), 0.15); color: var(--gd-tag-1-fg); font-size: var(--gd-type-note-size); font-weight: var(--gd-weight-bold); }
.gd-button--ghost:hover { background: rgba(var(--gd-color-accent-rgb), 0.25); border-color: rgba(var(--gd-color-accent-rgb), 0.45); color: var(--gd-color-on-primary); }
.gd-button--ghost.is-disabled, .gd-button--ghost:disabled { opacity: 0.3; pointer-events: none; cursor: not-allowed; }
.gd-button--wide { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid transparent; font-size: var(--gd-type-title-small-size); font-weight: var(--gd-weight-bold); }
.gd-button--back { position: relative; display: inline-flex; align-items: center; gap: 8px; height: 40px; min-height: 0; min-width: 0; padding: 0 16px 0 12px; border: 1px solid rgba(var(--gd-color-white-rgb), 0.12); border-radius: 10px; background: rgba(0, 0, 0, 0.3); color: var(--gd-color-on-surface); font-size: var(--gd-type-title-small-size); font-weight: var(--gd-weight-bold); line-height: 1.2; box-shadow: none; overflow: visible; transition: border-color 0.2s var(--gd-motion-easing-standard), background 0.2s var(--gd-motion-easing-standard), transform 0.2s var(--gd-motion-easing-standard), color 0.2s var(--gd-motion-easing-standard); }
.gd-button--back::before { display: none; }
.gd-button--back svg { width: 16px; height: 16px; flex-shrink: 0; display: block; }
.gd-button--back:hover { border-color: rgba(var(--gd-color-indigo-rgb), 0.45); background: var(--gd-color-surface); transform: translateX(-2px); color: var(--gd-color-on-primary); filter: none; }
.gd-button--back--orange:hover { border-color: rgba(var(--gd-color-gold-deep-rgb), 0.6); background: rgba(var(--gd-color-gold-deep-rgb), 0.12); color: var(--gd-color-on-surface); filter: none; }
.gd-button--back:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
@media (max-width: 640px) { .gd-button--back { font-size: var(--gd-type-label-large-size); height: 44px; padding: 0 12px; } }
@media (prefers-reduced-motion: reduce) { .gd-button, .gd-button::before { transition: none; } .gd-button--primary:hover, .gd-button--back:hover { transform: none; } }

/* ===== src/extend/detail/gd-detail.css ===== */
.gd-highlights { background: var(--gd-glass-bg); backdrop-filter: none; -webkit-backdrop-filter: none; border-radius: var(--gd-shape-corner-medium); border: 1px solid var(--gd-glass-border); box-shadow: none; padding: 20px 22px; margin-bottom: 20px; transition: background 0.3s var(--gd-motion-easing-standard), border-color 0.3s var(--gd-motion-easing-standard); }
.gd-highlights:hover { background: var(--gd-glass-bg-hover); border-color: var(--gd-color-border-hover); }
.gd-highlights:hover { border-color: rgba(var(--gd-color-accent-rgb), 0.28); }
.gd-highlights__label { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; font-size: var(--gd-type-title-xxl-size); font-weight: var(--gd-weight-semibold); color: var(--gd-color-on-surface); font-family: var(--gd-font-sans); line-height: 1; }
.gd-highlights__icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: var(--gd-type-title-xxl-size); color: var(--gd-color-accent-light); }
.gd-highlights__icon svg { width: auto; height: 1em; display: block; }
.gd-highlights__list { display: flex; flex-direction: column; gap: 8px; }
.gd-highlights__item { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 12px; background: rgba(var(--gd-color-white-rgb), 0.04); border: 1px solid rgba(var(--gd-color-white-rgb), 0.08); font-size: var(--gd-type-title-small-size); color: var(--gd-color-on-surface-subtle); line-height: 1.55; transition: background 0.2s var(--gd-motion-easing-standard), border-color 0.2s var(--gd-motion-easing-standard), box-shadow 0.2s var(--gd-motion-easing-standard); }
.gd-highlights__item:hover { background: rgba(var(--gd-color-accent-rgb), 0.15); border-color: rgba(var(--gd-color-accent-rgb), 0.3); box-shadow: 0 0 0 3px rgba(var(--gd-color-accent-rgb), 0.18); }
.gd-highlights__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gd-color-secondary); flex-shrink: 0; align-self: center; box-shadow: 0 0 0 3px rgba(var(--gd-color-accent-rgb), 0.3); }
.gd-highlights__text { flex: 1; min-width: 0; }
.gd-section-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: stretch; min-width: 0; }
.gd-section-card { display: flex; flex-direction: column; min-height: 0; padding: 18px; border-radius: var(--gd-shape-corner-medium); background: var(--gd-glass-bg); backdrop-filter: none; -webkit-backdrop-filter: none; border: 1px solid var(--gd-glass-border); box-shadow: none; transition: background var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard), border-color var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard), box-shadow var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard), filter var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard); }
.gd-section-card:hover { background: var(--gd-glass-bg-hover); border-color: var(--gd-color-border-hover); box-shadow: 0 0 24px rgba(var(--gd-color-accent-rgb), 0.14), inset 0 1px 0 rgba(var(--gd-color-white-rgb), 0.06); filter: brightness(1.05); }
.gd-section-card:hover { border-color: var(--gd-color-border-accent); }
.gd-section-card__header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-shrink: 0; }
.gd-section-card__icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: var(--gd-type-title-xxl-size); color: var(--gd-color-accent-light); }
.gd-section-card__icon svg { width: auto; height: 1em; display: block; }
.gd-icon-demo { display: inline-flex; align-items: center; gap: 8px; color: var(--gd-color-accent-light); }
.gd-icon-demo .gd-icon-demo__name { color: var(--gd-color-on-surface-variant); font-size: var(--gd-type-title-small-size); }
.gd-icon-demo .gd-icon-demo__sep { color: var(--gd-color-on-surface-subtle); font-size: var(--gd-type-title-small-size); }
.gd-section-card__title { font-size: var(--gd-type-title-xxl-size); font-weight: 550; color: var(--gd-color-on-surface); font-family: var(--gd-font-sans); line-height: 1; }
.gd-section-card__links { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
.gd-section-card__link, .gd-section-card__entry { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 12px; background: rgba(var(--gd-color-white-rgb), 0.04); border: 1px solid rgba(var(--gd-color-white-rgb), 0.08); font-size: var(--gd-type-title-small-size); color: var(--gd-color-on-surface-variant); line-height: 1.5; text-decoration: none; position: relative; min-width: 0; transition: background 0.2s var(--gd-motion-easing-standard), border-color 0.2s var(--gd-motion-easing-standard), color 0.2s var(--gd-motion-easing-standard), box-shadow 0.2s var(--gd-motion-easing-standard); }
.gd-section-card__link { cursor: pointer; font-family: var(--gd-font-sans); }
.gd-section-card__link:hover, .gd-section-card__entry:hover { background: rgba(var(--gd-color-sky-rgb), 0.15); border-color: rgba(var(--gd-color-sky-rgb), 0.3); box-shadow: 0 0 0 3px rgba(var(--gd-color-sky-rgb), 0.14); color: var(--gd-color-on-surface); }
.gd-section-card__label { font-weight: var(--gd-weight-medium); color: var(--gd-color-sky); white-space: normal; word-break: break-all; overflow-wrap: break-word; min-width: 0; }
.gd-section-card__url { margin-left: auto; font-size: var(--gd-type-label-medium-size); color: var(--gd-color-sky); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; opacity: 0; transition: opacity 0.2s var(--gd-motion-easing-standard); }
.gd-section-card__link:hover .gd-section-card__url { opacity: 1; }
.gd-section-card__entry { cursor: default; color: var(--gd-color-on-surface-subtle); }
.gd-section-card__entry .gd-section-card__label { color: var(--gd-color-on-surface-subtle); font-weight: var(--gd-weight-regular); }
@media (max-width: 768px) { .gd-section-card-grid { display: flex; flex-direction: column; gap: 14px; } .gd-section-card { padding: 16px; height: auto; } .gd-section-card__links { gap: 10px; } .gd-section-card__link, .gd-section-card__entry { padding: 12px 14px; font-size: var(--gd-type-title-small-size); min-height: 44px; } .gd-section-card__url { display: none; } .gd-highlights { padding: 18px; margin-bottom: 16px; } }
@media (hover: none) { .gd-section-card { -webkit-tap-highlight-color: transparent; } .gd-section-card:active { box-shadow: 0 0 24px rgba(var(--gd-color-accent-rgb), 0.2), inset 0 1px 0 rgba(var(--gd-color-white-rgb), 0.06); background: var(--gd-glass-bg-hover); border-color: var(--gd-color-border-accent); } }
@media (prefers-reduced-motion: reduce) { .gd-highlights, .gd-highlights__item, .gd-section-card, .gd-section-card__link, .gd-section-card__entry { transition: none; } .gd-highlights__item:hover { transform: none; } }

/* ===== src/foundation/layout/gd-footer.css ===== */
.gd-footer { text-align: center; padding: 28px 16px 40px; color: rgba(var(--gd-color-muted-white-rgb), 0.62); font-size: var(--gd-type-note-size); font-weight: var(--gd-weight-regular); line-height: 1.7; letter-spacing: var(--gd-type-letter-spacing-normal); font-family: var(--gd-font-sans); }
.gd-footer__nav { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px 0; margin: 0 0 12px; padding: 0; list-style: none; }
.gd-footer__nav a { color: rgba(var(--gd-color-muted-white-rgb), 0.62); text-decoration: none; font-size: var(--gd-type-note-size); font-weight: var(--gd-weight-medium); line-height: 1.5; padding: 4px 8px; min-height: 24px; }
.gd-footer__nav a:hover { color: var(--gd-color-link-hover); }
.gd-footer__nav a:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-footer__sep { color: rgba(var(--gd-color-muted-white-rgb), 0.28); user-select: none; font-size: var(--gd-type-label-medium-size); }
.gd-footer__copy { margin: 0; }

/* ===== detail 页面特有样式 ===== */
html { scroll-behavior: smooth; background: var(--gd-color-background); }
body.gd-detail { margin: 0; min-height: 100%; color: var(--gd-color-on-surface); font-family: var(--gd-font-sans); text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; background: radial-gradient(40% 35% at 18% 12%, rgba(var(--gd-color-indigo-rgb), 0.3), transparent 70%), radial-gradient(35% 30% at 88% 78%, rgba(var(--gd-color-blue-deep-rgb), 0.22), transparent 70%), var(--gd-color-background); background-attachment: fixed; padding: 64px 28px 40px; }
.gd-detail__container { position: relative; z-index: 1; max-width: 1100px; width: 100%; margin: 0 auto; display: flex; flex-direction: column; min-width: 0; }
.gd-back-fab { position: fixed; top: max(12px, env(safe-area-inset-top, 0px)); left: max(12px, env(safe-area-inset-left, 0px)); z-index: 50; }
.gd-detail__header { flex-shrink: 0; margin-bottom: 22px; }
.gd-detail__header-top { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 14px; }
.gd-detail__header-top .gd-brand__title { margin: 0; }
.gd-detail__intro { color: var(--gd-color-on-surface-subtle); font-size: var(--gd-type-title-small-size); font-weight: var(--gd-weight-regular); line-height: 1.65; max-width: 42em; }
.tags-row { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: var(--gd-shape-corner-full); font-size: var(--gd-type-label-large-size); font-weight: var(--gd-weight-medium); white-space: nowrap; transition: background 0.2s ease, border-color 0.2s ease; text-decoration: none; cursor: pointer; }
.tag:hover { filter: brightness(1.12); }
.tag.green { background: rgba(74, 222, 128, 0.15); border: 1px solid rgba(74, 222, 128, 0.25); color: #4ade80; }
.tag.orange { background: rgba(251, 146, 60, 0.15); border: 1px solid rgba(251, 146, 60, 0.25); color: #fb923c; }
.tag.sky { background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.25); color: #38bdf8; }
.gd-detail__grid { margin-bottom: 8px; }
.redirect-overlay { position: fixed; inset: 0; z-index: 9999; background: var(--gd-color-overlay-strong); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.35s ease; }
.redirect-overlay.active { opacity: 1; pointer-events: auto; }
.redirect-ring { width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(var(--gd-color-accent-rgb), 0.15); border-top-color: var(--gd-color-secondary); animation: redirectSpin 0.8s linear infinite; margin-bottom: 32px; }
@keyframes redirectSpin { to { transform: rotate(360deg); } }
.redirect-text { font-size: 18px; font-weight: 600; color: var(--gd-color-on-surface); margin-bottom: 12px; }
.redirect-countdown { font-size: 48px; font-weight: 800; background: linear-gradient(135deg, #c4b5fd 0%, #e9d5ff 30%, #a78bfa 60%, #8b5cf6 100%); background-size: 200% auto; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradientShift 3s ease infinite; }
@keyframes gradientShift { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }
.redirect-cancel { margin-top: 28px; padding: 10px 28px; border-radius: 100px; border: 1px solid rgba(var(--gd-color-white-rgb), 0.12); background: rgba(var(--gd-color-white-rgb), 0.04); color: var(--gd-color-on-surface-subtle); font-size: var(--gd-type-label-large-size); cursor: pointer; transition: all 0.25s ease; }
.redirect-cancel:hover { color: var(--gd-color-on-surface); background: rgba(var(--gd-color-white-rgb), 0.08); border-color: rgba(var(--gd-color-white-rgb), 0.2); }
body.gd-loading .gd-button--back, body.gd-loading .gd-detail__header { display: none; }
#detailSkeleton { display: flex; flex-direction: column; gap: 16px; width: 100%; animation: fadeInUp 0.4s ease both; }
#detailSkeleton .gd-skeleton__header { display: flex; flex-direction: column; margin-bottom: 22px; }
#detailSkeleton .gd-skeleton__title { width: 46%; height: 54px; border-radius: 12px; margin-bottom: 15px; }
#detailSkeleton .gd-skeleton__desc { width: 68%; height: 25px; border-radius: 7px; margin-bottom: 15px; }
#detailSkeleton .gd-skeleton__tags { display: flex; flex-wrap: wrap; gap: 8px; }
#detailSkeleton .gd-skeleton__tag { width: 74px; height: 29px; border-radius: 9999px; }
#detailSkeleton .gd-skeleton__banner { padding: 20px 22px; border-radius: var(--gd-shape-corner-medium); background: var(--gd-glass-bg); border: 1px solid var(--gd-glass-border); position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
#detailSkeleton .gd-skeleton__banner-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
#detailSkeleton .gd-skeleton__banner-icon { width: 18px; height: 18px; border-radius: 6px; flex-shrink: 0; }
#detailSkeleton .gd-skeleton__banner-label { width: 90px; height: 18px; border-radius: 8px; }
#detailSkeleton .gd-skeleton__banner-item { height: 45px; border-radius: 12px; }
#detailSkeleton .gd-skeleton__banner .gd-skeleton__card-line { display: none; }
#detailSkeleton .gd-skeleton__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; align-items: stretch; }
#detailSkeleton .gd-skeleton__card { display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: var(--gd-shape-corner-medium); background: var(--gd-glass-bg); border: 1px solid var(--gd-glass-border); box-sizing: border-box; }
#detailSkeleton .gd-skeleton__card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
#detailSkeleton .gd-skeleton__card-icon { width: 18px; height: 18px; border-radius: 6px; flex-shrink: 0; color: rgba(var(--gd-color-white-rgb), 0.18); }
#detailSkeleton .gd-skeleton__card-size { width: 90px; height: 18px; border-radius: 8px; }
#detailSkeleton .gd-skeleton__card-line { width: 100%; height: 45px; border-radius: 12px; }
#detailSkeleton .gd-skeleton__card-line--sm { width: 70%; height: 45px; }
#detailSkeleton .gd-skeleton__block { position: relative; overflow: hidden; border-radius: var(--gd-shape-corner-extra-small); background: rgba(var(--gd-color-white-rgb), 0.06); }
@keyframes gd-skeleton-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
#detailSkeleton .gd-skeleton__block::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(var(--gd-color-white-rgb), 0.08), transparent); animation: gd-skeleton-shimmer 1.6s infinite; }
#detailContent[hidden] { display: none; }
@media (max-width: 768px) { #detailSkeleton .gd-skeleton__grid { grid-template-columns: 1fr; } }
.gd-footer { margin-top: 28px; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.gd-detail__header { animation: fadeInUp 0.4s ease 0.05s both; }
.tags-row { animation: fadeInUp 0.4s ease 0.1s both; }
.gd-highlights { animation: fadeInUp 0.4s ease 0.15s both; }
.gd-section-card-grid .gd-section-card:nth-child(1) { animation: fadeInUp 0.4s ease 0.2s both; }
.gd-section-card-grid .gd-section-card:nth-child(2) { animation: fadeInUp 0.4s ease 0.25s both; }
.gd-section-card-grid .gd-section-card:nth-child(3) { animation: fadeInUp 0.4s ease 0.3s both; }
.gd-footer { animation: fadeInUp 0.4s ease 0.35s both; }
@media (prefers-reduced-motion: reduce) { .gd-detail__header, .tags-row, .gd-highlights, .gd-section-card-grid .gd-section-card, .gd-footer { animation: none; } }
@media (max-width: 768px) { body.gd-detail { padding: 58px 16px 40px; font-size: var(--gd-type-body-large-size); line-height: 1.7; } .gd-detail__container { display: block; } .gd-detail__header { text-align: center; margin-bottom: 18px; } .gd-detail__header-top { flex-direction: column; align-items: center; gap: 8px; } .gd-detail__header-top .gd-brand__title { font-size: 32px; } .gd-detail__intro { font-size: var(--gd-type-body-large-size); text-align: center; max-width: none; line-height: 1.65; } .tags-row { justify-content: center; margin-top: 12px; gap: 8px; } .tag { font-size: var(--gd-type-label-large-size); padding: 6px 12px; } .gd-footer { margin-top: 18px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
</style>
</head>
<body class="gd-detail gd-loading">
<noscript><style>#detailSkeleton{display:none!important}#detailContent[hidden]{display:block!important}body.gd-loading .gd-button--back,body.gd-loading .gd-detail__header{display:block!important}</style></noscript>
<div class="gd-groundback gd-groundback--blue" aria-hidden="true"></div>
<a class="gd-button gd-button--back gd-back-fab" href="/nav/" aria-label="返回主站">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  返回主站
</a>
<div class="gd-detail__container">
<header class="gd-detail__header">
<div class="gd-detail__header-top">
<h1 class="gd-brand__title gd-brand__title--shift gd-brand__title--demo">${escapeHtml(title)}</h1>
</div>
${shortDesc ? \`<p class="gd-detail__intro">${escapeHtml(shortDesc)}</p>\` : ""}
${tags.length ? renderTags(tags) : ""}
</header>
<div id="detailSkeleton" class="gd-skeleton gd-skeleton--detail" aria-hidden="true">
<div class="gd-skeleton__header">
<div class="gd-skeleton__block gd-skeleton__title"></div>
<div class="gd-skeleton__block gd-skeleton__desc"></div>
<div class="gd-skeleton__tags">
<div class="gd-skeleton__block gd-skeleton__tag"></div>
<div class="gd-skeleton__block gd-skeleton__tag"></div>
<div class="gd-skeleton__block gd-skeleton__tag"></div>
</div>
</div>
<div class="gd-skeleton__banner">
<div class="gd-skeleton__banner-head">
<div class="gd-skeleton__block gd-skeleton__banner-icon"></div>
<div class="gd-skeleton__block gd-skeleton__banner-label"></div>
</div>
<div class="gd-skeleton__block gd-skeleton__banner-item"></div>
<div class="gd-skeleton__block gd-skeleton__banner-item"></div>
<div class="gd-skeleton__block gd-skeleton__banner-item"></div>
</div>
<div class="gd-skeleton__grid">
<div class="gd-skeleton__card"><div class="gd-skeleton__card-head"><div class="gd-skeleton__block gd-skeleton__card-icon"></div><div class="gd-skeleton__block gd-skeleton__card-size"></div></div><div class="gd-skeleton__block gd-skeleton__card-line"></div><div class="gd-skeleton__block gd-skeleton__card-line gd-skeleton__card-line--sm"></div></div>
<div class="gd-skeleton__card"><div class="gd-skeleton__card-head"><div class="gd-skeleton__block gd-skeleton__card-icon"></div><div class="gd-skeleton__block gd-skeleton__card-size"></div></div><div class="gd-skeleton__block gd-skeleton__card-line"></div><div class="gd-skeleton__block gd-skeleton__card-line gd-skeleton__card-line--sm"></div></div>
<div class="gd-skeleton__card"><div class="gd-skeleton__card-head"><div class="gd-skeleton__block gd-skeleton__card-icon"></div><div class="gd-skeleton__block gd-skeleton__card-size"></div></div><div class="gd-skeleton__block gd-skeleton__card-line"></div><div class="gd-skeleton__block gd-skeleton__card-line gd-skeleton__card-line--sm"></div></div>
</div>
</div>
<div id="detailContent" hidden>
${branches.length > 0 ? renderHighlights(branches[0]) : ""}
<div class="gd-section-card-grid gd-detail__grid">
${branches.slice(1).map(b => renderSection(b)).join("\n")}
</div>
</div>
<footer class="gd-footer">
<nav class="gd-footer__nav" aria-label="页脚链接">
<a href="/sitemap.xml">sitemap.xml</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="/robots.txt">robots.txt</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="mailto:contact@example.com">联系站长</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="/nav/donate/">赞助本站</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="/nav/friend/">申请友链</a><span class="gd-footer__sep" aria-hidden="true">|</span><a href="/status/">站点状态</a>
</nav>
<p class="gd-footer__copy">&copy; 2026 GALNAVI &middot; 愿每一次探索都有新的收获</p>
</footer>
</div>
<div id="redirectOverlay" class="redirect-overlay" role="dialog" aria-modal="true" aria-labelledby="redirectText" aria-hidden="true">
<div class="redirect-ring"></div>
<div class="redirect-text" id="redirectText">即将跳转</div>
<div id="redirectCountdown" class="redirect-countdown" aria-live="polite">3</div>
<button id="redirectCancel" class="redirect-cancel">取消跳转</button>
</div>
<script>
/* 首访检测 */
(function(){
var KEY = "site-verified";
function getV(){
var c=false,s=false;
try{ c=document.cookie.split("; ").some(function(x){return x.indexOf(KEY+"=1")===0;}); }catch(e){}
try{ s=localStorage.getItem(KEY)==="1"; }catch(e){}
return c||s;
}
function setV(){
try{ document.cookie=KEY+"=1; max-age=31536000; path=/; SameSite=Lax"; }catch(e){}
try{ localStorage.setItem(KEY,"1"); }catch(e){}
}
if(!getV()){
setV();
window.location.replace("/");
}
})();
function isSafeHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    var u = new URL(url, window.location.origin);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}
document.addEventListener('DOMContentLoaded', function() {
  var redirectTimerId = null;
  var redirectCancelHandler = null;

  (function() {
    var sk = document.getElementById('detailSkeleton');
    var content = document.getElementById('detailContent');
    if (sk && content) {
      setTimeout(function() {
        sk.remove();
        content.removeAttribute('hidden');
        document.body.classList.remove('gd-loading');
      }, 800);
    } else {
      document.body.classList.remove('gd-loading');
    }
  })();

  document.addEventListener('click', function(e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href) return;
    var lower = href.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (href.startsWith('/nav/')) return;
    if (href.startsWith('#')) return;
    if (!isSafeHttpUrl(href)) return;
    try { if (new URL(href).hostname === window.location.hostname) return; } catch (_) { return; }
    e.preventDefault();
    e.stopPropagation();
    startRedirect(href);
  });

  function startRedirect(targetUrl) {
    var overlay = document.getElementById('redirectOverlay');
    var countdownEl = document.getElementById('redirectCountdown');
    var cancelBtn = document.getElementById('redirectCancel');
    if (!overlay || !countdownEl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (redirectTimerId) {
      clearInterval(redirectTimerId);
      redirectTimerId = null;
    }
    if (redirectCancelHandler && cancelBtn) {
      cancelBtn.removeEventListener('click', redirectCancelHandler);
      redirectCancelHandler = null;
    }

    var seconds = 3;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    countdownEl.textContent = seconds;

    function tick() {
      seconds--;
      if (seconds <= 0) {
        clearInterval(redirectTimerId);
        redirectTimerId = null;
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        if (redirectCancelHandler && cancelBtn) {
          cancelBtn.removeEventListener('click', redirectCancelHandler);
          redirectCancelHandler = null;
        }
        return;
      }
      countdownEl.textContent = seconds;
    }

    redirectTimerId = setInterval(tick, 1000);

    redirectCancelHandler = function cancel() {
      clearInterval(redirectTimerId);
      redirectTimerId = null;
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      if (cancelBtn) cancelBtn.removeEventListener('click', redirectCancelHandler);
      redirectCancelHandler = null;
    };

    if (cancelBtn) cancelBtn.addEventListener('click', redirectCancelHandler);
  }
});
<\/script>
</body></html>`;
}
const TAG_COLORS = ["green", "orange", "sky"];
function renderTags(tags) {
const items = tags
.map(
(t, i) =>
\`<a class="tag \${TAG_COLORS[i % TAG_COLORS.length]}" href="/nav/?q=\${encodeURIComponent(t)}">\${escapeHtml(t)}</a>\`
)
.join("\n");
return \`<div class="tags-row">\${items}</div>\`;
}
function renderHighlights(branch) {
const items = branch.leaves
.map(l => \`<div class="gd-highlights__item"><span class="gd-highlights__dot" aria-hidden="true"></span><span class="gd-highlights__text">\${escapeHtml(formatLeafText(l))}</span></div>\`)
.join("\n");
return \`
<div class="gd-highlights"><div class="gd-highlights__label"><span class="gd-highlights__icon" aria-hidden="true">\${SECTION_ICONS["亮点"]}</span><span>\${escapeHtml(branch.heading)}</span></div><div class="gd-highlights__list">
\${items}
</div></div>\`;
}
const SECTION_ICONS = {
"官网": \`<svg width="18" height="18" viewBox="-1 0 19 19" fill="currentColor" stroke="currentColor" stroke-width="0.6" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M16.417 9.57a7.917 7.917 0 1 1-8.144-7.908 1.758 1.758 0 0 1 .451 0 7.913 7.913 0 0 1 7.693 7.907zM5.85 15.838q.254.107.515.193a11.772 11.772 0 0 1-1.572-5.92h-3.08a6.816 6.816 0 0 0 4.137 5.727zM2.226 6.922a6.727 6.727 0 0 0-.511 2.082h3.078a11.83 11.83 0 0 1 1.55-5.89q-.249.083-.493.186a6.834 6.834 0 0 0-3.624 3.622zm8.87 2.082a14.405 14.405 0 0 0-.261-2.31 9.847 9.847 0 0 0-.713-2.26c-.447-.952-1.009-1.573-1.497-1.667a8.468 8.468 0 0 0-.253 0c-.488.094-1.05.715-1.497 1.668a9.847 9.847 0 0 0-.712 2.26 14.404 14.404 0 0 0-.261 2.309zm-.974 5.676a9.844 9.844 0 0 0 .713-2.26 14.413 14.413 0 0 0 .26-2.309H5.903a14.412 14.412 0 0 0 .261 2.31 9.844 9.844 0 0 0 .712 2.259c.487 1.036 1.109 1.68 1.624 1.68s1.137-.644 1.623-1.68zm4.652-2.462a6.737 6.737 0 0 0 .513-2.107h-3.082a11.77 11.77 0 0 1-1.572 5.922q.261-.086.517-.194a6.834 6.834 0 0 0 3.624-3.621zM11.15 3.3a6.82 6.82 0 0 0-.496-.187 11.828 11.828 0 0 1 1.55 5.89h3.081A6.815 6.815 0 0 0 11.15 3.3z"/></svg>\`,
"论坛": \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\`,
"社群": \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>\`,
"教程": \`<svg width="18" height="18" viewBox="0 0 31.725 31.725" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M30.611,18.54v-3.817c0.708-0.605,1.113-1.479,1.113-2.415c0-1.323-0.832-2.521-2.071-2.982L18.212,5.068c-1.55-0.577-3.276-0.574-4.822,0.007L2.063,9.328C0.83,9.791,0,10.988,0,12.307c0,1.317,0.83,2.514,2.063,2.976L6.3,16.875l0.009,5.655c0.197,2.99,4.928,4.557,9.499,4.557s9.302-1.564,9.5-4.571l0.008-5.612l3.679-1.371v3.009c-0.545,0.395-0.892,1.165-0.892,2.015c0,1.123,0,2.284,1.699,2.284c1.698,0,1.698-1.161,1.698-2.284C31.503,19.706,31.157,18.935,30.611,18.54z M8.778,17.806l4.612,1.732c1.545,0.582,3.274,0.584,4.825,0.009l4.627-1.725v4.521c0,0.773-2.738,2.257-7.032,2.257c-4.292,0-7.031-1.481-7.031-2.257L8.778,17.806L8.778,17.806z M14.625,16.98L5.168,13.43c-0.085-0.032-0.19-0.068-0.308-0.107c-0.542-0.181-1.552-0.518-1.552-1.014c0-0.506,0.964-0.822,1.539-1.012c0.123-0.04,0.232-0.077,0.321-0.109l9.455-3.553c0.381-0.144,0.78-0.215,1.185-0.215c0.404,0,0.799,0.07,1.177,0.211l9.551,3.556c0.077,0.029,0.172,0.062,0.278,0.096c0.52,0.179,1.603,0.544,1.603,1.026c0,0.194-0.317,0.543-1.882,1.122l-9.549,3.554C16.229,17.267,15.384,17.265,14.625,16.98z"/></svg>\`,
"作品": \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h5"/></svg>\`,
"亮点": \`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>\`,
"扩展": \`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.3636 5.25C12.2716 5.25 11.3864 6.13525 11.3864 7.22727V7.97727L7.97727 7.97727L7.97727 11.3864H7.22727C6.13526 11.3864 5.25 12.2716 5.25 13.3636C5.25 14.4557 6.13526 15.3409 7.22727 15.3409H7.97727L7.97727 18.75L18.75 18.75V16.7598C17.1901 16.4169 16.0227 15.0266 16.0227 13.3636C16.0227 11.7007 17.1901 10.3104 18.75 9.96745V7.97727L15.3409 7.97727V7.22727C15.3409 6.13526 14.4557 5.25 13.3636 5.25ZM9.96745 6.47727C10.3104 4.91733 11.7007 3.75 13.3636 3.75C15.0266 3.75 16.4169 4.91733 16.7598 6.47727L20.25 6.47727V11.3864L19.5 11.3864C18.408 11.3864 17.5227 12.2716 17.5227 13.3636C17.5227 14.4557 18.408 15.3409 19.5 15.3409H20.25V20.25L6.47727 20.25L6.47727 16.7598C4.91733 16.4169 3.75 15.0266 3.75 13.3636C3.75 11.7007 4.91733 10.3104 6.47727 9.96745L6.47727 6.47727L9.96745 6.47727Z"/></svg>\`,
};
function renderSection(branch) {
const icon = SECTION_ICONS[branch.heading] || SECTION_ICONS["官网"];
const links = branch.leaves
.map(l => {
if (l.url) {
const isMailto = /^mailto:/i.test(l.url);
let display = "";
if (isMailto) {
display = l.url.replace(/^mailto:/i, "") || l.linkText || "";
} else {
try {
display = new URL(l.url).hostname;
} catch (e) {
return \`<div class="gd-section-card__entry"><span class="gd-section-card__label">\${escapeHtml(l.label || l.linkText || l.url)}</span></div>\`;
}
}
const targetAttrs = isMailto ? "" : \` target="_blank" rel="noopener noreferrer"\`;
return \`<a class="gd-section-card__link" href="\${escapeAttr(l.url)}"\${targetAttrs}><span class="gd-section-card__label">\${escapeHtml(l.label || l.linkText)}</span><span class="gd-section-card__url">\${escapeHtml(display)}</span></a>\`;
}
return \`<div class="gd-section-card__entry"><span class="gd-section-card__label">\${escapeHtml(formatLeafText(l))}</span></div>\`;
})
.join("\n");
return \`
<div class="gd-section-card"><div class="gd-section-card__header"><span class="gd-section-card__icon" aria-hidden="true">\${icon}</span><span class="gd-section-card__title">\${escapeHtml(branch.heading)}</span></div><div class="gd-section-card__links">
\${links}
</div></div>\`;
}
function escapeHtml(str) {
return (str || "")
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;");
}
function escapeAttr(str) {
return (str || "")
.replace(/&/g, "&amp;")
.replace(/"/g, "&quot;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;");
}
