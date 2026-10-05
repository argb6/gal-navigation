-- 主站库：navi_sites（Worker 绑定名 DB）
-- 与本地库结构一致。item_key 按唯一处理，入库时以 item_key 做 upsert。
CREATE TABLE IF NOT EXISTS navi_sites (
  id          INTEGER,
  item_key    TEXT,              -- 唯一标识，小写 slug，如 bangumi
  title       TEXT,              -- 展示名
  category    TEXT,              -- simulators / websites / tools / company / hanhua
  tags        TEXT,              -- 逗号分隔，无空格
  short_desc  TEXT,              -- 卡片副标题
  url         TEXT,              -- 站点链接
  icon_path   TEXT,              -- 图标 URL（公开静态资源）
  md_content  TEXT,              -- 详情页 Markdown
  is_active   INTEGER DEFAULT 1, -- 1 正常 / 2 NSFW / 0 下架
  updated_at  TEXT,              -- ISO 日期或 YYYY-MM-DD
  PRIMARY KEY (id, item_key)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_navi_sites_id ON navi_sites (id);