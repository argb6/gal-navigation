-- 友链库：sites（Worker 绑定名 FRIEND_DB，独立于主站 DB）
-- 按 about 页实际查询的字段整理，类型为推断。
CREATE TABLE IF NOT EXISTS sites (
  id           INTEGER PRIMARY KEY,
  name         TEXT,   -- 站点名
  url          TEXT,   -- 链接
  des          TEXT,   -- 简介
  favicon_url  TEXT,   -- 图标
  catalog      TEXT    -- 分组
);