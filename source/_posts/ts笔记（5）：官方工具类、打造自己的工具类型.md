---
title: ts笔记（5）：官方工具类、打造自己的工具类型
date: 2021-11-13 15:05:01
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

下面是 TypeScript 进阶内容

<!-- more -->

# 官方工具类

## 操作接口类型

### Partial

Partial 工具类型可以将一个类型的所有属性变为可选的，且该工具类型返回的类型是给定类型的所有子集，下面我们看一个具体的示例：

```ts
type Partial<T> = {
  [P in keyof T]?: T[P]
}
interface Person {
  name: string
  age?: number
  weight?: number
}
type PartialPerson = Partial<Person>
// 相当于
interface PartialPerson {
  name?: string
  age?: number
  weight?: number
}
```

### Required

与 Partial 工具类型相反，Required 工具类型可以将给定类型的所有属性变为必填的，下面我们看一个具体示例。

```ts
type Required<T> = {
  [P in keyof T]-?: T[P]
}
type RequiredPerson = Required<Person>
// 相当于
interface RequiredPerson {
  name: string
  age: number
  weight: number
}
```

### Readonly

Readonly 工具类型可以将给定类型的所有属性设为只读，这意味着给定类型的属性不可以被重新赋值，下面我们看一个具体的示例。

```ts
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
type ReadonlyPerson = Readonly<Person>
// 相当于
interface ReadonlyPerson {
  readonly name: string
  readonly age?: number
  readonly weight?: number
}
```

### Pick

Pick 工具类型可以从给定的类型中选取出指定的键值，然后组成一个新的类型，下面我们看一个具体的示例。

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
type NewPerson = Pick<Person, 'name' | 'age'>
// 相当于
interface NewPerson {
  name: string
  age?: number
}
```

### Omit

与 Pick 类型相反，Omit 工具类型的功能是返回去除指定的键值之后返回的新类型，下面我们看一个具体的示例：

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type NewPerson = Omit<Person, 'weight'>
// 相当于
interface NewPerson {
  name: string
  age?: number
}
```

## 联合类型

### Exclude

在介绍 Omit 类型的实现中，我们使用了 Exclude 类型。通过使用 Exclude 类型，我们从接口的所有属性中去除了指定属性，因此，Exclude 的作用就是从联合类型中去除指定的类型。具体的示例：

```ts
type Exclude<T, U> = T extends U ? never : T
type T = Exclude<'a' | 'b' | 'c', 'a'> // => 'b' | 'c'
type NewPerson = Omit<Person, 'weight'>
// 相当于
type NewPerson = Pick<Person, Exclude<keyof Person, 'weight'>>
// 其中
type ExcludeKeys = Exclude<keyof Person, 'weight'> // => 'name' | 'age'
```

### Extract

Extract 类型的作用与 Exclude 正好相反，Extract 主要用来从联合类型中提取指定的类型，类似于操作接口类型中的 Pick 类型。

```ts
type Extract<T, U> = T extends U ? T : never
type T = Extract<'a' | 'b' | 'c', 'a'> // => 'a'
```

此外，我们还可以基于 Extract 实现一个获取接口类型交集的工具类型，如下示例：

```ts
type Intersect<T, U> = {
  [K in Extract<keyof T, keyof U>]: T[K]
}
interface Person {
  name: string
  age?: number
  weight?: number
}
interface NewPerson {
  name: string
  age?: number
}
type T = Intersect<Person, NewPerson>
// 相当于
type T = {
  name: string
  age?: number
}
```

### NonNullable

NonNullable 的作用是从联合类型中去除 null 或者 undefined 的类型。

```ts
type NonNullable<T> = T extends null | undefined ? never : T
// 等同于使用 Exclude
type NonNullable<T> = Exclude<T, null | undefined>
type T = NonNullable<string | number | undefined | null> // => string | number
```

### Record

Record 的作用是生成接口类型，然后我们使用传入的泛型参数分别作为接口类型的属性和值。

```ts
type Record<K extends keyof any, T> = {
  [P in K]: T
}
type MenuKey = 'home' | 'about' | 'more'
interface Menu {
  label: string
  hidden?: boolean
}
const menus: Record<MenuKey, Menu> = {
  about: { label: '关于' },
  home: { label: '主页' },
  more: { label: '更多', hidden: true },
}
```

在 TypeScript 中，keyof any 指代可以作为对象键的属性，如下示例：

```ts
type T = keyof any // => string | number | symbol
// 目前，JavaScript 仅支持string、number、symbol作为对象的键值。
```

## 函数类型

### ConstructorParameters

ConstructorParameters 可以用来获取构造函数的构造参数，而 ConstructorParameters 类型的实现则需要使用 infer 关键字推断构造参数的类型。

关于 infer 关键字，我们可以把它当成简单的模式匹配来看待。如果真实的参数类型和 infer 匹配的一致，那么就返回匹配到的这个类型。

```ts
type ConstructorParameters<T extends new (...args: any) => any> =
  T extends new (...args: infer P) => any ? P : never
class Person {
  constructor(name: string, age?: number) {}
}
type T = ConstructorParameters<typeof Person> // [name: string, age?: number]
```

### Parameters

Parameters 的作用与 ConstructorParameters 类似，Parameters 可以用来获取函数的参数并返回序对，如下示例：

```ts
type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never
type T0 = Parameters<() => void> // []
type T1 = Parameters<(x: number, y?: string) => void> // [x: number, y?: string]
```

### ReturnType

ReturnType 的作用是用来获取函数的返回类型，下面我们看一个具体的示例：

```ts
type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any
type T0 = ReturnType<() => void> // => void
type T1 = ReturnType<() => string> // => string
```

### ThisParameterType

ThisParameterType 可以用来获取函数的 this 参数类型。

```ts
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any
  ? U
  : unknown
type T = ThisParameterType<(this: Number, x: number) => void> // Number
```

### ThisType

ThisType 的作用是可以在对象字面量中指定 this 的类型。ThisType 不返回转换后的类型，而是通过 ThisType 的泛型参数指定 this 的类型，下面看一个具体的示例：

> 注意：如果你想使用这个工具类型，那么需要开启 noImplicitThis 的 TypeScript 配置。

```ts
type ObjectDescriptor<D, M> = {
  data?: D
  methods?: M & ThisType<D & M> // methods 中 this 的类型是 D & M
}
function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  let data: object = desc.data || {}
  let methods: object = desc.methods || {}
  return { ...data, ...methods } as D & M
}
const obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx // this => D & M
      this.y += dy // this => D & M
    },
  },
})
obj.x = 10
obj.y = 20
obj.moveBy(5, 5)
```

### OmitThisParameter

OmitThisParameter 工具类型主要用来去除函数类型中的 this 类型。如果传入的函数类型没有显式声明 this 类型，那么返回的仍是原来的函数类型。

```ts
type OmitThisParameter<T> = unknown extends ThisParameterType<T>
  ? T
  : T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T
type T = OmitThisParameter<(this: Number, x: number) => string> // (x: number) => string
```

## 字符串类型

### 模板字符串

TypeScript 自 4.1 版本起开始支持模板字符串字面量类型。为此，TypeScript 也提供了 Uppercase、Lowercase、Capitalize、Uncapitalize 这 4 种内置的操作字符串的类型，如下示例：

```ts
// 转换字符串字面量到大写字母
type Uppercase<S extends string> = intrinsic
// 转换字符串字面量到小写字母
type Lowercase<S extends string> = intrinsic
// 转换字符串字面量的第一个字母为大写字母
type Capitalize<S extends string> = intrinsic
// 转换字符串字面量的第一个字母为小写字母
type Uncapitalize<S extends string> = intrinsic
type T0 = Uppercase<'Hello'> // => 'HELLO'
type T1 = Lowercase<T0> // => 'hello'
type T2 = Capitalize<T1> // => 'Hello'
type T3 = Uncapitalize<T2> // => 'hello'
```

在上述示例中，这 4 种操作字符串字面量工具类型的实现都是使用 JavaScript 运行时的字符串操作函数计算出来的，且不支持语言区域设置。以下代码是这 4 种字符串工具类型的实际实现。

```ts
function applyStringMapping(symbol: Symbol, str: string) {
  switch (intrinsicTypeKinds.get(symbol.escapedName as string)) {
    case IntrinsicTypeKind.Uppercase:
      return str.toUpperCase()
    case IntrinsicTypeKind.Lowercase:
      return str.toLowerCase()
    case IntrinsicTypeKind.Capitalize:
      return str.charAt(0).toUpperCase() + str.slice(1)
    case IntrinsicTypeKind.Uncapitalize:
      return str.charAt(0).toLowerCase() + str.slice(1)
  }
  return str
}
```

在上述代码中可以看到，字符串的转换使用了 JavaScript 中字符串的 toUpperCase 和 toLowerCase 方法，而不是 toLocaleUpperCase 和 toLocaleLowerCase。其中 toUpperCase 和 toLowerCase 采用的是 Unicode 编码默认的大小写转换规则。

# 类型编程：如何打造属于自己的工具类型？

## 类型物料

在正式造轮子之前，我们先来熟悉一下即将用到的物料，这可能涉及前面每一讲中的知识点和一些新语法。

### 泛型

首先是泛型（回顾 10 讲），笔者认为工具类型的本质就是构造复杂类型的泛型。如果一个工具类型不能接受类型入参，那么它和普通的类型别名又有什么区别？因此，使用泛型进行变量抽离、逻辑封装其实就是在造类型的轮子，下面举一个具体的示例：

```ts
type isXX = 1 extends number ? true : false
type isYY = 'string' extends string ? true : false
```

这明显是一种效率低下的做法，因为我们不能把其中的逻辑复用在对其他类型子类型关系的判断上。这时，我们就需要把确切的类型抽离为入参，然后封装成一个可复用的泛型。

```ts
type isSubTying<Child, Par> = Child extends Par ? true : false
type isXX2 = isSubTyping<1, number> // true
type isYY2 = isSubTyping<'string', string> // true
type isZZ2 = isSubTyping<true, boolean> // true
```

### 条件类型

如我们在泛型中提到，TypeScript 支持使用三元运算的条件类型，它可以根据 ？前面的条件判断返回不同的类型。同时，三元运算还支持嵌套。

在三元运算的条件判断逻辑中，它主要使用 extends 关键字判断两个类型的子类型关系，如下代码所示：

```ts
type isSubTyping<Child, Par> = Child extends Par ? true : false
type isAssertable<T, S> = T extends S ? true : S extends T ? true : false
type isNumAssertable = isAssertable<1, number> // true
type isStrAssertable = isAssertable<string, 'string'> // true
type isNotAssertable = isAssertable<1, boolean> // false
```

### 分配条件类型（Distributive Conditional Types）

在条件类型中，如果入参是联合类型，则会被拆解为一个个独立的（原子）类型（成员），然后再进行类型运算。

```ts
type BooleanOrString = string | boolean
type StringOrNumberArray<E> = E extends string | number ? E[] : E
type WhatIsThis = StringOrNumberArray<BooleanOrString> // boolean | string[]
type BooleanOrStringGot = BooleanOrString extends string | number
  ? BooleanOrString[]
  : BooleanOrString //  string | boolean
```

同样，通过某些手段强制类型入参被当成一个整体，也可以解除类型分配，如下示例：

```ts
type StringOrNumberArray<E> = [E] extends [string | number] ? E[] : E
type WhatIsThis = StringOrNumberArray<string | boolean> // string | boolean
```

> **注意：包含条件类型的泛型接收 never 作为泛型入参时，存在一定“陷阱”**

```ts
type GetSNums = never extends number
  ? number[]
  : never extends string
  ? string[]
  : never // number[];
type GetNever = StringOrNumberArray<never> // never
```

泛型 StringOrNumberArray 的实现与示例第 1 行“=”右侧的逻辑并没有任何区别（除 never 被抽离成入参之外）。这是因为 never 是不能分配的底层类型，如果作为入参以原子形式出现在条件判断 extends 关键字左侧，则实例化得到的类型也是 never。

```ts
type UsefulNeverX<T> = T extends {} ? T[] : []
type UselessNeverX<T, S> = S extends {} ? S[] : []
type UselessNeverY<T, S> = S extends {} ? T[] : []
type UselessNeverZ<T> = [T] extends [{}] ? T[] : []
type ThisIsNeverX = UsefulNeverX<never> // never
type ThisIsNotNeverX = UselessNeverX<never, string> // string[]
type ThisIsNotNeverY = UselessNeverY<never, string> // never[]
type ThisIsNotNeverZ = UselessNeverZ<never> // never[]
```

### 条件类型中的类型推断 infer

另外，我们可以在条件类型中使用类型推断操作符 infer 来获取类型入参的组成部分，比如说获取数组类型入参里元素的类型。

```ts
type ElementTypeOfArray<T> = T extends (infer E)[] ? E : never
type isNumber = ElementTypeOfArray<number[]> // number
type isNever = ElementTypeOfArray<number> // never
```

我们还可以通过 infer 创建任意个类型推断参数，以此获取任意的成员类型，如下示例：

```ts
type ElementTypeOfObj<T> = T extends { name: infer E; id: infer I }
  ? [E, I]
  : never
type isArray = ElementTypeOfObj<{ name: 'name'; id: 1; age: 30 }> // ['name', 1]
type isNever = ElementTypeOfObj<number> // never
```

### 索引访问类型

索引访问类型其实更像是获取物料的方式，首先我们可以通过属性名、索引、索引签名按需提取对象（接口类型）任意成员的类型（**注意：只能使用 [索引名] 的语法**），如下示例。

```ts
interface MixedObject {
  animal: {
    type: 'animal' | 'dog' | 'cat'
    age: number
  }
  [name: number]: {
    type: string
    age: number
    nickname: string
  }
  [name: string]: {
    type: string
    age: number
  }
}
type animal = MixedObject['animal']
type animalType = MixedObject['animal']['type']
type numberIndex = MixedObject[number]
type numberIndex0 = MixedObject[0]
type stringIndex = MixedObject[string]
type stringIndex0 = MixedObject['string']
```

在示例的第 16 行，我们通过 'animal' 索引获取了 MixedObject 接口的 animal 属性的类型。在第 17 行，我们通过多级属性索引获取了更深层级 type 属性的类型。

然后，在第 18 行、第 19 行，我们通过 number 类型索引签名和数字索引 0 获取了第 6~10 行定义的同一个接口类型。

最后，在第 20 行、第 21 行，我们通过 string 类型索引签名和字符串字面量索引 'string' 获取了第 11~14 行定义的同一个接口类型。

### keyof

可以使用 keyof 关键字提取对象属性名、索引名、索引签名的类型

```ts
type MixedObjectKeys = keyof MixedObject // string | number
type animalKeys = keyof animal // 'type' | 'age'
type numberIndexKeys = keyof numberIndex // "type" | "age" | "nickname"
```

### typeof

如果我们在表达式上下文中使用 typeof，则是用来获取表达式值的类型，如果在类型上下文中使用，则是用来获取变量或者属性的类型。当然，在 TypeScript 中，typeof 的主要用途是在类型上下文中获取变量或者属性的类型，下面我们通过一个具体示例来理解一下。

```ts
let StrA = 'a'
const unions = typeof StrA // unions 类型是 "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
const str: typeof StrA = 'string' // strs 类型是 string
type DerivedFromStrA = typeof StrA // string
```

对于任何未显式添加类型注解或值与类型注解一体（比如函数、类）的变量或属性，我们都可以使用 typeof 提取它们的类型，这是一个十分方便、有用的设计，如下示例：

```ts
const animal = {
  id: 1,
  name: 'animal',
}
type Animal = typeof animal
const animalFun = () => animal
type AnimalFun = typeof animalFun
```

### 映射类型

我们可以使用索引签名语法和 in 关键字限定对象属性的范围，如下示例：

```ts
type SpecifiedKeys = 'id' | 'name'
type TargetType = {
  [key in SpecifiedKeys]: any
} // { id: any; name: any; }
type TargetGeneric<O extends string | number | symbol> = {
  [key in O]: any
}
type TargetInstance = TargetGeneric<SpecifiedKeys> // { id: any; name: any; }

interface ITargetInterface {
  [key in SpecifiedKeys]: any // ts(1169)
}
```

> 注意：我们只能在类型别名定义中使用 in，如果在接口中使用，则会提示一个 ts(1169) 的错误

在定义类型时，我们可以组合使用 in 和 keyof，并基于已有的类型创建一个新类型，使得新类型与已有类型保持一致的只读、可选特性，这样的泛型被称之为映射类型。

> **注意：in 和 keyof 也只能在类型别名定义中组合使用。**

```ts
interface SourceInterface {
  readonly id: number
  name?: string
}
type TargetType = {
  [key in keyof SourceInterface]: SourceInterface[key]
} // { readonly id: number; name?: string | undefined }
type TargetGenericType<S> = {
  [key in keyof S]: S[key]
}
type TargetInstance = TargetGenericType<SourceInterface> // { readonly id: number; name?: string | undefined }
```

同样，我们可以在映射类型中使用 readonly、? 修饰符来描述属性的可读性、可选性，也可以在修饰符前添加 +、- 前缀表示添加、移除指定修饰符（默认是 +、添加），如下示例：

```ts
type TargetGenericTypeReadonly<S> = {
  readonly [key in keyof S]: S[key]
}
type TargetGenericTypeReadonlyInstance =
  TargetGenericTypeReadonly<SourceInterface> // { readonly id: number; readonly name?: string | undefined }
type TargetGenericTypeOptional<S> = {
  [key in keyof S]?: S[key]
}
type TargetGenericTypeOptionalInstance =
  TargetGenericTypeOptional<SourceInterface> // { readonly id?: number; readonly name?: string | undefined }
type TargetGenericTypeRemoveReadonly<S> = {
  -readonly [key in keyof S]: S[key]
}
type TargetGenericTypeRemoveReadonlyInstance =
  TargetGenericTypeRemoveReadonly<SourceInterface> // { id: number; name?: string | undefined }
type TargetGenericTypeRemoveOptional<S> = {
  [key in keyof S]-?: S[key]
}
type TargetGenericTypeRemoveOptionalInstance =
  TargetGenericTypeRemoveOptional<SourceInterface> // { readonly id: number; name: string }
```

### 使用 as 重新映射 key

自 TypeScript 4.1 起，我们可以在映射类型的索引签名中使用类型断言

```ts
type TargetGenericTypeAssertiony<S> = {
  [key in keyof S as Exclude<key, 'id'>]: S[key]
}
type TargetGenericTypeAssertionyInstance =
  TargetGenericTypeAssertiony<SourceInterface> // { name?: string | undefined; }
```

## 造轮子

### ReturnTypeOfResolved

ReturnTypeOfResolved 和官方 ReturnType 的区别：如果入参 F 的返回类型是泛型 Promise 的实例，则返回 Promise 接收的入参。

我们可以借鉴 ReturnType 的定义实现 ReturnTypeOfResolved，如下示例：

```ts
// type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type ReturnTypeOfResolved<F extends (...args: any) => any> = F extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : ReturnType<F>
type isNumber = ReturnTypeOfResolved<() => number> // number
type isString = ReturnTypeOfResolved<() => Promise<string>> // string
```

### Merge

基于映射类型将类型入参 A 和 B 合并为一个类型的泛型 `Merge<A, B>`

```ts
type Merge<A, B> = {
  [key in keyof A | keyof B]: key extends keyof A
    ? key extends keyof B
      ? A[key] | B[key]
      : A[key]
    : key extends keyof B
    ? B[key]
    : never
}
type Merged = Merge<{ id: number; name: string }, { id: string; age: number }>
// => { id: number | string; name: string; age: number }
```

### Equal

再来实现一个自定义工具类型 `Equal<S, T>`，它可以用来判断入参 S 和 T 是否是相同的类型。如果相同，则返回布尔字面量类型 true，否则返回 false。

此时，我们很容易想到，如果 S 是 T 的子类型且 T 也是 S 的子类型，则说明 S 和 T 是相同的类型，所以 Equal 的实现似乎是这样的：

```ts
type EqualV1<S, T> = S extends T ? (T extends S ? true : false) : false
type ExampleV11 = EqualV1<1 | (number & {}), number> // true but boolean
type ExampleV12 = EqualV1<never, never> // true but never
```

在示例中的第 1 行，我们实现了泛型 EqualV1；第 2 行中的第一个入参是联合类型，因为分配条件类型的设定，所以第一个类型入参被拆解，最终返回类型 boolean（实际上是联合类型 true | false）。同样，在第 3 行中，当入参是 never，则返回类型 never。因此，EqualV1 并不符合我们的预期。

此时，我们需要使用 [] 解除条件分配类型和 never “陷阱”，确保自定义泛型仅返回 true 或者 false，所以前面示例的改良版本 EqualV2 如下：

```ts
type EqualV2<S, T> = [S] extends [T] ? ([T] extends [S] ? true : false) : false
type ExampleV21 = EqualV2<1 | (number & {}), number> // true
type ExampleV22 = EqualV2<never, never> // true
type ExampleV23 = EqualV2<any, number> // false but true
```

在示例中的第 2 行、第 3 行，虽然我们解决了联合类型和 never 的问题，但是还是无法区分万金油类型 any 和其他类型。在第 4 行，当入参是 any 和 number，预期应该返回 false，却返回了 true。

这时，我们还需要使用一个可以能识别 any 的改良版 EqualV3 如下：

```ts
type IsAny<T> = 0 extends 1 & T ? true : false
type EqualV3<S, T> = IsAny<S> extends true
  ? IsAny<T> extends true
    ? true
    : false
  : IsAny<T> extends true
  ? false
  : [S] extends [T]
  ? [T] extends [S]
    ? true
    : false
  : false
type ExampleV31 = EqualV3<1 | (number & {}), number> // true but false got
type ExampleV32 = EqualV3<never, never> // true
type ExampleV34 = EqualV3<any, any> // true
type ExampleV33 = EqualV3<any, number> // false
type ExampleV35 = EqualV3<never, any> // false
```

> 思考题：尝试找一个 ExampleV3 不能正确分区类型的反例，并改良 ExampleV3。
