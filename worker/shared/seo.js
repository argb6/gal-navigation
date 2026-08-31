/**
 * SEO：meta / OG / JSON-LD 拼装（Worker 侧）。
 * 页面传入字段，避免各页手写一整段重复。
 */

import { escapeAttr, escapeHtml } from "./security.js";

export function renderBasicMeta({
  title,
  description,
  canonical,
  image,
  keywords,
} = {}) {
  const t = escapeHtml(title || "");
  const d = escapeAttr(description || "");
  const c = escapeAttr(canonical || "");
  const img = escapeAttr(image || "");
  const kw = escapeAttr(keywords || "");
  return [
    title ? `<title>${t}</title>` : "",
    description ? `<meta name="description" content="${d}">` : "",
    keywords ? `<meta name="keywords" content="${kw}">` : "",
    canonical ? `<link rel="canonical" href="${c}">` : "",
    title ? `<meta property="og:title" content="${escapeAttr(title)}">` : "",
    description ? `<meta property="og:description" content="${d}">` : "",
    canonical ? `<meta property="og:url" content="${c}">` : "",
    image ? `<meta property="og:image" content="${img}">` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
