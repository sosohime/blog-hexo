---
title: 使用Github Actions实现Hexo Blog自动发布
date: 2021-03-01 19:44:50
tags: [hexo, github, github actions, auto release]
---
# 前言

准备开始面试了才发现，一般来说个人博客也是很重要的加分项，于是临时抱佛脚，打算最近多沉淀几篇出来。
在正式开始写文章之前，发现博客项目还处在刀耕火种的时代：需要手动进容器中拉代码打包。
眼看加分项就要变成减分项，赶紧先把自动部署搞一下。

# 项目部署方式

本项目的部署方式非常简单粗暴，直接在服务器中拉取repo，nginx代理/hexo目录到项目产物`public`文件夹下，每次发布时需要进入容器，在repo中执行`hexo generated`命令，即完成打包更新。

# Github Actions

> 在 GitHub Actions 的仓库中自动化、自定义和执行软件开发工作流程。 您可以发现、创建和共享操作以执行您喜欢的任何作业（包括 CI/CD），并将操作合并到完全自定义的工作流程中。

一句话概述Github Actions即Github官方提供的CI/CD工具，通过[各种事件](https://docs.github.com/cn/actions/reference/events-that-trigger-workflows)来触发工作流。并且为方便开发者之间共享一些常用操作，提供了[actions市场](https://github.com/marketplace?type=actions)，可以在上面发布actions或使用其他人的actions。

# 实践

由于本项目并非Github Pages，所以不适用官方actions，需要自己完成一个发布方案。
项目部署方式如上所示，非常简单。

1. 在github actions中，我们需要监听master分支的`push`和`pull_request`两个钩子，通知服务器进行更新打包。
2. 在服务器端，启动一个node服务，接收github actions发出的更新通知，执行`git pull && hexo generate`即可

github actions文件如下

```yml
# This is a basic workflow to help you get started with Actions

name: CD

# Controls when the action will run. 
on:
  # Triggers the workflow on push or pull request events but only for the master branch
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest
    # 为了防止被刷爆，隐藏更新地址并设置一个token在环境变量中，接口处也校验一下
    steps:
      - name: Notify server of project updates
        run: |
          RES=$(curl -d 'event=update-hexo-blog&token=${{ secrets.UPDATE_HEXO_BLOG_TOKEN }}' -X POST https://yuanbo.online${{ secrets.UPDATE_HEXO_BLOG_PATH }})
          code=$RES | perl -pe 's/.*?"code":(\d+).+/\1/six'
          echo "code: $code"
          if [ "$code" -eq "0" ]; then
              echo "success"
          else
              echo "publish failed, res: ${RES}"
              exit 1
          fi
```

服务端接口如下:

```javascript
    router.post(process.env.update_hexo_blog_path, async (ctx) => {
    const body = ctx.request.body || {};
    if (body.event === "update-hexo-blog" && body.token === process.env.update_hexo_blog_token) {
      // 执行脚本拉取 && 生成
      const { stdout, stderr } = await exec('git pull && hexo g');
      // ...
  });
```
