---
title: gd-modal
tags:
  - galnavi/component
  - modal
  - dialog
  - overlay
  - focus-trap
date: 2026-08-14
updated: 2026-09-01
type: component
category: Component
status: active
related:
  - "[[GD 组件库]]"
  - "[[Web Component]]"
  - "[[玻璃表面系统]]"
  - "[[Decision-Light DOM]]"
  - "[[Decision-沙盒去 Cookie 与年龄门]]"
  - "[[gd-orb]]"
---

# gd-modal

> [!abstract] Summary
> 弹窗组件，处理开闭、焦点陷阱、遮罩点击、Esc 关闭、背景 inert。

## Definition

| 变体 | 用途 |
|------|------|
| 彩蛋 | 弹窗（`initGdNap`） |
| 重定向 | 倒计时跳转（`startGdRedirectCountdown`） |
| 发布卡 | 发布页卡片（`gd-publish-card`） |
| 欢迎窗 | `#welcomeModal`（主站首访 + [[gd-orb]]「弹窗」） |

## Implementation

- `<gd-modal>` 自定义元素，`role="dialog"` + `aria-modal="true"`
- 焦点栈：多个弹窗叠加时维护焦点层级
- 关闭后焦点返回触发元素
- 背景 `inert`：弹窗打开时所有非弹窗内容设为 `inert`
- 动画：`transform: scale(0.96)` → `scale(1)` 缩放进入

## 欢迎弹窗

主站 `#welcomeModal`：`gd-modal-overlay` + `gd-modal`。`openWelcome` / `closeWelcome` 始终绑定（不只首访）。

- 介绍：一个面向 Galgame / ACG 爱好者的站点导航与信息整理平台。
- 下一行居中加粗：✨ 详情：新手优先看卡片详情✨
- 列表：搜索 / 标签 / 帮助文档 / 问题反馈 / 资源说明（已去掉日本节点）
- 帮助/关于链接：`text-align:center`
- 首访键：`localStorage` `galnavi-welcome-seen`

## API

```js
openGdModal(overlay)           // 打开弹窗
closeGdModal(overlay)          // 关闭弹窗
bindGdModal(selector, trigger) // 绑定触发器
startGdRedirectCountdown(overlay, seconds, onDone) // 倒计时跳转
```

## 文件位置

- CSS：`src/feedback/modal/gd-modal.css`
- JS：`src/feedback/modal/gd-modal.js`
- 发布卡：`src/feedback/modal/gd-publish-card.css`

## Related

- [[Web Component]] — 自定义元素
- [[状态层模式]] — 焦点/遮罩
- [[Decision-沙盒去 Cookie 与年龄门]] — 年龄门已卸掉
- [[gd-orb]] — 「弹窗」打开欢迎窗
