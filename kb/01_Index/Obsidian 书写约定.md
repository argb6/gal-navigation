---
title: Obsidian 书写约定
aliases:
  - kb 格式
  - OFM
tags:
  - galnavi/index
  - obsidian
  - writing
date: 2026-08-31
updated: 2026-08-31
type: concept
category: Index
status: active
related:
  - "[[MOC-GALNAVI]]"
  - "[[ChangeLog-Obsidian 格式]]"
---

# Obsidian 书写约定

> [!abstract] Summary
> `kb/GALNAVI-KB` 按 [Obsidian Flavored Markdown](https://help.obsidian.md/obsidian-flavored-markdown) 写。笔记之间用 `[[wikilink]]`；frontmatter 里的链接必须加引号。

## Frontmatter

```yaml
---
title: 笔记标题
aliases:
  - 文件名与 title 不同时才写
tags:
  - galnavi/architecture
  - storage
date: 2026-08-14
updated: 2026-08-31
type: concept
category: Architecture
status: active
related:
  - "[[安全头]]"
  - "[[Worker 架构]]"
---
```

> [!warning] YAML
> `related: [[A]], [[B]]` 非法。`[` 会被当成数组起点。写成列表，每项 `"[[Note]]"`。

| 字段 | 用途 |
|------|------|
| `title` | 阅读视图标题，通常等于一级标题 |
| `aliases` | 文件名 ≠ title 时补上，保证旧 `[[文件名]]` 能解析 |
| `tags` | YAML 列表。第一项用嵌套标签 `galnavi/<分区>` |
| `date` / `updated` | `YYYY-MM-DD` |
| `type` | `concept` / `component` / `architecture` / `decision` |
| `category` | 与目录分区对应 |
| `status` | `active` / `resolved` / `superseded` |
| `related` | 带引号的 wikilink 列表 |

## 正文

正文用标准 Markdown。Obsidian 扩展只用下面这些。

| 语法 | 用法 |
|------|------|
| `[[笔记名]]` | 库内互链（按文件名，不含 `.md`） |
| `[[笔记名#标题]]` | 链到章节 |
| `[[笔记名\|显示文字]]` | 自定义锚文本 |
| `![[笔记名]]` | 嵌入整篇 |
| `> [!type]` | Callout |
| `==高亮==` | 强调一句结论 |
| `%%注释%%` | 阅读视图隐藏 |

外链用 `[文字](https://…)`，不要用 wikilink 包 URL。

## Callout

| 类型 | 用在 |
|------|------|
| `abstract` | 篇首 Summary |
| `info` | 方案 / 定义 |
| `tip` | 原因 / 做法 |
| `warning` | 口径变更、红线 |
| `bug` | 问题现象 |
| `success` | 已修复 |
| `example` | 代码示例旁注 |
| `question` | 未决 |

```markdown
> [!abstract] Summary
> 一句话说明这篇在讲什么。

> [!warning] 红线
> 卡片类禁止 `backdrop-filter`。

> [!faq]- 折叠
> 默认收起的补充说明。
```

Callout 每一行都要有 `>`。表格、代码块放进 callout 时同样加前缀，或干脆放在 callout 外面。

## 嵌套标签

| 分区 | 标签 |
|------|------|
| `01_Index` | `galnavi/index` |
| `02_Project` | `galnavi/project` |
| `03_Technology` | `galnavi/technology` |
| `04_Component` | `galnavi/component` |
| `05_Architecture` | `galnavi/architecture` |
| `06_Internal` | `galnavi/ops`（部署）/ 仍可叠 `galnavi/architecture`（安全） |
| `08_Log/Decision` | `galnavi/decision` |
| `08_Log/Problem` | `galnavi/problem` |
| `08_Log/ChangeLog` | `galnavi/changelog` |

## 文件名

- 一篇一事，文件名 = 默认 wikilink。
- 决策：`Decision-短名.md`
- 问题：`Problem-短名.md`
- 变更：`ChangeLog-短名.md`
- 索引：`MOC-*.md`

## Related

每篇文末保留 `## Related`，用 `[[wikilink]] — 一句关系`。和 frontmatter `related` 对齐，后者给属性面板和查询用。

## See also

- [[MOC-GALNAVI]] — 知识入口
- [[ChangeLog-Obsidian 格式]] — 这次格式迁移记录
