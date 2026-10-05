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
updated: 2026-09-28
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-modal]]"
  - "[[ChangeLog-gd v1.5.0]]"
  - "[[ChangeLog-gd v1.6.0]]"
  - "[[ChangeLog-gd v1.6.1]]"
---

# gd-orb

> [!abstract] Summary
>有页脚的页面右下角都有这颗蓝色星星。圆钮可在页面内拖动，点开展开快捷入口，仅保留标签、仓库、弹窗、殿堂。主站上标签和弹窗留在本页；其它页点这两项会回到主站。

## Definition

| 部件 | class | 说明 |
|------|-------|------|
| 根 | `.gd-orb` | `position: fixed`，默认右下 `56×56`，可拖动。位置记在 `galnavi-orb-pos`，存的是离视口右缘和下缘的距离，换页时先藏住再放回原处 |
| 菜单 | `.gd-orb__menu` | `role="region"`，不要 `role="menu"` |
| 列 | `.gd-orb__col` | 单列竖排 |
| 项 | `.gd-orb__item` | 真实 `<button>` 或 `<a href>`；`data-gd-orb` |
| 开关 | `.gd-orb__toggle` | 圆钮；收起为五角星，展开换成叉。class 仍是 `.gd-orb__icon--grid` / `--close` |

保留项：标签、仓库、弹窗、殿堂（已去掉酒馆 / 关于 / 帮助 / 友链）。`popup` 可打开 [[gd-modal]] 欢迎窗。

## Implementation

- `initGdOrb(root, { onAction })`：`onAction` 只处理需要脚本的项（标签 / 酒馆 / 弹窗）；带 `href` 的项让浏览器自己跳
- 打开：根加 `is-open`；菜单 `inert` 在关闭时为 true
- Esc 关闭并焦点回到开关；点菜单外关闭
- 预览演示加 `.gd-orb--demo`（不要 `fixed` 飞出预览盒）。框内可拖，不写 `galnavi-orb-pos`
- 拖动超过约 6 像素才算移动，短按仍开关菜单。靠近上沿或左沿时菜单翻到下方或右侧

> [!warning] 不要两框
> 不要再往首页塞 `.gd-filter-bar-wrap`。对应 CSS 已删。

## 文件位置

- CSS/JS：`src/extend/websearch/gd-orb.css` / `gd-orb.js`
- 示例：`docs/examples/filter-bar.md`（文件名未改，正文已是 orb）

## Related

- [[gd-modal]] — `popup` 打开欢迎窗
- [[GD 组件库]] — extend/websearch
- [[ChangeLog-gd v1.6.0]] — 五角星图标
- [[ChangeLog-gd v1.6.1]] — 圆钮可拖动
