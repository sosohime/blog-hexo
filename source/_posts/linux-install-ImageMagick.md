---
title: linux-install-ImageMagick
date: 2025-01-28 18:10:32
tags:
---

目前在学习写小程序，目标是继承几个工具应用，目前想到的有

1. raw在线转jpg：一张储存卡只拍raw省空间，但突然想导出来的场景
2. 吉他调音器：目前小程序调音器用起来都不如之前用过的一个古早windows版调音器，可以自定义调音（岸部大喜），识别起来也非常丝滑

先从简单的来图片格式转换来，所以我们先搞台机器把依赖装一下

## 开始实践

首先我们，找到以及部署可以白嫖的核心依赖

要实现raw转jpg，然后进行一些简单后期，可以使用[darktable](https://www.darktable.org/)转换raw到jpeg，然后通过[开源、强大的图像处理套件ImageMagick](https://imagemagick.org/)来实现后期

### Lighthouse装点依赖就这么难？

由于使用的腾讯云，目前有一台4C8G的Lighthouse，镜像用的OpenCloudOS9，经过一顿折腾最终倒在镜像源上，死活就安不上了，问就是不兼容，放弃幻想，先换一个debian回来。

Lighthouse提供的基础景象都日了狗，我只需要一个干净的debian怎么办呢？ok我们娴熟的打开CVM购买页面，选择竞价实例，按量计费，区域跟我Lighthouse的一致，然后镜像选debian，流量拉最小，创建！

然后抓紧时间最快速度装几个依赖，备份镜像，然后共享给Lighthouse，Lighthouse再通过这个镜像重装。

#### 安装过程

1. 首先我们更新

```bash
sudo apt update
sudo apt upgrade
```

2. 然后我们装基础依赖

```bash
sudo apt install git
sudo apt install build-essential libjpeg-dev libpng-dev libtiff-dev libwebp-dev
sudo apt install libtool-bin

```

3. 然后我们安装 ImageMagick

```bash
# 克隆项目，使用源码构建安装
git clone --depth 1 --branch 7.1.1-43 https://github.com/ImageMagick/ImageMagick.git ImageMagick-7.1.1
cd ImageMagick-7.1.1/
# 执行配置脚本
./configure
# 编译
make
# 检查
make check
# 安装
sudo make install
# 更新命令
sudo ldconfig /usr/local/lib
```

4. 安装 darktable

```bash
echo 'deb http://download.opensuse.org/repositories/graphics:/darktable/Debian_12/ /' | sudo tee /etc/apt/sources.list.d/graphics:darktable.list
curl -fsSL https://download.opensuse.org/repositories/graphics:darktable/Debian_12/Release.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/graphics_darktable.gpg > /dev/null
sudo apt update
sudo apt install darktable
```

#### 使用

``` bash
darktable-cli your_arw.ARW output.jpeg
```

ok转码完毕，刚刚安装的ImageMagick先忽略，后续更新图片高级处理
