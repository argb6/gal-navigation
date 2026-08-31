---
title: Worker 架构
tags:
  - galnavi/architecture
  - worker
  - cloudflare
  - single-file
  - ssr
date: 2026-08-14
updated: 2026-09-01
type: architecture
category: Architecture
status: active
related:
  - "[[GD 组件库]]"
  - "[[数据流]]"
  - "[[安全头]]"
  - "[[路由策略]]"
---

# Worker 架构

> [!abstract] Summary
> 每个 GALNAVI 页面是一个自包含的单文件 Cloudflare Worker，HTML/CSS/JS 全部字符串内联，零运行期外链资源。

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
| 主站 | `worker/new/websearch.js` |
| 详情 | `worker/new/detail.js` |
| 殿堂 | `worker/new/palace.js` |
| 关于 | `worker/new/about.js` |
| 帮助 | `worker/new/help.js` |
| 友链 | `worker/new/friend.js` |
| 捐赠 | `worker/new/donate.js` |
| 状态 | `worker/new/status.js` |
| 404 | `worker/new/error.js` |

`worker/new/*.js` **零 import**。`SECURITY_HEADERS`、分类常量、SEO 都是页内副本。`worker/shared/` 只作参考。

## Decision

选择单文件内联的原因：[[Decision-单文件 Worker]]

## Related

- [[Cloudflare Worker]] — 运行时环境
- [[安全头]] — CSP 基线
- [[Cloudflare Worker#共享模块边界]] — worker/shared/ 边界
