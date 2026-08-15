/**
 * API 接口层 — 搜索 API
 * /nav/api/search 端点
 */

import { searchSites } from "../service/search.service.js";
import { fetchNavData } from "../database/d1.js";

/** 处理搜索 API 请求 */
export async function handleSearchApi(request, env) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const category = url.searchParams.get("cat") || "home";

  const sites = await fetchNavData(env);
  const { results, counts } = searchSites(sites, query, category);

  return new Response(JSON.stringify({ results, counts, query, category }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}
