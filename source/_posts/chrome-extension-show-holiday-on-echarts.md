---
title: 使用Chrome插件在Echarts 、Hightchart中展示节假日信息
date: 2022-05-15 17:12:30
tags:
---

# 背景
用户在日常使用 BI 系统的过程中，经常对于图表有一些自定义的需求。如：设置Y轴坐标是否从0开始、折线图值切换为比例、查看节假日等。

这类需求一般都具有通用性：即在一个平台提出的需求，也可以应用到其他平台。

目前各平台主流使用的图表库有两个：Echarts、HighCharts。这两个图表库都有一个特点，如果将图表模块的引用暴露至 window（window.echrats），即可以直接通过 inject-script 获取页面所有图表的实例，并使用其API 直接对页面上已渲染的图表进行修改。

通过插件的形式提供图表的节假日显示、坐标轴缩放、用户标注、图表类型切换等功能。既可以使用户获得一致的交互体验，也可以降低各BI系统的开发成本，仅需将图表库暴露至 window 即可。

### 测试方法

对于没有将图表实例暴露至 window 的平台，通过本地mock静态文件的方式，手动将构建产物中对应的包放入window进行测试

![修改chunk文件](/hexo/img/change-webpack-chunk.jpg)

### 测试结果

#### 平台A（EChrats）
![平台A（EChrats）](/hexo/img/chart1.jpg)

#### 平台B（HighCharts）
![平台B（HighCharts）](/hexo/img/chart2.jpg)


#### 平台C（EChrats，未暴露至window）
![平台D（EChrats，未暴露至window）](/hexo/img/chart3.jpg)

## 节假日数据来源
抓取百度万年历API获取日期详细信息

已抓取2000年 - 2023年节假日信息，导出json发布cdn。注：未来一年的数据不一定准确，如2021年中导出的2022年数据就有偏差，在2021年底重新导出后正常https://yuanbo.online/static/calendar/2022.json
![节假日数据](/hexo/img/calendar-data.jpg)

详见 [github仓库地址](https://github.com/sosohime/op-calendar)

### 节假日功能实现

#### Echarts

获取图例

```
const chartInstance = chartRef.current?.getEchartsInstance()

  const chartRect: PlainObject = get(
    chartInstance,
    '_coordSysMgr._coordinateSystems[0]._rect',
    {
      width: 0,
      height: 0
    }
  )
```

节假日 graphics 相关变量计算

```
// 图例容器大小
  const chartContainer: HTMLDivElement = get(chartInstance, '_dom', {
    clientWidth: 0,
    clientHeight: 0
  })
  // echarts 内表格实际的大小，不包含坐标轴label
  const {
    width: chartRectWidth,
    height: chartRectHeight,
    x: chartRectX,
    y: chartRectY,
  } = chartRect
  const {
    clientWidth: chartContainerWidth,
  } = chartContainer

  // 实际图表起点（不包含左侧label）
  const startXPointRatio = chartRectX > 0 ? chartRectX / chartContainerWidth : 0
  // 结束点
  const endXPointRatio = chartRectWidth / chartContainerWidth || 1
  // 每个日期占用的宽度
  const itemWidth = endXPointRatio / dsList.length
```

更新背景

```
chartRef.current?.getEchartsInstance().setOption({
    graphic: genHolidayBackgroundGraphic(data, chartRef, dateFormat)
  })
```

### 已开发功能

- 支持Echarts、HightCharts的 x轴为日期的节假日信息展示，底色区分周末、节日、补班日
- 支持 Tooltip 显示相关信息，包含纪念日、农历节气等
- 适配YYYYMMDD、YYYY-MM-DD、YYYY\MM\DD等不同日期格式
- 定时全量setOptions，以确保在数据变更、resize后仍正常显示

### TODO

- 支持y轴为日期的图例
- i18n
- 图例类型切换工具（大坑