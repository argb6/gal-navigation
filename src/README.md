# GalNavi Design（gd）组件库

`src/` 是 GalNavi 自研设计体系的组件实现与预览目录。它服务于现有的 Cloudflare Worker 页面，负责统一外观、交互状态和少量通用行为；页面数据、跳转目标、过滤规则和服务端逻辑仍由 Worker 自己处理。

## 组件库解决什么问题

GalNavi 有多个 Worker 页面，它们会重复出现卡片、标签、搜索、弹窗、导航和页脚。组件库把这些共同部分整理成一套固定约定：同一类元素使用相同的 token、状态和结构，页面仍然可以保留自己的内容与业务判断。

组件库主要解决四件事：

- 统一颜色、圆角、间距、字体、动效和玻璃层级；
- 统一按钮、卡片、弹窗、导航等元素的状态表现；
- 把 Esc、焦点、清除输入、抽屉开闭等通用行为集中维护；
- 让 Worker 页面可以逐步接入，不要求一次性重写。

## 视觉风格

gd 保留 GALNAVI 现有的玻璃风格。半透明表面、背景光晕、边框透明度以现网效果为准。

页面整体使用深色背景、玻璃表面、蓝紫色主色和较轻的边框层级。卡片强调内容层次，按钮强调操作状态，弹窗和导航强调遮罩、焦点及层级关系。

组件内容保持在普通页面树中（Light DOM），外部 CSS 可直接控制组件内容，Worker 拼出的 HTML 能复用同一套 class。

为避免样式互相污染，组件 class 统一使用 `gd-` 前缀，设计变量统一使用 `--gd-` 前缀。组件内部也避免使用 `.title`、`.active` 这类过宽的选择器。玻璃边界与动效约定见 `docs/standard/tokens.md`、`docs/standard/usage.md`。

## 与 Google Material Design 3 的关系

gd 的部分设计要素参考并对齐 Google Material Design 3（MD3），对齐的是原则、语义和交互要求，不是把 GALNAVI 换成 Material 默认主题，也不是引入 MDC Web 组件库。

目前参考的内容包括：

- 颜色角色：`primary`、`on-primary`、`surface`、`on-surface`、`outline`、`error`；
- 形状语义：`none`、`extra-small`、`small`、`medium`、`large`、`full`；
- 状态层：hover、focus、pressed、disabled；
- 动效语义：短时、中时、标准和强调缓动；
- 自适应思路：根据屏幕宽度调整顶栏、抽屉和内容布局；
- 无障碍底线：真实按钮或链接、可见焦点、键盘操作、ARIA 状态和足够的触控热区。

对应的 CSS 变量位于 [`foundation/tokens/tokens.css`](./foundation/tokens/tokens.css)。变量名称参考 MD3 的角色语义，具体色值和玻璃参数仍然属于 GALNAVI 自己的设计。

## 目录结构

组件按用途分为五个分组（参考 Ant Design 分类法）：**foundation**（基础）、**navigation**（导航）、**display**（展示）、**feedback**（反馈）、**extend**（页面扩展）；另有 **runtime**（组件注册入口）与 **preview**（预览页）。维护文档在项目根 `docs/`，版本信息在项目根 `docs/gd.config.json`。

```text
项目根
├─ docs/gd.config.json              版本 / 状态 / 页面清单
├─ esbuild.config.js           预览脚本打包配置
├─ docs/                       维护文档（AI / 人类入口）
├─ src/
│  ├─ preview/
│  │  ├─ index.html            组件总览与交互预览
│  │  └─ gd-preview.js         打包后的预览脚本（由 temp/gd-preview-entry.js 构建）
│  │
│  ├─ foundation/ 基础
│  │  ├─ tokens/               tokens.css（--gd-* 变量，唯一换肤入口）+ gd-glass.css
│  │  ├─ actions/              gd-button.css · gd-link.css
│  │  ├─ brand/                gd-brand.css
│  │  ├─ layout/               gd-layout.css/js + gd-footer.css + gd-groundback.css
│  │  └─ accessibility/        gd-a11y.css（forced-colors）
│  │
│  ├─ navigation/ 导航
│  │  ├─ navbar/               gd-navbar.css/js
│  │  └─ search/               gd-search.css/js
│  │
│  ├─ display/ 展示
│  │  ├─ card/  tag/  badge/  table/  empty-state/  hero-carousel/
│  │
│  ├─ feedback/ 反馈
│  │  ├─ modal/  toast/  tooltip/  skeleton/
│  │
│  ├─ extend/ 页面扩展（按来源 Worker 页面归类）
│  │  ├─ overview/   总览页壳层（虚线分割、索引）✓
│  │  ├─ websearch/  右下 gd-orb 快捷入口 + 卡片网格 + 纳普彩蛋 + 欢迎弹窗 + 通知跑马灯 ✓
│  │  ├─ home/       发布页（index.js）✓
│  │  ├─ about/      关于页               ✓
│  │  ├─ help/       帮助页               ✓
│  │  ├─ donate/     捐献页              ✓
│  │  ├─ palace/     圣器殿堂页           ✓
│  │  ├─ detail/     详情页（含反向缩放）  ✓
│  │
│  └─ runtime/
│     └─ gd.js                   注册 gd-modal、gd-navbar、gd-search
│
└─ worker/                    服务端（不打包进浏览器）
   ├─ 页面 Worker               websearch · detail · donate · about · help · friend · palace · index · error · status
   └─ shared/                   参考副本（constants / security / seo）；worker/new 不 import
```

核心组件共 14 类（card/tag/badge/skeleton/brand/empty-state/table/toast/tooltip/hero-carousel/modal/navbar/search/footer），加上 `actions` 交互基元和 `layout` 页面结构层；`extend/` 仅承载按页面归类的扩展样式，不属于跨页核心组件。

维护文档在 `docs/`（规范在 `docs/standard/`），版本在 `docs/gd.config.json`。

## 建议开发顺序

1. 完成 foundation（tokens / actions / layout）
2. 完成 feedback（modal / toast）
3. 完成 navigation（navbar / search）
4. 迁移 display
5. 最后迁移 extend 页面

## 使用方式

### 只使用 CSS

轻展示组件直接使用 class：

```html
<article class="gd-card gd-card--friend">
  <h2 class="gd-card__title">示例友链</h2>
  <p class="gd-card__subtitle">友链说明</p>
</article>

<button type="button" class="gd-button gd-button--primary">
  确认
</button>
```

`gd-button` 必须放在真实的 `<button>` 或带真实 `href` 的 `<a>` 上，不能用 `<div>` 模拟按钮。图标型操作必须提供可访问名称，例如 `aria-label` 或可见文本。

### 使用通用行为组件

先加载对应的 CSS，再加载 [`runtime/gd.js`](./runtime/gd.js)。它会注册三个自定义元素：

```html
<gd-search variant="toolbar" placeholder="页内搜索"></gd-search>

<gd-modal class="gd-modal-overlay" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="gd-modal">
    <h2 class="gd-modal__title">确认操作</h2>
    <button type="button" class="gd-button gd-button--primary" data-gd-close>
      关闭
    </button>
  </div>
</gd-modal>
```

自定义元素只处理通用行为：

- `gd-modal` 处理开闭、Esc、焦点、遮罩和倒计时展示；
- `gd-navbar` 处理抽屉、键盘和焦点；
- `gd-search` 处理输入、清除和事件挂载。

它们不决定跳转地址、查询哪张表、过滤什么数据，也不包含具体页面业务。

### 使用独立行为函数

部分组件提供导出的行为函数，由页面传入数据后调用：

- `initGdNap("#napModal", { items, openSelector })`：纳普彩蛋弹窗，`items` 为 `{ image, title, content }` 数组，按打开次数轮换；
- `initGdNavLinks("[data-gd-nav-links]")`：频道标签点击切换选中态；
- `initGdNavCounts("[data-gd-nav-links]", { items })`：按 `items[].cat` 统计各分类数量写入徽章，`home` 显示总数；
- `initGdCatNav("[data-gd-cat-nav]")`：圣器殿堂分类标签切换。
- `initGdNsfwToggle(document)`：桌面盾牌与抽屉 NSFW（红底隐藏 / 绿底显示；点击先闪开/关再回到盾牌）。
- `initGdStickyViewport()`：写入 `--gd-vvh`，短页页脚贴视口底。
- `initGdInverseZoom()`：Ctrl+/- 缩小时把 `.gd-detail__scale` 反向放大（写入 `--gd-inv-zoom`），同时锁定视口高度。

### 预览组件库

[`preview/index.html`](./preview/index.html) 是组件总览页。页面引用打包脚本 [`preview/gd-preview.js`](./preview/gd-preview.js)（普通 `<script>`，非 ES Module），因此直接双击 `file://` 或通过静态 HTTP 服务打开均可。预览时应检查桌面和窄屏布局，并实际操作搜索、抽屉、弹窗、轮播和 Toast。

修改任一组件 JS 后需要重新打包 `gd-preview.js`（打包入口在 `temp/gd-preview-entry.js`，配置在项目根 `esbuild.config.js`）：

```bash
npx esbuild temp/gd-preview-entry.js --bundle --format=iife --outfile=src/preview/gd-preview.js --target=es2017
```

也可以继续用浏览器开发者工具确认每个组件的行为与焦点顺序。

## 无障碍与交互约定

组件库把这些要求当作实现条件：

- 交互热区尽量达到 48 × 48 CSS px；
- `<button>` 使用 Enter 或 Space 可触发；
- `<a>` 必须提供真实 `href`；
- `aria-disabled="true"` 的控件不得继续执行实际操作；
- 弹窗打开后焦点进入弹窗，关闭后返回触发元素，背景内容设为 `inert`；
- 导航抽屉同步 `aria-expanded` 和 `aria-controls`；
- `:focus-visible` 必须有清楚的焦点指示（搜索框等输入控件同样覆盖）；
- `prefers-reduced-motion` 开启时减少或关闭非必要动画；
- 页面提供跳过链接；弹窗、轮播圆点等带可访问名称；
- `forced-colors`（Windows 高对比）下保留边框与图标可见。

这些要求来自项目自身约定，也参考了 MD3 的组件行为和无障碍建议。它们不替代正式的 WCAG 测试。

## 接入 Worker 的边界

`src/` 负责浏览器侧的 CSS、预览页和少量通用行为。Worker 页面仍然负责拼 HTML、查询数据、过滤、跳转和页面级决策。`worker/shared/` 只作参考副本；各页 `SECURITY_HEADERS` 与分类常量已内联，**不 import**。

接入时可以按页面逐步替换旧 class。先替换 `gd-button`、`gd-card` 等外观，再接入 `<gd-modal>`、`<gd-navbar>`、`<gd-search>`，这样每一步都容易回退和检查。

页面背景：除殿堂外用 `gd-groundback--websearch`（蓝底 + 线条模糊）；殿堂用 `--gold`。卡片禁止 `backdrop-filter`；线条层用 `filter: blur(10.8px)`。

架构与组件索引见 [`docs/architecture.md`](../docs/architecture.md)、[`docs/components.md`](../docs/components.md)。项目地图见根目录 [`README.md`](../README.md)。

## 文档导航

| 文档 | 内容 |
|---|---|
| [`docs/README.md`](../docs/README.md) | 组件库总说明（入口） |
| [`docs/architecture.md`](../docs/architecture.md) | 整体架构与数据流 |
| [`docs/standard/tokens.md`](../docs/standard/tokens.md) | 设计变量（换肤入口） |
| [`docs/components.md`](../docs/components.md) | 组件索引（核心文件） |
| [`docs/standard/usage.md`](../docs/standard/usage.md) | 使用规范、开发流程、编码约定 |
| [`docs/examples/`](../docs/examples/) | 短示例；活示例以预览页为准 |
| [`docs/CHANGELOG.md`](../docs/CHANGELOG.md) | 版本历史 |
