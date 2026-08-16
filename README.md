<div align="center">
  <img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/assets/logo/icon.png" width="200" height="200" alt="cover">

GALNAVI

<p>
  <a href="https://galnavi.top" target="\_blank"><img src="https://img.shields.io/badge/Web-galnavi.top-brightgreen?style=flat-square\&logo=earth\&logoColor=white" alt="Website"></a> <a href="https://opensource.org/licenses/MIT" target="\_blank"><img src="https://img.shields.io/badge/license-MIT-ef9421?style=flat-square\&logo=mit\&logoColor=white" alt="License: MIT"></a> <a href="https://github.com/argb6/gal-navigation/issues" target="\_blank"><img src="https://img.shields.io/github/issues/argb6/gal-navigation?\&labelColor=black\&style=flat-square\&color=orange\&logo=github" alt="Open Issues"></a> <a href="https://github.com/argb6/gal-navigation/stargazers"><img src="https://img.shields.io/github/stars/argb6/gal-navigation?color=ffcb47\&labelColor=black\&style=flat-square\&logo=github\&label=Stars" /></a>

</p>
</div>





## 项目介绍

GALNAVI 是一个面向 ACG 领域的导航与信息聚合平台，致力于整理分散在网络中的相关站点、工具与会社信息。

项目通过分类、标签、搜索和站点详情等功能，将不同类型的信息进行结构化整理，为用户提供一个统一、清晰的导航入口。



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

### 🔍 导航搜索

整理 ACG 相关站点，并通过分类与标签进行结构化管理。提供统一搜索入口，支持对站点名称、标签和描述等信息进行检索。

### 📄 站点详情

提供独立的站点详情页面，集中展示网站亮点、官网、社区及论坛等信息。



## 技术架构

GALNAVI 基于 Cloudflare Workers 构建，采用分层架构与 GD Design System（自制组件）。

- **GD**：统一组件、样式与交互

- **Worker**：页面、路由与服务端逻辑

- **API**：搜索、站点、状态等接口

- **Service**：业务逻辑、缓存与 SEO

- **Data**：D1 / KV 数据访问

- **Security**：CORS、CSP、验证与转义

## GALNAVI Design

**GALNAVI Design（GD）** 是 GALNAVI 自研的前端组件与设计系统，用于统一网站的视觉、交互与开发规范。

主要包含：

- **Foundation**：设计 Token、布局、品牌与基础样式
- **Navigation**：导航栏、搜索
- **Display**：卡片、标签、徽章等展示组件
- **Feedback**：弹窗、Toast、Tooltip 等反馈组件
- **Extend**：各页面专用扩展
- **Runtime**：组件运行时注册
- **Preview**：组件预览与开发测试

GD 以 **可复用、统一、轻量化** 为核心，服务于 GALNAVI 的长期迭代。

## 技术栈

| 类型 | 技术 |
| - | - |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 |
| Storage | Cloudflare KV |
| UI | GD Design System |
| Frontend | HTML / CSS / JavaScript |
| Build | Node.js / esbuild |
| Development | Wrangler / Sandbox |

## 项目框架
详见[ARCHITECTURE.md](ARCHITECTURE.md)
## License
详见[LICENSE](LICENSE)
