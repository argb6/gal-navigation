---
type: component
category: Component
tags: [navbar, drawer, hamburger, navigation]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[GD 组件库]], [[Web Component]], [[玻璃表面系统]]
---

# gd-navbar

## Summary

导航栏组件：顶栏 + 汉堡菜单 + 抽屉 + 分类导航，桌面/移动端自适应。

## Definition

| 部件 | class | 说明 |
|------|-------|------|
| 顶栏 | `gd-navbar` | 固定顶部，强玻璃背景 |
| Logo | `gd-navbar__logo` | 图标 + 渐变文字 |
| 链接 | `gd-navbar__links` | 桌面端频道链接 |
| 搜索 | `gd-navbar__search` | 内嵌搜索框 |
| 汉堡 | `gd-navbar__hamburger` | 移动端菜单按钮 |
| 抽屉 | `gd-navbar-drawer` | 左侧滑出面板 |
| 手风琴 | `gd-navbar-drawer__acc` | 抽屉内子菜单 |

## Implementation

- `<gd-navbar>` 自定义元素处理抽屉开闭、键盘、焦点
- 汉堡图标动画：opacity + rotate + scale 过渡
- 抽屉：`translateX(-104%)` → `translateX(0)` 滑入
- 手风琴：`grid-template-rows: 0fr → 1fr` 高度动画
- z-index 层级：navbar(100) → overlay(150) → drawer(160) → hamburger(200-240)

## 移动端（≤768px）

- 链接隐藏，显示汉堡按钮
- 搜索框 flex 自适应宽度
- 抽屉覆盖全屏高度

## 文件位置

- CSS：`src/navigation/navbar/gd-navbar.css`
- JS：`src/navigation/navbar/gd-navbar.js`

## Related

- [[Web Component]] — 自定义元素
- [[gd-search]] — 内嵌搜索
