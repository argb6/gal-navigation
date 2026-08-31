/**
 * API 接口层 — 友链提交
 * 对照 worker/new/friend.js
 */

import { insertFriendLink, fetchFriendLinks as fetchFriendRows } from "../database/d1.js";

export async function handleFriendSubmit(request, env) {
  try {
    const form = await request.formData();
    const name = (form.get("name") || "").trim();
    const url = (form.get("url") || "").trim();
    const description = (form.get("description") || "").trim();
    const catalog = (form.get("catalog") || "").trim();

    if (!name || !url) {
      return jsonResponse({ error: "名称和网址为必填项" }, 400);
    }

    if (!env.DB) {
      return jsonResponse({ error: "数据库不可用" }, 500);
    }

    await insertFriendLink(env, { name, url, description, catalog });
    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: e.message || "提交失败，请稍后重试" }, 500);
  }
}

export async function fetchFriendLinks(env) {
  return fetchFriendRows(env);
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
