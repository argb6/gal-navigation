# GALNAVI

ACG 二次元资源聚合导航站，运行在 Cloudflare Workers + D1 + KV 上。

所有页面为单文件 Worker（HTML/CSS/JS 全内联），共享自研 gd 组件库（GalNavi Design，对齐 Material Design 3 语义，保留玻璃拟态皮肤）。

## 目录结构

| 路径 | 用途 |
|------|------|
| `src/` | gd 组件库（foundation/navigation/display/feedback/extend/runtime/preview） |
| `worker/` | 服务端 Worker（页面入口 + 功能层 + 共享配置） |
| `docs/` | 组件库文档（架构/tokens/组件索引/使用规范/ADR/示例） |
| `kb/` | 工程知识库（项目/技术/组件/架构/内部/决策/问题） |
| `asset/` | 图片资源 |

## 页面

| 页面 | Worker | 说明 |
|------|--------|------|
| 首页 | `worker/index.js` | 发布页 |
| 主站导航 | `worker/websearch.js` | 站点列表 + 搜索 + 轮播图 |
| 圣器殿堂 | `worker/palace.js` | 分组资源浏览 |
| 关于 | `worker/about.js` | 起源 / 发展史 / 声明 |
| 使用指南 | `worker/help.js` | 标签 / 卡片 / 工具说明 |
| 友情链接 | `worker/friend.js` | 友链列表 + 申请提交 |
| 捐献 | `worker/donate.js` | 捐款名单 |
| 站点状态 | `worker/status.js` | 服务监控 + 公告 |
| 404 兜底 | `worker/error.js` | catch-all 路由 |

## 技术栈

| 层 | 技术 |
|---|---|
| 运行时 | Cloudflare Workers（V8 isolates） |
| 数据库 | Cloudflare D1（SQLite）、Cloudflare KV |
| 组件库 | 原生 CSS + CSS 变量 + 少量 Web Components（Light DOM） |

## 核心约定

### CSS/组件

- 所有 class 使用 `gd-` 前缀，变量使用 `--gd-` 前缀
- 禁止硬编码颜色，必须用 `--gd-*` token
- 禁止低对比透明浅字，用实色 token `--gd-color-on-surface-subtle`
- 卡片类不用 `backdrop-filter` / `box-shadow`；遮罩/浮层按现网数值使用
- 交互必须真实 `<button>` 或 `<a href>`，禁止 `div onclick`
- 触控目标 ≥ 48px，`:focus-visible` 可见焦点，`prefers-reduced-motion` 关闭非必要动画

### Worker

- 单文件 Worker：HTML/CSS/JS 全内联，无运行期外链
- 安全头基线见 `ARCHITECTURE.md`；各页只可收紧
- `worker/shared/` 只给 Worker / layer import，不打包进浏览器（constants / security / seo）
- `src/` 只在浏览器运行，不 import Worker 模块

### Worker 功能层

```
worker/layer/
├── api/           路由 + 端点处理
├── database/      D1 + KV 查询封装
├── service/       搜索/SEO/缓存/站点检测
├── render/        HTML 拼装 + 数据注入
├── security/      CSP + CORS + 转义 + 验证
└── utils/         响应构建 + 格式化
```

## 文档

| 文档 | 内容 |
|------|------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 公开架构（设计原则、组件体系、Worker 架构、数据流、安全基线） |
| [`docs/README.md`](./docs/README.md) | 组件库文档入口 |
| [`docs/tokens.md`](./docs/tokens.md) | 设计变量参考 |
| [`docs/components.md`](./docs/components.md) | 组件索引 |
| [`docs/decisions/`](./docs/decisions/) | 架构决策记录（ADR，9 条） |
| [`kb/`](./kb/) | 工程知识库（28 个知识节点） |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | 贡献指南 |
