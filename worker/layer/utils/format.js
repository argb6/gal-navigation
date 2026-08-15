/**
 * 工具函数 — 格式化
 * 日期、数字、字符串格式化工具
 */

/** 两位数补零 */
export function pad2(n) {
  return String(n).padStart(2, "0");
}

/** 北京时间格式化（yyyy-mm-dd hh:mm） */
export function formatBeijingTime(ts) {
  const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;
  const d = new Date(ts + BEIJING_OFFSET_MS);
  return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate()) + " " + pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes());
}

/** 数字本地化格式（千分位） */
export function formatNumber(n, locale = "zh-CN") {
  if (n == null) return "--";
  return n.toLocaleString(locale);
}

/** 截断字符串 */
export function truncate(str, maxLen = 100) {
  if (!str || str.length <= maxLen) return str || "";
  return str.slice(0, maxLen) + "…";
}
