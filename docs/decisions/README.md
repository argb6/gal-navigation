# Architecture Decision Records (ADR)

记录 GALNAVI 项目中的重大架构决策。每条记录包含「为什么」和「替代方案」，帮助新人和 AI 理解设计背后的思考。

## 索引

| ADR | 标题 | 状态 |
|-----|------|------|
| [0001](./0001-use-cloudflare-workers.md) | 使用 Cloudflare Workers 作为运行时 | 已采纳 |
| [0002](./0002-gd-design-system.md) | 创建 GD 组件库并对齐 Material Design 3 | 已采纳 |
| [0003](./0003-d1-schema.md) | D1 数据库表结构设计 | 已采纳 |
| [0004](./0004-single-file-worker.md) | 单文件 Worker 模式（CSS/JS 全内联） | 已采纳 |
| [0005](./0005-light-dom.md) | 使用 Light DOM（不用 Shadow DOM） | 已采纳 |
| [0006](./0006-glass-preservation.md) | 保留玻璃拟态视觉风格 | 已采纳 |
| [0007](./0007-kv-storage-strategy.md) | KV 存储策略（轮播图/推荐/捐款/状态/公告） | 已采纳 |
| [0008](./0008-routing-strategy.md) | 路由策略（error.js catch-all + Service Binding） | 已采纳 |
| [0009](./0009-css-inline-build.md) | CSS 内联构建流程 | 已采纳 |

## 格式

每条 ADR 遵循标准格式：

```
# ADR-XXXX: 标题

## 状态
已采纳 / 已废弃 / 替代

## 日期
YYYY-MM

## 背景
为什么需要做这个决策

## 决策
选择了什么方案

## 原因
为什么选择这个方案

## 影响
对项目有什么影响

## 替代方案
考虑过但否决的方案及原因
```
