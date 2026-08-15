/**
 * 业务逻辑层 — 缓存服务
 * 内存缓存 + KV 缓存策略
 */

/** 创建简单的内存缓存（带 TTL） */
export function createMemoryCache(ttlMs = 300000) {
  let cache = null;
  let timestamp = 0;

  return {
    get() {
      if (cache && Date.now() - timestamp < ttlMs) return cache;
      return null;
    },
    set(value) {
      cache = value;
      timestamp = Date.now();
    },
    clear() {
      cache = null;
      timestamp = 0;
    },
  };
}

/** 北京时间当前日期与小时 */
export function beijingNow() {
  const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;
  const d = new Date(Date.now() + BEIJING_OFFSET_MS);
  return {
    date: d.toISOString().slice(0, 10),
    hour: d.getUTCHours(),
  };
}

/** CF API 抓取时段判断（每天 0/8/16 点） */
export function currentSlot(hour) {
  const slots = [0, 8, 16];
  let slot = slots[0];
  for (const s of slots) if (hour >= s) slot = s;
  return slot;
}

/** 判断是否需要刷新 API 数据 */
export function needsApiRefresh(cache) {
  if (!cache) return true;
  const now = beijingNow();
  return cache.date !== now.date || (cache.slot || -1) < currentSlot(now.hour);
}
