---
title: TypeScript黑魔法教学（1）：前置知识
date: 2023-04-20 09:22:12
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

在学习 TS 黑魔法（类型体操），建议先把[前面的 TS 基础知识](/categories/TypeScript/)学好了，再来看进阶用法。

另外，即使已经进阶到高级选手了：**不要滥用工具类型，对外暴露的 API，应该尽量多手动标注函数返回值类型。契约高于实现。**

<!-- more -->

## 基础

### 类型关系

{% asset_img type-rel.png %}

一图展示顶部类型、底部类型。

类型之间的并集（|）会向上取顶部的类型。即 `never | 'a' => 'a'`，`unkown | 'a' => unknown`

类型之间的交集（&）会向下取底部的类型。即 never & 'a' = never，unkown & 'a' => 'a'

- bottom Type: never
- top type: unknown
- 既是 top 也是 bottom: any

### never

是其他任意类型的子类型的类型被称为底部类型(bottom type)。

**在 TypeScript 中，never 类型便为空类型和底部类型。never 类型的变量无法被赋值，与其他类型求交集为自身，求并集不参与运算。**

#### 应用一: 联合类型中的过滤

never 在联合类型中会被过滤掉：

```ts
type Exclude<T, U> = T extends U ? never : T

// 相当于: type A = 'a'
type A = Exclude<'x' | 'a', 'x' | 'y' | 'z'>

T | never // 结果为T
T & never // 结果为never
```

取一个映射类型中所有 value 为指定类型的 key。例如，已知某个 React 组件的 props 类型，我需要“知道”（编程意义上）哪些参数是 function 类型。

```ts
interface SomeProps {
  a: string
  b: number
  c: (e: MouseEvent) => void
  d: (e: TouchEvent) => void
}
// 如何得到 'c' | 'd' ？

type GetKeyByValueType<T, Condition> = {
  [K in keyof T]: T[K] extends Condition ? K : never
}[keyof T]

type FunctionPropNames = GetKeyByValueType<SomeProps, Function> // 'c' | 'd'
```

运算过程如下：

```ts
// 第一步，条件映射: type GetKeyByValueType<T, Condition> = {[K in keyof T]: T[K] extends Condition ? K : never}
{
  a: never
  b: never
  c: 'c'
  d: 'd'
}
// 第二步，索引取值 {[K in keyof T]: T[K] extends Condition ? K : never}[keyof T]
type result = never | never | 'c' | 'd'
// 根据never的性质得到：
'c' | 'd'
```

#### 应用二：防御性编程

举个具体点的例子，当你有一个 union type:

```ts
interface Foo {
  type: 'foo'
}
interface Bar {
  type: 'bar'
}
type All = Foo | Bar
```

在 switch 当中判断 type，TS 是可以收窄类型的 (discriminated union)：

```ts
function handleValue(val: All) {
  switch (val.type) {
    case 'foo':
      // 这里 val 被收窄为 Foo
      const foo = val
      break
    case 'bar':
      // val 在这里是 Bar
      const bar = val
      break
    default:
      // val 在这里是 never
      const exhaustiveCheck: never = val
      break
  }
}
```

注意在 default 里面我们把被收窄为 never 的 val 赋值给一个显式声明为 never 的变量。如果一切逻辑正确，那么这里应该能够编译通过。但是假如后来有一天你的同事改了 All 的类型：`type All = Foo | Bar | Baz`

然而他忘记了在 handleValue 里面加上针对 Baz 的处理逻辑，这个时候在 default branch 里面 val 会被收窄为 Baz，导致无法赋值给 never，产生一个编译错误。所以通过这个办法，你可以确保 handleValue 总是穷尽 (exhaust) 了所有 All 的可能类型。

### unknown

unknown 指的是不可预先定义的类型，在很多场景下，它可以替代 any 的功能同时保留静态检查的能力。

```ts
const num: number = 10
;(num as unknown as string).split('') // 注意，这里和any一样完全可以通过静态检查
```

这个时候 unknown 的作用就跟 any 高度类似了，你可以把它转化成任何类型，不同的地方是，在静态编译的时候，unknown 不能调用任何方法，而 any 可以。

```ts
const foo: unknown = 'string'
foo.substr(1) // Error: 静态检查不通过报错
const bar: any = 10
bar.substr(1)
```

unknown 的一个使用场景是，避免使用 any 作为函数的参数类型而导致的静态类型检查 bug：

```ts
function test(input: unknown): number {
  if (Array.isArray(input)) {
    return input.length // Pass: 这个代码块中，类型守卫已经将input识别为array类型
  }
  return input.length // Error: 这里的input还是unknown类型，静态检查报错。如果入参是any，则会放弃检查直接成功，带来报错风险
}
```

### 联合类型

用 infer 合并类型

```ts
type A<T> = T extends { a: infer U; b: infer U } ? U : any
type Foo = A<{ a: number; b: string }> // type Foo = string | number
```

### 重载签名的类型不会合并

```ts
// 重载签名（函数类型定义）
function toString(x: string): string
function toString(x: number): string

// 实现签名（函数体具体实现）
function toString(x: string | number) {
  return String(x)
}

function stringOrNumber(x): string | number {
  return x ? '' : 0
}

// input 是 string 和 number 的联合类型
// 即 string | number
const input = stringOrNumber(1)

toString('hello') // ok
toString(2) // ok
toString(input) // error
```

链式的函数可以在返回函数中再添加范型

```ts
type Join<
  T extends string[],
  U extends string,
  Acc extends string = ''
> = T extends [infer First extends string, ...infer Rest extends string[]]
  ? Rest extends []
    ? `${Acc}${First}`
    : Join<Rest, U, `${Acc}${First}${U}`>
  : Acc

declare function join<T extends string>(
  delimiter: T
): <S extends string[]>(...parts: S) => Join<S, T>

declare const hyphenJoiner = join('-')
declare const result = hyphenJoiner('a', 'b', 'c') // = 'a-b-c'
join('#')('a', 'b', 'c') // = 'a#b#c'
```

### 泛型

除了传入的范型，还可以利用传入的范型组合新的范型，就类似像是对一个处理函数，利用函数参数的运算，组合了一个新的在函数作用域内的变量。

举例：Overwrite<T, U>从 U 中的同名属性的类型覆盖 T 中的同名属性类型。(后者中的同名属性覆盖前者)

```ts
/**
 * Overwrite实现
 * 获取前者独有的key和类型，再取两者共有的key和该key在后者中的类型，最后合并。
 */
// 从T中提取存在于U中的key和对应的类型(取交集)
type Intersection<T extends object, U extends object> = Pick<
  T,
  Extract<keyof T, keyof U> & Extract<keyof U, keyof T>
>

// 从T中排除存在于U中的key和类型
type Diff<T extends object, U extends object> = Pick<
  T,
  Exclude<keyof T, keyof U>
>

type Overwrite<
  T extends object,
  U extends object,
  I = Diff<T, U> & Intersection<U, T>
> = Pick<I, keyof I>

/**
 * @example
 * type Eg = { key1: string; other: boolean }
 */
type Eg = Overwrite<{ key1: number; other: boolean }, { key1: string }>

// 过程
type a = Intersection<{ key1: string }, { key1: number; other: boolean }> // {key1: string}
type b = Diff<{ key1: number; other: boolean }, { key1: string }> // {other: boolean}
type c = keyof (a & b) // 'key1' | 'other'
type d = Pick<a & b, c> // { key1: string; other: boolean }
```

过程 d 是将 a 和 b 的合并接口类型转成一个普通的对象类型。

### extends 条件语句

extends 用法和 infer 用法可以看：[官方工具类、打造自己的工具类型](/TypeScript/ts笔记（5）：官方工具类、打造自己的工具类型/)

### 递归

数组和字符串都有自己的递归方法。详细可查阅文档。

#### 数组

```ts
type LoopArr<T extends any[]> = T extends [infer P, ...infer R]
  ? // can do something with P
    [P, ...LoopArr<R>]
  : []
```

_该 example 没有任何实际意义，仅仅展示一下递归的方式_

如果没有指定特定的子序列，P 是每次都是数组的第一项，达到逐项遍历，你也可以给指定一个子序列，从某一部分开始遍历，譬如 T extends [ 2, 3 , infer P, ...infer R]

#### 字符串

```ts
type LoopStr<T extends string> = T extends `${infer P}${infer R}`
  ? // can do something with P
    `${P}${LoopStr<R>}`
  : ''
```

_该 example 没有任何实际意义，仅仅展示一下递归的方式_

如果没有指定特定的子字符序列，P 是每次都是字符串中的第一个字符，达到逐项遍历，你也可以给指定一个子序列，从某一部分开始遍历，譬如 T extends `ABC${infer P}${infer R}`

### 好用的小特性

#### name

如果你打算通过构造函数以外的其他方式去初始化类中的字段 (例如，也许外部库一定会帮你填充类的一部分)，则可以使用 确定赋值断言运算符 !，它只能被用在你确定安全的地方

```ts
class OKGreeter {
  // Not initialized, but no error
  name!: string
}
```

#### Type-only Field Declarations

当配置文件里的 `useDefineForClassFields` 是 true 时, 类字段在父类构造函数完成后初始化，覆盖父类设置的任何值。当您只想为继承的字段重新声明更准确的类型时，这可能是一个问题。要处理这些情况，你可以写 声明 向 TypeScript 指示此字段声明不应有运行时效果。

```ts
interface Animal {
  dateOfBirth: any
}

interface Dog extends Animal {
  breed: any
}

class AnimalHouse {
  resident: Animal
  constructor(animal: Animal) {
    this.resident = animal
  }
}

class DogHouse extends AnimalHouse {
  // Does not emit JavaScript code,
  // only ensures the types are correct
  declare resident: Dog
  constructor(dog: Dog) {
    super(dog)
  }
}
```

#### 类型谓词 is

可以看[类型守卫、类型兼容、增强类型系统](/TypeScript/ts笔记（4）：类型守卫、类型兼容、增强类型系统/#自定义类型守卫)

通常我们使用 is 关键字（类型谓词）在函数的返回值中，从而对于函数传入的参数进行类型保护。

## interface 和 type 关键字

interface 和 type 两个关键字因为其功能比较接近，常常引起新手的疑问：应该在什么时候用 type，什么时候用 interface？interface 的特点如下：

- 同名 interface 自动聚合，也可以和已有的同名 class 聚合，适合做 polyfill
- 自身只能表示 object/class/function 的类型

建议库的开发者所提供的公共 api 应该尽量用 interface/class，方便使用者自行扩展。举个例子，monaco 缺失了一些需要的 API，所以需要手动 polyfill 一下。

```ts
/**
 * Cloud Studio使用的monaco版本较老0.14.3，和官方文档相比缺失部分功能
 * 另外vscode有一些特有的功能，必须适配
 * 故在这里手动实现作为补充
 */
declare module monaco {
  interface Position {
    delta(deltaLineNumber?: number, deltaColumn?: number): Position
  }
}

// monaco 0.15.5
monaco.Position.prototype.delta = function (
  this: monaco.Position,
  deltaLineNumber = 0,
  deltaColumn = 0
) {
  return new monaco.Position(
    this.lineNumber + deltaLineNumber,
    this.column + deltaColumn
  )
}
```

与 interface 相比，type 的特点如下：

- 表达功能更强大，不局限于 object/class/function
- 要扩展已有 type 需要创建新 type，不可以重名
- 支持更复杂的类型操作

基本上所有用 interface 表达的类型都有其等价的 type 表达。但在实践的过程中，也发现了一种类型只能用 interface 表达，无法用 type 表达，那就是往函数上挂载属性。

```ts
interface FuncWithAttachment {
    (param: string): boolean;
    someProperty: number;
}

const testFunc: FuncWithAttachment = ...;
const result = testFunc('mike');    // 有类型提醒
testFunc.someProperty = 3;    // 有类型提醒
```

区别表：

{% asset_img interface-type.png %}

## 反直觉的一些特性

### 数组是对象的一种

```ts
// Ts 示例：希望 [1, () => number, string] 能够被处理成 [1, number, string]
// 对象遍历的方式
type GetType1<T extends any[]> = {
  [K in keyof T]: T[K] extends () => infer R ? R : T[K]
}

type GetType1Test = GetType1<[1, () => number, string]>
```

数组是 key 为 0，1，2 等数字索引的特殊对象，都可以用映射类型的 in 遍历

### keyof 索引是公有属性 key 的联合

```ts
interface Eg1 {
  name: string
  readonly age: number
}
// T1的类型实则是name | age
type T1 = keyof Eg1

class Eg2 {
  private name: string
  public readonly age: number
  protected home: string
}
// T2实则被约束为 age
// 而name和home不是公有属性，所以不能被keyof获取到
type T2 = keyof Eg2
```

索引访问：

```ts
interface Eg1 {
  name: string
  readonly age: number
}
// string
type V1 = Eg1['name']
// string | number
type V2 = Eg1['name' | 'age']
// any
type V2 = Eg1['name' | 'age2222']
// string | number
type V3 = Eg1[keyof Eg1]
```

**如果 [] 中的 key 有不存在 T 中的，则是 any；**

交叉类型取的多个类型的并集，但是如果相同 key 但是类型不同，则该 key 为 never。

### 条件类型的分布式特性

```ts
// type A1 = 1
type A1 = 'x' extends 'x' ? 1 : 2

// type A2 = 2
type A2 = 'x' | 'y' extends 'x' ? 1 : 2

// type A3 = 1 | 2
type P<T> = T extends 'x' ? 1 : 2
type A3 = P<'x' | 'y'>
```

为什么 A2 和 A3 的值不一样？

- 如果用于简单的条件判断，则是直接判断前面的类型是否可分配给后面的类型
- 若 extends 前面的类型是泛型，且泛型传入的是联合类型时，则会依次判断该联合类型的所有子类型是否可分配给 extends 后面的类型（是一个分发的过程）。

总结，就是 extends 前面的参数为联合类型时则会分解（依次遍历所有的子类型进行条件判断）联合类型进行判断。然后将最终的结果组成新的联合类型。

如果不想被分解（分发），做法也很简单，可以通过简单的元组类型包裹以下：

```ts
type P<T> = [T] extends ['x'] ? 1 : 2
// type A4 = 2;
type A4 = P<'x' | 'y'>
```

### 对象字面量的 excess property check

子类型中必须包含源类型所有的属性和方法:

```ts
function getPointX(point: { x: number }) {
  return point.x
}

const point = {
  x: 1,
  y: '2',
}

getPointX(point) // OK
```

注意: **如果直接传入一个对象字面量是会报错的**：

```ts
function getPointX(point: { x: number }) {
  return point.x
}

getPointX({ x: 1, y: '2' }) // error
```

这是 ts 中的另一个特性，叫做: **excess property check ，当传入的参数是一个对象字面量时，会进行额外属性检查**。

### 判断never

先来看一个反直觉的现象：

```ts
// 1.
type JudgeNever = never extends never ? true : false; // true

// 2.
type TryIsNever<T extends any> = T extends never ? true : false;
type testTryIsNever = TryIsNever<never> // never

// 3.
type IsNever<T extends any> = [T] extends [never] ? true : false;
type testIsNever = IsNever<never>  // true
```

never是一个特殊的联合类型（它本身是一个底部类型），它没有任何一个成员，而根据Distributive Conditional Types，联合类型作为泛型传入后，会分开计算，因此当输入是never时，因为他一个成员都没有，自然也不需要计算了，直接返回never。而`[T]`是ts实现的一个特性，能够打破这种Distributive Conditional Types规则。 然后似乎范型默认是当联合类型处理条件语句？所以1和2的结构不同 如果不能理解咱就记住：`[T] extends [never]`只能这么判断类型是否是never

## 别的一些知识点

### 全局模块 vs. 文件模块

当我们没写import或者export的时候，ts会认为我们在写全局模块：

```ts a.ts
const foo = 1
```

```ts b.ts
const bar = foo
```

要打破这种规则最简单就是加入import或者export

```ts
export const bar = foo // error
```

### 字符串转数字

使用场景：字符串的逐个解析有递归特性，我们可以转成字符串后做一些这方面的处理，处理完后还需要转回去

```ts
type ToNumber<T> = T extends `${infer N extends number}`
  ? N
  : T
```

### 映射类型 key值的交集与并集

```ts
type foo = {
  name: string;
  age: string;
}

type coo = {
  age: number;
  sex: string
}

type TestUnion = keyof foo | keyof coo; // 'name' | 'age' | 'sex'
type TestBoth = keyof (foo | coo);  // 'age'
```

---

基本特性已经讲的差不多了，下一篇开始黑魔法的练习
