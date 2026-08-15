---
type: architecture
category: Architecture
tags: [layer, module, separation, worker]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[Worker 架构]], [[数据流]], [[Decision-单文件 Worker]]
---

# Layer 分层设计

## Summary

Worker 功能层设计：将单文件 Worker 中的可复用逻辑提取为 6 层模块，解决文件过重问题。

## 背景

单文件 Worker（如 websearch.js 215KB）承担太多职责：路由、数据查询、业务逻辑、HTML 渲染、安全头、工具函数。维护和复用困难。

## 分层结构

```
worker/layer/
├── api/           API 接口层（路由 + 端点处理）
├── database/      数据访问层（D1 + KV 查询封装）
├── service/       业务逻辑层（搜索/SEO/缓存/站点检测）
├── render/        页面渲染层（HTML 拼装 + 数据注入）
├── security/      安全层（CSP + CORS + 转义 + 验证）
└── utils/         工具函数（响应构建 + 格式化）
```

## 各层职责

| 层 | 职责 | 依赖 |
|----|------|------|
| api | URL 路由、端点处理、Service Binding 调度 | service, database |
| database | D1 SQL 查询、KV 读写、Repository 模式 | shared/constants |
| service | 搜索/过滤、SEO 拼装、缓存策略、站点检测 | database |
| render | safeJson、HTML 文档构建、数据注入 | — |
| security | CSP 构建、CORS、HTML 转义、首访验证 | shared/config |
| utils | 响应构建（JSON/HTML/重定向/404）、格式化 | — |

## 设计原则

1. **单向依赖**：api → service → database；security/utils 无依赖
2. **不替代入口文件**：layer 是可复用模块，入口 Worker 仍负责组装和返回 Response
3. **与 shared/ 的关系**：shared/ 是全局配置（域名/常量），layer/ 是功能逻辑
4. **渐进迁移**：当前入口文件仍为单文件，layer 作为提取目标逐步接入

## 现状

| 入口文件 | 体积 | 可提取层 |
|----------|------|----------|
| websearch.js | 215 KB | api/search + service/search + database/d1 + database/kv |
| palace.js | 87 KB | database/d1（group1） |
| status.js | 87 KB | api/status + service/site + database/kv |
| friend.js | 67 KB | api/friend + database/d1 |
| detail.js | 52 KB | api/detail + database/d1 |

## Related

- [[Worker 架构]] — 单文件模式
- [[数据流]] — 三条数据路径
- [[Decision-单文件 Worker]] — 为什么选择单文件
