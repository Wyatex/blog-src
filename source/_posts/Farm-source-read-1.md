---
title: Farm源码阅读（1）
date: 2024-02-27 16:50:00
categories: 源码阅读笔记
tags:
  - Farm
  - Rust
  - 编译器
  - 笔记
---

Farm RFC：

1. [Farm 核心架构设计](https://github.com/farm-fe/rfcs/blob/9fa2c57d706e13027975233b499f5852963ea762/rfcs/001-core-architecture/rfc.zh-CN.md)
2. [Farm 运行时模块管理](https://github.com/farm-fe/rfcs/blob/9fa2c57d706e13027975233b499f5852963ea762/rfcs/002-runtime-module-management/rfc.zh-CN.md)
3. [Farm 部分打包](hhttps://github.com/farm-fe/rfcs/blob/9fa2c57d706e13027975233b499f5852963ea762/rfcs/003-partial-bundling/rfc.md)

<!-- more -->

## cli

cli基本可以看作整个项目的入口，包括dev、build。

代码位于farm仓库的[packages/cli](https://github.com/farm-fe/farm/tree/main/packages/cli)目录下。

入口代码src/index.ts：

```js
import { cac } from 'cac';
const cli = cac('farm');


// cli基本的参数
cli
  .option('-c, --config <file>', 'use specified config file')
  .option('-m, --mode <mode>', 'set env mode')
  .option('--base <path>', 'public base path')
  .option('--clearScreen', 'allow/disable clear screen when logging', {
    default: true
  });

// farm start命令的参数和start命令对应的执行逻辑
cli
  .command(
    '[root]',
    'Compile the project in dev mode and serve it with farm dev server'
  )
  .alias('start')
  .option('-l, --lazy', 'lazyCompilation')
  .option('--host <host>', 'specify host')
  .option('--port <port>', 'specify port')
  .option('--open', 'open browser on server start')
  .option('--hmr', 'enable hot module replacement')
  .option('--cors', 'enable cors')
  .option('--strictPort', 'specified port is already in use, exit with error')
  .action(
    async (
      root: string,
      options: FarmCLIServerOptions & GlobalFarmCLIOptions
    ) => {
      // ...
      // 引入@farmfe/core，并执行core提供的start方法，启动本地调试的编译环境，类似vite命令
      const { start } = await resolveCore();
      handleAsyncOperationErrors(
        start(defaultOptions),
        'Failed to start server'
      );
    }
  );

```
