# GALNAVI — AI 怎么干活

给 Cursor / Copilot 等用。人读项目地图看根目录 `README.md`。

GALNAVI（galnavi.top）：ACG 导航。Cloudflare Workers + D1 + KV + R2。页面单文件内联。皮肤是 **gd 1.5.2**（`docs/gd.config.json` 的 `version`）。知识库 **1.3.0**（同文件 `kbVersion`）记现网口径和踩坑，不代替组件 CHANGELOG。

## 先读哪

1. 根 `README.md` — 文件夹怎么连  
2. 本文件 — 能改什么、禁什么  
3. `docs/standard/usage.md` — 组件怎么写  
4. `kb/GALNAVI-KB/README.md` — 查哪篇笔记  
5. 改绑定/SQL 前：`kb/.../存储.md`（真名：`HERO_KV`、`env.group1`，不是脱敏假名）

决策正文：`docs/decisions/`。示例：`docs/examples/`。组件版本：`docs/CHANGELOG.md`。坑：`kb/GALNAVI-KB/05_Log/Problem/`，总表 `kb/GALNAVI-KB/05_Log/记录索引.md`。

## 怎么改（流程）

| 改什么 | 动哪 | 还要 |
|--------|------|------|
| 外观 / 组件 | `src/` | 预览 `src/preview/index.html`；**同步内联进用到的 `worker/new/*.js`** |
| 预览脚本 | `src/**/*.js` + `temp/gd-preview-entry.js` | `npx esbuild --configfile=esbuild.config.js` |
| 页逻辑 / 数据查询 | `worker/new/<页>.js` | 零 `import`；对照 `worker/shared/` 后把副本抄进页内 |
| 本地试页面 | `sandbox/` | 可 import shared；不要把沙盒当已上线 |
| 绑定 | `wrangler/<页>.toml` | 与 `env.xxx` 一致；勿提交 `.wrangler/` |
| 组件规范 / token 说明 | `docs/standard/`、`docs/components.md` | 升 `gd.config.json` 的 `version` + `docs/CHANGELOG.md` |
| 现网口径 / 坑 | `kb/GALNAVI-KB/` | 升 `kbVersion`，改知识库 `README` 版本表 |

**禁止：** 直接改 D1；在 `worker/new` 里 `import`；把 `src/` 和 Worker 模块交叉 import；硬编码颜色；卡片用 `backdrop-filter` / `box-shadow`；`div onclick`；未问就 `git commit` / 部署 / 改密钥。

编码 UTF-8 无 BOM。乱码先停，问人。

## 组件

- class `gd-`，变量 `--gd-*`。token 只在 `src/foundation/tokens/tokens.css` 加，再同步各页 `:root`。
- 跨页 → foundation / navigation / display / feedback。单页 → `src/extend/<页>/`。
- 现网组件笔记：`kb/.../02_Component/`。索引：`docs/components.md`。红线：`docs/standard/usage.md`。
- 自定义元素只注册 `gd-modal` / `gd-navbar` / `gd-search`（`src/runtime/gd.js`）。`gd-orb` 不是自定义元素。
- 触控 ≥ 48px，`:focus-visible`，`prefers-reduced-motion` 关多余动画。
- 改了 `src` 的 CSS 却不改 `worker/new`，线上还是旧皮。

## 知识库干什么

`kb/GALNAVI-KB/` 回答「现网到底怎样、为什么」。绑定名、库 ID、路由、表结构都可以写。**不要写**接口密钥、账密、token 明文。组件版本故事在 `docs/CHANGELOG.md`，不要两处长文对抄。入口 `kb/GALNAVI-KB/README.md`。Log 只指路：`docs/decisions/`、`docs/examples/`。

## 踩过的坑（先看再改同类代码）

| 笔记 | 要点 |
|------|------|
| `kb/.../Problem/Problem-公告注入布局错乱.md` | 替换 DOM 要整块，不能只换开始标签 |
| `kb/.../Problem/Problem-shenmo 命名混乱.md` | 改名要搜注释、KV key、Worker 内联副本 |

更多路径：`kb/GALNAVI-KB/05_Log/记录索引.md`。

## 各文件夹

| 路径 | AI 怎么用 |
|------|-----------|
| `src/` | gd 源。改完同步 Worker。 |
| `src/preview/` | 组件总览。file:// 可开。 |
| `worker/new/` | 唯一部署源。十页。 |
| `worker/shared/` | 对照 constants/security/seo。 |
| `worker/share/` | robots / sitemap 静态。 |
| `wrangler/` | toml。无 README、无 check 脚本。 |
| `sandbox/` | 本地预览。Cookie/年龄门已卸。 |
| `source/` | `worker/new` 阅读副本（十页；密钥已掏空）。勿部署。 |
| `docs/` | 组件文档 + ADR + 示例。`standard/` 是用法。 |
| `kb/GALNAVI-KB/` | 工程知识。 |
| `temp/` | 预览打包入口。 |
| `backup/` | 旧文件。勿当现行。 |
| `node_modules/` | 依赖。 |
| `.kilo/` `.freebuff/` | 编辑器/工具缓存。勿当源码改。 |

根上配置：`package.json`、`esbuild.config.js`、`eslint.config.mjs`、本文件、`README.md`。

## 数据（只准帮写查询）

- D1 `DB` / 库 `nav`：表 `navi_sites`（导航）。友链是另一库 `friend` 的表 `sites`
- D1 `group1`：表 `resources`（殿堂）。绑定名就是 `group1`
- KV：`HERO_KV`/`hero_images`，`FEATURED_KV`/`featured_items`，`DONATE_KV`/`donors`，`STATUS_KV`/`state`+`api_cache`，`NOTICE_KV`/`notice`
- 图：`https://assets.galnavi.top/`

`error` 的 service binding 没有 status。`/status/` 走控制台绑在 status Worker。

## 命令

```bash
npm install
npm run lint
npm run deploy:websearch
npx wrangler deploy -c wrangler/<name>.toml
node sandbox/serve.mjs
npx esbuild --configfile=esbuild.config.js
```

密钥：`CF_API_TOKEN` 用环境变量。status 页若仍有页内 token，开源前必须拿掉并轮换。`.wrangler/` 不可提交。
