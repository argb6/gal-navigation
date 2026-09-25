---
title: gd-button
tags:
  - galnavi/component
  - button
  - primary
  - secondary
  - danger
  - ghost
  - back
date: 2026-08-14
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[Design Token]]"
  - "[[状态层模式]]"
  - "[[gd-navbar]]"
  - "[[Decision-MD3 对齐口径]]"
---

# gd-button

> [!abstract] Summary
> 按钮。主操作、卡片操作、返回、NSFW 开关。必须真实 `<button>` 或 `<a href>`，热区 ≥ 48px（卡片上的 detail/link 除外，尺寸跟现网卡）。

## Definition

| 变体 | class | 用途 |
|------|-------|------|
| Primary | `gd-button--primary` | 主操作（紫蓝渐变） |
| Secondary | `gd-button--secondary` | 次操作（透明描边） |
| Danger | `gd-button--danger` | 危险操作（粉红渐变） |
| Pill | `gd-button--pill` | 全圆角（抽屉 NSFW 叠在这条上） |
| Detail | `gd-button--detail` | 卡片「详情」：164×39，紫渐变 |
| Link | `gd-button--link` | 卡片「官网/外链」：164×39，粉渐变。不是文字链 |
| Ghost | `gd-button--ghost` | 幽灵（紫描边 + 紫底） |
| Wide | `gd-button--wide` | 全宽 |
| Back | `gd-button--back` | 返回主站 |
| Back orange | `gd-button--back--orange` | 返回 hover 橙色 |
| NSFW | `gd-button--nsfw` | 抽屉开关：关=红实底、开=绿实底；闪「已开启 / 已关闭」 |

## Implementation

- 禁止 `div onclick`
- 状态层：`::before` 叠 hover/focus/pressed
- NSFW 开：`.is-on`；闪示：`.is-flash`（由 `initGdNsfwToggle` 加）
- 焦点：`outline: 2px solid var(--gd-color-primary); outline-offset: 2px`
- 禁用：`opacity: var(--gd-state-disabled); pointer-events: none`
- hover 用 `filter: brightness(1.06)`，不要 `translateY`

## 文件位置

- 源码：`src/foundation/actions/gd-button.css`

## Related

- [[状态层模式]] — 交互状态
- [[Design Token]] — `--gd-color-success` / `--gd-color-error`
- [[gd-navbar]] — 抽屉 NSFW
