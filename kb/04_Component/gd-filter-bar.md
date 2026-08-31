---
title: gd-filter-bar
tags:
  - galnavi/component
  - filter-bar
  - websearch
  - toolbar
date: 2026-09-01
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-modal]]"
  - "[[ChangeLog-线条背景与快捷栏]]"
---

# gd-filter-bar

> [!abstract] Summary
> 主站首页快捷栏。用两次组件外包 `.gd-filter-bar-wrap`：窄屏上下叠，宽屏左右分。

## Definition

| 部件 | class | 内容 |
|------|-------|------|
| 外包 | `.gd-filter-bar-wrap`（`#homeFilter`） | 两框容器；搜索时整层隐藏 |
| 左框 | `.gd-filter-bar--start` | 标签、酒馆、仓库、弹窗 |
| 右框 | `.gd-filter-bar--end` | 关于、帮助、友链、殿堂 |
| 胶囊 | `.gd-filter-bar__tag` | 固定 75×40；必须 `<button>` 或 `<a href>` |

## 布局

| 宽度 | 两框 | 对齐 |
|------|------|------|
| &lt; 769px | `flex-direction: column` | 都靠左 |
| ≥ 769px | `flex-direction: row`，各占一半 | `--start` 靠左，`--end` `justify-content: flex-end` |

「弹窗」打开 [[gd-modal]] 欢迎窗。不要写成「可随意叠两框」——必须走 wrap + `--start` / `--end`。

## 文件位置

- 源码：`src/extend/websearch/gd-filter-bar.css`
- 示例：`docs/examples/filter-bar.md`

## Related

- [[gd-modal]] — 欢迎窗由「弹窗」打开
- [[GD 组件库]] — extend/websearch
- [[ChangeLog-线条背景与快捷栏]] — 这次布局定稿
