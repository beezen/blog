---
title: 如何正确的让 GMU 小程序组件私有属性在 Taro 框架中生效
tags:
  - GMU
  - Taro
categories:
  - GMU
abbrlink: 18575
date: 2022-01-14 17:06:29
---

## 前言

> 小程序基础组件尽量不要挂载额外属性.
> Taro v3.1 将会自动过滤这些额外属性。

在小程序组件上，如果添加了一些额外属性，那么渲染时也会对这些属性一并进行 setData，从而影响整体渲染性能。 Taro 框架为了提升这部分 setData 的性能，在 v3.1 版本后将自动过滤这些额外属性。因为 GMU 小程序是对 Taro 转译的微信小程序源码直接编译的，那么对于 GMU 小程序来说，那些挂载在小程序组件上的私有属性也将会被完全过滤，直接后果就是属性失效，功能异常。

Taro 为了向下兼容这些私有属性功能，提供了 [`@tarojs/plugin-inject`](https://github.com/NervJS/taro-plugin-inject) 插件。（上帝关上一扇门，总会为你开一扇窗。）

## 快速开始

例如，我们给 GMU 小程序 swiper 组件添加了部分属性，那么则需要通过 `@tarojs/plugin-inject` 插件配置进行实现。具体代码如下:

1、依赖安装

```bash
$ npm i @tarojs/plugin-inject --save
```

2、修改项目 config/index.js 中的 plugins 配置为如下

```javascript
const config = {
  ...
  plugins: [
   ['@tarojs/plugin-inject', {
      components: {
        // 为 Swiper 组件新增了 'touch-direction-enabled' 属性
        Swiper: {
          'touch-direction-enabled': "''",
        },
      },
    }]
  ]
  ...
}
```

3、template 模板可正常使用私有属性

```html
<template>
  <swiper touchDirectionEnabled="vertical">
    <swiper-item> 内容 </swiper-item>
  </swiper>
</template>
```

## 插件额外功能

`@tarojs/plugin-inject` 插件可以接受如下参数：

| 参数项         | 类型             | 用途                       |
| :------------- | :--------------- | :------------------------- |
| syncApis       | array            | 新增同步 API               |
| asyncApis      | array            | 新增异步 API               |
| components     | object           | 修改、新增组件的属性       |
| componentsMap  | object           | 新增组件时的名称映射       |
| voidComponents | array, function  | 设置组件是否可以渲染子元素 |
| nestElements   | object, function | 设置组件模版的循环次数     |

具体功能可直接参照官方文档说明：[@tarojs/plugin-inject](https://github.com/NervJS/taro-plugin-inject)

## 参考资料

- [@tarojs/plugin-inject](https://github.com/NervJS/taro-plugin-inject)
