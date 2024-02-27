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
      // 处理传入的参数，包括过滤重复参数、缩写参数、设置默认值...
      // 引入@farmfe/core，并执行core提供的start方法，启动本地调试的编译环境，类似vite命令
      const { start } = await resolveCore();
      handleAsyncOperationErrors( // handleAsyncOperationErrors 用来 catch 被 reject 的 promise
        start(defaultOptions), // 处理完cli参数，交给start启动编译
        'Failed to start server'
      );
    }
  );
```

可以看出主要用了cac来作为参数解析库，全部链式操作设置参数提示、回调，非常方便。

同理在下面设置一好build、watch等命令。

```js
// 代理一下process.emit方法，将node的实验提示过滤，其余的提示按原样提示
function preventExperimentalWarning() {
  const defaultEmit = process.emit;
  process.emit = function (...args: any[]) {
    if (args[1].name === 'ExperimentalWarning') {
      return undefined;
    }
    return defaultEmit.call(this, ...args);
  };
}

preventExperimentalWarning()

// 设置help命令提示
cli.help();

// 设置cli版本
cli.version(version);

//开始解析命令和参数
cli.parse();
```



