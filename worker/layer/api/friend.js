/**
 * API 接口层 — 友链提交
 * POST /nav/friend/ 提交友链申请
 * 
 * 实际来源：worker/friend.js
 */

import { escapeHtml } from "../security/escape.js";

/**
 * 处理友链提交 POST 请求
 * @param {Request} request - FormData: { name, url, description, catalog }
 * @param {Object} env - env.DB (D1 binding)
 * @returns {Response} JSON { success: true } 或 { error: "..." }
 */
export async function handleFriendSubmit(request, env) {
  try {
    const form = await request.formData();
    const name = (form.get("name") || "").trim();
    const url = (form.get("url") || "").trim();
    const description = (form.get("description") || "").trim();
    const catalog = (form.get("catalog") || "").trim();

    if (!name || !url) {
      return jsonResponse({ error: "名称和链接为必填项" }, 400);
    }

    if (!env.DB) {
      return jsonResponse({ error: "数据库不可用" }, 500);
    }

    await env.DB.prepare(
      "INSERT INTO sites (name, url, des, favicon_url, catalog, update_tm) VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).bind(name, url, description, "", catalog).run();

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: "提交失败，请稍后重试" }, 500);
  }
}

/**
 * 查询友链列表
 * @param {Object} env - env.DB (D1 binding)
 * @returns {Array} 友链数组
 */
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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}
