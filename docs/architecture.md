# 架构说明

本仓库页面在 `worker/*.js`。更短的总览也在根目录 `ARCHITECTURE.md`。

## 数据流

```
D1 / KV
   ↓
Worker（worker/<页>.js 内联 HTML/CSS/JS）
   ↓
浏览器按 gd- class 绘制
```

## worker/

| 内容 | 说明 |
|---|---|
| `worker/<页>.js` | 发布用单文件 Worker（零 import） |
| `worker/status.js` | β |
| `worker/shared/` | 对照源，页面不 import |
| `worker/layer/` | 分层对照，入口未接入 |

## extend/

| 目录 | 来源页面 |
|---|---|
| `extend/overview/` | 总览壳 |
| `extend/websearch/` | 主站 orb / 网格 / 彩蛋 |
| `extend/donate/` | 捐献 |
| `extend/detail/` | 详情 |
| `extend/home/` | 发布页 |

没有 `extend/about`、`extend/help`、`extend/palace`。
