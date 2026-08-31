---
title: Decision-单文件 Worker
tags:
  - galnavi/decision
  - worker
  - single-file
  - inline
  - css
  - architecture
date: 2026-08-14
updated: 2026-09-01
type: decision
category: Decision
status: active
related:
  - "[[Worker 架构]]"
  - "[[Cloudflare Worker]]"
---

# Decision-单文件 Worker

## 时间

2026-06（项目初始架构）

## 背景

Cloudflare Workers 支持 ES Module 和字符串返回两种模式。页面需要内联 CSS 和 JS。

> [!info] 方案
> 每个页面 Worker 为单个 JS 文件，HTML/CSS/JS 全部字符串内联，零运行期外链。

> [!tip] 原因
> **零网络请求**：页面加载不需要额外 CSS/JS 文件请求
> **原子部署**：单文件部署，回滚简单
> **CSP 收紧**：`connect-src 'self'`，无外部资源加载
> **缓存控制**：`Cache-Control: private, no-store`，每次获取最新版本

## 影响

- 文件体积大（websearch.js 约 4300 行）
- CSS 更新需要重新内联到所有页面 Worker
- 构建脚本负责从 `src/` 拼接 CSS 到 Worker

## 替代方案

1. **Cloudflare Pages + 静态文件** — 被否决（需要 D1/KV 绑定，Pages Functions 限制多）
2. **外部 CSS 文件 + CDN** — 被否决（增加网络请求，CSP 放宽）
3. **Worker 内 fetch 静态资源** — 被否决（增加延迟，缓存复杂）

## Related

- [[Worker 架构]] — 实现细节
- [[安全头]] — CSP 基线
