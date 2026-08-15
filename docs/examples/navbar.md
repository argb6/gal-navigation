# gd-navbar 使用示例

## 错误写法

```html
<!-- ❌ 自造类、div 触发抽屉、无 aria -->
<div class="topbar">
  <div class="link active">首页</div>
  <div class="hamburger" onclick="open()">☰</div>
</div>
```

## 正确写法

```html
<gd-navbar>
  <header class="gd-navbar" data-gd-navbar>
    <div class="gd-navbar__inner">
      <a class="gd-navbar__logo" href="/">
        <img class="gd-navbar__logo-img" src="logo.webp" alt="GALNAVI">
        <span class="gd-navbar__logo-text">GALNAVI</span>
      </a>
      <div class="gd-navbar__links" data-gd-nav-links>
        <button type="button" class="gd-navbar__link is-active" data-nav-cat="home">首页<span class="gd-badge gd-navbar__count" data-gd-nav-count>0</span></button>
        <button type="button" class="gd-navbar__link" data-nav-cat="site">站点<span class="gd-badge gd-navbar__count" data-gd-nav-count>0</span></button>
      </div>
      <gd-search class="gd-navbar__search" id="navSearch" expandable placeholder="你要搜什么呢"></gd-search>
      <button type="button" class="gd-navbar__hamburger" data-gd-nav-toggle aria-expanded="false" aria-controls="drawer" aria-label="菜单">
        <svg class="gd-navbar__icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg class="gd-navbar__icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
  </header>
</gd-navbar>
<aside class="gd-navbar-drawer" id="drawer" aria-label="侧栏">
  <!-- 抽屉内容：频道链接（data-gd-nav-links）+ 关于区 -->
</aside>
```

## 行为函数

```js
import { initGdNavLinks, initGdNavCounts, initGdCatNav } from "./navbar/gd-navbar.js";

// 频道点击切换选中态
initGdNavLinks("[data-gd-nav-links]");

// 分类计数：items 为 [{ cat: "site" }, ...]，home 显示总数
initGdNavCounts("[data-gd-nav-links]", { items });

// 圣器殿堂分类 tab 切换
initGdCatNav("[data-gd-cat-nav]");
```

## 要点

- 汉堡按钮必须 `data-gd-nav-toggle` + `aria-controls` 指向抽屉 id
- 抽屉链接点击自动关闭抽屉（gd-navbar.js 内置）
- 徽章用 `gd-badge gd-navbar__count`（复用通用徽标，勿另写样式）
- 手机端：抽屉 absolute 预览用 `.gd-navbar-stage--mobile` 容器
