# gd-card 使用示例

## 错误写法

```html
<!-- ❌ 自造 class、硬编码颜色、div 当按钮 -->
<div class="card" onclick="go()" style="background:#111">
  <div class="card-title">标题</div>
  <div class="btn" onclick="go()">详情</div>
</div>
```

## 正确写法（主站导航卡）

卡面只保留图标、标题、简介；**不要**在卡面放 `gd-card__tags` / 底部双按钮。整卡可点（`role="button"` 或 `gd-card--link` + 事件委托），弹出 `gd-modal` 展示完整简介、标签与「介绍详情 / 链接直达；弹窗内标签全部显示、无数量上限」。禁止 `div onclick`。

```html
<article
  class="gd-card gd-card--general gd-card--link"
  role="button"
  tabindex="0"
  aria-haspopup="dialog"
  aria-controls="siteCardModal"
>
  <div class="gd-card__header">
    <div class="gd-card__icon" aria-hidden="true">霊</div>
    <div class="gd-card__title-wrap">
      <div class="gd-card__title">灵梦御所</div>
      <div class="gd-card__subtitle">绅士的幻想乡</div>
    </div>
  </div>
</article>

<!-- 弹窗内：简介 + 标签 + 操作（Esc / 遮罩 / data-gd-close） -->
<gd-modal
  class="gd-modal-overlay"
  id="siteCardModal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="siteCardModalTitle"
  aria-hidden="true"
  data-close-on-backdrop
>
  <div class="gd-modal gd-modal--site-card">
    <button type="button" class="gd-modal__close" data-gd-close aria-label="关闭">…</button>
    <div class="gd-modal--site-card__head">
      <div class="gd-card__icon" aria-hidden="true">霊</div>
      <h2 class="gd-modal__title" id="siteCardModalTitle">灵梦御所</h2>
    </div>
    <p class="gd-modal__body">完整站点简介……</p>
    <div class="gd-card__tags gd-modal--site-card__tags">
      <span class="gd-tag">ACG论坛</span>
      <span class="gd-tag gd-tag--blue">galgame</span>
    </div>
    <div class="gd-modal__actions gd-modal__actions--row">
      <a class="gd-card__btn gd-card__btn--detail" href="/nav/detail/?item_key=…">介绍详情</a>
      <a class="gd-card__btn gd-card__btn--link" href="https://example.com">链接直达</a>
    </div>
  </div>
</gd-modal>
```

用 `openGdModal` / `bindGdModal`（或等价开关）打开；键盘 Enter/Space 与 click 一致；关闭后焦点回到触发卡片。

## 变体

| 场景 | class |
|---|---|
| 主站卡片 | `gd-card gd-card--general`（可点加 `gd-card--link`）；多列宽 390px、高 100px；仅一列（≤919）宽 100%；基类 min(390px,100%) |
| 友链整卡 | `gd-card gd-card--link gd-card--friend` |
| 条目卡（殿堂） | `gd-card gd-card--item`（+ `gd-card--item--demonic/immortal`；默认金色 divine） |

## 殿堂条目卡

列表行，主站卡多列 `width: 390px; height: 100px`（`.gd-card--general`；仅一列时宽 100%）；条目卡仍须显式。组件库已写 `width: auto; height 按 title/sub 字号行盒计算固定`，Worker 内联副本必须带上，否则序号和按钮还在、游戏名会被挤没。

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
