# gd-footer 使用示例

样式在 `src/foundation/layout/gd-footer.css`（纯 CSS），贴底由 `initGdStickyViewport` 处理。预览见 `src/preview/index.html` 的「页脚」区。

## 现网五项（各 worker 页统一）

主站首页 | 帮助文档 | 关于本站 | 友情链接 | 联系站长

| 文案 | 链接 |
|---|---|
| 主站首页 | `https://galnavi.top/nav/` |
| 帮助文档 | `https://galnavi.top/nav/help/` |
| 关于本站 | `https://galnavi.top/nav/about/` |
| 友情链接 | `https://galnavi.top/nav/about/#friend`（friend / donate 独立页已删，友链在 about 内） |
| 联系站长 | `https://galnavi.top/nav/about/#feedback`（开源仓不放公开邮箱） |

## 错误写法

```html
<!-- 无 nav 语义、分隔符被读屏念出、仍指向已删页 -->
<div class="footer">
  <a href="/nav/friend/">申请友链</a> | <a href="/status/">站点状态</a>
</div>
```

## 正确写法

```html
<footer class="gd-footer" role="contentinfo">
  <nav class="gd-footer__nav" aria-label="页脚导航">
    <a href="https://galnavi.top/nav/">主站首页</a>
    <span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/nav/help/">帮助文档</a>
    <span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/nav/about/">关于本站</a>
    <span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/nav/about/#friend">友情链接</a>
    <span class="gd-footer__sep" aria-hidden="true">|</span>
    <a href="https://galnavi.top/nav/about/#feedback">联系站长</a>
  </nav>
  <p class="gd-footer__copy">© 2026 GALNAVI · 愿每一次探索都有新的收获</p>
</footer>
```

## 要点

- 当前页可给对应链接加 `aria-current="page"`。
- 不再出现「申请友链」`/nav/friend/`、`/nav/donate/`、「站点状态」`/status/`。
- 本文件是开源脱敏版：联系站长指向关于页反馈区。