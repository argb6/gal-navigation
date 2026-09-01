---
title: README
aliases:
  - MOC-GALNAVI
  - Obsidian 书写约定
  - gd-kb version
  - 知识库版本
  - kb 格式
tags:
  - galnavi/index
  - MOC
date: 2026-08-14
updated: 2026-09-01
type: concept
category: Index
status: active
related:
  - "[[项目概述]]"
  - "[[记录索引]]"
---

# GALNAVI 知识库

现网怎么跑、为什么这样写。组件版本看 `docs/`，这里不抄。

| | 号 | 改哪 |
|--|----|------|
| 知识库 | **1.2.0** | 改目录/口径时升 `docs/gd.config.json` 的 `kbVersion`，并改本表 |
| 组件库 gd | **1.5.2** | 改 `version` + `docs/CHANGELOG.md` |

## 查什么去哪

| 你要 | 打开 |
|------|------|
| 站点、页面、目录 | [[项目概述]] |
| Worker 运行时、零 import | [[Cloudflare Worker]] |
| 路由、单文件、GitHub layer | [[Worker 架构]] |
| 哪页读 D1/KV | [[数据流]] |
| 表名、绑定名、R2 | [[存储]] |
| 部署 / 沙盒 / CSP | [[部署流程]] · [[沙盒开发]] · [[安全头]] |
| 组件红线 | [[GD 组件库]] → `体系/`、`组件/` |
| 决策、示例、版本日志 | [[记录索引]]（路径在 `docs/`） |
| 踩过的坑 | [[Problem-公告注入布局错乱]] · [[Problem-shenmo 命名混乱]] |

本库文件夹（连续编号）：`01_Project` `02_Component` `03_Architecture` `04_Internal` `05_Log`。入口就是本 README。

## 怎么写一篇

- 文件名 = `[[wikilink]]`。搬家靠文件名，不靠路径。
- frontmatter 里 `related` 必须写成 `"[[笔记]]"` 列表，不能写在一行里。
- 决策/问题/变更：`Decision-` / `Problem-` / `ChangeLog-`。长文放 `docs/decisions/`、`docs/examples/`、`docs/CHANGELOG.md`，库内只留指针。
- 合并后的旧名写在 `aliases`（例如 [[存储]] 仍能打开旧的 D1/KV/R2 链接）。
- 正文用 `[[笔记]]`；文末 `## Related`。Callout 每行都要 `>`。

## Related

- [[项目概述]] — 产品
- [[记录索引]] — docs 路径
- [[GD 组件库]] — 界面
