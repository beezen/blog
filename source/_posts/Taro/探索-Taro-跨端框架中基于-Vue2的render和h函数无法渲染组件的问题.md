---
title: 探索 Taro 跨端框架中 Vue2 的 render 和 h 函数无法渲染组件的问题
tags:
  - Taro
  - 小程序
categories:
  - Taro
abbrlink: 28373
date: 2023-04-14 08:27:32
---

> Taro 版本为 3.3.x ~ 3.6.1，框架语法为 Vue2，平台为微信小程序，vant 版本为 2.12.13。

## 前言

在 Taro 的一次跨端项目版本升级实践中，我们意外地发现了一个问题：自定义的 `button` 组件无法渲染，究其原因，是因为通过 vue 的 `render()` 和 `h()` 函数定义的组件无法渲染。同时，因为项目中接入了 vant UI 组件库，而该组件库中存在大量类似的逻辑（自定义渲染）。最终，在项目的各个页面上，有许多组件模块无法成功渲染。

为了解决这个问题，我们进行了不断的调试和排查，最终发现了问题的根本原因：跨端框架对 vue 代码结构解析的不够充分，只能解析 `template` 模块中的组件标签，而无法解析自定义函数中的组件标签，从而导致无法准确的创建对应的小程序组件模板。

基于当前跨端框架的实现原理，我们提出了一种解决方案：创建一个组件模板辅助页，用于帮助自定义渲染组件进行渲染。这个辅助页完全剥离了业务逻辑，只是添加了需要渲染的组件模板。它的作用只是为了让框架准确匹配解析，而不会影响应用的运行时性能。

接下来，我们将以 `button` 组件为例，从问题、方案、原理等方面进行详细的阐述。

## 问题

> 针对该问题已经和 Taro 框架核心开发人员进行了充分交流，暂时还没有对应的解决方法，所以在 Taro 开源项目上提交了 [issue](https://github.com/NervJS/taro/issues/13338) ，方便后续跟进。

在跨端框架中，使用 Vue2 语法可以通过 `render()` 和 `h()` 函数实现自定义渲染组件。然而，有时候会遇到组件不渲染的问题。

举一个简单例子，在页面（index）中引入一个按钮组件（comp-button），该组件是由 `render()` 和 `h()` 渲染函数实现的。以下是具体代码：

```vue
<!-- 组件 comp-button.vue -->

<script>
import { h } from "vue";
export default {
  name: "comp-button",
  render: () => {
    return h("button", "自定义渲染按钮");
  },
};
</script>
```

```vue
<!-- 页面 index.vue -->

<template>
  <view>
    <CompButton></CompButton>
  </view>
</template>

<script>
import CompButton from "../../components/customerComp/comp-button.vue"; // 自定义按钮

export default {
  components: {
    CompButton,
  },
};
</script>
```

【期望的效果】：能够正常渲染按钮组件

![正常渲染按钮组件](https://img.dongbizhen.com/blog/image-20230326172555312.png)

【实际的效果】：显示存在问题，没有渲染按钮组件

![没有渲染按钮组件](https://img.dongbizhen.com/blog/image-20230326172555314.png)

观察并发现控制台有报错日志，如下：

![报错日志](https://img.dongbizhen.com/blog/image-20230326172555315.png)

注：在 Taro 低版本 3.3.x 中报错日志为 `Template 'tmpl_0_button' not found.`

### vant UI 组件库不兼容

> Taro 跨端项目中如何正确接入 vant 组件库，可参考之前发布的文章：[跨端实践 | Taro 框架中该如何使用 Vant 组件库-适配多端](https://juejin.cn/post/7080176600704090143)

同样的问题，也存在于使用 vant UI 组件库，我们以加载 `van-button` 为例，具体代码如下：

```vue
<template>
  <view>
    <van-button type="primary">primary</van-button>
  </view>
</template>

<script>
import { Button } from "vant";
export default {
  components: {
    "van-button": Button,
  },
};
</script>
```

【实际的效果】：页面上没有成功渲染 `van-button` 组件，同时报错日志如下：

![报错日志](https://img.dongbizhen.com/blog/image-20230326172555315.png)

## 方案

### 通用方法

在日常开发中，你可能从未遇到上述问题，这是因为在项目中通常会有很多页面。只要其他任何页面的 `template` 模块中存在 `button` 标签，框架就能正确解析并生成 `button` 组件模版。

基于上述情况，我们提出了一个临时解决方案：在页面路由中添加一个**组件模版辅助页**。该页面通过 `template` 模块实现渲染，内容包括需要渲染的组件标签。这样可以确保框架正确解析组件并生成相应的模版。

具体实现步骤如下：

1、在 `app.config.js`中添加一个辅助页路由。

```javascript
export default defineAppConfig({
  pages: [
    "pages/index/index", // 业务逻辑
    "pages/extra/index", // 辅助页
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
});
```

2、创建辅助页，并主动添加需要渲染的组件标签。

```vue
<!-- 辅助页 extra/index.vue -->
<!-- 只是为了让框架能够创建  render() 和 h() 函数中组件标签对应的小程序组件模版 -->

<template>
  <view>
    <button></button>

    <!-- ... 可按需添加组件 -->
    <!-- <icon></icon>
    <input /> -->
  </view>
</template>

<script>
export default {};
</script>
```

注意：在使用 vant UI 组件时，一个组件可能包含多个内置组件标签，因此需要分析 vant 组件源码，以确定需要添加哪些内置组件标签。然后，将这些标签逐个添加到辅助页上。如果你熟悉 Taro 框架的源码，也可以通过控制台报错日志来分析需要添加的组件标签。

### 单个组件修改

Taro 框架在 webpack 编译的 Tree shaking 时添加了钩子函数，可单独处理从 `@tarojs/components` 引入的组件。所以，如果项目中存在单个自定义组件，可以修改为如下方式：

```vue
<!-- 组件 comp-button.vue -->

<script>
import { Button } from "@tarojs/components"; // 从 @tarojs/components 模块中引入组件
import { h } from "vue";
export default {
  name: "comp-button",
  render: () => {
    return h(Button, "自定义渲染按钮");
  },
};
</script>
```

## 原理

如前所述，框架无法正确解析 `render()` 和 `h()` 函数中的组件标签，导致出现了问题。那么为什么框架不能够正确解析呢？而通过辅助页的方式，又是如何解决这个问题的呢？下面，我们将通过多个核心代码模块进行简要的解释。

1、首先，分析一下控制台的报错日志：

```bash
[WXML Runtime warning] ./base.wxml
 Template `tmpl_0_13` not found.
  143 |
  144 | <template name="tmpl_1_container">
> 145 |   <template is="{{xs.a(1, i.nn, l)}}" data="{{i:i,cid:1,l:xs.f(l,i.nn)}}" />
      |                ^
  146 | </template>
  147 |
  148 | <template name="tmpl_2_0">
```

结合微信小程序的模板语法知识可以猜测到：框架在运行时会先将 `{{xs.a(1, i.nn, l)}}` 变量计算为 `tmpl_0_13`，然后当微信小程序框架去加载 `tmpl_0_13` 模板时，无法找到相应的模块，从而导致错误。

那么 `tmpl_0_13` 模版的内容是什么呢？

通过添加辅助页的方式，先让组件能够正常编译渲染。然后我们会发现 `base.wxml` 中 `tmpl_0_13` 的模版确实被成功生成了，其内容就是 `button` 组件的组件模版。

以下是 `tmpl_0_13` 组件模版的完整内容：

```vue
<template name="tmpl_0_13">
  <button
    size="{{xs.b(i.p18,'default')}}"
    type="{{i.p19}}"
    plain="{{xs.b(i.p12,!1)}}"
    disabled="{{i.p2}}"
    loading="{{xs.b(i.p9,!1)}}"
    form-type="{{i.p3}}"
    open-type="{{i.p11}}"
    hover-class="{{xs.b(i.p4,'button-hover')}}"
    hover-stop-propagation="{{xs.b(i.p7,!1)}}"
    hover-start-time="{{xs.b(i.p5,20)}}"
    hover-stay-time="{{xs.b(i.p6,70)}}"
    name="{{i.p10}}"
    bindtouchstart="eh"
    bindtouchmove="eh"
    bindtouchend="eh"
    bindtouchcancel="eh"
    bindlongpress="eh"
    lang="{{xs.b(i.p8,en)}}"
    session-from="{{i.p16}}"
    send-message-title="{{i.p15}}"
    send-message-path="{{i.p14}}"
    send-message-img="{{i.p13}}"
    app-parameter="{{i.p0}}"
    show-message-card="{{xs.b(i.p17,false)}}"
    business-id="{{i.p1}}"
    bindgetuserinfo="eh"
    bindcontact="eh"
    bindgetphonenumber="eh"
    bindchooseavatar="eh"
    binderror="eh"
    bindopensetting="eh"
    bindlaunchapp="eh"
    style="{{i.st}}"
    class="{{i.cl}}"
    bindtap="eh"
    id="{{i.uid||i.sid}}"
    data-sid="{{i.sid}}"
  >
    <block wx:for="{{i.cn}}" wx:key="sid">
      <template is="{{xs.e(cid+1)}}" data="{{i:item,l:l}}" />
    </block>
  </button>
</template>
```

【疑问】不添加辅助页的情况下（即 `template` 模块中不存在 `button` 标签时），框架为什么不能生成 `tmpl_0_13` 组件模版？

2、分析 Taro 源码中模版创建模块逻辑。

经过源码调试，我最终确定了组件模板创建逻辑位于 `@tarojs/shared` 模块中，其中核心函数为 `buildStandardComponentTemplate`。该函数会根据传入的`comp` 字段上的 `nodeName` 属性分别创建对应的组件模板。通过逐步调试，我发现在使用 `h()` 函数创建 `button` 组件时，框架无法成功解析其中对应的标签节点。因此，在最终要创建的组件模板列表中不存在 `button` 这一项。

以下是 `buildStandardComponentTemplate` 函数的核心代码逻辑：

```javascript
// taro/packages/shared/src/template.ts
protected buildStandardComponentTemplate (comp: Component, level: number) {
    const children = this.getChildren(comp, level)
    const nodeAlias = comp.nodeAlias // tmpl_0_13 其中的 '13' 就是 'button' 的数字别名（即 Taro 低版本中 tmpl_0_button 等价于 tmpl_0_13）

    let nodeName = ''
    switch (comp.nodeName) {
      case 'slot':
      case 'slot-view':
      case 'catch-view':
      case 'static-view':
      case 'pure-view':
        nodeName = 'view'
        break
      case 'static-text':
        nodeName = 'text'
        break
      case 'static-image':
        nodeName = 'image'
        break
      case 'native-slot':
        nodeName = 'slot'
        break
      default:
        nodeName = comp.nodeName
        break
    }
  // 创建对应的组件模版
    let res = `
<template name="tmpl_${level}_${nodeAlias}">
  <${nodeName} ${this.buildAttribute(comp.attributes, comp.nodeName)} id="{{i.uid||i.sid}}" data-sid="{{i.sid}}">${children}</${nodeName}>
</template>
`
// ...

    return res
  }
```

【疑问】那么要创建的组件的 `nodeName` 字段都是怎么来的呢？

3、`this.miniComponents` 字段包含了微信小程序的所有组件名。

在函数调用栈继续向上调试后，我们发现在 `buildTemplate` 函数中，会遍历 `this.miniComponents` 字段中的所有组件名，也就是小程序中的所有内置组件，并进行组件模板的创建。不过，这个逻辑还包含一个过滤逻辑，根据 `componentConfig.includes` 字段提供的组件列表，只会筛选出项目中真正使用到的组件名。

这种优化的目的是为了减小项目代码的体积并提升项目的编译效率。该函数的主要逻辑如下：

```javascript
// taro/packages/shared/src/template.ts

public buildTemplate = (componentConfig: ComponentConfig) => {
    this.componentConfig = componentConfig
    if (!this.miniComponents) {
      this.componentsAlias = getComponentsAlias(this.internalComponents)
      this.miniComponents = this.createMiniComponents(this.internalComponents)
    }
  // 通过 componentConfig.includes 字段过滤，将需要真正渲染的组件模版名存储到 components 字段中
    const components = Object.keys(this.miniComponents)
      .filter(c => componentConfig.includes.size && !componentConfig.includeAll ? componentConfig.includes.has(c) : true)

    let template = this.buildBaseTemplate()
    for (let i = 0; i < this.baseLevel; i++) {
      template += this.supportXS
        ? this.buildOptimizeFloor(i, components, this.baseLevel === i + 1)
        : this.buildFloor(i, components, this.baseLevel === i + 1)
    }

    return template
  }
```

【疑问】那么`componentConfig.includes` 字段中的组件列表又是怎么来的呢？

4、`componentConfig.includes` 字段的内容来源。

首先，在 `@tarojs/webpack5-runner` 模块中，存在着一份默认组件列表，其中包含的都是常用组件（即必然会渲染的模版组件），列表长度为 9，具体如下：

```javascript
// taro/packages/taro-webpack5-runner/src/template/component.ts

export const componentConfig: IComponentConfig = {
  includes: new Set([
    "view",
    "catch-view",
    "static-view",
    "pure-view",
    "scroll-view",
    "image",
    "static-image",
    "text",
    "static-text",
  ]),
  exclude: new Set(),
  thirdPartyComponents: new Map(),
  includeAll: false,
};
```

其次，在解析 Vue 文件成抽象语法树（AST）的过程中，`vue-loader` 能获取到 `template` 模块中的标签节点名，并动态地对 `componentConfig.includes` 字段进行补充。也正因如此，我们才可以通过添加辅助页面的方式来临时解决组件模板的创建问题。

以下是 `vue-loader` 钩子函数的主要逻辑：

```javascript
// loader
let vueLoaderOption;

if (isBuildH5) {
  // H5
  // ...
} else {
  // 小程序
  vueLoaderOption = {
    // ...
    compilerOptions: {
      whitespace: "condense",
      modules: [
        {
          preTransformNode(el) {
            // vueLoader 的钩子函数，能够解析出 ast 中的标签节点名
            const nodeName = el.tag;
            if (capitalize(toCamelCase(nodeName)) in internalComponents) {
              data.componentConfig.includes.add(nodeName); // 动态地添加组件模版名
            }
            // ...
            return el;
          },
        },
      ],
    },
  };
}
```

在 `h()` 函数中使用的组件标签无法被成功解析，这主要是因为 `h()` 函数是在运行时直接被调用的，并不会通过 `vue-loader` 进行处理。如果硬要在编译层面处理，我们只能通过 webpack 编译器的钩子进行处理，并尝试分析 `h()` 函数中的内容。但是，由于 `h` 这个函数名在混淆后的代码中非常常见，无法保证解析到的 `h` 字符就代表 Vue 的 `h()` 函数。因此，我们使用 `h()` 函数编写的组件无法被准确处理。（其实这个问题，在源码中也被 TODO 备注了）

以下是 webpack 编译器的钩子函数逻辑：

```javascript
// taro/packages/taro-webpack5-runner/src/plugins/TaroNormalModulesPlugin.ts

normalModuleFactory.hooks.parser
  .for("javascript/auto")
  .tap(PLUGIN_NAME, (parser) => {
    parser.hooks.program.tap(PLUGIN_NAME, (ast) => {
      walk.simple(ast, {
        CallExpression: (node) => {
          const callee = node.callee;
          const nameOfCallee = callee.name;
          if (
            // 兼容 react17 new jsx transtrom
            nameOfCallee !== "_jsx" &&
            nameOfCallee !== "_jsxs" &&
            // 兼容 Vue 3.0 渲染函数及 JSX
            !(nameOfCallee && nameOfCallee.includes("createVNode")) &&
            !(nameOfCallee && nameOfCallee.includes("createBlock")) &&
            !(nameOfCallee && nameOfCallee.includes("createElementVNode")) &&
            !(nameOfCallee && nameOfCallee.includes("createElementBlock")) &&
            !(nameOfCallee && nameOfCallee.includes("resolveComponent")) // 收集使用解析函数的组件名称
            // TODO: 兼容 vue 2.0 渲染函数及 JSX，函数名 h 与 _c 在压缩后太常见，需要做更多限制后才能兼容
            // nameOfCallee !== 'h' && nameOfCallee !== '_c'
          ) {
            return;
          }
          // ...
        },
      });
    });
  });
```

## 最后

在日常开发中，如果我们的项目使用开源框架并遇到了框架的已知问题，通常有两种解决方式：开源贡献或寻找临时解决方案。

开源贡献意味着分析开源框架源码，并通过提交 PR 修复对应问题。作为开发人员，我们不仅享受着开源社区的便利，还应该尽自己的一份力量为开源社区做出贡献。

临时方案意味着使用一些特殊方式暂时规避项目中遇到的问题。需要注意的是，这类方式容易在后续版本迭代中失效，因此我们应该尽可能做好备注。

在实际项目开发中，建议同时采用这两种方案，首先解决当下问题，然后再寻找根本解决方案，以提高项目的稳定性。

## 参考资料

- [vue 渲染函数 & JSX](https://cn.vuejs.org/guide/extras/render-function.html)
- [微信小程序 WXML 语法参考 /模板](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/template.html)
