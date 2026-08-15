# ADR-0008: 路由设计

## 状态

已采纳

## 日期

2026-06

## 背景

项目有 9 个独立 Worker 页面，需要决定请求如何路由到正确的 Worker。

## 决策

使用 catch-all Worker 作为路由器，通过 Service Binding 将请求分发到各页面 Worker。

## 路由逻辑

```
/            → 首页 Worker
/nav/        → 主站 Worker
/nav/detail/ → 详情 Worker
/nav/about/  → 关于 Worker
/nav/help/   → 帮助 Worker
/nav/palace/ → 殿堂 Worker
/nav/donate/ → 捐献 Worker
/nav/friend/ → 友链 Worker
/nav/api/*   → 主站 Worker（JSON 路由）
*            → 404 内联页
```

动态路由：从 sitemap.xml 自动发现新页面（5 分钟缓存）。

## 原因

1. **独立部署**：每个 Worker 独立部署、独立回滚
2. **Service Binding 无 HTTP 开销**：直接调用
3. **动态路由**：从 sitemap.xml 自动发现新页面
4. **404 统一**：所有未命中路由返回统一的 404 页面

## 影响

- 路由配置需要在部署配置中定义 Service Binding
- 各 Worker 需要处理尾部斜杠 301 重定向
- 404 页面是完整内联 HTML（有样式、有返回按钮）

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| 各 Worker 各自配置路由 | 路由分散，维护困难 |
| 外部路由服务 | 增加延迟和复杂度 |
