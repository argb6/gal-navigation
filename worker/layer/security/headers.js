/**
 * 安全层 — 安全头
 * 基线来自 shared/security.js；CSP 默认值对照 worker/new 页内副本
 */

import { SECURITY_HEADERS_BASE } from "../../shared/security.js";

export { SECURITY_HEADERS_BASE, mergeSecurityHeaders } from "../../shared/security.js";

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

/** 构建 CSP 字符串。页面只可收紧，不要把 fonts / insights 以外的源放进来 */
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
