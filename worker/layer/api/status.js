/**
 * API 接口层 — 状态页数据
 * 对照 worker/new/status.js。Token 只读 env.CF_API_TOKEN，不硬编码。
 */

import { fetchApiCache, saveApiCache, fetchStatusState, saveStatusState, fetchNotice } from "../database/kv.js";
import { fetchAllSiteUrls } from "../database/d1.js";
import { checkAllSites, recordEvents, summarizeStatus, calcUptimeDays } from "../service/site.service.js";
import { beijingNow, currentSlot } from "../service/cache.service.js";
import { escapeHtml } from "../security/escape.js";

const ZONE_NAME = "galnavi.top";
const UPTIME_BASE = "2026-06-26";
const CF_API_BASE = "https://api.cloudflare.com/client/v4";
const CF_GRAPHQL = "https://api.cloudflare.com/client/v4/graphql";

const DEFAULT_SERVICES = [
  { name: "发布页", url: "https://galnavi.top/" },
  { name: "主站导航", url: "https://galnavi.top/nav/" },
  { name: "站点帮助", url: "https://galnavi.top/nav/help/" },
  { name: "关于本站", url: "https://galnavi.top/nav/about/" },
  { name: "圣器殿堂", url: "https://galnavi.top/nav/palace/" },
  { name: "友情链接", url: "https://galnavi.top/nav/friend/" },
  { name: "赞助本站", url: "https://galnavi.top/nav/donate/" },
  { name: "站点状态", url: "https://galnavi.top/status/" },
];

function cfToken(env) {
  return env && env.CF_API_TOKEN;
}

async function fetchZone(env) {
  const token = cfToken(env);
  if (!token) throw new Error("CF_API_TOKEN missing");
  const zoneName = env.ZONE_NAME || ZONE_NAME;
  const resp = await fetch(
    `${CF_API_BASE}/zones?name=${encodeURIComponent(zoneName)}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!resp.ok) throw new Error("CF API " + resp.status);
  const json = await resp.json();
  if (!json.success) throw new Error("CF API error");
  const zone = (json.result || [])[0];
  if (!zone) throw new Error("zone not found");
  return { id: zone.id, createdOn: zone.created_on || null };
}

async function fetchTotalRequests(env, zoneId) {
  const token = cfToken(env);
  if (!token) throw new Error("CF_API_TOKEN missing");
  const today = new Date().toISOString().slice(0, 10);
  const query = `query {
    viewer {
      zones(filter: { zoneTag: ${JSON.stringify(zoneId)} }) {
        httpRequests1dGroups(limit: 400, filter: { date_geq: ${JSON.stringify(UPTIME_BASE)}, date_leq: ${JSON.stringify(today)} }) {
          sum { requests }
        }
      }
    }
  }`;

  const resp = await fetch(CF_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!resp.ok) throw new Error("CF GraphQL " + resp.status);
  const json = await resp.json();
  const zones = (json.data && json.data.viewer && json.data.viewer.zones) || [];
  const groups = (zones[0] && zones[0].httpRequests1dGroups) || [];
  return groups.reduce((acc, g) => acc + ((g.sum && g.sum.requests) || 0), 0);
}

export async function refreshApiData(env) {
  let zone = null;
  try { zone = await fetchZone(env); } catch { /* 无 token 或 API 失败时用缓存 */ }
  let visits = null;
  try { if (zone) visits = await fetchTotalRequests(env, zone.id); } catch { /* 同上 */ }
  const now = beijingNow();
  const fresh = { date: now.date, slot: currentSlot(now.hour), visits, fetchedAt: Date.now() };
  await saveApiCache(env, fresh);
  return fresh;
}

export async function fetchStatusPageData(env, ctx) {
  const state = (await fetchStatusState(env)) || {
    failCounts: {},
    lastEventAt: {},
    uptimeStart: null,
    events: [],
  };

  const apiCache = await fetchApiCache(env);
  const now = beijingNow();
  const slot = currentSlot(now.hour);
  const needsFetch = !apiCache || apiCache.date !== now.date || (apiCache.slot || -1) < slot;
  let totalRequests = apiCache ? apiCache.visits : null;

  if (needsFetch) {
    if (apiCache) {
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(refreshApiData(env).catch(() => {}));
      }
    } else {
      const fresh = await refreshApiData(env);
      totalRequests = fresh.visits;
    }
  }

  let services = await fetchAllSiteUrls(env);
  if (!services.length) services = DEFAULT_SERVICES;
  const results = await checkAllSites(services);
  const checked = services.map((s, i) => ({ ...s, ...results[i] }));

  recordEvents(checked, state);
  await saveStatusState(env, state);

  const notice = await fetchNotice(env);
  const uptimeDays = calcUptimeDays(UPTIME_BASE);
  const status = summarizeStatus(checked);

  return {
    uptimeDays,
    visits: totalRequests,
    ...status,
    checked,
    events: state.events,
    notice: notice ? `<div class="status-notice__content">${escapeHtml(notice)}</div>` : "",
  };
}
