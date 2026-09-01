# gd-search 使用示例

## 错误写法

```html
<!-- ❌ 自造输入框、无标签、div 触发 -->
<div class="search">
  <input class="input" placeholder="搜索">
  <div onclick="clear()">×</div>
</div>
```

## 正确写法（自定义元素）

```html
<!-- 顶栏搜索，带规则问号 -->
<gd-search class="gd-navbar__search" help placeholder="你要搜什么呢"></gd-search>

<!-- 页内搜索（toolbar 变体） -->
<gd-search id="pageSearch" variant="toolbar" placeholder="页内搜索…"></gd-search>

<!-- 圣器殿堂搜索框（group 变体） -->
<gd-search class="gd-search--group" placeholder="搜索游戏名（中文 / 日文）"></gd-search>
```

`gd-search` 自定义元素会自动生成内部结构（图标 + 输入框 + 清除按钮），并绑定行为（输入显示清除、清除后回焦）。顶栏搜索不要加 `expandable`（宽度保持 300px）。需要搜索规则问号时加 `help`（可选 `help-text`）。

## 手动结构（页面已有 HTML 时）

```html
<div class="gd-search">
  <div class="gd-search__box">
    <span class="gd-search__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
    </span>
    <input class="gd-search__input" type="search" placeholder="你要搜什么呢" aria-label="搜索">
    <button type="button" class="gd-search__clear" aria-label="清除">×</button>
    <span class="gd-search__help-wrap gd-tooltip-wrap">
      <button type="button" class="gd-search__help" aria-label="搜索规则" aria-describedby="searchHelpTip">?</button>
      <span class="gd-tooltip gd-search__help-tip" id="searchHelpTip" role="tooltip">ACG[空格]小说 包含ACG或小说的卡片
ACG[空格]+小说，同时包含ACG和小说的卡片
ACG[空格]-小说，包含ACG但不能有小说的卡片</span>
    </span>
  </div>
</div>
```

```js
import { initGdSearch } from "./search/gd-search.js";
initGdSearch(".gd-search");
```

## 变体

| 场景 | class / 属性 |
|---|---|
| 页内工具栏搜索 | `variant="toolbar"` |
| 圣器殿堂（金色） | `class="gd-search--group"` |
| 顶栏内嵌 | 外层包 `gd-navbar__search` |

## 要点

- 输入框必须有 `aria-label`（`gd-search` 元素默认"搜索"，可覆盖）
- 清除按钮必须 `aria-label="清除"`
- 规则问号必须 `aria-label="搜索规则"`，提示用 `role="tooltip"`
- 聚焦/输入自动展开（`is-expanded`），失焦且空值自动收起
