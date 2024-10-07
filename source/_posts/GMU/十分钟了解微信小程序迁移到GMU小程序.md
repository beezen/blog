---
title: 十分钟了解微信小程序迁移到 GMU 小程序
abbrlink: 54465
date: 2021-12-28 10:14:11
tags:
  - GMU
  - 小程序
categories:
  - GMU
---

## 简述

GMU 小程序和微信小程序的基础功能和语法规则都完全保持一致。

也就是说，如果已经存在一个微信小程序项目，想要迁移到 GMU 小程序，对于小程序开发者几乎没有任何的技术成本。唯一的区别是，需要简单调整一下`目录结构`，并添加一个 GMU 小程序`配置文件`。

GMU 小程序目录结构如下：

```bash
├── project.json ## GMU 小程序配置文件
├── src ## src 下内容即为微信小程序源码
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── pages ## 页面
```

GMU 小程序配置文件 `project.json` 示例如下：

```json
{
  "project": "miniprogram",
  "version": "0.0.1",
  "type": "miniprogram",
  "dist": "build",
  "plugins": ["miniprogram2"]
}
```

## GMU 小程序开发步骤

1、安装开发者工具

若本地已安装了 lighting 工具，直接升级至最新版本即可.

```bash
npm install lighting -g
```

2、安装 miniprogram2 插件

```bash
light plugin -a miniprogram2
```

3、运行 GMU 小程序项目

在 GMU 小程序项目根目录下，即 `project.json` 同路径下,执行如下命令：

```bash
light release -wb # 开发模式，会在浏览器控制台输出两个二维码地址
```

下载 LightView App ，并扫码加载浏览器控制台中的小程序预览二维码（后缀为 `/app.miniapp.js`），即可预览效果。

4、发布 GMU 小程序项目

在 GMU 小程序项目根目录下，即 `project.json` 同路径下,执行如下命令：

```bash
light release -p # 打包
```

然后上传小程序开发平台，具体操作参考：[版本发布](https://iknow.hs.net/site/jiguang/docView/home/15131)

## 参考资料

- [GMU 小程序开发指南](https://iknow.hs.net/site/jiguang/docView/home/25?docType=lib)
- [GMU 小程序发布](https://iknow.hs.net/site/jiguang/docView/home/15131)
