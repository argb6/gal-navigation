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
> 现网每个页面仍是一份内联 HTML/CSS/JS 的模块 Worker。开源仓 `gal-navigation` 多了 `worker/layer/`，入口文件还没 import。

对照仓库：现网在本工程 `worker/new/`；GitHub 在 `gal-navigation/worker/`（文件名相同，无 `new/`）。下文路径写现网，括号里是 GitHub。

## Definition

入口是模块 Worker：`export default { async fetch(request, env, ctx) }`。现网 `worker/new/*.js` **零 import**；查 D1/KV、拼页面、安全头都在同一文件。GitHub 的 `worker/*.js` 目前同样是单文件脱敏/阅读副本，没有 `import` layer。

选择单文件内联：[[Decision-单文件 Worker]]。运行时口径：[[Cloudflare Worker]]。

## 两棵目录

| | 现网（本仓库） | GitHub `gal-navigation` |
|--|----------------|-------------------------|
| 页面入口 | `worker/new/<page>.js` | `worker/<page>.js` |
| 对照源 | `worker/shared/`（现网页不引用） | `worker/shared/`（约定给 Worker / layer import） |
| 功能层 | **没有** `worker/layer/` | 有 `worker/layer/`（六层文件在，**入口未接入**） |
| 部署配置 | `wrangler/<name>.toml` | **没有** wrangler 目录 |
| 沙盒 | `sandbox/` | **没有** |

GitHub 的 layer 是从单文件抽出来的对照实现，SQL/KV 名称按现网抄（`navi_sites`、`HERO_KV` / `hero_images`、殿堂 `env.group1`）。把它当「现网已经分层」是错的。

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

`error.toml` 的 service binding：index / websearch / detail / about / help / palace / donate / friend。**没有 status**。`/status/` 走控制台绑在 status Worker 上，不经过这张表。

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

## 页面入口（现网）

| 页面 | 文件 |
|------|------|
| 首页 | `worker/new/index.js` |
| 主站 | `worker/new/websearch.js` |
| 详情 | `worker/new/detail.js` |
| 殿堂 | `worker/new/palace.js` |
| 关于 / 帮助 / 友链 / 捐献 / 状态 / 404 | 同目录对应文件 |

## Related

- [[Cloudflare Worker]] — 运行时模块与 shared 边界
- [[数据流]] — B-SSR / B-JSON
- [[存储]] — 绑定名与表
- [[安全头]] — CSP
- [[部署流程]] — toml
