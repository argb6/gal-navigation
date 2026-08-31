---
title: ChangeLog-线条背景与快捷栏
aliases:
  - ChangeLog-线条背景
tags:
  - galnavi/changelog
  - groundback
  - filter-bar
  - palace
  - hero
date: 2026-09-01
updated: 2026-09-01
type: decision
category: ChangeLog
status: active
related:
  - "[[gd-groundback]]"
  - "[[gd-card]]"
  - "[[gd-filter-bar]]"
  - "[[gd-hero]]"
  - "[[gd-modal]]"
  - "[[玻璃表面系统]]"
---

# ChangeLog-线条背景与快捷栏

## 2026-09-01

### 页面背景

- 除殿堂外各 Worker 用 [[gd-groundback]] `--websearch`（蓝底 + R2 线条，`filter: blur(10.8px)`）
- 殿堂 `--gold`：金晕仍在 `::before`，同款线条在 `::after`
- `--websearch` 不是「检索页专用」
- 详情/殿堂：`body` 透明，背景层 `z-index: 0`，否则旧渐变盖住线条

### 条目卡

- [[gd-card]] `--item` 必须 `width/height: auto`，勿继承主站卡 420×212（否则只剩序号和按钮）
- 表面 `::before` 同款线条；不是 `backdrop-filter`

### 轮播与快捷栏

- [[gd-hero]]：`is-loading` + `gd-skeleton--hero`，不要整段 `hidden`
- [[gd-filter-bar]]：wrap 两框，窄屏叠、≥769px 左右分
- 欢迎窗：介绍下居中加粗「✨ 详情：新手优先看卡片详情✨」；去掉日本节点；帮助/关于链接居中

未部署。沙盒未改。未改 D1。

## Related

- [[gd-groundback]] — 变体与层级
- [[gd-card]] — 条目卡尺寸坑
- [[gd-filter-bar]] — 两框布局
- [[gd-hero]] — 骨架首屏
- [[玻璃表面系统]] — `filter` ≠ `backdrop-filter`
