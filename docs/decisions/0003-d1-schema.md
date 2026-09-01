# ADR-0003: D1 数据库表结构设计

## 状态

已采纳

## 日期

2026-06

## 背景

需要存储 ACG 站点导航数据（名称、分类、标签、链接、图标等）。数据特点：

- 站点数量：100-500 条
- 查询模式：全量读取（主站列表）、单条读取（详情页）、按分类过滤
- 写入频率：低（人工维护，非用户生成内容）
- 无复杂关系：站点之间无外键关联

## 决策

使用 Cloudflare D1（SQLite），设计两张独立表：

- `navi_sites`：主站导航数据
- `friends`：友情链接数据

## navi_sites 表

| 字段 | 类型 | 说明 |
|------|------|------|
| `item_key` | TEXT PRIMARY KEY | 站点唯一标识（如 `bangumi`、`vndb`） |
| `title` | TEXT NOT NULL | 站点名称 |
| `category` | TEXT NOT NULL | 分类（simulators / websites / tools / company / hanhua） |
| `tags` | TEXT | 逗号分隔标签（如 `galgame,资讯,社区`） |
| `short_desc` | TEXT | 简短描述（卡片副标题） |
| `url` | TEXT | 站点链接 |
| `icon_path` | TEXT | 图标路径（Cloudflare R2，公开域 `assets.galnavi.top`） |
| `md_content` | TEXT | 详情页 Markdown |
| `is_active` | INTEGER 默认 1 | `1` 正常展示；`2` NSFW（导航盾牌打开后才显示）；`0` 下架不列出 |
| `updated_at` | TEXT | 最后更新时间 |

## 分类映射

| DB 值 | 前端键 | 中文标签 |
|-------|--------|----------|
| `simulators` | `simulator` | 模拟器 |
| `websites` | `site` | 网站 |
| `tools` | `tool` | 工具 |
| `company` | `company` | 公司 |
| `hanhua` | `hanhua` | 汉化 |

## 原因

1. **简单直接**：100-500 条数据不需要复杂的关系型设计
2. **全量读取为主**：主站一次加载所有数据，客户端过滤
3. **D1 兼容 SQLite**：开发时可以用 SQLite 工具调试
4. **item_key 作主键**：人类可读，前端可直接用作标识

## 影响

- Worker 主站查询：`SELECT ... FROM navi_sites WHERE is_active IN (1, 2)`；`is_active = 2` 为 NSFW
- NSFW 开关只在 websearch：cookie `gd-nsfw` 默认 `1`，打开为 `2`，有效期 24 小时，每次进入 websearch/detail 刷新时效
- detail：cookie 为 `2` 才输出 `is_active = 2` 的条目；为 `1` 时用 URL 强进 NSFW 详情返回「页面不存在」
- 客户端 JS 负责过滤和搜索（减少 Worker 计算）
- tags 字段用逗号分隔，非规范化存储（足够用，不需要关联表）
- category 值需要在 `worker/shared/constants.js` 中维护映射

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| KV 存储全部数据 | D1 支持 SQL 查询，KV 只适合键值读写 |
| 关联表（categories / tags） | 数据量小，过度设计 |
| 外部数据库（PlanetScale 等） | 增加延迟和运维复杂度 |

## 后续

站点图标已从 Supabase 存储桶迁到 Cloudflare R2（公开域 `assets.galnavi.top`）。`icon_path` 仍存 URL/路径，指向 R2 对象。

分类映射已抄进各 Worker 页内，不再 `import worker/shared/constants.js`。友链页当前查询 `sites`（不是本文的 `friends` 名）。殿堂走独立库 `group1` 的 `resources` 表（`official_url` / `details_url` / `link1`–`link3`）。
