---
type: concept
category: Index
tags: [MOC, galnavi, overview]
status: active
created: 2026-08-14
updated: 2026-08-14
---

# GALNAVI Knowledge Base

## Summary

GALNAVI 工程知识库。不是文档索引，是项目「为什么这样设计」和「怎么运作」的结构化知识。

## 产品

GALNAVI 是 ACG 二次元资源聚合导航站。9 个页面，单文件 Worker，玻璃拟态风格。

- [[项目概述]] — 站点是什么、技术栈、升级阶段

## 架构

为什么用 Cloudflare Workers？为什么单文件？为什么不用 Shadow DOM？

- [[Worker 架构]] — 单文件模式、CSS 内联、safeJson 序列化
- [[数据流]] — 三条路径：B-SSR / B-JSON / B-REST
- [[路由策略]] — catch-all + Service Binding + sitemap 动态发现
- [[Layer 分层设计]] — 六层模块化（api/database/service/render/security/utils）
- [[Decision-单文件 Worker]] — 为什么 CSS/JS 全内联
- [[Decision-Light DOM]] — 为什么不用 Shadow DOM

## GD 组件库

为什么建组件库？为什么对齐 MD3 但不换皮？玻璃为什么冻结？

- [[GD 组件库]] — 七组结构、14 核心组件、命名约定
- [[Design Token]] — 168+ 变量、RGB 通道模式、标签三色循环
- [[玻璃表面系统]] — 三级分层、冻结数值
- [[状态层模式]] — ::before 伪元素叠加、禁止垂直位移
- [[Web Component]] — gd-modal / gd-navbar / gd-search
- [[Decision-MD3 对齐口径]] — 对齐语义不换皮
- [[Decision-玻璃拟态保留]] — 品牌 identity

### 核心组件

| 组件 | 变体 | 关联决策 |
|------|------|----------|
| [[gd-button]] | primary / secondary / danger / ghost / wide / back | [[Decision-MD3 对齐口径]] |
| [[gd-card]] | 通用 / 友链 / 条目（殿堂三色） | [[Decision-玻璃拟态保留]] |
| [[gd-navbar]] | 顶栏 / 汉堡 / 抽屉 / 分类导航 | — |
| [[gd-search]] | toolbar / group（金色变体） | — |
| [[gd-modal]] | 年龄门 / 纳普 / 重定向 / 发布卡 | [[Decision-Light DOM]] |

## Worker

每个页面 Worker 做什么？数据从哪来？

- [[Cloudflare Worker]] — 运行时、模块边界、Service Binding

### 页面数据流

| 页面 | D1 查询 | KV 读取 | 特殊逻辑 |
|------|---------|---------|----------|
| 主站 | 全量站点 | 轮播图 + 推荐项 | 客户端搜索 |
| 详情 | 单站点（item_key） | — | Markdown 渲染 |
| 殿堂 | group1 分组 | — | 分类导航 |
| 友链 | 友链列表 | — | POST 提交 |
| 捐献 | — | 捐款名单 | — |
| 状态 | 站点 URL 列表 | 状态 + 缓存 + 公告 | CF API 集成 |

## 内部实现

数据表长什么样？KV 存什么格式？怎么部署？安全头怎么配？

- [[D1 数据库]] — 三张表结构 + SQL 查询
- [[KV 存储]] — 6 个 key + 格式 + 读取容错
- [[安全头]] — CSP 基线 + 合并规则
- [[Cookie 设计]] — 3 种 cookie + 1 种 sessionStorage
- [[部署流程]] — toml 配置 + 绑定对照
- [[沙盒开发]] — 本地 serve.mjs

## 决策记录

为什么这样设计？替代方案是什么？

- [[Decision-MD3 对齐口径]] — 语义对齐不换皮
- [[Decision-玻璃拟态保留]] — 品牌 identity 冻结数值
- [[Decision-单文件 Worker]] — 零外链 / 原子部署 / CSP 收紧
- [[Decision-Light DOM]] — Worker 兼容 / 样式统一

## 问题记录

遇到过什么问题？怎么解决的？

- [[Problem-公告注入布局错乱]] — replace 只替换开头标签导致 DOM 残留
- [[Problem-shenmo 命名混乱]] — 旧名残留导致认知负担
