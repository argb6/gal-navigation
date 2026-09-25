# gd-orb 使用示例

主页右下角扩展按钮：点开后单列展开快捷入口。圆钮可拖动。

## 正确写法

```html
<div class="gd-orb" id="gdOrb">
  <div class="gd-orb__menu" id="gdOrbMenu" role="region" aria-label="快捷入口">
            <button type="button" class="gd-orb__item" data-gd-orb="tags">🏷️ 标签</button>
            <button type="button" class="gd-orb__item" data-gd-orb="popup">💬 弹窗</button>
            <a class="gd-orb__item" href="https://github.com/argb6/gal-navigation" target="_blank" rel="noopener noreferrer">📦 仓库</a>
            <a class="gd-orb__item" href="https://galnavi.top/nav/palace/" target="_blank" rel="noopener noreferrer">🏛️ 殿堂</a>
          </div>
  <button type="button" class="gd-orb__toggle" aria-expanded="false" aria-controls="gdOrbMenu" aria-label="打开快捷入口">
    ⊕
  </button>
</div>
```

```js
import { initGdOrb } from "./gd-orb.js";
initGdOrb("#gdOrb", {
  onAction: (act) => {
    if (act === "tags") navigateTo("tags");
    if (act === "popup") openWelcome();
  }
});
```

## 要点

- 圆钮必须用真 `<button>`，触控目标约 56px
- 菜单用 `role="region"`，不要 `role="menu"`
- `aria-expanded` + `aria-controls`；Esc 关闭并回焦点
- 有 `data-gd-orb` 的项走 `onAction`；普通链接直接跳转
- 保留项：标签、仓库、弹窗、殿堂（不要酒馆 / 关于 / 帮助 / 友链）。收起图标为五角星，菜单单列
- 圆钮可在视口内拖动；短按仍开关菜单。位置写入 `localStorage` 键 `galnavi-orb-pos`。靠近上沿或左沿时菜单翻面
- `.gd-orb--demo` 只做预览，不启用拖动