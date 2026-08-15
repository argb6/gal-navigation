# ADR-0002: 创建 GD 组件库并对齐 Material Design 3

## 状态

已采纳

## 日期

2026-08

## 背景

项目有多个 Worker 页面（index / websearch / palace / about / help / friend / donate），它们重复使用卡片、按钮、导航栏、弹窗等 UI 元素。每个页面各自实现，样式不一致，维护成本高。

## 决策

建立独立的 GD（GalNavi Design）组件库，对齐 Material Design 3 的语义和原则，但保留 GALNAVI 自己的玻璃拟态视觉风格。

## 原因

1. **页面越来越多**：7+ 个 Worker 页面共享相同的 UI 模式
2. **样式不一致**：各页面独立实现导致颜色、间距、交互状态有差异
3. **MD3 语义成熟**：颜色角色（primary/surface/error）、形状、状态层、动效、无障碍已有成熟规范
4. **品牌需要保留**：GALNAVI 深色玻璃风格是用户认知的核心，不能换成 Material 默认紫皮

## 对齐什么

| MD3 维度 | GD 落地 |
|----------|---------|
| 颜色角色名 | 对齐（primary / on-surface / error），色值用 GALNAVI 调色板 |
| 形状语义 | 对齐（none → full），数值映射自现网 |
| 状态层 | 对齐（hover 0.08 / focus 0.12 / pressed 0.12 / disabled 0.38） |
| 动效 | 对齐（short/medium + standard/emphasized easing） |
| 触控目标 | 对齐（48dp 最小值） |
| 无障碍 | 对齐（focus-visible / inert / prefers-reduced-motion） |

## 不对齐什么

- 不引入 Material 默认紫色主题
- 不引入 MDC Web 组件库
- 不改 GALNAVI 玻璃透明度和 backdrop-filter
- 不做 MD3 五种 Button 变体硬套

## 影响

- 所有 CSS class 使用 `gd-` 前缀，变量使用 `--gd-` 前缀
- 168+ 设计变量集中在 `tokens.css`
- 14 核心组件 + 按页面归类的扩展样式
- 新增组件必须检查 MD3 行为规范和无障碍要求
- 预览页 `src/preview/index.html` 用于持续验证

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| 直接用 MDC Web | Worker 字符串架构冲突，玻璃风格无法保留 |
| 各页面各自实现 | 维护成本高，样式不一致 |
| 用 Tailwind 等工具类 | Worker 内联 CSS 体积大，且玻璃风格需要自定义 token |
