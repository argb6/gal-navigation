---
title: gd-leave
tags:
  - galnavi/component
  - leave
  - link
date: 2026-10-05
updated: 2026-10-05
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[gd-button]]"
  - "[[gd-modal]]"
---

# gd-leave

> [!abstract] Summary
> 外链离开时，轮廓光沿控件外圈跑两圈。亮起和收回都是渐变。转完才跳转。

## Definition

| 对象 | 光 |
|------|----|
| 链接直达、殿堂卡片按钮 | 跟按钮颜色相近 |
| 文字链接 | 白色轮廓，转角是圆角。字本身不发光 |
| 详情页条目 | 贴在条目外轮廓（`.gd-section-card__link`） |
| 通知条、页脚 | 不用 |

## 过程

光从 0 慢慢亮起，沿外轮廓转两圈，结束时慢慢回到 0。动画结束才打开目标，大约 2.4 秒。减少动效时不画光，仍等待同样时长。

## 文件位置

- CSS：`src/feedback/leave/gd-leave.css`
- 预览：`src/preview/index.html` 的 `#leave`
