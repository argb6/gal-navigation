/**
 * 安全层 — 访问验证
 * 首访检测、cookie 校验
 */

import { VERIFIED_KEY, VERIFIED_COOKIE } from "../../shared/config.js";

/** 检查请求是否已通过首访验证 */
export function isVerified(request) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.includes(`${VERIFIED_KEY}=1`);
}

/** 未验证时重定向到首页 */
export function requireVerification(request, homeUrl) {
  if (!isVerified(request)) {
    return Response.redirect(homeUrl, 302);
  }
  return null;
}

/** 设置验证 cookie 的响应头 */
export function setVerifiedHeaders(response) {
  response.headers.append("Set-Cookie", VERIFIED_COOKIE);
  return response;
}
