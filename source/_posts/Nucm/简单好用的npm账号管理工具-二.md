---
title: NUCM（NPM 账号管理工具）新发布的这两个功能，你值得拥有
tags:
  - npm
  - access-tokens
  - nucm
categories:
  - Nucm
abbrlink: 57408
date: 2022-03-23 22:06:45
---

> 还记的，上一次我们提到 nucm 能够通过几个简单的命令，就能帮助我们管理 NPM 的账号信息。上一篇文章[请点击这里](https://dongbizhen.com/posts/1619/)

Nucm 从 1.5.0 版本开始，已经可以对所有源的账号信息进行管理了，而且也可以管理 npm login 登录的用户账号了。下面主要就介绍一下这两个功能：

- 新增对其他源的账号管理能力([d12f24d](https://github.com/beezen/nucm/commit/d12f24dceacda716b13402cc33cdd7dccbef8ba3))
- 新增 nucm save 指令,查询当前账号信息是否存储并保存([0e9d5a3](https://github.com/beezen/nucm/commit/0e9d5a3caa48524f6b50ee2ee0d14998e960cb2f))

## 如何对其他源的账号管理

当我们 `clone` 一个新项目时，第一步要求一般都是安装依赖，需要在终端执行 `npm install`（或 yarn）,然后 npm 就会从 https://registry.npmjs.org/ 源（npm 官方源）下载项目依赖。因为在国内，所以我们需要使用 taobao 镜像源来提升下载速度，如果团队自建了 npm 私储,那么就要使用私有源。

面对这么多的源，我们是否都能记住对应账号？我们又该如何进行账号管理呢？

Nucm 的最新版本，就提供了这样的能力，可以帮助我们简单的管理各个源的账号信息。

### 1、对不同源的账号添加

账号添加只有一个原则：你添加或保存的账号，都会记录在当前源信息下。

也就是说，如果当前是 npm 源，那么你新增的账号都会记录在 npm 源信息下。如果当前是 taobao 源，那么新增的账号都会记录在 taobao 源信息下。

【添加账号指令】：`nucm add <name> <access-tokens>`

```bash
# 添加账号 beezen
$ nucm add beezen xxxxxxxxxxxxxxxxx
```

【保存当前账号指令】：`nucm save` (具体内容下文有详细介绍)

`注：怎么查看当前环境是什么源？`

【方式一】：终端执行 `npm config get registry` 可以看到源地址。

【方式二（推荐）】：通过 [nrm](https://www.npmjs.com/package/nrm) 工具管理和查看。

```bash
$ nrm ls

  npm ---------------- https://registry.npmjs.org/
  yarn --------------- https://registry.yarnpkg.com/
  tencent ------------ https://mirrors.cloud.tencent.com/npm/
  cnpm --------------- https://r.cnpmjs.org/
* taobao ------------- https://registry.npmmirror.com/
  npmMirror ---------- https://skimdb.npmjs.com/registry/
```

### 2、查看当前源的账号信息

```bash
# 查看当前源账号
$ nucm ls

  beezend -- xxxxxx......xxxx
  beezen --- xxxxxx......xxxx
* beeze ---- xxxxxx......xxxx

# 查看当前源账号，详细信息
$ nucm ls -l

  beezend -- xxxxxxxxxxxxxxxx
  beezen --- xxxxxxxxxxxxxxxx
* beeze ---- xxxxxxxxxxxxxxxx
```

### 3、查看所有源的账号信息

```bash
# 查看所有源账号
$ nucm ls -a

【npm】
  beezend -- xxxxxx......xxxx
  beezen --- xxxxxx......xxxx
* beeze ---- xxxxxx......xxxx

【maclocal】
* test ----- xxxxxx......xxxx

# 查看所有源账号-详细
$ nucm ls -al

【npm】
  beezend -- xxxxxxxxxxxxxxxx
  beezen --- xxxxxxxxxxxxxxxx
* beeze ---- xxxxxxxxxxxxxxxx

【maclocal】
* test ----- xxxxxxxxxxxxxxxx
```

## 如何管理 npm login 登录的账号

最初，nucm 的 1.0 版本只是对 npm 账号的 access tokens 进行管理，而我们也知道 access tokens 更多的是用在项目的持续集成上。对于个人开发者来说，还是习惯于使用账号和密码。要切换账号时，一般都是执行 `npm login` 输入账号和密码，再通过手机的二次验证登录，然后才能进行 `npm` 包的发布。说实话，这个发布流程还是挺长挺麻烦的。

现在，我们已经可以使用 nucm 来对个人开发者的账号管理了，不再需要靠记忆了。

在 nucm 最新版本 1.5.0 中，新增了保存当前账号的功能。开发者只需执行 `nucm save` 指令，nucm 会自动检测当前用户是否已登录，当前登录账号是否需要保存（如果已经通过 nucm 保存过的账号，就不用重复保存），保存成功的账号将会记录在当前源信息下。然后我们可以通过 `nucm ls` 查看已保存的账号信息列表，可以通过 `nucm use <name>` 的方式快速切换账号。

基础操作步骤如下图：

<img src="https://img.dongbizhen.com/blog/20220326_02.png" />

最后为了更容易理解，附上 `nucm save` 指令操作的整体流程图：

<img src="https://img.dongbizhen.com/blog/20220326_01.png" />

## 最后

最后欢迎开源社区的大大们能够提供更多的宝贵建议，欢迎 [Star](https://github.com/beezen/nucm) + [Fork](https://github.com/beezen/nucm) + [Watch](https://github.com/beezen/nucm) 三连。

Git 项目地址：[https://github.com/beezen/nucm](https://github.com/beezen/nucm)
