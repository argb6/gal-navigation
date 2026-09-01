# gd-groundback 使用示例

页面级固定背景，放在内容之前，`aria-hidden="true"`。

## 正确写法

```html
<body>
  <div class="gd-groundback gd-groundback--websearch" aria-hidden="true"></div>
  <main>…</main>
</body>
```

## 变体怎么用

| class | 页面 |
|---|---|
| `gd-groundback--websearch` | 主站、详情、关于、帮助、友链、捐献、状态、发布页、错误页 |
| `gd-groundback--gold` | 仅圣器殿堂（金晕 + 同款线条） |
| `gd-groundback--blue` | 点阵底（预览对比用） |
| `gd-groundback--bleed` | 需要铺满视口时再加；预览盒内不要加 |

线条层：`filter: blur(10.8px)` + `mix-blend-mode: screen`（装饰层，不是卡片 `backdrop-filter`）。

## 不要盖住

- `html` 可以留底色作回退；**`body` 必须透明**（或不要铺不透明渐变）
- 背景层建议 `z-index: 0`，正文 `z-index: 1`（`z-index: -1` 容易画到 body 底色后面）
