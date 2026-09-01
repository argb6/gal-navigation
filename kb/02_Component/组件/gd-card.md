---
title: gd-card
tags:
  - galnavi/component
  - card
  - glass
  - friend
  - item
  - palace
date: 2026-08-14
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[玻璃表面系统]]"
  - "[[Design Token]]"
  - "[[Decision-玻璃拟态保留]]"
  - "[[gd-groundback]]"
  - "[[gd-button]]"
  - "[[ChangeLog-线条背景与快捷栏]]"
---

# gd-card

> [!abstract] Summary
> 卡片组件，三种变体覆盖主站导航卡、友链卡、殿堂条目卡。

## Definition

| 变体 | class | 尺寸 | 用途 |
|------|-------|------|------|
| 通用 | `gd-card` | 420×212（≤640px 宽 100%） | 主站导航卡片 |
| 友链 | `gd-card--friend` | `auto` × `auto`（max 320px） | 友情链接卡 |
| 条目 | `gd-card--item` | `auto` × `auto` | 圣器殿堂条目 |

## Implementation

- 玻璃表面：`background: var(--gd-glass-bg)` + `border: 1px solid var(--gd-glass-border)`
- **禁止** `backdrop-filter` / `box-shadow`
- Hover：`background: var(--gd-glass-bg-hover)` + `border-color: var(--gd-color-border-hover)` + `filter: brightness(1.05)`
- **禁止垂直位移**（无 `translateY`）
- 标签使用三色循环（`nth-child(3n+1/2/0)`），主站卡标签**靠左**
- 主站网格：`gd-card-grid`，每行最多 6 张

## 条目卡变体（殿堂）

- Worker 内联必须带 `width: auto; height: auto`。漏掉会继承主站卡 420×212，游戏名被挤成 0 宽，只剩序号和官网/详情/外链
- 桌面端（≥769px）：横排布局
- 移动端（≤768px）：纵排紧凑
- 颜色系统：金色（divine）/ 红色（demonic）/ 绿色（immortal）
- 表面线条：`::before` 铺 R2 线条图案，`mix-blend-mode: screen`，`filter: blur(10.8px)`（与页面背景同款；不用 `backdrop-filter`）

> [!bug] 名称消失
> 不是 D1 没数据。是 CSS 尺寸继承。字段仍是 `r.name`、`official_url`、`details_url`、`link1/2/3`。

## 文件位置

- 源码：`src/display/card/gd-card.css`

## Related

- [[玻璃表面系统]] — 玻璃样式
- [[Design Token]] — 标签色/形状 token
- [[gd-groundback]] — 同款线条层
- [[gd-button]] — 卡片 `gd-button--detail` / `--link`
- [[存储]] — `resources` 字段
- [[ChangeLog-线条背景与快捷栏]] — 尺寸坑
