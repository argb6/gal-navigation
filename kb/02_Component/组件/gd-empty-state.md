---
title: gd-empty-state
tags:
  - galnavi/component
  - empty-state
date: 2026-10-05
updated: 2026-10-05
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-card]]"
---

# gd-empty-state

> [!abstract] Summary
> 空状态。主站分类没有卡片、搜索没有结果时使用。居中标题加一句说明。

## Definition

| class | 说明 |
|-------|------|
| `.gd-empty-state` | 容器，`role="status"` |
| `.gd-empty-state__title` | 标题，用 `h3`。主站文案「暂无结果」 |
| `.gd-empty-state__desc` | 说明。分类：「这个分类暂时没有内容。」搜索：「换个关键词试试，或清空筛选条件。」 |
| `.gd-empty-state__actions` | 可选操作按钮 |
| `.gd-empty-state__icon` | 可选图标。主站空列表不放放大镜 |

## 文件位置

- CSS：`src/display/empty-state/gd-empty-state.css`
- 示例：`docs/examples/empty-state.md`

## Related

- [[GD 组件库]] — display
- [[gd-card]] — 有卡片时不显示空状态
