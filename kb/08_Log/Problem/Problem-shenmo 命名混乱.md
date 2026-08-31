---
title: Problem-shenmo 命名混乱
tags:
  - galnavi/problem
  - naming
  - shenmo
  - palace
  - migration
date: 2026-08-14
updated: 2026-08-31
type: decision
category: Problem
status: resolved
related:
  - "[[GD 组件库]]"
  - "[[Worker 架构]]"
---

# Problem-shenmo 命名混乱

> [!bug] 现象
> 项目中同时存在 `shenmo` 和 `palace` 两种命名：`worker/shenmo.js` → `worker/new/palace.js`；`src/extend/shenmo/` → `extend/palace/`；注释、KV key、Preview 文案混用。

- `worker/shenmo.js`（旧）→ `worker/new/palace.js`（新）
- `src/extend/shenmo/gd-shenmo.css`（旧）→ `src/extend/palace/gd-palace.css`（新）
- CSS 注释中「神魔」「神魔殿堂」「shenmo」混用
- KV key `shenmo_legend_seen_v1`
- Preview 页面展示文字「神魔卡」「神魔条目卡」

## 原因

项目早期页面叫「神魔殿堂」（shenmo），后改名「圣器殿堂」（palace），但旧名未彻底清理。

## 修复

全局替换：
- 目录 `extend/shenmo/` → `extend/palace/`
- 文件 `gd-shenmo.css` → `gd-palace.css`
- CSS 注释 `神魔` → `殿堂`、`shenmo` → `palace`
- Preview 文字 `神魔卡` → `殿堂卡`、`圣器神殿` → `圣器殿堂`
- KV key `shenmo_legend_seen_v1` → `palace_legend_seen_v1`
- Worker 注释 `Cloudflare Worker - shenmo.js` → `Cloudflare Worker - palace.js`

## 教训

- 改名时必须全局搜索旧名（包括注释、变量名、文件名、展示文字）
- CSS 内联到 Worker 后，源码注释也会被带入，不能只改 `src/` 不改 `worker/`
- Preview 页面的展示文字也是「代码」，需要同步更新
