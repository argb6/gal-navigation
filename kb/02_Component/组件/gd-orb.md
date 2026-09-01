---
title: gd-orb
aliases:
  - 快捷入口
tags:
  - galnavi/component
  - orb
  - websearch
  - fab
date: 2026-09-01
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-modal]]"
  - "[[ChangeLog-gd v1.5.0]]"
---

# gd-orb

> [!abstract] Summary
> 主站右下角快捷入口。点开两列胶囊（站内入口 / 站点页面）。

## Definition

| 部件 | class | 说明 |
|------|-------|------|
| 根 | `.gd-orb` | `position: fixed`，右下 `56×56`，`z-index: 80` |
| 菜单 | `.gd-orb__menu` | `role="region"`，不要 `role="menu"` |
| 列 | `.gd-orb__col` | 左列站内、右列页面 |
| 项 | `.gd-orb__item` | 真实 `<button>` 或 `<a href>`；`data-gd-orb` |
| 开关 | `.gd-orb__toggle` | 圆钮；`aria-expanded` / `aria-controls` |

左列：标签、酒馆、仓库、弹窗。右列：关于、帮助、友链、殿堂。「弹窗」打开 [[gd-modal]] 欢迎窗。

## Implementation

- `initGdOrb(root, { onAction })`：`onAction` 只处理需要脚本的项（标签 / 酒馆 / 弹窗）；带 `href` 的项让浏览器自己跳
- 打开：根加 `is-open`；菜单 `inert` 在关闭时为 true
- Esc 关闭并焦点回到开关；点菜单外关闭
- 预览演示加 `.gd-orb--demo`（不要 `fixed` 飞出预览盒）

> [!warning] 不要两框
> 不要再往首页塞 `.gd-filter-bar-wrap`。对应 CSS 已删。

## 文件位置

- CSS/JS：`src/extend/websearch/gd-orb.css` / `gd-orb.js`
- 示例：`docs/examples/filter-bar.md`（文件名未改，正文已是 orb）

## Related

- [[gd-modal]] — `popup` 打开欢迎窗
- [[GD 组件库]] — extend/websearch
