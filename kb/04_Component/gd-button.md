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
updated: 2026-08-31
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[Design Token]]"
  - "[[状态层模式]]"
  - "[[Decision-MD3 对齐口径]]"
---

# gd-button

> [!abstract] Summary
> 按钮组件，变体覆盖主操作、卡片、返回和 NSFW 开关，触控目标 ≥ 48px。

## Definition

| 变体 | class | 用途 |
|------|-------|------|
| Primary | `gd-button--primary` | 主操作（紫蓝渐变） |
| Secondary | `gd-button--secondary` | 次操作（透明描边） |
| Danger | `gd-button--danger` | 危险操作（粉红渐变） |
| Ghost | `gd-button--ghost` | 幽灵按钮（紫描边 + 紫底） |
| Wide | `gd-button--wide` | 全宽按钮 |
| Back | `gd-button--back` | 返回主站按钮 |
| Detail | `gd-button--detail` | 卡片详情按钮 |
| NSFW | `gd-button--nsfw` | 抽屉 NSFW 开关：关=暗、开=亮；点一下闪「已开启」，再点闪「已关闭」 |

## Implementation

- 必须放在 `<button>` 或 `<a href>` 上，禁止 `div onclick`
- 状态层：`::before` 伪元素叠加 hover/focus/pressed 透明度
- 渐变：`linear-gradient(135deg, var(--gd-gradient-primary-a), var(--gd-gradient-primary-b))`
- 焦点：`outline: 2px solid var(--gd-color-primary); outline-offset: 2px`
- 禁用：`opacity: var(--gd-state-disabled); pointer-events: none`

## 文件位置

- 源码：`src/foundation/actions/gd-button.css`

## Related

- [[状态层模式]] — 交互状态
- [[Design Token]] — 渐变/状态 token
