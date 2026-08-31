---
title: ChangeLog-Obsidian 格式
tags:
  - galnavi/changelog
  - kb
  - obsidian
date: 2026-08-31
updated: 2026-08-31
type: decision
category: ChangeLog
status: active
related:
  - "[[Obsidian 书写约定]]"
  - "[[MOC-GALNAVI]]"
  - "[[ChangeLog-知识库重组]]"
---

# ChangeLog-Obsidian 格式

## 2026-08-31

知识库改为 [Obsidian Flavored Markdown](https://help.obsidian.md/obsidian-flavored-markdown)。约定见 [[Obsidian 书写约定]]。

### Frontmatter

- 补 `title` / `date` / `updated`
- `tags` 改为 YAML 列表，并加嵌套标签 `galnavi/<分区>`
- `related` 改为 `"[[Note]]"` 列表（原先一行 `[[A]], [[B]]` 不是合法 YAML）
- 文件名与一级标题不同时写 `aliases`（例如 `[[沙盒开发]]`）

### 正文

- 有 Summary 的笔记改成 `> [!abstract] Summary`
- 决策笔记的方案 / 原因改成 `info` / `tip` callout
- 坏链：`[[MD3 对齐口径]]` → `[[Decision-MD3 对齐口径]]`；`[[共享模块]]` → `[[Cloudflare Worker#共享模块边界]]`

### 内容同步（沙盒 2026-08-31）

- 新增 [[Obsidian 书写约定]]、[[Decision-沙盒去 Cookie 与年龄门]]、本文件
- 更新 [[沙盒开发]]（统一 `serve.mjs` :8100）
- 更新 [[gd-modal]]、[[MOC-GALNAVI]]
- 撤下 Cookie 规范文档（不再维护 key 表与双通道写法）

## Related

- [[Obsidian 书写约定]] — 写法
- [[ChangeLog-知识库重组]] — 上次目录重组
- [[沙盒开发]] — 预览行为
