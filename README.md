<div align="center">
  <img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/assets/icon.png" width="200" height="200" alt="cover">

 # GALNAVI

  <p>
  <a href="https://galnavi.top" target="_blank"><img src="https://img.shields.io/badge/Web-galnavi.top-brightgreen?style=flat-square&logo=earth&logoColor=white" alt="Website"></a> <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/license-MIT-ef9421?style=flat-square&logo=mit&logoColor=white" alt="License: MIT"></a> <a href="https://discord.gg/2tJCM7wB" target="_blank"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>

    
  <a href="https://github.com/argb6/gal-navigation/graphs/contributors" target="_blank"><img src="https://img.shields.io/github/contributors/argb6/gal-navigation?style=flat-square&labelColor=black&color=blue&logo=github" alt="Contributors"></a> <a href="https://github.com/argb6/gal-navigation/issues" target="_blank"><img src="https://img.shields.io/github/issues/argb6/gal-navigation?&labelColor=black&style=flat-square&color=orange&logo=github" alt="Open Issues"></a> <a href="https://github.com/argb6/gal-navigation/stargazers"><img src="https://img.shields.io/github/stars/argb6/gal-navigation?color=ffcb47&labelColor=black&style=flat-square&logo=github&label=Stars" /></a>
   </p>
</div>

在浩瀚的二次元网络世界中，寻找高质量的 ACG 往往需要穿梭于各个零散的论坛和独立小站之间。GALNAVI 致力于打破这种信息孤岛，通过精心设计的分类收录与直观的标签系统，为您提供一个现代、纯净、极速的聚合导航体验。

无论您是寻找最新汉化资源的玩家，还是需要模拟器与工具的技术达人，GALNAVI 都能帮您“秒速响应，一站直达”。



## 📑内容
<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/blob/main/docs/%E4%B8%BB%E9%A1%B5.png" alt="主站"></td></tr>
  <tr><td align="center"><em>主站页面</em></td></tr>
</table>

- 极致纯净：告别传统导航站满屏广告的杂乱感，提供极简的沉浸式暗黑主题 UI。

<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/blob/main/docs/%E6%90%9C%E7%B4%A2.png" alt="搜索"></td></tr>
  <tr><td align="center"><em>搜索页面</em></td></tr>
</table>

- 精准分类：将互联网上的 ACG 资源划分为“网站”、“工具”、“模拟器”等清晰板块。
- 卡片化呈现：每个收录站点均以独立卡片配合鼠标动态光效展示。
- 标签库：直观的 Tag 生态对站点进行二次分类，让站点的网盘类型、资源偏向和准入门槛一目了然。

<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/blob/main/docs/%E8%AF%A6%E6%83%85.png" alt="详情"></td></tr>
  <tr><td align="center"><em>详情页</em></td></tr>
</table>

- 文字利落：点击“介绍详情”即可展开该站点的简介介绍。
- 亮点总结：提炼站点的核心优势，将资源，网盘类型，入站门槛一次性讲清楚。
- 官方矩阵导航：不仅提供主站链接，还整合了该站点的“帮助文档”、“GitHub 仓库”、“官方论坛”及“外部社群”，有效防止迷路。

## 🌐框架
```html
[ 主 站 ] (入口) ───► [ 通知模块 ] ───────────(读取公告)─────────► 【 KV 命名空间 】
   ▲
   │
   │
   └───► [ 搜索页面 ] ───────────(调用信息)──────► 【 D1 数据库 】
           │      │                                     ▲
       [ 外部 ] [ 详情 ]                                |
           │      │                                     │
           │      ├───► [ 详情页 ] ───────(调用md)──────┘
           │
           ├───► [ 捐赠页面 ]
           │
           ├───► [ 帮助文档 ]
           │
           └───► [ GitHub 仓库 ]
``` 
## 📤分享

发现好用的工具或优质网站，欢迎提交 [Issue](https://github.com/argb6/gal-navigation/issues) 或提交到[我的邮箱](mailto:shenguang_2025@outlook.com)

## ⚖️许可证

本项目采用 **[MIT LICENSE](https://github.com/argb6/gal-navigation/LICENSE)** 许可证开源。

## ©️版权声明

本仓库仅为导航性质，收录的所有工具、网站链接均指向第三方资源。各资源版权归原作者或平台所有。
