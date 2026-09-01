# GALNAVI — AI 怎么干活

本仓库是 **gal-navigation 开源仓**。现网部署配置不在这里。

GALNAVI（galnavi.top）：ACG 导航。Cloudflare Workers + D1 + KV + R2。页面单文件内联。皮肤 **gd 1.5.2**，知识库 **1.3.0**（`docs/gd.config.json`）。

## 先读哪

1. 根 `README.md` — 项目介绍
2. 本文件 — 能改什么
3. `docs/standard/usage.md` — 组件怎么写
4. `kb/README.md` — 查哪篇笔记
5. 改 SQL/绑名前：`kb/04_Internal/Data/存储.md`

## 怎么改

| 改什么 | 动哪 | 还要 |
|--------|------|------|
| 外观 / 组件 | `src/` | 预览 `src/preview/index.html`；同步内联进对应 `worker/<页>.js` |
| 页逻辑 | `worker/<页>.js` | 零 `import`；对照 `worker/shared/` 再抄进页内 |
| 对照常量/转义 | `worker/shared/` | 现网页不 import |
| 对照分层（未接入） | `worker/layer/` | **入口文件没有 import**，不要当成现网已经分层 |
| 规范 | `docs/standard/`、`docs/components.md` | 升 `gd.config.json` 的 `version` + `docs/CHANGELOG.md` |
| 现网口径 | `kb/` | 升 `kbVersion` |

**禁止：** 直接改 D1；在 `worker/*.js` 里 `import`；硬编码颜色；卡片用 `backdrop-filter` / `box-shadow`；`div onclick`；未问就 `git commit` / 部署 / 写密钥。

`status.js` 仍是 **β**，不要按已发布源码去改成现网完整版。

编码 UTF-8 无 BOM。

## 本仓有什么

| 路径 | 干什么 |
|------|--------|
| `src/` | gd 组件源与预览 |
| `worker/*.js` | 发布用页面源码（单文件；**status 为 β**） |
| `worker/shared/` | constants / security / seo 对照 |
| `worker/share/` | robots.txt / sitemap.xml 对照（真正返回在 `index.js`） |
| `worker/layer/` | 分层对照，入口未接入 |
| `docs/` | 组件文档、ADR、示例 |
| `kb/` | 工程知识库 |
| `assets/` | README 截图与 logo |

没有 `wrangler/`、`sandbox/`、`source/`、`worker/new/`。

## 数据（只准帮写查询）

- D1：`nav` / `navi_sites`；友链库 `friend` / `sites`；殿堂 `env.group1` / `resources`
- KV：`HERO_KV`/`hero_images`，`FEATURED_KV`/`featured_items`，`DONATE_KV`/`donors`，`STATUS_KV`，`NOTICE_KV`
- 图：`https://assets.galnavi.top/`
