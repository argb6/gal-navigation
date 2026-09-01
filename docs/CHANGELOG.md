# CHANGELOG

## v1.5.2（当前）

2026-09-01。

### 完善

- 删除未使用的 `gd-icon-button.css`、跳过链接样式；`gd-a11y` 只留高对比。已同步 `worker/new` 的 index / error / websearch
- `docs/migration.md`、`docs/coding-style.md` 删除（内容已在 CHANGELOG / `docs/standard/usage.md`）
- `usage.md` / `tokens.md` / `open-source-prep.md` 挪到 `docs/standard/`
- 根目录去掉重复稿 `gd-architecture.md`、`worker-component-report.md`；项目地图改在根 `README.md`，AI 规矩在 `AGENTS.md`
- 知识库文件夹改成连续编号 `01`–`05`（`kbVersion` 1.2.0）；`worker/share` 与现网 index 的 robots/sitemap 对齐（含 `/status/`）

## v1.5.1

2026-09-01。对照 `worker/new` 删掉从未 `var()` 的 token；顶栏底改走 `--gd-chrome-bar-bg`。

### 完善

- `tokens.css` 从 169 条减到 **139** 条（去掉彩点、elevation 别名、未用行高/间距/语义色等）
- `worker/new` 十页 `:root` 与源码对齐；`index.js` 的 `--gd-color-on-surface-variant` 从旧值 `#8b9cc0` 改为 `#93a4c8`
- 主站顶栏 / 通知条用 `var(--gd-chrome-bar-bg)`，不再写死 `rgba(18,22,40,0.92)`
- 删除停用的 `src/extend/websearch/gd-filter-bar.css`（首页快捷入口只留 `gd-orb`）

## v1.5.0

2026-09-01。主站 `websearch` 已跟上。

### 完善

- 顶栏抽回组件库：毛玻璃底 `--gd-chrome-bar-bg`、整组居中、Logo 28px、搜索固定 300px（仅带 `expandable` 时聚焦变宽）
- 搜索帮助：空格为「包含 ACG **或** 小说」；`+` 仍为同时包含；`-` 不变
- NSFW 桌面盾牌与抽屉统一红/绿实底（关=error、开=success）。桌面点一下闪「开」再回盾牌，再点闪「关」；抽屉仍闪「已开启 / 已关闭」
- 手机抽屉 NSFW 上移：抽屉 `100dvh`，底部留 `56px + env(safe-area-inset-bottom)`，避开浏览器底栏
- 预览：去掉「跳到主要内容」；右下入口章节名改为 `gd-orb__toggle`；groundback 预览去掉点阵层，主站默认标线条底

### 文档

- `coding-style.md` 并入 `usage.md`；`migration.md` 收成完成说明（细节见本 CHANGELOG）

## v1.4.2

同日补丁，已并入 v1.5.0。

### 完善

- 手机抽屉 NSFW 上移：抽屉用 `100dvh`，底部留 `56px + safe-area`，避免被浏览器底栏挡住
- 桌面盾牌改为红/绿实底，点击闪「开 / 关」再回到盾牌，逻辑与抽屉「已开启 / 已关闭」相同
- 抽屉 NSFW 关=红、开=绿（与桌面一致）

## v1.4.1

同日补丁，已并入 v1.5.0。

### 完善

- 顶栏样式抽回组件库：毛玻璃底、整组居中、Logo 28px、搜索固定 300px（仅 `expandable` 时聚焦变宽）
- 搜索帮助：空格为「包含 ACG **或** 小说」；`+` 仍为同时包含；`-` 不变
- 预览：去掉「跳到主要内容」；右下入口章节名改为 `gd-orb__toggle`；groundback 预览去掉点阵层，主站默认标线条底

### 文档

- `coding-style.md` 并入 `usage.md`；`migration.md` 收成完成说明（细节见本 CHANGELOG）

## v1.4.0

### 新增

- `gd-orb`：首页快捷入口改为右下角扩展按钮（点开两列：站内入口 / 站点页面）；`initGdOrb`
- `initGdNoticeLed()`：顶栏通知跑马灯按字宽匀速、无限循环（`--gd-notice-led-duration`）
- `gd-below-nav` / `gd-rec-tags` / `.gd-navbar--led`：主站顶栏与通知条同一层毛玻璃（`--gd-chrome-bar-bg`）
- `gd-page` / `gd-page-shell`：短页把页脚顶到视口底，长页跟在内容后；`--gd-vvh` 由 `initGdStickyViewport()` 写入
- `initGdInverseZoom()`：仅在 Ctrl+/- **缩小**时把 `.gd-detail__scale`（标题+卡片）用 CSS `zoom` 放大（`--gd-inv-zoom`，1～4）；放大页面不反向缩小；页脚不参与 zoom
- `gd-card-grid`：主站卡片网格，最多 6 列，超宽屏限宽；单列宽度 100%
- `gd-groundback--bleed`：背景铺满视口（`100vw` × `100dvh`）
- `gd-groundback--websearch`：主站蓝底 + R2 线条图案平铺（`mix-blend-mode: screen`）；线条层 `filter: blur(10.8px)`。殿堂用 `gd-groundback--gold`（金晕 + 同款线条）
- `.gd-detail__scale` / `.gd-detail__content`：锁宽 1100px 的正文栏；`.gd-detail__container` 全宽弹性壳，页脚贴底

### 完善

- 条目卡 `gd-card--item`：表面铺与全站同款线条图案（`mix-blend-mode: screen`，`filter: blur(10.8px)`）；必须 `width/height: auto`，勿继承主站卡 420×212
- 殿堂页背景 `gd-groundback--gold` 同样叠加线条层；除殿堂外各 Worker 用 `--websearch`。详情页 `body` 须透明，背景层 `z-index: 0`，避免旧渐变盖住线条
- 轮播首屏用 `gd-hero.is-loading` + `gd-skeleton--hero`，不要把整段 `hidden`
- `gd-filter-bar` 胶囊 75×40（已由右下 `gd-orb` 替代页面两框）
- 欢迎弹窗：介绍下居中加粗「详情：新手优先看卡片详情」；帮助/关于链接居中；已去掉日本节点提示
- `gd-footer` 作为 flex 子项：`margin-top: auto`、`flex-shrink: 0`，缩放后空白留在内容和页脚之间
- `gd-card` 固定 420×212，标签左对齐
- `gd-overview` 横/竖虚线 2px CSS 渐变（`linear-gradient` + `--ov-dash-period` 平铺，预览演示侧栏与正文横线同一套 `--ov-dash-*`）；侧栏间距 120px；页脚跟在页面底部（`.gd-footer--page`）
- 详情页锁横向滚动（`overflow-x: hidden`）；返回钮悬停不再左右挪；反向缩放不再监听 `visualViewport.scroll`
- 去掉 `gd-age-gate` 年龄门；桌面导航栏右侧 NSFW 盾牌（`initGdNsfwToggle`，红=隐藏 / 绿=显示，提示用 `gd-tooltip-wrap`）；抽屉底部 `gd-button--nsfw`（关=暗 / 开=亮，点一下「已开启」、再点「已关闭」后回到盾牌+NSFW）；桌面顶栏元素紧挨并整组居中
- 预览页演示短页贴底页脚、详情反向缩放；静态资源改为 Cloudflare R2（`assets.galnavi.top`）

## v1.3.0

### 新增

- 站点状态页（`/status/`）组件化完成，复用 gd-overview 布局 + gd-brand + gd-footer + gd-empty-state
- 状态页公告系统：`NOTICE_KV` 读取公告内容，`status-notice__content` 样式（蓝底圆角卡片）
- 状态页仪表盘样式（`status-dashboard` / `status-stat` / `status-list` / `status-event`）
- `gd-overview` 布局新增 `status` 页面（extendPages）

### 完善

- 公告注入逻辑修正：替换整个空状态占位块（避免残留内部 DOM 导致桌面端布局错乱）
- 状态页标题与页脚去除 beta 标记

## v1.2.0

### 新增

- `gd-skeleton--item` 变体（神魔条目卡骨架，尺寸/结构对齐 `gd-card--item`）
- `gd-search__hl` 搜索词高亮（蓝色普通 / 橙色神魔，走 token）
- `gd-brand__title--palace` 发光标题（橙 → 绿 → 红往返循环，殿堂主题）
- gd-search group 变体规范（圣器殿堂搜索框：focus 图标金色、48px、原生 × 禁用）

### 完善

- `gd-groundback--blue` 按原版发布页增强：三层光斑 + 深蓝对角渐变 + 点阵网格 + 底部光带
- `gd-button--back` 默认背景改黑色 70% 透明（`rgba(0,0,0,0.3)`）
- `gd-link` 兼容 `<button>` 元素（背景透明、去原生边框）
- 圣器殿堂页面组件化：分类导航（gd-cat-nav）、卡片（gd-card--item）、页脚（gd-footer）、搜索（gd-search--group）、数据加载骨架
- `docs/tokens.md` 增加「文字链接（gd-link）规范」

### 去除

- 浏览器原生搜索清除按钮（`::-webkit-search-cancel-button`，避免与 `gd-search__clear` 重复 ×）
- 沙盒 mock 示例数据（palace 部署用真实 group1 D1）

## v1.1.0

### 新增

- `extend/` 8 个 Worker 页面组件全部提取完成（overview / websearch / home / about / help / donate / palace / detail）
- `runtime/gd.js` 注册入口（gd-modal / gd-navbar / gd-search 自定义元素）
- `gd-badge` 徽章组件（navbar 计数泛化，可复用）
- `gd-glass` 玻璃工具类（卡片级 / 浮层级 / 顶栏级）
- `docs/` 维护文档体系（架构 / tokens / 组件索引 / 使用规范 / 迁移记录 / 编码规范 / examples + `gd.config.json`）

### 完善

- 目录结构定型七组：foundation / navigation / display / feedback / extend + runtime / preview
- 字体、颜色全 token 化（含 RGB 通道、透明层级、渐变专用色），硬编码清零
- 无障碍落地：skip-link / forced-colors / inert / focus-visible / reduced-motion
- 预览页 file:// 兼容（esbuild 打包 `gd-preview.js`，打包统一 `esbuild.config.js`）

### 去除

- `gd/` 旧目录（组件并入 `src/`）
- `utils/` 目录（改名 `runtime/`）
- `gd-control` 旧名（统一为 `gd-button`）
- stylelint（未真正生效且无用处）

## v1.0.0

- gd token 体系：168 变量（颜色 / 形状 / 字号 / 字重 / 字距 / 玻璃 / 动效 / 状态）
- 14 核心组件：card / modal / navbar / search / tag / badge / skeleton / toast / tooltip / hero-carousel / empty-state / table / brand / footer
- `actions` 交互基元（button / link / icon-button）与 `layout` 页面结构层
- hover 动效统一（无位移、改高亮）
- 预览页 `src/preview/index.html`（组件总览与交互演示）
