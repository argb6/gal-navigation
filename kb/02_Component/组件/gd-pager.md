---
title: gd-pager
tags:
  - galnavi/component
  - pager
date: 2026-10-05
updated: 2026-10-05
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-card]]"
---

# gd-pager

> [!abstract] Summary
> 列表翻页。栏目页、首页搜索的每一组，一页最多 12 张卡。首页的站点推荐和最近更新不显示页码。

## Definition

`nav.gd-pager`，`aria-label="翻页"`。按钮是 `.gd-pager__btn`，`data-page` 是要去的页码。当前页加 `aria-current="page"`。省略号是 `.gd-pager__gap`。

栏目页和首页搜索：有卡片就显示页码。不足 12 张也显示「上一页 / 1 / 下一页」，前后两钮禁用。没有卡片时不显示。首页推荐和最近更新不显示页码。

## 文件位置

- 源码：`src/navigation/pager/gd-pager.css`
- 主站：`websearch.js` 内联同一套样式，并由 `renderCards` 切片
