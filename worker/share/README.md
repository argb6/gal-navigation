# worker/share

对照用的 `robots.txt`、`sitemap.xml`。现网由 **index Worker**（`worker/index.js`）直接返回，不是单独部署的静态资源。

改 SEO 文件时：先改 `index.js` 里的 `robotsTxt` / `sitemapXml`，再抄到本目录。

不要和 `worker/shared/`（JS 对照模块）搞混。
