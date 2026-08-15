# 使用规范

## 新页面开发流程

1. 先查 `tokens.css` 是否已有需要的变量
2. 复用已有组件 class（`gd-card`、`gd-button`…），不要自造同义 class
3. 新 UI 的归属按下方判断标准表决定

## 硬性约定

### 颜色

- **禁止**硬编码颜色，必须用 `--gd-*` token：

```css
/* ❌ 不要 */
.page-card {
  background: #111;
}

/* ✅ 应该 */
.gd-card {
  background: var(--gd-glass-bg);
}
```

- **禁止**低对比透明浅字（如 `rgba(232,238,255,.38)`），用实色 token `--gd-color-on-surface-subtle`

### 玻璃

- 卡片类**不用** `backdrop-filter` / `box-shadow`；遮罩/浮层按现网数值使用（完整约定见 `tokens.md`）

### 交互

- 必须真实 `<button>` 或 `<a href>`，禁止 `div onclick`
- 预览页按钮一律 `<button type="button">`，不绑链接

## 新组件判断标准

| 条件 | 归属 |
|---|---|
| 三个页面以上使用 | 核心组件（基础/导航/展示/反馈） |
| 单页面使用 | `extend/<页面名>/` |
| 纯视觉基元 | `actions/` |
| 设计变量 | `tokens/` |

## 无障碍底线

- `:focus-visible` 可见焦点
- 弹窗背景 `inert`、焦点返回
- `prefers-reduced-motion` 关闭非必要动画
- `forced-colors` 下边框/图标可见
- 目标尺寸 ≥ 24px（推荐 48px）

## 返回主站按钮（gd-button--back）

返回类按钮用 `<a>` + 组件类：`gd-button gd-button--back`（普通），殿堂橙变体 `gd-button gd-button--back gd-button--back--orange`；固定视口左上角时追加 `gd-back-fab`（页面级定位类）。

- **显示**：电脑端与手机端**均显示**，禁止媒体查询隐藏（旧 `.gd-back-fab { display: none }` 已废除）
- **大小**：桌面高 `40px`；移动端（≤640px）高 `44px`（触控目标 ≥44px 推荐）
- **上左间距**：距视口上、左边界 `12px`，刘海屏用 `env(safe-area-inset-*)` 兜底：

```css
.gd-back-fab {
  position: fixed;
  top: max(12px, env(safe-area-inset-top, 0px));
  left: max(12px, env(safe-area-inset-left, 0px));
  z-index: 50;
}
```

- **可访问性**：`aria-label` 必填（如"返回主站"），图标 `aria-hidden="true"`

## 打包与预览

- 改 JS 后必须重新打包 `gd-preview.js`（命令见 `src/README.md` 预览章节）
- 文件一律 UTF-8

## 统一访问记录（site-verified）

全站"已访问过本站"的判定，统一用一个 key（`worker/shared/config.js` 的 `VERIFIED_KEY`）。

- **机制**：cookie + localStorage 双通道，值 `1`，有效期 365 天（`max-age=31536000`）
- **写入时机**：
  - 发布页（`worker/index.js`）年龄确认后写入
  - palace 等页面首访检测：未存在该 key → 写入 + 跳转首页
- **判定**：任一通道命中 `site-verified=1` 即视为已访问，不再跳转
- **禁止**：各页自造不同 key

示例（页面 script 首访检测）：

```js
(function () {
  var KEY = "site-verified";
  function get() {
    var c = false, s = false;
    try { c = document.cookie.split("; ").some(function (x) { return x.indexOf(KEY + "=1") === 0; }); } catch (e) {}
    try { s = localStorage.getItem(KEY) === "1"; } catch (e) {}
    return c || s;
  }
  function set() {
    try { document.cookie = KEY + "=1; max-age=31536000; path=/; SameSite=Lax"; } catch (e) {}
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
  }
  if (!get()) { set(); window.location.replace("/"); }
})();
```
