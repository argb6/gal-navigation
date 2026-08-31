# 编码规范

## CSS

- 组件 class 必须 `gd-` 前缀（`gd-card`、`gd-card__title`、`gd-card--item`）
- 变量必须 `--gd-` 前缀
- **禁止**硬编码颜色 → 用 `--gd-*` token
- **禁止**重复定义 token（查过 `tokens.css` 再写）
- **禁止** `.title`、`.active`、`.card` 这类宽选择器
- **禁止**卡片类使用 `backdrop-filter` / `box-shadow`
- 线条图案装饰层允许 `filter: blur(10.8px)`（元素自身模糊，不是背后内容的 `backdrop-filter`）
- 低对比文字必须实色 token
- `:focus-visible` 必须有可见指示
- 玻璃数值冻结：改数值需说明理由

## 动效标准（统一 hover）

- **hover 禁止位移**：不使用 `translateY(-1px)` / `translateY(-2px)` 上移动效
- **hover 统一高亮**：`filter: brightness(1.06~1.1)` + 背景/边框加深（或光晕 shadow）
- 例外：图标按钮内部 SVG 缩放（`svg { transform: scale() }`）属内容动效，可保留
- 所有组件 hover 必须一致：**无位移 + 高亮**

## JS

- 必须 ES Module（`export` / `import`）
- **禁止**全局变量（除自定义元素注册）
- 组件行为提供 `initXxx` 函数，数据由页面传入
- 自定义元素只在 `runtime/gd.js` 注册
- 事件用 `addEventListener`，不用 `onclick`
- 弹窗/抽屉处理 Esc、焦点、`aria-*` 状态
- 打包：`node -e "const e=require('esbuild');e.build(require('./esbuild.config.js').default)"`（配置见根 `esbuild.config.js`）

## HTML

- 交互元素用 `<button type="button">` 或 `<a href>`
- 图标按钮必须有 `aria-label`
- 弹窗 `role="dialog"` + `aria-modal` + `aria-labelledby`
- 语言 `lang="zh-CN"`，单 h1，标题不跳级
- 预览页内联样式仅限单次微调

## 文件

- 一律 UTF-8（勿用 PowerShell 写中文文件，会乱码）
- 目录按七组（foundation/navigation/display/feedback/extend + runtime/preview）归类
