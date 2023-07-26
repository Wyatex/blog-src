---
title: TypeScript黑魔法教学（2）：开始练习体操
date: 2023-06-28 09:30:02
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

在学习 TS 黑魔法（类型体操），建议先把[前面的 TS 基础知识](/categories/TypeScript/)学好了，再来看进阶用法。

另外，即使已经进阶到高级选手了：**不要滥用工具类型，对外暴露的 API，应该尽量多手动标注函数返回值类型。契约高于实现，你写再多重复的TS代码也不会影响最终代码。**

<!-- more -->

## 字符串、数组拆解

数组可以直接用类似js的 `[infer start, ...infer M, infer end]` 来获得一个数组的第一个和最后一个值。
字符串也是 `${infer L}${infer M}${infer R}` ，但注意这里L是第一个字符，M是第二个字符，R是剩下的字符，如果字符只有2个，则R是''，如果字符只有一位，则无法这么拆解成3个变量，`T extends infer ${infer L}${infer M}${infer R}`条件会走到false的语句里去，这一点比较奇怪。

```ts
// 15 实现一个通用Last<T>，它接受一个数组T并返回其最后一个元素的类型。
type Last<T extends any[]> = T extends [...infer B, infer P] ? P : never;

type arr1 = ['a', 'b', 'c']
type arr2 = [3, 2, 1]

type tail1 = Last<arr1> // expected to be 'c'
type tail2 = Last<arr2> // expected to be 1


// 实现 Replace<S, From, To> 将字符串 S 中的第一个子字符串 From 替换为 To 。
type Replace<S extends string, From extends string, To extends string> = From extends '' 
? S 
: S extends (`${infer L}${From}${infer R}`) ? `${L}${To}${R}`: S

type replaced = Replace<'types are fun!', 'fun', 'awesome'> // 期望是 'types are awesome!'

```

## 遍历

### 联合类型

类似结构的联合类型可以直接通过extends条件语句遍历到

```ts
interface Cat {
  type: 'cat'
  breeds: 'Abyssinian' | 'Shorthair' | 'Curl' | 'Bengal'
}

interface Dog {
  type: 'dog'
  breeds: 'Hound' | 'Brittany' | 'Bulldog' | 'Boxer'
  color: 'brown' | 'white' | 'black'
}

type LookUp<T, K extends string> = T extends { type: K } ? T : never;

type MyDog = LookUp<Cat | Dog, 'dog'> // expected to be `Dog`
```

这个特性可以做些变态的事了，譬如把联合类型组成笛卡尔积的数组，直接看: [Permutation (with explanations)](https://github.com/type-challenges/type-challenges/issues/614)

```ts
type Permutation<T, K=T> =
    [T] extends [never]
      ? []
      : K extends K
        ? [K, ...Permutation<Exclude<T, K>>]
        : never

type perm = Permutation<'A' | 'B' | 'C'>; 
// ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']
```

### 映射类型

通过 `extends keyof T` 进行遍历

```ts
type ObjectEntries<T extends Record<string, any>, K = keyof T> = K extends keyof T ? [K, T[K]]: [];

interface Model {
  name: string;
  age: number;
  locations: string[] | null;
}
type modelEntries = ObjectEntries<Model> // ['name', string] | ['age', number] | ['locations', string[] | null];
```

### 元组

元组的遍历，借助元组解构逐个处理逻辑，再把剩下的元组迭代调用当前的类型分析器

```ts
type PromiseParseAll<T extends any[]> = T extends [infer P, ...infer O]
  ? P extends Promise<infer R> ? [R, ...PromiseParseAll<O>] : [P, ...PromiseParseAll<O>]
  : []
type PromiseAll<T extends any[]> = Promise<PromiseParseAll<T>>
// expected to be `Promise<[number, 42, string]>`
type PRes = PromiseAll<[Promise<number>, 42, Promise<string>]>;
```

### 字符串

字符串类似

```ts
type TrimLeft<T extends string> = T extends `${infer L}${infer R}`
? L extends " "|"\n"|"\t" ? TrimLeft<R> : T
: never
type trimed = TrimLeft<'  Hello World '> // 应推导出 'Hello World '
```

## 联合类型变交叉类型

利用函数入参的逆变特性，把输入类型构建成函数参数

```ts
type UnionToIntersection<U> = 
  (U extends any 
   ? (arg: U) => any 
   : never
  ) extends ((arg: infer I) => any) 
  ? I 
  : never
type TestUnion2Intersection = UnionToIntersection<{a: 1} | {b: 2} | {c: 3}> 
// expected to be {a: 1} & {b: 2} & {c: 3}
```


## 判断两个类型相等

大多数非严格情况下的相等使用 `A extends B` 基本可以做到，譬如前一步的类型中间方法根据条件返回了true或false，接下来要判断结果是否是true，直接用 `T extends true ? xxx : xxx` 进行接下来的操作就好。

但是枚举类型下，extends无法很好的区分是否可选，是否只读的区别。

```ts
type a = {a: string} extends {readonly a: string} ? true : false; // true
type b = {readonly a: string} extends {a: string} ? true : false; // true
type c = {a: string} extends {a?: string} ? true : false; // true
type d = {a?: string} extends {a: string} ? true : false; // false
```

所以严格的相等要借助函数的协变，具体的逻辑我也没get到。。。

```ts
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false
```

## 计数

ts类型是无法进行数学加减运算的，有运算或者计数的诉求，都可以构建一个元组，用元组的length来计数

```ts
type FlattenDepth<
  T extends unknown[],
  Depth extends number = 1,
  Count extends 1[] = []
> =
  Count['length'] extends Depth
  ? T
  : T extends [infer Head, ...infer Tail]
    ? Head extends unknown[]
      ? [
          ...FlattenDepth<Head, Depth, [...Count, 1]>,
          ...FlattenDepth<Tail, Depth, Count>
        ]
      : [
          Head,
          ...FlattenDepth<Tail, Depth, Count>
        ]
    : [];

type a = FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2> // [1, 2, 3, 4, [5]]. flattern 2 times
type b = FlattenDepth<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, [[5]]]. Depth defaults to be 1
```

## 加减运算

```ts
type Fibonacci<
  T extends number,
  CurrentIndex extends any[] = [''],
  Prev extends any[] = [],
  Current extends any[] = ['']
> =
  CurrentIndex['length'] extends T
  ? Current['length']
  : Fibonacci<
      T,
      [...CurrentIndex, ''],
      Current,
      [...Prev, ...Current]
    >;

type ResultFibonacci1 = Fibonacci<3> // 2
type ResultFibonacci2 = Fibonacci<8> // 21
```
