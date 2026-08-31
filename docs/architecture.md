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
| `*/*.js` | 通用行为（弹窗开闭、抽屉、搜索、页脚贴底、详情反向缩放等） |
| `preview/index.html` | 组件总览预览页 |
| `preview/gd-preview.js` | esbuild 打包产物（入口在 `temp/gd-preview-entry.js`） |

### worker/ —— 服务端逻辑

| 内容 | 说明 |
|---|---|
| `worker/new/*.js` | 部署版页面 Worker：查 D1/KV、拼 HTML、页内 `SECURITY_HEADERS`（零 `import`） |
| `source/*.js` | 脱敏阅读副本（无 status、无库接口/API/SEO/Cookie） |
| `worker/shared/constants.js` | 分类常量参考源（DB 键 / 前端键 / 标签）；现网页已抄入，不 import |
| `worker/shared/security.js` | 安全头基线 + 转义工具（参考）；现网页用页内副本 |
| `worker/shared/seo.js` | 生产用 meta / OG / JSON-LD 参考（`source/` 已去掉） |

**关键边界**：`src/` 只在浏览器运行。Worker 页把 gd CSS 内联进单文件；`worker/shared/` 不再被 `worker/new/*.js` import。

### 页面背景

| 变体 | Worker |
|---|---|
| `gd-groundback--websearch` | index / websearch / detail / about / help / friend / donate / status / error |
| `gd-groundback--gold` | palace |

详情等页：`body` 透明，`.gd-groundback { z-index: 0 }`，正文更高，否则旧渐变会盖住线条。

### extend/ —— 业务页面组件

按来源 Worker 页面归类：

| 目录 | 来源页面 |
|---|---|
| `extend/overview/` | 组件总览页自身壳层（虚线分割、索引） |
| `extend/websearch/` | websearch.js（filter-bar 两框、卡片网格、纳普彩蛋、欢迎弹窗） |
| `extend/donate/` | donate.js（扫码卡、名单） |
| `extend/detail/` | detail.js（亮点横幅、三列详情卡） |
| `extend/home/` | index.js（发布页） |
| `extend/about/` | about.js（关于页） |
| `extend/help/` | help.js（帮助页） |
| `extend/palace/` | palace.js（圣器殿堂页） |
| `extend/status/` | status.js（站点状态） |

## 分层原则

- **核心组件**：跨页面复用 → 放基础/导航/展示/反馈
- **页面组件**：单页面使用 → 放 `extend/<页面名>/`
- **不要**把页面业务（跳转地址、查询逻辑）写进组件
