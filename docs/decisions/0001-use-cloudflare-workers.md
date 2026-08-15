# ADR-0001: 使用 Cloudflare Workers 作为运行时

## 状态

已采纳

## 日期

2026-06

## 背景

需要选择一个服务端运行时来托管 ACG 导航站。候选方案：

- Cloudflare Workers（V8 isolates，边缘运行）
- Vercel Serverless Functions
- 自建 VPS + Node.js
- Cloudflare Pages（静态 + Functions）

## 决策

采用 Cloudflare Workers。

## 原因

1. **边缘运行**：全球 300+ 节点，中国访问延迟低
2. **D1 + KV 原生集成**：同一平台的数据库和键值存储，无需外部服务
3. **Service Binding**：Worker 之间可以直接调用，无需 HTTP 开销
4. **零冷启动**：V8 isolates 无传统 serverless 冷启动问题
5. **免费额度**：每日 10 万次请求对导航站足够
6. **Wrangler CLI**：本地开发 + 部署一体化

## 影响

- 所有页面必须适配 V8 isolates 运行环境（非 Node.js）
- 不能使用 Node.js 原生模块（fs、path 等）
- Worker 有 1MB 体积限制，需要 CSS 内联策略
- 需要学习 Wrangler 配置和 D1/KV 绑定机制

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| Vercel | 冷启动延迟，D1/KV 需外部服务 |
| 自建 VPS | 需要自管运维、SSL、CDN |
| Cloudflare Pages | Functions 限制多，不支持 Service Binding |
