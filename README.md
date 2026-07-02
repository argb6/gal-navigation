<div align="center">
  <img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/assets/icon.png" width="200" height="200" alt="cover">

 # GALNAVI

  <p>
  <a href="https://galnavi.top" target="_blank"><img src="https://img.shields.io/badge/Web-galnavi.top-brightgreen?style=flat-square&logo=earth&logoColor=white" alt="Website"></a> <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/license-MIT-ef9421?style=flat-square&logo=mit&logoColor=white" alt="License: MIT"></a> <a href="https://discord.gg/2tJCM7wB" target="_blank"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord"></a>

    
  <a href="https://github.com/argb6/gal-navigation/graphs/contributors" target="_blank"><img src="https://img.shields.io/github/contributors/argb6/gal-navigation?style=flat-square&labelColor=black&color=blue&logo=github" alt="Contributors"></a> <a href="https://github.com/argb6/gal-navigation/issues" target="_blank"><img src="https://img.shields.io/github/issues/argb6/gal-navigation?&labelColor=black&style=flat-square&color=orange&logo=github" alt="Open Issues"></a> <a href="https://github.com/argb6/gal-navigation/stargazers"><img src="https://img.shields.io/github/stars/argb6/gal-navigation?color=ffcb47&labelColor=black&style=flat-square&logo=github&label=Stars" /></a>
   </p>
</div>

GalNavi 是一个专注于 ACG 圈的开源导航站。

不仅收录优质资源站点，更为每一个站点整理介绍、标签、论坛、GitHub、发布页、帮助文档等信息，让寻找资源不再依赖搜索引擎。

## 💡 为什么开发 GalNavi？

在寻找 Galgame 与 ACG 资源时，经常需要在不同的网站之间来回切换，查找站点介绍、社区入口、帮助文档或备用网址也需要花费不少时间。

GalNavi 希望将这些信息整理到一起。

除了收录网站，我们也会持续完善每个站点的介绍、标签、相关链接与社区信息，让获取资源和了解站点变得更加方便。

## 📑内容
<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/docs/%E5%85%A5%E5%8F%A3.png" alt="主站"></td></tr>
  <tr><td align="center"><em>入口页面</em></td></tr>
</table>

- 干净无广的页面，新增呼吸光和玻璃特效

<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/docs/%E4%B8%BB%E7%AB%99.png" alt="搜索"></td></tr>
  <tr><td align="center"><em>主站页面</em></td></tr>
</table>

- 新增站长推荐和最近更新，对新手玩家友好
- 简化内容使卡片更加美观，增加外部链接跳转页面，保证安全
- 轮播图呈现通知，美化界面

<table>
  <tr><td><img src="https://raw.githubusercontent.com/argb6/gal-navigation/main/docs/%E8%AF%A6%E6%83%85.png" alt="详情"></td></tr>
  <tr><td align="center"><em>详情页面</em></td></tr>
</table>

- 文字利落：点击“介绍详情”即可展开该站点的简介介绍。
- 亮点总结：提炼站点的核心优势，将资源，网盘类型，入站门槛一次性讲清楚。
- 官方矩阵导航：不仅提供主站链接，还整合了该站点的“帮助文档”、“GitHub 仓库”、“官方论坛”及“外部社群”，有效防止迷路。

## ⚙️框架
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

发现好用的工具或优质网站，欢迎提交 [Issue](https://github.com/argb6/gal-navigation/issues) 或提交到[我的邮箱](mailto:galnavifeedback@protonmail.com)

## ⚖️许可证

本项目采用 **[MIT LICENSE](https://github.com/argb6/gal-navigation/LICENSE)** 许可证开源。

## ©️版权声明

本仓库仅为导航性质，收录的所有工具、网站链接均指向第三方资源。各资源版权归原作者或平台所有。
