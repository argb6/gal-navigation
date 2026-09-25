# 开源准备清单

> 按 **grokbot 拆分后**结构维护（2026-09-11）。正式开源 / 同步 `gal-navigation` 前逐项检查。

## 工作区对照

| 区 | 路径 | 开源时角色 |
|----|------|------------|
| 部署 | `grokbot/部署/` | docs、kb、wrangler（私有）、开源副本 `gal-navigation/`、接收区 `worker/new/` |
| 前端 | `grokbot/前端/` | `src/`、`sandbox/`、日常可部署源 `worker/new/` |
| 开源仓 | `部署/gal-navigation/` → GitHub `argb6/gal-navigation` | 脱敏后的公开源码 |

**禁止**把本区 `wrangler/*.toml` 真实 ID、`.wrangler/`、Secret 推进开源仓。

---

## 一、敏感信息（必须处理 · 红线仍有效）

### 1.1 CF API Token

- **风险位置**：现网 / 前端 `worker/new/status.js`、沙盒 status（若仍硬编码）
- **处理**：改为 Secret 绑定 `env.CF_API_TOKEN`；已出现在仓库/文档的旧 token **立刻轮换**
- 开源仓 `status.js` 保持 **β 占位**，不含现网密钥

### 1.2 Wrangler 账号缓存

- **路径**：`wrangler/.wrangler/`、任意 `.wrangler/`
- **处理**：gitignore；永不提交

### 1.3 D1 / KV 命名空间 ID

- 本区 `wrangler/*.toml` 含现网 `database_id` / KV `id`（私有部署用）
- **开源**：不提交真实 toml；若需模板，另建 `wrangler/*.example.toml`，用 `YOUR_D1_ID` / `YOUR_KV_ID` 占位
- 开源文档只写**绑定名**（`DB`、`HERO_KV`…），不写 UUID

### 1.4 邮箱

| 邮箱 | 处理 |
|------|------|
| 页脚站点域邮箱（如 `feedback@galnavi.top`） | 可保留 |
| 个人/第三方邮箱明文 | 替换为站点域或占位 |

---

## 二、拆分后：什么进开源仓

开源同步目标：`部署/gal-navigation/`（对应 GitHub）。

**应包含（脱敏后）**

```
gal-navigation/
├── AGENTS.md / README.md / LICENSE / CONTRIBUTING.md
├── src/                 # 从前端拷贝的 gd（无密钥）
├── worker/*.js          # 从可发布源抽出；零 import；不含现网 Secret
├── worker/shared/       # 对照源
├── worker/share/        # robots / sitemap 对照
├── worker/layer/        # 未接入分层对照（若有）
├── docs/                # 组件文档 / ADR / CHANGELOG（无真实 ID）
└── kb/                  # 工程知识库（绑定名可以；UUID/token 不行）
```

**不要进开源**

- `wrangler/*.toml`（真实 ID）、`.wrangler/`
- `部署/temp/`、前端 `sandbox/` 里的调试稿（除非单独脱敏且有必要）
- β 版现网 `status` 密钥与私有监控配置
- `backup/`、一次性 freeze 目录

**发布源口径**：现网部署仍用接收区 `部署/worker/new/`（经总指挥收前端交付）。开源 `worker/` 是另一份公开副本；改开源仓 ≠ 已上线。

---

## 三、已废弃（拆分前单体仓清单 · 勿再当待办）

下列针对旧「单仓含 backup/sandbox-freeze/根 worker 旧文件」的整改表，**在 grokbot 拆分后不再适用**，仅作历史说明：

- ~~删除 `backup/`、各 `sandbox/*-freeze/`、根目录旧 `worker/*.js`~~（路径不在部署区）
- ~~把 toml 从旧 `worker/help.js` 等改到 `worker/new`~~（**已完成**：现网 `wrangler/*.toml` 的 `main` 均已是 `../worker/new/<页>.js`，且已有 `friend.toml`）
- ~~在单体仓根目录拼一整份开源树~~（改为维护 `gal-navigation/` + 前端交付）

若在旧笔记里再看到上述待办，以本文第二节为准。

---

## 四、发布前检查表

- [ ] 无 API token / 账密 / `CF_API_TOKEN` 明文
- [ ] 无 `.wrangler/`、无真实 `database_id` / KV `id`
- [ ] `status.js` 为 β 占位
- [ ] 邮箱按 §1.4 处理
- [ ] docs/kb 不含 UUID（或已打码）
- [ ] 推送目标为 `gal-navigation` remote，不是误推私有 toml
- [ ] 总指挥已确认本批可开源

更细的断链与跨区路径见 [`失效断链清单.md`](./失效断链清单.md)。
