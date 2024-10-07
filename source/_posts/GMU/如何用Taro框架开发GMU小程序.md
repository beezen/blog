---
title: 如何用 Taro 框架开发 GMU 小程序
abbrlink: 35572
date: 2021-12-28 17:19:25
tags:
  - Taro
  - GMU
  - 跨端开发
categories:
  - GMU
---

## Taro 介绍

Taro 是一个开放式跨端跨框架解决方案，支持使用 React/Vue/Nerv 等框架来开发，当业务要求同时在不同的端都要求有所表现的时候，针对不同的端去编写多套代码的成本显然非常高，这时候只编写一套代码就能够适配到多端的能力就显得极为需要。

[Taro 参考文档](http://taro-docs.jd.com/taro/docs/README)

## GMU 小程序介绍

GMU 小程序与微信小程序使用同样的工作原理，将执行进程与渲染进程分离，分别以 JSCore 和 Webview 充当执行进程和渲染进程的执行载体。

GMU 小程序支持微信小程序基础语法，通过简单调整一下微信小程序目录结构，并添加一个 GMU 小程序配置文件,它就能够直接在 GMU App 环境中运行。

如何开发 GMU 小程序可参考：

[GMU 小程序开发指南](https://iknow.hs.net/site/jiguang/docView/home/25?docType=lib)

[十分钟了解微信小程序迁移到 GMU 小程序](https://www.dongbizhen.com/posts/54465/)

## Taro 与 GMU 小程序

Taro 在 GMU 小程序开发中扮演的是一个上层框架的角色，使用 Taro 框架能够帮助你更快捷的编写微信小程序、GMU 小程序以及同构 H5 项目等。

流程图如下：

<img src="https://img.dongbizhen.com/static/taro2gmu.png" width="400"/>

## 快速开发

第一步：运行 taro 编译到微信小程序

第二步：运行 light 编译生成 GMU 小程序，浏览器控制台显示小程序二维码

主要命令如下：

```bash
yarn # 安装依赖 (或 npm install )
yarn dev:weapp # (或 npm run dev:weapp)
yarn dev:light # (或 npm run dev:light)
```

## Taro2Light 语法和依赖

1. 使用 Taro vue 语法，官方文档链接：[https://taro-docs.jd.com/taro/docs/README](https://taro-docs.jd.com/taro/docs/README)

2. Taro 版本采用 3.x（注：建议用最新，3.0 以上支持 vue 语法编写）,并不对具体版本做特殊要求。说明：GMU 小程序底层是对微信小程序语法标准的全面支持，而 Taro 框架体系是把 DSL 语言转变为微信小程序语法的一种方案，我们不会对工具有过多的限制，拥抱社区。如果您发现 Taro 框架部分功能没有支撑到微信小程序，可以提交 PR 到社区来解决。

项目 DEMO 示例：[https://github.com/beezen/taro2light](https://github.com/beezen/taro2light)

## 调试技巧

1. 使用 Taro 多端同步调试

参考 Taro 官方：[http://taro-docs.jd.com/taro/docs/envs-debug](http://taro-docs.jd.com/taro/docs/envs-debug)

2. 结合 GMU 小程序的调试模式

```bash
yarn dev:weapp # 第一步：运行 taro 服务，编译为微信小程序语法
yarn dev:light # 第二步：运行 light 服务，将编译后的微信小程序语法编译为 GMU 小程序
```

## 脚手架配置

为了能让 Taro 框架方便快捷的与 GMU 小程序开发结合，目前可做如下的配置修改：

GMU 小程序配置文件

```json
// taro 项目根目录添加 light.project.json
{
  "project": "miniprogram",
  "version": "0.0.1",
  "type": "miniprogram",
  "dist": "build",
  "plugins": ["miniprogram2"]
}
```

taro 项目脚手架配置

```javascript
// config/index.js

const config = {
  sourceRoot: "src",
  outputRoot: "dist/light/src", // 输出符合 light 项目的工程结构，注：如果该项目为多端同构项目，此处可以根据环境变量，做不同的输出结构配置
  copy: {
    patterns: [{ from: "light.project.json", to: "dist/light/project.json" }], // 复制 light 项目配置文件，到 light 工程
    options: {},
  },
};
```

## 参考资料

- [十分钟了解微信小程序迁移到 GMU 小程序](https://www.dongbizhen.com/posts/54465/)
- [Taro 开发教程](https://taro-docs.jd.com/taro/docs/README)
- [GMU 小程序开发指南](https://iknow.hs.net/site/jiguang/docView/home/25?docType=lib)
- [taro2light DEMO 示例](https://github.com/beezen/taro2light)
