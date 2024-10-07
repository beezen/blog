---
title: Taro 转快应用的那些事（三）
tags:
  - Taro
  - 快应用
  - 跨端开发
categories:
  - Taro
abbrlink: 36611
date: 2020-09-21 10:43:29
---

## 前言

[Taro 组件的生命周期](http://taro-docs.jd.com/taro/docs/apis/about/tarocomponent/#%E7%BB%84%E4%BB%B6%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F) 基本和 React 组件的生命周期完全相同，这也是为何 Taro 上手这么容易的原因。但它是如何将生命周期对应的转化到小程序，快应用，H5 等其他端语言的生命周期上呢？而且它真的能够完全覆盖到其他端组件（或页面）的所有生命周期吗？

## 内容大纲

1. Taro 组件生命周期转化的基本原理
2. 如何在 Taro 中拦截快应用原生的生命周期
3. 全局的错误监控

## Taro 组件生命周期转化的基本原理

其实理解生命周期的实现原理，就知道这很简单。只是将 Taro 组件上暴露的方法（如 `componentWillMount`、`componentDidMount`、`componentDidShow`等等），在对应的原生生命周期方法函数中去执行就完事了。话不多说，先看 Taro 中摘录的代码片段。

```javascript
// taro-quickapp/dist/index.js

var componentConf = {
  data: initData,
  onInit: function onInit() {
    /** 这部分删除了  */
  },
  onReady: function onReady() {
    if (!isPage) {
      initComponent.apply(this, [ComponentClass, isPage]);
    }

    var component = this.$component;

    if (!component.__mounted) {
      component.__mounted = true;
      componentTrigger(component, "componentDidMount");
    }
  },
  onDestroy: function onDestroy() {
    componentTrigger(this.$component, "componentWillUnmount");
    var component = this.$component;
    component.hooks.forEach(function (hook) {
      if (isFunction(hook.cleanup)) {
        hook.cleanup();
      }
    });
    var events = component.$$renderPropsEvents;

    if (isArray$1(events)) {
      events.forEach(function (e) {
        return taro.eventCenter.off(e);
      });
    }
  },
};

if (isPage) {
  componentConf["onShow"] = function () {
    componentTrigger(this.$component, "componentDidShow");
  };

  componentConf["onHide"] = function () {
    componentTrigger(this.$component, "componentDidHide");
  };

  pageExtraFns.forEach(function (fn) {
    if (componentInstance[fn] && typeof componentInstance[fn] === "function") {
      componentConf[fn] = function () {
        var component = this.$component;

        if (component[fn] && typeof component[fn] === "function") {
          return component[fn].apply(component, arguments);
        }
      };
    }
  });
  globalRef.componentPath = isPage;
  addLeadingSlash$1(isPage) &&
    cacheDataSet(addLeadingSlash$1(isPage), ComponentClass);
}

bindStaticFns(componentConf, ComponentClass);
bindProperties(componentConf, ComponentClass, isPage);
ComponentClass["privateTaroEvent"] &&
  bindEvents(componentConf, ComponentClass["privateTaroEvent"]);
return componentConf;
```

简单说明：`componentConf` 可以理解为原生，也就是 `componentConf['onShow']` 就表示了快应用中页面的生命周期 `onShow`。最后就变成了在快应用 `onShow` 的时候执行了 Taro `componentDidShow` 的方法，就这么简单。（[快应用生命周期点击查看](https://doc.quickapp.cn/tutorial/framework/lifecycle.html?q=)）

## 如何在 Taro 中拦截快应用原生的生命周期

上面已经清晰了 Taro 转快应用的生命周期方式，但同时我们也发现了还有好些快应用的生命周期（如 `APP` 的生命周期 `onShow`、`onHide`、`onError`等等），Taro 并没有支持到（原因可能是还没有跟上快应用的迭代变化，或者认为我们就是不需要.）。虽然有些功能社区暂时还未支持，但是偏偏我们业务场景上就要用了，那我们也不是只能反馈社区后等社区结果的，我们完全也是可以自己封装办到的。

那我们就先分析下 Taro 编译后的快应用代码，代码路径在 `dist/quickapp/src/app.ux`。

```javascript
// app.ux 底部

exports.default = require('./npm/@tarojs/taro-quickapp/index.js').default.createApp(_App);

_index2.default.initPxTransform({
  "designWidth": 750,
  "deviceRatio": {
    "640": 1.17,
    "750": 1,
    "828": 0.905
  }
});
</script>
```

其实发现编译后的源码很好理解，`exports.default` 是原生快应用语言要求导出的 JS 对象， 在这里导出的是 Taro `createApp` 方法执行后返回的一个对象。那么假如我们对这个即将导出的对象做重新赋值，并添加上我们想要添加的原生生命周期方法，那么是不是就已经达到了拦截原生生命周期的目的。

### 对 Taro 底层做一定的修改

所有修改的代码内容如下：

```javascript
// @tarojs/cli/src/mini/astProcess.ts

switch (type) {
    case PARSE_AST_TYPE.ENTRY:
    const pxTransformConfig = {
        designWidth: projectConfig.designWidth || 750
    }
    if (projectConfig.hasOwnProperty(DEVICE_RATIO_NAME)) {
        pxTransformConfig[DEVICE_RATIO_NAME] = projectConfig.deviceRatio
    }
    if (isQuickApp) {
        if (!taroImportDefaultName) {
        node.body.unshift(
            template(`import Taro from '${taroMiniAppFrameworkPath}'`, babylonConfig as any)()
        )
        }
        node.body.unshift(template(`var quickappLifecycle = global.quickappLifecycle || {};`, babylonConfig as any)()); // 硬核植入快应用生命周期
        node.body.push(template(`export default Object.assign(require('${taroMiniAppFrameworkPath}').default.createApp(${exportVariableName}),quickappLifecycle)`, babylonConfig as any)())
    } else {
        node.body.push(template(`App(require('${taroMiniAppFrameworkPath}').default.createApp(${exportVariableName}))`, babylonConfig as any)())
    }
    node.body.push(template(`Taro.initPxTransform(${JSON.stringify(pxTransformConfig)})`, babylonConfig as any)())
    break
```

```javascript
// app.quickapp.js

quickappLifecycle.onShow = () => {
  // 业务代码
};

quickappLifecycle.onHide = () => {
  // 业务代码
};
```

生成的代码

```javascript
// app.ux 底部

exports.default = Object.assign(require('./npm/@tarojs/taro-quickapp/index.js').default.createApp(_App), quickappLifecycle);

_index2.default.initPxTransform({
  "designWidth": 750,
  "deviceRatio": {
    "640": 1.17,
    "750": 1,
    "828": 0.905
  }
});
</script>
```

`重点说明`：我们的目的只要做到最后我们编译后生成的代码中，`exports.default` 导出的 JS 对象，是被我们赋值了新的生命周期方法即可。

查看 Taro 源码发现编译后的代码，是由其 `@tarojs/cli/src/mini/astProcess.ts` 文件生成的，而且他的生成模板都是固定的，那么就动点小手脚，在模板顶部插入一个变量

```javascript
node.body.unshift(template(`var quickappLifecycle = global.quickappLifecycle || {};`, babylonConfig as any)()); // 硬核植入快应用生命周期
```

然后再在模板输出的地方将变量合并到输出模块中

```javascript
 node.body.push(template(`export default Object.assign(require('${taroMiniAppFrameworkPath}').default.createApp(${exportVariableName}),quickappLifecycle)`, babylonConfig as any)())
```

那么对于开发来说，只需要在业务代码中，正常的将生命周期挂载到变量就好了

```javascript
// app.quickapp.js

quickappLifecycle.onShow = () => {
  // app显示的业务代码
};

quickappLifecycle.onHide = () => {
  // app隐藏的业务代码
};
```

以上的拦截都是比较粗暴的覆盖形式，可以做更细的优化就不展开了，同时其他的页面级别的生命周期拦截方式也是类似的，就不继续展开了。

## 全局的错误监控

以上我们已经基本摸清了 Taro 的生命周期原理，那么就做一个简单的业务实践。应用的全局错误监控照道理是每一个应用都应该要有的，以下的代码片段是我们分别对小程序和快应用做的全局生命周期拦截。业务代码没有摘录（小程序可以直接对接微信平台，快应用可以对接轻粒子），建议将错误日志对接到内部的错误日志平台上，通过平台可以做很多的数据分析，以及预警机制，从而来保障我们的应用稳定。

```javascript
// app.quickapp.js
/** 错误拦截捕获 */

function catchError() {
  if (process.env.TARO_ENV == "weapp") {
    // 小程序生命周期拦截
    const _originApp = App;

    App = function (options) {
      const _options = { ...options };

      _options.onUnhandledRejection = (err) => {
        console.error(err && (err.reason ? err.reason : err));
      };

      _options.onError = (err) => {
        console.error(err);
      };

      return _originApp(_options);
    };
  }

  if (process.env.TARO_ENV == "quickapp") {
    // 快应用生命周期拦截
    // 监听 promise 错误
    if (global.QuickApp) {
      global.QuickApp.unhandledrejection = (index, stack, message) => {
        try {
          console.error({
            stack,
            message,
          });
        } catch (error) {
          console.log("unhandledrejection", error);
        }
      };
    } // 监听 onError

    quickappLifecycle.onError = (err) => {
      try {
        console.log("onError", err);
      } catch (error) {
        console.log("onError", error);
      }
    };
  }
}

try {
  catchError();
} catch (error) {}
```

## 最后

摸清 Taro 生命周期实现原理后，Taro 转快应用的那些事儿就更明白了。同时我们也可以考虑下，如何对快应用做页面级别的用户行为埋点了，下一章会展开介绍。
