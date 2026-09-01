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
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[玻璃表面系统]]"
  - "[[状态层模式]]"
  - "[[Decision-MD3 对齐口径]]"
  - "[[ChangeLog-gd v1.5.1]]"
---

# Design Token

> [!abstract] Summary
> 换肤入口只有 `src/foundation/tokens/tokens.css`。`:root` 里 **139** 个 `--gd-*` 声明（2026-09-01 对照 `worker/new` 删掉未引用项后计数）。角色名对齐 MD3，色值是 GALNAVI 自己的。

> [!warning] 不要口头估
> 注释里的 `--gd-x-rgb`、以及 `var(--gd-…)` 嵌套引用，都不算新变量。

## 分类（139）

| 类别 | 数量 | 前缀 |
|------|------|------|
| 颜色角色 | 23 | `--gd-color-*`（不含 `-rgb`、不含 overlay 合成） |
| RGB 通道 | 28 | `--gd-color-*-rgb` |
| 语义合成 | 8 | overlay / card-gradient / border-* / demo-dash |
| 渐变端点 | 12 | `--gd-gradient-*` |
| 标签 | 9 | `--gd-tag-*` |
| 徽标 | 6 | `--gd-badge-*` |
| 圆角 | 5 | `--gd-shape-corner-*` |
| 字号 / 行高 / 字距 | 19 | `--gd-type-*` |
| 字重 | 6 | `--gd-weight-*` |
| 字体栈 | 1 | `--gd-font-sans` |
| 状态层 | 4 | `--gd-state-*` |
| 动效 | 6 | `--gd-motion-*` |
| 布局 | 5 | nav / max-width / space-2 / space-6 / touch |
| 玻璃 + 顶栏底 | 7 | `--gd-glass-*` + `--gd-chrome-bar-bg` |

合计 **139**。

## 颜色角色

| Token | 值 |
|-------|-----|
| `--gd-color-background` | `#1c2a48` |
| `--gd-color-surface` | `#18253f` |
| `--gd-color-surface-variant` | `#223456` |
| `--gd-color-surface-back` | `#1c2a45` |
| `--gd-color-primary` | `#4f7cff` |
| `--gd-color-on-primary` | `#ffffff` |
| `--gd-color-primary-container` | `rgba(79, 124, 255, 0.12)` |
| `--gd-color-secondary` | `#a855f7` |
| `--gd-color-on-surface` | `#f4f7ff` |
| `--gd-color-on-surface-variant` | `#93a4c8` |
| `--gd-color-on-surface-subtle` | `#aeb9d6` |
| `--gd-color-outline` | `#1e2a45` |
| `--gd-color-error` | `#f87171` |
| `--gd-color-link` | `#7aa2f7` |
| `--gd-color-link-hover` | `#9ec0ff` |
| `--gd-color-accent-light` | `#a78bfa` |
| `--gd-color-success` | `#86efac` |
| `--gd-color-error-light` | `#fca5a5` |
| `--gd-color-sky` | `#38bdf8` |
| `--gd-color-blue` | `#3b82f6` |
| `--gd-color-blue-deep` | `#2563eb` |
| `--gd-color-cyan` | `#22d3ee` |
| `--gd-color-cyan-light` | `#67e8f9` |

没有 `--gd-color-tertiary` / `--gd-color-on-error` / `--gd-dot-*`。粉走 `--gd-gradient-pink-*` 和 `--gd-tag-3-*`。

## RGB 通道

逗号分隔，给 `rgba(var(--gd-…-rgb), a)` 用。没有 `--gd-color-success-rgb`；NSFW 开态阴影用 `--gd-color-green-light-rgb`（`134, 239, 172`）。

`--gd-color-error-rgb` 是 `239, 68, 68`，和 `--gd-color-error` 的 `#f87171` 不是同一颗色。

## 语义合成

| Token | 值 |
|-------|-----|
| `--gd-color-overlay` | `rgba(navy-deep, 0.88)` |
| `--gd-color-overlay-strong` | `rgba(navy-panel, 0.92)` |
| `--gd-color-overlay-float` | `rgba(navy, 0.95)` |
| `--gd-color-card-gradient-a/b` | navy-card 0.96 / navy-card-deep 0.98 |
| `--gd-color-border-hover` | `rgba(sky, 0.28)` |
| `--gd-color-border-accent` | `rgba(accent, 0.22)` |
| `--gd-color-demo-dash` | `rgba(grey, 0.45)` |

## 渐变 / 标签 / 徽标

| 组 | Token | 值 |
|----|-------|-----|
| 主按钮 | `--gd-gradient-primary-a/b` | `#7c3aed` / `#6d28d9` |
| 主 hover | `--gd-gradient-primary-hover-a/b` | `#8b5cf6` / `#7c3aed` |
| 粉按钮 | `--gd-gradient-pink-a/b` | `#ec4899` / `#db2777` |
| 粉 hover | `--gd-gradient-pink-hover-a/b` | `#f472b6` / `#ec4899` |
| 标题字 | `--gd-gradient-title-a…d` | `#c4b5fd` / `#e9d5ff` / `#a78bfa` / `#8b5cf6` |
| 标签 1 紫 | `--gd-tag-1-bg/fg/border` | `rgba(168,85,247,0.12)` / `#c4b5fd` / `rgba(168,85,247,0.2)` |
| 标签 2 蓝 | `--gd-tag-2-bg/fg/border` | `rgba(59,130,246,0.12)` / `#93c5fd` / `rgba(59,130,246,0.2)` |
| 标签 3 粉 | `--gd-tag-3-bg/fg/border` | `rgba(236,72,153,0.12)` / `#f9a8d4` / `rgba(236,72,153,0.2)` |
| 徽标默认 | `--gd-badge-bg/fg` | `var(--gd-glass-border)` / `#d7e2ff` |
| 徽标蓝 | `--gd-badge-blue-bg/fg` | `rgba(79,124,255,0.28)` / `#eaf0ff` |
| 徽标金 | `--gd-badge-gold-bg/fg` | `rgba(251,191,36,0.14)` / `#fcd34d` |

## 圆角

| Token | 值 |
|-------|-----|
| `--gd-shape-corner-extra-small` | `8px` |
| `--gd-shape-corner-small` | `14px` |
| `--gd-shape-corner-medium` | `18px` |
| `--gd-shape-corner-large` | `20px` |
| `--gd-shape-corner-full` | `9999px` |

## 字号 / 行高

源码**没有** `--gd-type-hero-title-size`。行高只留现网用到的两条。

| Token | 值 |
|-------|-----|
| `--gd-type-display-medium-size` | `48px` |
| `--gd-type-display-small-size` | `36px` |
| `--gd-type-headline-small-size` | `24px` |
| `--gd-type-title-large-size` | `22px` |
| `--gd-type-title-xxl-size` | `18px` |
| `--gd-type-title-medium-size` / `-line` | `16px` / `1.4` |
| `--gd-type-title-small-size` | `15px` |
| `--gd-type-body-large-size` | `16px` |
| `--gd-type-label-large-size` / `-line` | `14px` / `1.4` |
| `--gd-type-body-medium-size` | `14px` |
| `--gd-type-note-size` | `13px` |
| `--gd-type-label-medium-size` | `12px` |
| `--gd-type-body-small-size` | `12px` |
| `--gd-type-label-small-size` | `11px` |

字距：`tight` `-0.5px` / `normal` `0.01em` / `wide` `0.1em`。

字重：400 / 500 / 600 / 700 / 800 / 900。字体：`--gd-font-sans`。

## 状态 / 动效 / 布局 / 玻璃

| Token | 值 |
|-------|-----|
| `--gd-state-hover/focus/pressed/disabled` | `0.08` / `0.12` / `0.12` / `0.38` |
| `--gd-motion-duration-short4` | `200ms` |
| `--gd-motion-duration-medium1/2/4` | `250ms` / `300ms` / `400ms` |
| `--gd-motion-easing-standard/emphasized` | `cubic-bezier(0.2, 0, 0, 1)`（两条同值） |
| `--gd-nav-height` | `64px` |
| `--gd-layout-max-width` | `1200px` |
| `--gd-space-2` / `--gd-space-6` | `8px` / `24px` |
| `--gd-touch-target` | `48px` |
| `--gd-glass-bg` | `rgba(18, 22, 40, 0.42)` |
| `--gd-glass-bg-hover` | `rgba(22, 28, 48, 0.52)` |
| `--gd-glass-blur` | `blur(18px) saturate(165%)` |
| `--gd-glass-border` | `rgba(255, 255, 255, 0.14)` |
| `--gd-glass-nav-bg` | `rgba(8, 12, 24, 0.75)` |
| `--gd-glass-nav-blur` | `blur(20px) saturate(180%)` |
| `--gd-chrome-bar-bg` | `rgba(18, 22, 40, 0.92)` |

现网顶栏底用 `--gd-chrome-bar-bg` + `--gd-glass-nav-blur`。见 [[玻璃表面系统]]。

没有 `--gd-elevation-*`（层级别名从未被规则引用）。

## 不在 tokens.css 里

运行时由 JS 写入，不要当成换肤变量：

| 变量 | 谁写 | 用途 |
|------|------|------|
| `--gd-vvh` | `initGdStickyViewport` | 可视高度，页脚贴底 |
| `--gd-inv-zoom` | `initGdInverseZoom` | 详情反向缩放 |
| `--gd-notice-led-duration` | `initGdNoticeLed` | 跑马灯一轮时长 |

殿堂分类页签的 `--gd-comp-cat-color*` 写在 `gd-navbar.css` 变体上，不是全局 token。

## 文件位置

- 源码：`src/foundation/tokens/tokens.css`
- 文档：`docs/standard/tokens.md`

## Related

- [[GD 组件库]] — 组件体系
- [[玻璃表面系统]] — `--gd-glass-*` 与 `--gd-chrome-bar-bg`
- [[状态层模式]] — `--gd-state-*`
- [[ChangeLog-gd v1.5.1]] — 删未引用 token
- [[Decision-MD3 对齐口径]] — 对齐原则
