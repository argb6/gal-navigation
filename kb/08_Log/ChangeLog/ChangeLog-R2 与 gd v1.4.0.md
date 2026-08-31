---
title: ChangeLog-R2 与 gd v1.4.0
aliases:
  - ChangeLog-R2
tags:
  - galnavi/changelog
  - r2
  - gd
  - footer
date: 2026-08-31
updated: 2026-08-31
type: decision
category: ChangeLog
status: active
related:
  - "[[Cloudflare R2]]"
  - "[[GD 组件库]]"
  - "[[项目概述]]"
---

# ChangeLog-R2 与 gd v1.4.0

## 2026-08-31

### 静态资源

- 图标、品牌标、预览配图从 Supabase Storage 改为 [[Cloudflare R2]]
- 公开域：`https://assets.galnavi.top/`
- CSP `img-src` 说明改为 R2，不放宽指令本身

### gd v1.4.0

- 短页 `gd-footer` 贴视口底（`gd-page` + `initGdStickyViewport`）
- 详情卡片浏览器缩放时反向缩放（`initGdInverseZoom`）
- 主站卡 420×212、网格最多 6 列；filter-bar 胶囊 75×40
- 预览页：`src/preview/index.html`

## Related

- [[Cloudflare R2]] — 对象存储
- [[GD 组件库]] — 组件约定
- [[安全头]] — CSP
