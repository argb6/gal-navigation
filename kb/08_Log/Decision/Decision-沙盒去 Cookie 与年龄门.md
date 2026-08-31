---
title: Decision-沙盒去 Cookie 与年龄门
aliases:
  - 去 Cookie
  - 去年龄门
tags:
  - galnavi/decision
  - age-gate
  - sandbox
date: 2026-08-31
updated: 2026-08-31
type: decision
category: Decision
status: active
related:
  - "[[gd-modal]]"
  - "[[沙盒开发]]"
---

# Decision-沙盒去 Cookie 与年龄门

## 时间

2026-08-31

## 背景

页面曾用 Cookie 做首访确认和年龄门。预览时要能直接进站，也不希望本地再写追踪同款的存储。Cookie 读写规范已撤下，不再维护 key 表。

> [!info] 方案
> 在 `sandbox/*-sandbox/` 去掉 `document.cookie` 读写、去掉首访跳转、卸掉发布页年龄门 DOM/CSS。欢迎弹窗改为只记 localStorage。`worker/new` 子页不再做首访跳转。年龄门组件 `gd-age-gate` 已删除；NSFW 改由桌面导航栏盾牌开关。

> [!tip] 原因
> 沙盒要能一打开就看到页面。年龄门挡预览。欢迎「只出现一次」用 localStorage 就够。

## 影响

- `gd-age-gate` 组件文件已删除；发布页不再弹年龄门
- NSFW 改由导航栏桌面盾牌开关（`initGdNsfwToggle`）
- 殿堂传说弹窗仍用 localStorage
- `source/` 脱敏副本同样不含 Cookie 首访

## 替代方案

1. **沙盒保留年龄门、只改存储名** — 否决（预览仍被挡住）
2. **直接改 `worker/new` 上线** — 已执行：去掉首访跳转；年龄门组件卸掉

## Related

- [[沙盒开发]] — 预览入口
- [[gd-modal]] — 弹窗变体
