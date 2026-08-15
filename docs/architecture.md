# 架构说明

本文档说明各层职责与数据流向。

## 数据流

```
D1 / KV（nav 数据库）
   ↓ 查询
Worker（worker/*.js）
   ↓ 拼 HTML + 内联样式
HTML（页面返回给浏览器）
   ↓ class 匹配
gd 组件（src/ 组件库，浏览器侧 CSS/JS）
   ↓ 渲染
浏览器
```

## 各层职责

### src/ —— 浏览器组件

| 内容 | 说明 |
|---|---|
| `foundation/tokens/` | `--gd-*` 设计变量 + 玻璃工具类 |
| `*/*.css` | 组件外观（gd- 前缀 class） |
| `*/*.js` | 通用行为（弹窗开闭、抽屉、搜索、年龄门等） |
| `preview/index.html` | 组件总览预览页 |
| `preview/gd-preview.js` | esbuild 打包产物（入口在 `esbuild 入口（内部）`） |

### worker/ —— 服务端逻辑

| 内容 | 说明 |
|---|---|
| `websearch.js` 等 8 个页面 Worker + `d1-rest.js` API | 查 D1/KV、拼 HTML、安全头、跳转逻辑 |
| `worker/shared/constants.js` | 分类常量权威源（DB 键 / 前端键 / 标签） |
| `worker/shared/security.js` | 安全头基线 + 转义工具 |
| `worker/shared/seo.js` | meta / OG / JSON-LD 拼装 |

**关键边界**：`worker/shared/` 只给 Worker import，**不打包进浏览器**；`src/` 只在浏览器运行。

### extend/ —— 业务页面组件

按来源 Worker 页面归类：

| 目录 | 来源页面 |
|---|---|
| `extend/overview/` | 组件总览页自身壳层（虚线分割、索引） |
| `extend/websearch/` | websearch.js（filter-bar、纳普彩蛋） |
| `extend/donate/` | donate.js（扫码卡、名单） |
| `extend/detail/` | detail.js（亮点横幅、三列详情卡） |
| `extend/home/` | index.js（发布页） |
| `extend/about/` | about.js（关于页） |
| `extend/help/` | help.js（帮助页） |
| `extend/palace/` | palace.js（圣器殿堂页） |

## 分层原则

- **核心组件**：跨页面复用 → 放基础/导航/展示/反馈
- **页面组件**：单页面使用 → 放 `extend/<页面名>/`
- **不要**把页面业务（跳转地址、查询逻辑）写进组件
