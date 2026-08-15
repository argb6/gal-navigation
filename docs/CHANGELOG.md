# CHANGELOG

## v1.3.0（当前）

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

- `gd-skeleton--item` 变体（殿堂条目卡骨架，尺寸/结构对齐 `gd-card--item`）
- `gd-search__hl` 搜索词高亮（蓝色普通 / 橙色殿堂，走 token）
- `gd-brand__title--palace` 发光标题（橙 → 绿 → 红往返循环，殿堂主题）
- 统一访问记录 `site-verified`（cookie + localStorage 双通道，发布页确认与各页首访检测共用）
- gd-search group 变体规范（圣器殿堂搜索框：focus 图标金色、48px、原生 × 禁用）

### 完善

- `gd-groundback--blue` 按原版发布页增强：三层光斑 + 深蓝对角渐变 + 点阵网格 + 底部光带
- `gd-button--back` 默认背景改黑色 70% 透明（`rgba(0,0,0,0.3)`）
- `gd-link` 兼容 `<button>` 元素（背景透明、去原生边框）
- 圣器殿堂页面组件化：分类导航（gd-cat-nav）、卡片（gd-card--item）、页脚（gd-footer）、搜索（gd-search--group）、数据加载骨架
- `docs/tokens.md` 增加「文字链接（gd-link）规范」

### 去除

- 浏览器原生搜索清除按钮（`::-webkit-search-cancel-button`，避免与 `gd-search__clear` 重复 ×）
- 沙盒 mock 示例数据（palace 部署用真实 D1）

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

---

## 重构迁移记录（2026-08-10）

### 已完成

- 组件库结构重构：foundation/navigation/display/feedback/extend + runtime + preview
- detail 归类：详情页组件移入 `extend/detail/`
- skeleton 归类：骨架屏移入反馈分支 `skeleton/`
- 扩展按 Worker 页面归类：`extend/{overview,websearch,home,about,help,donate,palace,detail}/` 全部 ready
- tokens 统一：新增 `--gd-color-on-surface-subtle` 实色 token，替换透明浅字
- glass 工具类：`tokens/gd-glass.css`（卡片级/浮层级/顶栏级）
- badge 泛化：navbar 计数提取为 `gd-badge` 组件
- 无障碍：跳过链接、forced-colors、弹窗 inert、焦点指示、reduce-motion
- file:// 兼容：JS 打包为 `gd-preview.js` 普通脚本
- worker constants 对齐：`DB_CATEGORY_MAP` / `CATEGORY_LABELS` / `ALLOWED_DB_CATEGORIES` 权威源
- stylelint 移除：未真正生效且无用处

### 进行中

- Worker 页面接入：组件已从 8 个 Worker 页面全部提取，页面主体逐步替换旧 class 接入 gd 体系
- 安全头统一：各 Worker 仍手写安全头，未接入 `mergeSecurityHeaders`
