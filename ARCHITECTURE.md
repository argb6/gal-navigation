# ARCHITECTURE

> gd = GalNavi Design — GALNAVI 自研设计体系。  
> 对齐 Material Design 3 语义，保留玻璃拟态皮肤。

## 设计原则

| MD3 维度 | 落地方式 |
|----------|----------|
| Color roles | token 角色名对齐 MD3（primary / on-surface / error），色值用自有调色板 |
| Shape | `--gd-shape-corner-*` 对应 MD3 corner scale，数值映射自现网 |
| Typography | `--gd-type-*` 档位对齐 Display/Headline/Title/Label/Body |
| Motion | `--gd-motion-duration-*` / `--gd-motion-easing-*` 参考 MD3 short/medium |
| State layers | hover/focus/pressed 透明度叠加，disabled 0.38 |
| Touch / a11y | 触控目标 ≥ 48px，`:focus-visible` 可见焦点，`prefers-reduced-motion` |

## 禁止项

- 不引入 Material 默认紫色主题
- 不引入 MDC Web 组件库
- 不改玻璃透明度和 backdrop-filter
- 不做 MD3 五种 Button 变体硬套

**一句话：MD3 = 规矩与语义；gd = 皮肤与代码壳。**

## 组件体系

```
gd — GalNavi Design
├── foundation/     基础（tokens / glass / button / link / brand / layout / footer / a11y）
├── navigation/     导航（navbar / search）
├── display/        展示（card / tag / badge / table / empty-state / hero-carousel）
├── feedback/       反馈（modal / toast / tooltip / skeleton）
├── extend/         扩展（按 Worker 页面归类）
├── runtime/        注册入口（gd.js）
└── preview/        预览页
```

14 核心组件 + 168+ 设计变量。

## Worker 架构

每个页面是单文件 Worker（HTML/CSS/JS 全内联），通过 Service Binding 互联。

```
请求 → error.js（catch-all 路由）
  ├─ /          → index Worker
  ├─ /nav/      → websearch Worker
  ├─ /nav/palace/ → palace Worker
  └─ *          → 404 页面
```

## 数据流

```
D1/KV → Worker → safeJson() → HTML（CSS 内联 + JS 内联 + 数据注入）→ 浏览器
```

三条路径：
- **B-SSR**：Worker 直连 D1/KV，拼 HTML 返回
- **B-JSON**：Worker 注入 JSON 到 `<script>`，客户端渲染
- **B-REST**：独立 API Worker，D1 CRUD

## 安全基线

- CSP：`default-src 'self'; script-src 'self' 'unsafe-inline'`（各页只可收紧）
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control: private, no-store`

## 相关文档

| 文档 | 内容 |
|------|------|
| `docs/tokens.md` | 设计变量参考 |
| `docs/components.md` | 组件索引 |
| `docs/decisions/` | 架构决策记录（ADR） |
| `src/README.md` | 组件库详细说明 |
