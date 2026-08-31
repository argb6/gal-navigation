---
title: Cloudflare R2
aliases:
  - R2
  - 静态资源
tags:
  - galnavi/technology
  - r2
  - cloudflare
  - storage
  - assets
date: 2026-08-31
updated: 2026-08-31
type: concept
category: Technology
status: active
related:
  - "[[Cloudflare Worker]]"
  - "[[KV 存储]]"
  - "[[D1 数据库]]"
  - "[[安全头]]"
---

# Cloudflare R2

> [!abstract] Summary
> 站点静态资源（图标、品牌标等图片）放在 Cloudflare R2，通过公开域 `assets.galnavi.top` 读取。已替代原先的 Supabase Storage。

## Definition

| 项 | 值 |
|----|-----|
| 存储 | Cloudflare R2（对象存储） |
| 公开域 | `https://assets.galnavi.top/` |
| 用途 | favicon / 站点图标 / logo 等静态图 |
| 谁读 | 浏览器（`<img>`、`rel=icon`、OG 图） |

## 常用对象

| 路径 | 用途 |
|------|------|
| `/favicon.png` | favicon |
| `/icon.png` | apple-touch-icon、OG/Twitter 图 |
| `/logo.png` | 导航栏与发布卡品牌标 |

页面里写成完整 URL，例如 `https://assets.galnavi.top/logo.png`。D1 的 `icon_path` 存各站点图标的 R2 URL。

## 和别的存储怎么分

| 存储 | 存什么 |
|------|--------|
| [[D1 数据库]] | 站点/友链/殿堂的结构化行 |
| [[KV 存储]] | 轮播 URL 列表、推荐 key、公告等小 JSON |
| R2（本页） | 实际图片文件 |

> [!note] 以前
> 图标曾放在 Supabase 公开桶 `galnavi-assets`。现网与组件库预览都改为 R2，CSP 的 `img-src` 仍允许 `https:`，所以自定义域可以直接用。

## Related

- [[D1 数据库]] — `icon_path` 指向 R2
- [[安全头]] — `img-src` 允许 https 图
- [[Cloudflare Worker]] — 运行时绑定
