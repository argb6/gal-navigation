---
title: Design Token
tags:
  - galnavi/component
  - token
  - css-variable
  - color
  - shape
  - type
  - motion
  - glass
date: 2026-08-14
updated: 2026-08-31
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[玻璃表面系统]]"
  - "[[Decision-MD3 对齐口径]]"
---

# Design Token

> [!abstract] Summary
> GALNAVI 设计变量系统，`:root` 下 168+ 变量，覆盖颜色/形状/字号/动效/玻璃/状态/布局，是唯一的换肤入口。

## Definition

所有变量以 `--gd-` 前缀命名，分为 8 大类：

| 类别 | 前缀 | 示例 |
|------|------|------|
| 颜色角色 | `--gd-color-*` | `--gd-color-primary: #4f7cff` |
| RGB 通道 | `--gd-color-*-rgb` | `--gd-color-primary-rgb: 79, 124, 255` |
| 渐变 | `--gd-gradient-*` | `--gd-gradient-primary-a: #7c3aed` |
| 形状 | `--gd-shape-corner-*` | `--gd-shape-corner-small: 14px` |
| 字号 | `--gd-type-*-size` | `--gd-type-title-medium-size: 16px` |
| 字重 | `--gd-weight-*` | `--gd-weight-bold: 700` |
| 动效 | `--gd-motion-*` | `--gd-motion-duration-short4: 200ms` |
| 玻璃 | `--gd-glass-*` | `--gd-glass-bg: rgba(18,22,40,0.42)` |
| 状态 | `--gd-state-*` | `--gd-state-hover: 0.08` |
| 布局 | `--gd-nav-height` / `--gd-space-*` | `--gd-touch-target: 48px` |

## 颜色角色（MD3 映射）

| Token | 值 | MD3 角色 |
|-------|-----|---------|
| `--gd-color-background` | `#1c2a48` | background |
| `--gd-color-surface` | `#18253f` | surface |
| `--gd-color-primary` | `#4f7cff` | primary |
| `--gd-color-on-surface` | `#f4f7ff` | on-surface |
| `--gd-color-on-surface-variant` | `#93a4c8` | on-surface-variant |
| `--gd-color-outline` | `#1e2a45` | outline |
| `--gd-color-error` | `#f87171` | error |

色值是 GALNAVI 自己的调色板，不是 MD3 默认紫色。

## RGB 通道模式

颜色存储为逗号分隔 RGB 值，运行时组合任意透明度：

```css
background: rgba(var(--gd-color-primary-rgb), 0.12);
border-color: rgba(var(--gd-color-white-rgb), 0.14);
```

单个颜色定义可产生无限透明度层级。

## 标签三色循环

卡片标签使用 `nth-child(3n+1/2/0)` 循环紫/蓝/粉三色：

| 集合 | bg | fg |
|------|----|----|
| `--gd-tag-1-*`（紫） | `rgba(168,85,247,0.12)` | `#c4b5fd` |
| `--gd-tag-2-*`（蓝） | `rgba(59,130,246,0.12)` | `#93c5fd` |
| `--gd-tag-3-*`（粉） | `rgba(236,72,153,0.12)` | `#f9a8d4` |

## 文件位置

- 源码：`src/foundation/tokens/tokens.css`
- 文档：`docs/tokens.md`

## Related

- [[GD 组件库]] — 组件体系
- [[Decision-MD3 对齐口径]] — 对齐原则
- 文件路径：`src/foundation/tokens/tokens.css`
