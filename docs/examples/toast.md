# gd-toast 吐司使用示例

## 错误写法

```html
<!-- ❌ 无 role/aria-live、div 拼装、无自动消失 -->
<div id="toast" onclick="hide()">已复制</div>
```

## 正确写法

```js
import { showGdToast } from "./toast/gd-toast.js";

// 显示吐司（默认 2.2s 自动消失）
showGdToast("已复制到剪贴板");
showGdToast("操作失败", 3000); // 自定义时长
```

`showGdToast` 会自动：

- 查找页面中 `gd-toast` 元素并复用，没有则创建（`role="status"` + `aria-live="polite"`，读屏友好）
- 追加消息内容
- 计时后自动隐藏（`is-open` 切换）

## 静态预览（预览页用）

```html
<div class="gd-toast is-demo" role="status">已复制到剪贴板（预览）</div>
```

`.is-demo` 让吐司以静态块展示在预览框内，不触发 JS 行为。

## 内置能力

- **读屏播报**：`role="status"` + `aria-live="polite"`
- **自动消失**：默认 2200ms，可传第二个参数
- **复用实例**：连续调用共用同一元素，重置计时
- **避让演示**：自动跳过 `.is-demo` 静态预览

## 要点

- 真实业务中吐司应承载操作结果（复制成功、提交失败等）
- 无需手动建 HTML，`showGdToast` 全自动
