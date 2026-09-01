<div align="center">
  <img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/assets/logo/icon.png" width="200" height="200" alt="cover">

# GALNAVI

<p>
  <a href="https://galnavi.top" target="_blank"><img src="https://img.shields.io/badge/Web-galnavi.top-brightgreen?style=flat-square&logo=earth&logoColor=white" alt="Website"></a> <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/license-MIT-ef9421?style=flat-square&logo=mit&logoColor=white" alt="License: MIT"></a> <a href="https://github.com/argb6/gal-navigation/issues" target="_blank"><img src="https://img.shields.io/github/issues/argb6/gal-navigation?&labelColor=black&style=flat-square&color=orange&logo=github" alt="Open Issues"></a> <a href="https://github.com/argb6/gal-navigation/stargazers"><img src="https://img.shields.io/github/stars/argb6/gal-navigation?color=ffcb47&labelColor=black&style=flat-square&logo=github&label=Stars" /></a>
</p>
</div>

## 项目介绍

GALNAVI 是面向 ACG 的导航与信息聚合站（[galnavi.top](https://galnavi.top)）。把分散的站点、工具、会社等信息做成分类、标签、搜索和详情，方便查找。

每个页面一份 Cloudflare Worker，HTML / CSS / JS 打在同一个文件里。界面是自研 **gd**（GalNavi Design）：深色玻璃拟态，语义对齐 Material Design 3，不换皮。

本仓库是**开源源码**。线上部署用的 wrangler / 密钥不在这里。`worker/status.js` 仍是 β，其它页面与现网实现对齐。

## 页面截屏

<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/assets/websearch.png" alt="main"></td></tr>
  <tr><td align="center"><em>主站</em></td></tr>
</table>

<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/assets/detail.png" alt="detail"></td></tr>
  <tr><td align="center"><em>详情</em></td></tr>
</table>

<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/assets/help.png" alt="help"></td></tr>
  <tr><td align="center"><em>帮助</em></td></tr>
</table>

## 核心功能

### 导航搜索

整理 ACG 相关站点，按分类与标签管理，支持按名称、标签、描述检索。

### 站点详情

独立详情页，展示亮点、官网、社区等信息。

## 技术架构

页面 Worker **零 `import`**，查 D1/KV、拼 HTML、安全头都在 `worker/<页>.js` 里。

- **gd**：组件、token、预览（`src/`）
- **Worker**：`worker/*.js` 单文件页面；`worker/shared/` 给人对照
- **layer**：`worker/layer/` 是抽出来的对照实现，**入口还没 import**，不是现网跑法
- **数据**：D1（导航 / 友链 / 殿堂）+ KV + R2（`assets.galnavi.top`）

更细的目录说明见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## GALNAVI Design

**gd** 统一视觉和交互：

- **Foundation**：Token、布局、品牌
- **Navigation**：顶栏、搜索
- **Display**：卡片、标签、徽章等
- **Feedback**：弹窗、Toast、Tooltip
- **Extend**：单页扩展（主站 orb、详情、捐献、首页发布卡等）
- **Runtime**：只注册 `gd-modal` / `gd-navbar` / `gd-search`
- **Preview**：`src/preview/index.html`

## 技术栈

| 类型 | 技术 |
| - | - |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 |
| Storage | Cloudflare KV、R2 |
| UI | gd |
| Frontend | HTML / CSS / JavaScript |

## License

见 [LICENSE](LICENSE)。贡献约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。
