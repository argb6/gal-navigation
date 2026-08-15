# gd-modal 使用示例

## 错误写法

```html
<!-- ❌ 缺 role/aria、div 触发、无焦点管理 -->
<div class="overlay" id="m" style="display:none">
  <div class="box"><h2>标题</h2></div>
</div>
<div onclick="document.getElementById('m').style.display='block'">打开</div>
```

## 正确写法

```html
<gd-modal class="gd-modal-overlay" id="myModal" role="dialog" aria-modal="true" aria-labelledby="myTitle" aria-hidden="true" data-close-on-backdrop>
  <div class="gd-modal">
    <h2 class="gd-modal__title" id="myTitle">确认操作</h2>
    <p class="gd-modal__body">此操作无法撤销。</p>
    <div class="gd-modal__actions">
      <button type="button" class="gd-button gd-button--primary" data-gd-close data-gd-autofocus>确认</button>
      <button type="button" class="gd-button gd-button--secondary" data-gd-close>取消</button>
    </div>
  </div>
</gd-modal>

<button type="button" class="gd-button gd-button--primary" id="openBtn">打开弹窗</button>
```

```js
import { bindGdModal } from "./modal/gd-modal.js";
bindGdModal("#myModal", "#openBtn");
```

## 内置能力

- **Esc** 关闭
- **焦点锁定**：Tab 循环在弹窗内（trapFocus）
- **背景 inert**：打开时背景不可交互、读屏不可达
- **焦点返回**：关闭后焦点回到触发按钮
- **遮罩点击**：加 `data-close-on-backdrop` 属性
- **倒计时**：`startGdRedirectCountdown("#overlay", 3)`

## 变体

| 场景 | class |
|---|---|
| 普通弹窗 | `gd-modal` |
| 纳普彩蛋 | `gd-modal gd-modal--nap` |
| 发布卡片 | `gd-publish-card` |
| 跳转倒计时 | `gd-redirect-ring/text/countdown` |
