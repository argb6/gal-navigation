/**
 * 数据访问层 — KV
 * 对照 worker/new 与 AGENTS.md
 *
 * - HERO_KV: hero_images
 * - FEATURED_KV: featured_items
 * - DONATE_KV: donors
 * - STATUS_KV: state, api_cache
 * - NOTICE_KV: notice
 */

/** 读取轮播图 URL 列表 */
export async function fetchHeroImages(env) {
  try {
    if (!env.HERO_KV) return [];
    const raw = await env.HERO_KV.get("hero_images");
    if (!raw) return [];
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : (typeof p === "string" && p ? [p] : []);
    } catch {
      const t = raw.trim();
      return t.includes(",") ? t.split(",").map((s) => s.trim()).filter(Boolean) : (t ? [t] : []);
    }
  } catch {
    return [];
  }
}

/** 读取推荐项 key 列表 */
export async function fetchFeaturedKeys(env) {
  try {
    if (!env.FEATURED_KV) return [];
    const raw = await env.FEATURED_KV.get("featured_items");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      const t = raw.trim();
      return t ? t.split(",").map((k) => k.trim()).filter(Boolean) : [];
    }
  } catch {
    return [];
  }
}

/** 读取捐款名单 */
export async function fetchDonors(env) {
  try {
    if (!env.DONATE_KV) return [];
    const raw = await env.DONATE_KV.get("donors");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  } catch {
    return [];
  }
}

/** 读取站点公告（纯文本） */
export async function fetchNotice(env) {
  try {
    if (!env.NOTICE_KV) return "";
    return (await env.NOTICE_KV.get("notice")) || "";
  } catch {
    return "";
  }
}

/** 读取状态监控数据 */
export async function fetchStatusState(env) {
  try {
    if (!env.STATUS_KV) return null;
    return await env.STATUS_KV.get("state", "json");
  } catch {
    return null;
  }
}

/** 保存状态监控数据 */
export async function saveStatusState(env, state) {
  try {
    if (env.STATUS_KV) {
      await env.STATUS_KV.put("state", JSON.stringify({
        failCounts: state.failCounts || {},
        lastEventAt: state.lastEventAt || {},
        uptimeStart: state.uptimeStart || null,
        events: state.events || [],
      }));
    }
  } catch { /* KV 失败时忽略 */ }
}

/** 读取 CF API 缓存 */
export async function fetchApiCache(env) {
  try {
    if (!env.STATUS_KV) return null;
    return await env.STATUS_KV.get("api_cache", "json");
  } catch {
    return null;
  }
}

/** 保存 CF API 缓存 */
export async function saveApiCache(env, data) {
  try {
    if (env.STATUS_KV) {
      await env.STATUS_KV.put("api_cache", JSON.stringify(data));
    }
  } catch { /* KV 失败时忽略 */ }
}
