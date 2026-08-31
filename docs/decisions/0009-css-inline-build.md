# ADR-0009: CSS 内联构建流程

## 状态

已采纳

## 日期

2026-08

## 背景

GD 组件库 CSS 在 `src/` 目录中维护，但 Worker 需要将 CSS 内联到 HTML 字符串中。需要一个构建流程将源 CSS 合并到 Worker 文件。

## 决策

使用构建脚本将 `src/` 各组件 CSS 拼接后内联到 Worker 的 `<style>` 标签中。

## 构建流程

```
src/foundation/tokens/tokens.css     ─┐
src/foundation/tokens/gd-glass.css    │
src/foundation/layout/gd-layout.css   │
src/foundation/layout/gd-groundback.css│
src/foundation/layout/gd-footer.css   │  拼接
src/foundation/brand/gd-brand.css     │  ↓
src/foundation/actions/gd-button.css  │  <style>/* ... */</style>
src/navigation/navbar/gd-navbar.css   │
src/navigation/search/gd-search.css   │
src/display/card/gd-card.css          │
...                                   │
src/extend/<page>/gd-<page>.css      ─┘
```

每个 CSS 块以 `/* ===== src/path/file.css ===== */` 注释标记来源。

## 原因

1. **源码分离**：CSS 在 `src/` 维护，Worker 不直接编辑 CSS
2. **复用**：同一套 CSS 内联到所有 Worker 页面
3. **可追溯**：注释标记来源，调试时可定位到源文件
4. **无构建工具依赖**：不需要 Webpack/Vite，简单脚本即可

## 影响

- CSS 更新后需要重新构建所有 Worker
- 每个 Worker 的 CSS 内容相同（除了 extend 样式不同）
- 构建脚本在 `sandbox/*/build-*.mjs` 或 `temp/` 中
- 预览页 `src/preview/gd-preview.js` 使用 esbuild 打包（浏览器端）

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| Worker 内 fetch CSS | 增加延迟，CSP 放宽 |
| Cloudflare Assets | 不支持内联到 HTML 字符串 |
| 每个 Worker 手动维护 CSS | 同步成本高，容易遗漏 |
