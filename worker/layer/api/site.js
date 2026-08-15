/**
 * API 接口层 — 站点 API
 * /nav/api/site 端点
 */

import { fetchSiteByKey } from "../database/d1.js";
import { escapeHtml } from "../security/escape.js";

/** 处理站点详情 API 请求 */
export async function handleSiteApi(request, env) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") || "";

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing key parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const site = await fetchSiteByKey(env, key);
  if (!site) {
    return new Response(JSON.stringify({ error: "Site not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(site), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}
