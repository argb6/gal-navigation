/**
 * 业务逻辑层 — 站点服务
 * 站点状态检测、事件记录
 */

const EVENT_THRESHOLD = 3;
const EVENT_WINDOW_MS = 10 * 60 * 1000;
const EVENT_COOLDOWN_MS = 60 * 60 * 1000;
const MAX_EVENTS = 20;

const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

function pad2(n) { return String(n).padStart(2, "0"); }

function formatEventTime(ts) {
  const d = new Date(ts + BEIJING_OFFSET_MS);
  return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate()) + " " + pad2(d.getUTCHours()) + "-" + pad2(d.getUTCMinutes());
}

/** 检测单个站点可达性 */
export async function checkOneSite(url, timeoutMs = 8000) {
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

/** 批量检测站点状态 */
export async function checkAllSites(services) {
  const results = await Promise.all(services.map(s => checkOneSite(s.url)));
  return services.map((s, i) => ({ ...s, ...results[i] }));
}

/** 记录异常事件（连续 3 次异常 → 生成事件） */
export function recordEvents(results, state) {
  const now = Date.now();
  if (!state.uptimeStart) state.uptimeStart = now;
  const newEvents = [];

  for (const r of results) {
    const key = r.url;
    if (r.ok) {
      state.failCounts[key] = null;
      continue;
    }
    const rec = state.failCounts[key] || { count: 0, firstAt: now };
    rec.count += 1;
    if (rec.count === 1) rec.firstAt = now;
    state.failCounts[key] = rec;

    const last = state.lastEventAt[key] || 0;
    if (
      rec.count >= EVENT_THRESHOLD &&
      now - rec.firstAt <= EVENT_WINDOW_MS &&
      now - last >= EVENT_COOLDOWN_MS
    ) {
      const ev = { ts: now, time: formatEventTime(now), text: r.name + " 服务异常事件" };
      state.events.unshift(ev);
      if (state.events.length > MAX_EVENTS) state.events.length = MAX_EVENTS;
      state.lastEventAt[key] = now;
      state.failCounts[key] = null;
      newEvents.push(ev);
    }
  }
  return newEvents;
}

/** 计算稳定运行天数 */
export function calcUptimeDays(baseDate) {
  const now = Date.now();
  const baseTs = Date.parse(baseDate + "T00:00:00Z");
  return Math.max(0, Math.floor((now - baseTs) / 86400000));
}

/** 站点状态汇总 */
export function summarizeStatus(checked) {
  const downCount = checked.filter(c => !c.ok).length;
  const allUp = downCount === 0;
  return {
    downCount,
    allUp,
    stateLabel: allUp ? "运行正常" : downCount === checked.length ? "服务中断" : "部分异常",
    stateClass: allUp ? "ok" : "bad",
  };
}
