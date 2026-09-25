---
title: gd-footer
tags:
  - galnavi/component
  - footer
  - layout
date: 2026-09-01
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-groundback]]"
---

# gd-footer

> [!abstract] Summary
> 全站页脚。短页贴视口底，长页跟在正文后。必须压过背景层，否则看起来像没有页脚。

## Definition

| class | 说明 |
|-------|------|
| `.gd-footer` | 居中链接 + 版权行；`z-index: 1`；`margin-top: auto` |
| `.gd-footer--page` | 总览页变体（about / help / donate / friend / status） |
| `.gd-footer__nav` | sitemap、robots、联系站长、赞助、友链、站点状态 |
| `.gd-footer__sep` | `\|` 分隔 |
| `.gd-footer__copy` | `© 2026 GALNAVI · 愿每一次探索都有新的收获` |

贴底：`body` 用 flex 列 + `min-height: 100dvh`（或 `gd-page`）。`--gd-vvh` 由 `initGdStickyViewport()` 写入。

## 总览页

about / help / donate / friend / status 的 [[gd-groundback]] 是 `z-index: 0`。页脚在 shell 外面，必须自己 `position: relative; z-index: 1`。只有 shell 抬层、页脚不抬，滚到底只会看到背景。

> [!warning] 不要盖住
> 不要给 `.gd-footer--page` 写 `margin-top: 0` 盖掉 `auto`，短页页脚会停在正文后面，视口底是空的。

## 文件位置

- CSS：`src/foundation/layout/gd-footer.css`
- 贴底：`src/foundation/layout/gd-layout.css` / `gd-layout.js`

## Related

- [[gd-groundback]] — 背景层叠
- [[GD 组件库]] — foundation/layout
