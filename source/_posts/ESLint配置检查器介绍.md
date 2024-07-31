---
title: ESLint配置检查器介绍
date: 2024-04-09 09:45:05
tags:
- eslint
categories: JavaScript
---

> 今天晚上看托尼老师的直播提到了这个东西，感觉有点意思，就记录一下吧
> 
> 原文：[Introducing ESLint Config Inspector](https://eslint.org/blog/2024/04/eslint-config-inspector/)

这是一个帮助您理解和检查 ESLint 扁平配置文件的可视化工具。

截至 ESLint v9.0.0，[新的配置系统](https://eslint.org/blog/2023/10/flat-config-rollout-plans/)已经达到通用可用性，带来了许多好处。配置文件现在更容易管理和更透明地组合。然而，当您的配置复杂或来自多个来源时，了解哪些规则对特定文件启用和禁用仍然可能不简单。这就是为什么我们很高兴地介绍 [ESLint 配置检查器](https://github.com/eslint/config-inspector)，这是一个可视化和交互式工具，帮助您更好地理解和检查您的配置文件。

<!-- more -->

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b272a102e3194656bc400ad3a0a89dd1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2504&h=1876&s=577899&e=png&b=111929)

## 试试看

ESLint配置检查器是一个CLI命令，它启动一个本地web服务器，从本地文件系统中可视化ESLint配置文件。试一试：


```
eslint --inspect-config
```

或者，您可以在包含 eslint.config.js 文件的根目录中运行以下命令，在不安装 ESLint 的情况下运行配置检查器：

```
npx @eslint/config-inspector
```

在您的浏览器中访问 [http://localhost:7777](http://localhost:7777/) ，您将看到 ESLint 配置文件的可视化展示。然后，您可以浏览启用的规则、插件和语言配置。对本地配置文件所做的更改也将自动反映在检查器中。

## 特色

下面是ESLint配置检查器提供的一些关键特性：

### 配置项概述

在“配置”标签中，您将看到配置文件中所有配置对象的列表。当您包括外部配置或具有动态生成的配置时，这尤其有用。此功能为您提供了查看这些配置如何在您的项目中解析和增强的透明度。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a0d5635f44248f7af897bd3423f960d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2724&h=1742&s=364555&e=png&b=101828)

### Filepath匹配

在“配置”标签中，您可以输入文件路径以查看哪些规则为该特定文件启用或禁用：


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c896f7470ca4e3087a463df73a646c2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2504&h=1916&s=298339&e=png&b=121a2a)

您还可以切换视图以查看该文件的最终合并规则：


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c8462ea494764b94823b889414f35f23~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2504&h=1652&s=472313&e=png&b=101828)

### -   可用规则

转到“规则”标签以查看您已安装的插件中的所有可用规则。每个规则都显示在您的配置文件中是否启用或禁用。您还可以过滤规则以查找已弃用规则的使用情况或尚未启用的推荐规则。


![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/153e0679dc6b4b36948ded9b63d46831~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2128&h=1058&s=209965&e=png&b=111929)

## 结束语

我们希望ESLint配置检查器能让你更容易、更愉快地理解和维护ESLint配置。我们很高兴听到您对我们如何进一步改进该工具的反馈和建议。请随时[打开一个issue](https://github.com/eslint/config-inspector/issues)来分享你的想法。