# 使用规范

## 新页面开发流程

1. 先查 `tokens.css` 是否已有需要的变量
2. 复用已有组件 class（`gd-card`、`gd-button`…），不要自造同义 class
3. 新 UI 的归属按下方判断标准表决定

## 硬性约定

### 颜色

- **禁止**硬编码颜色，必须用 `--gd-*` token：

```css
/* ❌ 不要 */
.page-card {
  background: #111;
}

/* ✅ 应该 */
.gd-card {
  background: var(--gd-glass-bg);
}
```

- **禁止**低对比透明浅字（如 `rgba(232,238,255,.38)`），用实色 token `--gd-color-on-surface-subtle`

### 玻璃

- 卡片类**不用** `backdrop-filter` / `box-shadow`；遮罩/浮层按现网数值使用（完整约定见 [`tokens.md`](./tokens.md)）
- 页面/条目卡上的线条图案用装饰层 `filter: blur(10.8px)`（不是 `backdrop-filter`）

### 交互

- 必须真实 `<button>` 或 `<a href>`，禁止 `div onclick`
- 预览页按钮一律 `<button type="button">`，不绑链接

## 新组件判断标准

| 条件 | 归属 |
|---|---|
| 三个页面以上使用 | 核心组件（基础/导航/展示/反馈） |
| 单页面使用 | `extend/<页面名>/` |
| 纯视觉基元 | `actions/` |
| 设计变量 | `tokens/` |

## 无障碍底线

- `:focus-visible` 可见焦点
- 弹窗背景 `inert`、焦点返回
- `prefers-reduced-motion` 关闭非必要动画
- `forced-colors` 下边框/图标可见
- 目标尺寸 ≥ 24px（推荐 48px）

## 返回主站按钮（gd-button--back）

返回类按钮用 `<a>` + 组件类：`gd-button gd-button--back`（普通），殿堂橙变体 `gd-button gd-button--back gd-button--back--orange`；固定视口左上角时追加 `gd-back-fab`（页面级定位类）。

- **显示**：电脑端与手机端**均显示**，禁止媒体查询隐藏（旧 `.gd-back-fab { display: none }` 已废除）
- **大小**：桌面高 `40px`；移动端（≤640px）高 `44px`（触控目标 ≥44px 推荐）
- **上左间距**：距视口上、左边界 `12px`，刘海屏用 `env(safe-area-inset-*)` 兜底：

```css
.gd-back-fab {
  position: fixed;
  top: max(12px, env(safe-area-inset-top, 0px));
  left: max(12px, env(safe-area-inset-left, 0px));
  z-index: 50;
}
```

- **可访问性**：`aria-label` 必填（如"返回主站"），图标 `aria-hidden="true"`

## 页脚贴底与详情反向缩放

短页（内容不够一屏）把 `gd-footer` 顶到视口底；内容很长时页脚跟在正文后面。浏览器缩小后，空白留在**内容和页脚之间**，不要落到页脚下面。

```html
<body class="gd-page">
  <main class="gd-page-shell">…</main>
  <footer class="gd-footer">…</footer>
</body>
<script type="module">
  import { initGdStickyViewport } from "../src/foundation/layout/gd-layout.js";
  initGdStickyViewport();
</script>
```

详情页在 Ctrl+/- **缩小**时，标题和卡片整栏用 CSS `zoom` 放大，避免 1100px 锁宽缩成一团；**放大**页面不反向缩小。页脚放在 `.gd-detail__scale` 外面，继续贴视口底：

```html
<div class="gd-detail__container">
  <div class="gd-detail__scale">
    <header class="gd-detail__header">…</header>
    <div class="gd-detail__content">
      <!-- gd-highlights + gd-section-card-grid -->
    </div>
  </div>
  <footer class="gd-footer">…</footer>
</div>
<script type="module">
  import { initGdInverseZoom } from "../src/extend/detail/gd-detail.js";
  initGdInverseZoom();
</script>
```

页面 Worker 是单文件内联，把上述函数抄进页内脚本即可，不要在运行期外链 `src/`。

## 页面背景（gd-groundback）

- 除殿堂外各 Worker 用 `gd-groundback--websearch`；殿堂用 `gd-groundback--gold`
- **`body` 必须透明**（不要铺不透明渐变）；背景层 `z-index: 0`，正文更高。`z-index: -1` 会画到 body 底色后面
- 示例见 `docs/examples/groundback.md`

## 殿堂条目卡

`.gd-card--item` 必须 `width: auto; height: auto`。Worker 内联副本若漏掉，会继承主站卡 420×212，游戏名被挤没，只剩序号和按钮。

## 首页快捷栏

右下角 `gd-orb` 扩展按钮，点开后两列展开。示例见 [`../examples/filter-bar.md`](../examples/filter-bar.md)。

## CSS / 动效 / JS / HTML

### CSS

- class 必须 `gd-` 前缀；变量必须 `--gd-` 前缀
- **禁止**重复定义 token（先查 `tokens.css`）
- **禁止** `.title`、`.active`、`.card` 这类宽选择器
- 玻璃数值冻结：改数值需说明理由

### 动效

- hover **禁止位移**（不要 `translateY(-1px)` / `-2px`）
- hover 统一高亮：`filter: brightness(1.06~1.1)` + 背景/边框加深
- 例外：图标按钮内部 SVG 缩放可保留

### JS

- 必须 ES Module；除自定义元素注册外禁止全局变量
- 行为用 `initXxx`，数据由页面传入
- 自定义元素只在 `src/runtime/gd.js` 注册
- 事件用 `addEventListener`，不用 `onclick`
- 弹窗/抽屉处理 Esc、焦点、`aria-*`

### HTML / 文件

- 图标按钮必须有 `aria-label`
- 弹窗 `role="dialog"` + `aria-modal` + `aria-labelledby`
- 语言 `lang="zh-CN"`，单 h1，标题不跳级
- 预览页内联样式仅限单次微调
- 文件一律 UTF-8（勿用旧版 PowerShell 重写含中文的文件）
- 目录按七组归类：foundation / navigation / display / feedback / extend + runtime / preview

## 打包与预览

- 改 JS 后必须重新打包 `gd-preview.js`：
  `npx esbuild temp/gd-preview-entry.js --bundle --format=iife --outfile=src/preview/gd-preview.js --target=es2017`
- 配置见根目录 `esbuild.config.js`
