# Contributing to GALNAVI

感谢关注 GALNAVI。

## 组件

1. 先查 `src/foundation/tokens/tokens.css` 和 `docs/standard/tokens.md`
2. 复用已有 `gd-*` class，不要自造同义 class
3. 三个页面以上 → foundation / display 等；单页 → `src/extend/<页面名>/`

## 命名

- class：`gd-`；变量：`--gd-*`
- 状态：`is-open`、`is-active`、`is-disabled`
- 禁止硬编码颜色

## 预览

用浏览器打开 `src/preview/index.html`（file:// 即可）。本仓没有 wrangler / 沙盒。

改了 `src/` 的 CSS，记得同步进对应的 `worker/<页>.js`。

## 无障碍

- 交互用 `<button>` 或 `<a href>`，禁止 `div onclick`
- 触控 ≥ 48px
- `:focus-visible`
- `prefers-reduced-motion` 关掉多余动画

## PR

- CSS 变更在 `src/preview/index.html` 里有对应展示
- 新组件更新 `docs/components.md`
- 不要提交密钥、token、账号密码
