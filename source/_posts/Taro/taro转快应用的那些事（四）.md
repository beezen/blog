---
title: Taro 转快应用的那些事（四）
tags:
  - Taro
  - 快应用
  - 跨端开发
categories:
  - Taro
abbrlink: 57794
date: 2020-09-22 10:44:36
---

## 前言

埋点就是在应用中特定的流程收集一些信息，用来跟踪应用使用的状况，以及后续用来进一步优化产品或是提供运营的数据支撑。那么通过 Taro 框架编写的快应用，我们该如何优雅的在程序中去埋点呢？

## 内容大纲

1. 需要收集哪些埋点数据。
2. 通过快应用插件的方式添加全局埋点。
3. 通过生命周期注入的方式添加全局埋点。
4. 处理页面切换 `router.getState()` 取值不正确的问题。

## 需要收集哪些埋点数据

需要收集哪些埋点数据？相信这块内容不需要多说了，很多成熟的 web 端无痕埋点 SDK 都有说明，而且这类的文章也已经很多了。

这里主要介绍该如何获取，埋点数据中最重要的，页面路由（或者叫页面路径）。本章主要介绍如何统计用户进入和离开页面的行为数据，以及打开应用和离开应用的行为数据。（至于用户的操作行为数据，即点击类，滑动类等放后续章节说明，因为还有很多故事。）

总结了下，主要在以下几个生命周期中注入埋点代码（虽然实际场景，不可能在每个页面单独去注入代码哈），每次进入或启动事件都会产生一个新的 sessionId，并将当前的页面路由上报系统，系统对离开和进入的时间做一个计算，也能统计到当前页面用户所停留的时间。

统计应用启动和离开代码：

```javascript
// src/app.ux 应用 src 根目录下启动文件

onShow() {
    let arg = {
        PAGE_NAME: router.getState().name, // 访问页面路径
        sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    }
    // 应用启动埋点上报
}

onHide(){
    let arg = {
        PAGE_NAME: router.getState().name, // 访问页面路径
        sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    }
    // 应用离开埋点上报
}
```

统计页面进入和离开代码：

```javascript
// src/pages/xxxpage.js 页面js文件

onShow() {
    let arg = {
        PAGE_NAME: router.getState().name, // 访问页面路径
        sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    }
    // 页面进入埋点上报
}

onHide(){
     let arg = {
        PAGE_NAME: router.getState().name, // 访问页面路径
        sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    }
    // 页面离开埋点上报
}
```

## 通过快应用插件的方式添加全局埋点

实际场景中，开发不可能在每一个页面文件中，添加`onShow`,`onHide`的生命周期，这样会产生很多冗余代码，同时也不好维护。那么我们搜刮了一下文档，发现快应用联盟已经提供了一个简单的方式 [快应用插件](https://doc.quickapp.cn/framework/script.html#%E6%A1%86%E6%9E%B6%E5%89%8D%E7%AB%AF%E6%8F%92%E4%BB%B6-1060)。

```javascript
// src/plugins/utm.js

import router from "@system.router";
import { getStorage, setStorage } from "../utils/storage";

const Utm = {
  // 安装入口
  install(VmClass) {
    // 页面生命周期
    VmClass.mixin({
      async onShow() {
        let sessionId = `${Math.floor(100000 * Math.random())}${Date.now()}`;
        await setStorage("sessionId", sessionId); // 单次打开应用的会话编号
        let arg = {
          PAGE_NAME: router.getState().name, // 访问页面路径
          sessionId, // 区分埋点数据的会话id，主要是用来统计数据
        };
        // 页面进入埋点上报
      },
      async onHide() {
        let sessionId = (await getStorage("sessionId")) || ""; // 单次打开应用的会话编号
        let arg = {
          PAGE_NAME: router.getState().name, // 访问页面路径
          sessionId, // 区分埋点数据的会话id，主要是用来统计数据
        };
        // 页面离开埋点上报
      },
    });

    // 应用生命周期
    VmClass.mixinApp({
      async onShow() {
        let sessionId = `${Math.floor(100000 * Math.random())}${Date.now()}`;
        await setStorage("sessionId", sessionId); // 单次打开应用的会话编号
        let arg = {
          PAGE_NAME: router.getState().name, // 访问页面路径
          sessionId, // 区分埋点数据的会话id，主要是用来统计数据
        };
        // 应用启动埋点上报
      },
      async onHide() {
        let sessionId = (await getStorage("sessionId")) || ""; // 单次打开应用的会话编号
        let arg = {
          PAGE_NAME: router.getState().name, // 访问页面路径
          sessionId, // 区分埋点数据的会话id，主要是用来统计数据
        };
        // 应用离开埋点上报
      },
    });
  },
};

module.exports = Utm;
```

```javascript
// src/app.js 根目录启动文件中引入这个插件

export default {
  plugins: [require("./plugins/utm")],
};
```

`注意：重点！重点！重点！华为快应用中并不支持插件的写法。`（因为这个事儿，我还咨询了华为快应用的开发童鞋们，开发童鞋说了，他们觉得没有必要实现这个功能。哎，大佬就是牛气啊。）所以我们还得再想想办法呗。

## 通过生命周期注入的方式添加全局埋点

既然华为不支持插件的形式，同时我们也不想在每个页面都加一段生命周期的代码，那么我们就换个思路，在快应用 global 全局属性上添加生命周期的方法，然后自动化的注入到每一个页面逻辑中去。

```javascript
// src/app.js
// 注意此处的 `quickappPageLifecycle` 属性是自定义的，具体实现在上一章节中有详细说明
global.quickappPageLifecycle = {
  onShow: async () => {
    let sessionId = `${Math.floor(100000 * Math.random())}${Date.now()}`;
    await setStorage("sessionId", sessionId); // 单次打开应用的会话编号
    let arg = {
      PAGE_NAME: router.getState().name, // 访问页面路径
      sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    };
    // 页面进入埋点上报
  },
  onHide: async () => {
    let sessionId = (await getStorage("sessionId")) || ""; // 单次打开应用的会话编号
    let arg = {
      PAGE_NAME: router.getState().name, // 访问页面路径
      sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    };
    // 页面离开埋点上报
  },
};
```

```javascript
// dist/quickapp/src/pages/xxx.jx
// 经过对 Taro 生命周期改造后的主要代码如下；

var quickappPageLifecycle = global.quickappPageLifecycle || {}; // 此处获取了全局注入的生命周期

exports.default = Object.assign(
  require("../../npm/@tarojs/taro-quickapp/index.js").default.createComponent(
    Container,
    "/pages/xxx"
  ),
  quickappPageLifecycle
); // 最后导出的是 Taro 的生命周期和我们注入拦截的生命周期方法
```

## 处理页面切换 `router.getState()` 取值不正确的问题

以上代码程序的逻辑原理都是没问题的，但是经过实践发现，通过 `router.getState()` 的方式取当前页面的路由，存在一些问题。

主要场景为：当 pageA -> pageB 时，那么我们希望统计的是 pageA 离开触发 onHide 周期，上报 pageA 页面路由。然而实际上在 onHide 中通过 `router.getState()` api 获取到的页面路由为 pageB。

对于这个现象，其实很好理解，就是快应用底层设计上的一个小缺陷吧。当页面切换时，还没有触发 onHide 生命周期，但已经将即将跳转的页面路由，添加到路由堆栈中了，那么 onHide 触发时，通过 api 获取到的当前页面路由必然是跳转后的页面路由了。那么对于底层我们改不了，估计也不好改。我也咨询了快应用专门负责这块逻辑的开发童鞋，他觉得就用我目前的这种方式去实现吧，那个估计也不好改呢。

实现方式如下：

```javascript
import router from "@system.router";
import { getStorage, setStorage } from "../utils/storage";

export default {
  async onShow() {
    const page = router.getState();
    let sessionId = `${Math.floor(100000 * Math.random())}${Date.now()}`;
    await setStorage("sessionId", sessionId); // 单次打开应用的会话编号
    await setStorage("current_pageName", page.name); // 进入页面存档当前的页面路由
    let arg = {
      PAGE_NAME: page.name, // 访问页面路径
      sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    };
    // 页面进入埋点上报
  },
  async onHide() {
    let sessionId = (await getStorage("sessionId")) || ""; // 单次打开应用的会话编号
    let pageName = (await getStorage("current_pageName")) || ""; // 获取存档的当前页面路由
    let arg = {
      PAGE_NAME: pageName, // 访问页面路径
      sessionId, // 区分埋点数据的会话id，主要是用来统计数据
    };
    // 页面离开埋点上报
  },
};
```

## 最后

通过以上一系列的埋点数据，我们已经可以分析出，目标用户在当前应用中的一些页面级别的操作行为。那么很显然这些数据还远远无法支持我们的运营需求，对于如何无痕监听用户在快应用中的点击，滑动等操作行为，将会在后续的章节中展开。

如果对你有帮助，那就点个赞吧！
