/**
 * 业务逻辑层 — SEO 服务
 * meta / OG / JSON-LD 拼装
 */

import { escapeAttr, escapeHtml } from "../security/escape.js";

/** 构建基础 meta 标签 */
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

/** 构建 JSON-LD 结构化数据 */
export function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
