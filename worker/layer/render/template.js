/**
 * 页面渲染层 — 模板引擎
 * 数据注入、页面壳层构建
 */

import { safeJson } from "./html.js";

/** 将数据注入到 HTML 模板中 */
export function injectData(html, dataMap) {
  let result = html;
  for (const [placeholder, value] of Object.entries(dataMap)) {
    result = result.replace(placeholder, typeof value === "string" ? value : safeJson(value));
  }
  return result;
}

/** 构建数据注入脚本块 */
export function dataScript(vars) {
  return Object.entries(vars)
    .map(([name, value]) => `<script>var ${name} = ${safeJson(value)};</script>`)
    .join("\n");
}
