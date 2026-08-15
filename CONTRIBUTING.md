# Contributing to GALNAVI

感谢关注 GALNAVI 项目。

## 组件开发

1. 先查 `docs/tokens.css` 是否已有需要的变量
2. 复用已有组件 class（`gd-card`、`gd-button`…），不要自造同义 class
3. 新增组件归属判断：
   - 三个页面以上使用 → 核心组件（`src/foundation/` 或 `src/display/` 等）
   - 单页面使用 → `src/extend/<页面名>/`

## 命名规范

- CSS class：`gd-` 前缀
- CSS 变量：`--gd-` 前缀
- 状态 class：`is-open`、`is-active`、`is-disabled`
- 禁止硬编码颜色，必须用 `--gd-*` token

## 运行预览

```bash
npm install
# 预览组件总览页（file:// 可直接打开）
# 修改 JS 后需重新打包：
node -e "const e=require('esbuild');e.build(require('./esbuild.config.js').default).catch(()=>process.exit(1))"
```

## 无障碍要求

- 交互元素必须 `<button>` 或 `<a href>`，禁止 `div onclick`
- 触控目标 ≥ 48px
- `:focus-visible` 可见焦点
- `prefers-reduced-motion` 关闭非必要动画

## PR 要求

- CSS 变更需在 `src/preview/index.html` 中添加对应展示
- 新组件需更新 `docs/components.md`
- 运行 `npm run check:gd` 确认无报错
