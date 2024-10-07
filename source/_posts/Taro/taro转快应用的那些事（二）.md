---
title: Taro 转快应用的那些事（二）
tags:
  - Taro
  - 快应用
  - 跨端开发
categories:
  - Taro
abbrlink: 33658
date: 2020-06-30 10:42:15
---

## 前言

Taro 转快应用的路途真的是让人心力憔悴啊~

## 内容大纲

### 本期：

记几次 Taro 转快应用的报错经历（taro v1.3.21）

### 说明：

因 Taro 转快应用的故事情节实在太多，也因部分情节实属超出了一般前端人的认知，本人也不敢乱说点啥。待我他日对其核心思想，以及整个体系都拥有了个人的独到见解，以及对齐具有抨击能力的时候，再将细节娓娓道来。`目前先从最关键的，开发到发布的一些问题关卡进行叙述。`

## 一、release 发布时报错 "无法找到需要依赖的文件"

### 背景：

Taro 组件和快应用原生组件混合开发时，Taro 组件调用了原生组件，原生组件还调用了原生组件或者一些其他的 JS 文件。发布时候发现 Taro 组件编译了，Taro 组件调用的原生组件也被编译了，但原生组件引用的那些原生组件或者 JS 文件却丢失了。

### 分析：

为何出现文件找不到的问题，因为 Taro 编译的时候只能分析 Taro 的相关内容，对于引用的原生组件并不会做深入的递归分析，所以解决方案很简单，编译器不会分析的话，那就将原生内容都全量拷贝呗，反正你也不会编译（注意 Taro 组件不需要拷贝。为啥？亲，你自己细细评味。）。

### 方案：

`通过脚本将原生快应用组件进行拷贝。`

我写了拷贝脚本了，但是为啥原生快应用内容还是没有被拷贝呢？或者编译后还是有问题呢？

> 亲，你的拷贝脚本位置需要放在 `taro build --type quickapp` 执行命令之前，这样不会丢失构建的环境变量。

> 请注意观察，执行 `taro build --type quickapp` 不带 `--watch` 的是 release 构建，他会清理生成的目录空间，再进行构建。可以修改 Taro 的底层代码，操作如下图：

<img src="https://dbz-images.oss-cn-beijing.aliyuncs.com/blog/%E6%9E%84%E5%BB%BA%E6%B8%85%E7%90%86.png" />

## 二、release 和 debug 的构建后样式不同

### 背景：

当你满心欢喜的终于开发完成，测试通过了。随即你打了一个正式环境集成测试包，然后就满脸惊恐的发现，所有的页面样式都出现或多或少的错乱（内心崩溃）。

### 分析：

debug 开发环境的生成样式与 release 正式环境的生成样式不同。

### 方案：

1.临时快速解决（当时需要及时发布，临时的），将 debug 环境生成的样式做好备份，直接覆盖 release 环境生成的样式。

2.修改 taro 源码，分析发现是 release 环境时，做了样式的去冗余处理，引用了 `csso` 库，但是处理上不是那么尽如人意。具体修改可参考如下图：

<img src="https://dbz-images.oss-cn-beijing.aliyuncs.com/blog/%E6%A0%B7%E5%BC%8F%E5%8E%BB%E5%86%97%E4%BD%99.png"/>

## 三、样式的条件编译

### 背景：

taro 为了方便大家书写样式跨端的样式代码，添加了样式条件编译的特性。但是在对快应用进行条件样式编译时，却完全不行。

##### 指定平台保留：

```
/*  #ifdef  %PLATFORM%  */
样式代码
/*  #endif  */
```

##### 指定平台剔除：

```
/*  #ifndef  %PLATFORM%  */
样式代码
/*  #endif  */
```

`关键点`：但是我们发现快应用进行条件样式编译，完全不行。why ？

### 分析：

查看源码发现 taro 的条件样式编译，是写在一个 npm 包中。核心代码如下：

```javascript
// postcss-pxtransform

/*  #ifdef  %PLATFORM%  */
// 平台特有样式
/*  #endif  */
css.walkComments((comment) => {
  const wordList = comment.text.split(" ");
  // 指定平台保留
  if (wordList.indexOf("#ifdef") > -1) {
    // 非指定平台
    if (wordList.indexOf(options.platform) === -1) {
      let next = comment.next();
      while (next) {
        if (next.type === "comment" && next.text.trim() === "#endif") {
          break;
        }
        const temp = next.next();
        next.remove();
        next = temp;
      }
    }
  }
});

/*  #ifndef  %PLATFORM%  */
// 平台特有样式
/*  #endif  */
css.walkComments((comment) => {
  const wordList = comment.text.split(" ");
  // 指定平台剔除
  if (wordList.indexOf("#ifndef") > -1) {
    // 指定平台
    if (wordList.indexOf(options.platform) > -1) {
      let next = comment.next();
      while (next) {
        if (next.type === "comment" && next.text.trim() === "#endif") {
          break;
        }
        const temp = next.next();
        next.remove();
        next = temp;
      }
    }
  }
});
```

### 方案：

第一步，在 `postcss-pxtransform` 中添加快应用类型。

<img src="https://dbz-images.oss-cn-beijing.aliyuncs.com/blog/postcss-pxtransform%E4%BF%AE%E6%94%B9.png" />

第二步，在 `taro-cli` 构建时，将原来的忽略平台判断移除，添加对应的平台参数，如下

<img src="https://dbz-images.oss-cn-beijing.aliyuncs.com/blog/taro%E6%A0%B7%E5%BC%8F%E6%9D%A1%E4%BB%B6%E7%BC%96%E8%AF%91.png" />

## 四、不支持编写 `display` 参数

### 背景：

我们需要对部分页面，做一些特殊化的配置(如标题、导航栏颜色等)，这时会用到 `display` 这个字段。但是 Taro 官方已经说明了不支持这两个属性，原因如下：

> 可以看出，相比于快应用官方的配置项，Taro 中支持的配置项缺少了 router 与 display 配置，这是因为这两项配置在 Taro 编译时会根据用户代码直接生成，不再需要额外配置。

然而，我们的项目比较特殊是 Taro 页面和原生快应用页面共存的，所以我们需要能够独立配置 `display` 字段。

### 方案：

修改 Taro 源码，寻找到 quickapp 的相关 display 部分，内容很简单 Taro-cli 把需要处理的内容都处理好了，我们只需要做简单的调整（按照需要可以做不同强度的调整）。直接上图吧：

<img src="https://dbz-images.oss-cn-beijing.aliyuncs.com/blog/qa-display.png" />

`注：举一反三，同样的方式去修改，让 Taro 支持 router 配置，以及其他的字段支持。`

## 最后

本篇内容主要是记录了第一次从开发到正常上线过程中遇到的一些关键问题。兼容这些问题只能说满足了让我们可以正常上线，但在开发过程中还会遇到很多很多的`小问题`。我们一定要调整好自己的心态!调整好自己的心态!!调整好自己的心态!!!

办法总比困难多！
