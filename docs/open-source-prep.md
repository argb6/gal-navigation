# 开源准备清单

> Phase 5 脱敏与清理参考。正式开源前逐项检查。

## 一、敏感信息（必须处理）

### 1.1 CF API Token（status.js 硬编码）

- **文件**：`worker/new/status.js`、`sandbox/status-sandbox/status.js`（约第 21 行）
- **内容**：页内 `const CF_API_TOKEN = "..."`（文档不抄写明文）
- **处理**：改为 Secret 绑定 `env.CF_API_TOKEN`；**立刻轮换**已出现在仓库/文档里的旧 token

### 1.2 Wrangler 账号缓存

- **路径**：`.wrangler/`（已 gitignore）
- **内容**：`shenguang2024@gmail.com`、Account ID、CF request metadata
- **处理**：确认 `.gitignore` 已包含 `.wrangler/`，不提交

### 1.3 D1/KV 命名空间 ID（wrangler/*.toml）

所有 `*.toml` 中的 `database_id` 和 `id` 字段：

| 文件 | 绑定 | ID |
|------|------|-----|
| websearch.toml | D1 `nav` | `4475fc14-3362-4b13-8c66-1c9163f280d2` |
| websearch.toml | HERO_KV | `5077ecc80da34f759df90703ce7ea41d` |
| websearch.toml | FEATURED_KV | `30ec6630ac3f4501838386e1244e3b39` |
| status.toml | STATUS_KV | `0bd112904a4a4105bf454f33e530c631` |
| donate.toml | DONATE_KV | `93deddcc283b41e7962bf60929fb269` |
| detail.toml | D1 `nav` | 同上 |
| about.toml | D1 `nav` | 同上 |
| d1-rest.toml | D1 `nav` | 同上 |
| shenmo.toml | D1 `group1` | `fbf5b2ca-8a74-464b-ab41-0d990c43b64e` |
| palace.toml | D1 `group1` | 同上 |
| error.toml | STATUS_KV | 同上 |

**处理**：创建 `wrangler/*.example.toml`，用 `YOUR_D1_ID` / `YOUR_KV_ID` 占位符；原 toml 加入 `.gitignore` 或不提交。

### 1.4 邮箱地址

| 邮箱 | 出现位置 | 处理 |
|------|----------|------|
| `galnavifeedback@protonmail.com` | 多个 Worker 页脚 | 替换为 `feedback@galnavi.top` 或占位 |
| `feedback@galnavi.top` | 多个 Worker 页脚 | 可保留（站点域名邮箱） |
| `admin@galnavi.top` | friend.js | 可保留或替换 |

## 二、可删除文件/目录

### 高优先级（明确冗余）

| 路径 | 原因 |
|------|------|
| `backup/` | 9 个旧版原始文件，已被 `worker/new/` 替代 |
| `temp/` | 95 个一次性调试脚本 |
| `sandbox/about-freeze/` | 冻结存档，已被 `worker/new/about.js` 替代 |
| `sandbox/detail-freeze/` | 冻结存档 |
| `sandbox/friend-freeze/` | 冻结存档 |
| `sandbox/index-freeze/` | 冻结存档 |
| `sandbox/palace-freeze/` | 冻结存档 |
| `sandbox/websearch-sandbox/` | 已冻结不再修改 |
| `wrangler/shenmo.toml` | 已废弃，被 `palace.toml` 替代 |
| `worker/galnavi.js` | 已改名为 `index.js` |
| `worker/shenmo.js` | 已改名为 `palace.js` |

### 中优先级（需确认）

| 路径 | 原因 |
|------|------|
| `worker/about.js` | 旧版，`worker/new/about.js` 已就绪 |
| `worker/detail.js` | 旧版 |
| `worker/donate.js` | 旧版 |
| `worker/moho.js` | 待确认是否保留 |
| `worker/d1-rest.js` | 待确认是否保留 |
| `worker/help.js` | wrangler/help.toml 指向此文件但文件不存在（应指向 worker/new/help.js） |
| `kb/` | 空目录 |
| `source/` | `worker/new` 脱敏 JS 副本（无 status；已去掉 API / D1 / KV / SEO / Cookie） |
| `.opencode` | 已弃用的配置（项目用 .kilo） |
| `.github` | 断裂的符号链接 |

### 低优先级

| 路径 | 原因 |
|------|------|
| `worker-component-report.md` | Phase 1 交付物，可移入 `docs/` |
| `gd-architecture.md` | 可移入 `docs/` |
| `galnavi升级计划.md` | Phase 5 后可移入 `docs/` |

## 三、配置文件修复

| 问题 | 修复 |
|------|------|
| `wrangler/help.toml` 指向不存在的 `worker/help.js` | 改为 `../worker/new/help.js` |
| `wrangler/galnavi.toml` 指向旧 `worker/galnavi.js` | 改为 `../worker/new/index.js` |
| `wrangler/about.toml` 指向旧 `worker/about.js` | 改为 `../worker/new/about.js` |
| `wrangler/detail.toml` 指向旧 `worker/detail.js` | 改为 `../worker/new/detail.js` |
| `wrangler/donate.toml` 指向旧 `worker/donate.js` | 改为 `../worker/new/donate.js` |
| `wrangler/status.toml` 缺少 `NOTICE_KV` 绑定 | 添加 NOTICE_KV 命名空间配置 |
| 缺少 `wrangler/friend.toml` | 新建，指向 `worker/new/friend.js`，绑定 DB=`nav` |

## 四、.gitignore 补充

```gitignore
# 已有
.wrangler/
.dev.vars
.env
.env.*
node_modules/
dist/
*.log
.DS_Store

# 建议新增
wrangler/.wrangler/
tool/node_modules/
wrangler/*.toml
!wrangler/*.example.toml
```

## 五、开源文件清单

正式开源时应保留的文件：

```
├── .kilo/                  AI Agent 配置
├── .gitignore
├── AGENTS.md               AI Agent 指南
├── README.md               项目说明
├── LICENSE                  开源协议（新建）
├── package.json
├── esbuild.config.js
├── src/                    gd 组件库
├── source/                 worker/new 脱敏副本（无 status）
├── worker/new/             部署版 Worker
├── worker/shared/          参考模块（现网页不 import）
├── worker/share/           静态资源
├── wrangler/*.example.toml 部署配置模板
├── wrangler/README.md
├── wrangler/scripts/
├── docs/                   组件库文档
├── md/                     站点内容
├── sandbox/                活跃沙盒（移除 freeze 后）
└── tool/                   ESLint
```
