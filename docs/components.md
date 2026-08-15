# 组件索引（核心文件）

每个组件记录：**组件名 / 路径 / 用途 / 依赖 / API / class / 事件 / 禁止事项 / 示例**。

---

## gd-button

- **路径**：`src/foundation/actions/gd-button.css`
- **用途**：按钮（主要/次要/危险/胶囊/返回）
- **依赖**：`tokens.css`（色值/圆角/动效）
- **API**：纯 CSS class，无 JS
- **class**：`gd-button`、`gd-button--primary`、`gd-button--secondary`、`gd-button--danger`、`gd-button--pill`、`gd-button--back`
- **事件**：浏览器原生（click/hover/focus/active）
- **禁止**：`<div>` 模拟按钮；硬编码颜色；使用 `gd-control` 旧名
- **示例**：`<button type="button" class="gd-button gd-button--primary">确认</button>`

## gd-link

- **路径**：`src/foundation/actions/gd-link.css`
- **用途**：文字链接（导航型操作）
- **依赖**：`tokens.css`
- **API**：纯 CSS
- **class**：`gd-link`
- **事件**：原生
- **禁止**：无 href 的 `<a>`
- **示例**：`<a class="gd-link" href="/">返回</a>`

## gd-icon-button

- **路径**：`src/foundation/actions/gd-icon-button.css`
- **用途**：图标按钮（仅图标）
- **依赖**：`tokens.css`
- **API**：纯 CSS
- **class**：`gd-icon-button`
- **事件**：原生
- **禁止**：无 `aria-label` 使用（读屏无法识别）
- **示例**：`<button type="button" class="gd-icon-button" aria-label="删除">×</button>`

## gd-card

- **路径**：`src/display/card/gd-card.css`
- **用途**：主站卡片 / 友链卡 / 条目卡（殿堂）
- **依赖**：`tokens.css`（glass 系列）、`gd-tag.css`（标签）
- **API**：纯 CSS；变体 `gd-card--friend`、`gd-card--item`、`gd-card--item--divine/demonic/immortal`
- **class**：`gd-card`、`gd-card__header/icon/title-wrap/title/subtitle/tags/actions/btn`、`gd-card__item-main/body/name/num`、`gd-card__action--site/detail/ext`
- **事件**：无 JS 绑定（预览页按钮不跳转）
- **禁止**：卡片使用 `backdrop-filter`/`box-shadow`（玻璃约定）
- **示例**：见 `docs/examples/card.md`

## gd-modal

- **路径**：`src/feedback/modal/gd-modal.css` + `gd-modal.js` + `gd-publish-card.css`
- **用途**：通用弹窗系统（年龄门/彩蛋/倒计时）；发布卡片弹窗已独立为 `gd-publish-card`
- **依赖**：`tokens.css`、`gd-button.css`
- **API**：`bindGdModal(overlay, trigger)`、`openGdModal`、`closeGdModal`、`startGdRedirectCountdown`
- **class**：`gd-modal-overlay`（+`--nap/--redirect`）、`gd-modal`、`gd-modal__title/body/actions/close`；发布卡片：`gd-publish-card-overlay` + `gd-publish-card`
- **事件**：Esc 关闭、`data-gd-close`、`data-close-on-backdrop`（遮罩点击）、`data-gd-autofocus`
- **required**：`role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- **禁止**：直接绑定业务数据到组件；无 `aria-hidden` 初始态
- **示例**：见 `docs/examples/modal.md`

## gd-publish-card

- **路径**：`src/feedback/modal/gd-publish-card.css`
- **用途**：发布卡片弹窗（品牌标 + GALNAVI 发光字 + 描述 + 进入主站），独立于 gd-modal
- **依赖**：`tokens.css`、`gd-brand.css`（发光字）
- **API**：`bindGdModal("#publishCard", "#btnOpen")`（切换 `.is-open`）
- **class**：`gd-publish-card-overlay`、`gd-publish-card`、`gd-publish-card__header/brand/logo/wordmark/lead/body/note/footer/action/close`
- **事件**：`data-gd-close`、`data-close-on-backdrop`、`data-gd-publish-go`（进入主站）
- **required**：`role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- **示例**：见 `docs/examples/modal.md`

## gd-navbar

- **路径**：`src/navigation/navbar/gd-navbar.css` + `gd-navbar.js`
- **用途**：顶栏 / 抽屉 / 分类导航（圣器殿堂）
- **依赖**：`tokens.css`、`gd-search`、`gd-badge`
- **API**：`initGdNavLinks`（频道切换）、`initGdNavCounts`（计数）、`initGdCatNav`（分类 tab）
- **class**：`gd-navbar`、`gd-navbar__inner/logo/links/link/search/hamburger/right`、`gd-navbar-drawer`、`gd-cat-*`
- **事件**：抽屉（汉堡点击/Esc/遮罩/链接点击）、频道点击切换 `is-active`
- **禁止**：`aria-expanded` 不更新；徽章另写样式（须复用 `gd-badge`）
- **示例**：见 `docs/examples/navbar.md`

## gd-search

- **路径**：`src/navigation/search/gd-search.css` + `gd-search.js`
- **用途**：搜索框（主站 toolbar / 圣器殿堂 group 变体）
- **依赖**：`tokens.css`
- **API**：自定义元素 `<gd-search>`；`initGdSearch`
- **class**：`gd-search`、`gd-search__box/icon/input/clear`、`gd-search--toolbar/--group`
- **事件**：focus 展开、input 显清除、clear 回焦
- **group 变体规范（圣器殿堂搜索框）**：
  - 结构：`.gd-search--group` 内包 `.gd-search > .gd-search__box > icon/input/clear`
  - 尺寸：input 高 48px、圆角 14px、padding `0 44px 0 46px`
  - 主题：金色（`--gd-color-gold-rgb` 边框/发光），focus 时**图标颜色与输入框边框一致**（金色）
  - 交互：focus 时图标变金、输入显示清除按钮（`.is-visible`）、`initGdSearch` 接管清除与 `is-expanded` 状态
- **禁止**：输入框无 `aria-label`；清除按钮无 `aria-label`；未禁用浏览器原生 `::-webkit-search-cancel-button`（避免重复 ×）
- **示例**：见 `docs/examples/search.md`

## gd-tag

- **路径**：`src/display/tag/gd-tag.css`
- **用途**：标签 / 标签索引（tag-item）
- **依赖**：`tokens.css`
- **API**：纯 CSS
- **class**：`gd-tag`（`--blue/--pink`）、`gd-tag--item`、`gd-tag__name/count`、`gd-tag-list`
- **事件**：无
- **禁止**：无

## gd-badge

- **路径**：`src/display/badge/gd-badge.css`
- **用途**：徽标数（navbar 计数泛化）
- **依赖**：`tokens.css`
- **API**：纯 CSS
- **class**：`gd-badge`（`--blue/--gold/--pill`）
- **禁止**：navbar 徽章另写样式（须复用）
- **示例**：`<span class="gd-badge gd-navbar__count" data-gd-nav-count>0</span>`

## gd-toast

- **路径**：`src/feedback/toast/gd-toast.css` + `gd-toast.js`
- **用途**：吐司（操作反馈）
- **依赖**：`tokens.css`
- **API**：`showGdToast(message, ms=2200)`
- **class**：`gd-toast`（`is-open`、`is-demo`）
- **事件**：无（自动消失）
- **required**：`role="status"` + `aria-live="polite"`（JS 自动加）
- **禁止**：手动建 HTML（`showGdToast` 全自动）
- **示例**：见 `docs/examples/toast.md`

## gd-hero

- **路径**：`src/display/hero-carousel/gd-hero-carousel.css` + `.js`
- **用途**：首页轮播
- **依赖**：`tokens.css`
- **API**：`initGdHero(selector)`
- **class**：`gd-hero`、`gd-hero__track/slide/gradient/arrow/dot`、`gd-hero__slide--demo-1/2/3`
- **事件**：箭头/圆点点击（重置自动播放）；自动播放 4.5s
- **禁止**：slide 放 `<img>`（须 background-image）
- **示例**：见 `docs/examples/carousel.md`

## 其它组件速览

| 组件 | 路径 | 用途 | API |
|---|---|---|---|
| `gd-age-gate` | `feedback/modal/` | 年龄门 | `initGdAgeGate` |
| `gd-tooltip` | `feedback/tooltip/` | 提示气泡 | 纯 CSS |
| `gd-skeleton` | `feedback/skeleton/` | 骨架屏 | 纯 CSS |
| `gd-empty-state` | `display/empty-state/` | 空状态 | 纯 CSS |
| `gd-table` | `display/table/` | 表格 | 纯 CSS |
| `gd-brand` | `foundation/brand/` | 品牌标题 | 纯 CSS |
| `gd-footer` | `foundation/layout/` | 页脚 | 纯 CSS |
| `gd-glass` | `foundation/tokens/` | 玻璃工具类 | 纯 CSS |
| `gd-skip-link` | `foundation/accessibility/` | 跳过链接 | 纯 CSS |
| `gd-filter-bar` | `extend/websearch/` | filter-bar | 纯 CSS |
| `gd-nap` | `extend/websearch/` | 纳普彩蛋 | `initGdNap` |
| `gd-donate-*` | `extend/donate/` | 捐献页 | 纯 CSS |
| `gd-highlights`/`gd-section-card` | `extend/detail/` | 详情页 | 纯 CSS |
