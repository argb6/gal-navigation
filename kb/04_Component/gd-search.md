---
type: component
category: Component
tags: [search, input, filter, toolbar]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[GD 组件库]], [[Web Component]]
---

# gd-search

## Summary

搜索框组件，支持 toolbar（主站）和 group（殿堂）两种变体。

## Definition

| 变体 | class | 用途 |
|------|-------|------|
| 默认 | `gd-search` | 内嵌导航栏 |
| Toolbar | `gd-search--toolbar` | 全宽搜索（max 420px） |
| Group | `gd-search--group` | 金色主题（圣器殿堂） |

## Implementation

- `<gd-search>` 自定义元素可自动生成 HTML 结构
- Focus → `.is-expanded` 展开
- Blur（空）→ 收起
- 输入 → 显示清除按钮（`.is-visible`）
- 清除 → 清空 + 重新聚焦 + 触发 input 事件
- 禁用浏览器原生清除按钮（`::-webkit-search-cancel-button`）

## Group 变体（殿堂）

- 48px 高度，14px 圆角
- Focus 图标变金色（`--gd-color-gold-rgb`）
- 输入框金色边框（`rgba(gold-rgb, 0.28)`）

## 文件位置

- CSS：`src/navigation/search/gd-search.css`
- JS：`src/navigation/search/gd-search.js`

## Related

- [[Web Component]] — 自定义元素
- [[gd-navbar]] — 内嵌搜索框
