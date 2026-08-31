# ADR-0007: KV 存储策略（轮播图/推荐/捐款/状态/公告）

## 状态

已采纳

## 日期

2026-06

## 背景

除了 D1 结构化数据外，还有几类非结构化数据需要存储：

- 轮播图 URL 列表
- 推荐项 key 列表
- 捐款名单
- 站点状态监控数据
- 站点公告

这些数据特点：读多写少、无需 SQL 查询、值为 JSON 或纯文本。

## 决策

使用 Cloudflare KV，按用途分为多个命名空间，每个命名空间存储一类数据。

## KV 命名空间

| 绑定 | Key | 格式 | 用途 |
|------|-----|------|------|
| HERO_KV | `hero_images` | JSON 数组 `["url1","url2"]` | 首页轮播图 |
| FEATURED_KV | `featured_items` | JSON 数组 `["key1","key2"]` | 首页推荐项 |
| DONATE_KV | `donors` | JSON 数组 `[{name,amount,note,date}]` | 捐款名单 |
| STATUS_KV | `state` | JSON `{failCounts,lastEventAt,uptimeStart,events}` | 监控状态 |
| STATUS_KV | `api_cache` | JSON `{date,slot,visits,fetchedAt}` | CF API 缓存 |
| NOTICE_KV | `notice` | 纯文本 | 站点公告 |

## 原因

1. **KV 适合键值场景**：轮播图/推荐/捐款都是「一个 key 对应一个 JSON 值」
2. **全球边缘复制**：KV 读取在边缘节点，延迟极低
3. **无需 SQL**：这些数据不需要 WHERE/JOIN 等查询
4. **独立命名空间**：按用途隔离，权限清晰

## 读取容错

Worker 端读取 KV 时有多层容错：

```js
async function fetchHeroImages(env) {
  const raw = await env.HERO_KV.get('hero_images');
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [p];
  } catch (e) {
    // 逗号分隔兜底
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
}
```

## 影响

- KV 有最终一致性（写入后最多 60 秒生效）
- 单个值最大 25MB（远超需求）
- 命名空间需要在 wrangler.toml 中绑定
- 管理通过 `wrangler kv key put` 命令

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| 全部存 D1 | KV 更适合简单键值，且全球边缘复制 |
| 外部 Redis | 增加延迟和运维复杂度 |
| 硬编码到 Worker | 需要重新部署才能更新数据 |
