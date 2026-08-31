# ADR-0008: 路由策略（error.js catch-all + Service Binding）

## 状态

已采纳

## 日期

2026-06

## 背景

GALNAVI 有 9 个独立 Worker 页面，需要决定请求如何路由到正确的 Worker。

## 决策

使用 `error.js` 作为 catch-all 路由器，通过 Cloudflare Service Binding 将请求分发到各页面 Worker。

## 路由表

```
/            → index Worker
/nav/        → websearch Worker
/nav/detail/ → detail Worker
/nav/about/  → about Worker
/nav/help/   → help Worker
/nav/palace/ → palace Worker
/nav/donate/ → donate Worker
/nav/friend/ → friend Worker
/nav/api/*   → websearch Worker
*            → 404 内联页
```

## 实现

```js
// error.js
export default {
  async fetch(request, env, ctx) {
    const service = await resolveService(path, env);
    if (service && env[service]) {
      return env[service].fetch(request);  // Service Binding 转发
    }
    return new Response(render404(path), { status: 404, headers });
  },
};
```

动态路由：从 `index` service binding 抓取 `sitemap.xml`，解析 `<loc>` 标签合并到路由表（5 分钟缓存）。

## 原因

1. **独立部署**：每个 Worker 独立部署、独立回滚
2. **Service Binding 无 HTTP 开销**：直接调用，不经过公网
3. **动态路由**：从 sitemap.xml 自动发现新页面
4. **404 统一**：所有未命中路由返回统一的 404 页面

## 影响

- `error.toml` 配置所有 Service Binding
- 各 Worker 需要处理尾部斜杠 301 重定向
- 404 页面是完整内联 HTML（有样式、有返回按钮）
- 路由表变更需要更新 `error.toml` 和 `error.js`

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| Cloudflare Pages Routes | 不支持 Service Binding |
| 各 Worker 各自配置路由 | 路由分散，维护困难 |
| 外部路由服务 | 增加延迟和复杂度 |
