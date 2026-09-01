// GALNAVI Worker - Open Source Version
// status 仍是 β，未用现网完整版覆盖。密钥用占位符，不要填入真实 token。
// See AGENTS.md for project conventions.
/**
 * Cloudflare Worker - status（站点状态页）
 * 路由: example.com/status/*
 * 构建: 由 sandbox/status-sandbox/build-status.mjs 生成
 * 数据: Cloudflare API（zone + analytics）+ 服务直连检测 + 事件记录
 * 事件规则: 同一服务短时间内连续 3 次异常 → 写入一条 yyyy-mm-dd hh-mm xxx事件
 */

const ASSET_ICON = "https://your-cdn.example.com/assets/icon/favicon.png";
const SECURITY_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://example.com https://api.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
};

// Cloudflare API Token（生产部署建议改为 Secret 绑定 CF_API_TOKEN）
const CF_API_TOKEN = "YOUR_CLOUDFLARE_API_TOKEN"; // Set via environment variable
const ZONE_NAME = "example.com";
const CF_API_BASE = "https://api.cloudflare.com/client/v4";
const CF_GRAPHQL = "https://api.cloudflare.com/client/v4/graphql";
// 稳定运行起算日（站点正式上线）
const UPTIME_BASE = "2026-06-26";

// 内置监测服务（无 env.DB 时的兜底清单）
const DEFAULT_SERVICES = [
  { name: "发布页", url: "https://example.com/" },
  { name: "主站导航", url: "https://example.com/nav/" },
  { name: "站点帮助", url: "https://example.com/nav/help/" },
  { name: "关于本站", url: "https://example.com/nav/about/" },
  { name: "圣器殿堂", url: "https://example.com/nav/palace/" },
  { name: "友情链接", url: "https://example.com/nav/friend/" },
  { name: "赞助本站", url: "https://example.com/nav/donate/" },
  { name: "站点状态", url: "https://example.com/status/" },
];

// 事件规则：连续异常阈值 + 短时窗口
const EVENT_THRESHOLD = 3;
const EVENT_WINDOW_MS = 10 * 60 * 1000;
const EVENT_COOLDOWN_MS = 60 * 60 * 1000;
const MAX_EVENTS = 20;

// CF API 抓取时段：每天 0/8/16 点（北京时间），网页请求触发抓取
const API_SLOTS = [0, 8, 16];
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

// 沙盒内存态（生产可换 STATUS_KV）
const memory = {
  failCounts: {},        // key -> { count, firstAt }
  lastEventAt: {},       // key -> ts（防刷屏冷却）
  uptimeStart: null,     // 首次观测时间戳
  events: [],            // [{ time: "yyyy-mm-dd hh-mm", text: "xxx事件" }]
  apiCache: null,        // { date, slot, visits, fetchedAt }（内存兜底缓存）
};

// 北京时间当前日期与小时（用于抓取时段判断）
function beijingNow() {
  const d = new Date(Date.now() + BEIJING_OFFSET_MS);
  return {
    date: d.toISOString().slice(0, 10),
    hour: d.getUTCHours(),
  };
}

// 当前所处抓取时段（0/8/16 点取最近已过的一档）
function currentSlot(hour) {
  let slot = API_SLOTS[0];
  for (const s of API_SLOTS) if (hour >= s) slot = s;
  return slot;
}

async function loadApiCache(env) {
  try {
    if (env && env.STATUS_KV) {
      const raw = await env.STATUS_KV.get("api_cache", "json");
      if (raw) return raw;
    }
  } catch (e) {}
  return memory.apiCache;
}

async function saveApiCache(env, data) {
  memory.apiCache = data;
  try {
    if (env && env.STATUS_KV) await env.STATUS_KV.put("api_cache", JSON.stringify(data));
  } catch (e) {}
}

// 网页自行抓取：到点时由首个访问请求触发（无 Cron），其余时间用缓存
async function refreshApiData(env) {
  let zone = null;
  try { zone = await fetchZone(); } catch (e) {}
  let visits = null;
  try { if (zone) visits = await fetchTotalRequests(zone.id); } catch (e) {}
  const now = beijingNow();
  const fresh = { date: now.date, slot: currentSlot(now.hour), visits, fetchedAt: Date.now() };
  await saveApiCache(env, fresh);
  return fresh;
}

function defer(p, ctx) {
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(p.catch(() => {}));
  else p.catch(() => {});
}

function pad2(n) { return String(n).padStart(2, "0"); }

// 事件时间格式：yyyy-mm-dd hh-mm（北京时间）
function formatEventTime(ts) {
  const d = new Date(ts + BEIJING_OFFSET_MS);
  return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate()) + " " + pad2(d.getUTCHours()) + "-" + pad2(d.getUTCMinutes());
}

function esc(s) {
  if (s == null) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function cfFetch(path, opts) {
  const resp = await fetch(CF_API_BASE + path, {
    ...(opts || {}),
    headers: { Authorization: "Bearer " + CF_API_TOKEN, "Content-Type": "application/json", ...((opts || {}).headers || {}) },
  });
  if (!resp.ok) throw new Error("CF API " + resp.status);
  const json = await resp.json();
  if (json.success === false) throw new Error("CF API error: " + JSON.stringify(json.errors || []).slice(0, 200));
  return json;
}

async function fetchZone() {
  const json = await cfFetch("/zones?name=" + encodeURIComponent(ZONE_NAME) + "&per_page=1");
  const zone = (json.result || [])[0];
  if (!zone) throw new Error("zone not found");
  return { id: zone.id, createdOn: zone.created_on || null };
}

// 累计访问：GraphQL 按天分组求和（统计区间从起算日起）
async function fetchTotalRequests(zoneId) {
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
    headers: { Authorization: "Bearer " + CF_API_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!resp.ok) throw new Error("CF GraphQL " + resp.status);
  const json = await resp.json();
  const zones = (json.data && json.data.viewer && json.data.viewer.zones) || [];
  const groups = (zones[0] && zones[0].httpRequests1dGroups) || [];
  return groups.reduce((acc, g) => acc + ((g.sum && g.sum.requests) || 0), 0);
}

async function checkOne(url, timeoutMs) {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
    return { ok: resp.status === 200, status: resp.status, ms: Date.now() - started };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - started, error: e.name === "AbortError" ? "超时" : "不可达" };
  } finally {
    clearTimeout(timer);
  }
}

// 检测清单：优先 env.DB.sites，兜底 DEFAULT_SERVICES
async function resolveServices(env) {
  try {
    if (env && env.DB) {
      const { results } = await env.DB.prepare("SELECT item_key, title, url FROM sites WHERE url IS NOT NULL AND url != '' LIMIT 40").all();
      const rows = results || [];
      if (rows.length) return rows.map((r) => ({ name: r.title || r.item_key, url: r.url }));
    }
  } catch (e) {}
  return DEFAULT_SERVICES;
}

async function loadMemory(env) {
  try {
    if (env && env.STATUS_KV) {
      const raw = await env.STATUS_KV.get("state", "json");
      if (raw) {
        memory.failCounts = raw.failCounts || {};
        memory.lastEventAt = raw.lastEventAt || {};
        memory.uptimeStart = raw.uptimeStart || null;
        memory.events = raw.events || [];
      }
    }
  } catch (e) {}
}

async function saveMemory(env) {
  try {
    if (env && env.STATUS_KV) {
      await env.STATUS_KV.put("state", JSON.stringify({
        failCounts: memory.failCounts,
        lastEventAt: memory.lastEventAt,
        uptimeStart: memory.uptimeStart,
        events: memory.events,
      }));
    }
  } catch (e) {}
}

// 事件规则：短时间内连续 3 次相同异常 → 写入一条事件
function recordEvents(results, env) {
  const now = Date.now();
  if (!memory.uptimeStart) memory.uptimeStart = now;
  const newEvents = [];
  for (const r of results) {
    const key = r.url;
    if (r.ok) {
      memory.failCounts[key] = null;
      continue;
    }
    const rec = memory.failCounts[key] || { count: 0, firstAt: now };
    rec.count += 1;
    if (rec.count === 1) rec.firstAt = now;
    memory.failCounts[key] = rec;
    const last = memory.lastEventAt[key] || 0;
    if (
      rec.count >= EVENT_THRESHOLD &&
      now - rec.firstAt <= EVENT_WINDOW_MS &&
      now - last >= EVENT_COOLDOWN_MS
    ) {
      const ev = { ts: now, time: formatEventTime(now), text: r.name + " 服务异常事件" };
      memory.events.unshift(ev);
      if (memory.events.length > MAX_EVENTS) memory.events.length = MAX_EVENTS;
      memory.lastEventAt[key] = now;
      memory.failCounts[key] = null;
      newEvents.push(ev);
    }
  }
  return newEvents;
}

// 稳定运行天数：固定从 UPTIME_BASE 起算（站点正式上线日）
function calcUptimeDays() {
  const now = Date.now();
  const baseTs = Date.parse(UPTIME_BASE + "T00:00:00Z");
  return Math.max(0, Math.floor((now - baseTs) / 86400000));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/status") {
      url.pathname = "/status/";
      return Response.redirect(url.toString(), 301);
    }
    // 首访 cookie 校验（VERIFIED_KEY = site-verified）
    const cookie = request.headers.get("Cookie") || "";
    const verified = cookie.includes("site-verified=1");
    if (!verified) {
      return Response.redirect("https://example.com/", 302);
    }
    await loadMemory(env);
    // CF API 一天最多抓 3 次（0/8/16 点），网页请求触发，其余时间用缓存
    const apiCache = await loadApiCache(env);
    const now = beijingNow();
    const slot = currentSlot(now.hour);
    const needsFetch = !apiCache || apiCache.date !== now.date || (apiCache.slot || -1) < slot;
    let totalRequests = apiCache ? apiCache.visits : null;
    if (needsFetch) {
      if (apiCache) {
        // 已有当日缓存：先用旧值渲染，后台再抓新值（本次请求不等待）
        defer(refreshApiData(env), ctx);
      } else {
        // 首次访问无缓存：阻塞抓取
        const fresh = await refreshApiData(env);
        totalRequests = fresh.visits;
      }
    }
    const services = await resolveServices(env);
    const results = await Promise.all(services.map((s) => checkOne(s.url, 8000)));
    const checked = services.map((s, i) => ({ ...s, ...results[i] }));
    recordEvents(checked, env);
    await saveMemory(env);
    const uptimeDays = calcUptimeDays();
    const downCount = checked.filter((c) => !c.ok).length;
    const allUp = downCount === 0;
    const stateLabel = allUp ? "运行正常" : downCount === checked.length ? "服务中断" : "部分异常";
    const stateClass = allUp ? "ok" : "bad";
    // 公告：从 NOTICE_KV 读取 key="notice"
    let noticeHtml = "";
    try {
      if (env && env.NOTICE_KV) {
        const raw = await env.NOTICE_KV.get("notice");
        if (raw) {
          noticeHtml = '<div class="status-notice__content">' + esc(raw) + '</div>';
        }
      }
    } catch (e) {}
    const page = renderPage({
      uptimeDays,
      visits: totalRequests,
      stateLabel,
      stateClass,
      checked,
      events: memory.events,
      notice: noticeHtml,
    });
    return new Response(page, { headers: SECURITY_HEADERS });
  },
};

function renderPage(d) {
  const statUptime = d.uptimeDays != null ? (d.uptimeDays >= 365 * 100 ? "∞" : String(d.uptimeDays)) : "--";
  const statVisits = d.visits != null ? d.visits.toLocaleString("zh-CN") : "--";
  const listRows = d.checked.map((c) => {
    const stateTxt = c.ok ? "正常" : c.status === 0 ? c.error || "异常" : "异常 " + c.status;
    const stateCls = c.ok ? "status-item__state--ok" : "status-item__state--bad";
    const icon = c.ok ? "🟢" : "🔴";
    return '<li class="status-item" role="listitem">'
      + '<span class="status-item__icon" aria-hidden="true">' + icon + "</span>"
      + '<a class="status-item__name" href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(c.name) + ' - ' + (c.ok ? '正常' : '异常') + '">' + esc(c.name) + "</a>"
      + '<span class="status-item__url">' + esc(c.url) + "</span>"
      + '<span class="status-item__spacer" aria-hidden="true"></span>'
      + (c.ok ? '<span class="status-item__ms">' + c.ms + "ms</span>" : "")
      + '<span class="status-item__state ' + stateCls + '">' + esc(stateTxt) + "</span>"
      + "</li>";
  }).join("\n");
  const eventRows = d.events.length
    ? d.events.map((e) => '<li class="status-event"><span class="status-event__time">' + esc(e.time) + '</span><span class="status-event__text">' + esc(e.text) + '</span></li>').join("\n")
    : '';
  const eventList = d.events.length
    ? '<ul class="status-events">' + eventRows + "</ul>"
    : '';
  const eventEmptyHidden = d.events.length ? " hidden" : "";
  const stateStatCls = d.stateClass === "ok" ? "status-stat--ok" : "status-stat--bad";
  const now = new Date(Date.now() + BEIJING_OFFSET_MS);
  const updateStr = now.getUTCFullYear() + "-" + pad2(now.getUTCMonth() + 1) + "-" + pad2(now.getUTCDate()) + " " + pad2(now.getUTCHours()) + ":" + pad2(now.getUTCMinutes());
  let out = HTML_TEMPLATE.replace('<span id="uptimeNum">--</span>', '<span id="uptimeNum">' + statUptime + "</span>")
    .replace('<span id="visitsNum">--</span>', '<span id="visitsNum">' + statVisits + "</span>")
    .replace('<div class="status-stat__value" id="stateValue">检测中</div>', '<div class="status-stat__value" id="stateValue">' + esc(d.stateLabel) + "</div>")
    .replace(/<time id="dashUpdateTime">--<\/time>/g, '<time id="dashUpdateTime">' + esc(updateStr) + "</time>")
    .replace(/<time id="svcUpdateTime">--<\/time>/g, '<time id="svcUpdateTime">' + esc(updateStr) + "</time>");
  // 状态卡装饰色
  out = out.replace('<div class="status-stat" id="statState">', '<div class="status-stat ' + stateStatCls + '" id="statState">');
  out = out.replace('<ul class="status-list" id="statusList" role="list" aria-label="服务状态列表"></ul>', listRows ? '<ul class="status-list" id="statusList" role="list" aria-label="服务状态列表">' + listRows + "</ul>" : '<ul class="status-list" id="statusList" role="list" aria-label="服务状态列表"></ul>');
  out = out.replace('<ul class="status-events" id="eventList"></ul>', eventList || '<ul class="status-events" id="eventList"></ul>');
  out = out.replace('<div class="gd-empty-state" id="eventEmpty" hidden>', '<div class="gd-empty-state" id="eventEmpty"' + eventEmptyHidden + ">");
  // 公告注入（替换整个空状态占位块）
  if (d.notice) {
    const noticeBlock = '<div class="gd-empty-state" id="noticeEmpty"><div class="gd-empty-state__icon" aria-hidden="true">📢</div><p class="gd-empty-state__title">暂无公告</p></div>';
    out = out.replace(noticeBlock, d.notice);
  }
  return out;
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<title>站点状态（beta）· GALNAVI</title>
<meta name="robots" content="index, follow">
<link rel="icon" href="https://your-cdn.example.com/assets/icon/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="https://your-cdn.example.com/assets/icon/favicon.png">
<style>
/* ===== 组件库（构建期内联） ===== */
/* ===== src/foundation/tokens/tokens.css ===== */
/* gd tokens — 色值/玻璃为现网取值；字号/圆角/状态透明度语义对齐 MD3 */
:root {
  /* Color roles（值 = GALNAVI，禁止紫板） */
  --gd-color-background: #1c2a48;
  --gd-color-surface: #18253f;
  --gd-color-surface-variant: #223456;
  --gd-color-surface-back: #1c2a45;
  --gd-color-primary: #4f7cff;
  --gd-color-on-primary: #ffffff;
  --gd-color-primary-container: rgba(79, 124, 255, 0.12);
  --gd-color-secondary: #a855f7;
  --gd-color-tertiary: #ec4899;
  --gd-color-on-surface: #f4f7ff;
  --gd-color-on-surface-variant: #93a4c8;
  --gd-color-on-surface-subtle: #aeb9d6;
  --gd-color-outline: #1e2a45;
  --gd-color-outline-variant: rgba(30, 42, 69, 0.8);
  --gd-color-error: #f87171;
  --gd-color-on-error: #ffffff;

  /* 链接色：静止蓝 #7aa2f7 → hover 深蓝 #9ec0ff */
  --gd-color-link: #7aa2f7;
  --gd-color-link-hover: #9ec0ff;

  /* 强调色（图标/装饰用浅紫） */
  --gd-color-accent-light: #a78bfa;

  /* RGB 通道（供 rgba(var(--gd-x-rgb), a) 组合透明度层级） */
  --gd-color-primary-rgb: 79, 124, 255;
  --gd-color-secondary-rgb: 168, 85, 247;
  --gd-color-tertiary-rgb: 236, 72, 153;
  --gd-color-accent-rgb: 139, 92, 246;
  --gd-color-sky-rgb: 56, 189, 248;
  --gd-color-sky-blue-rgb: 96, 165, 250;
  --gd-color-blue-rgb: 59, 130, 246;
  --gd-color-blue-deep-rgb: 37, 99, 235;
  --gd-color-indigo-rgb: 91, 141, 239;
  --gd-color-link-rgb: 122, 162, 247;
  --gd-color-gold-rgb: 251, 191, 36;
  --gd-color-gold-deep-rgb: 245, 158, 11;
  --gd-color-error-rgb: 239, 68, 68;
  --gd-color-green-rgb: 34, 197, 94;
  --gd-color-green-light-rgb: 134, 239, 172;
  --gd-color-white-rgb: 255, 255, 255;
  --gd-color-muted-white-rgb: 232, 238, 255;
  --gd-color-grey-rgb: 139, 156, 192;
  --gd-color-text-rgb: 244, 247, 255;

  /* 深色层级（遮罩/浮层/卡片渐变底） */
  --gd-color-navy-rgb: 8, 12, 24;
  --gd-color-navy-deep-rgb: 6, 10, 20;
  --gd-color-navy-panel-rgb: 8, 10, 20;
  --gd-color-navy-card-rgb: 22, 28, 48;
  --gd-color-navy-card-deep-rgb: 12, 16, 28;
  --gd-color-navy-modal-rgb: 14, 21, 37;
  --gd-color-ink-rgb: 20, 30, 56;
  --gd-color-ink-2-rgb: 38, 54, 94;
  --gd-color-ink-3-rgb: 12, 18, 36;
  --gd-color-ink-4-rgb: 24, 34, 65;
  --gd-color-outline-blue-rgb: 126, 153, 255;
  --gd-color-blue-soft-rgb: 191, 219, 254;

  /* 语义层级便捷变量 */
  --gd-color-overlay: rgba(var(--gd-color-navy-deep-rgb), 0.88);
  --gd-color-overlay-strong: rgba(var(--gd-color-navy-panel-rgb), 0.92);
  --gd-color-overlay-float: rgba(var(--gd-color-navy-rgb), 0.95);
  --gd-color-card-gradient-a: rgba(var(--gd-color-navy-card-rgb), 0.96);
  --gd-color-card-gradient-b: rgba(var(--gd-color-navy-card-deep-rgb), 0.98);
  --gd-color-modal-gradient-a: rgba(var(--gd-color-navy-modal-rgb), 0.96);
  --gd-color-modal-gradient-b: rgba(var(--gd-color-navy-rgb), 0.98);
  --gd-color-border-hover: rgba(var(--gd-color-sky-rgb), 0.28);
  --gd-color-border-accent: rgba(var(--gd-color-accent-rgb), 0.22);
  --gd-color-demo-dash: rgba(var(--gd-color-grey-rgb), 0.45);

  /* 补充语义色（release-modal 等引用） */
  --gd-color-success: #86efac;
  --gd-color-error-light: #fca5a5;
  --gd-color-sky: #38bdf8;
  --gd-color-blue: #3b82f6;
  --gd-color-blue-deep: #2563eb;
  --gd-color-accent-pink: #ff85c0;
  --gd-color-cyan: #22d3ee;
  --gd-color-cyan-light: #67e8f9;
  --gd-color-cyan-rgb: 34, 211, 238;
  --gd-color-cyan-light-rgb: 103, 232, 249;

  /* 渐变专用色（按钮/标题渐变端点） */
  --gd-gradient-primary-a: #7c3aed;
  --gd-gradient-primary-b: #6d28d9;
  --gd-gradient-primary-hover-a: #8b5cf6;
  --gd-gradient-primary-hover-b: #7c3aed;
  --gd-gradient-pink-a: #ec4899;
  --gd-gradient-pink-b: #db2777;
  --gd-gradient-pink-hover-a: #f472b6;
  --gd-gradient-pink-hover-b: #ec4899;
  --gd-gradient-title-a: #c4b5fd;
  --gd-gradient-title-b: #e9d5ff;
  --gd-gradient-title-c: #a78bfa;
  --gd-gradient-title-d: #8b5cf6;

  /* 彩点色（filter-bar 等胶囊按钮的圆点循环色：三色循环 + 中性兜底） */
  --gd-dot-1: var(--gd-color-primary);
  --gd-dot-2: var(--gd-color-secondary);
  --gd-dot-3: var(--gd-color-tertiary);
  --gd-dot-neutral: #5a6a8a;

  /* 标签色（卡片标签三色循环） */
  --gd-tag-1-bg: rgba(168, 85, 247, 0.12);
  --gd-tag-1-fg: #c4b5fd;
  --gd-tag-1-border: rgba(168, 85, 247, 0.2);
  --gd-tag-2-bg: rgba(59, 130, 246, 0.12);
  --gd-tag-2-fg: #93c5fd;
  --gd-tag-2-border: rgba(59, 130, 246, 0.2);
  --gd-tag-3-bg: rgba(236, 72, 153, 0.12);
  --gd-tag-3-fg: #f9a8d4;
  --gd-tag-3-border: rgba(236, 72, 153, 0.2);

  /* 徽标色 */
  --gd-badge-bg: var(--gd-glass-border);
  --gd-badge-fg: #d7e2ff;
  --gd-badge-blue-bg: rgba(79, 124, 255, 0.28);
  --gd-badge-blue-fg: #eaf0ff;
  --gd-badge-gold-bg: rgba(251, 191, 36, 0.14);
  --gd-badge-gold-fg: #fcd34d;

  /* Shape — 语义 MD3 scale；数值贴现网 */
  --gd-shape-corner-none: 0;
  --gd-shape-corner-extra-small: 8px;
  --gd-shape-corner-small: 14px;
  --gd-shape-corner-medium: 18px;
  --gd-shape-corner-large: 20px;
  --gd-shape-corner-extra-large: 28px;
  --gd-shape-corner-full: 9999px;

  /* Type — 角色名 MD3；字号贴近现网 */
--gd-type-display-small-size: 36px;
--gd-type-display-small-line: 1.1;
--gd-type-display-medium-size: 48px;
--gd-type-headline-small-size: 24px;
--gd-type-headline-small-line: 1.3;
--gd-type-title-large-size: 22px;
--gd-type-title-large-line: 1.3;
--gd-type-title-medium-size: 16px;
--gd-type-title-medium-line: 1.4;
--gd-type-title-small-size: 15px;
--gd-type-title-small-line: 1.4;
--gd-type-label-large-size: 14px;
--gd-type-label-large-line: 1.4;
--gd-type-label-medium-size: 12px;
--gd-type-label-small-size: 11px;
--gd-type-body-large-size: 16px;
--gd-type-body-medium-size: 14px;
--gd-type-body-small-size: 12px;
--gd-type-note-size: 13px;
--gd-type-title-xxl-size: 18px;

/* 字距 */
--gd-type-letter-spacing-tight: -0.5px;
--gd-type-letter-spacing-normal: 0.01em;
--gd-type-letter-spacing-wide: 0.1em;
--gd-type-letter-spacing-extra-wide: 0.24em;

/* 字重（语义档位） */
--gd-weight-regular: 400;
--gd-weight-medium: 500;
--gd-weight-semibold: 600;
--gd-weight-bold: 700;
--gd-weight-extrabold: 800;
--gd-weight-black: 900;

  --gd-font-sans: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  /* State layer opacities（MD3） */
  --gd-state-hover: 0.08;
  --gd-state-focus: 0.12;
  --gd-state-pressed: 0.12;
  --gd-state-dragged: 0.16;
  --gd-state-disabled: 0.38;

  /* Motion（MD3 short/medium + easing） */
  --gd-motion-duration-short2: 100ms;
  --gd-motion-duration-short4: 200ms;
  --gd-motion-duration-medium1: 250ms;
  --gd-motion-duration-medium2: 300ms;
  --gd-motion-duration-medium4: 400ms;
  --gd-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --gd-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);

  /* Layout */
  --gd-nav-height: 64px;
  --gd-layout-max-width: 1200px;
  --gd-space-1: 4px;
  --gd-space-2: 8px;
  --gd-space-3: 12px;
  --gd-space-4: 16px;
  --gd-space-5: 20px;
  --gd-space-6: 24px;
  --gd-touch-target: 48px;

  /* Elevation 别名（不替代玻璃） */
  --gd-elevation-level2: 0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3);
  --gd-elevation-glow: 0 0 40px rgba(79, 124, 255, 0.2), 0 0 80px rgba(168, 85, 247, 0.08);

  /* 玻璃 — 冻结现网数值，禁止借「整理」改 blur/透明度 */
  --gd-glass-bg: rgba(18, 22, 40, 0.42);
  --gd-glass-bg-hover: rgba(22, 28, 48, 0.52);
  --gd-glass-blur: blur(18px) saturate(165%);
  --gd-glass-border: rgba(255, 255, 255, 0.14);
  --gd-glass-nav-bg: rgba(8, 12, 24, 0.75);
  --gd-glass-nav-blur: blur(20px) saturate(180%);
}

/* ===== src/foundation/brand/gd-brand.css ===== */
.gd-brand {
  margin-bottom: var(--gd-space-6);
  overflow: visible;
  padding-bottom: 8px;
}
/* 不用 background-clip:text，避免 g / y 下行被裁 */
.gd-brand__title {
  display: inline-block;
  max-width: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--gd-font-sans);
  font-size: clamp(var(--gd-type-display-small-size), 6vw, 52px);
  line-height: 1.35;
  font-weight: var(--gd-weight-black);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  color: var(--gd-color-primary);
  text-shadow: 0 0 20px rgba(var(--gd-color-primary-rgb), 0.45);
  /* linear：全程匀速，避免 ease 在关键帧处顿挫 */
  animation: gd-brand-glow 3s linear infinite;
}
/* 蓝 → 青 → 紫 → 蓝，等距关键帧 + 中间过渡色，连续丝滑 */
@keyframes gd-brand-glow {
  0% {
    color: var(--gd-color-primary);
    text-shadow: 0 0 18px rgba(var(--gd-color-primary-rgb), 0.48);
  }
  16.67% {
    color: rgba(var(--gd-color-sky-rgb), 0.78);
    text-shadow: 0 0 18px rgba(var(--gd-color-sky-rgb), 0.4);
  }
  33.33% {
    color: var(--gd-color-cyan);
    text-shadow: 0 0 16px rgba(var(--gd-color-cyan-rgb), 0.36);
  }
  50% {
    color: var(--gd-color-cyan-light);
    text-shadow: 0 0 14px rgba(var(--gd-color-cyan-light-rgb), 0.28);
  }
  66.67% {
    color: rgba(var(--gd-color-sky-blue-rgb), 0.7);
    text-shadow: 0 0 16px rgba(var(--gd-color-sky-blue-rgb), 0.38);
  }
  83.33% {
  color: var(--gd-color-secondary);
  text-shadow: 0 0 20px rgba(var(--gd-color-secondary-rgb), 0.48);
  }
  100% {
    color: var(--gd-color-primary);
    text-shadow: 0 0 18px rgba(var(--gd-color-primary-rgb), 0.48);
  }
}
.gd-brand__title--shift {
  animation: gd-brand-glow 3s linear infinite;
}
/* 殿堂：橙 → 绿 → 红 循环（殿堂主题色） */
.gd-brand__title--palace {
  animation: gd-brand-glow-palace 2.25s linear infinite alternate;
}
@keyframes gd-brand-glow-palace {
  0% {
    color: rgba(var(--gd-color-green-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-green-rgb), 0.4);
  }
  33.33% {
    color: rgba(var(--gd-color-error-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-error-rgb), 0.45);
  }
  66.67% {
    color: rgba(var(--gd-color-gold-deep-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-gold-deep-rgb), 0.45);
  }
  100% {
    color: rgba(var(--gd-color-gold-deep-rgb), 1);
    text-shadow: 0 0 18px rgba(var(--gd-color-gold-deep-rgb), 0.45);
  }
}
/* 导航栏内使用：缩小到导航栏标题级别，保留发光动效 */
.gd-navbar .gd-brand__title,
.gd-navbar .gd-brand__title--shift,
.gd-navbar .gd-brand__title--palace {
  font-size: var(--gd-type-title-xxl-size);
  line-height: 1.2;
  letter-spacing: var(--gd-type-letter-spacing-tight);
  text-shadow: 0 0 14px rgba(var(--gd-color-primary-rgb), 0.35);
}
/* 预览用中等尺寸（组件库总览页） */
.gd-brand__title--demo {
  font-size: clamp(28px, 5vw, 40px);
  margin: 8px 0 0;
}
@media (prefers-reduced-motion: reduce) {
  .gd-brand__title,
  .gd-brand__title--shift,
  .gd-brand__title--palace { animation: none; }
}

/* ===== src/foundation/layout/gd-groundback.css ===== */
/* gd-groundback：页面背景层
   用法：<div class="gd-groundback gd-groundback--blue" aria-hidden="true"></div>
   变体：--blue（默认，主站） / --gold（殿堂）
   蓝色参考原版发布页（index.js）背景：三层光斑 + 对角渐变 + 点阵网格 + 底部光带。 */
.gd-groundback {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: var(--gd-color-background);
}

.gd-groundback::before,
.gd-groundback::after {
  content: "";
  position: absolute;
  inset: 0;
}

/* 蓝色（默认）：三层光斑 + 深蓝对角渐变 */
.gd-groundback--blue {
  background:
    radial-gradient(circle at 22% 18%, rgba(var(--gd-color-blue-rgb), 0.2), transparent 34%),
    radial-gradient(circle at 78% 76%, rgba(var(--gd-color-cyan-rgb), 0.14), transparent 32%),
    radial-gradient(circle at 50% 50%, rgba(var(--gd-color-secondary-rgb), 0.06), transparent 52%),
    linear-gradient(145deg, var(--gd-color-background) 0%, var(--gd-color-surface) 45%, var(--gd-color-surface-variant) 100%);
}

/* 点阵网格（原版 body::before，渐隐 mask） */
.gd-groundback--blue::before {
  background-image: radial-gradient(circle at 1px 1px, rgba(var(--gd-color-white-rgb), 0.04) 1px, transparent 0);
  background-size: 40px 40px;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.34));
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.34));
}

/* 底部光带 + 底部蓝光晕（原版 body::after） */
.gd-groundback--blue::after {
  background:
    linear-gradient(90deg, transparent, rgba(var(--gd-color-white-rgb), 0.028), transparent),
    radial-gradient(circle at 50% 110%, rgba(var(--gd-color-blue-rgb), 0.12), transparent 36%);
}

/* 殿堂金：深色底 + 金色光晕（参考现网 palace 背景） */
.gd-groundback--gold {
  background: linear-gradient(145deg, #06070e 0%, #0a0c16 48%, #0e1322 100%);
}

.gd-groundback--gold::before {
  background:
    radial-gradient(40% 35% at 18% 14%, rgba(var(--gd-color-gold-rgb), 0.12), transparent 70%),
    radial-gradient(36% 32% at 86% 82%, rgba(var(--gd-color-error-rgb), 0.10), transparent 70%);
}

/* prefers-reduced-motion：背景静态无动画，无额外处理 */

/* ===== src/extend/overview/gd-overview.css ===== */
/* gd-overview — 总览页壳层（虚线分区：正文 + 标题 + 右侧索引） */

:root {
  --ov-bg: var(--gd-color-background);
  --ov-text: var(--gd-color-on-surface);
  --ov-display: var(--gd-color-on-surface);
  --ov-tertiary: var(--gd-color-on-surface-variant);
  --ov-anchor: rgba(139, 156, 192, 0.55);
  --ov-accent: var(--gd-color-primary);
  --ov-border-soft: rgba(var(--gd-color-white-rgb), 0.14);
  --ov-toc-width: 165px;
  --ov-content-max: 811px;
  /* 窄屏：右侧不再用居中半宽留白 */
  --ov-page-max: 976px;
  --ov-shell-pad-right: 12px;
}

html {
  scroll-behavior: smooth;
  background: var(--gd-color-background);
}

body.gd-overview {
  margin: 0;
  min-height: 100%;
  color: var(--gd-color-on-surface);
  font-family: var(--gd-font-sans);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  background:
    radial-gradient(40% 35% at 18% 12%, rgba(var(--gd-color-indigo-rgb), 0.3), transparent 70%),
    radial-gradient(35% 30% at 88% 78%, rgba(var(--gd-color-blue-deep-rgb), 0.22), transparent 70%),
    var(--gd-color-background);
  background-attachment: fixed;
}

/* 顶部分隔虚线（无导航栏，仅保留分区线） */
.gd-overview__chrome {
  height: 1px;
  width: 100%;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMSIgdmlld0JveD0iMCAwIDMyIDEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF9oKSI+CjxwYXRoIGQ9Ik0xNiAwTDE2IDFMMCAxTDAgMEwxNiAwWiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfaCI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSByb3RhdGUoLTkwKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
  background-repeat: repeat-x;
  background-position: 0 0;
}

.gd-overview__shell {
  width: 100%;
  max-width: none;
  margin: 0;
  box-sizing: border-box;
}

.gd-overview__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "post";
  width: 100%;
}

.gd-overview__content {
  grid-area: post;
  min-width: 0;
  padding: 24px 20px 64px;
}

.gd-overview__toc {
  display: none;
  grid-area: toc;
}

@media (min-width: 768px) {
  /* 右侧仅留窄边距，把空间让给正文 */
  .gd-overview__shell {
    padding-right: var(--ov-shell-pad-right);
    padding-left: 0;
  }
  .gd-overview__layout {
    grid-template-columns: minmax(0, 1fr) var(--ov-toc-width);
    grid-template-areas: "post toc";
  }
  .gd-overview__content {
    padding: 24px 28px 80px clamp(20px, 3vw, 48px);
  }
  .gd-overview__toc {
    display: block;
    padding: 28px 8px 0 12px;
    /* CF: ltr-dashed-left — 左侧竖虚线 */
    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDEgMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF92KSI+CjxwYXRoIGQ9Ik0xIDE2TDAgMTZMMCAwTDEgMEwxIDE2WiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfdiI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
    background-repeat: repeat-y;
    background-position: 0 0;
  }
}

@media (min-width: 1280px) {
  :root { --ov-toc-width: 165px; }
}

/* —— 标题区 —— */
.gd-overview__date {
  display: block;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-medium);
  line-height: 1;
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--gd-color-on-surface-variant);
  margin: 0 0 16px;
}

.gd-overview__title {
  display: inline-block;
  margin: 0 0 20px;
  padding: 0;
  font-family: var(--gd-font-sans);
  font-size: clamp(var(--gd-type-display-small-size, 28px), 6vw, 52px);
  font-weight: var(--gd-weight-black);
  line-height: 1.35;
  letter-spacing: var(--gd-type-letter-spacing-wide);
  color: rgba(var(--gd-color-sky-blue-rgb), 0.9);
  text-shadow: 0 0 24px rgba(var(--gd-color-sky-blue-rgb), 0.35);
  animation: gd-brand-glow 3s linear infinite;
}

.gd-overview__lede {
  margin: 0 0 8px;
  max-width: 40rem;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-body-medium-size, 16px);
  line-height: 1.7;
  color: var(--gd-color-on-surface-variant);
}

.gd-overview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin: 20px 0 0;
  font-size: var(--gd-type-note-size);
  color: var(--ov-tertiary);
}

.gd-overview__tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--ov-text) 18%, transparent);
  color: var(--ov-tertiary);
  font-size: var(--gd-type-note-size);
  line-height: 1.3;
  text-decoration: none;
}

.gd-overview__rule {
  height: 1px;
  margin: 40px 0 8px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMSIgdmlld0JveD0iMCAwIDMyIDEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF9oKSI+CjxwYXRoIGQ9Ik0xNiAwTDE2IDFMMCAxTDAgMEwxNiAwWiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfaCI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSByb3RhdGUoLTkwKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
  background-repeat: repeat-x;
  background-position: 0 0;
}

/* —— 正文分区 —— */
.gd-overview .gd-section {
  margin: 40px 0 0;
  padding-top: 8px;
  scroll-margin-top: 24px;
}

.gd-overview .gd-section__title {
  margin: 0 0 16px;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-title-xxl-size);
  font-weight: var(--gd-weight-bold);
  line-height: 1.25;
  color: var(--gd-color-on-surface);
  gap: 0;
}

.gd-overview .gd-section__title::before {
  display: none;
}

.gd-overview .demo-note {
  margin: 0 0 12px;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-body-medium-size, 15px);
  line-height: 1.7;
  color: var(--gd-color-on-surface-variant);
}
.gd-overview .demo-note--no-margin { margin-bottom: 0; }
.gd-overview .demo-note--top { margin: 16px 0 0; }

.gd-overview .demo-preview {
  margin-top: 12px;
  padding: 20px;
  border-radius: 8px;
  border: 1px dashed rgba(var(--gd-color-grey-rgb), 0.45);
  background: rgba(var(--gd-color-white-rgb), 0.02);
}
.gd-overview .demo-preview + .demo-preview { margin-top: 16px; }
.gd-overview .demo-preview--pad-bottom { padding-bottom: 28px; }

/* groundback 背景层演示：transform 使内部 fixed 背景相对容器定位 */
.gd-overview .demo-preview--groundback {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: flex-end;
}
.gd-overview .groundback-demo-label {
  margin: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(var(--gd-color-navy-rgb), 0.55);
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.14);
  font-size: var(--gd-type-note-size);
  color: var(--gd-color-on-surface);
}
/* 年龄门演示框确认后收起 */
.gd-overview .is-hidden {
  display: none;
}

/* 扩展页 UI 演示：内容 | 竖虚线 | 右侧索引（对齐真实布局） */
.gd-overview .extend-ui-demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 18px;
}
.gd-overview .extend-ui-demo__main {
  min-width: 0;
}
/* 演示汉堡：仅窄屏显示（复用真实结构，靠右、容器内展开；边距对齐真实：上 8px 右 8px） */
.gd-overview .extend-ui-demo__toc-mobile {
  display: none;
  position: relative;
  width: fit-content;
  margin: 8px 8px 14px auto;
}
.gd-overview .extend-ui-demo__toc-mobile .gd-overview-toc-mobile__panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: min(88vw, 280px);
  max-height: min(72vh, 480px);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px 8px;
  border-radius: var(--gd-shape-corner-small);
  border: 1px solid rgba(var(--gd-color-grey-rgb), 0.28);
  background: rgba(var(--gd-color-ink-3-rgb), 0.94);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
  scrollbar-width: none;
  -ms-overflow-style: none;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-10px) scale(0.96);
  transform-origin: top right;
  transition:
    opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.28s;
}
.gd-overview .extend-ui-demo__toc-mobile.is-open .gd-overview-toc-mobile__panel {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}
.gd-overview .extend-ui-demo__toc {
  padding-left: 16px;
  border-left: 1px dashed rgba(var(--gd-color-grey-rgb), 0.5);
}
@media (max-width: 767px) {
  .gd-overview .extend-ui-demo {
    grid-template-columns: minmax(0, 1fr);
  }
  .gd-overview .extend-ui-demo__toc-mobile {
    display: block;
  }
  .gd-overview .extend-ui-demo__toc {
    display: none;
  }
}

.gd-overview .demo-preview__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.gd-overview .demo-preview__label {
  font-size: var(--gd-type-note-size);
  color: var(--ov-tertiary);
  margin-bottom: 10px;
}

.gd-overview .demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
}
.gd-overview .demo-row--no-margin { margin-top: 0; }

.gd-overview .demo-navbar-stage {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.12);
}

.gd-overview .demo-navbar-stage .gd-navbar {
  position: relative;
}

.gd-overview .gd-footer {
  margin-top: 56px;
  padding-top: 24px;
  border-top: none;
}
/* 尾页 footer：仅页面底部的 GALNAVI · Design 加顶部虚线分隔 */
.gd-overview .gd-footer--page {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMSIgdmlld0JveD0iMCAwIDMyIDEiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF9oKSI+CjxwYXRoIGQ9Ik0xNiAwTDE2IDFMMCAxTDAgMEwxNiAwWiIgZmlsbD0iIzhiOWNjMCIgZmlsbC1vcGFjaXR5PSIwLjU1Ii8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfaCI+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMyIiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSByb3RhdGUoLTkwKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=");
  background-repeat: repeat-x;
  background-position: 0 0;
}

/* —— 右侧「本页内容」 —— */
.gd-otp {
  position: sticky;
  top: 40px;
  z-index: 1;
  padding-bottom: 48px;
}

.gd-otp__label {
  margin: 0 0 10px 10px;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-semibold);
  line-height: 1;
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--gd-color-on-surface-variant);
}

.gd-otp__list {
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.gd-otp__list::-webkit-scrollbar {
  width: 0;
  height: 0;
  background: transparent;
}

.gd-otp__link {
  display: block;
  position: relative;
  padding: 6px 2px 6px 14px;
  color: var(--gd-color-on-surface-variant);
  font-family: var(--gd-font-sans);
  font-size: 13.5px;
  line-height: 1.35;
  text-decoration: none;
  transition: color 0.14s ease;
}

.gd-otp__link::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--ov-anchor);
  opacity: 0.55;
}

.gd-otp__link:hover {
  color: var(--gd-color-on-surface);
}

.gd-otp__link.is-active {
  color: var(--gd-color-link-hover);
  font-weight: var(--gd-weight-semibold);
}

.gd-otp__link.is-active::before {
  background: var(--gd-color-primary);
  opacity: 1;
  width: 2px;
  left: 6.5px;
}

.gd-otp__link:focus-visible,
.gd-overview-mobile-list__link:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* —— 手机端：右上角裸汉堡 → 竖列标题 —— */
.gd-overview-toc-mobile {
  display: none;
}

.gd-overview-toc-mobile__btn {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(var(--gd-color-grey-rgb), 0.32);
  border-radius: 12px;
  background: rgba(var(--gd-color-ink-rgb), 0.9);
  box-shadow: none;
  color: var(--gd-color-on-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  position: relative;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}
.gd-overview-toc-mobile__btn:hover {
  color: var(--gd-color-primary);
  background: rgba(var(--gd-color-ink-2-rgb), 0.92);
  border-color: rgba(var(--gd-color-outline-blue-rgb), 0.56);
}
.gd-overview-toc-mobile__btn:active {
  transform: scale(0.92);
}
.gd-overview-toc-mobile__btn:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-overview-toc-mobile__btn svg {
  inset: 50% auto auto 50%;
}

/* gd-hamburger-motion 动效 */
.gd-hamburger-motion svg { display: block; width: 22px; height: 22px; position: absolute; transition: opacity .22s ease, transform .28s cubic-bezier(.4,0,.2,1); }
.gd-hamburger-motion .gd-hamburger-motion__menu { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) scale(1); }
.gd-hamburger-motion .gd-hamburger-motion__close { opacity: 0; transform: translate(-50%,-50%) rotate(-90deg) scale(.7); }
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__menu { opacity: 0; transform: translate(-50%,-50%) rotate(90deg) scale(.7); }
.gd-hamburger-motion[aria-expanded="true"] .gd-hamburger-motion__close { opacity: 1; transform: translate(-50%,-50%) rotate(0deg) scale(1); }

.gd-otp__link {
  transition:
    color 0.2s ease,
    font-weight 0.2s ease,
    background-color 0.2s ease;
}
.gd-otp__link::before {
  transition: background-color 0.2s ease, width 0.2s ease, opacity 0.2s ease;
}

@media (max-width: 767px) {
  .gd-overview__content {
    padding-top: 56px;
  }

  .gd-overview-toc-mobile {
    display: block;
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 300;
  }

  .gd-overview-toc-mobile__panel {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    width: min(88vw, 280px);
    max-height: min(72vh, 480px);
    overflow-x: hidden;
    overflow-y: auto;
    padding: 12px 8px;
    border-radius: 12px;
    border: 1px solid rgba(var(--gd-color-grey-rgb), 0.28);
    background: rgba(var(--gd-color-ink-3-rgb), 0.94);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
    /* 隐藏滚动条，仍可滑动 */
    scrollbar-width: none;
    -ms-overflow-style: none;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px) scale(0.96);
    transform-origin: top right;
    transition:
      opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
      visibility 0.28s;
  }
  .gd-overview-toc-mobile__panel::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-toc-mobile__panel {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }

  .gd-overview-mobile-list__label {
    margin: 0 8px 8px;
    font-size: var(--gd-type-label-small-size);
    font-weight: var(--gd-weight-bold);
    letter-spacing: var(--gd-type-letter-spacing-wide);
    text-transform: uppercase;
    color: var(--gd-color-on-surface-variant);
    opacity: 0;
    transform: translateY(6px);
    transition:
      opacity 0.22s ease,
      transform 0.22s ease;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__label {
    opacity: 1;
    transform: none;
    transition-delay: 40ms;
  }

  .gd-overview-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0;
    padding: 0;
  }

  .gd-overview-mobile-list__link {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border-radius: 8px;
    color: var(--gd-color-on-surface-variant);
    font-family: var(--gd-font-sans);
    font-size: var(--gd-type-label-large-size);
    font-weight: var(--gd-weight-medium);
    line-height: 1.35;
    text-decoration: none;
    text-align: left;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity 0.22s ease,
      transform 0.24s cubic-bezier(0.4, 0, 0.2, 1),
      color 0.18s ease,
      background-color 0.18s ease;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link {
    opacity: 1;
    transform: none;
  }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(1) { transition-delay: 50ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(2) { transition-delay: 70ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(3) { transition-delay: 90ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(4) { transition-delay: 110ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(5) { transition-delay: 130ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(6) { transition-delay: 150ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(7) { transition-delay: 170ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(8) { transition-delay: 190ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(9) { transition-delay: 210ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(10) { transition-delay: 230ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(11) { transition-delay: 250ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(12) { transition-delay: 270ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(13) { transition-delay: 290ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(14) { transition-delay: 310ms; }
  .gd-overview-toc-mobile.is-open .gd-overview-mobile-list__link:nth-child(15) { transition-delay: 330ms; }

  .gd-overview-mobile-list__link:hover {
    color: var(--gd-color-on-surface);
    background: rgba(var(--gd-color-white-rgb), 0.05);
  }
  .gd-overview-mobile-list__link.is-active {
    color: var(--gd-color-link-hover);
    background: var(--gd-color-primary-container);
    font-weight: var(--gd-weight-bold);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gd-overview-toc-mobile__btn,
  .gd-overview-toc-mobile__btn svg,
  .gd-overview-toc-mobile__panel,
  .gd-overview-mobile-list__label,
  .gd-overview-mobile-list__link,
  .gd-otp__link,
  .gd-otp__link::before {
    transition: none !important;
  }
}

/* ===== src/foundation/actions/gd-button.css ===== */
/* gd-button — 按钮（热区 ≥48；状态层用 MD3 透明度） */

.gd-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gd-space-2);
  min-height: var(--gd-touch-target);
  min-width: var(--gd-touch-target);
  padding: 10px 18px;
  border-radius: var(--gd-shape-corner-small);
  border: 1px solid transparent;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-semibold);
  line-height: var(--gd-type-label-large-line);
  text-decoration: none;
  cursor: pointer;
  color: var(--gd-color-on-surface);
  background: transparent;
  transition:
    background var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    border-color var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard),
    opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
  overflow: hidden;
}
.gd-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-button:hover::before { opacity: var(--gd-state-hover); }
.gd-button:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-button:focus-visible::before { opacity: var(--gd-state-focus); }
.gd-button:active::before { opacity: var(--gd-state-pressed); }
.gd-button:disabled,
.gd-button[aria-disabled="true"] {
  opacity: var(--gd-state-disabled);
  pointer-events: none;
  cursor: not-allowed;
}
.gd-button--primary {
  background: linear-gradient(135deg, var(--gd-color-primary), var(--gd-gradient-primary-a));
  color: var(--gd-color-on-primary);
  box-shadow: 0 4px 18px rgba(var(--gd-color-primary-rgb), 0.28);
}
.gd-button--primary:hover { filter: brightness(1.06); transform: none; }
.gd-button--secondary {
  background: rgba(var(--gd-color-white-rgb), 0.04);
  border-color: rgba(var(--gd-color-white-rgb), 0.12);
  color: var(--gd-color-on-surface-variant);
}
.gd-button--secondary:hover {
  background: rgba(var(--gd-color-white-rgb), 0.08);
  border-color: rgba(var(--gd-color-white-rgb), 0.2);
  color: var(--gd-color-on-surface);
}
.gd-button--danger {
  background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b));
  color: var(--gd-color-on-primary);
}
.gd-button--pill { border-radius: var(--gd-shape-corner-full); }

/* 卡片按钮变体（gd-card__btn--detail/link 同款）：固定宽高、紫/粉渐变、13px 字 */
.gd-button--detail,
.gd-button--link {
  flex: 0 0 auto;
  width: 164px;
  height: 39px;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border-radius: 12px;
  border: none;
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-align: center;
  color: var(--gd-color-on-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-button--detail {
  background: linear-gradient(135deg, var(--gd-gradient-primary-a), var(--gd-gradient-primary-b));
  box-shadow: none;
}
.gd-button--detail:hover {
  background: linear-gradient(135deg, var(--gd-gradient-primary-hover-a), var(--gd-gradient-primary-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-button--link {
  background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b));
  box-shadow: none;
}
.gd-button--link:hover {
  background: linear-gradient(135deg, var(--gd-gradient-pink-hover-a), var(--gd-gradient-pink-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-button--detail.is-disabled,
.gd-button--link.is-disabled,
.gd-button--detail:disabled,
.gd-button--link:disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
  box-shadow: none;
}

/* 幽灵按钮（发布页弹窗同款）：紫描边 + 紫底 + 浅紫文字 */
.gd-button--ghost {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(var(--gd-color-accent-rgb), 0.3);
  border-radius: 12px;
  background: rgba(var(--gd-color-accent-rgb), 0.15);
  color: var(--gd-tag-1-fg);
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-bold);
}
.gd-button--ghost:hover {
  background: rgba(var(--gd-color-accent-rgb), 0.25);
  border-color: rgba(var(--gd-color-accent-rgb), 0.45);
  color: var(--gd-color-on-primary);
}
.gd-button--ghost.is-disabled,
.gd-button--ghost:disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
}

/* 全宽按钮（年龄门同款）：15px 粗体 */
.gd-button--wide {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: var(--gd-type-title-small-size);
  font-weight: var(--gd-weight-bold);
}

/* 返回主站 */
.gd-button--back {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  min-height: 0;
  min-width: 0;
  padding: 0 16px 0 12px;
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.12);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: var(--gd-color-on-surface);
  font-size: var(--gd-type-title-small-size);
  font-weight: var(--gd-weight-bold);
  line-height: 1.2;
  box-shadow: none;
  overflow: hidden;
  transition:
    border-color 0.2s var(--gd-motion-easing-standard),
    background 0.2s var(--gd-motion-easing-standard),
    transform 0.2s var(--gd-motion-easing-standard),
    color 0.2s var(--gd-motion-easing-standard);
}
.gd-button--back::before { border-radius: inherit; }
.gd-button--back svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: block;
}
.gd-button--back:hover {
  border-color: rgba(var(--gd-color-indigo-rgb), 0.45);
  background: var(--gd-color-surface);
  transform: translateX(-2px);
  color: var(--gd-color-on-primary);
  filter: none;
}
/* 返回主站（殿堂橙边框变体） */
.gd-button--back--orange:hover {
  border-color: rgba(var(--gd-color-gold-deep-rgb), 0.6);
  background: rgba(var(--gd-color-gold-deep-rgb), 0.12);
  color: var(--gd-color-on-surface);
  filter: none;
}
.gd-button--back:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
@media (max-width: 640px) {
  .gd-button--back {
    font-size: var(--gd-type-label-large-size);
    height: 44px;
    padding: 0 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .gd-button,
  .gd-button::before {
    transition: none;
  }
  .gd-button--primary:hover,
  .gd-button--back:hover { transform: none; }
}

/* ===== src/foundation/actions/gd-link.css ===== */
/* gd-link — 文字链接（导航型操作，非按钮） */

.gd-link {
  display: inline;
  background: transparent;
  border: none;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-body-medium-size);
  font-weight: var(--gd-weight-semibold);
  line-height: inherit;
  text-decoration: none;
  cursor: pointer;
  color: var(--gd-color-link);
  transition: color var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
}
.gd-link:hover {
  color: var(--gd-color-link-hover);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.gd-link:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}
.gd-link:disabled,
.gd-link[aria-disabled="true"] {
  opacity: var(--gd-state-disabled);
  pointer-events: none;
  cursor: not-allowed;
}

/* ===== src/display/tag/gd-tag.css ===== */
.gd-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 30px;
  padding: 0 14px;
  border-radius: var(--gd-shape-corner-full);
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-medium);
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: transform var(--gd-motion-duration-short4) var(--gd-motion-easing-standard), filter var(--gd-motion-duration-short4) var(--gd-motion-easing-standard);
  background: var(--gd-tag-1-bg);
  color: var(--gd-tag-1-fg);
  border: 1px solid var(--gd-tag-1-border);
}
.gd-tag:hover { filter: brightness(1.1); transform: none; }
.gd-tag:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-tag--blue { background: var(--gd-tag-2-bg); color: var(--gd-tag-2-fg); border-color: var(--gd-tag-2-border); }
.gd-tag--pink { background: var(--gd-tag-3-bg); color: var(--gd-tag-3-fg); border-color: var(--gd-tag-3-border); }

/* 标签索引页（example.com/nav/#tags tag-item） */
.gd-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.gd-tag--item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  height: 30px;
  padding: 0 18px;
  background: rgba(var(--gd-color-primary-rgb), 0.08);
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.15);
  border-radius: var(--gd-shape-corner-full);
  cursor: pointer;
  font-size: var(--gd-type-label-large-size);
  font-weight: var(--gd-weight-regular);
  color: var(--gd-color-on-surface-variant);
  transition: all 0.25s ease;
}
.gd-tag--item:hover {
  background: rgba(var(--gd-color-primary-rgb), 0.15);
  border-color: rgba(var(--gd-color-primary-rgb), 0.3);
  color: var(--gd-color-on-surface);
  box-shadow: 0 0 16px rgba(var(--gd-color-primary-rgb), 0.12);
  filter: brightness(1.06);
  transform: none;
}
.gd-tag--item.is-active {
  background: rgba(var(--gd-color-primary-rgb), 0.2);
  border-color: var(--gd-color-primary);
  color: var(--gd-color-primary);
}
.gd-tag--item .gd-tag__name { font-weight: var(--gd-weight-semibold); }
.gd-tag--item .gd-tag__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--gd-type-label-medium-size);
  color: var(--gd-badge-fg);
  background: var(--gd-badge-bg);
  height: 17px;
  padding: 0 8px;
  border-radius: 10px;
  font-weight: var(--gd-weight-bold);
  line-height: 1;
}
.gd-tag--item.is-active .gd-tag__count {
  color: var(--gd-badge-blue-fg);
  background: var(--gd-badge-blue-bg);
  font-weight: var(--gd-weight-bold);
}

@media (prefers-reduced-motion: reduce) {
  .gd-tag { transition: none; }
  .gd-tag:hover { transform: none; }
  .gd-tag--item { transition: none; }
  .gd-tag--item:hover { transform: none; }
}

/* ===== src/display/card/gd-card.css ===== */
/* gd-card — 玻璃数值冻结；主站 / 友链 / 殿堂变体 */

.gd-card {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(420px, 100%);
  height: 212px;
  padding: 20px;
  border-radius: var(--gd-shape-corner-large);
  background: var(--gd-glass-bg);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid var(--gd-glass-border);
  box-shadow: none;
  color: inherit;
  text-decoration: none;
  transition:
    transform var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard),
    background var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard),
    border-color var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard),
    box-shadow var(--gd-motion-duration-medium1) var(--gd-motion-easing-standard);
  z-index: 1;
}
.gd-card:hover {
  background: var(--gd-glass-bg-hover);
  border-color: var(--gd-color-border-hover);
  box-shadow: 0 0 24px rgba(var(--gd-color-primary-rgb), 0.1), inset 0 1px 0 rgba(var(--gd-color-white-rgb), 0.06);
  transform: none;
  filter: brightness(1.05);
}
.gd-card--link { cursor: pointer; }

.gd-card__header { display: flex; align-items: flex-start; gap: 14px; }
.gd-card__icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--gd-shape-corner-small);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--gd-color-accent-rgb), 0.15), rgba(var(--gd-color-blue-rgb), 0.1));
  border: 1px solid rgba(var(--gd-color-accent-rgb), 0.2);
  font-size: var(--gd-type-title-large-size);
  font-weight: var(--gd-weight-extrabold);
  color: var(--gd-color-link);
}
.gd-card__icon img { width: 40px; height: 40px; object-fit: contain; }
.gd-card__title-wrap { flex: 1; min-width: 0; }
.gd-card__title {
  font-size: var(--gd-type-title-medium-size);
  font-weight: var(--gd-weight-bold);
  line-height: var(--gd-type-title-medium-line);
  color: var(--gd-color-on-surface);
  margin-bottom: 5px;
  letter-spacing: var(--gd-type-letter-spacing-wide);
}
.gd-card__subtitle {
  font-size: var(--gd-type-body-medium-size);
  color: var(--gd-color-on-surface-variant);
  line-height: 1.65;
  font-weight: var(--gd-weight-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.65em * 2);
}
.gd-card__tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

/* 主站卡片按钮 */
.gd-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
}
.gd-card__actions .gd-button--detail,
.gd-card__actions .gd-button--link {
  flex: 1 1 0;
  width: auto;
  min-width: 0;
}
.gd-card__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 0;
  border-radius: 12px;
  border: none;
  font-family: var(--gd-font-sans);
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  color: var(--gd-color-on-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.gd-card__btn--detail {
  background: linear-gradient(135deg, var(--gd-gradient-primary-a), var(--gd-gradient-primary-b));
  box-shadow: none;
}
.gd-card__btn--detail:hover {
  background: linear-gradient(135deg, var(--gd-gradient-primary-hover-a), var(--gd-gradient-primary-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-card__btn--link {
  background: linear-gradient(135deg, var(--gd-gradient-pink-a), var(--gd-gradient-pink-b));
  box-shadow: none;
}
.gd-card__btn--link:hover {
  background: linear-gradient(135deg, var(--gd-gradient-pink-hover-a), var(--gd-gradient-pink-hover-b));
  filter: brightness(1.06);
  transform: none;
}
.gd-card__btn:focus-visible {
  outline: 2px solid var(--gd-color-primary);
  outline-offset: 2px;
}
.gd-card__btn.is-disabled {
  opacity: 0.3;
  pointer-events: none;
  cursor: not-allowed;
  box-shadow: none;
}

/* 友链 */
.gd-card--friend { width: auto; height: auto; max-width: 320px; }
.gd-card--friend .gd-card__icon { width: 50px; height: 50px; }
.gd-card--friend .gd-card__subtitle { min-height: 0; }
.gd-friend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 320px));
  gap: 18px;
  justify-content: start;
}

/* 殿堂 / 圣器殿堂 item-card */
.gd-card--item {
  --gd-comp-item-color: #fbbf24;
  --gd-comp-item-color-light: #fcd34d;
  --gd-comp-item-color-rgb: 251, 191, 36;
  gap: 10px;
  width: auto;
  height: auto;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(var(--gd-color-white-rgb), 0.035);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.08);
  box-shadow: none;
  transform: none;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  transition:
    background 0.2s var(--gd-motion-easing-standard),
    border-color 0.2s var(--gd-motion-easing-standard);
}
.gd-card--item--demonic {
  --gd-comp-item-color: #ef4444;
  --gd-comp-item-color-light: #fca5a5;
  --gd-comp-item-color-rgb: 239, 68, 68;
}
.gd-card--item--immortal {
  --gd-comp-item-color: #10b981;
  --gd-comp-item-color-light: #6ee7b7;
  --gd-comp-item-color-rgb: 16, 185, 129;
}
.gd-card--item:hover {
  background: rgba(var(--gd-color-white-rgb), 0.05);
  border-color: rgba(var(--gd-comp-item-color-rgb), 0.28);
  box-shadow: none;
  transform: none;
}
.gd-card--item .gd-card__item-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
  width: 100%;
}
.gd-card--item .gd-card__num {
  min-width: 28px;
  padding-top: 4px;
  text-align: center;
  font-weight: var(--gd-weight-bold);
  font-variant-numeric: tabular-nums;
  font-size: var(--gd-type-title-small-size);
  line-height: 1.4;
  flex-shrink: 0;
  color: var(--gd-comp-item-color);
}
.gd-card--item .gd-card__item-body {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 10px;
  align-items: start;
}
.gd-card--item .gd-card__item-name {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
}
.gd-card--item .gd-card__name-main {
  display: block;
  min-width: 0;
  color: var(--gd-color-on-surface);
  font-weight: var(--gd-weight-semibold);
  font-size: var(--gd-type-title-small-size);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gd-card--item .gd-card__name-sub {
  display: block;
  margin-top: 3px;
  color: var(--gd-color-on-surface-subtle);
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-regular);
  line-height: 1.45;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.gd-card--item .gd-card__item-actions {
  display: contents;
}
.gd-card--item .gd-card__action-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
.gd-card--item .gd-card__action-group--primary {
  grid-column: 2;
  grid-row: 1;
  align-self: center;
}
.gd-card--item .gd-card__action-group--ext {
  grid-column: 1 / -1;
  grid-row: 2;
  width: 100%;
}
.gd-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-semibold);
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: background 0.2s var(--gd-motion-easing-standard), border-color 0.2s var(--gd-motion-easing-standard), color 0.2s var(--gd-motion-easing-standard), transform 0.15s var(--gd-motion-easing-standard);
}
.gd-card__action:hover { filter: brightness(1.1); transform: none; }
.gd-card__action:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-card__action--site {
  background: rgba(var(--gd-color-sky-blue-rgb), 0.16);
  border-color: rgba(var(--gd-color-sky-blue-rgb), 0.42);
  color: var(--gd-tag-2-fg);
}
.gd-card__action--site:hover { background: rgba(var(--gd-color-sky-blue-rgb), 0.26); color: var(--gd-color-link-hover); }
.gd-card__action--detail {
  background: rgba(var(--gd-color-white-rgb), 0.07);
  border-color: rgba(var(--gd-color-white-rgb), 0.2);
  color: rgba(var(--gd-color-muted-white-rgb), 0.96);
}
.gd-card__action--detail:hover { background: rgba(var(--gd-color-white-rgb), 0.12); border-color: rgba(255, 255, 255, 0.28); }
.gd-card__action--ext {
  background: rgba(var(--gd-comp-item-color-rgb), 0.12);
  border-color: rgba(var(--gd-comp-item-color-rgb), 0.36);
  color: var(--gd-comp-item-color-light);
}
.gd-card__action--ext:hover { filter: brightness(1.1); }

/* 桌面端（≥769px）：条目卡变横排，外链组用左分隔线 */
@media (min-width: 769px) {
  .gd-card--item { flex-direction: row; align-items: center; padding: 16px 18px; gap: 16px; }
  .gd-card--item .gd-card__item-main { flex: 1; align-items: center; }
  .gd-card--item .gd-card__num { padding-top: 0; }
  .gd-card--item .gd-card__item-body {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .gd-card--item .gd-card__item-name { flex: 1; min-width: 0; }
  .gd-card--item .gd-card__item-actions {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    gap: 0;
  }
  .gd-card--item .gd-card__action-group--primary { grid-column: auto; grid-row: auto; align-self: center; }
  .gd-card--item .gd-card__action-group--ext {
    grid-column: auto;
    grid-row: auto;
    width: auto;
    flex-shrink: 0;
    margin-left: 14px;
    padding-left: 14px;
    border-left: 1px solid rgba(var(--gd-color-white-rgb), 0.1);
  }
  .gd-card--item .gd-card__name-main { font-size: var(--gd-type-body-large-size); }
}

/* 窄屏（≤768px）：紧凑数值与按钮热区 */
@media (max-width: 768px) {
  .gd-card--item { padding: 12px; }
  .gd-card--item .gd-card__num { min-width: 24px; font-size: var(--gd-type-label-large-size); }
  .gd-card--item .gd-card__name-main { font-size: var(--gd-type-label-large-size); }
  .gd-card__action { min-height: 32px; padding: 0 9px; }
}

/* 主站大卡（≤640px）：宽度自适应 */
@media (max-width: 640px) {
  .gd-card { width: 100%; }
}

.gd-item-list {
  display: grid;
  gap: 10px;
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .gd-card,
  .gd-card__btn,
  .gd-card__action,
  .gd-tag { transition: none; }
  .gd-card__btn:hover,
  .gd-card__action:hover,
  .gd-tag:hover { transform: none; }
}

/* ===== src/display/empty-state/gd-empty-state.css ===== */
.gd-empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--gd-color-on-surface-variant);
}
.gd-empty-state__icon {
  font-size: var(--gd-type-display-medium-size);
  line-height: 1;
  margin-bottom: 16px;
  opacity: 0.85;
}
.gd-empty-state__title {
  margin: 0 0 8px;
  font-size: var(--gd-type-title-large-size);
  font-weight: var(--gd-weight-bold);
  color: var(--gd-color-on-surface);
}
.gd-empty-state__desc {
  margin: 0 0 20px;
  font-size: var(--gd-type-body-medium-size);
  line-height: 1.7;
}
.gd-empty-state__actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ===== src/foundation/layout/gd-footer.css ===== */
.gd-footer {
  text-align: center;
  padding: 28px 16px 40px;
  color: rgba(var(--gd-color-muted-white-rgb), 0.62);
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-regular);
  line-height: 1.7;
  letter-spacing: var(--gd-type-letter-spacing-normal);
  font-family: var(--gd-font-sans);
}
.gd-footer__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px 0;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}
.gd-footer__nav a {
  color: rgba(var(--gd-color-muted-white-rgb), 0.62);
  text-decoration: none;
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-medium);
  line-height: 1.5;
  padding: 4px 8px;
  min-height: 24px;
}
.gd-footer__nav a:hover { color: var(--gd-color-link-hover); }
.gd-footer__nav a:focus-visible { outline: 2px solid var(--gd-color-primary); outline-offset: 2px; }
.gd-footer__sep { color: rgba(var(--gd-color-muted-white-rgb), 0.28); user-select: none; font-size: var(--gd-type-label-medium-size); }
.gd-footer__copy { margin: 0; }


/* ===== 状态页特有样式 ===== */
.gd-groundback { z-index: 0; }
.gd-overview__shell { position: relative; z-index: 1; }
.gd-back-fab { position: fixed; top: max(12px, env(safe-area-inset-top, 0px)); left: max(12px, env(safe-area-inset-left, 0px)); z-index: 50; }
.gd-overview__content .gd-brand__title { margin-top: 56px; }
.gd-overview__content h2 { scroll-margin-top: 90px; }

/* —— 仪表盘：三张统计卡 —— */
.status-dashboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 4px 0 0;
}
.status-stat {
  padding: 22px 20px 20px;
  border-radius: var(--gd-shape-corner-medium);
  border: 1px solid var(--gd-glass-border);
  background: var(--gd-glass-bg);
  overflow: hidden;
}
.status-stat__label {
  display: block;
  margin: 0 0 8px;
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  color: var(--gd-color-on-surface-variant);
  text-transform: uppercase;
}
.status-stat__value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: clamp(26px, 4.5vw, 40px);
  font-weight: var(--gd-weight-extrabold);
  line-height: 1.15;
  color: var(--gd-color-on-surface);
  letter-spacing: var(--gd-type-letter-spacing-tight);
}
.status-stat__unit {
  font-size: var(--gd-type-body-medium-size);
  font-weight: var(--gd-weight-medium);
  color: var(--gd-color-on-surface-variant);
  letter-spacing: var(--gd-type-letter-spacing-normal);
}
.status-stat--ok .status-stat__value { color: var(--gd-color-green-light); }
.status-stat--bad .status-stat__value { color: var(--gd-color-error-light); }

/* —— 服务状态列表 —— */
.status-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: var(--gd-shape-corner-small);
  border: 1px solid rgba(var(--gd-color-white-rgb), 0.08);
  background: rgba(var(--gd-color-white-rgb), 0.02);
}
.status-item__icon {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1.2;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.35));
}
.status-item__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--gd-type-title-small-size);
  font-weight: var(--gd-weight-semibold);
  color: var(--gd-color-on-surface);
  text-decoration: none;
}
.status-item__name:hover { color: var(--gd-color-link-hover); }
.status-item__url {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--gd-type-note-size);
  color: var(--gd-color-on-surface-variant);
}
.status-item__ms {
  flex-shrink: 0;
  font-size: var(--gd-type-note-size);
  font-weight: var(--gd-weight-medium);
  color: var(--gd-color-on-surface-variant);
  font-variant-numeric: tabular-nums;
}
.status-item__state {
  flex-shrink: 0;
  min-width: 56px;
  text-align: center;
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
}
.status-item__state--ok { color: var(--gd-color-green-light); }
.status-item__state--bad { color: var(--gd-color-error-light); }
.status-item__spacer { flex: 1; }

/* —— 最近事件 —— */
.status-events {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.status-event {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 12px 16px;
  border-radius: var(--gd-shape-corner-small);
  border: 1px dashed rgba(var(--gd-color-grey-rgb), 0.45);
  background: rgba(var(--gd-color-white-rgb), 0.02);
}
.status-event__time {
  flex-shrink: 0;
  font-size: var(--gd-type-label-medium-size);
  font-weight: var(--gd-weight-semibold);
  letter-spacing: var(--gd-type-letter-spacing-wide);
  color: var(--gd-color-gold);
  font-variant-numeric: tabular-nums;
}
.status-event__text {
  font-size: var(--gd-type-body-medium-size);
  line-height: 1.6;
  color: var(--gd-color-on-surface);
  word-break: break-all;
}

.gd-overview__content .gd-footer { padding-top: 32px; }

/* 公告 */
.status-notice__content {
  padding: 16px 20px;
  border-radius: var(--gd-shape-corner-small);
  border: 1px solid rgba(var(--gd-color-primary-rgb), 0.15);
  background: rgba(var(--gd-color-primary-rgb), 0.06);
  color: var(--gd-color-on-surface);
  font-size: var(--gd-type-body-medium-size);
  line-height: 1.7;
  word-break: break-word;
}
.status-notice__content a {
  color: var(--gd-color-link);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.status-notice__content a:hover { color: var(--gd-color-link-hover); }
.status-notice__time {
  display: block;
  margin-top: 10px;
  font-size: var(--gd-type-label-medium-size);
  color: var(--gd-color-on-surface-variant);
}

@media (max-width: 720px) {
  .status-dashboard { grid-template-columns: 1fr; }
  .status-item { flex-wrap: wrap; gap: 8px 12px; }
  .status-item__url { flex-basis: 100%; order: 4; }
  .status-item__state { margin-left: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .status-item__icon { transition: none; }
}

</style>
</head>
<body class="gd-overview">
<a class="gd-skip-link" href="#dashboard">跳到主要内容</a>
<div class="gd-groundback gd-groundback--blue" aria-hidden="true"></div>
<a class="gd-button gd-button--back gd-back-fab" href="https://example.com/nav/" aria-label="返回主站">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  返回主站
</a>
<div class="gd-overview__shell">
  <div class="gd-overview__layout">
    <div class="gd-overview__content">
      <div class="gd-overview-toc-mobile" data-extend-ui-toc>
        <button type="button" class="gd-overview-toc-mobile__btn gd-hamburger-motion" data-extend-ui-toc-toggle aria-expanded="false" aria-controls="statusTocPanel" aria-label="打开本页索引">
          <svg class="gd-hamburger-motion__menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          <svg class="gd-hamburger-motion__close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div class="gd-overview-toc-mobile__panel" id="statusTocPanel" data-extend-ui-toc-panel aria-hidden="true" hidden>
          <p class="gd-overview-mobile-list__label">本页内容</p>
          <nav class="gd-overview-mobile-list" aria-label="本页索引">
            <a class="gd-overview-mobile-list__link" href="#dashboard">仪表盘</a>
            <a class="gd-overview-mobile-list__link" href="#services">服务状态</a>
            <a class="gd-overview-mobile-list__link" href="#events">最近事件</a>
            <a class="gd-overview-mobile-list__link" href="#notice">公告</a>
          </nav>
        </div>
      </div>
      <h1 class="gd-brand__title gd-brand__title--shift gd-brand__title--demo">站点状态（beta）</h1>
      <p class="gd-overview__lede">GALNAVI 站点运行状态仪表盘：稳定运行天数、累计访问、服务可用性与最近事件。</p>
      <div class="gd-overview__meta">
        <span class="gd-overview__tag">仪表盘</span>
        <span class="gd-overview__tag">服务状态</span>
        <span class="gd-overview__tag">最近事件</span>
      </div>
      <div class="gd-overview__rule" aria-hidden="true"></div>
      <!-- ===== 仪表盘 ===== -->
      <section class="gd-section" id="dashboard" aria-labelledby="dashboardTitle">
        <h2 class="gd-section__title" id="dashboardTitle">仪表盘（最后更新时间：<time id="dashUpdateTime">--</time>）</h2>
        <div class="status-dashboard" id="statusDashboard">
          <div class="status-stat" id="statUptime">
            <span class="status-stat__label">连续稳定运行</span>
            <div class="status-stat__value" id="uptimeValue"><span id="uptimeNum">--</span><span class="status-stat__unit">天</span></div>
          </div>
          <div class="status-stat" id="statVisits">
            <span class="status-stat__label">累计访问（总请求量）</span>
            <div class="status-stat__value" id="visitsValue"><span id="visitsNum">--</span></div>
          </div>
          <div class="status-stat" id="statState">
            <span class="status-stat__label">当前状态</span>
            <div class="status-stat__value" id="stateValue">检测中</div>
          </div>
        </div>
      </section>
      <!-- ===== 服务状态 ===== -->
      <section class="gd-section" id="services" aria-labelledby="servicesTitle">
        <h2 class="gd-section__title" id="servicesTitle">服务状态（最后更新时间：<time id="svcUpdateTime">--</time>）</h2>
        <ul class="status-list" id="statusList" role="list" aria-label="服务状态列表"></ul>
      </section>
      <!-- ===== 最近事件 ===== -->
      <section class="gd-section" id="events" aria-labelledby="eventsTitle">
        <h2 class="gd-section__title" id="eventsTitle">最近事件</h2>
        <p class="gd-overview__lede">同一服务短时间内连续三次异常时自动记录。</p>
        <ul class="status-events" id="eventList"></ul>
        <div class="gd-empty-state" id="eventEmpty" hidden><div class="gd-empty-state__icon" aria-hidden="true">✓</div><p class="gd-empty-state__title">暂无事件记录</p><p class="gd-empty-state__desc">一切正常运行</p></div>
      </section>
      <!-- ===== 公告 ===== -->
      <section class="gd-section" id="notice" aria-labelledby="noticeTitle">
        <h2 class="gd-section__title" id="noticeTitle">公告</h2>
        <div class="status-notice" id="noticeContent" aria-live="polite">
          <div class="gd-empty-state" id="noticeEmpty"><div class="gd-empty-state__icon" aria-hidden="true">📢</div><p class="gd-empty-state__title">暂无公告</p></div>
        </div>
      </section>
      
      <footer class="gd-footer gd-footer--page" role="contentinfo">
        <nav class="gd-footer__nav" aria-label="页脚导航">
          <a href="https://example.com/sitemap.xml">sitemap.xml</a><span class="gd-footer__sep" aria-hidden="true">|</span>
          <a href="https://example.com/robots.txt">robots.txt</a><span class="gd-footer__sep" aria-hidden="true">|</span>
          <a href="mailto:contact@example.com">联系站长</a><span class="gd-footer__sep" aria-hidden="true">|</span>
          <a href="https://example.com/nav/donate/">赞助本站</a><span class="gd-footer__sep" aria-hidden="true">|</span>
          <a href="https://example.com/nav/friend/">申请友链</a><span class="gd-footer__sep" aria-hidden="true">|</span>
          <a href="https://example.com/status/" aria-current="page">站点状态</a>
        </nav>
        <p class="gd-footer__copy">&copy; 2026 GALNAVI · 愿每一次探索都有新的收获</p>
      </footer>
    </div>
    <aside class="gd-overview__toc" aria-label="本页内容">
      <nav class="gd-otp" aria-label="本页索引">
        <p class="gd-otp__label">本页内容</p>
        <div class="gd-otp__list">
          <a class="gd-otp__link" href="#dashboard">仪表盘</a>
          <a class="gd-otp__link" href="#services">服务状态</a>
          <a class="gd-otp__link" href="#events">最近事件</a>
          <a class="gd-otp__link" href="#notice">公告</a>
        </div>
      </nav>
    </aside>
  </div>
</div>
<script>
(function() {
var root = document.querySelector('.gd-overview-toc-mobile');
var btn = root && root.querySelector('[data-extend-ui-toc-toggle]');
var panel = root && root.querySelector('[data-extend-ui-toc-panel]');
function setOpen(open) {
if (!root || !btn || !panel) return;
root.classList.toggle('is-open', open);
btn.setAttribute('aria-expanded', open ? 'true' : 'false');
btn.setAttribute('aria-label', open ? '关闭本页索引' : '打开本页索引');
panel.setAttribute('aria-hidden', String(!open));
if (!open) panel.setAttribute('hidden', '');
else panel.removeAttribute('hidden');
}
if (btn && panel) {
btn.addEventListener('click', function(e) { e.stopPropagation(); setOpen(!root.classList.contains('is-open')); });
document.addEventListener('click', function(e) {
if (root.classList.contains('is-open') && !root.contains(e.target)) setOpen(false);
});
}
var allLinks = Array.prototype.slice.call(document.querySelectorAll('.gd-otp__link[href^="#"], .gd-overview-mobile-list__link[href^="#"]'));
var sections = [];
allLinks.forEach(function(a) {
var id = a.getAttribute('href');
var el = id ? document.querySelector(id) : null;
if (el) sections.push({ link: a, el: el, id: id });
});
var activeId = null, clickLock = false, unlockTimer = null, ticking = false;
function setActive(id) {
if (!id || id === activeId) return;
activeId = id;
allLinks.forEach(function(a) { a.classList.toggle('is-active', a.getAttribute('href') === id); });
}
function pickFromScroll() {
if (!sections.length) return null;
var rootEl = document.documentElement;
var maxScroll = Math.max(0, rootEl.scrollHeight - window.innerHeight);
if (window.scrollY >= maxScroll - 24) return sections[sections.length - 1].id;
var marker = 120, current = sections[0].id;
for (var i = 0; i < sections.length; i++) {
if (sections[i].el.getBoundingClientRect().top <= marker) current = sections[i].id;
}
return current;
}
function syncActive() { if (clickLock) return; var id = pickFromScroll(); if (id) setActive(id); }
function requestSync() {
if (ticking || clickLock) return;
ticking = true;
requestAnimationFrame(function() { ticking = false; syncActive(); });
}
function unlockAfterNav() {
clearTimeout(unlockTimer);
function release() { clearTimeout(unlockTimer); clickLock = false; syncActive(); }
if ('onscrollend' in window) window.addEventListener('scrollend', release, { once: true });
unlockTimer = setTimeout(release, 1000);
}
allLinks.forEach(function(a) {
a.addEventListener('click', function(e) {
var id = a.getAttribute('href');
var target = id ? document.querySelector(id) : null;
if (!target) return;
e.preventDefault();
clickLock = true;
clearTimeout(unlockTimer);
setActive(id);
if (window.innerWidth <= 767) setOpen(false);
try { history.replaceState(null, '', id); } catch (err) {}
target.scrollIntoView({ behavior: 'smooth', block: 'start' });
unlockAfterNav();
});
});
if (sections.length) {
var hash = window.location.hash;
if (hash && sections.some(function(s) { return s.id === hash; })) setActive(hash);
else syncActive();
window.addEventListener('scroll', requestSync, { passive: true });
window.addEventListener('resize', requestSync);
}
})();
<\/script>
</body>
</html>`;
