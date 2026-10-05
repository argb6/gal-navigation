# db：表结构与查询示例

GALNAVI 用 Cloudflare D1（SQLite）存数据。这里只放表结构和只读查询示例，方便你在本地用 SQLite 复现或接自己的 D1。

不包含：真实数据库文件、D1 / KV / R2 绑定 ID、账号信息、API token。绑定名和库 ID 请在你自己的 `wrangler.toml` 里配置。

## 三个库

| 库（示例名） | 表 | Worker 里的绑定名 | 用在哪 |
|---|---|---|---|
| 主站库 | `navi_sites` | `DB` | websearch、detail |
| 友链库 | `sites` | `FRIEND_DB` | about 页友链列表 |
| 殿堂库 | `resources` | `group1` | palace |

友链库和主站库是两个独立的库。about 页用单独的绑定名 `FRIEND_DB`，不要和主站的 `DB` 混用。

## 目录

- `schema/`：建表语句。`navi_sites` 与本地库一致；`sites` 和 `resources` 按 Worker 实际查询的字段整理，类型为推断。
- `queries/examples.sql`：各页面实际用到的只读查询。
- `ingest/`：新增站点的 JSON 交接格式（JSON Schema + 示例）。

## 本地试一下

```bash
sqlite3 navi.db < schema/navi_sites.sql
sqlite3 navi.db "SELECT item_key, title FROM navi_sites LIMIT 5;"
```

`is_active`：`1` 正常展示，`2` NSFW（websearch 打开开关后才显示），`0` 下架。字段说明另见 `docs/decisions/0003-d1-schema.md`。