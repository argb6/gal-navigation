---
title: gd-search
tags:
  - galnavi/component
  - search
  - input
  - filter
  - toolbar
date: 2026-08-14
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[Web Component]]"
  - "[[gd-navbar]]"
  - "[[ChangeLog-gd v1.5.0]]"
---

# gd-search

> [!abstract] Summary
> 搜索框。顶栏固定 300px；殿堂用 group 金色。只有带 `expandable` 时聚焦才变宽。

## Definition

| 变体 | class | 用途 |
|------|-------|------|
| 默认 | `gd-search` | 内嵌导航栏 |
| Toolbar | `gd-search--toolbar` | 全宽搜索（max 420px） |
| Group | `gd-search--group` | 金色主题（圣器殿堂） |

## Implementation

- `<gd-search>` 可自动生成结构；`initGdSearch` 管清除和帮助
- 输入 → 清除按钮 `.is-visible`；点清除清空并回焦
- **不要**给顶栏搜索加 `expandable`。`initGdSearch` 只在宿主有该属性时才加 `is-expanded`
- 顶栏搜索宽度固定 300px（手机端 flex 撑满）
- 禁用原生 `::-webkit-search-cancel-button`

## 帮助问号

自定义元素加 `help`。默认文案（空格必须写成 `[空格]`）：

```
ACG[空格]小说 包含ACG或小说的卡片
ACG[空格]+小说，同时包含ACG和小说的卡片
ACG[空格]-小说，包含ACG但不能有小说的卡片
```

`help-text` 可改文案。悬停 / 焦点出 `.gd-search__help-tip`。

## Group 变体（殿堂）

- 48px 高度，14px 圆角
- Focus 图标变金色（`--gd-color-gold-rgb`），与边框同色
- 结构：`.gd-search--group` 内包 `.gd-search > .gd-search__box`

## 文件位置

- CSS：`src/navigation/search/gd-search.css`
- JS：`src/navigation/search/gd-search.js`

## Related

- [[Web Component]] — 自定义元素
- [[gd-navbar]] — 顶栏搜索不要 expandable
- [[ChangeLog-gd v1.5.0]] — 空格为或
