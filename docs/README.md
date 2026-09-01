# GalNavi gd 组件库 · 总说明

`src/` 是 GalNavi 自研的浏览器侧组件库（原生 CSS + CSS 变量 + 少量 Web Components），服务于现有 Cloudflare Worker 页面。页面数据、跳转、过滤和服务端逻辑由 Worker 自己处理；组件库只负责外观、交互状态和少量通用行为。

## 技术边界

- **不用** Shadow DOM（Light DOM 有意选择，Worker 拼出的 HTML 可直接用同一套 class）
- 只加载页面需要的 CSS 与行为脚本，不要求一次性重写页面

## 目录结构（七组 + 入口）

| 层 | 目录 | 内容 |
|---|---|---|
| 基础 | `foundation/` | 设计变量、操作基元（actions）、页面基础（layout/brand/footer）、无障碍 |
| 导航 | `navigation/` | navbar、search |
| 展示 | `display/` | card、tag、table、empty-state、hero-carousel 等 |
| 反馈 | `feedback/` | modal、toast、tooltip、skeleton 等 |
| 扩展 | `extend/` | 按 Worker 页面归类的业务页组件 |
| 注册 | `runtime/` | 自定义元素注册入口 |
| 预览 | `preview/` | 组件总览页 + 打包产物 |

完整目录树见 [`src/README.md`](../src/README.md)。版本戳 [`gd.config.json`](./gd.config.json)。

## 开发流程

1. 改代码前先读本目录各文档
2. 新增组件：选目录 → token 样式 → `preview/index.html` 加展示 → 更新文档（详见 [`standard/usage.md`](./standard/usage.md)）
3. 改了 JS 必须重新打包（命令见 `src/README.md` 预览章节）
4. 预览：双击 `src/preview/index.html`（file://）或静态 HTTP 服务

## 文档导航

| 文档 | 内容 |
|---|---|
| [`architecture.md`](./architecture.md) | 整体架构与数据流 |
| [`components.md`](./components.md) | 组件索引 |
| [`CHANGELOG.md`](./CHANGELOG.md) | 组件库版本 |
| [`standard/tokens.md`](./standard/tokens.md) | 设计变量 |
| [`standard/usage.md`](./standard/usage.md) | 使用规范、编码约定 |
| [`standard/open-source-prep.md`](./standard/open-source-prep.md) | 开源脱敏清单 |
| [`examples/`](./examples/) | 短示例 |
| [`decisions/`](./decisions/) | ADR |
| [`../kb/GALNAVI-KB/README.md`](../kb/GALNAVI-KB/README.md) | 知识库入口与版本 |
