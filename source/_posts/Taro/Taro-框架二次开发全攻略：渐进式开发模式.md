---
title: Taro 框架二次开发全攻略：渐进式开发模式
tags:
  - Taro
categories:
  - Taro
abbrlink: 19741
date: 2024-04-16 14:17:43
---

## 前言

**Taro** 是一个开放式跨端跨框架解决方案，支持使用 React/Vue/Vue3 等框架来开发 微信/ 京东 / 百度 / 支付宝 / 字节跳动 / QQ / 飞书 小程序 / H5 / RN 等应用。

现如今市面上端的形态多种多样，Web、React Native、微信小程序等各种端大行其道。当业务要求同时在不同的端都要求有所表现的时候，针对不同的端去编写多套代码的成本显然非常高，这时候只编写一套代码就能够适配到多端的能力就显得极为需要。

在使用 Taro 开源框架进行公司性项目开发时，我们经常面对一些特殊业务流程，这些流程无法直接得到框架能力的支持。因此，我们需要进行 Taro 框架的二次开发，对其提供的接口、组件和框架进行定制化封装和优化，以更好地适应公司独特的业务需求。

下面将总结多年实际项目经验，从 Taro 框架的接口、组件以及新的二次开发模块角度来分别阐述对 Taro 开源项目二次开发的方式方法。

## 接口模块二次开发

首先，在 Taro 项目中，开发者通过引入 `@tarojs/taro` 模块来调用其提供的跨端 API，可在多端，如 weapp、alipay、swan、H5 等，灵活使用。例如下面这个 `showToast` 方法在各个平台都能显示统一样式的提示弹窗：

```js
import Taro from "@tarojs/taro";

// 提示接口
Taro.showToast({
  title: "提示",
  icon: "none",
});
```

Taro 提供的 `@tarojs/taro` 模块主要用于向应用开发者暴露框架的核心 API，例如：`switchTab`、`navigateTo`、`navigateBack`、`showToast`、`showModal`、`request`、`setStorage`、`getStorage`等。这些 API 都能够支持跨多端使用的特性，主要归功于 Taro 框架的插件架构。框架提供了统一的接口工具函数，而具体实现由各个小程序平台各自的编译插件单独维护和包装。例如，微信小程序通过 `@tarojs/plugin-platform-weapp` 编译插件来管理 AP，在其`src/apis.ts`文件中，通过使用`@tarojs/shared` 模块提供的 `processApis` 函数，对接口 API 进行扩展支持。相关代码示例如下：

```js
// apis.ts
import { processApis } from "@tarojs/shared";
import { noPromiseApis, needPromiseApis } from "./apis-list"; // api 列表

export function initNativeApi(taro) {
  // 将 api 列表挂载到 taro 对象上
  processApis(taro, wx, {
    noPromiseApis,
    needPromiseApis,
  });
  // ...
}
```

通过上述代码，可以了解到在微信小程序平台的接口 API 调用中，Taro 框架也仅充当 `Taro.xxx` 到 `wx.xxx` 的代理，其接口 API 的能力完全由微信小程序平台底层支持。因此，其他小程序平台也只需在编译插件中维护相应的接口 API 列表即可。

然而，与小程序不同，H5 平台并不具备类似底层支持的能力，因此所有 API 都需要由 Taro 框架进行兼容和支持，这些 API 被独立封装在 `@tarojs/taro-h5` 模块中。此外，Taro 框架还自定义提供了一些 H5 端和小程序端共用的接口，这些接口被单独封装在`@tarojs/api`模块中。相关代码示例如下：

```js
// @tarojs/api 模块
// ...
// 定义了一些 Taro 公共方法
const Taro: Record<string, unknown> = {
  Behavior,
  getEnv,
  ENV_TYPE,
  Link,
  interceptors,
  Current,
  getCurrentInstance,
  options,
  nextTick,
  eventCenter,
  Events,
  getInitPxTransform,
  interceptorify,
};

Taro.initPxTransform = getInitPxTransform(Taro);
Taro.preload = getPreload(Current);
Taro.pxTransform = getPxTransform(Taro);

export default Taro;
```

因此，通过对 Taro 框架源代码的深入分析，我们最终领悟到 API 模块的封装设计相当巧妙，其架构图如下：

![接口架构](https://img.dongbizhen.com/blog/image-20240201151413745.png)

从上图可见，`@tarojs/taro` 是最终暴露给开发者使用的核心模块。当我们发现 Taro 框架提供的接口 API 存在异常或者希望扩展新的接口 API 时，我们可以直接对 `@tarojs/taro` 模块进行二次封装，并生成一个新的模块，这里为了方便说明，暂称为 `extend-taro-api`。在这个新模块中，我们可以通过以下方式对 Taro 提供的接口 API 功能进行代理：

```js
// apis.ts
import * as Taro from "@tarojs/taro";
const request = (options) => {
  // 对 options 参数做自定义封装
  // 修复 H5 端 timeout 异常逻辑等等
  // ...
  return Taro.request(options);
};

export default request;
// extend-taro-api 入口模块

import * as Taro from '@tarojs/taro'
import apis from './apis' // 自定义的接口能力
import { deepmerge } from './utils'

// Taro 默认 API
const XX = { ...Taro }
delete (XX as any).default // 移除循环引用问题

//用自定义的接口能力来覆盖 Taro H5 端的 API
if (process.env.TARO_ENV === 'h5') {
  deepmerge(XX, apis)
}

export default XX
```

通过上述方法，我们成功进行了 Taro 框架接口 API 层的二次开发，以满足所有接口 API 层面的定制需求。开发者只需调整 API 导入方式，从原先的 `@tarojs/taro` 改为新模块 `extend-taro-api` 即可实现，例如：

```js
// import Taro from "@tarojs/taro"
import Taro from "extend-taro-api";
```

## 组件模块二次开发

> Taro 的组件模块分为两类：小程序端在编译时直接转换为小程序组件模板，其后续能力由小程序平台提供支持；而 H5 端则采用 webComponent 的方式，在运行时将组件定义到浏览器环境中。本文将主要探讨 H5 端的组件模块逻辑，对于小程序端的内容将不做过多介绍。

Taro 框架中组件模块与 API 模块的设计有显著的区别。组件模块在运行时直接将组件样式和逻辑注入到 JS 逻辑中，因此不再适用于通过二次封装的方式进行定制。

首先，我们还是来分析一下 Taro 框架源码。H5 端的组件模块为 `@tarojs/components`，主要可分为 WebComponent 组件库和语法适配库 Library 两部分。

```bash
.
├── LICENSE
├── README.md
├── dist
│   ├── components # webComponent 组件库
│   └── index.js
├── lib # 语法适配库
│   ├── react
│   ├── vue2
│   └── vue3
└── package.json
```

在开发者进行 Taro 项目编译时，在 Taro 源码内部会经历以下几个步骤：

**步骤一：** 执行 `@tarojs/webpack5-runner` 模块中的 `index.h5` 入口。

**步骤二：** 加载 `./webpack/H5Combination` 中的自定义 loader 和 plugin。

**步骤三：** 在执行到自定义 loader 时，`@tarojs/taro-loader` 模块会优先生成一份 H5 端的**初始化 JS**。

**初始化 JS**的内容包含了注册 H5 端 WebComponent 组件的逻辑，具体如下：

```js
import "@tarojs/plugin-platform-h5/dist/runtime";

import { createRouter } from "@tarojs/router";
import { createVueApp } from "@tarojs/plugin-framework-vue2/dist/runtime";

import Vue from "vue";

import { initVue2Components } from "@tarojs/components/lib/vue2/components-loader";
import * as list from "@tarojs/components"; // 加载组件

// ...
initVue2Components(list); // 初始化时，注册 webComponent

var inst = createVueApp(component, Vue, config);
createRouter(inst, config, Vue);
```

其中 `initVue2Components` 函数会将自定义的 webComponent 组件注册到 Vue 上。具体实现逻辑如下：

```js
import Vue from "vue";

export function initVue2Components(components: Record<string, any> = {}) {
  // ...
  Object.entries(components).forEach(([name, definition]) => {
    if (typeof definition === "function") {
      const tagName =
        "taro" + name.replace(new RegExp("([A-Z])", "g"), "-$1").toLowerCase();
      const comp = Vue.extend(definition);
      Vue.component(tagName, comp);
    }
  });
}
```

然而，仔细观察上述逻辑，可以发现并未直接调用 `@tarojs/components/lib` 中的逻辑。所以我们又深入挖掘了一下源码，发现还存在一层额外的逻辑封装，在`@tarojs/plugin-platform-h5` 插件中定义组件模块的别名，具体如下：

```js
// @tarojs/plugin-platform-h5 模块

alias.set("@tarojs/components$", this.componentLibrary);
alias.set("@tarojs/components/lib", this.componentAdapter);
alias.set("@tarojs/router$", this.routerLibrary);
alias.set("@tarojs/taro", this.apiLibrary);
```

因此，可以明显看出，尽管 Taro 框架的组件模块在编译时涉及多个模块，但它们相对而言是独立的。同时，组件模块是通过 Webpack 在编译时进行打包的，我们也有机会通过直接设置自定义的 Webpack 别名，将原来要加载的 `@tarojs/components` 模块修改为我们自己封装的组件模块。参考代码如下：

```js
// config.js 配置文件中，提供了 H5 端的自定义webpack配置
webpackChain(chain, webpack) {
    const alias = chain.resolve.alias
    alias.delete("@tarojs/components$") // 移除框架内置的别名
    alias.delete("@tarojs/components/lib") // 移除框架内置的别名

    // 设置为我们封装的组件模块
    alias.set("@tarojs/components$", require.resolve(`extend-taro-components/components/lib/vue2`))
    alias.set(
        "@tarojs/components/lib",
        path.join(path.dirname(require.resolve("extend-taro-components/components")), "..", "lib")
    )
},
```

通过上述方法，我们成功进行了 Taro 框架组件层的二次开发，以满足所有组件层面的定制需求。值得注意的是，组件模块的内部逻辑需要与 Taro 框架原有组件模块逻辑保持一致。所以我们在进行组件模块二次开发时，可以直接 Fork 一份指定版本的 Taro 组件模块源码，然后仅修改其中各个组件的具体实现逻辑。

## 二次开发全策略

在前文中我们了解到，通过深入研究开源框架的源代码，并巧妙选择一些方式进行部分模块的二次开发是可能的。然而，这并不适用于所有开源框架。接下来，我们将介绍一些通用的二次开发策略，并介绍我们采用的一种新型二次开发模式，以满足业务需求的快速迭代。

### 传统开发模式

**1、Fork 固定版本**

**优点：**

1. **稳定性：** 团队能够完全掌握特定版本的代码，避免因为原项目的更新引入新的问题。
2. **可控性：** 团队可以更自由地管理自己的代码库，不受原项目后续更新的干扰。
3. **预测性：** 团队能够更好地预测和计划开发进度，因为代码库相对固定。

**缺点：**

1. **滞后性：** 由于固定版本，可能错过原项目后续版本的新功能、性能优化和安全修复。
2. **维护成本：** 长期来看，需要团队付出更多的维护成本，尤其是当项目规模增大或持续时间较长时。

**经历：**

我们曾经基于 Taro v1.3.21 版本进行了 Fork，并在此基础上修复了数百个功能点，包括添加补丁、修改原有逻辑以及新增支持某些特性的改进。我们的业务项目在这个基础上运行了两年多，为了适应 Taro v1.3.21 版本，我们编写了大量的兼容代码。然而，随着时间推移，我们逐渐发现业务项目的维护变得越来越困难。因此，我们考虑升级 Taro 版本，但却发现这个过程异常艰巨，因为处处都存在不兼容的逻辑。升级的成本已经变得几乎不亚于重新开发一个全新的项目。

**2、持续集成更新**

**优点：**

1. **获取最新功能：** 团队能够及时获得原项目的新功能、改进和修复的代码。
2. **社区贡献：** 有机会参与原项目社区，提出建议、提交贡献，加强与社区的联系。
3. **更好的适应性：** 可以更灵活地适应原项目的更新，及时解决潜在的兼容性问题。

**缺点：**

1. **不稳定性：** 原项目的变更可能导致兼容性问题，需要团队不断适配。
2. **时间成本：** 因为要适应原项目的变更，可能需要投入更多的时间来处理更新导致的问题。
3. **依赖外部项目：** 对原项目的依赖性较高，原项目维护不善或停滞可能会影响到二次开发项目。

**经历：**

我们曾也采用过持续更新的策略，每次 Taro 框架有重大版本升级时，我们都会对内部项目进行 Taro 版本更新。然而，每一次的升级都需要投入大量人力资源进行回归测试。而且很多时候，你会发现 Taro 版本升级后完全阻塞了正常业务流程，且无法通过其他方式解决。在这种情况下，我们不得不回退升级，等待下一个 Taro 修复版本，然后再继续进行 Taro 版本的升级。这种方式很大程度上依赖项目升级人员的经验和一定的运气成分，导致整体稳定性较差。

### 渐进式开发模式

根据过去的实践经验，纯粹采用**Fork 固定版本**和**持续集成更新**这两种方式都不够可行。我们通过长时间的探索和创新，发现将这两种模式结合，并结合工程化流程，能够更好地满足二次开发的需求，响应业务流程的快速迭代。我们对此开发模式称之为**渐进式开发模式**。

#### 基础结构

**渐进式开发模式**虽然与常规模式相似，但它不仅解决了**Fork 固定版本**的滞后性问题，也解决了**持续集成更新**的不稳定性。其核心优势在于，我们能够在持续更新 Taro 版本的同时，快速响应框架问题。下面将介绍该模式的基础结构：

首先，我们需要建立基础框架团队，他们会持续对 Taro 框架进行调研，并选择 Fork 一个稳定的 Taro 版本源码，例如 v3.3.12，并将其推广至业务团队项目中。

如果在研发过程中，发现了这个版本上的缺陷，我们会直接基于当前 Taro v3.3.12 源码进行问题修复，并发布一个补丁包，暂且称为 `@xx/patch`。对于使用开发者而言，只需在项目中添加一个补丁配置 `@xx/patch`，然后在项目根目录下执行 `yarn install` 依赖安装命令时，会自动触发框架内置的 `preinstall` 勾子，并将 `@xx/patch` 模块中的补丁代码自动植入到 Taro 框架中，以快速修复缺陷问题，`preinstall` 勾子逻辑在下文有详细介绍。

同时，基础设施团队会定期进行内部 Taro 版本的更新（比如每六个月进行一次版本调研和升级），Fork 一个较新的 Taro 稳定版本，并推广到业务团队项目中。对于业务团队而言，他们可以按照自己的项目规划，有选择性地考虑是否要对 Taro 版本进行升级，一般活跃项目需要按节奏进行有序升级，防止出现跨大版本升级的现象。

这一新兴开发模式的成功实施取决于我们合理制定的**代码修复与优化**策略，以及**智能补丁模块替换**方案，下面将会详细阐述。

#### 代码修复与优化

首先，我们依然需要选择一个稳定的 Taro 版本并 Fork 其源码。如果我们已经维护过 Taro 的不同稳定版本，比如 v3.3.12 和 v3.6.22，那么我们就可以分别 Fork 这两个版本，并创建可识别的分支以进行后续的维护更新，例如：release-3.3.12 和 release-3.6.22。

接下来，针对源码级别的问题修复或新增需求，我们需要制定一定的管理策略，不然就会因为后续版本之前的巨大差异而造成一定的升级困扰。大致可分为以下几种情况：

1. 当前维护版本存在问题，但最新的 Taro 版本已修复。此时只需对维护版本进行补丁修复。
2. 当前维护版本和最新 Taro 版本都存在问题。我们将对当前维护版本进行补丁修复，并提交 Pull Request（PR）到最新的 Taro 版本。
3. 对于新增需求，我们将仅在最新的 Taro 版本上提交 PR。
4. 每个需求都必须经过内部审核机制。

在这里，我们需要注意维护好补丁包与 Taro 版本源码的关系。建议补丁包的包名与 Taro 源码包模块保持一致，例如，如果 `@tarojs/router:3.6.22` 模块存在问题，我们的补丁包模块可以命名为 `@xx/router:3.6.22-patch.1`。如果后续还有继续更新，可以递增补丁号，如 `@xx/router:3.6.22-patch.2`。这样有助于清晰地管理和追踪补丁包与 Taro 版本的对应关系。

#### 智能补丁模块替换

补丁模块替换逻辑主要采用 `yarn` 包管理工具的 `resolutions` 能力，对于模块下载方式，主要有如下三种：

- 从源镜像下载模块
- 在线资源模块
- 本地文件模块

示例如下：

```json
"resolutions": {
    "@tarojs/taro": "3.6.22",
    "@tarojs/components": "http://patch.xxx.com/components-3.6.22.tgz",
    "@tarojs/router": "file:./lib/router-3.6.22.tgz"
}
```

在这里，我们采用了本地文件加载的方式，以方便后续实现资源缓存能力。当开发者在项目根目录下执行 `yarn install` 命令进行依赖安装时，首先会触发 `preinstall` 勾子，提前进行补丁包的资源下载，并将补丁配置信息植入到 `package.json` 文件中的 `resolutions` 字段。然后，在项目依赖安装时，将会把配置文件中定义的补丁资源安装到指定的模块中，而不会再拉取线上资源。这样，我们成功实现了智能替换补丁模块的能力。参考代码如下：

```json
// package.json
"scripts": {
        "preinstall": "node scripts/preinstall.js"
},
"patch": {
        "@xx/patch": "1.0.0"
},
// preinstall.js 勾子模块
const http = require("http");
const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");
const patchVersion = pkg.patch["@xx/patch"]; // 获取 package.json 中关于补丁包相关信息
const serverUrl = `https://xx.patch.com?version=${patchVersion}`; // 补丁资源服务

// 发起 HTTP 请求
http.get(serverUrl, (res) => {
  const filePath = path.join(__dirname, ".patch");
  const fileStream = fs.createWriteStream(filePath);

  res.pipe(fileStream);
  // 处理请求完成事件
  res.on("end", () => {
    const patchConfig = require(".patch/config");
    pkg.resolutions = patchConfig.resolutions;
    // resolutions 配置内容如下
    // {
    //   "@tarojs/router": `file:${path.join(__dirname, ".patch/@xx/router-3.6.22-patch.1.tgz")}`
    // }
    fs.writeFileSync(
      path.join(__dirname, "../package.json"),
      JSON.stringify(pkg)
    ); // 重新写入 package.json 配置文件
  });
});
```

上述逻辑简要说明了智能补丁的核心流程。我们可以将 `preinstall` 中的逻辑封装到全局的 `CLI` 模块中，也可以通过在依赖安装完成后触发 `postinstall` 勾子来移除 `package.json` 文件中的 `resolutions` 配置。另外，提到的 `serverUrl` 补丁包下载服务，我们不一定需要自己搭建服务，可以通过 `npm publish` 方式将补丁包发布到 npm 镜像源，然后通过 `https://registry.npmmirror.com/@xx/router/-/router-3.6.22-patch.1.tgz` 方式进行下载。此外，我们还可以提供更多的配置参数，以满足更多定制化的需求。

## 最后

Taro 框架的二次开发在满足特定业务需求、提高系统适应性和灵活性方面显得尤为重要。通过二次开发，我们能够根据具体需求进行定制化调整，优化现有功能，适应技术和用户期望的不断变化，提升软件性能和安全性。此外，二次开发还有助于降低整体开发成本，延长软件寿命周期，确保项目与业务的长期健康发展。在不改变核心功能的基础上，二次开发为 Taro 项目注入了灵活性，使其更好地适应特定业务场景和用户需求。

文章中提及的二次开发方式各自有优劣，选择取决于项目的需求、团队的开发流程和维护能力。一些团队可能更注重稳定性，因此选择了固定版本的方式；而一些团队可能更注重获取最新功能和改进，因此选择了持续集成和更新的方式。还有一些团队可能既需要保持稳定性，同时也需要持续跟进最新能力，这时可以考虑尝试渐进式开发模式。在任何一种方式下，都需要谨慎处理代码的变更，以确保项目的稳定性和可维护性。
