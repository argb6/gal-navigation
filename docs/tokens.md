# 设计变量说明（tokens）

> `src/foundation/tokens/tokens.css` 是**唯一换肤入口**：改这里的 `--gd-*` 变量即可全局换主题。

## 颜色

| 变量 | 值 | 用途 |
|---|---|---|
| `--gd-color-background` | `#1c2a48` | 页面背景 |
| `--gd-color-surface` | `#18253f` | 表面 |
| `--gd-color-surface-variant` | `#223456` | 表面变体 |
| `--gd-color-primary` | `#4f7cff` | 主色（蓝） |
| `--gd-color-on-primary` | `#ffffff` | 主色上文字 |
| `--gd-color-secondary` | `#a855f7` | 次色（紫） |
| `--gd-color-tertiary` | `#ec4899` | 第三色（粉） |
| `--gd-color-on-surface` | `#f4f7ff` | 主文字 |
| `--gd-color-on-surface-variant` | `#8b9cc0` | 次要文字 |
| `--gd-color-on-surface-subtle` | `#aeb9d6` | 弱化文字（实色，勿用透明浅字） |
| `--gd-color-outline` | `#1e2a45` | 边框 |
| `--gd-color-error` | `#f87171` | 错误 |

## 圆角

| 变量 | 值 | 用途 |
|---|---|---|
| `--gd-shape-corner-none` | 0 | 无 |
| `--gd-shape-corner-extra-small` | 8px | 小控件 |
| `--gd-shape-corner-small` | 14px | 按钮/图标 |
| `--gd-shape-corner-medium` | 18px | 卡片 |
| `--gd-shape-corner-large` | 20px | 大卡片 |
| `--gd-shape-corner-extra-large` | 28px | 大容器 |
| `--gd-shape-corner-full` | 9999px | 胶囊 |

## 字号

| 变量 | 值 | 用途 |
|---|---|---|
| `--gd-type-display-medium-size` | 48px | 特大展示（空状态图标等） |
| `--gd-type-display-small-size` | 36px | 品牌大标题 |
| `--gd-type-headline-small-size` | 24px | 页面大标题 |
| `--gd-type-title-large-size` | 22px | 弹窗标题/品牌 |
| `--gd-type-title-xxl-size` | 18px | 弹窗副标题 |
| `--gd-type-title-medium-size` | 16px | 卡片标题 |
| `--gd-type-title-small-size` | 15px | 条目标题/主按钮 |
| `--gd-type-hero-title-size` | 20px | 区块大标题 |
| `--gd-type-label-large-size` | 14px | 按钮/导航链接 |
| `--gd-type-label-medium-size` | 12px | 标签/徽标 |
| `--gd-type-label-small-size` | 11px | 小徽标 |
| `--gd-type-note-size` | 13px | 说明文字/次要按钮 |
| `--gd-type-body-large-size` | 16px | 正文大 |
| `--gd-type-body-medium-size` | 14px | 正文 |
| `--gd-type-body-small-size` | 12px | 正文小/注释 |

> 字号规则：全部走 `--gd-type-*` token，禁止硬编码 font-size；`clamp()` 流体字号与 0.5px 微调除外。

## 字距

| 变量 | 值 | 用途 |
|---|---|---|
| `--gd-type-letter-spacing-tight` | -0.5px | 品牌标题（负字距） |
| `--gd-type-letter-spacing-normal` | 0.01em | 正文/导航默认 |
| `--gd-type-letter-spacing-wide` | 0.1em | 按钮/标签强调 |
| `--gd-type-letter-spacing-extra-wide` | 0.24em | 品牌副标题/装饰 |

## 字重

| 变量 | 值 | 语义 |
|---|---|---|
| `--gd-weight-regular` | 400 | 正文/描述 |
| `--gd-weight-medium` | 500 | 弱强调 |
| `--gd-weight-semibold` | 600 | 按钮/标签 |
| `--gd-weight-bold` | 700 | 标题/徽标 |
| `--gd-weight-extrabold` | 800 | 品牌/数字 |
| `--gd-weight-black` | 900 | 品牌特大标题 |

> 字重/字距规则：一律走 token，禁止硬编码数值。

## 状态层 / 动效

| 变量 | 值 |
|---|---|
| `--gd-state-hover` / focus / pressed / dragged / disabled | 0.08 / 0.12 / 0.12 / 0.16 / 0.38 |
| `--gd-motion-duration-short2/4` | 100ms / 200ms |
| `--gd-motion-duration-medium1/2/4` | 250ms / 300ms / 400ms |
| `--gd-motion-easing-standard/emphasized` | cubic-bezier(0.2,0,0,1) |

## 布局 / 玻璃

| 变量 | 值 | 用途 |
|---|---|---|
| `--gd-nav-height` | 64px | 顶栏高度 |
| `--gd-layout-max-width` | 1200px | 内容最大宽 |
| `--gd-touch-target` | 48px | 触控热区 |
| `--gd-glass-bg` | rgba(18,22,40,.42) | 卡片玻璃底 |
| `--gd-glass-bg-hover` | rgba(22,28,48,.52) | 卡片 hover |
| `--gd-glass-border` | rgba(255,255,255,.14) | 卡片边框 |
| `--gd-glass-blur` | blur(18px) saturate(165%) | 浮层模糊 |
| `--gd-glass-nav-bg` | rgba(8,12,24,.75) | 顶栏玻璃底 |
| `--gd-glass-nav-blur` | blur(20px) saturate(180%) | 顶栏模糊 |

## 链接 / 彩点 / 标签 / 徽标

| 变量 | 值 | 用途 |
|---|---|---|
| `--gd-color-link` | #7aa2f7 | 链接静止色（对齐 about.js） |
| `--gd-color-link-hover` | #9ec0ff | 链接 hover（深蓝） |
| `--gd-dot-1/2/3` | primary/secondary/tertiary | 彩点循环三色（filter-bar 等） |
| `--gd-dot-neutral` | #5a6a8a | 彩点中性兜底 |
| `--gd-tag-1-bg/fg/border` | 紫（rgba(168,85,247,…)） | 标签第 1 色 |
| `--gd-tag-2-bg/fg/border` | 蓝（rgba(59,130,246,…)） | 标签第 2 色 |
| `--gd-tag-3-bg/fg/border` | 粉（rgba(236,72,153,…)） | 标签第 3 色 |
| `--gd-badge-bg/fg` | 白 14% / #d7e2ff | 徽标默认 |
| `--gd-badge-blue-bg/fg` | 蓝 28% / #eaf0ff | 徽标 blue |
| `--gd-badge-gold-bg/fg` | 金 14% / #fcd34d | 徽标 gold |

> 标签三色循环：卡片标签按 `nth-child(3n+1/2/0)` 循环；徽标默认样式与 tag-count 同源。

## 文字链接（gd-link）规范

链接型文字（导航/说明入口），非按钮。

| 状态 | 颜色 | 字号 | 字距 | 粗细 | 修饰 |
|---|---|---|---|---|---|
| 激发前（默认） | `--gd-color-link`（#7aa2f7） | `--gd-type-body-medium-size`（14px） | `--gd-type-letter-spacing-normal`（0.01em） | `--gd-weight-semibold`（600） | 无下划线 |
| 激发后（hover / focus） | `--gd-color-link-hover`（#9ec0ff） | 同上 | 同上 | 同上 | 下划线（underline-offset 4px）；focus 加 2px primary 描边 |

实现：`src/foundation/actions/gd-link.css` 的 `.gd-link`。

## 玻璃边界约定

- 卡片类（card / detail / badge）：**只用** `--gd-glass-bg/border`，**不用** `backdrop-filter` 和阴影
- 遮罩/浮层（modal / toast）：可用 `--gd-glass-blur` / nav 系列
- 工具类：`gd-glass`（无模糊）、`gd-glass--blur`（浮层）、`gd-glass--strong`（顶栏）
- 线条图案（页面背景 / 条目卡表面）不是玻璃 token：R2 URL `https://assets.galnavi.top/线条图案.png`，装饰层 `filter: blur(10.8px)` + `mix-blend-mode: screen`。这不是 `backdrop-filter`，卡片红线仍然成立
