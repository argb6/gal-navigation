# gd-hero 轮播使用示例

## 错误写法

```html
<!-- ❌ 自造轮播、图片直接堆叠、无圆点/箭头 -->
<div class="carousel">
  <img src="a.jpg"><img src="b.jpg"><img src="c.jpg">
</div>
```

## 正确写法

```html
<div class="gd-hero" id="demoHero" aria-roledescription="carousel">
  <div class="gd-hero__track">
    <div class="gd-hero__slide is-active" style="background-image:url('a.jpg')"></div>
    <div class="gd-hero__slide" style="background-image:url('b.jpg')"></div>
    <div class="gd-hero__slide" style="background-image:url('c.jpg')"></div>
    <div class="gd-hero__gradient"></div>

    <button type="button" class="gd-hero__arrow gd-hero__arrow--prev" aria-label="上一张">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <button type="button" class="gd-hero__arrow gd-hero__arrow--next" aria-label="下一张">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </button>

    <div class="gd-hero__dots">
      <button type="button" class="gd-hero__dot is-active" aria-label="第 1 张"></button>
      <button type="button" class="gd-hero__dot" aria-label="第 2 张"></button>
      <button type="button" class="gd-hero__dot" aria-label="第 3 张"></button>
    </div>
  </div>
</div>
```

```js
import { initGdHero } from "./hero-carousel/gd-hero-carousel.js";
initGdHero("#demoHero");
```

## 内置能力

- **自动播放**：4.5s 切换（`arm()`）
- **手动控制**：箭头 / 圆点点击，重置计时
- **无障碍**：箭头/圆点均有 `aria-label`，激活圆点带 `aria-current="true"`
- **渐变遮罩**：`.gd-hero__gradient` 覆盖底层内容

## 预览占位

组件库总览页用渐变占位，不需真实图片：

```html
<div class="gd-hero__slide is-active gd-hero__slide--demo-1"></div>
```

（`--demo-1/2/3` 为内置渐变，见 `gd-hero-carousel.css`）

## 要点

- 首张 slide 必须有 `is-active`
- 图片用 `background-image`，不要放 `<img>`（保持图层结构）
- 圆点数量必须与 slide 一致

## 加载骨架

轮播区块不要整段 `hidden`。进页先露出骨架，图好了再撤：

```html
<section class="gd-section" aria-label="轮播图">
  <div class="gd-hero is-loading" id="heroCarousel">
    <div class="gd-skeleton gd-skeleton--hero" id="heroSkeleton" aria-hidden="true"></div>
    <!-- track / arrows / dots -->
  </div>
</section>
```

加载完成后：去掉 `#heroSkeleton`，并 `carousel.classList.remove('is-loading')`。`.is-loading` 会藏起箭头、圆点和渐变。
