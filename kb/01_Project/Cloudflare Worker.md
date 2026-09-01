---
title: Cloudflare Worker
tags:
  - galnavi/project
  - cloudflare
  - worker
  - edge
  - runtime
date: 2026-08-14
updated: 2026-09-01
type: concept
category: Project
status: active
related:
  - "[[项目概述]]"
  - "[[Worker 架构]]"
  - "[[部署流程]]"
  - "[[存储]]"
---

# Cloudflare Worker

> [!abstract] Summary
> GALNAVI 跑在 Cloudflare Workers 的 V8 isolate 上。每个页面一个模块 Worker，彼此用 service binding 转发。仓库里的 `worker/shared/` 不是运行时模块。

## Definition

**运行时**是 Cloudflare 在边缘起的 V8 isolate：没有 Node.js、没有本机文件系统、没有常驻进程。一次请求进 isolate，跑完就结束。绑定（D1 / KV / R2 / Service）由平台注入到 `fetch(request, env, ctx)` 的 `env`。

**运行时模块**指 Cloudflare 的 *Module Worker*（模块格式入口），不是「把几个 `.js` 文件 import 到一起」：

- 平台按 **ES Module** 加载 Worker 入口文件。
- 入口必须 `export default { async fetch(request, env, ctx) { … } }`（还可以挂 `scheduled` 等 handler）。
- 对照旧写法是 Service Worker 风格的 `addEventListener("fetch", …)`。GALNAVI 全部用模块格式。
- Wrangler 的 `main` 指向这个入口。isolate 里执行的就是这份脚本（现网各页还把 HTML/CSS/客户端 JS 做成字符串打在同一文件里）。

| 特性 | 说明 |
|------|------|
| 运行时 | V8 isolate（非 Node.js） |
| 运行时模块 | 模块 Worker：`export default { fetch }` |
| 部署 | `npx wrangler deploy -c wrangler/<name>.toml` |
| 绑定 | D1、KV、R2、Service（跨 Worker 调用） |

> [!warning] 两个「模块」
> 「运行时模块」= Cloudflare 怎么加载入口。`worker/shared/` = 仓库里给人看的 JS。后者**不会**作为第二个 Worker 入口部署，现网页也**不** `import` 它。

产品范围、页面表、目录总览见 [[项目概述]]。单文件、路由、GitHub layer 见 [[Worker 架构]]。

## 共享模块边界

按**谁在什么环境执行**切，不要按「文件能不能复用」切。

| 位置 | 谁执行 | 规则 |
|------|--------|------|
| `worker/new/*.js` | Cloudflare isolate | 部署入口。**零 `import`**。安全头、分类常量、SEO 都是页内副本。 |
| `worker/shared/` | 不进现网 Worker 图 | 对照源：改分类/转义/SEO 时以这里为准，再抄回各页。注释里写「各页应 import」是目标写法，**现网未采用**。 |
| `src/` | 浏览器（内联进 HTML 的 CSS/JS） | 禁止 `import` Worker 文件。 |
| `sandbox/**` | 本机 Node 预览 | 可以 `import` `worker/shared/`（例如 NSFW Cookie 辅助）。只服务沙盒，不代表现网。 |
| `worker/share/` | 静态文件 | `robots.txt` / `sitemap.xml`。名字接近 `shared`，不要当成 JS 模块目录。 |

`worker/shared/` 三个文件：

| 文件 | 内容 |
|------|------|
| `constants.js` | 分类键映射、允许列表、`is_active` / NSFW 常量 |
| `security.js` | HTML/属性转义、URL 校验、安全头基线与合并 |
| `seo.js` | meta / OG 片段拼装 |

浏览器拿不到 `worker/shared/`：它若被打进页面，转义与 Cookie 逻辑会泄漏到客户端，也和 [[Decision-单文件 Worker]] 的「一页一份、零运行期外链」冲突。

## 文件位置

- 页面 Worker：`worker/new/*.js`
- 对照源：`worker/shared/`
- 站点静态：`worker/share/`；图片见 [[存储]]
- 配置：`wrangler/<name>.toml`，见 [[部署流程]]

## Related

- [[项目概述]] — 站点范围与仓库布局
- [[Worker 架构]] — 单文件模式与 service binding
- [[安全头]] — CSP 基线
- [[存储]] — R2 图标
