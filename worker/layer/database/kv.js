/**
 * 数据访问层 — KV
 * 对照 worker/new 与 AGENTS.md
 *
 * - HERO_KV: hero_images
 * - FEATURED_KV: featured_items
 * - DONATE_KV: donors
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
