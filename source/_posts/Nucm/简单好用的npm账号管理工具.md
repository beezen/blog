---
title: 优秀前端人必须知道的 NPM 账号管理工具
tags:
  - npm
  - access-tokens
  - nucm
categories:
  - Nucm
abbrlink: 1619
date: 2022-01-30 15:40:38
---

## 前言

NPM 的账号和密码你是不是经常忘记？频繁切换 NPM 账号时的你是不是特别头疼？如果你刚好有上面的烦恼，现在安装 `nucm` 这个 node 小工具，就可以简单快速的对 NPM 账号进行管理了。

## `nucm` 介绍

> `nucm` 能帮你快速轻松地管理 NPM 账户信息。目前只对 NPM 源信息进行管理。

`nucm`：Npm User Change Manager（Npm 用户切换管理）

目前 `nucm` 主要是对 NPM 账号所创建的 [Access Tokens](https://docs.npmjs.com/about-access-tokens) 进行管理。`Access Tokens` 的作用可以简单的理解为，就是每一个 NPM 账号都可以生成不同类型的发布令牌，而发布令牌则可以直接用来做 npm 包的自动化发布。而 `nucm` 主要提供了一些简单操作命令，来对 `Access Tokens` 值进行添加和删除，以及查看和切换，从而达到管理 NPM 账号的目的。

`Access Tokens` 官方解释如下：

> An access token is an alternative to using your username and password for authenticating to npm when using the API or the npm command-line interface (CLI). An access token is a hexadecimal string that you can use to authenticate, and which gives you the right to install and/or publish your modules.

中文翻译：

> 访问令牌是使用 API 或 NPM 命令行界面（CLI）时使用您的用户名和密码进行身份验证到 NPM 的替代方案。访问令牌是您可以用于身份验证的十六进制字符串，并为您提供安装和/或发布模块的权利。

## 哪些人会用到 `nucm`

大概有下面三类人：

- 1、经常忘记 NPM 账号和密码的人
- 2、有多个 NPM 账号的人
- 3、需要频繁切换 NPM 账号的人

如果你不是经常登录 NPM 账号，时间一久，就很容易忘记自己的 NPM 账号和密码。如果你还注册了多个 NPM 账号，那么就更加容易造成记忆混乱，可能每次登录 NPM 账号时，都需要绞尽脑汁的回忆，然后进行多次输入和撤回操作。如果咱们程序员的记忆力比一般人好，能记住账号密码，但这些账号和密码里都包含了大小写和特殊符号，每次输入时都需要特别严谨，不能输错一个字符，不然就登录不上了。

所以不管怎么说，我们确实还是需要有那么一个 NPM 账号管理工具，来管理这些平常不怎么会用到的 NPM 账号密码，而 `nucm` 因为其命令简单和功能实用，特别受到大家的青睐，有需要的人现在就可以执行 `npm install nucm -g` 进行安装下载。

## `nucm` 常用命令

```bash
Usage: nucm [options] [command]

Options:
  -v,--version                show version
  -h, --help                  display help for command

Commands:
  ls [options]                show account list
  use <name>                  switch account
  add <name> <access-tokens>  add account
  del <name>                  remove account
  localize <lang>             use localized languages
  install                     initialize
  help [command]              display help for command
```

| 命令                         | 描述           |
| ---------------------------- | -------------- |
| `ls [options]`               | 查看账号列表   |
| `use <name>`                 | 切换账号       |
| `add <name> <access-tokens>` | 添加账号       |
| `del <name>`                 | 移除账号       |
| `localize <lang>`            | 使用本地化语言 |
| `install`                    | 初始化         |

## `nucm` 项目实践

目前在团队日常中已经充分使用到了 `nucm` ，它能帮助我快速切换个人账号和团队账号，真的是人人都夸 "好"！下面会简单介绍一下，初次使用时的基本操作步骤。

### 第一步：安装

```bash
$ npm install -g nucm # 或 yarn global add nucm
```

安装成功后，执行 `nucm -v` 验证是否安装成功（懂的都懂）。

### 第二步：添加账号

1、[官网](https://www.npmjs.com/)登录 NPM 账号，在页面的右上角，单击“配置文件”图片，然后单击“访问令牌”。

<img src="https://docs.npmjs.com/integrations/integrating-npm-with-external-services/tokens-profile.png" alt="Screenshot of the account menu with the tokens link selected" style="border: 1px solid rgb(153, 153, 153); margin-top: 15px; max-width: min(100%, 525px); max-height: 300px;">

2、单击生成新的标记。

<img src="https://docs.npmjs.com/integrations/integrating-npm-with-external-services/create-token.png" alt="Screenshot of the create new token button" style="border: 1px solid rgb(153, 153, 153); margin-top: 15px; max-width: min(100%, 525px); max-height: 300px;">

3、命名您的令牌

4、选择访问令牌的类型（一般选 `Publish`,具体查看文档说明）

<img src="https://docs.npmjs.com/integrations/integrating-npm-with-external-services/token-level-select.png" alt="Screenshot of the access level selection" style="border: 1px solid rgb(153, 153, 153); margin-top: 15px; max-width: min(100%, 525px); max-height: 300px;">

5、点击生成令牌。

6、从页面顶部复制令牌。

7、执行 `nucm add <name> <access-tokens>` 添加账号, `name` 取一个账号名，`access-tokens` 就是 `步骤6` 中复制的令牌（添加成功会有控制台提示）。例如：

```bash
$ nucm add beezen xxxxxxxxxxxxxxxx

添加账号成功
```

### 第三步：查看账号列表

执行 `nucm ls` 可查看刚添加的账号是否出现在账号列表中，例如：

```bash
# 默认显示脱敏的
$ nucm ls

  beezend -- xxxxxx......xxxx
  beezen --- xxxxxx......xxxx
* beeze ---- xxxxxx......xxxx

# 显示详细列表
$ nucm ls -l # 或 nucm ls --list

  beezend -- xxxxxxxxxxxxxxxxxxxxxxx
  beezen --- xxxxxxxxxxxxxxxxxxxxxxx
* beeze ---- xxxxxxxxxxxxxxxxxxxxxxx
```

### 第四步：切换账号

执行 `nucm use <name>` 可切换到指定账号，`name` 为`第二步`最终添加的账号名。例如：

```bash
$ nucm use beezen

已切换到账号 beezen
```

### 第五步：发布

到对应的 NPM 包目录下执行 `npm publish`,则会使用`第四步`中账号的 `Access Tokens` 进行 NPM 包发布。

### 其他辅助命令

1、执行 `nucm localize <lang>` 可切换本地化语言如英文或中文，目前只支持 `en` 或 `cn` 两种。例如：

```bash
$ nucm localize cn

已切换到语言 cn

$ nucm localize en

Switched to language en
```

2、执行 `nucm del <name>` 可移除已添加了的账号。例如：

```bash
$ nucm add beezen xxxxxxxxxx # 添加新账号

添加账号成功

$ nucm del beezen  # 移除账号

移除账号成功
```

3、执行 `nucm install` 则会初始化 `~/.nucmrc` 配置文件中的基本配置内容。（注：初次全局安装 `nucm` 包时会默认执行 `nucm install` 命令，一般不需要主动执行。）

```bash
$ nucm install

nucm 初始化成功
```

## nucm 源码解析

`nucm` 是一个 cli 命令行工具，其主要的内部逻辑就是使用 `commander` npm 包来对控制台输入的命令进行参数解析并执行指定逻辑。其设置的相关命令执行逻辑主要是来读写 `~/.nucmrc` 文件中的配置信息，再来对 `~/.npmrc` 文件中账号对应的 `Access Token` 值进行变更，从而做到能够自由切换账号的目的，具体流程图如下：

<img src="http://img.dongbizhen.com/blog/20220304_nucm01.png" />

项目源码工程结构如下：

```bash
.
├── CHANGELOG.md # 版本说明
├── LICENSE # 开源协议
├── README.md # 英文文档
├── README_CN.md # 中文文档
├── bin
│   └── index.js # cli 主入口
├── package.json # npm 包信息
├── src
│   ├── actions # 操作指令
│   │   ├── base.js
│   │   └── init.js
│   ├── index.js # 基础逻辑
│   ├── lang # 本地化描述配置文件
│   │   └── index.js
│   └── utils # 工具类
│       └── index.js
└── yarn.lock # lock
```

### 核心代码解析

整体使用 [commander](https://github.com/tj/commander.js) 进行命令管理，根据命令执行对应的 `action` 方法。

```javascript
const program = require("commander");

const { getLangMessage } = require("../src/utils/index"); // 国际化提示辅助函数
const { getUserList } = require("../src/actions/base");

......
program
  .command("ls")
  .option("-l,--list", getLangMessage("MSG_ls"))
  .description(getLangMessage("MSG_accountList"))
  .action(getUserList);
......
```

而各个 action 函数主要逻辑都是读写`~/.nucmrc`,`~/.npmrc`,`~/.nrmrc` 配置文件，并返回指定格式日志，典型函数如下：

```javascript
/**
 * 获取用户列表
 */
function getUserList(options) {
  let npmAccountList = config.npmAccountList; // 从配置文件中获取账号列表
  let userList = Object.keys(npmAccountList)
    .map((key) => {
      // 根据 nucm ls --list 命令，是否添加 `--list` 来判断是否脱敏
      let visibleToken = options.list
        ? npmAccountList[key]["access-tokens"]
        : desensitize(npmAccountList[key]["access-tokens"]); // 脱敏处理
      if (npmAccountList[key]["is-current"]) {
        // is-current 字段为 true 的账号为当前激活账号
        return colors.green(`* ${key} ${line(key, 10)} ${visibleToken}`);
      }
      return `  ${key} ${line(key, 10)} ${visibleToken}`;
    })
    .join("\n");

  console.log(userList); // 日志打印
}
```

## 最后

`nucm` 真的非常好用！在后面的计划中，会支持对非 NPM 源的账号信息也进行管理，也会对官方的 `npm login` 等命令进行适配，同时也会着重提升整体的交互体验，提高操作的响应效率。最后欢迎开源社区的大大们能够提供更多的宝贵建议，欢迎 [Star](https://github.com/beezen/nucm) + [Fork](https://github.com/beezen/nucm) + [Watch](https://github.com/beezen/nucm) 三连。

Git 项目地址：[https://github.com/beezen/nucm](https://github.com/beezen/nucm)
