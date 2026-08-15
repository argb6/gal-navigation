---
type: concept
category: Technology
tags: [cloudflare, worker, edge, runtime]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[Worker 架构]], [[部署流程]], [[路由策略]]
---

# Cloudflare Worker

## Summary

GALNAVI 运行在 Cloudflare Workers（V8 isolates），每个页面独立 Worker，通过 service binding 互联。

## Definition

| 特性 | 说明 |
|------|------|
| 运行时 | V8 isolates（非 Node.js） |
| 模块 | ES Module（`export default { fetch }`） |
| 部署 | Wrangler CLI（`wrangler deploy -c wrangler/<name>.toml`） |
| 绑定 | D1（SQL）、KV（键值）、Service（跨 Worker 调用） |

## 共享模块边界

| 位置 | 运行环境 | 规则 |
|------|----------|------|
| `worker/shared/` | Worker only | 不打包进浏览器 |
| `src/` | Browser only | 不 import Worker 模块 |

`worker/shared/` 三个文件：
- `constants.js` — 分类映射、允许列表
- `security.js` — 转义工具、安全头基线
- `seo.js` — meta/OG/JSON-LD 拼装

## 文件位置

- 页面 Worker：`worker/new/*.js`
- 共享模块：`worker/shared/`
- 静态资源：`worker/share/`（robots.txt / sitemap.xml）

## Related

- [[Worker 架构]] — 单文件模式
- [[部署流程]] — Wrangler 配置
- [[安全头]] — CSP 基线
