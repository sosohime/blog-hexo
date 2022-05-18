---
title: build-chrome-extension-by-vite
date: 2022-05-12 14:43:25
tags: [chrome, extension, vite, vue, echarts, holiday]
---

## 背景
目前各平台主流使用的图表库有两个：Echarts、HighCharts。这两个图表库都有一个特点，如果将图表模块的引用暴露至 window（window.echrats），即可以直接通过 inject-script 获取页面所有图表的实例，并使用其API 直接对页面上已渲染的图表进行修改。

通过插件的形式提供图表的节假日显示、坐标轴缩放、用户标注、图表类型切换等功能。既可以使用户获得一致的交互体验，也可以降低各BI系统的开发成本，仅需将图表库暴露至 window 即可。

本文主要介绍插件开发环境的实现，具体插件功能实现将在后续文章展开。

## 脚手架功能

核心功能如下：
- 开发环境热更新：crx构建 + chrome重载（再也不用去扩展程序里面点刷新按钮了）
- 支持 conent-script 使用 es module
- 使用 chrome.storage 保存插件状态
- popup、content-script、inject-script、 background 间通信

## 流程图
![热更新流程图](/hexo/img/chrome-extension-vite-follow.png)

## 要点
### 环境隔离、通讯
popup (chrome插件按钮弹出的的交互部分)、content-script ( 运行在浏览器上的脚本 ) 、background（后台运行脚本）、页面js是相互隔离的，相互调用方法如下图
![Chrome插件脚本通讯](/hexo/img/chrome-extension-script.png)
### content-script 运行 es module
现代浏览器支持es-module必须使用<script type = "module" /> 来引入，而conent-script为纯脚本直接加载会报错，主文件为普通js，然后通过以下方式引用
```javascript
// content-script 无法使用 <script type="module">
// 如果使用es module需要使用这种方式来引入
(async () => {
  const src = chrome.runtime.getURL("content_script.js");
  const contentMain = await import(src);
})();
```

### 仓库地址
https://git.woa.com/acehe/holiday_charts_extension


## 参考文章
- [bilibili 弹幕控制台（WIP） Violet](https://github.com/yunsii/violet)
- [chrome 扩展开发 - chrome.storage 本地存储](http://www.ptbird.cn/chrome-extensions-storage.html)
- [Chrome插件(扩展)开发全攻略](https://www.bookstack.cn/books/chrome-plugin-develop)
- [How to import ES6 modules in content script for Chrome Extension](https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension)