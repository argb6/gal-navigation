# ADR-0004: 单文件 Worker 模式（CSS/JS 全内联）

## 状态

已采纳

## 日期

2026-06

## 背景

Cloudflare Worker 返回 HTML 页面时，CSS 和 JS 如何提供？

- 方案 A：外部文件 + CDN 链接
- 方案 B：Worker 内 fetch 静态资源
- 方案 C：CSS/JS 全部字符串内联到 Worker 源码

## 决策

采用方案 C：每个页面 Worker 是一个自包含的 JS 文件，HTML/CSS/JS 全部字符串内联。

## 原因

1. **零网络请求**：页面加载不需要额外 CSS/JS 文件请求，首屏最快
2. **原子部署**：单文件部署，回滚简单，不会出现 CSS/JS 版本不匹配
3. **CSP 收紧**：`connect-src 'self'`，无外部资源加载，安全基线最高
4. **缓存控制**：`Cache-Control: private, no-store`，每次获取最新版本
5. **无 CDN 依赖**：不依赖外部 CDN 可用性

## 实现

```
renderPage(data) 返回：
<!DOCTYPE html>
<html>
  <head>
    <style>/* 2800+ 行 gd 组件 CSS */</style>
  </head>
  <body>
    <!-- HTML 结构 -->
    <script>var NAV_DATA = [...];</script>
    <script>/* 600+ 行客户端 JS */</script>
  </body>
</html>
```

CSS 从 `src/` 各组件文件拼接，以 `/* ===== src/path/file.css ===== */` 注释标记来源。

## 影响

- 文件体积大（websearch.js 约 4300 行）
- CSS 更新需要重新内联到所有页面 Worker
- 构建脚本负责从 `src/` 拼接 CSS 到 Worker
- Worker 有 1MB 体积限制，但当前最大文件 215KB，远未触及

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| 外部 CSS + CDN | 增加网络请求，CSP 放宽，需管理版本 |
| Worker 内 fetch 静态资源 | 增加延迟，缓存复杂 |
| Cloudflare Pages | 不支持 Service Binding，Functions 限制多 |
