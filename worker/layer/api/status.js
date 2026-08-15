/**
 * API 接口层 — 状态页数据
 * CF API 集成 + 站点健康检测 + 事件记录
 * 
 * 实际来源：worker/status.js
 */

import { fetchApiCache, saveApiCache, fetchStatusState, saveStatusState, fetchNotice } from "../database/kv.js";
import { fetchAllSiteUrls } from "../database/d1.js";
import { checkAllSites, recordEvents, summarizeStatus, calcUptimeDays } from "../service/site.service.js";
import { beijingNow, currentSlot, needsApiRefresh } from "../service/cache.service.js";
import { escapeHtml } from "../security/escape.js";
import { UPTIME_BASE } from "../../shared/config.js";

/**
 * CF API 抓取：获取 zone 信息
 * GET https://api.cloudflare.com/client/v4/zones?name=<domain>&per_page=1
 */
async function fetchZone(env) {
  const resp = await fetch(
    `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(env.ZONE_NAME)}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
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

/**
 * CF GraphQL 抓取：累计请求量
 * 按天分组求和，统计区间从 UPTIME_BASE 到今天
 */
async function fetchTotalRequests(env, zoneId) {
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

  const resp = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
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

/**
 * 刷新 CF API 数据（到点时触发，其余时间用缓存）
 */
export async function refreshApiData(env) {
  let zone = null;
  try { zone = await fetchZone(env); } catch (e) {}
  let visits = null;
  try { if (zone) visits = await fetchTotalRequests(env, zone.id); } catch (e) {}
  const now = beijingNow();
  const fresh = { date: now.date, slot: currentSlot(now.hour), visits, fetchedAt: Date.now() };
  await saveApiCache(env, fresh);
  return fresh;
}

/**
 * 获取状态页完整数据
 * @param {Object} env - Worker env（含 STATUS_KV, NOTICE_KV, DB, CF_API_TOKEN, ZONE_NAME）
 * @param {Object} ctx - Worker ctx（用于 waitUntil）
 * @returns {Object} { uptimeDays, visits, stateLabel, stateClass, checked, events, notice }
 */
export async function fetchStatusPageData(env, ctx) {
  // 加载状态内存
  const state = (await fetchStatusState(env)) || {
    failCounts: {},
    lastEventAt: {},
    uptimeStart: null,
    events: [],
  };

  // CF API 缓存判断
  const apiCache = await fetchApiCache(env);
  const now = beijingNow();
  const slot = currentSlot(now.hour);
  const needsFetch = !apiCache || apiCache.date !== now.date || (apiCache.slot || -1) < slot;
  let totalRequests = apiCache ? apiCache.visits : null;

  if (needsFetch) {
    if (apiCache) {
      // 已有旧缓存：后台刷新，不阻塞
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(refreshApiData(env).catch(() => {}));
      }
    } else {
      // 首次无缓存：阻塞抓取
      const fresh = await refreshApiData(env);
      totalRequests = fresh.visits;
    }
  }

  // 站点健康检测
  const services = await fetchAllSiteUrls(env);
  const results = await checkAllSites(services);
  const checked = services.map((s, i) => ({ ...s, ...results[i] }));

  // 记录事件
  recordEvents(checked, state);
  await saveStatusState(env, state);

  // 公告
  const notice = await fetchNotice(env);

  // 汇总
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
