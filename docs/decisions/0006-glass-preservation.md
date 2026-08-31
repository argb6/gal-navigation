# ADR-0006: 保留玻璃拟态视觉风格

## 状态

已采纳

## 日期

2026-08

## 背景

对齐 Material Design 3 时，MD3 默认主题使用实色表面（solid surfaces）。GALNAVI 现网以半透明表面、光晕、边框透明度为核心视觉 identity。

## 决策

保留 GALNAVI 玻璃拟态（Glassmorphism）皮肤，玻璃数值冻结，禁止修改。

## 原因

1. **品牌 identity**：玻璃拟态是 GALNAVI 区别于其他导航站的核心视觉特征
2. **用户习惯**：用户已习惯深色半透明风格，突然切换会破坏认知
3. **MD3 语义兼容**：MD3 的 surface 概念可以用玻璃实现（语义对齐，视觉不换）
4. **深色主题天然适配**：半透明 + 深色背景 = 玻璃效果，浅色主题则不适合

## 玻璃三级分层

| 层级 | Class | 模糊 | 用途 |
|------|-------|------|------|
| 卡片 | `.gd-glass` | 无 | 内容表面（禁止 backdrop-filter） |
| 浮层 | `.gd-glass--blur` | blur(18px) | 弹窗、遮罩 |
| 顶栏 | `.gd-glass--strong` | blur(20px) | 导航栏 |

## 冻结数值

```css
--gd-glass-bg: rgba(18, 22, 40, 0.42);        /* 卡片背景 */
--gd-glass-bg-hover: rgba(22, 28, 48, 0.52);   /* 卡片 hover */
--gd-glass-blur: blur(18px) saturate(165%);     /* 浮层模糊 */
--gd-glass-border: rgba(255, 255, 255, 0.14);   /* 玻璃边框 */
--gd-glass-nav-bg: rgba(8, 12, 24, 0.75);       /* 导航栏背景 */
--gd-glass-nav-blur: blur(20px) saturate(180%);  /* 导航栏模糊 */
```

## 影响

- 卡片类**禁止** `backdrop-filter` / `box-shadow`
- 只有浮层/弹窗/导航栏可用 `backdrop-filter` 类 blur
- 页面/条目卡线条图案用装饰层 `filter: blur(10.8px)`（模糊图案本身，不是背后内容），与上条不冲突
- 新增组件必须使用 `--gd-glass-bg` + `--gd-glass-border`
- `--gd-glass-*` 变量不可修改

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| 采用 MD3 默认实色表面 | 破坏品牌 identity |
| 部分页面用玻璃、部分用实色 | 视觉不统一 |
| 全部组件都用 blur | 性能差，卡片数量多时不现实 |
