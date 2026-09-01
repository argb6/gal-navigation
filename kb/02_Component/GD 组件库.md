---
title: GD 组件库
aliases:
  - 组件库
  - gd
tags:
  - galnavi/component
  - gd
  - component-library
  - moc
date: 2026-08-14
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[Design Token]]"
  - "[[玻璃表面系统]]"
  - "[[状态层模式]]"
  - "[[Web Component]]"
  - "[[Decision-MD3 对齐口径]]"
  - "[[Decision-玻璃拟态保留]]"
  - "[[记录索引]]"
---

# GD 组件库

> [!abstract] Summary
> GalNavi Design（gd）入口。本篇只讲结构和红线。变量 / 玻璃 / 状态层 / 自定义元素在 `体系/`；一篇一组件在 `组件/`。当前 v1.5.2。

## 怎么读

`02_Component` 根上只留这一篇。

| 文件夹 | 放什么 | 笔记 |
|--------|--------|------|
| 本篇 | 七组结构、命名、禁止项 | [[GD 组件库]] |
| `体系/` | 全库共用的规则，不是某个 class | [[Design Token]] · [[玻璃表面系统]] · [[状态层模式]] · [[Web Component]] |
| `组件/` | 现网还在用的 `gd-*`，一篇一事 | [[gd-navbar]] [[gd-search]] [[gd-button]] [[gd-card]] [[gd-modal]] [[gd-footer]] [[gd-groundback]] [[gd-hero]] [[gd-orb]] |

活示例：`src/preview/index.html`（2026年9月1日 · v1.5.2）。文档：`docs/README.md`。

## Definition

- 前缀：class 用 `gd-`，变量用 `--gd-`
- 架构：Light DOM（不用 Shadow DOM）
- 运行时：浏览器侧；Worker 拼 HTML 时直接写 gd-* class
- 核心 14 类：card / tag / badge / skeleton / brand / empty-state / table / toast / tooltip / hero-carousel / modal / navbar / search / footer

## Architecture

| 分组 | 目录 | 现网笔记 |
|------|------|----------|
| foundation | `src/foundation/` | [[Design Token]] [[玻璃表面系统]] [[gd-button]] [[gd-footer]] [[gd-groundback]] |
| navigation | `src/navigation/` | [[gd-navbar]] [[gd-search]] |
| display | `src/display/` | [[gd-card]] [[gd-hero]] |
| feedback | `src/feedback/` | [[gd-modal]] |
| extend | `src/extend/` | [[gd-orb]]（websearch）；detail 反向缩放、palace 条目卡无独立笔记 |
| runtime | `src/runtime/` | [[Web Component]] |
| preview | `src/preview/` | 组件总览页 |

另：主站通知跑马灯 `.gd-notice-led`，挂在 `.gd-below-nav` / `.gd-navbar--led`。

## 组件（现网）

| 笔记 | 干什么 |
|------|--------|
| [[gd-navbar]] | 顶栏 / 汉堡 / 抽屉 / NSFW 红绿 |
| [[gd-search]] | 顶栏固定 300px；只有 `expandable` 才变宽 |
| [[gd-button]] | primary / pill / detail / link / nsfw |
| [[gd-card]] | 主站 420×212；条目卡必须 `auto` |
| [[gd-modal]] | 欢迎窗由 [[gd-orb]]「弹窗」打开 |
| [[gd-footer]] | `z-index: 1` + `margin-top: auto`，压过背景 |
| [[gd-groundback]] | `--websearch` 全站默认；`--gold` 仅殿堂 |
| [[gd-hero]] | 首屏骨架，不要整段 `hidden` |
| [[gd-orb]] | 右下两列胶囊；菜单 `role="region"` |

## 命名约定

- Block：`gd-card`、`gd-button`、`gd-navbar`
- Element：`gd-card__title`、`gd-card__icon`
- Modifier：`gd-card--friend`、`gd-button--primary`
- State：`is-open`、`is-active`、`is-expanded`、`is-on`、`is-flash`、`is-disabled`

## 禁止项

- 硬编码颜色（必须用 `--gd-*` token）
- 低对比透明浅字（用 `--gd-color-on-surface-subtle`）
- 卡片类 `backdrop-filter` / `box-shadow`（装饰线条可用 `filter: blur(10.8px)`）
- `div onclick`（必须真实 `<button>` 或 `<a href>`）
- 无意义扫光动画
- 首页不要写 `.gd-filter-bar-wrap` 两框（用 [[gd-orb]]）

## Related

- [[Design Token]] — 139 个 `--gd-*`
- [[玻璃表面系统]] — 三级玻璃；顶栏用 `--gd-chrome-bar-bg`
- [[状态层模式]] — hover/focus/pressed，禁止 `translateY`
- [[Web Component]] — modal / navbar / search；orb 不是自定义元素
- [[Decision-MD3 对齐口径]] — 对齐语义不换皮
- [[Decision-玻璃拟态保留]] — 玻璃数值冻结
- [[记录索引]] — ADR / 示例 / CHANGELOG 路径
