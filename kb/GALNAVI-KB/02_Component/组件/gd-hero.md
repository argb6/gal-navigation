---
title: gd-hero
tags:
  - galnavi/component
  - hero
  - carousel
  - skeleton
date: 2026-09-01
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[ChangeLog-线条背景与快捷栏]]"
---

# gd-hero

> [!abstract] Summary
> 主站轮播。首屏用骨架，不要把整段 `hidden`。

## Definition

| class | 用途 |
|-------|------|
| `.gd-hero` | 轮播根 |
| `.gd-hero.is-loading` | 藏箭头、圆点、渐变 |
| `.gd-skeleton.gd-skeleton--hero` | 填满轮播盒的骨架 |

## 加载

1. 进页：`<section>` 可见，`.gd-hero` 带 `is-loading`，里面放 `#heroSkeleton`
2. 图预加载完：去掉骨架节点，`classList.remove('is-loading')`

> [!warning] 不要 hidden
> 把整段轮播 `hidden` 会让首屏空白，骨架也出不来。

图片用 `background-image`，不要放 `<img>`。首张 slide 必须 `is-active`。自动播放 4.5s。

## 文件位置

- CSS/JS：`src/display/hero-carousel/`
- 示例：`docs/examples/carousel.md`

## Related

- [[GD 组件库]] — display 组
- [[ChangeLog-线条背景与快捷栏]] — 骨架首屏
