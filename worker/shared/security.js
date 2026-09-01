/**
 * HTML/属性转义与 NSFW cookie。沙盒 import；现网页把函数抄进文件，不要放到浏览器脚本里。
 */

import { NAVI_IS_ACTIVE, NAVI_IS_NSFW, NSFW_COOKIE_MAX_AGE } from "./constants.js";

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
    const u = new URL(url, "https://galnavi.top");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** 默认安全头基线；页面只可补充或收紧，不可放宽 */
export const SECURITY_HEADERS_BASE = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export function mergeSecurityHeaders(pageHeaders = {}) {
  return { ...SECURITY_HEADERS_BASE, ...pageHeaders };
}

/** websearch / detail 共用：默认 1，打开为 2，24h，每次进入刷新 */
export const NSFW_COOKIE = "gd-nsfw";

export function readNsfwFlag(request) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(/(?:^|;\s*)gd-nsfw=(\d+)/);
  return m && Number(m[1]) === NAVI_IS_NSFW ? NAVI_IS_NSFW : NAVI_IS_ACTIVE;
}

export function nsfwSetCookie(flag) {
  const v = flag === NAVI_IS_NSFW ? NAVI_IS_NSFW : NAVI_IS_ACTIVE;
  return `${NSFW_COOKIE}=${v}; Path=/; Max-Age=${NSFW_COOKIE_MAX_AGE}; SameSite=Lax`;
}
