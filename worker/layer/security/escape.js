/**
 * 安全层 — HTML/属性转义工具
 * 仅供 Worker import，不要放到浏览器
 */

export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttr(str) {
  return escapeHtml(str).replace(/`/g, "&#96;");
}

export function isSafeHttpUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url, "https://example.com");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
