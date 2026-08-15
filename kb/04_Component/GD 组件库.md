---
type: component
category: Component
tags: [gd, component-library, css, design-system]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[Design Token]], [[玻璃表面系统]], [[Web Component]], [[Decision-MD3 对齐口径]], [[Decision-玻璃拟态保留]]
---

# GD 组件库

## Summary

GalNavi Design（gd）是自研浏览器侧组件库，原生 CSS + CSS 变量 + 少量 Web Components，对齐 MD3 语义，保留 GALNAVI 玻璃皮肤。

## Definition

- 前缀：class 用 `gd-`，变量用 `--gd-`
- 架构：Light DOM（不使用 Shadow DOM）
- 运行时：浏览器侧，Worker 拼 HTML 时直接引用 gd-* class

## Architecture

| 分组 | 目录 | 组件 |
|------|------|------|
| foundation | `src/foundation/` | tokens, glass, button, link, brand, layout, footer, a11y |
| navigation | `src/navigation/` | navbar, search |
| display | `src/display/` | card, tag, badge, table, empty-state, hero-carousel |
| feedback | `src/feedback/` | modal, toast, tooltip, skeleton |
| extend | `src/extend/` | 按 Worker 页面归类的扩展样式 |
| runtime | `src/runtime/` | gd.js（自定义元素注册） |
| preview | `src/preview/` | 组件总览页 |

核心组件 14 类：card / tag / badge / skeleton / brand / empty-state / table / toast / tooltip / hero-carousel / modal / navbar / search / footer

## 命名约定

- Block：`gd-card`、`gd-button`、`gd-navbar`
- Element：`gd-card__title`、`gd-card__icon`
- Modifier：`gd-card--friend`、`gd-button--primary`
- State：`is-open`、`is-active`、`is-expanded`、`is-disabled`

## 禁止项

- 硬编码颜色（必须用 `--gd-*` token）
- 低对比透明浅字（用 `--gd-color-on-surface-subtle`）
- 卡片类 `backdrop-filter` / `box-shadow`
- `div onclick`（必须真实 `<button>` 或 `<a href>`）
- 无意义扫光动画

## Related

- [[Design Token]] — 变量系统
- [[玻璃表面系统]] — 玻璃分层
- [[Web Component]] — gd-modal / gd-navbar / gd-search
- 文件路径：`src/`
- 文档：`docs/README.md`
