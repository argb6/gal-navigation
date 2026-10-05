# gd-empty-state 使用示例

列表或搜索没有条目时使用。标题用 `h3`，说明用一段文字。图标不是必填。

## 正确写法

```html
<div class="gd-empty-state" role="status">
  <h3 class="gd-empty-state__title">暂无结果</h3>
  <p class="gd-empty-state__desc">这个分类暂时没有内容。</p>
</div>
```

搜索无结果时，说明改为「换个关键词试试，或清空筛选条件。」

需要下一步操作时，再加 `gd-empty-state__actions`，里面放真实按钮。

## 不要

- 不要只放一枚放大镜图标和一句「没有找到相关内容」
- 不要用 `div` 冒充标题
