/**
 * 数据访问层 — D1
 * D1 数据库查询封装
 * 
 * 实际 D1 表：
 * - DB (nav): sites, sites (友链)
 * - group1: resources (殿堂)
 */

import { DB_CATEGORY_MAP } from "../../shared/constants.js";

/** 查询所有导航站点（主站列表页） */
export async function fetchNavData(env) {
  try {
    if (!env.DB) return [];
    const { results } = await env.DB.prepare(
      "SELECT item_key, title, category, tags, short_desc, url, icon_path, updated_at FROM sites ORDER BY category ASC"
    ).all();
    return results.map(row => ({
      id: row.item_key,
      cat: DB_CATEGORY_MAP[row.category] || row.category,
      name: row.title,
      desc: row.short_desc || "",
      tags: row.tags ? row.tags.split(",") : [],
      url: row.url || "",
      icon: row.icon_path || "",
      updatedAt: row.updated_at || "",
    }));
  } catch (e) {
    return [];
  }
}

/** 按 key 查询单个站点详情（详情页） */
export async function fetchSiteByKey(env, itemKey) {
  try {
    if (!env.DB || !itemKey) return null;
    const { results } = await env.DB.prepare(
      "SELECT title, short_desc, tags, md_content, category FROM sites WHERE item_key = ?"
    ).bind(itemKey).all();
    if (!results.length) return null;
    const row = results[0];
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

/** 查询友链列表（友链页） */
export async function fetchFriendLinks(env) {
  try {
    if (!env.DB) return [];
    const { results } = await env.DB.prepare(
      "SELECT id, name, url, des, favicon_url, catalog FROM sites"
    ).all();
    return results || [];
  } catch (e) {
    return [];
  }
}

/** 提交友链申请（POST） */
export async function insertFriendLink(env, { name, url, description, catalog }) {
  try {
    if (!env.DB) throw new Error("DB not available");
    await env.DB.prepare(
      "INSERT INTO sites (name, url, des, favicon_url, catalog, update_tm) VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).bind(name, url, description, "", catalog).run();
    return true;
  } catch (e) {
    throw e;
  }
}

/** 查询殿堂分组数据（group1 数据库） */
export async function fetchPalaceGroups(env) {
  try {
    if (!env.GROUP_DB) return [];
    const { results } = await env.GROUP_DB.prepare(
      "SELECT * FROM resources ORDER BY category, id"
    ).all();
    return results || [];
  } catch (e) {
    return [];
  }
}

/** 查询所有站点 URL（状态页健康检测用） */
export async function fetchAllSiteUrls(env) {
  try {
    if (!env.DB) return [];
    const { results } = await env.DB.prepare(
      "SELECT item_key, title, url FROM sites WHERE url IS NOT NULL AND url != '' LIMIT 40"
    ).all();
    return results.map(r => ({ name: r.title || r.item_key, url: r.url }));
  } catch (e) {
    return [];
  }
}
