-- 殿堂库：resources（Worker 绑定名 group1）
-- 按 palace 页实际用到的字段整理，类型为推断；线上表可能还有其他列。
CREATE TABLE IF NOT EXISTS resources (
  id            INTEGER PRIMARY KEY,
  name          TEXT,
  category      TEXT,
  official_url  TEXT,
  details_url   TEXT,
  link1         TEXT,
  link2         TEXT,
  link3         TEXT
);