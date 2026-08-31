---
title: Decision-玻璃拟态保留
tags:
  - galnavi/decision
  - glass
  - glassmorphism
  - visual
  - frozen
date: 2026-08-14
updated: 2026-08-31
type: decision
category: Decision
status: active
related:
  - "[[玻璃表面系统]]"
  - "[[Design Token]]"
---

# Decision-玻璃拟态保留

## 时间

2026-08（Phase 1 定稿）

## 背景

Material Design 3 默认主题使用实色表面，不包含玻璃拟态。GALNAVI 现网视觉以半透明表面、光晕、边框透明度为核心。

> [!info] 方案
> 保留 GALNAVI 玻璃拟态皮肤，玻璃数值冻结。

> [!tip] 原因
> 玻璃拟态是 GALNAVI 品牌视觉 identity 的核心。用户已习惯深色半透明风格；MD3 的 surface 概念可以用玻璃实现（语义对齐，视觉不换）。

## 影响

- `--gd-glass-*` 变量冻结，禁止修改
- 卡片类禁止 `backdrop-filter` / `box-shadow`
- 只有浮层/弹窗/导航栏可用 blur
- 新增组件必须使用 `--gd-glass-bg` + `--gd-glass-border`

## 替代方案

1. **采用 MD3 默认实色表面** — 被否决（破坏品牌）
2. **部分页面用玻璃、部分用实色** — 被否决（视觉不统一）

## Related

- [[玻璃表面系统]] — 实现细节
- [[Design Token]] — glass token
- 文件：`gd-architecture.md` §〇
