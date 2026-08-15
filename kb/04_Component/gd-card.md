---
type: component
category: Component
tags: [card, glass, friend, item, palace]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[GD 组件库]], [[玻璃表面系统]], [[Design Token]], [[Decision-玻璃拟态保留]]
---

# gd-card

## Summary

卡片组件，三种变体覆盖主站导航卡、友链卡、殿堂条目卡。

## Definition

| 变体 | class | 尺寸 | 用途 |
|------|-------|------|------|
| 通用 | `gd-card` | `min(420px, 100%)` × `212px` | 主站导航卡片 |
| 友链 | `gd-card--friend` | `auto` × `auto`（max 320px） | 友情链接卡 |
| 条目 | `gd-card--item` | `auto` × `auto` | 圣器殿堂条目 |

## Implementation

- 玻璃表面：`background: var(--gd-glass-bg)` + `border: 1px solid var(--gd-glass-border)`
- **禁止** `backdrop-filter` / `box-shadow`
- Hover：`background: var(--gd-glass-bg-hover)` + `border-color: var(--gd-color-border-hover)` + `filter: brightness(1.05)`
- **禁止垂直位移**（无 `translateY`）
- 标签使用三色循环（`nth-child(3n+1/2/0)`）

## 条目卡变体（殿堂）

- 桌面端（≥769px）：横排布局
- 移动端（≤768px）：纵排紧凑
- 颜色系统：金色（divine）/ 红色（demonic）/ 绿色（immortal）

## 文件位置

- 源码：`src/display/card/gd-card.css`

## Related

- [[玻璃表面系统]] — 玻璃样式
- [[Design Token]] — 标签色/形状 token
