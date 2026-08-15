/**
 * API 接口层 — 站点详情
 * GET /nav/detail/<item_key> 或 ?item_key=<key>
 * 
 * 实际来源：worker/detail.js
 */

import { DB_CATEGORY_MAP } from "../../shared/constants.js";

/** 允许的分类键（DB 原始值 + 前端值） */
const ALLOWED_CATEGORIES = [
  ...Object.keys(DB_CATEGORY_MAP),
  ...Object.values(DB_CATEGORY_MAP),
];

/**
 * 查询单个站点详情
 * @param {Object} env - env.DB (D1 binding)
 * @param {string} itemKey - 站点 key
 * @returns {Object|null} 站点数据或 null
 */
export async function fetchSiteDetail(env, itemKey) {
  try {
    if (!env.DB || !itemKey) return null;
    const { results } = await env.DB.prepare(
      "SELECT title, short_desc, tags, md_content, category FROM sites WHERE item_key = ?"
    ).bind(itemKey).all();

    if (!results.length) return null;

    const row = results[0];

    // 分类校验
    if (row.category && !ALLOWED_CATEGORIES.includes(row.category)) {
      return null;
    }

    return {
      key: itemKey,
      title: row.title || "",
      desc: row.short_desc || "",
      tags: row.tags ? row.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      content: row.md_content || "",
      category: row.category || "",
      cat: DB_CATEGORY_MAP[row.category] || row.category,
    };
  } catch (e) {
    return null;
  }
}

/**
 * 从 URL 提取 item_key
 * 支持：?item_key=xxx、?=xxx、/nav/detail/xxx
 */
export function extractItemKey(url) {
  const u = new URL(url);

  // 查询参数
  const qKey = u.searchParams.get("item_key");
  if (qKey) return qKey;

  // 路径段
  const parts = u.pathname.split("/").filter(Boolean);
  const detailIdx = parts.indexOf("detail");
  if (detailIdx >= 0 && parts[detailIdx + 1]) {
    return parts[detailIdx + 1];
  }

  // 兜底：第一个查询参数值
  for (const [, value] of u.searchParams) {
    if (value) return value;
  }

  return "";
}
