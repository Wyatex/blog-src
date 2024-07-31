---
title: 前端插件只支持esm模式但是项目不支持esm导致报错？别慌@swc/register来救你！
date: 2024-05-28 09:46:15
tags:
- JavaScript
categories: JavaScript
---

<!-- more -->

> 前情提要：前段时间在用taro+unocss写项目，发现unocss更新了，然后满怀期待的更新到最新版本，然后问题就来了（悲）

## 遇到问题

当你将unocss更新到最新之后启动，你可能会看到如下报错：


```
D:\xxx\node_modules\.pnpm\@unocss+config@0.60.2\node_modules\@unocss\config\dist\index.mjs:1
import { resolve, dirname } from 'node:path';
^^^^^^

SyntaxError: Cannot use import statement outside a module
    at Object.compileFunction (node:vm:360:18)
    at wrapSafe (node:internal/modules/cjs/loader:1124:15)
    at Module._compile (node:internal/modules/cjs/loader:1160:27)
    at Module._extensions..js (node:internal/modules/cjs/loader:1250:10)
    at Object.newLoader [as .mjs] (D:\projects\xxx\node_modules\.pnpm\pirates@4.0.6\node_modules\pirates\lib\index.js:121:7)
    at Module.load (node:internal/modules/cjs/loader:1074:32)
    at Function.Module._load (node:internal/modules/cjs/loader:909:12)
    at Module.require (node:internal/modules/cjs/loader:1098:19)
    at require (node:internal/modules/cjs/helpers:108:18)
    at Object.<anonymous> (D:\projects\xxx\node_modules\.pnpm\@unocss+webpack@0.60.2_webpack@5.91.0\node_modules\@unocss\webpack\dist\index.cjs:10:16)
D:\projects\xxx:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  xxx@0.0.1 dev:weapp: `npm run build:weapp -- --watch --env production`
Exit status 1
```

经过查看unocss的源码和commit可以得知，新版本去掉了cjs打包，而我们的taro项目还是用的cjs模式，然后尝试将package.json切换到esm模式，又出现了别的报错！（悲）

在搜索taro的issue列表没发现其他人提到之后，无奈之下只能提交issue到taro的仓库看看有没有解决办法，然后切回旧版本用着。

几天之后，收到一位小伙伴提供的解决方案（应该是taro的维护者），他提到这样去解决：


```js
// 在配置文件index.js
import { createSwcRegister, getModuleDefaultExport } from '@tarojs/helper';

const config = {
  mini: {
    webpackChain(chain) {
      createSwcRegister({
        only: [filePath => filePath.includes('@unocss')]
      });
      const UnoCSS = getModuleDefaultExport(require('@unocss/webpack'));
      chain.plugin('unocss').use(UnoCSS());
      );
    }
  },
  h5: {// 同上操作}
}

```

然后运行，神奇的运行起来了！！！

## 解决原理

本着打破砂锅问到底的精神，我想去研究一下到底大概是什么原理，我找到了@taro/helper这个包的源码，其中：


```js
//https://github.com/NervJS/taro/blob/main/packages/taro-helper/src/swcRegister.ts
export default function createSwcRegister ({ only, plugins }: ICreateSwcRegisterParam) {
  const config: Record<string, any> = {
    only: Array.from(new Set([...only])),
    jsc: {
      parser: {
        syntax: 'typescript',
        decorators: true
      },
      transform: {
        legacyDecorator: true
      }
    },
    module: {
      type: 'commonjs'
    }
  }

  if (plugins) {
    config.jsc.experimental = {
      plugins
    }
  }

  require('@swc/register')(config)
}

// https://github.com/NervJS/taro/blob/main/packages/taro-helper/src/utils.ts
export const getModuleDefaultExport = exports => exports.__esModule ? exports.default : exports
```

看起来一个函数是创建SwcRegister，另一个是判断是否esm模块再获取匿名导出。

创建SwcRegister函数的主要逻辑只是在接受一下参数和设置一下默认参数，看起来是使用ts解析器将源码转译成cjs代码，然后调用了一下@swc/register，然后我就去npm看了一下这个包是干啥的。

可以看到它的介绍：One of the ways you can use swc is through the require hook. The require hook will bind itself to node's require and automatically compile files on the fly.使用swc的一种方法是通过require钩子。require钩子将自己绑定到node的require，并自动动态编译文件。

很直白了，就是我们使用require的时候，使用swc将代码转译一下再运行。

## 再简单耍一下这个工具

为了尝试一下这个工具是不是真的能编译ts成cjs，我们创建个空白文件夹：


```
pnpm init
pnpm add @swc/register
```

创建一个ts文件：


```ts
// lib.ts
export const add = (a: number, b: number) => a + b
```

```js
const config = {
  only: [() => true], // 简单的设置成全部编译
  jsc: {
    parser: {
      syntax: 'typescript',
      decorators: true,
    },
    transform: {
      legacyDecorator: true,
    },
  },
  module: {
    type: 'commonjs',
  },
}

require('@swc/register')(config)

const { add } = require('./lib')

console.log(add(1, 2))
```

执行 `node main.js` ，命令行正常输出 `3` ！nice，完美运行！

这下妈妈再也不怕别的包支持cjs啦！