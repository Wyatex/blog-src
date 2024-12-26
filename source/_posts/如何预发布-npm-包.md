---
title: 如何预发布 npm 包
date: 2024-11-22 10:39:04
tags:
- npm
categories: npm
---

> 原文：[How to Prerelease an npm Package](https://cloudfour.com/thinks/how-to-prerelease-an-npm-package/)

最近，我们彻底修改了共享的 ESLint 配置，在测试过程中，我需要发布一个 alpha 版本。我知道这是可能的，但我完全不知道该怎么做。幸运的是，一旦你知道怎么做，这其实很简单。

<!-- more -->

## 创建预发布版本

通常，当我们提升 npm 包的版本号时，我们会使用 `npm version` 命令。这个命令会自动在 `package.json` 和 `package-lock.json` 中增加版本号，并且会用新的版本号创建一个 git 提交和 git 标签。它遵循语义化版本（SemVer）标准，即 MAJOR.MINOR.PATCH。

你可以通过指定你正在进行的发布类型来控制版本号的递增方式。假设我的 npm 包当前版本是 23.1.6。

-   `npm version major` 将 23.1.6 改为 24.0.0
-   `npm version minor` 将 23.1.6 改为 23.2.0
-   `npm version patch` 将 23.1.6 改为 23.1.7

语义化版本（SemVer）还记录了如何通过使用连字符来指定预发布版本。对于传统的预发布周期（alpha、beta，然后是生产版本），你可以直接使用 24.0.0-alpha、24.0.0-beta 和 24.0.0。然而，大多数时候你需要发布多个 alpha 和 beta 版本。你可以通过附加一个版本号来实现，比如 24.0.0-alpha.3。

`npm version` 命令以一种巧妙的方式处理这些预发布版本的创建。通过指定 `premajor`、`preminor` 或 `prepatch`，它会添加一个连字符和一个版本号。你还可以通过传递 `--preid` 选项来指定预发布的标识符（例如，“alpha”）。

-   `npm version premajor` 将 23.1.6 改为 24.0.0-0
-   `npm version premajor --preid=alpha` 将 23.1.6 改为 24.0.0-alpha.0
-   `npm version preminor --preid=alpha` 将 23.1.6 改为 23.2.0-alpha.0
-   `npm version prepatch --preid=alpha` 将 23.1.6 改为 23.1.7-alpha.0

从那时起，你可以使用命令 `npm version prerelease` 来增加预发布版本号。

-   `npm version prerelease` 将 24.0.0-alpha.0 改为 24.0.0-alpha.1
-   `npm version prerelease` 将 23.2.0-alpha.0 改为 23.2.0-alpha.1
-   `npm version prerelease` 将 23.1.7-alpha.0 改为 23.1.7-alpha.1

然后，当你准备好进行实际发布时，使用常规的 `npm version` 命令：

-   `npm version major` 将 24.0.0-alpha.1 改为 24.0.0
-   `npm version minor` 将 23.2.0-alpha.1 改为 23.2.0
-   `npm version patch` 将 23.1.7-alpha.1 改为 23.1.7

现在你知道它是如何工作的，你可以轻松创建预发布版本了！但还有一件事需要注意。

（感谢 Jason Raimondi 关于[创建预发布版本的文章](https://jasonraimondi.com/posts/use-the-npm-version-command-to-semantically-version-your-node-project/)。）

## 发布预发布版本

也许你见过一些 npm 包告诉你使用 `npm install example-package@next` 或 `npm install example-package@latest`？事实证明，npm 有标签，就像 git 一样，指向包的特定版本。

当你使用 `npm publish` 发布包的新版本时，除非你另有指定，否则新版本将获得 `latest` 标签，即使它是一个预发布版本！

这很糟糕，因为如果有人在没有指定标签的情况下安装你的包（`npm install example-package`），那么 `npm install` 将默认使用 `latest` 标签。这意味着，在这种情况下，他们会得到你的预发布版本！

这不是我们想要的，但修复很简单。在发布预发布版本时指定一个标签：`npm publish --tag next` 将正常发布你的新版本，但不会获得 `latest` 标签，而是使用 `next` 标签。

现在，当用户在没有指定标签的情况下安装你的包时，他们会得到你的最新发布版本，而不是预发布版本。额外的好处：通过使用 `next` 标签，你使测试预发布版本变得更容易，因为你的测试人员可以使用 `npm install example-package@next` 安装它，并自动获得你的预发布的最新版本！

稍后，当你准备好进行实际发布时，使用不带标签的 `npm publish` 命令，你的最终发布版本将正常获得 `latest` 标签，并可供所有用户使用。

（感谢 Mike Bostock 关于[发布预发布版本的文章](https://medium.com/@mbostock/prereleases-and-npm-e778fc5e2420)。）

## 结论

如果你记住以下步骤，预发布 npm 包是很简单的：

- 使用 `npm version premajor --preid=alpha` 创建下一个主要版本的 alpha 版本。
- 使用 `npm version prerelease` 增加 alpha 版本的版本号。
- 使用 `npm publish --tag next` 发布 alpha 版本，而不影响所有用户。
- 使用 `npm version major` 将你的 alpha 版本提升为下一个主要版本。
- 使用 `npm publish` 为所有用户发布下一个主要版本。