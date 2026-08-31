---
title: Web Component
tags:
  - galnavi/component
  - web-component
  - custom-element
  - gd-modal
  - gd-navbar
  - gd-search
date: 2026-08-14
updated: 2026-08-31
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-modal]]"
  - "[[gd-navbar]]"
  - "[[gd-search]]"
---

# Web Component

> [!abstract] Summary
> 三个自定义元素处理通用交互行为（弹窗/导航/搜索），不包含业务逻辑。注册入口 `src/runtime/gd.js`。

## Definition

| 元素 | 文件 | 职责 |
|------|------|------|
| `<gd-modal>` | `src/feedback/modal/gd-modal.js` | 弹窗开闭、Esc、焦点陷阱、遮罩、inert |
| `<gd-navbar>` | `src/navigation/navbar/gd-navbar.js` | 汉堡菜单、抽屉、手风琴、键盘 |
| `<gd-search>` | `src/navigation/search/gd-search.js` | 搜索框生成、展开/收起、清除按钮 |

## Implementation

- 使用 Light DOM（不使用 Shadow DOM）
- `display: contents` 使自定义元素不产生额外布局盒
- 只处理通用行为，不决定跳转地址/查询/过滤
- Worker 拼 HTML 时直接使用 gd-* class，无需模板编译

## gd-modal API

- `openGdModal(overlay)` / `closeGdModal(overlay)`
- `bindGdModal(selector, triggerSelector)`
- `startGdRedirectCountdown(overlay, seconds, onDone)`
- 焦点栈：多个弹窗叠加时维护焦点层级
- inert：弹窗打开时背景内容设为 `inert`

## gd-navbar API

- `initGdNavbar(el)` — 初始化导航栏
- `initGdNavLinks(selector)` — 频道标签切换
- `initGdNavCounts(selector, { items })` — 徽章计数
- `initGdCatNav(selector)` — 分类标签切换

## gd-search API

- `initGdSearch(el)` — 初始化搜索框
- Variant `toolbar`：全宽搜索
- Variant `group`：金色主题（圣器殿堂）

## 文件位置

- 注册入口：`src/runtime/gd.js`
- 预览打包：`esbuild.config.js` → `src/preview/gd-preview.js`

## Related

- [[GD 组件库]] — 组件体系
- [[状态层模式]] — 交互状态
