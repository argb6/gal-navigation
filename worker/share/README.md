# worker/share

对照用的 `robots.txt`、`sitemap.xml`。现网由 **index Worker**（`worker/new/index.js`）直接返回，不是 Wrangler Asset 规则。

改 SEO 文件时：先改 `index.js` 里的 `robotsTxt` / `sitemapXml`，再把同样内容抄到本目录，避免两份对不上。

本目录不会被单独部署。
