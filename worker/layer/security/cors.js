/**
 * 安全层 — CORS
 * 跨域资源共享配置
 */

/** 默认 CORS 头 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/** 处理 OPTIONS 预检请求 */
export function handleCORS(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  return null;
}

/** 给响应添加 CORS 头 */
export function addCORSHeaders(response) {
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    newResponse.headers.set(key, value);
  }
  return newResponse;
}
