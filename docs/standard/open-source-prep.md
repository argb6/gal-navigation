# 开源仓注意

本仓库已经是公开源码。不要往这里提交：

- API token、账号密码、`CF_API_TOKEN` 明文
- Wrangler 登录缓存（`.wrangler/`）
- 现网 D1 / KV 的 UUID（本仓文档只用绑定名）

`worker/status.js` 是 β 占位（token 为占位符），不要把现网密钥拷进来。

页面源码在 `worker/*.js`。`worker/layer/` 未接入入口。
