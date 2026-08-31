# 重构迁移记录

## 2026-08-10

### 已完成

- ✓ **组件库结构重构**：foundation/navigation/display/feedback/extend + runtime + preview
- ✓ **detail 归类**：详情页组件移入 `extend/detail/`
- ✓ **skeleton 归类**：骨架屏移入反馈分支 `skeleton/`
- ✓ **扩展按 Worker 页面归类**：`extend/{overview,websearch,home,about,help,donate,palace,detail}/` 全部 ready
- ✓ **tokens 统一**：新增 `--gd-color-on-surface-subtle` 实色 token，替换透明浅字
- ✓ **glass 工具类**：`tokens/gd-glass.css`（卡片级/浮层级/顶栏级）
- ✓ **badge 泛化**：navbar 计数提取为 `gd-badge` 组件
- ✓ **无障碍**：跳过链接、forced-colors、弹窗 inert、焦点指示、reduce-motion
- ✓ **file:// 兼容**：JS 打包为 `gd-preview.js` 普通脚本
- ✓ **页脚贴底 / 详情反向缩放**：`gd-page` + `initGdStickyViewport` / `initGdInverseZoom`（v1.4.0）
- ✓ **编码事故恢复**：index.html 曾因 PowerShell 编码损坏，已恢复并写入教训
- ✓ **worker constants 对齐**：`DB_CATEGORY_MAP` / `CATEGORY_LABELS` / `ALLOWED_DB_CATEGORIES` 权威源
- ✓ **stylelint 移除**：未真正生效且无用处

### 进行中（status: migration）

- □ **Worker 页面接入**：组件已从 8 个 Worker 页面全部提取，页面主体逐步替换旧 class 接入 gd 体系
- ✓ **安全头页内副本**：各 Worker 自带 `SECURITY_HEADERS`（不 import shared）；CSP 允许 Google Fonts（`fonts.googleapis.com` / `fonts.gstatic.com`）

## 2026-09-01

### 已完成

- ✓ **全站线条背景**：除殿堂外用 `gd-groundback--websearch`；殿堂 `--gold` 的 `::after` 叠同款线条（`filter: blur(10.8px)`）
- ✓ **背景不被盖住**：详情/殿堂 `body` 透明，`.gd-groundback { z-index: 0 }`
- ✓ **殿堂条目卡**：`width/height: auto` + 表面线条；勿继承主站卡 420×212
- ✓ **轮播骨架**：`gd-hero.is-loading` + `gd-skeleton--hero`，不要整段 `hidden`
- ✓ **首页快捷栏两框**：`.gd-filter-bar-wrap`，窄屏叠、宽屏左右分；「弹窗」打开欢迎窗
- ✓ **欢迎窗文案**：介绍下居中加粗「详情：新手优先看卡片详情」；去掉日本节点
