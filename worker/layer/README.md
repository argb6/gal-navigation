# worker/layer

从单文件 Worker 抽出来的对照实现（api / database / service / render / security / utils）。

**`worker/*.js` 入口没有 import 本目录。** 现网也是单文件。改页面改 `worker/<页>.js`；这里只给人对照 SQL/KV 名称。
