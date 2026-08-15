---
type: decision
category: Decision
tags: [web-component, light-dom, shadow-dom, css]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[Web Component]], [[GD 组件库]]
---

# Decision-Light DOM

## 时间

2026-08（Phase 1 组件库设计）

## 背景

Web Components 支持 Shadow DOM（样式隔离）和 Light DOM（共享样式树）。Worker 拼 HTML 时需要复用 gd-* class。

## 方案

使用 Light DOM，自定义元素只处理行为，样式由外部 CSS 控制。

## 原因

- **Worker 兼容**：Worker 拼 HTML 时直接使用 `gd-*` class，无需模板编译
- **样式统一**：外部 CSS 可直接控制组件内部样式
- **简单性**：不需要处理 Shadow DOM 的样式穿透问题

## 影响

- `<gd-search>` 和 `<gd-modal>` 使用 `display: contents` 不产生额外布局盒
- 组件内部避免使用过宽选择器（`.title`、`.active`）
- 所有 class 使用 `gd-` 前缀防冲突

## 替代方案

1. **Shadow DOM** — 被否决（Worker 拼 HTML 无法直接使用，样式隔离过于严格）
2. **纯 CSS 无 Web Component** — 被否决（弹窗/导航需要 JS 行为）

## Related

- [[Web Component]] — 实现细节
- [[GD 组件库]] — 组件体系
