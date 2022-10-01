---
title: 前端打包：tsup
date: 2022-06-13 16:42:38
tags:
  - 工具
  - TypeScript
  - 前端
  - 打包
categories: 前端
---

> 使用 tsup 的目的是为了快速的打包 TS 项目，使用 tsup 基于 esbuild 进行构建，打包 ts 文件速度是 tsc 的 100 多倍，下面的示例也基于 TS 来说明

<!-- more -->

# 建立 TS 库项目

tsup 作者编写了一个：[ts-lib-starter](https://github.com/egoist/ts-lib-starter)，可以使用该 template 创建一个自己的项目。

当然也可以自己创建一个比较纯净的 npm 项目：

```bash
# 初始化项目
pnpm init

# 安装依赖
pnpm add -D typescript tsup

# 初始化tsconfig.json
npx typescript --init
```

# 使用 tsup 打包

如果是使用 ts-lib-starter 的话，package.json 已经默认写好了 build 指令：tsup src/index.ts --format cjs,esm ，可以看到如果只是简单的进行打包甚至不需要编写配置文件，如果需要打包多入口文件只需要这样：

```bash
tsup src/index.ts src/cli.ts
```

或者 src 下的所有 ts 文件作为打包入口

```bash
tsup src/*.ts
```

出口默认是 dist 文件夹，并且默认是符合 commonJS 的 cjs 格式，只需要通过 format 参数指定即可打包出 cjs,esm,iife 格式的文件，iife 比较适合浏览器通过`<script>`标签引入，如果没这个需求通常只需要打包出 cjs 和 esm 即可。

- 这样打包出来的 js 文件并不会附带类型定义文件，如果需要带上类型定义文件只需要在打包命令加上：`--dts` 参数即可。
- 如果打包时需要清除上一次的打包需要使用：`--clean` 参数。
- 默认情况下打包 esm 会进行代码分割，但是 cjs 并不默认支持，如果需要启用 cjs 代码分割需要加上：`--splitting` 参数。

# 使用配置文件

如果配置稍微多了一些，也可以使用配置文件的方式进行打包，创建 tsup.config.ts 配置文件

```ts tsup.config.ts
import type { Options } from "tsup";

export const tsup: Options = {
  entry: ["src/*.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
};
```

# 配置 package.json

如果需要让组件库发布到 npm 源上的话，必须要配置一下 package.json，才能让别人正确的读到打包出来的 js 文件和类型定义，假设 src 目录下有 index.ts 和 test.ts 入口文件并且使用上述的配置文件进行打包，那么打包出来的文件最少应该有`index.js` `index.mjs` `index.d.ts` `test.js` `test.mjs` `test.d.ts`。

下面是笔者测试出比较符合实际使用的 package.json 配置：

```json package.jsom
{
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "*.d.ts"
  ],
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    },
    "./*": {
      "require": "./dist/*.js",
      "import": "./dist/*.mjs"
    }
  },
  "typesVersions": {
    "*": {
      ".": [
        "./dist/index.d.ts"
      ],
      "test": [
        "./dist/test.d.ts"
      ]
    }
}
```

如果是多个入口文件的话，重点在于 exports 和 typesVersions 两个配置，如果是只有一个入口则不需要配置这两项，只需要使用 main、module、types 即可。

其中 exports 字段的作用是可以通过`import xxx from 'npmpkg/test'`这样直接访问到上述配置的`./dist/test.js`，而 typesVersions 这个配置是用来配置 ts 类型检测的，笔者也试过和 exports 一样写入：`"*": ["./dist/*.d.ts"]`，但是使用星号通配会将`".": ["./dist/index.d.ts"]`覆盖，导致无法正确找到`index.d.ts`的位置。

如果使用多入口文件的话，必须要这样配置才能在项目中使用 import xxx from 'xxx/test'，否则只能 from 'xxx/dist/test' 这样导入。

如果你的目录可能有多层：

- index.ts
- test.ts
- test1
  - test1.ts

然后tsup的入口配置成`entry: ['src/**/*.ts',]`，这样打包会递归打包，打包出来的目录也会和src的目录结构一样，如果想要通过`import xxx from 'npmpkg/test1'`，这样配置文件可能就需要变成这样:
```json package.json
{
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    },
    "./test": {
      "require": "./dist/test.js",
      "import": "./dist/test.mjs"
    },
    "./test1": {
      "require": "./dist/test/index.js",
      "import": "./dist/test/index.mjs"
    }
  },
  "typesVersions": {
    "*": {
      ".": [
        "./dist/index.d.ts"
      ],
      "test": [
        "./dist/test.d.ts"
      ],
      "test1": [
        "./dist/test1/index.d.ts"
      ]
    }
}
```

> 相信你已经掌握了package.json的配置，快来试一下吧