/**
 * 工具函数 — 响应构建
 * 统一的 Response 构建工具
 */

/** 构建 JSON 响应 */
export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      ...headers,
    },
  });
}

/** 构建 HTML 响应 */
export function htmlResponse(html, status = 200, headers = {}) {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      ...headers,
    },
  });
}

/** 构建 301 重定向响应 */
export function redirectResponse(url, status = 301) {
  return Response.redirect(url, status);
}

/** 构建 404 响应 */
export function notFoundResponse(html) {
  return new Response(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
