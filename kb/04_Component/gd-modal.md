---
type: component
category: Component
tags: [modal, dialog, age-gate, overlay, focus-trap]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[GD 组件库]], [[Web Component]], [[玻璃表面系统]], [[Decision-Light DOM]]
---

# gd-modal

## Summary

弹窗组件，处理开闭、焦点陷阱、遮罩点击、Esc 关闭、背景 inert。

## Definition

| 变体 | 用途 |
|------|------|
| 年龄门 | 首访确认（`gd-age-gate`） |
| 纳普 | 彩蛋弹窗（`initGdNap`） |
| 重定向 | 倒计时跳转（`startGdRedirectCountdown`） |
| 发布卡 | 发布页卡片（`gd-publish-card`） |

## Implementation

- `<gd-modal>` 自定义元素，`role="dialog"` + `aria-modal="true"`
- 焦点栈：多个弹窗叠加时维护焦点层级
- 关闭后焦点返回触发元素
- 背景 `inert`：弹窗打开时所有非弹窗内容设为 `inert`
- 动画：`transform: scale(0.96)` → `scale(1)` 缩放进入

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
- 年龄门：`src/feedback/modal/gd-age-gate.css` + `.js`
- 发布卡：`src/feedback/modal/gd-publish-card.css`

## Related

- [[Web Component]] — 自定义元素
- [[状态层模式]] — 焦点/遮罩
