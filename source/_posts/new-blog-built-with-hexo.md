---
title: New blog built with hexo
date: 2020-10-23 16:21:31
tags: [hexo, hexo-theme, hexo-config, 二级目录]
---
前几天看到腾讯云十周年活动，服务器价格比较划算，于是果断下单 <del>主要是为了连接智能未来</del>。并且申请了这个域名。
不得不提的是，现在腾讯云的备案流程相比三年前，有了很大的提升，基本一步到位，给博哥的小弟点赞。
当天弄完域名解析，配置完Nginx之后，第二天就忘记这回事了。直到今天想起来这还有台服务器<del>这钱不能白花</del>，于是有了这个博客的诞生。

## 为什么选择Hexo

如果没有花费大量精力的打算，自己撸一整套出来的话，使用一个成熟的博客框架无疑是一个明智的选择。
说到搭博客，如果放在前几年，第一反应应该是WordPress。
下面进行简单的对比。

| | WordPress | Hexo |
| ---- | ---- |---- |
| 类型 |  动态网站，有后台   | 静态网站  |
| 主题 | 非常多，甚至有工作室出品的付费高级主题 | 数量一般，文档质量普遍一般 |
| 文章管理 | 后台富文本，可以随时增改  | 预设模板，Markdown，增改后重新编译发布 |
| 评论  | 自建用户系统，灵活度高 | 依赖第三方评论系统，托管 |
| 搜索 | 成熟的全站搜索功能 | 因为是静态网站，搜索依赖前端匹配，资源越多性能越差。替代方案也是使用第三方搜索服务 |
| 成本 | 需要服务器 | 可以部署到GitHub Pages，免费 |

可以看出，如果想要功能完善的Blog，并且有服务器的话，WordPress或许是更好的选择。
那么为什么要选择Hexo呢？

因为杰哥以前用过。

## 搭建过程

### 安装

Hexo 的安装过程非常方便，按照[官方文档](https://hexo.io/docs/index.html)的指引，几分钟就看到了 Hellow World

```
npm install hexo-cli -g
hexo init blog
cd blog
npm install
hexo server
```

### 使用主题

Hexo 提供了两种使用主题的方式
1. npm dependencies
2. 将主题文件放入 `themes\` 下

然后修改配置文件 `_config.yml`中 `theme: your_theme`即可

作为切图仔，想也不想直接npm install了一个主题，在之后的配置中遇到了问题，又换到了第二种方式

### 配置

由于腾讯云只提供免费的根域名证书，二级域名(如：`hexo.yuanbo.online`)需要使用泛域名证书，贵的一批。于是所有项目都以子目录(`www.yuanbo.online/hexo`)的形式部署，导致在配置时遇到了问题。

官方文档对子目录配置的说明如下：

```
// _config.yml
# URL
## If your site is put in a subdirectory, set url as 'http://example.com/child' and root as '/child/'
url: https://yuanbo.online/hexo
root: /hexo/
permalink: :title/
permalink_defaults:
  root: hexo
```

配置之后，发现页面上很多超链接指向错误，没有添加子目录path，如：
- 预期: `localhost:4000/hexo/categories/`
- 实际: `localhost:4000/categories`

原因是在很多模板文件中，并没有使用`root`这个变量，需要手动进行修改。
但开始时使用`npm dependencies`方式引入主题导致了问题，在主题中的很多路径也是写死的，修改`node_modules`中的文件显然不是好的方案，于是换回了第二种主题引入方式。

修改模板中的路径，如：
```
<a href="/<%= post.path %>">
=>
<a href="<%= config.root%><%= post.path %>">
```

在顶层模板中为window注入全局变量
```
// head.ejs
<script>
 var __root = "<%= config.root %>"
</script>
```

修改部分js中的路径，如：
```
localSearch('/search.json');
=>
localSearch(window.__root ? __root + 'search.json' : '/search.json');
```

在一系列的替换之后，超链接指向都正常了。

### 部署

执行`hexo g`进行编译，然后Nginx配置反向代理即可