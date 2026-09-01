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
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-modal]]"
  - "[[gd-navbar]]"
  - "[[gd-search]]"
  - "[[gd-orb]]"
---

# Web Component

> [!abstract] Summary
> 三个自定义元素处理通用交互（弹窗 / 导航 / 搜索），不含业务逻辑。注册入口 `src/runtime/gd.js`。右下快捷入口是普通 DOM + `initGdOrb`，不是自定义元素。

## Definition

| 元素 | 文件 | 职责 |
|------|------|------|
| `<gd-modal>` | `src/feedback/modal/gd-modal.js` | 弹窗开闭、Esc、焦点陷阱、遮罩、inert |
| `<gd-navbar>` | `src/navigation/navbar/gd-navbar.js` | 汉堡、抽屉、手风琴、键盘 |
| `<gd-search>` | `src/navigation/search/gd-search.js` | 结构生成、清除、帮助问号；仅 `expandable` 时展开 |

## Implementation

- Light DOM（不用 Shadow DOM）
- `display: contents`，自定义标签不占布局盒
- 只处理通用行为，不决定跳转 / 查询 / 过滤
- Worker 拼 HTML 时直接写 gd-* class

## gd-modal API

- `openGdModal(overlay)` / `closeGdModal(overlay)`
- `bindGdModal(selector, triggerSelector)`
- `startGdRedirectCountdown(overlay, seconds, onDone)`

## gd-navbar API

- `initGdNavbar(el)`
- `initGdNsfwToggle(root, { storageKey, onChange })` — 桌面盾牌与抽屉共用 `[data-gd-nsfw]`
- `initGdNavLinks(selector)`
- `initGdNavCounts(selector, { items })`
- `initGdCatNav(selector)`

## gd-search API

- `initGdSearch(el)` — 无 `expandable` 时聚焦不加 `is-expanded`
- Variant `toolbar`：全宽（max 420px）
- Variant `group`：金色（圣器殿堂）
- `help` / `help-text`：问号提示

## gd-orb（非自定义元素）

- `initGdOrb(root, { onAction })`
- 菜单 `role="region"`，不要 `role="menu"`

## 文件位置

- 注册入口：`src/runtime/gd.js`
- 预览打包：`temp/gd-preview-entry.js` → `src/preview/gd-preview.js`（`esbuild.config.js`）

## Related

- [[GD 组件库]] — 组件体系
- [[gd-orb]] — 右下快捷入口
- [[状态层模式]] — 交互状态
