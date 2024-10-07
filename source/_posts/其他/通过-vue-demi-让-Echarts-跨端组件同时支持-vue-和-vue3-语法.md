---
title: 基于 vue-demi 实现 Echarts 跨端组件在 Vue 2 和 Vue 3 中的语法统一化
tags:
  - Taro
  - vue-demi
  - 小程序
categories:
  - 其他
abbrlink: 36583
date: 2023-02-07 16:12:35
---

## 前言

随着越来越多的组件库接受 Vue 3 并增加对其的支持，如何保持对 Vue 2 的同步跟进成为了组件库开发人员面临的重要挑战。

通常情况下，为了同时管理 Vue 2 和 Vue 3 语法实现的组件库代码，人们会在代码仓库中新建两个分支。这种方法虽然可以有效地分类管理两种语法的代码，但在实践中证明，要保持两端组件功能的同步，对开发人员的要求非常高，同时也为组件库引入了极大的风险。因此，从长远角度考虑，我认为这不是一个最佳的方案。

经过大量的资料研究，我发现社区提供了一种解决方案，即使用 vue-demi 依赖库，即可轻松实现组件库在 Vue 2 和 Vue 3 语法之间的兼容。

本文将从以下三个角度介绍 vue-demi：

1、初次使用 vue-demi 库的体验。

2、使用 vue-demi 让 Echarts 跨端组件同时支持 Vue 2 和 Vue 3 语法的实际项目实践。

3、解析 vue-demi 库的源代码。

## vue-demi 的初体验

初次打开 vue-demi 官网介绍时，我有点迷茫。一方面是因为官网介绍全是英文，粗略阅读后只能大致了解，怕会遗漏一些重要的细节；另一方面，官方提供的使用案例过于简单，让我对这个库的可信度有所疑虑。但后来我仔细思考后，认为同时兼容 Vue 2 和 Vue 3 其实并不是那么复杂，因此我决定进行实践验证来验证这个库的可靠性。

初步总结：vue-demi 是一个可在多个 Vue 版本之间兼容的 JavaScript 库，可以让你编写通用的 Vue 库，而无需担心用户安装的 Vue 版本。

下面是 vue-demi 的使用介绍，主要内容都来自官网说明。为了帮助初学者更好地理解，我也加入了一些自己的思考。

### 安装

```bash
npm i vue-demi
# or
yarn add vue-demi
# or
pnpm i vue-demi
```

其实，可以直接将下面的配置，添加到组件库的 `package.json` 配置中，然后再执行依赖安装。

```json
{
  "dependencies": {
    "vue-demi": "latest"
  },
  "peerDependencies": {
    "@vue/composition-api": "^1.0.0-rc.1",
    "vue": "^2.0.0 || >=3.0.0"
  },
  "peerDependenciesMeta": {
    "@vue/composition-api": {
      "optional": true
    }
  },
  "devDependencies": {
    "vue": "^3.0.0" // 主要用于验证的 Vue 本地版本
  }
}
```

思考：为什么要添加上面这个配置？作用又是什么？

首先，我们需要理解一个公式：`@vue/composition-api` + `Vue 2` ≈ `Vue 3`。其表明了在用户的使用侧，Vue 3 相较于 Vue 2 主要就是增加了组合式 API。有兴趣的同学可以点击了解 [@vue/composition-api](https://github.com/vuejs/composition-api/blob/HEAD/README.zh-CN.md) 库的官方说明。

然后，我们来看 `peerDependencies` 项的配置（peer 依赖，也叫同等依赖。简单来讲，就是外层依赖中，如果存在着规则匹配的依赖包时，则当前库将共享使用外层依赖；如果不存在，则主动安装配置中的依赖版本。），表明项目需要依赖于 `@vue/composition-api` 和 `vue`，至于什么时候会用到 `@vue/composition-api`，是 `vue-demi` 库里面的逻辑决定的。

我也观察到 `vue-demi` 官网有单独一个模块来介绍组合的策略:

> `<=2.6`: exports from `vue` + `@vue/composition-api` with plugin auto installing.

> `2.7`: exports from `vue` (Composition API is built-in in Vue 2.7).

> `>=3.0`: exports from `vue`, with polyfill of Vue 2's `set` and `del` API.

### 使用

我们需要采用组合式 API 的开发方式来书写 Vue 3 语法，并且所有的 API 调用都需要从 `vue-demi` 库导入。如果有还不清楚组合式 API 的同学，建议优先阅读一下[组合式 API 常见问答](https://cn.vuejs.org/guide/extras/composition-api-faq.html#composition-api-faq)。

```javascript
import { ref, reactive, defineComponent } from "vue-demi";
```

同时，`vue-demi` 库除了代理了 Vue 3 的组合式 API 之外，还扩展一些其他字段（一般用不到这些其他字段，可以暂且忽略。）如：`isVue2` 和 `isVue3`，用来让开发者根据环境写不同的组件逻辑。例如：

```javascript
import { isVue2, isVue3 } from "vue-demi";

if (isVue2) {
  // Vue 2 only
} else {
  // Vue 3 only
}
```

还扩展了 `Vue2` 字段，用来直接调用 Vue 全局方法。例如：

```javascript
import { Vue2 } from "vue-demi";

if (Vue2) {
  Vue2.config.ignoredElements.push("x-foo");
}
```

## vue-demi 改造 Echarts 组件项目实践

最近，我参与了一个 Taro 项目，需要使用 Vue 3 的语法来展示 Echarts 图表，但当时的 [echarts4taro3](https://github.com/beezen/echarts4taro3) 图表跨端组件只支持 Vue 2 的语法，无法在 Vue 3 框架中使用。于是，我花了一个上午的时间，使用 vue-demi 库将该组件改造为同时兼容 Vue 3 和 Vue 2 的图表组件。

![](https://img.dongbizhen.com/blog/202302091707.png)

### echarts4taro3 组件

让我来简单介绍一下 `echarts4taro3` 组件：

`Echarts` 是一个基于 JavaScript 的开源可视化图表库，通常用于 Web 端。通过暴露的 API 绘制 canvas 图表，其提供的 `echarts.js` 让开发者可以方便地使用它。

`echarts4taro3` 是一个能够在 Taro3 框架上运行的跨端 Echarts 组件。它采用了 Vue 的语法，将 `echarts.js` 进行组件化包装，从而使得在 h5 和小程序端流畅展示图表成为可能。目前，它已经支持了多个平台，包括 H5、微信小程序、支付宝小程序以及字节跳动小程序。

因此，`echarts4taro3` 组件的本质就是实现了对 `echarts.js` 的组件化包装，并兼容了不同小程序的 API，以实现跨 H5 和多个小程序端的应用。

### 组件改造

经过实践，我发现通过 vue-demi 来对 Vue 2 组件进行改造，改动量真的非常少，微乎其微。以下是仅有改动的几个步骤：

【第一步】添加了部分依赖

```json
{
  "dependencies": {
    "vue-demi": "^0.13.11"
  },
  "peerDependencies": {
    "@vue/composition-api": "^1.0.0-rc.1",
    "vue": "^2.0.0 || >=3.0.0",
    "@tarojs/taro": ">=3.0.0"
  },
  "peerDependenciesMeta": {
    "@vue/composition-api": {
      "optional": true
    }
  },
  "devDependencies": {
    "vue": "^3.0.0"
  }
}
```

【第二步】将 Vue 2 选项式语法改成了 Vue 3 的组合式语法，其中组合式 API 调用都从 `vue-demi` 库中引入。例如：

```javascript
// Vue 3
import { ref } from "vue-demi";

const uid = ref(`canvas-${Date.now()}-${Math.floor(Math.random() * 10000)}`); // 定义了一个响应式变量

// 约等于 Vue 2 中的
// data() {
//   return {
//     uid:`canvas-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
//   };
// },
```

```javascript
// Vue 3
import { ref } from "vue-demi";

const eccanvas = ref(null);
const canvasInstance = eccanvas.value; // 获取当前组件实例

// 约等于 Vue 2 中的
// this.$refs.eccanvas // 获取组件实例
```

下面可以详细对比改造前后的核心代码差异：

【改造前 Vue 2】

```vue
<template>
  <EcCanvas ref="eccanvas" :uid="uid" />
</template>

<script>
import EcCanvas from "../ec-canvas";

export default {
  name: "BaseChart",
  components: { EcCanvas },
  data() {
    return {
      uid:`canvas-${Date.now()}-${Math.floor(Math.random() * 10000)}`; // 唯一标记
    };
  },
  methods: {
    /** 获取 chart 实例 */
    getChart() {},
    /** 更新图表数据 */
    setOption(data) {},
    /** 改变图表尺寸 */
    resize(options) {},
    /** 刷新图表 */
    refresh(data) {
      // 获取 EcCanvas 组件实例
      this.$refs.eccanvas.init((canvas, width, height, canvasDpr) => {
        // ...
      });
    }
  }
};
</script>
```

【改造后 Vue 3】

```vue
<template>
  <EcCanvas ref="eccanvas" :uid="uid" />
</template>

<script setup>
import { ref } from "vue-demi"; // 很重要：组合式 API 必须从 vue-demi 库导入
import Taro from "@tarojs/taro";
import EcCanvas from "../ec-canvas/index";
const uid = ref(`canvas-${Date.now()}-${Math.floor(Math.random() * 10000)}`); // 唯一编号
const eccanvas = ref(null); // 当前组件实例
/** 获取 chart 实例 */
function getChart() {}
/** 更新图表数据 */
function setOption(data) {}
/** 改变图表尺寸 */
function resize(options) {}
/** 刷新图表 */
function refresh(data) {
  // 获取组件实例
  const canvasInstance = eccanvas.value;
  canvasInstance.init((canvas, width, height, canvasDpr) => {});
}
// 对外暴露属性
defineExpose({
  getChart,
  setOption,
  resize,
  refresh,
});
</script>
```

### 小结

通过实战项目可知，使用 vue-demi 对组件进行改造主要涉及 Vue 2 到 Vue 3 语法改造，其中包括响应式变量、组件实例获取，以及 emits 触发等。更多细节可以参考官方的 Vue 3 迁移指南。

改造完成后，我们可以通过本地 npm 包发布的方式进行组件的兼容性测试。这可以使用 link 或 npm 安装本地文件的方式，但我推荐使用 `yalc` 工具进行多版本组件管理。如果您对此感兴趣，可以查看 [echarts4taro3](https://github.com/beezen/echarts4taro3) 的源码。如果您喜欢这个项目，也可以给它一个 [Star](https://github.com/beezen/echarts4taro3)。

## vue-demi 实现原理

![vue-demi原理图](https://img.dongbizhen.com/blog/202302091655.png)

从官网的说明文档中，其实已经可以大致猜测到内部的实现原理。原话如下：

> If the `postinstall` hook doesn't get triggered or you have updated the Vue version, try to run the following command to resolve the redirecting.

再结合 `peerDependencies` 字段的配置，我们不难猜测 vue-demi 的核心思想为：当项目安装 `vue-demi` 依赖完成时，通过 `postinstall` 钩子触发校验逻辑，判断当前项目中安装的 Vue 版本为 2 或者 3。如果为 Vue 2，则将结合 `@vue/composition-api` 导出 API；如果为 Vue 3，则直接导出其 API。

接下来，我们阅读一下 `vue-demi` 的源码，来验证猜测是否正确。

### package.json 配置文件

```json
{
  "name": "vue-demi",
  "version": "0.13.11",
  "main": "lib/index.cjs",
  "scripts": {
    "postinstall": "node ./scripts/postinstall.js"
  },
  "peerDependencies": {
    "@vue/composition-api": "^1.0.0-rc.1",
    "vue": "^3.0.0-0 || ^2.6.0"
  },
  "peerDependenciesMeta": {
    "@vue/composition-api": {
      "optional": true
    }
  }
}
```

开发者调用到的入口文件为 `lib/index.cjs`，当安装完成时，会通过 `postinstall` 钩子执行 `./scripts/postinstall.js` 逻辑。

### postinstall.js

```javascript
const { switchVersion, loadModule } = require("./utils");

const Vue = loadModule("vue"); // 加载 vue 模块

// 根据 vue 版本，入口文件切换成对应的逻辑
if (!Vue || typeof Vue.version !== "string") {
  console.warn(
    '[vue-demi] Vue is not found. Please run "npm install vue" to install.'
  );
} else if (Vue.version.startsWith("2.7.")) {
  switchVersion(2.7); // 切 Vue 2.7
} else if (Vue.version.startsWith("2.")) {
  switchVersion(2); // 切 Vue 2
} else if (Vue.version.startsWith("3.")) {
  switchVersion(3); // 切 Vue 3
} else {
  console.warn(`[vue-demi] Vue version v${Vue.version} is not suppported.`);
}
```

postinstall 文件内容已经非常精简了，执行逻辑即：先获取 Vue 模块，然后根据当前的 Vue 版本，进行入口文件的逻辑切换。

### switchVersion 函数实现

> 为了让大家更容易理解，笔者只保留了源码中最核心的逻辑。

先大致了解一下源码目录结构:

```bash
.
├── lib
│   ├── index.cjs
│   ├── v2
│   │   └── index.cjs
│   ├── v2.7
│   │   └── index.cjs
│   └── v3
│       └── index.cjs
├── package.json
└── scripts
    └── postinstall.js
```

再来看 switchVersion 函数逻辑，其实就很简单了。

```javascript
function switchVersion(version, vue) {
  copy("index.cjs", version, vue); // 切换版本，即将对应版本的文件内容写入到入口文件中
  if (version === 2) updateVue 2API(); // <2.7 的再单独执行一下，API 更新操作
}

const dir = path.resolve(__dirname, "..", "lib");

function copy(name, version, vue) {
  const src = path.join(dir, `v${version}`, name); // 原始文件，例如：lib/v3/index.cjs
  const dest = path.join(dir, name); // 目标文件，例如：lib/index.cjs

  let content = fs.readFileSync(src, "utf-8"); // 读取
  fs.writeFileSync(dest, content, "utf-8"); // 写入
}
```

举例说明：当匹配到是 Vue 3 时，则执行 `switchVersion(3)` 代码，内部逻辑实际上就是将 `lib/v3/index.cjs` 内容复制到 `lib/index.cjs`。

### 入口文件 index.cjs

1、当 Vue 3 时的入口文件即为 `lib/v3/index.cjs`

```javascript
var Vue = require("vue");

// 将所有 vue 3 的 API 暴露出去
Object.keys(Vue).forEach(function(key) {
  exports[key] = Vue[key];
});

// 主动设置下面几个变量
exports.Vue = Vue;
exports.Vue2 = undefined;
exports.isVue2 = false;
exports.isVue3 = true;
```

2、当 Vue 2.7 时的入口文件即为 `lib/v2.7/index.cjs`

```javascript
var VueModule = require("vue");
var Vue = VueModule.default || VueModule; // 兼容写法

exports.Vue = Vue;
exports.Vue2 = Vue;
exports.isVue2 = true;
exports.isVue3 = false;

// 将所有 vue 2.7 的 API 暴露出去
Object.keys(VueModule).forEach(function(key) {
  exports[key] = VueModule[key];
});
```

3、当 Vue 2 时的入口文件即为 `lib/v2/index.cjs`

```javascript
var Vue = require("vue");
var VueCompositionAPI = require("@vue/composition-api"); // 低版本 vue 想使用组合式 API，则需要使用该插件

// 将所有 @vue/composition-api 的 API 暴露出去
Object.keys(VueCompositionAPI).forEach(function(key) {
  exports[key] = VueCompositionAPI[key];
});

exports.Vue = Vue;
exports.Vue2 = Vue;
exports.isVue2 = true;
exports.isVue3 = false;
exports.version = Vue.version;
```

## 最后

如果你的组件库还没有实现 Vue 2 和 Vue 3 的语法兼容，非常推荐尝试使用 `vue-demi`。它可以让你在不担心用户安装的 Vue 版本的情况下，为 Vue 2 和 3 编写通用的 Vue 库。对于跨多端小程序的图表展示需求，非常推荐尝试使用 `echarts4taro3` 跨端图表库，它可以让你使用一套 Vue 2 或 Vue 3 代码，将图表流畅地展示于 h5 和小程序端。

以上是笔者初次接触 `vue-demi` 库的使用心得，如有描述不正确的地方，欢迎指正。如果觉得 `echarts4taro3` 图表库不错，可以到其 [GitHub 仓库](https://github.com/beezen/echarts4taro3) 点个赞哦。

## 参考资料

- [vue-demi 官网介绍](https://github.com/vueuse/vue-demi)
- [Make Libraries Working with Vue 2 and 3](https://antfu.me/posts/make-libraries-working-with-vue-2-and-3#-introducing-vue-demi)
- [echarts for taro3](https://github.com/beezen/echarts4taro3)
- [@vue/composition-api](https://github.com/vuejs/composition-api/blob/HEAD/README.zh-CN.md)
- [组合式 API 常见问答](https://cn.vuejs.org/guide/extras/composition-api-faq.html#composition-api-faq)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/zh/)
