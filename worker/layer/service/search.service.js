/**
 * 业务逻辑层 — 搜索服务
 * 站点搜索、过滤、分类
 */

import { CATEGORY_LABELS, ALLOWED_CATEGORIES } from "../../shared/constants.js";

/**
 * 搜索站点
 * @param {Array} sites - 站点列表
 * @param {string} query - 搜索关键词
 * @param {string} category - 分类过滤
 * @returns {Object} { results, counts }
 */
export function searchSites(sites, query = "", category = "") {
  let filtered = sites;

  // 分类过滤
  if (category && category !== "home" && ALLOWED_CATEGORIES.includes(category)) {
    filtered = filtered.filter(s => s.cat === category);
  }

  // 关键词搜索
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // 按分类计数
  const counts = {};
  for (const cat of ALLOWED_CATEGORIES) {
    counts[cat] = sites.filter(s => s.cat === cat).length;
  }
  counts.home = sites.length;

  return { results: filtered, counts };
}
