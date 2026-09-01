# ADR-0005: 使用 Light DOM（不用 Shadow DOM）

## 状态

已采纳

## 日期

2026-08

## 背景

GD 组件库中的自定义元素（gd-modal / gd-navbar / gd-search）使用 Web Components。需要决定是否使用 Shadow DOM。

## 决策

使用 Light DOM，自定义元素只处理行为，样式由外部 CSS 控制。

## 原因

1. **Worker 兼容**：Worker 拼 HTML 时直接使用 `gd-*` class，无需模板编译
2. **样式统一**：外部 CSS 可直接控制组件内部样式，不需要 `::part` 或 CSS 变量穿透
3. **简单性**：不需要处理 Shadow DOM 的样式隔离、slot 分发等复杂问题
4. **已有 CSS 体系**：`tokens.css` + 组件 CSS 已经通过 `--gd-*` 变量实现了样式管理

## 实现

```css
/* 自定义元素不产生额外布局盒 */
gd-search { display: contents; }
gd-modal { display: contents; }
```

```js
// gd-search 只注入 HTML 和绑定事件，不创建 Shadow Root
class GdSearch extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `...`;  // Light DOM
    initGdSearch(this);
  }
}
```

## 影响

- 组件内部 class 必须用 `gd-` 前缀防冲突
- 避免使用过宽选择器（`.title`、`.active`）
- 外部 CSS 可以直接修改组件内部样式（有意为之）
- `display: contents` 使自定义元素不产生额外布局盒

## 替代方案

| 方案 | 否决原因 |
|------|----------|
| Shadow DOM | Worker 拼 HTML 无法直接使用，样式穿透复杂 |
| 纯 CSS 无 Web Component | 弹窗/导航需要 JS 行为 |
