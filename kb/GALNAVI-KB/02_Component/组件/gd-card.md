---
title: gd-card
tags:
  - galnavi/component
  - card
  - glass
  - friend
  - item
  - palace
date: 2026-08-14
updated: 2026-09-25
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[玻璃表面系统]]"
  - "[[Design Token]]"
  - "[[Decision-玻璃拟态保留]]"
  - "[[gd-groundback]]"
  - "[[gd-button]]"
  - "[[gd-modal]]"
  - "[[ChangeLog-线条背景与快捷栏]]"
  - "[[ChangeLog-gd v1.6.0]]"
---

# gd-card

> [!abstract] Summary
> 卡片组件，三种变体覆盖主站导航卡、友链卡、殿堂条目卡。主站卡点击整卡打开详情弹窗。

## Definition

| 变体 | class | 尺寸 | 用途 |
|------|-------|------|------|
| 主站 | `gd-card gd-card--general`（可点加 `--link`） | 宽 min(400px, 100%)、高按字号行盒固定（≤640px 宽仍 100%） | 主站导航卡片 |
| 友链 | `gd-card--friend` | `auto` × `auto`（max 320px） | 友情链接卡 |
| 条目 | `gd-card--item` | `auto` × `auto` | 圣器殿堂条目 |

## Implementation

- 玻璃表面：`background: var(--gd-glass-bg)` + `border: 1px solid var(--gd-glass-border)`
- **禁止** `backdrop-filter` / `box-shadow`
- Hover：`background: var(--gd-glass-bg-hover)` + `border-color: var(--gd-color-border-hover)` + `filter: brightness(1.05)`
- **禁止垂直位移**（无 `translateY`）
- 主站网格：`gd-card-grid`，每行最多 6 张

### 主站导航卡

- **卡面**：仅图标、标题、简介（subtitle）；**不要**放 `gd-card__tags` 与底部双按钮
- **交互**：整卡可点（`role="button"` + Enter/Space，或 `button`；禁止 `div onclick`）；`aria-haspopup="dialog"`
- **弹窗**：`gd-modal`（建议 `gd-modal--site-card`）展示完整简介、标签列表、「介绍详情」「链接直达」；关闭用 Esc / 遮罩 / `data-gd-close`。关闭钮是 36px 圆形玻璃按钮，不要方框描边
- 标签在弹窗内仍靠左（`justify-content: flex-start`）

## 条目卡变体（殿堂）

- Worker 内联必须带 `width: auto; height: auto`。漏掉会继承主站卡 420×212，游戏名被挤成 0 宽，只剩序号和官网/详情/外链
- 桌面端（≥769px）：横排布局
- 移动端（≤768px）：纵排紧凑
- 颜色系统：金色（divine）/ 红色（demonic）/ 绿色（immortal）
- 表面线条：`::before` 铺 R2 线条图案，`mix-blend-mode: screen`，`filter: blur(10.8px)`（与页面背景同款；不用 `backdrop-filter`）

> [!bug] 名称消失
> 不是 D1 没数据。是 CSS 尺寸继承。字段仍是 `r.name`、`official_url`、`details_url`、`link1/2/3`。

## 文件位置

- 源码：`src/display/card/gd-card.css`
- 弹窗：`src/feedback/modal/gd-modal.css` + `gd-modal.js`
- 预览：`src/preview/index.html` `#card` + `#siteCardModal`

## Related

- [[玻璃表面系统]] — 玻璃样式
- [[Design Token]] — 标签色/形状 token
- [[gd-groundback]] — 同款线条层
- [[gd-modal]] — 主站卡详情弹窗
- [[gd-button]] — 弹窗内 `gd-card__btn--detail` / `--link`
- [[存储]] — `resources` 字段
- [[ChangeLog-线条背景与快捷栏]] — 尺寸坑
- [[ChangeLog-gd v1.6.0]] — 圆形关闭钮