/**
 * 数据访问层 — KV
 * Cloudflare KV 读写封装
 * 
 * 实际 KV 命名空间：
 * - CAROUSEL_KV: carousel_images (轮播图)
 * - FEATURED_KV: featured_items (推荐项)
 * - DONATE_KV: donors (捐款名单)
 * - STATUS_KV: api_cache, state (状态监控)
 * - NOTICE_KV: notice (公告)
 */

/** 读取轮播图 URL 列表（CAROUSEL_KV key: carousel_images） */
export async function fetchHeroImages(env) {
  try {
    if (!env.CAROUSEL_KV) return [];
    const raw = await env.CAROUSEL_KV.get("carousel_images");
    if (!raw) return [];
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : (typeof p === "string" && p ? [p] : []);
    } catch (e) {
      const t = raw.trim();
      return t.includes(",") ? t.split(",").map(s => s.trim()).filter(Boolean) : (t ? [t] : []);
    }
  } catch (e) {
    return [];
  }
}

/** 读取推荐项 key 列表（FEATURED_KV key: featured_items） */
export async function fetchFeaturedKeys(env) {
  try {
    if (!env.FEATURED_KV) return [];
    const raw = await env.FEATURED_KV.get("featured_items");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      const t = raw.trim();
      return t ? t.split(",").map(k => k.trim()).filter(Boolean) : [];
    }
  } catch (e) {
    return [];
  }
}

/** 读取捐款名单（DONATE_KV key: donors） */
export async function fetchDonors(env) {
  try {
    if (!env.DONATE_KV) return [];
    const raw = await env.DONATE_KV.get("donors");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  } catch (e) {
    return [];
  }
}

/** 读取站点公告（NOTICE_KV key: notice，纯文本） */
export async function fetchNotice(env) {
  try {
    if (!env.NOTICE_KV) return "";
    return (await env.NOTICE_KV.get("notice")) || "";
  } catch (e) {
    return "";
  }
}

/** 读取状态监控数据（STATUS_KV key: state，JSON） */
export async function fetchStatusState(env) {
  try {
    if (!env.STATUS_KV) return null;
    return await env.STATUS_KV.get("state", "json");
  } catch (e) {
    return null;
  }
}

/** 保存状态监控数据（STATUS_KV key: state） */
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
  } catch (e) {}
}

/** 读取 CF API 缓存（STATUS_KV key: api_cache，JSON） */
export async function fetchApiCache(env) {
  try {
    if (!env.STATUS_KV) return null;
    return await env.STATUS_KV.get("api_cache", "json");
  } catch (e) {
    return null;
  }
}

/** 保存 CF API 缓存（STATUS_KV key: api_cache） */
export async function saveApiCache(env, data) {
  try {
    if (env.STATUS_KV) {
      await env.STATUS_KV.put("api_cache", JSON.stringify(data));
    }
  } catch (e) {}
}
