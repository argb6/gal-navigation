---
title: gd-groundback
tags:
  - galnavi/component
  - layout
  - background
date: 2026-08-31
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[Design Token]]"
  - "[[玻璃表面系统]]"
  - "[[ChangeLog-线条背景与快捷栏]]"
---

# gd-groundback

> [!abstract] Summary
> 页面背景层（`position: fixed`，`aria-hidden`），铺在内容之下。`--websearch` 是全站默认，不是检索页专用。

## 变体

| class | 用途 | 现网页面 |
|---|---|---|
| `gd-groundback--websearch` | 蓝底 + R2 线条（`screen` + `filter: blur(10.8px)`，`::before`） | index / websearch / detail / about / help / friend / donate / status / error |
| `gd-groundback--gold` | 金晕在 `::before`；同款线条在 `::after` | 仅 palace |
| `gd-groundback--blue` | 点阵网格 | 预览对比，现网页不用作底 |
| `gd-groundback--bleed` | 铺满视口 | 需要时再加；预览盒内不要加 |

图案：`https://assets.galnavi.top/线条图案.png`。模糊 **10.8px**（12 × 0.9），透明度 `0.16`。

> [!warning] 不要盖住
> `body` 必须透明。背景层用 `z-index: 0`，正文 `z-index: 1`。`z-index: -1` 会画到 body 底色后面（详情页曾经因此看不见线条）。

> [!tip] 与卡片红线
> 线条模糊是装饰层 `filter`，不是卡片禁止的 `backdrop-filter`。见 [[玻璃表面系统]]。

## Related

- [[玻璃表面系统]] — `filter` 与 `backdrop-filter`
- [[gd-card]] — 条目卡表面同款线条
- [[ChangeLog-线条背景与快捷栏]] — 全站铺开

