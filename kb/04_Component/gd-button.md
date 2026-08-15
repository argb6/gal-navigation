---
type: component
category: Component
tags: [button, primary, secondary, danger, ghost, back]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[GD 组件库]], [[Design Token]], [[状态层模式]], [[Decision-MD3 对齐口径]]
---

# gd-button

## Summary

按钮组件，6 种变体覆盖全部操作场景，触控目标 ≥ 48px。

## Definition

| 变体 | class | 用途 |
|------|-------|------|
| Primary | `gd-button--primary` | 主操作（紫蓝渐变） |
| Secondary | `gd-button--secondary` | 次操作（透明描边） |
| Danger | `gd-button--danger` | 危险操作（粉红渐变） |
| Ghost | `gd-button--ghost` | 幽灵按钮（紫描边 + 紫底） |
| Wide | `gd-button--wide` | 全宽按钮（年龄门） |
| Back | `gd-button--back` | 返回主站按钮 |
| Detail | `gd-button--detail` | 卡片详情按钮 |
| Link | `gd-button--link` | 卡片链接按钮 |

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
