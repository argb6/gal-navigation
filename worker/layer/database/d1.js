/**
 * 数据访问层 — D1
 * 对照 worker/*.js：主站 navi_sites，友链 sites，殿堂 env.group1.resources
 */

import { DB_CATEGORY_MAP, NAVI_IS_NSFW } from "../../shared/constants.js";

/** 查询所有导航站点（主站列表页，含 NSFW 标记） */
export async function fetchNavData(env) {
  try {
    if (!env.DB) return [];
    const { results } = await env.DB.prepare(
      "SELECT item_key, title, category, tags, short_desc, url, icon_path, updated_at, is_active FROM navi_sites WHERE is_active IN (1, 2) ORDER BY category ASC"
    ).all();
    return results.map((row) => ({
      id: row.item_key,
      cat: DB_CATEGORY_MAP[row.category] || row.category,
      name: row.title,
      desc: row.short_desc || "",
      tags: row.tags ? row.tags.split(",") : [],
      url: row.url || "",
      icon: row.icon_path || "",
      updatedAt: row.updated_at || "",
      nsfw: Number(row.is_active) === NAVI_IS_NSFW,
    }));
  } catch {
    return [];
  }
}

/** 按 key 查询单个站点详情（详情页） */
export async function fetchSiteByKey(env, itemKey) {
  try {
    if (!env.DB || !itemKey) return null;
    const { results } = await env.DB.prepare(
      "SELECT title, short_desc, tags, md_content, category, is_active FROM navi_sites WHERE item_key = ?"
    ).bind(itemKey).all();
    if (!results.length) return null;
    const row = results[0];
    return {
      key: itemKey,
      title: row.title || "",
      desc: row.short_desc || "",
      tags: row.tags ? row.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      content: row.md_content || "",
      category: row.category || "",
      cat: DB_CATEGORY_MAP[row.category] || row.category,
      is_active: Number(row.is_active),
    };
  } catch {
    return null;
  }
}

/** 查询友链列表（friend.js 实际表名 sites） */
export async function fetchFriendLinks(env) {
  try {
    if (!env.DB) return [];
    const { results } = await env.DB.prepare(
      "SELECT id, name, url, des, favicon_url, catalog FROM sites"
    ).all();
    return results || [];
  } catch {
    return [];
  }
}

/** 提交友链申请（POST） */
export async function insertFriendLink(env, { name, url, description, catalog }) {
  if (!env.DB) throw new Error("DB not available");
  await env.DB.prepare(
    "INSERT INTO sites (name, url, des, favicon_url, catalog, update_tm) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  ).bind(name, url, description || "", "", catalog || "其他").run();
  return true;
}

/** 查询殿堂分组数据（绑定名 group1） */
export async function fetchPalaceGroups(env) {
  try {
    if (!env.group1) return [];
    const { results } = await env.group1.prepare(
      "SELECT * FROM resources ORDER BY category, id"
    ).all();
    return results || [];
  } catch {
    return [];
  }
}

/** 查询所有站点 URL（状态页健康检测用） */
export async function fetchAllSiteUrls(env) {
  try {
    if (!env.DB) return [];
    const { results } = await env.DB.prepare(
      "SELECT item_key, title, url FROM navi_sites WHERE url IS NOT NULL AND url != '' AND is_active = 1 LIMIT 40"
    ).all();
    return (results || []).map((r) => ({ name: r.title || r.item_key, url: r.url }));
  } catch {
    return [];
  }
}
