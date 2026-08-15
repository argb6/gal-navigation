/**
 * 安全层 — 安全头
 * CSP 基线与安全头合并工具
 */

/** 默认安全头基线；页面只可补充或收紧，不可放宽 */
export const SECURITY_HEADERS_BASE = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/** 合并页面安全头与基线 */
export function mergeSecurityHeaders(pageHeaders = {}) {
  return { ...SECURITY_HEADERS_BASE, ...pageHeaders };
}

/** 构建完整安全头（含 Content-Type + Cache-Control + CSP） */
export function buildSecurityHeaders(cspDirectives = {}) {
  const csp = buildCSP(cspDirectives);
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, no-store",
    ...SECURITY_HEADERS_BASE,
    ...(csp ? { "Content-Security-Policy": csp } : {}),
  };
}

/** 构建 CSP 字符串 */
export function buildCSP(directives = {}) {
  const defaults = {
    "default-src": "'self'",
    "script-src": "'self' 'unsafe-inline'",
    "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src": "'self' data: https:",
    "connect-src": "'self'",
    "font-src": "'self' data: https://fonts.gstatic.com",
    "frame-ancestors": "'self'",
    "base-uri": "'self'",
    "form-action": "'self'",
  };
  const merged = { ...defaults, ...directives };
  return Object.entries(merged)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
}
