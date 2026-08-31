/**
 * API 接口层 — 站点详情
 * 对照 worker/new/detail.js
 */

import { ALLOWED_DB_CATEGORIES, DB_CATEGORY_MAP, NAVI_IS_ACTIVE, NAVI_IS_NSFW } from "../../shared/constants.js";
import { fetchSiteByKey } from "../database/d1.js";

const ALLOWED_CATEGORIES = new Set([
  ...ALLOWED_DB_CATEGORIES,
  ...Object.values(DB_CATEGORY_MAP),
]);

/**
 * 查询单个站点详情。NSFW 条目在开关未开时返回 null（页面当 404）。
 */
export async function fetchSiteDetail(env, itemKey, nsfwFlag = NAVI_IS_ACTIVE) {
  const row = await fetchSiteByKey(env, itemKey);
  if (!row) return null;
  if (row.is_active === 0) return null;
  if (row.is_active === NAVI_IS_NSFW && nsfwFlag !== NAVI_IS_NSFW) return null;
  const category = String(row.category || "").toLowerCase();
  if (category && !ALLOWED_CATEGORIES.has(category)) return null;
  return row;
}

/**
 * 从 URL 提取 item_key
 * 对照 detail.js：?item_key=、?=、路径最后一段
 */
export function extractItemKey(url) {
  const u = new URL(url);
  let itemKey = u.searchParams.get("item_key");
  if (!itemKey) itemKey = u.searchParams.get("");
  if (!itemKey) {
    const parts = u.pathname.replace(/\/+$/, "").split("/");
    const last = parts[parts.length - 1];
    if (last && last !== "detail" && last !== "nav") itemKey = last;
  }
  return itemKey || "";
}
