---
type: architecture
category: Architecture
tags: [worker, cloudflare, single-file, ssr]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[GD 组件库]], [[数据流]], [[安全头]], [[路由策略]]
---

# Worker 架构

## Summary

每个 GALNAVI 页面是一个自包含的单文件 Cloudflare Worker，HTML/CSS/JS 全部字符串内联，零运行期外链资源。

## Definition

Worker 导出 `fetch(request, env, ctx)` 处理函数。页面数据从 D1/KV 绑定获取，经 `safeJson()` 序列化后注入 `<script>` 变量，返回完整 HTML 文档。

## Architecture

```
请求 → error.js（路由分发）
  ├─ /          → [service binding: index]     → index.js
  ├─ /nav/      → [service binding: websearch] → websearch.js
  ├─ /nav/palace/ → [service binding: palace]  → palace.js
  └─ *          → 404（内联 HTML）

Worker 内部：
  fetch() → 查询 D1/KV → renderPage(data) → Response(html, headers)
```

## Implementation

- `renderPage()` 返回模板字符串，包含 `<!DOCTYPE html>` 到 `</html>`
- CSS 从 `src/` 各组件文件拼接，以 `/* ===== src/path/file.css ===== */` 注释标记来源
- 客户端 JS 通过 `safeJson()` 注入数据：`var NAV_DATA = [...];`
- `safeJson()` 防 XSS：`JSON.stringify(obj).replace(/<\//g, '<\\/')`

## 文件位置

| 页面 | Worker 文件 |
|------|------------|
| 首页 | `worker/new/index.js` |
| 主站 | `worker/new/websearch.js`（~6464 行） |
| 殿堂 | `worker/new/palace.js` |
| 关于 | `worker/new/about.js` |
| 帮助 | `worker/new/help.js` |
| 友链 | `worker/new/friend.js` |
| 捐赠 | `worker/new/donate.js` |
| 状态 | `sandbox/status-sandbox/status.js` |
| 404 | `worker/new/error.js` |

## Decision

选择单文件内联的原因：[[Decision-单文件 Worker]]

## Related

- [[Cloudflare Worker]] — 运行时环境
- [[安全头]] — CSP 基线
- [[共享模块]] — worker/shared/ 边界
