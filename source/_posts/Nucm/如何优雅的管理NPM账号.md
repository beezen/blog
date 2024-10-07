---
title: 如何优雅的管理 NPM 账号
tags:
  - - NPM 账号
categories:
  - Nucm
abbrlink: 15341
date: 2024-04-16 15:05:06
---

## 前言

前端开发者和运维配置人员在发布 NPM 模块时，常常需要切换或登录 NPM 账号。繁琐的账号和密码输入过程让人感到十分困扰。NUCM 是一款专门用来管理 NPM 账号的工具，它提供了一系列简单且安全的指令，以帮助开发者轻松应对这一问题。

## 快速上手

> nucm 版本 1.11.1

### 安装

使用你喜欢的包管理工具进行全局安装，参考如下：

```bash
$ npm install -g nucm

# 或使用 yarn
$ yarn global add nucm
```

### 常用命令

```bash
Usage: nucm [options] [command]

Options:
  -v,--version                查看版本
  -h, --help                  显示命令帮助

Commands:
  ls [options]                查看账号列表
  use <name>                  切换账号
  add <name> <access-tokens>  添加账号
  del <name>                  移除账号
  localize <lang>             使用本地化语言
  update [options]            更新版本
  save                        保存当前账号
  help [command]              display help for command
```

### 操作演示

![](https://img.dongbizhen.com/blog/20240416-nucm.gif)

1、添加账号

执行 `nucm add <name> <access-tokens>` 添加账号， `name` 为自定义的账号别名，`access-tokens` 为 NPM 账号令牌。例如：

```bash
$ nucm add beezen xxxxxxxxxxxxxxxx

添加账号成功
```

[点击查看 access-tokens 获取方式](https://beezen.github.io/nucm/more.html#npm-auth-related-configuration)

2、查看账号列表

执行 `nucm ls` 可查看刚添加的账号是否出现在账号列表中。例如：

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

3、切换账号

执行 `nucm use <name>` 命令切换当前使用账号。例如：

```bash
$ nucm use beezen

已切换到账号 beezen
```

4、发布 NPM 包

在对应的 NPM 包根目录下执行 `npm publish`，则会使用第 3 步中账号的 Access Tokens 进行 NPM 包发布。

```bash
$ npm publish # 用切换的当前账号进行发布
```

[点击查看详细文档](https://beezen.github.io/nucm/)

## 工程化

NUCM 开源项目的工程质量主要通过 Github Actions 工程化的手段进行保障。目前，我们主要采用两个动作来实现这一目标：一个是基于 VuePress 的文档自动发布流程，另一个是基于 Jest 的单元测试覆盖率统计。目前，我们的单元测试覆盖率已达 89%。

![](https://img.dongbizhen.com/blog/202404161611.png)

![](https://img.dongbizhen.com/blog/202404161613.png)

## 欢迎贡献

如果你恰好看到了这篇文章，你一定是希望对这个项目贡献自己的一份力量。

欢迎任何形式的贡献，不管是一个错别字的修改，还是一次友好的建议，不管是通过提交 [Issue](https://github.com/beezen/nucm/issues), 还是一个帅气 [pull request](https://github.com/beezen/nucm/pulls)。
