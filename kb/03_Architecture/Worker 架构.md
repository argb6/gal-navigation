---
title: Worker 架构
aliases:
  - 路由策略
  - Layer 分层设计
tags:
  - galnavi/architecture
  - worker
  - cloudflare
  - single-file
  - routing
date: 2026-08-14
updated: 2026-09-01
type: architecture
category: Architecture
status: active
related:
  - "[[项目概述]]"
  - "[[Cloudflare Worker]]"
  - "[[数据流]]"
  - "[[存储]]"
  - "[[安全头]]"
  - "[[Decision-单文件 Worker]]"
---

# Worker 架构

> [!abstract] Summary
> 现网每个页面仍是一份内联 HTML/CSS/JS 的模块 Worker。**本仓**页面在 `worker/*.js`。`worker/layer/` 有分层对照，入口没有 import。

## Definition

入口是模块 Worker：`export default { async fetch(request, env, ctx) }`。本仓 `worker/*.js` **零 import**。`status.js` 仍是 β。

选择单文件内联：[[Decision-单文件 Worker]]。运行时口径：[[Cloudflare Worker]]。

## 本仓目录

| | 本仓 |
|--|------|
| 页面入口 | `worker/<page>.js` |
| 对照源 | `worker/shared/`（页面不引用） |
| 功能层 | `worker/layer/`（**入口未接入**） |
| 部署配置 | 无 wrangler |
| 沙盒 | 无 |

GitHub 的 layer 是从单文件抽出来的对照实现，SQL/KV 名称按现网抄。把它当「已经分层上线」是错的。

## 请求怎么走

控制台给各 Worker 配了路由。未匹配的打到 `error`，由它做 catch-all。

```
请求
  ├─ 控制台已绑到某页 Worker → 该页 fetch()
  └─ 其余 → error.js
        ├─ loadRoutes()：DEFAULT_ROUTES + 从 index 拉 sitemap.xml（5 分钟缓存）
        ├─ /nav/api/* → websearch
        ├─ 命中表 → env[service].fetch(request)（service binding）
        └─ 未命中 → 内联 404（noindex）
```

`error` 的 service binding：index / websearch / detail / about / help / palace / donate / friend。**没有 status**。`/status/` 单独绑 status Worker。

`DEFAULT_ROUTES`（与 GitHub `worker/layer/api/router.js` 一致）：

| 路径 | 目标 |
|------|------|
| `/`、`/robots.txt`、`/sitemap.xml`、`/favicon.ico` | index |
| `/nav/` | websearch |
| `/nav/detail/` `/about/` `/help/` `/palace/` `/donate/` `/friend/` | 对应页 |
| `/nav/api/*` | websearch |
| 其他 | 404 |

尾部斜杠 301 在各页自己处理。独立部署、独立回滚，所以不用 Pages Routes 一张总表。

页内：`fetch()` → 查绑定 → `renderPage()` 整页字符串 → `Response`。CSS 带来源注释 `/* ===== src/path/file.css ===== */`。数据用 `safeJson()` 打进 `<script>`（替换 `</`）。

## 开源仓 layer（未接入）

```
worker/layer/
├── api/        路由与端点（router 对照 error.js）
├── database/   D1 + KV
├── service/    搜索 / SEO / 缓存 / 站点检测
├── render/     HTML 与数据注入
├── security/   CSP / CORS / 转义 / NSFW cookie
└── utils/      JSON/HTML/重定向/404
```

单向：api → service → database。`shared/` 是常量/转义/SEO，layer 是功能。GitHub 入口若以后 import，也不得把 layer 打进浏览器。

## 页面入口（本仓）

| 页面 | 文件 |
|------|------|
| 首页 | `worker/index.js` |
| 主站 | `worker/websearch.js` |
| 详情 | `worker/detail.js` |
| 殿堂 | `worker/palace.js` |
| 关于 / 帮助 / 友链 / 捐献 / 404 | 同目录对应文件 |
| 状态 | `worker/status.js`（β） |

## Related

- [[Cloudflare Worker]] — 运行时模块与 shared 边界
- [[数据流]] — B-SSR / B-JSON
- [[存储]] — 绑定名与表
- [[安全头]] — CSP
- [[部署流程]] — toml
