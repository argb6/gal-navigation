/**
 * 安全层 — Cookie 管理
 * 全站 Cookie / Storage key 定义
 */

/** 首访确认（年龄门）— cookie + localStorage 双通道，365 天 */
export const COOKIE_VERIFIED = "site-verified";

/** 年龄门专用 — cookie，365 天 */
export const COOKIE_AGE_VERIFIED = "site-age-verified";

/** 欢迎弹窗标记 — cookie，30 天 */
export const COOKIE_WELCOME_SEEN = "site-welcome-seen";

/** 滚动位置记忆 — sessionStorage，会话级 */
export const STORAGE_SCROLL = "site-scroll";

/** 默认有效期（秒） */
export const COOKIE_MAX_AGE = 31536000; // 365 天

/** 欢迎弹窗有效期（秒） */
export const WELCOME_MAX_AGE = 2592000; // 30 天

/**
 * 检查 cookie 是否存在
 * @param {string} cookieHeader - request.headers.get("Cookie")
 * @param {string} key - cookie key
 * @returns {boolean}
 */
export function hasCookie(cookieHeader, key) {
  if (!cookieHeader) return false;
  return cookieHeader.split("; ").some(x => x.indexOf(key + "=1") === 0);
}

/**
 * 生成 Set-Cookie 头值
 * @param {string} key - cookie key
 * @param {number} maxAge - 有效期（秒）
 * @returns {string}
 */
export function setCookieHeader(key, maxAge = COOKIE_MAX_AGE) {
  return `${key}=1; max-age=${maxAge}; path=/; SameSite=Lax`;
}
