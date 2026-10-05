-- 各页面实际使用的只读查询（D1 / SQLite 通用）

-- websearch：主站列表，含 NSFW 条目，前端按开关过滤
SELECT item_key, title, category, tags, short_desc, url, icon_path, updated_at, is_active
FROM navi_sites
WHERE is_active IN (1, 2)
ORDER BY category ASC;

-- detail：单个站点详情（? = item_key）
SELECT title, short_desc, tags, md_content, category, is_active
FROM navi_sites
WHERE item_key = ?;

-- about：友链列表（绑定 FRIEND_DB）
SELECT id, name, url, des, favicon_url, catalog
FROM sites;

-- palace：殿堂资源（绑定 group1）
SELECT *
FROM resources
ORDER BY category, id;

-- 维护常用：按分类统计在架数量
SELECT category, COUNT(*) AS n
FROM navi_sites
WHERE is_active IN (1, 2)
GROUP BY category
ORDER BY n DESC;