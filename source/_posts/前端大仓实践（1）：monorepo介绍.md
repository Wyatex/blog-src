---
title: 前端大仓实践（1）：monorepo介绍
date: 2022-06-18 09:48:34
tags:
  - monorepo
  - 前端
categories: 前端
---

# 什么是 MONOREPO

monorepo 是一个包含较小项目的项目 - 而每个项目可以是从单个应用程序到可重用包（例如函数，组件）的任何内容。合并项目的做法可以追溯到 2000 年初，当时它被称为共享代码库。

monorepo 的名字源于 mono（单个）和 repo（存储库）这两个词。虽然前者是不言自明的，但后者来自版本控制系统（例如 git），其中 project：存储库以 n：n 关系（polyrepo）或 n：1 关系（monorepo）托管。

通常，monorepo 被误认为是 monolith。但是，在整体式应用程序中，所有较小的项目都合并到一个大项目中。相比之下，monorepo 可以将其较小的项目合并到多个项目中。

<!-- more -->

{% asset_img 1.webp %}

# 为什么使用 MONOREPO

对于大规模代码库，使用 monorepo 有两个主要优点。首先，共享包可以在没有联机注册表的本地计算机上的多个应用程序中使用（例如 npm）。开发人员体验在这里得到了极大的改善，因为所有内容都位于同一代码库中，而无需通过第三方更新依赖项。当共享包更新时，它会立即反映在依赖于它的所有应用程序中。

其次，它改善了代码库之间的协作。处理不同项目的团队可以改进其他团队的代码库，而无需处理多个存储库。它还提高了可访问性而不必担心不同的设置，并且为跨团队引入了更灵活的源代码所有权。另一个好处是能跨许多项目进行代码重构。

# MONOREPO 的结构

monorepo 可以包含多个应用（apps），而每个应用都可以访问共享的包。这是一个非常常见的单存储库结构：

```
- apps/
--- app-one
--- app-two
- packages/
--- package-one
--- package-two
--- package-three
```

一个包，它只是一个文件夹，可以是任何东西，从 UI 组件（例如框架特定的组件）到函数（例如实用程序）到配置（例如 ESLint，TypeScript）：

```
- apps/
--- app-one
--- app-two
- packages/
--- ui
--- utilities
--- eslint-config
--- ts-config
```

一个包可以是另一个包的依赖项。例如，ui  包可能使用 utilities 包中的函数，因此  ui  包依赖于 utilities 包。ui  和 utilities 包都可以使用其他  \*-config  包中的配置。

这些 apps 通常不相互依赖，而是仅选择加入 packages。如果包相互依赖，monorepo 管道（请参阅  Monorepo 工具）可以强制实施“仅当 utilities 生成成功完成时才开始  ui  生成”等方案。

{% asset_img 2.webp %}
