---
title: GitLab 保护分支深入使用
tags:
  - GitLab
  - 分支保护
categories: 其他
abbrlink: 60434
date: 2019-12-05 10:11:12
---

## 问题

```bash
git push origin master:master -f ## remote: GitLab: You are not allowed to force push code to a protected branch on this project.
```

`GitLab: You are not allowed to force push code to a protected branch on this project.` 表示 gitlab 不允许你`强制`推送代码到被保护的分支

## 官方说明

> By default, a protected branch does four simple things:

- it prevents its creation, if not already created, from everybody except userswith Master permission
- it prevents pushes from everybody except users with Master permission
- it prevents anyone from force pushing to the branch
- it prevents anyone from deleting the branch

## 解释说明

开发者虽然具有 Master 权限,有权限能够把代码推送到被保护分支，但是被保护的分支不允许`强制推送`，也不允许`删除`分支.

正确的处理逻辑应该是：优先 `git pull` 拉取远程分支最新代码，然后再将本地代码与拉取代码做合并（有冲突则解决），然后再 `git push` 推送上去。

部分特殊场景：对于平台类型的自动化操作，可能我们会提供叫做`强制推送`的功能。因为平台上代码冲突是无法自动化解决，如果因为某一些特殊操作而导致了平台端代码异常，则需要允许开启强制推送功能。所以我们针对这类问题，也应该有解决方案，具体如下。

## 解决方法

暴力操作三步骤

1. 取消分支保护
2. 代码强制推送到远程
3. 重新分支保护

分支保护可直接调用 gitlab 服务 api 接口进行操作修改，代码参考如下：

```javascript
/**
 * 底层调用 GIT 接口
 * @param gitServer git服务
 * @param type 请求类型
 * @param url 请求地址
 * @param resolveFullResponse 是否返回完整response对象
 */
export async function gitAPI(
  gitServer,
  type,
  url,
  resolveFullResponse = false
) {
  var _include_Response = function (body, response) {
    if (resolveFullResponse) {
      return response;
    }
    return body;
  };
  return await request[type](
    `http://${gitServer}/api/v4/${url}${
      url.indexOf("?") >= 0 ? "&" : "?"
    }private_token=${configs.gitAuthServers[gitServer]}`,
    {
      json: true,
      transform: _include_Response,
    }
  );
}

/** 分支保护 */
export async function protectBranch(gitServer, gitProject, branchName) {
  return await gitAPI(
    gitServer,
    "put",
    `projects/${gitProject.id}/repository/branches/${branchName}/protect`
  );
}

/** 取消分支保护 */
export async function unprotectBranch(gitServer, gitProject, branchName) {
  return await gitAPI(
    gitServer,
    "put",
    `projects/${gitProject.id}/repository/branches/${branchName}/unprotect`
  );
}
```

## 最后

一般而言 `--force` 强制推送是比较危险的操作，但是在开发基础服务或工程化平台时必须具备这类强制推送能力，而不是登录远程服务去手动解决问题，那样只会更越权操作，容易产生难以预料的问题。同样的，应该还有更多合理的方式来规避此类问题，可以做更多的深入研究。感谢大佬们阅读到此，不足之处请多多包涵。
