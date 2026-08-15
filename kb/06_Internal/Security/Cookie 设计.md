---
type: architecture
category: Architecture
tags: [cookie, session, storage, security]
status: active
created: 2026-08-14
updated: 2026-08-14
related: [[安全头]], [[Worker 架构]]
---

# Cookie 与 Storage 设计

## Summary

全站使用 3 种 Cookie + 1 种 sessionStorage，统一前缀 `site-`。

## Cookie 清单

| Key | 用途 | 有效期 | 存储方式 | 使用页面 |
|-----|------|--------|----------|----------|
| `site-verified` | 首访确认（年龄门） | 365 天 | cookie + localStorage | 全部页面 |
| `site-age-verified` | 年龄门专用 | 365 天 | cookie | 首页 |
| `site-welcome-seen` | 欢迎弹窗标记 | 30 天 | cookie | 主站 |
| `site-scroll` | 滚动位置记忆 | 会话 | sessionStorage | 主站 |

## 双通道机制

`site-verified` 使用 cookie + localStorage 双通道：

```js
function get() {
  var c = false, s = false;
  try { c = document.cookie.split("; ").some(x => x.indexOf(KEY + "=1") === 0); } catch (e) {}
  try { s = localStorage.getItem(KEY) === "1"; } catch (e) {}
  return c || s;
}
```

任一通道命中即视为已访问，不再跳转。

## 写入时机

- **site-verified**：首页年龄确认后写入
- **site-age-verified**：首页年龄确认后写入
- **site-welcome-seen**：主站欢迎弹窗关闭后写入
- **site-scroll**：主站页面离开前写入滚动位置

## 首访检测逻辑

```js
if (!get()) {
  set();
  window.location.replace("/");  // 跳转首页
}
```

## Related

- [[安全头]] — CSP 基线
- [[Worker 架构]] — 单文件模式
- 文件：`worker/layer/security/cookie.js`
