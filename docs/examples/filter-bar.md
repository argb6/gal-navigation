# gd-orb 使用示例

首页快捷入口是右下角扩展按钮，点开后两列展开。不要再用页面级 `.gd-filter-bar-wrap` 两框。

## 正确写法

```html
<div class="gd-orb" id="gdOrb">
  <div class="gd-orb__menu" id="gdOrbMenu" role="region" aria-label="快捷入口">
    <div class="gd-orb__col" role="group" aria-label="站内入口">
      <button type="button" class="gd-orb__item" data-gd-orb="tags">标签</button>
      <button type="button" class="gd-orb__item" data-gd-orb="tavern">酒馆</button>
      <a class="gd-orb__item" href="https://github.com/argb6/gal-navigation">仓库</a>
      <button type="button" class="gd-orb__item" data-gd-orb="popup">弹窗</button>
    </div>
    <div class="gd-orb__col" role="group" aria-label="站点页面">
      <a class="gd-orb__item" href="https://galnavi.top/nav/about/">关于</a>
      <a class="gd-orb__item" href="https://galnavi.top/nav/help/">帮助</a>
      <a class="gd-orb__item" href="https://galnavi.top/nav/friend/">友链</a>
      <a class="gd-orb__item" href="https://galnavi.top/nav/palace/">殿堂</a>
    </div>
  </div>
  <button type="button" class="gd-orb__toggle" aria-expanded="false" aria-controls="gdOrbMenu" aria-label="打开快捷入口">
    …
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

- 开关必须真实 `<button>`，触控目标 56px
- 菜单用 `role="region"`，不要 `role="menu"`
- `aria-expanded` + `aria-controls`；Esc 关闭并回焦开关
- 带 `data-gd-orb` 的项走 `onAction`；普通链接自行跳转
