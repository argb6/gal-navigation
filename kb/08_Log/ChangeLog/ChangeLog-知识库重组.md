---
type: decision
category: ChangeLog
tags: [kb, restructure, sanitization]
status: active
created: 2026-08-14
updated: 2026-08-14
---

# ChangeLog-知识库重组

## 2026-08-14

### 目录重组

- 06_Data + 07_Operation → 06_Internal（Data / Deployment / Security）
- 09_Log → 08_Log（Decision / Problem / ChangeLog）
- 安全头从 05_Architecture 移入 06_Internal/Security

### 脱敏处理

- D1 表名：navi_sites → sites，group1 → GROUP_DB
- KV 绑定：HERO_KV → CAROUSEL_KV，hero_images → carousel_images
- 域名：galnavi.top → example.com
- Cookie：galnavi-verified → site-verified
- 中文名：神魔 → 殿堂，shenmo → palace

### 新增节点

- Problem-公告注入布局错乱
- Problem-shenmo 命名混乱
- ChangeLog-知识库重组（本文件）

### MOC 重写

- 从文件列表改为知识入口
- 按「产品 → 架构 → 组件 → Worker → 内部 → 决策 → 问题」组织
- 组件表增加「关联决策」列
- 页面数据流表增加 D1/KV 列

### 组件节点补充关联

- gd-modal → +Decision-Light DOM
- gd-card → +Decision-玻璃拟态保留
- gd-button → +Decision-MD3 对齐口径
- GD 组件库 → +Decision-MD3 对齐口径 +Decision-玻璃拟态保留
