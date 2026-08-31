---
title: Cloudflare Worker
tags:
  - galnavi/technology
  - cloudflare
  - worker
  - edge
  - runtime
date: 2026-08-14
updated: 2026-09-01
type: concept
category: Technology
status: active
related:
  - "[[Worker 架构]]"
  - "[[部署流程]]"
  - "[[路由策略]]"
  - "[[Cloudflare R2]]"
---

# Cloudflare Worker

> [!abstract] Summary
> GALNAVI 运行在 Cloudflare Workers（V8 isolates），每个页面独立 Worker，通过 service binding 互联。

## Definition

| 特性 | 说明 |
|------|------|
| 运行时 | V8 isolates（非 Node.js） |
| 模块 | ES Module（`export default { fetch }`） |
| 部署 | Wrangler CLI（`wrangler deploy -c wrangler/<name>.toml`） |
| 绑定 | D1（SQL）、KV（键值）、R2（对象存储）、Service（跨 Worker 调用） |

## 共享模块边界

| 位置 | 运行环境 | 规则 |
|------|----------|------|
| `worker/shared/` | 参考副本 | 不打包进浏览器；**现网页不 import** |
| `src/` | Browser only | 不 import Worker 模块 |
| `worker/new/*.js` | Worker | 单文件零 import；安全头/常量/SEO 页内自带 |

`worker/shared/` 三个文件仍保留作对照：
- `constants.js` — 分类映射、允许列表
- `security.js` — 转义工具、安全头基线
- `seo.js` — meta/OG/JSON-LD 拼装

## 文件位置

- 页面 Worker：`worker/new/*.js`
- 共享模块：`worker/shared/`
- 静态资源：`worker/share/`（robots.txt / sitemap.xml）；图片在 [[Cloudflare R2]]

## Related

- [[Worker 架构]] — 单文件模式
- [[部署流程]] — Wrangler 配置
- [[安全头]] — CSP 基线
- [[Cloudflare R2]] — 图标与品牌图
