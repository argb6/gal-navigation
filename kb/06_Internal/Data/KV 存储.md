---
type: concept
category: Technology
tags: [kv, key-value, cloudflare, storage]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[Cloudflare Worker]], [[D1 数据库]], [[数据流]]
---

# KV 存储

## Summary

Cloudflare KV 存储轮播图、推荐项、捐款名单、状态监控和站点公告。

## Definition

| 绑定名 | Key | 格式 | 用途 | 使用者 |
|--------|-----|------|------|--------|
| `CAROUSEL_KV` | `carousel_images` | JSON 数组 `["url1","url2"]` | 轮播图 URL | 主站 |
| `FEATURED_KV` | `featured_items` | JSON 数组 `["key1","key2"]` | 推荐项 key | 主站 |
| `DONATE_KV` | `donors` | JSON 数组 `[{name,amount,note,date}]` | 捐款名单 | 捐献页 |
| `STATUS_KV` | `state` | JSON `{failCounts,lastEventAt,uptimeStart,events}` | 监控状态 | 状态页 |
| `STATUS_KV` | `api_cache` | JSON `{date,slot,visits,fetchedAt}` | API 缓存 | 状态页 |
| `NOTICE_KV` | `notice` | 纯文本 | 站点公告 | 状态页 |

## 写入示例

```bash
# 轮播图
wrangler kv key put --binding=CAROUSEL_KV "carousel_images" '["url1","url2"]'

# 推荐项
wrangler kv key put --binding=FEATURED_KV "featured_items" '["key1","key2"]'

# 公告（纯文本）
wrangler kv key put --binding=NOTICE_KV "notice" "站点公告内容"
```

## 读取容错

Worker 端读取 KV 时有多层容错：
1. 尝试 `JSON.parse(raw)`
2. 失败则按逗号分隔拆分
3. 全部失败返回空数组

## Related

- [[D1 数据库]] — SQL 存储
- [[数据流]] — 数据路径
