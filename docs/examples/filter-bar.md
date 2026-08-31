# gd-filter-bar 使用示例

首页用**两次**组件，外包一层 `.gd-filter-bar-wrap`。

## 正确写法

```html
<div class="gd-filter-bar-wrap" id="homeFilter">
  <div class="gd-filter-bar gd-filter-bar--start" role="toolbar" aria-label="站内入口">
    <button type="button" class="gd-filter-bar__tag gd-filter-bar__tag--tag">标签</button>
    <button type="button" class="gd-filter-bar__tag gd-filter-bar__tag--tavern">酒馆</button>
    <a class="gd-filter-bar__tag" href="https://github.com/argb6/gal-navigation">仓库</a>
    <button type="button" class="gd-filter-bar__tag gd-filter-bar__tag--popup" aria-haspopup="dialog" aria-controls="welcomeModal">弹窗</button>
  </div>
  <div class="gd-filter-bar gd-filter-bar--end" role="toolbar" aria-label="站点页面">
    <a class="gd-filter-bar__tag" href="https://galnavi.top/nav/about/">关于</a>
    <a class="gd-filter-bar__tag" href="https://galnavi.top/nav/help/">帮助</a>
    <a class="gd-filter-bar__tag gd-filter-bar__tag--friend" href="https://galnavi.top/nav/friend/">友链</a>
    <a class="gd-filter-bar__tag gd-filter-bar__tag--relic" href="https://galnavi.top/nav/palace/">殿堂</a>
  </div>
</div>
```

## 布局

| 宽度 | 两框 | 按钮 |
|---|---|---|
| &lt; 769px | 上下叠 | 都靠左 |
| ≥ 769px | 左右分、各占一半 | `--start` 靠左，`--end` 靠右 |

胶囊固定 75×40。必须真实 `<button>` 或 `<a href>`。
