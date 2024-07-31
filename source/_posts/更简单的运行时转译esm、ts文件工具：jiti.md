---
title: 更简单的运行时转译esm、ts文件工具：jiti
date: 2024-07-09 09:50:29
tags:
- JavaScript
categories: JavaScript
---

> 前情提要：[前端插件只支持esm模式但是项目不支持esm导致报错？别慌@swc/register来救你！](https://juejin.cn/post/7373860534243573787)

虽然@swc/register挺好用的，但是安装依赖时还要下载一个十几MB的swc编译器，我觉得挺大的，网速慢的情况下可能要花费挺长时间。

在浏览开源项目的时候发现了一个工具叫jiti，查了一下发现npm下载量远超@swc/register，而且被很多出名项目使用，比如unbuild工具的stub模式就使用了jiti来运行时转译js、ts。

<!-- more -->

而且最重要的是这个项目是完全js写的，基本上只用到babel来进行转译，安装的时候自然就快很多了。

用到jiti的项目：

- [Docusaurus](https://docusaurus.io/)
- [FormKit](https://formkit.com/)
- [Histoire](https://histoire.dev/)
- [Knip](https://knip.dev/)
- [Nitro](https://nitro.unjs.io/)
- [Nuxt](https://nuxt.com/)
- [PostCSS loader](https://github.com/webpack-contrib/postcss-loader)
- [Rsbuild](https://rsbuild.dev/)
- [Size Limit](https://github.com/ai/size-limit)
- [Slidev](https://sli.dev/)
- [Tailwindcss](https://tailwindcss.com/)
- [Tokenami](https://github.com/tokenami/tokenami)
- [UnoCSS](https://unocss.dev/)
- [WXT](https://wxt.dev/)
- [Winglang](https://www.winglang.io/)
- [Graphql code generator](https://the-guild.dev/graphql/codegen)
- [Lingui](https://lingui.dev/)
- [Scaffdog](https://scaff.dog/)
- [...UnJS ecosystem](https://unjs.io/)
- [...58M+ npm monthly downloads](https://www.npmjs.com/package/jiti)
- [...5.5M+ public repositories](https://github.com/unjs/jiti/network/dependents)


## jiti用法

用法肯定是直接看jiti官方文档了，也就是项目的readme文档：https://github.com/unjs/jiti

如果在cjs模式的node项目里面，想直接引入esm模块：

```
// 在ESM文件导入并使用
import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url);

// 在CommonJS文件导入并使用
const { createJiti } = require("jiti");
const jiti = createJiti(__filename);
```

创建完一个jiti之后就可以去引入各种模式的js、ts文件了：

```
// jiti.import() 可以像 import() 一样引入模块
await jiti.import("./path/to/file.ts");

// jiti.esmResolve() 会像 import.meta.resolve() 一样支持额外的特性
const resolvedPath = jiti.esmResolve("./src");

// jiti() 会像 require() 一样支持 Typescript 和 (没有异步的) ESM 
jiti("./path/to/file.ts");

// jiti.resolve() 会像 require.resolve() 一样支持额外的特性
const resolvedPath = jiti.resolve("./src");
```

## 使用演示

上一篇文字我们使用了taro进行展示，这次咱们就拿uniapp来演示一下吧：

这是我fork修改的一个uniapp模板，基于uni-cli创建的项目：https://github.com/MatrixCross/Vue3-Uniapp-Starter/blob/main/vite.config.ts

我们的vite.config.ts虽然会被uni-cli编译成cjs模块去运行，但是我们在在里面引入的unocss包是不带cjs的，所以直接`import unocss from 'unocss/vite'`是会报错的。我们这时候就需要使用转译工具将esm转cjs。

方法如下：

```ts
import createJITI from 'jiti'
const jiti = createJITI(__filename) // 其实这个__filename要不要我都试过没问题，不过既然演示加了那我也加一下吧。
const unocss = jiti('unocss/vite').default
```

现在这样就能成功用上unocss辣！

## 直接运行ts文件

和@swc/register、tsx、ts-node等项目一样，jiti也提供了cli去直接运行ts：

```
npx jiti ./index.ts

# 或者

jiti ./index.ts
```