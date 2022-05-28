---
title: ts笔记（6）：常见TypeScript错误、开发Node.js应用
date: 2021-11-15 15:26:58
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

下面讲解项目经历的常见 TypeScript 错误汇总分析、如何使用 TypeScript 开发 Node.js 应用

<!-- more -->

# 常见 TypeScript 错误汇总分析

## 常见错误

ypeScript 错误信息由错误码和详细信息组成。其中，错误码是以“TS”开头 + 数字（一般是 4 位数字）结尾这样的格式组成的字符串，用来作为特定类型错误的专属代号。如果你想查看所有的错误信息和错误码，可以点击 [TypeScript 源码仓库](https://github.com/Microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json)。当然，随着 TypeScript 版本的更新，也会逐渐增加更多新的类型错误。

### TS2456：由于类型别名循环引用了自身造成的 TS2456 类型错误

类似函数循环调用自己，如果没有正确的终止条件，就会一直处于无限循环的状态，比如：`type T = Readonly<T>;`

当然，如果在类型别名的定义中设定了正确的终止条件，我们就可以使用循环引用的特殊数据结构，如下示例：

```ts
type JSON = string | number | boolean | null | JSON[] | { [key: string]: JSON }
const json1: JSON = 'json'
const json2: JSON = ['str', 1, true, null]
const json3: JSON = { key: 'value' }
```

> 注意：第 2 个例子只能在 TypeScript 3.7 以上的版本使用，如果版本小于 3.7 仍会提示 TS2456 错误。

### TS2554：形参和实参个数不匹配

```ts
function toString(x: number | undefined): string {
  if (x === undefined) {
    return ''
  }
  return x.toString()
}
toString() // TS2554: Expected 1 arguments, but got 0.
toString(undefined)
toString(1)
```

如果在编程的过程中函数的参数是可选的，最好使用可选参数的语法:

```ts
function toString(x?: number): string {
  if (x === undefined) {
    return ''
  }
  return x.toString()
}
function toString(x = ''): string {
  return x.toString()
}
```

值得一提的是，在 TypeScript 4.1 大版本的更新中，Promise 构造的 resolve 参数不再是默认可选的了，所以如以下示例第 2 行所示，在未指定入参的情况下，调用 resolve 会提示类型错误 （注意：为了以示区分，官方使用了 TS2794 错误码指代这个错误）。

```ts
new Promise((resolve) => {
  resolve() // TS2794: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
})
// 如果我们不需要参数，只需要给 Promise 的泛型参数传入 void 即可
new Promise<void>((resolve) => {
  resolve()
})
```

### TS1169：在接口类型定义中由于使用了非字面量或者非唯一 symbol 类型作为属性名造成

```
interface Obj {
  [key in 'id' | 'name']: any // TS1169: A computed property name in an interface must refer to an expression whose type is a literal type or a 'unique symbol' type.
}
```

因为 interface 类型的属性必须是字面量类型(string、number) 或者是 unique symbol 类型

```ts
const symbol: unique symbol = Symbol()
interface Obj {
  [key: string]: any
  [key: number]: any
  [symbol]: any
}
```

但是，在 type 关键字声明的类型别名中，我们却可以使用映射类型定义属性，如下示例：

```ts
type Obj = {
  // 定义了一个包含 id 和 name 属性的类型别名 Obj
  [key in 'id' | 'name']: any
}
```

### TS2345：在传参时由于类型不兼容造成

```ts
enum A {
  x = 'x',
  y = 'y',
  z = 'z',
}
enum B {
  x = 'x',
  y = 'y',
  z = 'z',
}
function fn(val: A) {}
fn(B.x) // TS2345: Argument of type 'B.x' is not assignable to parameter of type 'A'.
```

这是因为枚举是在运行时真正存在的对象，因此 TypeScript 并不会判断两个枚举是否可以互相兼容。此时解决这个错误的方式也很简单，我们只需要让这两个枚举类型互相兼容就行，比如使用类型断言绕过 TypeScript 的类型检查:

```ts
function fn(val: A) {}
fn(B.x as unknown as A)
```

### TS2589：由泛型实例化递归嵌套过深造成的

```ts
type RepeatX<N extends number, T extends any[] = []> = T['length'] extends N
  ? T
  : RepeatX<N, [...T, 'X']>
type T1 = RepeatX<5> // => ["X", "X", "X", "X", "X"]
// TS2589: Type instantiation is excessively deep and possibly infinite.
type T2 = RepeatX<50> // => any
```

因为 TypeScript 在处理递归类型的时候，最多实例化 50 层，如果超出了递归层数的限制，TypeScript 便不会继续实例化，并且类型会变为 top 类型 any。对于上面的错误，我们使用 @ts-ignore 注释忽略即可。

### TS2322

```ts
interface CSSProperties {
  display: 'block' | 'flex' | 'grid'
}
const style = {
  display: 'flex',
}
// TS2322: Type '{ display: string; }' is not assignable to type 'CSSProperties'.
//  Types of property 'display' are incompatible.
//   Type 'string' is not assignable to type '"block" | "flex" | "grid"'.
const cssStyle: CSSProperties = style
```

两种解决这个错误的方法

```ts
// 方法 1
const style: CSSProperties = {
  display: 'flex',
}
// 方法 2
const style = {
  display: 'flex' as 'flex',
}
// typeof style = { display: 'flex' }
```

### TS2352：

```ts
let x: string | undefined
if (x) {
  x.trim()
  setTimeout(() => {
    x.trim() // TS2532: Object is possibly 'undefined'.
  })
}
class Person {
  greet() {}
}
let person: Person | string
if (person instanceof Person) {
  person.greet()
  const innerFn = () => {
    person.greet() // TS2532: Object is possibly 'undefined'.
  }
}
```

针对这种错误的处理方式也很简单，将类型收缩的代码放入函数体内部即可，如下示例：

```ts
let x: string | undefined
setTimeout(() => {
  if (x) {
    x.trim() // OK
  }
})
class Person {
  greet() {}
}
let person: Person | undefined
const innerFn = () => {
  if (person instanceof Person) {
    person.greet() // Ok
  }
}
```

## 单元测试

自 TS 3.9 版本起，官方支持了与 @ts-ignore 注释相反功能的 @ts-expect-error 注释。使用 @ts-expect-error 注释，我们可以标记代码中应该有类型错误的部分。与 ts-ignore 不同的是，如果下一行代码中没有错误，则会提示 TS2578 的错误，如下示例：

```ts
// @ts-expect-error
const x: number = '42'
// TS2578: Unused '@ts-expect-error' directive.
// @ts-expect-error
const y: number = 42
```

> 备注：@ts-expect-error 注释命令在编写预期失败的单元测试中很有用处。

# 手把手教你使用 TypeScript 开发 Node.js 应用

## 开发 NPM 模块

在开发阶段，我们使用 ts-node 直接运行 TypeScript 源码就行。构建时，我们使用官方转译工具 tsc 将 TypeScript 源码转译为 JavaScript，并使用 TypeScript + Jest 做单元测试。

### 初始化模块

执行“npm init”命令初始化 NPM 模块。通过命令行工具或者 IDE 创建 src 目录用来存放所有的 TypeScript 源码。TypeScript 转译为 JavaScript 后，lib 目录一般不需要手动创建，因为转译工具会自动创建，此时我们只需要修改 tsconfig.json 中相应的配置即可。此外，我们还需要按照如下命令手动创建单元测试文件目录 `__tests__`。

```
mkdir src; // 创建放 TypeScript 源码的目录
touch src/cli.ts // CLI 命令入口文件
touch src/http-serve.ts // CLI 命令入口文件
mkdir lib; // 转译工具自动创建放 JavaScript 代码的目录
mkdir __tests__; // 单元测试文件目录
```

接下来我们可以按照如下命令先行安装项目需要的基本依赖。

```
npm install typescript -D;
npm install ts-node -D;
npm install jest@24 -D;
npm install ts-jest@24 -D;
npm install @types/jest -D;
```

安装完依赖后，我们需要把模块的 main/bin 等参数、start/build/test 等命令写入 package.json 中，如下代码所示：

```json
{
  ...
  "bin": "lib/bin.js",
  "main": "lib/http-serve.js",
  "files": ["lib"],
  "scripts": {
    "build": "tsc -p tsconfig.prod.json",
    "start": "ts-node src/cli.ts",
    "test": "jest --all"
  },
  ...
}
```

### 初始化 tsconfig

如果我们已经安装了全局的 TypeScript，那么就可以直接使用全局的 tsc 命令初始化。

当然，我们也可以直接使用当前模块目录下安装的 TypeScript 来初始化 tsconfig 配置。这里我推荐全局安装 npx，可以更方便地调用安装在当前目录下的各种 CLI 工具，如下代码所示：

```
tsc --init; // 使用全局

npm install npx -g; // 安装 npx
npx tsc --init; // 或者使用 npx 调用当前目录下 node_modules 目录里安装的 tsc 版本
```

此外，一般我们会把 target 参数设置为 es5，module 参数设置为 commonjs，这样转译后模块的代码和格式就可以兼容较低版本的 Node.js 了。然后，我们需要把 tsc 转译代码的目标目录 outDir 指定为 "./lib"。

除了构建行为相关的配置之外，我们还需要按照如下命令将 esModuleInterop 配置为 true，以便在类型检测层面兼容 CommonJS 和 ES 模块的引用关系，最终适用于 Node.js 开发的 tsconfig。

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "declaration": true,
    "sourceMap": true,
    "outDir": "./lib",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

下面我们需要手动创建一个 tsconfig.prod.json，告诉 tsc 在转译源码时忽略 `__tests__` 目录。当然，我们也可以根据实际情况把其他文件、目录添加到 exclude 配置中，如下代码所示：

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["__tests__", "lib"]
}
```

出于统一和可控性考虑，我们可以将通用的 tsconfig 配置抽离为单独的 NPM 或直接使用第三方封装的配置，再通过 extends 参数进行复用，比如可以安装https://www.npmjs.com/package/@tsconfig/node10等，在当前模块的 tsconfig.json 中，我们只需保留路径相关的配置即可，其他配置可以继承自 node_modules 中安装的 tsconfig 模块，如下代码所示：

```json
{
  "extends": "@tsconfig/node10",
  "compilerOptions": {
    "baseUrl": ".",
    "outDir": "./lib"
  }
}
```

接下来，我们需要使用 Node.js 内置的 http 模块和第三方 ecstatic、commander 模块实现 http-serve 静态文件服务器。

### 接口设计和编码实现

首先，我们需要安装以下相关依赖

```
npm install @types/node -D;
npm install commander -S;
npm install ecstatic -S;
```

不幸的是，ecstatic 并不是一个对 TypeScript 友好的模块，因为它没有内置类型声明文件，也没有第三方贡献的 @types/ecstatic 类型声明模块。因此，我们需要在项目根目录下新建一个 types.d.ts 用来补齐缺失的类型声明，如下代码所示：

```ts types.d.ts
declare module 'ecstatic' {
  export default (options?: {
    root?: string
    baseDir?: string
    autoIndex?: boolean
    showDir?: boolean
    showDotfiles?: boolean
    humanReadable?: boolean
    hidePermissions?: boolean
    si?: boolean
    cache?: string | number
    cors?: boolean
    gzip?: boolean
    brotli?: boolean
    defaultExt?: 'html' | (string & {})
    handleError?: boolean
    serverHeader?: boolean
    contentType?: 'application/octet-stream' | (string & {})
    weakEtags?: boolean
    weakCompare?: boolean
    handleOptionsMethod?: boolean
  }) => any
}
```

很多时候因为类型声明补全的成本较高，所以我们也可以通过一行 “declare module 'ecstatic';”快速绕过 ts(2307) 错误提示。

> 注意：在业务实践中，如果碰到某个模块缺失类型声明文件，则会提示一个 ts(2307) 的错误，此时我们可以先尝试通过 npm i @types/模块名 -D 安装可能存在的第三方补齐类型声明。如果找不到，再通过 declare module 手动补齐。

接下来，我们在 src/http-serve.ts 中实现主逻辑。

首先，我们约定模块接收的参数及需要对外暴露的接口，如下示例：

```ts
export interface IHttpServerOptions {
  /** 静态文件目录，默认是当前目录 */
  root?: string
  /** 缓存时间 */
  cache?: number
}
/** 对外暴露的方法 */
export interface IHttpServer {
  /** 启动服务 */
  listen(port: number): void
  /** 关闭服务 */
  close(): void
}
```

以上定义的接口都可以通过 export 关键字对外导出，并基于接口约定实现主逻辑类 HttpServer，如下代码所示：

```ts
export default class HttpServer implements IHttpServer {
  private server: http.Server
  constructor(options: IHttpServerOptions) {
    const root = options.root || process.cwd()
    this.server = http.createServer(
      ecstatic({
        root,
        cache: options.cache === undefined ? 3600 : options.cache,
        showDir: true,
        defaultExt: 'html',
        gzip: true,
        contentType: 'application/octet-stream',
      })
    )
  }
  public listen(port: number) {
    this.server.listen(port)
  }
  public close() {
    this.server.close()
  }
}
```

最后，为了让 TypeScript 代码可以在 ts-node 中顺利跑起来，我们可以在 src/http-serve.ts 引入模块依赖之前，显式地引入手动补齐的缺失的类型声明文件，如下代码所示：

```ts
/// <reference path="../types.d.ts" />
import http from 'http'
import ecstatic from 'ecstatic'
```

接下来，我们基于上边实现的 http-serve.ts 和 commander 模块编码实现 src/cli.ts，具体示例如下：

```ts
import { program } from 'commander'
import HttpServer, { IHttpServerOptions } from './http-serve'
program
  .option('--cache, <cache>', '设置缓存时间，秒数')
  .option('--root, <root>', '静态文件目录')
  .option('-p, --port, <port>', '监听端口', '3000')
  .action(
    (
      options: Omit<IHttpServerOptions, 'cache'> & {
        cache?: string
        port: string
      }
    ) => {
      const { root, cache, port } = options
      const server = new HttpServer({
        root,
        cache: cache && parseInt(cache),
      })
      server.listen(+port)
      console.log(`监听 ${port}`)
    }
  )
program.parse(process.argv)
```

接下来我们可以通过 npm start 直接运行 src/cli.ts 或通过 npm run build 将 TypeScript 代码转译为 JavaScript 代码，并运行 node lib/cli.js 启动静态服务，浏览器访问服务效果图如下：

## 单元测试

一个健壮的项目往往离不开充分的单元测试，接下来我们将学习如何使用 TypeScript + Jest 为 http-serve 模块编写单测。

在前面的步骤中，我们已经安装了 Jest 相关的依赖，并且配置好了 npm run test 命令，此时可以在项目的根目录下通过如下代码新建一个 jest.config.js 配置。

```js
module.exports = {
  collectCoverageFrom: ['src/**/*.{ts}'],
  setupFiles: ['<rootDir>/__tests__/setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/?(*.)(spec|test).ts'],
  testEnvironment: 'node',
  testURL: 'http://localhost:4444',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|ts|tsx)$',
  ],
  moduleNameMapper: {},
  moduleFileExtensions: ['js', 'ts'],
  globals: {
    'ts-jest': {
      tsConfig: require('path').join(process.cwd(), 'tsconfig.test.json'),
    },
  },
}
```

一般来说，运行 Node.js 端的模块转译单测代码使用的 tsconfig.test.json 配置和转译生成代码使用的 tsconfig.prod.json 配置完全一样，因此我们可以直接将 tsconfig.prod.json 复制到 tsconfig.test.json。

配置好 Jest 后，我们就可以把 http-serve 模块单元测试编入 `/_tests_/http-serve.test.ts` 中，具体示例如下（更多的 Jest 使用说明，请查看官方文档）：

```ts
import http from 'http'
import HttpServer from '../src/http-serve'
describe('http-serve', () => {
  let server: HttpServer
  beforeEach(() => {
    server = new HttpServer({})
    server.listen(8099)
  })
  afterEach(() => {
    server.close()
  })
  it('should listen port', (done) => {
    http
      .request({
        method: 'GET',
        hostname: 'localhost',
        port: 8099,
      })
      .end(() => {
        done()
      })
  })
})
```

> 注意：源码中使用的路径别名，比如用“@/module”代替“src/sub-directory/module”，这样可以缩短引用路径，这就需要我们调整相应的配置。

## 处理路径别名

首先，我们需要在 tsconfig.json 中添加如下所示 paths 配置，这样 TypeScript 就可以解析别名模块。

```json
{
  "compilerOptions": {
    ...,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/sub-directory/*"]
    },
    ...
  }
}
```

> **注意：需要显式设置 baseUrl，不然会提示一个无法解析相对路径的错误。**

接下来我们在 jest.config.js 中通过如下代码配置相应的规则，告知 Jest 如何解析别名模块。

```js
module.exports = {
  ...,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/sub-directory/$1'
  },
  ...
}
```

因为 tsc 在转译代码的时候不会把别名替换成真实的路径，所以我们引入额外的工具处理别名。此时我们可以按照如下命令安装 tsc-alias 和 tsconfig-paths 分别供 tsc 和 ts-node 处理别名。

```
npm install tsc-alias -D;
npm install tsconfig-paths -D;
```

最后，我们需要修改 package.json scripts 配置，如下代码所示：

```json
{
  ...,
  "scripts": {
    "build": "tsc -p tsconfig.prod.json && tsc-alias -p tsconfig.prod.json",
    "start": "node -r tsconfig-paths/register -r ts-node/register src/cli.ts",
    ...
  },
  ...
}
```

> 项目源码地址：[https://github.com/gogoyqj/http-serve](https://github.com/gogoyqj/http-serve)
