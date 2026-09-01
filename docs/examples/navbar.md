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
        <img class="gd-navbar__logo-img" src="https://assets.galnavi.top/logo.png" alt="GALNAVI">
        <span class="gd-navbar__logo-text">GALNAVI</span>
      </a>
      <div class="gd-navbar__links" data-gd-nav-links>
        <button type="button" class="gd-navbar__link is-active" data-nav-cat="home">首页<span class="gd-badge gd-navbar__count" data-gd-nav-count>0</span></button>
        <button type="button" class="gd-navbar__link" data-nav-cat="site">站点<span class="gd-badge gd-navbar__count" data-gd-nav-count>0</span></button>
      </div>
      <gd-search class="gd-navbar__search" id="navSearch" expandable help placeholder="你要搜什么呢"></gd-search>
      <div class="gd-navbar__right">
        <span class="gd-tooltip-wrap">
          <button type="button" class="gd-navbar__nsfw" data-gd-nsfw aria-pressed="false" aria-label="NSFW 内容已隐藏">
            <span class="gd-navbar__nsfw-face" data-gd-nsfw-face>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <span class="gd-navbar__nsfw-msg" data-gd-nsfw-msg hidden>开</span>
          </button>
          <span class="gd-tooltip" data-gd-nsfw-tip role="tooltip" aria-hidden="true">NSFW 内容已隐藏</span>
        </span>
      </div>
      <button type="button" class="gd-navbar__hamburger" data-gd-nav-toggle aria-expanded="false" aria-controls="drawer" aria-label="菜单">
        <svg class="gd-navbar__icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        <svg class="gd-navbar__icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
  </header>
</gd-navbar>
<aside class="gd-navbar-drawer" id="drawer" aria-label="侧栏">
  <!-- 频道链接 -->
  <div class="gd-navbar-drawer__footer">
    <button type="button" class="gd-button gd-button--pill gd-button--nsfw gd-navbar-drawer__nsfw" data-gd-nsfw aria-pressed="false" aria-label="NSFW 内容已隐藏">
      <span class="gd-button__nsfw-face" data-gd-nsfw-face>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        NSFW
      </span>
      <span class="gd-button__nsfw-msg" data-gd-nsfw-msg hidden>已开启</span>
    </button>
  </div>
</aside>
```

## 行为函数

```js
import { initGdNavLinks, initGdNavCounts, initGdCatNav, initGdNsfwToggle } from "./navbar/gd-navbar.js";

// 频道点击切换选中态
initGdNavLinks("[data-gd-nav-links]");

// 分类计数：items 为 [{ cat: "site" }, ...]，home 显示总数
initGdNavCounts("[data-gd-nav-links]", { items });

// 圣器殿堂分类 tab 切换
initGdCatNav("[data-gd-cat-nav]");

// 桌面盾牌 + 抽屉 NSFW（红底隐藏 / 绿底显示；点击先闪开/关）
initGdNsfwToggle(document);
```

## 要点

- 汉堡按钮必须 `data-gd-nav-toggle` + `aria-controls` 指向抽屉 id
- 抽屉链接点击自动关闭抽屉（gd-navbar.js 内置）
- 徽章用 `gd-badge gd-navbar__count`（复用通用徽标，勿另写样式）
- 桌面 NSFW：`.gd-navbar__right` 内 `gd-tooltip-wrap` + `data-gd-nsfw`；悬停出提示，鼠标离开即藏
- 搜索框可加 `help`：右侧问号悬停显示搜索规则
- 桌面顶栏：Logo / 频道 / 搜索 / 盾牌紧挨，整组水平居中（左右到屏幕边距相等）
- 抽屉底部：`gd-button gd-button--pill gd-button--nsfw gd-navbar-drawer__nsfw`；关=红、开=绿；点一下闪「已开启」，再点闪「已关闭」，随后回到盾牌+NSFW
- 桌面盾牌同样红/绿实底；点一下闪「开」，再点闪「关」，随后回到盾牌
- 手机抽屉底部留 `56px + env(safe-area-inset-bottom)`，避免被浏览器底栏挡住
- 手机端顶栏 `__right` 隐藏，开关只出现在抽屉底部
- 手机端：抽屉 absolute 预览用 `.gd-navbar-stage--mobile` 容器
