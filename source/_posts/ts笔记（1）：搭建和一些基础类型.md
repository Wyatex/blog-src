---
title: ts笔记（1）：搭建和一些基础类型
date: 2021-10-28 19:15:18
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

新系列开坑

<!-- more -->

# 搭建

## Playground

不需要安装，可以直接运行，[官方中文版](https://www.typescriptlang.org/zh/play)、[官方英文版](https://www.typescriptlang.org/play)

## 安装 TypeScript

使用 npm 或者 yarn 进行安装

```
npm i -g typescript
// 或者
yarn add -g typescript
```

安装完成后查看版本：

```
tsc -v
```

## HelloWorld

使用 `tsc --init` 命令在当前目录创建一个 `tsconfig.json` 文件。
为了学习，在配置文件里修改成如下：

```js
{
  "compilerOptions": {
    /* Strict Type-Checking Options */
    "strict": true,                           /* Enable all strict type-checking options. */
    "noImplicitAny": true,                 /* Raise error on expressions and declarations with an implied 'any' type. */
    "strictNullChecks": true,              /* Enable strict null checks. */
    "strictFunctionTypes": true,           /* Enable strict checking of function types. */
    "strictBindCallApply": true,           /* Enable strict 'bind', 'call', and 'apply' methods on functions. */
    "strictPropertyInitialization": true,  /* Enable strict checking of property initialization in classes. */
    "noImplicitThis": true,                /* Raise error on 'this' expressions with an implied 'any' type. */
    "alwaysStrict": false,                  /* Parse in strict mode and emit "use strict" for each source file. */

    "target": "esnext",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', or 'ESNEXT'. */
    "module": "esnext",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. */
  }
}
```

新建一个 HelloWorld.ts 文件：

```ts
function say(word: string) {
  console.log(word)
}
say('Hello, World')
```

在该目录执行 tsc 命令，HelloWorld.ts 会编译出一个 HelloWorld.js 文件。

> 注意：指定转译的目标文件后，tsc 将忽略当前应用路径下的 tsconfig.json 配置，因此我们需要通过显式设定如下所示的参数，让 tsc 以严格模式检测并转译 TypeScript 代码。

```
tsc HelloWorld.ts --strict --alwaysStrict false
```

同时，我们可以给 tsc 设定一个 watch 参数监听文件内容变更，实时进行类型检测和代码转译，如下代码所示：

```
tsc HelloWorld.ts --strict --alwaysStrict false --watch
```

也可以直接使用 ts-node 运行 HelloWorld.ts：

```
npm i -g ts-node
// or
yarn add -g ts-node

ts-node HelloWorld.ts // 输出：Hello, World
```

在编辑器比如 vscode 将 `'Hello, World'` 改成 1 即可看到 vscode 立刻作出提示：`error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.`，这就是类型检查带来的好处。

# 基本语法

在语法层面，缺省类型注解的 TypeScript 与 JavaScript 完全一致。比如：

```js
let num = 1
```

示例中的语法同时符合 JavaScript 语法和 TypeScript 语法。而在 ts 中可以加上类型标注：

```ts
let num: number = 1
```

> `number` 表示数字类型，`:` 用来分割变量和类型的分隔符。

同理，我们也可以把:后的 number 换成其他的类型（比如 JavaScript 原始类型：number、string、boolean、null、undefined、symbol 等）

## 原始类型

在 JavaScript 中，原始类型指的是非对象且没有方法的数据类型，它包括 string、number、bigint、boolean、undefined 和 symbol 这六种 （null 是一个伪原始类型，它在 JavaScript 中实际上是一个对象，且所有的结构化类型都是通过 null 原型链派生而来）。

### 字符串

在 JavaScript 中，我们可以使用 string 表示 JavaScript 中任意的字符串（包括模板字符串），ts 也是类似：

```ts
let firstname: string = 'Captain' // 字符串字面量
let familyname: string = String('S') // 显式类型转换
let fullname: string = `my name is ${firstname}.${familyname}` // 模板字符串
```

所有 JavaScript 支持的定义字符串的方法，我们都可以直接在 TypeScript 中使用。

### 数字

同样，可以使用 number 类型表示 JavaScript 已经支持或者即将支持的十进制整数、浮点数，以及二进制数、八进制数、十六进制数，如下：

```ts
/** 十进制整数 */
let integer: number = 6
/** 十进制整数 */
let integer2: number = Number(42)
/** 十进制浮点数 */
let decimal: number = 3.14
/** 二进制整数 */
let binary: number = 0b1010
/** 八进制整数 */
let octal: number = 0o744
/** 十六进制整数 */
let hex: number = 0xf00d
```

如果使用较少的大整数，那么我们可以使用 bigint 类型来表示，如下代码所示。

```ts
let big: bigint = 100n
```

### 布尔值

还是和 js 差不多

```ts
/** TypeScript 真香 为 真 */
let TypeScriptIsGreat: boolean = true
/** TypeScript 太糟糕了 为 否 */
let TypeScriptIsBad: boolean = false
```

### Symbol

自 ECMAScript 6 起，TypeScript 开始支持新的 Symbol 原始类型， 即我们可以通过 Symbol 构造函数，创建一个独一无二的标记

```ts
let sym1: symbol = Symbol()
let sym2: symbol = Symbol('42')
```

> TypeScript 还包含 Number、String、Boolean、Symbol 等类型（注意区分大小写），和小写格式对应的 number、string、boolean、symbol 并不一样。

## 类型推导

在变量声明的同时进行定义，ts 可以为我们进行类型推导：

```ts
let num = 1
// 等价于
let num: number = 1

num = 'Hello' // 报错：TS2322: Type 'string' is not assignable to type 'number'.
```

# 复杂基础类型

## 数组

因为 TypeScript 的数组和元组转译为 JavaScript 后都是数组，所以这里我们把数组和元组这两个类型整合到一起介绍。

数组类型（Array）：在 TypeScript 中，我们也可以像 JavaScript 一样定义数组类型，并且指定数组元素的类型

```ts
/** 子元素是数字类型的数组 */
let arrayOfNumber: number[] = [1, 2, 3]
/** 子元素是字符串类型的数组 */
let arrayOfString: string[] = ['x', 'y', 'z']
```

同样，我们也可以使用 Array 泛型定义数组类型:

```ts
/** 子元素是数字类型的数组 */
let arrayOfNumber: Array<number> = [1, 2, 3]
/** 子元素是字符串类型的数组 */
let arrayOfString: Array<string> = ['x', 'y', 'z']
```

> 这里更推荐使用`[]`的方式

元组类型（Tuple）：元组最重要的特性是可以限制数组元素的个数和类型，它特别适合用来实现多值返回。

```ts
let myTuple: [number, string] = [1, 'hello']

// 如果不使用类型标注的话，会变成另外一种类型

let myTuple1 = [1, 'hello']
// 等价于 let myTuple: (string | number)[]
```

## 特殊类型

### any

在使用 any 之前要知道，**Any is Hell（Any 是地狱）**，它会使类型检查失效。

```ts
let anything: any = 1
anything.doAnything() //不会提示错误
anything = 'hello' //不会提示错误
let num: number = anything //不会提示错误
```

从长远来看，使用 any 绝对是一个坏习惯。如果一个 TypeScript 应用中充满了 any，此时静态类型检测基本起不到任何作用，也就是说与直接使用 JavaScript 没有任何区别。

### unknown

unknown 是 TypeScript 3.0 中添加的一个类型，它主要用来描述类型并不确定的变量，它可以接收多种返回值，但是它只能赋值给 unknown 和 any。

```ts
let result: unknown
if (x) {
  result = x()
} else if (y) {
  result = y()
} // ...

let result: unknown
let num: number = result // 提示 ts(2322)
let anything: any = result // 不会提示错误
```

使用 unknown 后，TypeScript 会对它做类型检测。但是，如果不缩小类型（Type Narrowing），我们对 unknown 执行的任何操作都会出现如下所示错误：

```ts
let result: unknown
result.toFixed() // 提示 ts(2571)
```

而所有的类型缩小手段对 unknown 都有效

```ts
let result: unknown
if (typeof result === 'number') {
  result.toFixed() // 此处 hover result 提示类型是 number，不会提示错误
}
```

### void、undefined、null

**void 类型**：它仅适用于表示没有返回值的函数。即如果该函数没有返回值，那它的类型就是 void。

undefined 和 void 是 ts 中值于类型同名的例外。但是在 ts 中实际上并没有啥作用。undefined 的最大价值主要体现在接口类型上，它表示一个可缺省、未定义的属性。

> 我们可以把 undefined 值或类型是 undefined 的变量赋值给 void 类型变量，反过来，类型是 void 但值是 undefined 的变量不能赋值给 undefined 类型。

不建议随意使用非空断言来排除值可能为 null 或 undefined 的情况，因为这样很不安全：

```ts
userInfo.id!.toFixed() // ok，但不建议
userInfo.name!.toLowerCase() // ok，但不建议

// 推荐做法
userInfo.id?.toFixed() // Optional Chain
const myName = userInfo.name ?? `my name is ${info.name}` // 空值合并
```

### never

never 表示永远不会发生值的类型。

```ts
function ThrowError(msg: string): never {
  throw Error(msg)
}

function InfiniteLoop(): never {
  while (true) {}
}
```

never 是所有类型的子类型，它可以给所有类型赋值:

```ts
let Unreachable: never = 1 // ts(2322)
Unreachable = 'string' // ts(2322)
Unreachable = true // ts(2322)
let num: number = Unreachable // ok
let str: string = Unreachable // ok
let bool: boolean = Unreachable // ok
```

### object

object 类型表示非原始类型的类型，即非  number、string、boolean、bigint、symbol、null、undefined 的类型。然而这个类型并没有什么作用，用起来会有种 any 的感觉。

```ts
declare function create(o: object | null): any
create({}) // ok
create(() => null) // ok
create(2) // ts(2345)
create('string') // ts(2345)
```

# 类型断言（Type Assertion）

TypeScript 类型检测无法做到绝对智能，毕竟程序不能像人一样思考。有时会碰到我们比 TypeScript 更清楚实际类型的情况，比如下面的例子：

```ts
const arrayNumber: number[] = [1, 2, 3, 4]

const greaterThan2: number = arrayNumber.find((num) => num > 2) // 提示 ts(2322)
```

单纯看代码可以看到是有大于 2 的数的，但静态类型对运行时的逻辑无能为力，因为 greaterThan2 有可能是 undefined。

不过，我们可以使用一种笃定的方式——类型断言（类似仅作用在类型层面的强制类型转换）告诉 TypeScript 按照我们的方式做类型检查。比如，我们可以使用 as 语法做类型断言：

```ts
const arrayNumber: number[] = [1, 2, 3, 4]
const greaterThan2: number = arrayNumber.find((num) => num > 2) as number
```

又或者是使用尖括号 + 类型的格式做类型断言，如下:

```ts
const arrayNumber: number[] = [1, 2, 3, 4]
const greaterThan2: number = <number>arrayNumber.find((num) => num > 2)
```

以上两种方式虽然没有任何区别，但是尖括号格式会与 JSX 产生语法冲突，因此更推荐使用 as 语法。

另外，any 和 unknown 这两个特殊类型属于万金油，因为它们既可以被断言成任何类型，反过来任何类型也都可以被断言成 any 或 unknown。因此，如果我们想强行“指鹿为马”，就可以先把“鹿”断言为 any 或 unknown，然后再把 any 和 unknown 断言为“马”，比如鹿 as any as 马。

> 我们除了可以把特定类型断言成符合约束添加的其他类型之外，还可以使用“字面量值 + as const”语法结构进行常量断言，具体示例如下所示：

```ts
/** str 类型是 'str' */
let str = 'str' as const
/** readOnlyArr 类型是 'readonly [0, 1]' */
const readOnlyArr = [0, 1] as const
```

不过断言之后这个 str 就是`'str'`类型了。

此外还有一种特殊非空断言，即在值（变量、属性）的后边添加 '!' 断言操作符，它可以用来排除值为 null、undefined 的情况，具体示例如下：

```ts
let mayNullOrUndefinedOrString: null | undefined | string
mayNullOrUndefinedOrString!.toString() // ok
mayNullOrUndefinedOrString.toString() // ts(2531)
```

> 对于非空断言来说，我们同样应该把它视作和 any 一样危险的选择。在复杂应用场景中，如果我们使用非空断言，就无法保证之前一定非空的值，比如页面中一定存在 id 为 feedback 的元素，数组中一定有满足 > 2 条件的数字，这些都不会被其他人改变。而一旦保证被改变，错误只会在运行环境中抛出，而静态类型检测是发现不了这些错误的。

所以，建议使用类型守卫来代替非空断言，比如如下所示的条件判断：

```ts
let mayNullOrUndefinedOrString: null | undefined | string
if (typeof mayNullOrUndefinedOrString === 'string') {
  mayNullOrUndefinedOrString.toString() // ok
}
```

# 类型推断

在 TypeScript 中，类型标注声明是在变量之后（即类型后置），它不像 Java 语言一样，先声明变量的类型，再声明变量的名称。

使用类型标注后置的好处是编译器可以通过代码所在的上下文推导其对应的类型，无须再声明变量类型，具体示例如下：

```ts
{
  let x1 = 42 // 推断出 x1 的类型是 number
  let x2: number = x1 // ok
  let x3 = x2 // 推断出 x3 的类型是 number
}
```

## 上下文推断

在某些特定的情况下，我们也可以通过变量所在的上下文环境推断变量的类型：

```ts
type Adder = (a: number, b: number) => number
const add: Adder = (a, b) => {
  return a + b
}
const x1 = add(1, 1) // 推断出 x1 类型是 number
const x2 = add(1, '1') // ts(2345) Argument of type '"1"' is not assignable to parameter of type 'number'
```

# 字面量类型

在 TypeScript 中，字面量不仅可以表示值，还可以表示类型，即所谓的字面量类型。

目前，TypeScript 支持 3 种字面量类型：字符串字面量类型、数字字面量类型、布尔字面量类型，对应的字符串字面量、数字字面量、布尔字面量分别拥有与其值一样的字面量类型，如下：

```ts
{
  let specifiedStr: 'this is string' = 'this is string'
  let specifiedNum: 1 = 1
  let specifiedBoolean: true = true
}
```

字面量类型是集合类型的子类型，它是集合类型的一种更具体的表达。比如 'abc'类型是 string 类型的子类型。数字 1 是数字类型 number 的子类型。

## 字符串字面量类型

一般来说，我们可以使用一个字符串字面量类型作为变量的类型，如下所示：

```ts
let hello: 'hello' = 'hello'
hello = 'hi' // ts(2322) Type '"hi"' is not assignable to type '"hello"'
```

实际上，定义单个的字面量类型并没有太大的用处，它真正的应用场景是可以把多个字面量类型组合成一个联合类型，用来描述拥有明确成员的实用的集合，比如：

```ts
type Direction = 'up' | 'down'
function move(dir: Direction) {
  // ...
}
move('up') // ok
move('right') // ts(2345) Argument of type '"right"' is not assignable to parameter of type 'Direction'
```

## Literal Widening / 字面量类型拓宽

所有通过 let 或 var 定义的变量、函数的形参、对象的非只读属性，如果满足指定了初始值且未显式添加类型注解的条件，那么它们推断出来的类型就是指定的初始值字面量类型拓宽后的类型，这就是字面量类型拓宽。

```ts
{
  let str = 'this is string' // 类型是 string
  let strFun = (str = 'this is string') => str // 类型是 (str?: string) => string;
  const specifiedStr = 'this is string' // 类型是 'this is string'
  let str2 = specifiedStr // 类型是 'string'
  let strFun2 = (str = specifiedStr) => str // 类型是 (str?: string) => string;
}
```

> 基于字面量类型拓宽的条件，我们可以通过如下所示代码添加显示类型注解控制类型拓宽行为。

```ts
{
  const specifiedStr: 'this is string' = 'this is string' // 类型是 '"this is string"'
  let str2 = specifiedStr // 即便使用 let 定义，类型是 'this is string'
}
```

## Type Widening / 类型拓宽

比如对 null 和 undefined 的类型进行拓宽，通过 let、var 定义的变量如果满足未显式声明类型注解且被赋予了 null 或 undefined 值，则推断出这些变量的类型是 any：

```ts
{
  let x = null // 类型拓宽成 any
  let y = undefined // 类型拓宽成 any
  /** -----分界线------- */
  const z = null // 类型是 null
  /** -----分界线------- */
  let anyFun = (param = null) => param // 类型是 (param?: null) => null
  let z2 = z // 类型是 null
  let x2 = x // 类型是 null
  let y2 = y // 类型是 undefined
}
```

> 示例第 7~10 行的类型推断行为因为开启了 strictNullChecks=true

## Type Narrowing / 类型缩小

在 TypeScript 中，我们可以通过某些操作将变量的类型由一个较为宽泛的集合缩小到相对较小、较明确的集合，这就是 "Type Narrowing"。

比如，我们可以使用类型守卫将函数参数的类型从 any 缩小到明确的类型，具体示例如下：

```ts
{
  let func = (anything: any) => {
    if (typeof anything === 'string') {
      return anything // 类型是 string
    } else if (typeof anything === 'number') {
      return anything // 类型是 number
    }
    return null
  }
}
```

当然，我们也可以通过字面量类型等值判断（===）或其他控制流语句（包括但不限于 if、三目运算符、switch 分支）将联合类型收敛为更具体的类型，如下代码所示：

```ts
{
  type Goods = 'pen' | 'pencil' | 'ruler'
  const getPenCost = (item: 'pen') => 2
  const getPencilCost = (item: 'pencil') => 4
  const getRulerCost = (item: 'ruler') => 6
  const getCost = (item: Goods) => {
    if (item === 'pen') {
      return getPenCost(item) // item => 'pen'
    } else if (item === 'pencil') {
      return getPencilCost(item) // item => 'pencil'
    } else {
      return getRulerCost(item) // item => 'ruler'
    }
  }
}

{
  const getCost = (item: Goods) => {
    if (item === 'pen') {
      item // item => 'pen'
    } else {
      item // => 'pencil' | 'ruler'
    }
  }
}
```
