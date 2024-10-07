---
title: Node 开发中遇到 node-gyp 报错？解决方法分享！
tags:
  - - node-gyp
  - - npm
categories:
  - - 其他
abbrlink: 1651
date: 2024-05-12 17:12:59
---

## 前言

在公司内网环境下，通过 `npm install` 命令安装涉及 C++ 代码的二进制依赖时，经常会遭遇 `node-gyp` 编译报错的问题，从而导致依赖安装失败，阻塞后续开发。

这种问题在 Windows 上尤为常见，而在 Mac 和 Linux 上较为罕见。主要原因是许多 Node.js 原生模块在 Mac 和 Linux 下通常使用 GCC 或 Clang 工具链，而在 Windows 下的编译环境相对复杂，一般使用 Visual Studio 的工具链，需要安装完整的集成开发环境。

本文将深入探讨开发人员在公司内网 Windows 机器上执行 `npm install` 时，如何处理与 `node-gyp` 相关的报错问题。

## 理解问题

### 什么是 node-gyp?

Node-gyp 是一个 Node.js 工具，专用于编译 Node.js 插件。这些插件通常是使用 C++ 编写的，需要编译成本地二进制文件才能在 Node.js 环境中运行。

它的主要作用是提供了一种跨平台的构建工具，用于将 C/C++ 代码编译成 Node.js 可以加载的共享对象文件。

它的原理是解析模块中 `binding.gyp` 文件所描述的构建参数和文件，然后生成相应的构建脚本，再调用底层构建工具执行编译过程，最终将生成的二进制文件复制到项目的 `node_modules` 目录下，以便 Node.js 在运行时加载和使用。

下面以安装 `utf-8-validate` 依赖为例进行说明：

1、执行 npm install 命令时，会先从 Internet 下载 utf-8-validate 模块资源到本地。它的 package.json 文件中的脚本如下：

```json
 "scripts": {
    "install": "node-gyp-build",
    "prebuild": "prebuildify --napi --strip --target=8.11.2",
    "prebuild-linux-musl-x64": "prebuildify-cross --image alpine --napi --strip --target=8.11.2",
    "prebuild-darwin-x64+arm64": "prebuildify --arch x64+arm64 --napi --strip --target=8.11.2"
  }
```

2、安装时，会同时触发脚本中的 `install` 勾子，执行 node-gyp 工具构建逻辑。主要为解析 binding.gyp 文件中的参数配置，生成用于将 Node.js 与第三方库连接的脚本，最终产物都生成在 prebuilds 文件夹中，目录结构参考如下：

```bash
.
├── LICENSE
├── README.md
├── binding.gyp # 编译脚本
├── deps
│   └── is_utf8
├── fallback.js
├── index.js
├── package.json
├── prebuilds # 跨平台的最终产物
│   ├── darwin-x64+arm64
│   ├── linux-x64
│   ├── win32-ia32
│   └── win32-x64
└── src
    └── validation.cc
```

### 为什么安装依赖时会报错？

当开发人员需要开发一个 WebSocket 应用程序时，往往需要通过 `npm install`命令安装 `bufferutil`、`utf-8-validate`、`ws` 和 `bcrypt` 这类 Node.js 模块。它们的作用是提供了一些高效的 C++ 实现来处理二进制数据的操作，特别是用于 WebSocket 的数据帧处理，用于加快 WebSocket 服务器和客户端之间的数据处理速度。

然而，安装这类 Node.js 模块时，常常会遭遇 `node-gyp` 的编译报错。

这是因为在安装这类包含 C++ 代码的 Node.js 模块时，Node.js 包管理器 npm 会检查系统是否具备必要的构建工具和依赖项，如果没有，它将试图下载并安装这些构建工具，然后使用它们编译 C++ 模块的源代码。而在公司内网环境下（即网络隔离），因为无法直接通过 Internet 下载这些必要的构建工具，所以就会导致 node-gyp 相关编译错误。

因此，在安装包含 C++ 代码的 Node.js 模块时，我们需要确保当前系统已安装了适当的构建工具和依赖项。在 Windows 系统上，可能需要安装 Visual Studio 工具链或其他适用的编译工具。

## 常见问题

在使用 node-gyp 构建 Node.js 原生 C++ 模块时，由于操作系统的多样性和复杂性，遇到的报错类型也是比较多样的。

以下概括了一些常见问题的解决方案：

1、**Python 不存在：** `node-gyp` 需要 Python 环境来编译插件，但在新搭建的系统上可能不存在 python 版本或较老的版本。解决方法是主动安装了 Python 3.x 版本，并在环境变量中配置正确的 Python 路径。

2、**缺少编译工具链：** `node-gyp` 在编译 C++ 插件时，需要合适的编译工具链，如 GCC 或 Visual C++。在 Windows 上，需要安装 Visual Studio 或 Windows Build Tools。

3、**缺少系统依赖项：** 编译 Node.js 插件时可能依赖于 nodejs 的库和头文件。因为在网络隔离的环境下，`node-gyp` 无法根据当前 nodejs 版本动态请求对应资源，可以通过离线的方式将 `node.lib` 和 `node-header` 文件解压到系统 nodejs 根目录下。

4、**文件路径中的空格或特殊字符：** 源代码目录或文件路径中的空格或特殊字符可能导致编译错误。尽量避免在路径中使用这些字符。

5、**权限问题：** 在某些情况下，缺少文件或目录的写入权限可能导致编译错误。尝试以管理员权限运行 `npm` 或修复文件权限。

6、**代码错误：** 如果插件的源代码中存在错误，编译过程也会失败。这类问题，只能通过查看插件的源代码，尝试修复其中的错误，或者就是更换插件。

## 项目实践

下面将通过项目实践的方式，进一步介绍如何在公司内网环境下处理 node-gyp 编译报错的详细过程，以帮助开发者在实际项目中顺利进行 Node.js 开发。我们此次是在特定的系统环境下进行项目实践，环境信息为 `node v16.13.1`、`Python 3.11.4`、`Windows Server 2016 Standard x64` 可供参考。

**需要注意**的是，不同的 Node 版本、Python 环境以及系统环境都可能会影响 node-gyp 对 Node.js 的 C++ 原生模块的编译过程。但其编译报错通常是相似的，因此可以相互借鉴参考。

### 镜像源限制

首先，在公司内网，即网络隔离的环境中，需要优先处理 NPM 镜像源问题。否则，执行 npm install 安装依赖时，由于无法访问到 NPM 的公网服务器 `https://registry.npmjs.org`，可能导致控制台超时报错 `npm ERR! code ETIMEDOUT`，从而阻塞后续的依赖安装。

为了解决这一问题，通常需要建立一个公司内网可访问的 NPM 镜像源，用以替代 NPM 公网服务器进行依赖管理。例如淘宝镜像是专门为解决国内网络隔离环境下 npm 资源下载问题而设计的。一些镜像源解决方案还包括：JFrog Artifactory、Nexus Repository、Verdaccio 和 cnpm 等。

#### 搭建私有镜像源

Verdaccio 是一个轻量级的、可定制的 npm 包管理器，可以在本地网络环境中搭建私有 npm 镜像源，使开发团队能够高效地共享和管理 npm 包，同时提供灵活的配置选项和可扩展的插件系统，满足各种内部开发需求。

本文以 Verdaccio 为例，简述私有镜像源的搭建过程。

1、**安装 Verdaccio**

Verdaccio 可以通过 npm 命令快速安装，命令如下：

```bash
npm install -g verdaccio # 或 yarn global add verdaccio
```

2、**运行 Verdaccio**

在命令行中可直接执行 `verdaccio` 命令以启动服务，但这样会有一个问题，当我们不小心关闭命令行时，Verdaccio 服务也会被停止。所以，最好的方式是通过 Node.js 进程管理工具 PM2 将 Verdaccio 服务守护起来。如果你还不了解 PM2 工具，请点击这里 [PM2 使用文档](https://pm2.fenxianglu.cn/docs/general/configuration-file/)。

在任意目录下新建 pm2.config.js 文件，内容参考如下：

```javascript
module.exports = {
  apps: [
    {
      name: "verdaccio",
      cwd: "/Users/pm2/",
      script: "./scripts/verdaccio.js",
    },
  ],
};
```

Verdaccio 的启动服务脚本可参考如下：

```javascript
// ./scripts/verdaccio.js

const shell = require("shelljs");
shell.exec("verdaccio");
```

最后我们在命令行执行启动命令即可，参考如下：

```bash
$ pm2 start pm2.config.js
```

访问启动服务地址，显示如下效果就表示 Verdaccio 服务已经搭建完成了，后续我们只需要将 NPM 上的模块定时同步过来就可以了。

![verdaccio](https://img.dongbizhen.com/blog/20240512/image-20240317195115916.png)

#### 切换镜像源

搭建完镜像源后，您可以按照以下步骤进行切换：

1、打开终端并执行以下命令来查看当前 npm 配置：

```bash
$ npm config list
```

2、切换 npm 镜像源，选择企业内部搭建的镜像源地址：

```bash
$ npm config set registry https://localhost:4873 #这里以本地服务地址为例，实际企业内部会分配固定 IP 或域名
```

3、验证 npm 镜像源是否配置成功，执行以下命令查看 registry 内容：

```bash
$ npm config get registry
```

至此，企业内部镜像源问题算基本解决了，当然实际项目中可能需要考虑更多的细节。

### Python 环境安装

成功设置镜像源之后，我们开始执行 `npm install ws` 安装命令，发现报错如下：

```bash
npm ERR! gyp ERR! find Python - Set the npm configuration variable python:
npm ERR! gyp ERR! find Python npm config set python "C:\Path\To\python.exx"
npm ERR! gyp ERR! find Python For more information consult the documentation at:
npm ERR! gyp ERR! find Python https://github.com/nodejs/node-gyp#installation
npm ERR! gyp ERR! find Python ****************************************************
npm ERR! gyp ERR! find Python
npm ERR! gyp ERR! configure error
npm ERR! gyp ERR! stack Error: Could not find any Python installation to use
npm ERR! gyp ERR! stack     at PythonFinder.fail (C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-python.js:330:47)
npm ERR! gyp ERR! stack     at PythonFinder.runChecks (C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-python.js:159:21)
npm ERR! gyp ERR! stack     at PythonFinder.<anonymous> (C:\Program File\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-python.js:228:18)
npm ERR! gyp ERR! stack     at PythonFinder.execFileCallback (C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-pyhon.js:294:16)
npm ERR! gyp ERR! stack     at exithandler (node:child_process:404:5)
npm ERR! gyp ERR! stack     at ChildProcess.errorhandler (node:child_process:416:5)
npm ERR! gyp ERR! stack     at ChildProcess.emit (node:events:390:28)
npm ERR! gyp ERR! stack     at Process.ChildProcess._handle.onexit (node:internal/child_process:288:12)
npm ERR! gyp ERR! stack     at onErrorNT (node:internal/child_process:477:16)
npm ERR! gyp ERR! stack     at processTicksAndRejections (node:internal/process/task_queues:83:21)
npm ERR! gyp ERR! System Windows_NT 10.0.14393
npm ERR! gyp ERR! command "C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js" "rebuild"
npm ERR! gyp ERR! cwd C:\Users\jcadmin\Desktop\work\node_modules\bufferutil
npm ERR! gyp ERR! node -v v16.13.1
npm ERR! gyp ERR! node-gyp -v v8.3.0
npm ERR! gyp ERR! not ok
```

分析 `npm ERR! gyp ERR! stack Error: Could not find any Python installation to use` 可知是缺少 python 环境，我们需要根据当前机器的 Windows 版本（64 位还是 32 位）从 Python 的官方网站下载 Python 3.12 对应的[安装程序](https://www.python.org/downloads/windows/)，然后，运行下载的 exe 安装包：

![python安装](https://img.dongbizhen.com/blog/20240512/image-20240205142815194.png)

特别要注意勾上`Add Python 3.x to PATH`，然后点 **Install Now** 即可完成安装。

### 下载 header 头文件

安装完成 Python 环境之后，我们再次执行 `npm install ws` 安装命令，发现报错如下：

```bash
npm ERR! code 1
npm ERR! path C:\Users\jcadmin\Desktop\work\node_modules\utf-8-validate
npm ERR! command failed
npm ERR! command C:\windows\system32\cmd.exe /d /s /c node-gyp rebuild
npm ERR! gyp info it worked if it ends with ok
npm ERR! gyp info using node-gyp@8.3.0
npm ERR! gyp info using node@16.13.1 | win32 | x64
npm ERR! gyp info find Python using Python version 3.11.4 found at "C:\Users\jcadmin\AppData\Local\Programs\Python\Python311\python.exe"
npm ERR! gyp http GET https://nodejs.org/download/release/v16.13.1/node-v16.13.1-headers.tar.gz
npm ERR! gyp WARN install got an error, rolling back install
npm ERR! gyp ERR! configure error
npm ERR! gyp ERR! stack FetchError: request to https://nodejs.org/download/release/v16.13.1/node-v16.13.1-headers.tar.gz failed, reason: connect ETIMEDOUT 104.20.23.46:443
npm ERR! gyp ERR! stack     at ClientRequest.<anonymous> (C:\Program Files\nodejs\node_modules\npm\node_modules\minipass-fetch\lib\index.js:110:14)
npm ERR! gyp ERR! stack     at ClientRequest.emit (node:events:390:28)
npm ERR! gyp ERR! stack     at TLSSocket.socketErrorListener (node:_http_client:447:9)
npm ERR! gyp ERR! stack     at TLSSocket.emit (node:events:402:35)
npm ERR! gyp ERR! stack     at emitErrorNT (node:internal/streams/destroy:157:8)
npm ERR! gyp ERR! stack     at emitErrorCloseNT (node:internal/streams/destroy:122:3)
npm ERR! gyp ERR! stack     at processTicksAndRejections (node:internal/process/task_queues:83:21)
npm ERR! gyp ERR! System Windows_NT 10.0.14393
npm ERR! gyp ERR! command "C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js" "rebuild"
npm ERR! gyp ERR! cwd C:\Users\jcadmin\Desktop\work\node_modules\utf-8-validate
npm ERR! gyp ERR! node -v v16.13.1
npm ERR! gyp ERR! node-gyp -v v8.3.0
npm ERR! gyp ERR! not ok
```

由于在网络隔离环境中，无法自动从 nodejs.com 官网下载到 Node.js 的 header 头文件，因此我们需要手动下载与当前主机环境匹配的 `node-v16.13.1-headers.tar.gz` 头文件。文件下载地址可参考报错日志信息 `npm ERR! gyp http GET https://nodejs.org/download/release/v16.13.1/node-v16.13.1-headers.tar.gz` ，解压后可得到一个名为 include 的文件夹，将其放置在 `C:\Program Files\nodejs` 目录下（具体路径可能根据本机 Node.js 配置而有所不同）。

### 自定义配置 nodedir 地址

安装完 nodejs 编译所需的头文件之后，我们再次执行 `npm install ws` 命令，发现报错依旧如下：

```bash
npm ERR! code 1
npm ERR! path C:\Users\jcadmin\Desktop\work\node_modules\utf-8-validate
npm ERR! command failed
npm ERR! command C:\windows\system32\cmd.exe /d /s /c node-gyp rebuild
npm ERR! gyp info it worked if it ends with ok
npm ERR! gyp info using node-gyp@8.3.0
npm ERR! gyp info using node@16.13.1 | win32 | x64
npm ERR! gyp info find Python using Python version 3.11.4 found at "C:\Users\jcadmin\AppData\Local\Programs\Python\Python311\python.exe"
npm ERR! gyp http GET https://nodejs.org/download/release/v16.13.1/node-v16.13.1-headers.tar.gz
npm ERR! gyp WARN install got an error, rolling back install
npm ERR! gyp ERR! configure error
npm ERR! gyp ERR! stack FetchError: request to https://nodejs.org/download/release/v16.13.1/node-v16.13.1-headers.tar.gz failed, reason: connect ETIMEDOUT 104.20.23.46:443
npm ERR! gyp ERR! stack     at ClientRequest.<anonymous> (C:\Program Files\nodejs\node_modules\npm\node_modules\minipass-fetch\lib\index.js:110:14)
npm ERR! gyp ERR! stack     at ClientRequest.emit (node:events:390:28)
npm ERR! gyp ERR! stack     at TLSSocket.socketErrorListener (node:_http_client:447:9)
npm ERR! gyp ERR! stack     at TLSSocket.emit (node:events:402:35)
npm ERR! gyp ERR! stack     at emitErrorNT (node:internal/streams/destroy:157:8)
npm ERR! gyp ERR! stack     at emitErrorCloseNT (node:internal/streams/destroy:122:3)
npm ERR! gyp ERR! stack     at processTicksAndRejections (node:internal/process/task_queues:83:21)
npm ERR! gyp ERR! System Windows_NT 10.0.14393
npm ERR! gyp ERR! command "C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js" "rebuild"
npm ERR! gyp ERR! cwd C:\Users\jcadmin\Desktop\work\node_modules\utf-8-validate
npm ERR! gyp ERR! node -v v16.13.1
npm ERR! gyp ERR! node-gyp -v v8.3.0
npm ERR! gyp ERR! not ok
```

实际上，报错信息与未下载头文件时的相同，通过研究发现是 Node.js 依旧未找到头文件资源的地址。我们需要在 .npmrc 文件中添加 nodedir 字段，将其指向本地 Node.js 资源目录。例如：`nodedir=C:\Program Files\nodejs`，可参考 node.js 文档 [链接到 Node.js 中包含的库](https://nodejs.cn/api/addons.html#%E9%93%BE%E6%8E%A5%E5%88%B0-nodejs-%E4%B8%AD%E5%8C%85%E5%90%AB%E7%9A%84%E5%BA%93) 章节。

### 安装 C++ 编译环境

在成功配置 nodedir 字段后，我们再次执行 `npm install ws` 命令，发现报错如下：

```bash
npm ERR! code 1
npm ERR! path C:\Users\jsadmin\Desktop\work\node_modules\bufferutil
npm ERR! command failed
npm ERR! command C:\windows\system32\cmd.exe /d /s /c node-gyp rebuild
npm ERR! gyp info it worked if it ends with ok
npm ERR! gyp info using node-gyp@8.3.0
npm ERR! gyp info using node@16.13.1 | win32 | x64
npm ERR! gyp info find Python using Python version 3.11.4 found at "C:\Users\jsadmin\AppData\Local\Programs\Python\Python311\python.exe"
npm ERR! gyp ERR! find VS
npm ERR! gyp ERR! find VS msvs_version not set from command line or npm config
npm ERR! gyp ERR! find VS VCINSTALLDIR not set, not running in VS Command Prompt
npm ERR! gyp ERR! find VS could not use PowerShell to find Visual Studio 2017 or newer, try re-running with '--loglevel silly' for more details
npm ERR! gyp ERR! find VS looking for Visual Studio 2015
npm ERR! gyp ERR! find VS - not found
npm ERR! gyp ERR! find VS not looking for VS2013 as it is only supported up to Node.js 8
npm ERR! gyp ERR! find VS
npm ERR! gyp ERR! find VS ***************************************************************
npm ERR! gyp ERR! find VS You need to install the latest version of Visual Studio
npm ERR! gyp ERR! find VS including the "Desktop development with C++" workload.
npm ERR! gyp ERR! find VS For more information consult the documentation at:
npm ERR! gyp ERR! find VS https://github.com/nodejs/node-gyp#on-windows
npm ERR! gyp ERR! find VS ***************************************************************
npm ERR! gyp ERR! find VS
npm ERR! gyp ERR! configure error
npm ERR! gyp ERR! stack Error: Could not find any Visual Studio installation to use
npm ERR! gyp ERR! stack     at VisualStudioFinder.fail (C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-visualstudio.js:121:47)
npm ERR! gyp ERR! stack     at C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-visualstudio.js:74:16
npm ERR! gyp ERR! stack     at VisualStudioFinder.findVisualStudio2013 (C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-visualstudio.js:351:14)
npm ERR! gyp ERR! stack     at C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-visualstudio.js:70:14
npm ERR! gyp ERR! stack     at C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\find-visualstudio.js:372:16
npm ERR! gyp ERR! stack     at C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\util.js:54:7
npm ERR! gyp ERR! stack     at C:\Program Files\nodejs\node_modules\npm\node_modules\node-gyp\lib\util.js:33:16
npm ERR! gyp ERR! stack     at ChildProcess.exithandler (node:child_process:404:5)
npm ERR! gyp ERR! stack     at ChildProcess.emit (node:events:390:28)
npm ERR! gyp ERR! stack     at maybeClose (node:internal/child_process:1064:16)
npm ERR! gyp ERR! System Windows_NT 10.0.14393
npm ERR! gyp ERR! command "C:\\Program Files\\nodejs\\node.exe" "C:\\Program Files\\nodejs\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js" "rebuild"
npm ERR! gyp ERR! cwd C:\Users\jsadmin\Desktop\work\node_modules\bufferutil
npm ERR! gyp ERR! node -v v16.13.1
npm ERR! gyp ERR! node-gyp -v v8.3.0
npm ERR! gyp ERR! not ok
```

分析报错信息 `npm ERR! gyp ERR! stack Error: Could not find any Visual Studio installation to use` 可知，主要是缺少了 Visual Studio，也就是缺少了 node-gyp 所要求的 C++ 编译环境。

下面将简要介绍如何安装 C++ 编译环境：

#### 在线安装

在公司内网环境搭建初期，可能需要通过 Internet 网络来下载一些必要配置。如果安全限制较高，也可以通过临时开通网络白名单得方式，从而通过网络进行环境搭建。（离线部署在后续章节说明）

首先，我们需要在 Internet 网络环境下，下载指定版本的` vs_BuildTools.exe` 文件（这里以 2019 为例），它是 Microsoft Visual Studio Build Tools 的安装程序，是 Microsoft Visual Studio 的一个轻量级版本，专门用于提供编译和构建工具，而不包含完整的 Visual Studio IDE，可通过以下官网链接获取：[Visual Studio Build Tools](https://visualstudio.microsoft.com/zh-hans/thank-you-downloading-visual-studio/?sku=BuildTools)。

接着在目标机器上执行以下步骤：

1. 将下载好的 vs_BuildTools.exe 文件传输到目标机器。
2. 在目标机器上双击运行 vs_BuildTools.exe 文件，开始安装 Visual Studio Build Tools 内容。
3. 在 Visual Studio Installer 中，选择「使用 C++的桌面开发」工作负荷（以 Community 2019 版本为例）。

![VS安装](https://img.dongbizhen.com/blog/20240512/202402061528.png)

4. 需要在 .npmrc 文件中将 msvs_version 版本设置为 2019，例如添加参数 msvs_version=2019。

通过以上几个步骤，在线环境下的 Windows 上的 C++ 编译环境就安装完成了。

#### 离线部署

首先下载 Visual Studio 引导程序（生成工具为最小模块）以创建布局：

| 版本                            | 引导程序                                                                |
| ------------------------------- | ----------------------------------------------------------------------- |
| Visual Studio 2022 Enterprise   | [vs_enterprise.exe](https://aka.ms/vs/17/release/vs_enterprise.exe)     |
| Visual Studio 2022 Professional | [vs_professional.exe](https://aka.ms/vs/17/release/vs_professional.exe) |
| Visual Studio 2022 Community    | [vs_community.exe](https://aka.ms/vs/17/release/vs_community.exe)       |
| Visual Studio 2022 生成工具     | [vs_buildtools.exe](https://aka.ms/vs/17/release/vs_buildtools.exe)     |

然后在具有 Internet 连接的环境下完成下载步骤：

1、打开命令提示符，导航到要下载引导程序的目录，使用 Visual Studio 页中定义的引导程序参数来创建和维护网络布局。

2、对于 Visual Studio Community，单一语言区域设置的完整初始布局需要约 40 GB 的磁盘空间，而 Visual Studio Enterprise 则需要约 50 GB 的磁盘空间。 其他每个语言区域设置需要大约 0.5 GB 的磁盘空间。

推荐的方法是使用所有工作负载和适当的语言创建 Visual Studio 的初始布局，并将包存储到网络服务器上的布局目录中。 这样，任何客户端安装都有权访问整个 Visual Studio 产品/服务，并能够安装任何子集。若要创建 Visual Studio 的完整布局，请从你计划用于托管网络布局的目录运行以下命令：

```bash
vs_enterprise.exe --layout c:\VSLayout
```

当然，考虑到实际情况一般不需要下载完整的内容，我们也可以根据自身需求自定义网络布局的内容，用于自定义布局的常见命令行参数包括：

- --add：用于指定工作负载或组件 ID。
  如果使用 --add，只会下载使用 --add 指定的工作负载和组件。 如果不使用 --add，将下载所有工作负载和组件。
- --includeRecommended，用于添加针对指定工作负载 ID 的所有推荐组件。
- --includeOptional，用于添加针对指定工作负载 ID 的所有可选组件。
- --config 使用配置文件指定应包含在布局中的组件。
- --lang：用于指定语言区域设置。

例如我们只需要下载 VC 模块，命令如下：

```bash
vs_enterprise.exe --layout C:\VSLayout --lang en-US --add Microsoft.VisualStudio.Workload.VCTools --includeOptional
```

### 下载 node.lib 库文件

在 C++ 环境配置完成之后，我们再执行 `npm install ws` 命令，发现报错如下：

```bash
npm ERR! code 1
npm ERR! path C:\Users\jcadmin\Desktop\work\node_modules\utf-8-validate
npm ERR! command failed
npm ERR! command C:\Windows\system32\cmd.exe /d /s /c node-gyp rebuild
npm ERR! 在此解决方案中一次生成一个项目。若要启用并行生成，请添加"-m"开关。
npm ERR!    validation.cc
npm ERR!    is_utf8.cpp
npm ERR!    win_delay_load_hook.cc
npm ERR! LINK: fatal error LNK1181: 无法打开输入文件"C:\\Program Files\\nodejs\\Release\\node.lib" [C:\Users\jcadmin\Desktop\work\node_modules\utf-8-validate\build\validation.vcxproj]
npm ERR! gyp info it worked if it ends with ok
npm ERR! gyp info using node-gyp@8.3.0
npm ERR! gyp info using node@16.13.1 | win32 | x64
npm ERR! gyp info find Python using Python version 3.11.4 found at "C:\Users\jcadmin\AppData\Local\Programs\Python\Python311\python.exe"
```

分析报错日志知道是缺失了 node.lib 文件，它与 header 头文件类似，也是 node.js 编译 C++ 模块时不可或缺的文件，因此我们需要手动下载配套的文件，下载地址也类似：`https://nodejs.org/download/release/v16.13.1/win-x64/node.lib`。根据实际报错信息，将 node.lib 文件放到 `C:\Program Files\nodejs\Release\node.lib` 目录。

至此，我们执行 `npm install` 命令不再报错了，终于可以在 Windows 电脑上成功安装包含 C++ 模块的依赖了。

## 名词解析

### headers.tar.gz

headers.tar.gz 文件是 Node.js 头文件的归档压缩包，它主要包含了用于开发 Node.js C++ 插件（native addons）所需的头文件和相关资源。这些头文件允许你在 C++ 环境中开发与 Node.js 运行时交互的功能。

具体来说，这个归档压缩包通常包含以下内容：

1. C++ 头文件：这些头文件定义了 Node.js 的 C++ 接口，允许你与 Node.js 的运行时环境进行交互。你可以在自己的 C++ 代码中包含这些头文件，并使用 Node.js 的 API 来访问 JavaScript 对象、调用 JavaScript 函数等。
2. V8 头文件：V8 是 Google 开发的 JavaScript 引擎，用于执行 JavaScript 代码。Node.js 使用 V8 作为其底层引擎。因此，Node.js 的头文件中也包含了 V8 的头文件，允许你在 C++ 插件中直接与 V8 进行交互。
3. 其他依赖库头文件：有些 Node.js 模块可能依赖于其他 C++ 库，这些库的头文件也可能会包含在压缩包中，以满足这些依赖关系。

这些头文件允许你在 C++ 环境中开发高性能的、与 Node.js 紧密集成的模块，让你可以在 Node.js 应用程序中通过 C++ 扩展实现更复杂和更快速的功能。

### node.lib

`node.lib` 是 Node.js 在 Windows 平台上的静态库文件，用于 C/C++ 编译过程中链接 Node.js 模块。在编译包含 C++ 代码的 Node.js 模块时，可能会用到这个库文件。解决缺少 `node.lib` 的错误可以通过确保正确安装 Node.js、Node.js 编译工具、使用正确的 Node.js 版本、配置系统环境变量以及重新安装项目依赖等方式。

### nodedir

nodedir 参数主要用于告诉 npm 在安装包含 C/C++ 插件的 npm 包时，C/C++ 编译工具如何找到正确的 Node.js 头文件和静态库文件。C/C++ 插件通常需要链接到 Node.js 的运行时库，并使用 Node.js 提供的头文件来与 Node.js 的运行时环境进行交互。

通过设置 nodedir 参数，你可以告诉 npm 在编译 C/C++ 插件时在指定的 Node.js 目录下查找所需的头文件和库文件，而不是从默认位置查找。
例如，在 .npmrc 文件中设置 nodedir 参数如下：

```txt
nodedir=C:\Program Files\nodejs
```

这样 npm 在安装包含 C/C++ 插件的 npm 包时会使用 C:\Program Files\nodejs 目录作为 Node.js 的根目录，然后根据该目录找到正确的头文件和库文件。

请注意，nodedir 参数在大多数情况下不需要手动设置，npm 通常会自动识别 Node.js 的安装目录。只有在特殊情况下（例如，你有多个 Node.js 版本，或者 Node.js 的安装位置不是默认路径时），你可能需要手动设置该参数。

可参考 node.js 文档 [链接到 Node.js 中包含的库](https://nodejs.cn/api/addons.html#%E9%93%BE%E6%8E%A5%E5%88%B0-nodejs-%E4%B8%AD%E5%8C%85%E5%90%AB%E7%9A%84%E5%BA%93) 章节。

## 最后

在企业内部网络隔离的 Windows 环境下进行 Node.js 开发可能会面临一些挑战。然而，经过正确配置以解决 `node-gyp` 环境报错问题后，开发者仍然能够顺利进行项目开发。

本文通过实际的实践演示，深入探讨这一过程，旨在帮助开发者克服网络限制，提升开发效率。对于那些在网络受限环境中工作的开发者，本文所提供的指导将有助于在有限的网络条件下，打造更加流畅的 Node.js 开发环境，希望能够帮助到大家。
