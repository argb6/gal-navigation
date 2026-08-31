---
title: GD 组件库
tags:
  - galnavi/component
  - gd
  - component-library
  - css
  - design-system
date: 2026-08-14
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[Design Token]]"
  - "[[玻璃表面系统]]"
  - "[[Web Component]]"
  - "[[Decision-MD3 对齐口径]]"
  - "[[Decision-玻璃拟态保留]]"
  - "[[gd-groundback]]"
  - "[[gd-filter-bar]]"
  - "[[gd-hero]]"
---

# GD 组件库

> [!abstract] Summary
> GalNavi Design（gd）是自研浏览器侧组件库，原生 CSS + CSS 变量 + 少量 Web Components，对齐 MD3 语义，保留 GALNAVI 玻璃皮肤。当前版本 v1.4.0。

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
| extend | `src/extend/` | 按 Worker 页面归类（websearch 两框快捷栏、detail 反向缩放、palace 条目卡） |
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
- 卡片类 `backdrop-filter` / `box-shadow`（装饰线条可用 `filter: blur(10.8px)`）
- `div onclick`（必须真实 `<button>` 或 `<a href>`）
- 无意义扫光动画

## Related

- [[Design Token]] — 变量系统
- [[玻璃表面系统]] — 玻璃分层
- [[Web Component]] — gd-modal / gd-navbar / gd-search
- 文件路径：`src/`
- 文档：`docs/README.md`（当前 v1.4.0）
- 预览：`src/preview/index.html`
- [[gd-groundback]] — 全站线条底 / 殿堂金晕
- [[gd-filter-bar]] — 首页两框快捷栏
- [[gd-hero]] — 轮播骨架首屏
- [[gd-card]] — 条目卡必须 auto 尺寸
