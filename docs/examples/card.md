# gd-card 使用示例

## 错误写法

```html
<!-- ❌ 自造 class、硬编码颜色、div 当按钮 -->
<div class="card" onclick="go()" style="background:#111">
  <div class="card-title">标题</div>
  <div class="btn" onclick="go()">详情</div>
</div>
```

## 正确写法

```html
<article class="gd-card">
  <div class="gd-card__header">
    <div class="gd-card__icon" aria-hidden="true">霊</div>
    <div class="gd-card__title-wrap">
      <div class="gd-card__title">灵梦御所</div>
      <div class="gd-card__subtitle">绅士的幻想乡</div>
    </div>
  </div>
  <div class="gd-card__tags">
    <span class="gd-tag">ACG论坛</span>
    <span class="gd-tag gd-tag--blue">galgame</span>
  </div>
  <div class="gd-card__actions">
    <button type="button" class="gd-card__btn gd-card__btn--detail">介绍详情</button>
    <button type="button" class="gd-card__btn gd-card__btn--link">链接直达</button>
  </div>
</article>
```

## 变体

| 场景 | class |
|---|---|
| 主站卡片 | `gd-card` |
| 友链整卡 | `gd-card gd-card--link gd-card--friend` |
| 条目卡（殿堂） | `gd-card gd-card--item`（+ `gd-card--item--demonic/immortal`；默认金色 divine） |

## 殿堂条目卡

列表行，不要主站卡的固定 `420×212`。组件库已写 `width: auto; height: auto`，Worker 内联副本必须带上，否则序号和按钮还在、游戏名会被挤没。

```html
<article class="gd-card gd-card--item">
  <div class="gd-card__item-main">
    <span class="gd-card__num">1</span>
    <div class="gd-card__item-body">
      <div class="gd-card__item-name">
        <span class="gd-card__name-main">《游戏名》</span>
      </div>
      <div class="gd-card__item-actions">
        <div class="gd-card__action-group gd-card__action-group--primary">
          <a class="gd-card__action gd-card__action--site" href="https://example.com">官网</a>
          <a class="gd-card__action gd-card__action--detail" href="https://example.com/info">详情</a>
        </div>
        <div class="gd-card__action-group gd-card__action-group--ext">
          <a class="gd-card__action gd-card__action--ext" href="https://example.com/a">外链1</a>
        </div>
      </div>
    </div>
  </div>
</article>
```

表面线条用 `::before` 的 `filter: blur(10.8px)`（与页面背景同款），**不是** `backdrop-filter`。
