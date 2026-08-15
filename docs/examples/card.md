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
| 条目卡（殿堂） | `gd-card gd-card--item`（+ `gd-card--item--divine/demonic/immortal`） |
