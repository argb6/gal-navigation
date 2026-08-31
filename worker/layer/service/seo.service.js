/**
 * 业务逻辑层 — SEO
 * 基础 meta 走 shared/seo.js
 */

export { renderBasicMeta } from "../../shared/seo.js";

/** JSON-LD 结构化数据 */
export function renderJsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
