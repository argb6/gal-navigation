---
title: Problem-公告注入布局错乱
tags:
  - galnavi/problem
  - status
  - notice
  - layout
  - dom
  - bug
date: 2026-08-14
updated: 2026-08-31
type: decision
category: Problem
status: resolved
related:
  - "[[存储]]"
---

# Problem-公告注入布局错乱

> [!bug] 现象
> 状态页写入公告后，桌面端页脚和右侧索引位置互换。移动端正常。

## 原因

`renderPage()` 中公告注入代码：

```js
out.replace('<div class="gd-empty-state" id="noticeEmpty">', d.notice)
```

只替换了**开头标签**，空状态的内部内容（图标 `<div>`、标题 `<p>`）和闭合 `</div>` 残留在 DOM 中，导致 `status-notice` 容器结构被破坏，CSS Grid 布局错乱。

移动端正常是因为单列布局不受影响。

## 修复

> [!success] 修复
> 不要只替换开头标签。把整个空状态占位块换成公告 HTML。

替换整个空状态占位块：

```js
const noticeBlock = '<div class="gd-empty-state" id="noticeEmpty"><div class="gd-empty-state__icon" aria-hidden="true">📢</div><p class="gd-empty-state__title">暂无公告</p></div>';
out = out.replace(noticeBlock, d.notice);
```

## 教训

- `String.replace()` 只替换匹配的子串，如果目标是多层嵌套 DOM，必须匹配完整的开始到结束
- 桌面端双列布局（Grid）比移动端单列更容易暴露 DOM 结构问题
- 测试时必须同时检查桌面和移动端
