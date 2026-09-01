---
title: gd-navbar
tags:
  - galnavi/component
  - navbar
  - drawer
  - hamburger
  - navigation
date: 2026-08-14
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[Web Component]]"
  - "[[玻璃表面系统]]"
  - "[[gd-search]]"
  - "[[gd-button]]"
  - "[[ChangeLog-gd v1.5.0]]"
---

# gd-navbar

> [!abstract] Summary
> 导航栏：顶栏 + 汉堡 + 抽屉 + NSFW。桌面整组居中；搜索固定 300px。

## Definition

| 部件 | class | 说明 |
|------|-------|------|
| 顶栏 | `gd-navbar` | 高度 `--gd-nav-height`；底 `--gd-chrome-bar-bg` + `--gd-glass-nav-blur` |
| Logo | `gd-navbar__logo` | 图 28px + 渐变字 |
| 链接 | `gd-navbar__links` | 桌面频道 |
| 搜索 | `gd-navbar__search` | 桌面固定 300px；**不要** `expandable` |
| NSFW | `gd-navbar__nsfw` | 桌面右侧盾牌；关=红实底、开=绿实底；点一下闪「开」，再点闪「关」，随后回到盾牌；提示用 `gd-tooltip-wrap` |
| 汉堡 | `gd-navbar__hamburger` | 移动端菜单按钮 |
| 抽屉 | `gd-navbar-drawer` | 左侧滑出面板 |
| 抽屉 NSFW | `gd-navbar-drawer__nsfw` | 全宽；外观用 `gd-button--nsfw`；关=红、开=绿；闪「已开启/已关闭」后回到盾牌+NSFW；底部留 `56px + safe-area` |
| 手风琴 | `gd-navbar-drawer__acc` | 抽屉内子菜单 |

## Implementation

- `<gd-navbar>` 自定义元素处理抽屉开闭、键盘、焦点
- `initGdNsfwToggle`：桌面盾牌与抽屉共用 `[data-gd-nsfw]`
- 桌面 NSFW cookie（websearch）：默认 `1` 隐藏，打开为 `2`，24 小时
- 桌面顶栏：Logo / 频道 / 搜索 / 盾牌紧挨，整组居中；inner 桌面 padding 32px、手机 12px
- 抽屉底部：`gd-button gd-button--pill gd-button--nsfw gd-navbar-drawer__nsfw`；手机端顶栏 `__right` 隐藏；抽屉 `100dvh`，底部 `56px + env(safe-area-inset-bottom)`
- 汉堡图标动画：opacity + rotate + scale 过渡
- 抽屉：`translateX(-104%)` → `translateX(0)` 滑入
- 手风琴：`grid-template-rows: 0fr → 1fr` 高度动画
- z-index：navbar(100) → overlay(150) → drawer(160) → hamburger(200-240)

## 移动端（≤768px）

- 链接隐藏，显示汉堡按钮
- 搜索框 flex 自适应宽度
- 抽屉覆盖全屏高度

## 文件位置

- CSS：`src/navigation/navbar/gd-navbar.css`
- JS：`src/navigation/navbar/gd-navbar.js`

## Related

- [[Web Component]] — 自定义元素
- [[gd-search]] — 顶栏搜索不要 expandable
- [[gd-button]] — 抽屉 `gd-button--nsfw`
- [[ChangeLog-gd v1.5.0]] — 红绿实底与闪示
