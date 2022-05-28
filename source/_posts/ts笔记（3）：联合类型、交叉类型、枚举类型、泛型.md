---
title: ts笔记（3）：联合类型、交叉类型、枚举类型、泛型
date: 2021-11-02 10:32:30
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

这一节讲解更复杂一点的数据结构，包括：联合类型、交叉类型、枚举类型、泛型。

<!-- more -->

# 联合类型

联合类型（Unions）用来表示变量、参数的类型不是单一原子类型，而可能是多种不同的类型的组合。

我们主要通过“|”操作符分隔类型的语法来表示联合类型。这里，我们可以把“|”类比为 JavaScript 中的逻辑或 “||”，只不过前者表示可能的类型。

```ts
function formatPX(size: number | string) {
  if (typeof size === 'number') {
    return `${size}px`
  }
  if (typeof size === 'string') {
    return `${parseInt(size) || 0}px`
  }
}
formatPX(13) // ok
formatPX('13px') // ok
formatPX(true) // ts(2345) 'true' 类型不能赋予 'number | string' 类型
formatPX(null) // ts(2345) 'null' 类型不能赋予 'number | string' 类型
```

当然，我们可以组合任意个、任意类型来构造更满足我们诉求的类型。比如，我们希望给前边的示例再加一个 unit 参数表示可能单位，这个时候就可以声明一个字符串字面类型组成的联合类型，如下代码所示：

```ts
function formatUnit(
  size: number | string,
  unit: 'px' | 'em' | 'rem' | '%' = 'px'
) {
  // ...
}
formatUnit(1, 'em') // ok
formatUnit('1px', 'rem') // ok
formatUnit('1px', 'bem') // ts(2345)
```

我们也可以使用类型别名抽离上边的联合类型，然后再将其进一步地联合，如下代码所示：

```ts
type ModernUnit = 'vh' | 'vw'
type Unit = 'px' | 'em' | 'rem'
type MessedUp = ModernUnit | Unit // 类型是 'vh' | 'vw' | 'px' | 'em' | 'rem'
```

我们也可以把接口类型联合起来表示更复杂的结构，如下所示示例（援引官方示例，顺带复习一下类型断言 as）：

```ts
interface Bird {
  fly(): void
  layEggs(): void
}
interface Fish {
  swim(): void
  layEggs(): void
}
const getPet: () => Bird | Fish = () => {
  return {
    // ...
  } as Bird | Fish
}
const Pet = getPet()
Pet.layEggs() // ok
Pet.fly() // ts(2339) 'Fish' 没有 'fly' 属性; 'Bird | Fish' 没有 'fly' 属性
```

从上边的示例可以看到，在联合类型中，我们可以直接访问各个接口成员都拥有的属性、方法，且不会提示类型错误。但是，如果是个别成员特有的属性、方法，我们就需要区分对待了，此时又要引入类型守卫来区分不同的成员类型。

只不过，在这种情况下，我们还需要使用基于 in 操作符判断的类型守卫，如下代码所示：

```ts
if (typeof Pet.fly === 'function') {
  // ts(2339)
  Pet.fly() // ts(2339)
}
if ('fly' in Pet) {
  Pet.fly() // ok
}
```

因为 Pet 的类型既可能是 Bird 也可能是 Fish，这就意味着在第 1 行可能会通过 Fish 类型获取 fly 属性，但 Fish 类型没有 fly 属性定义，所以会提示一个 ts(2339) 错误。

# 交叉类型

在 TypeScript 中，我们可以使用“&”操作符来声明交叉类型，如下代码所示：

```ts
type Useless = string & number
```

很显然，如果我们仅仅把原始类型、字面量类型、函数类型等原子类型合并成交叉类型，是没有任何用处的，因为任何类型都不能满足同时属于多种原子类型，比如既是 string 类型又是 number 类型。因此，在上述的代码中，类型别名 Useless 的类型就是个 never。

## 合并接口类型

联合类型真正的用武之地就是将多个接口类型合并成一个类型，从而实现等同接口继承的效果，也就是所谓的合并接口类型，如下代码所示：

```ts
type IntersectionType = { id: number; name: string } & { age: number }
const mixed: IntersectionType = {
  id: 1,
  name: 'name',
  age: 18,
}
```

在上述示例中，我们通过交叉类型，使得 IntersectionType 同时拥有了 id、name、age 所有属性，这里我们可以试着将合并接口类型理解为求并集。

> 如果合并的多个接口类型存在同名属性会是什么效果呢？如果同名属性的类型不兼容，比如上面示例中两个接口类型同名的 name 属性类型一个是 number，另一个是 string，合并后，name 属性的类型就是 number 和 string 两个原子类型的交叉类型，即 never，如下代码所示：

```ts
type IntersectionTypeConfict = { id: number; name: string } & {
  age: number
  name: number
}
const mixedConflict: IntersectionTypeConfict = {
  id: 1,
  name: 2, // ts(2322) 错误，'number' 类型不能赋给 'never' 类型
  age: 2,
}
```

此时，我们赋予 mixedConflict 任意类型的 name 属性值都会提示类型错误。而如果我们不设置 name 属性，又会提示一个缺少必选的 name 属性的错误。在这种情况下，就意味着上述代码中交叉出来的 IntersectionTypeConfict 类型是一个无用类型。

如果同名属性的类型兼容，比如一个是 number，另一个是 number 的子类型、数字字面量类型，合并后 name 属性的类型就是两者中的子类型。

如下所示示例中 name 属性的类型就是数字字面量类型 2，因此，我们不能把任何非 2 之外的值赋予 name 属性。

```ts
type IntersectionTypeConfict = { id: number; name: 2 } & {
  age: number
  name: number
}
let mixedConflict: IntersectionTypeConfict = {
  id: 1,
  name: 2, // ok
  age: 2,
}
mixedConflict = {
  id: 1,
  name: 22, // '22' 类型不能赋给 '2' 类型
  age: 2,
}
```

# 合并联合类型

另外，我们可以合并联合类型为一个交叉类型，这个交叉类型需要同时满足不同的联合类型限制，也就是提取了所有联合类型的相同类型成员。这里，我们也可以将合并联合类型理解为求交集。在如下示例中，两个联合类型交叉出来的类型 IntersectionUnion 其实等价于 'em' | 'rem'

```ts
type UnionA = 'px' | 'em' | 'rem' | '%'
type UnionB = 'vh' | 'em' | 'rem' | 'pt'
type IntersectionUnion = UnionA & UnionB
const intersectionA: IntersectionUnion = 'em' // ok
const intersectionB: IntersectionUnion = 'rem' // ok
const intersectionC: IntersectionUnion = 'px' // ts(2322)
const intersectionD: IntersectionUnion = 'pt' // ts(2322)
```

既然是求交集，如果多个联合类型中没有相同的类型成员，交叉出来的类型自然就是 never 了，如下代码所示：

```ts
type UnionC = 'em' | 'rem'
type UnionD = 'px' | 'pt'
type IntersectionUnionE = UnionC & UnionD
const intersectionE: IntersectionUnionE = 'any' as any // ts(2322) 不能赋予 'never' 类型
```

## 联合、交叉组合

在前面的示例中，我们把一些联合、交叉类型抽离成了类型别名，再把它作为原子类型进行进一步的联合、交叉。其实，联合、交叉类型本身就可以直接组合使用，这就涉及 |、& 操作符的优先级问题。实际上，联合、交叉运算符不仅在行为上表现一致，还在运算的优先级和 JavaScript 的逻辑或 ||、逻辑与 && 运算符上表现一致 。

联合操作符 | 的优先级低于交叉操作符 &，同样，我们可以通过使用小括弧 () 来调整操作符的优先级。

```ts
type UnionIntersectionA =
  | ({ id: number } & { name: string })
  | ({ id: string } & { name: number }) // 交叉操作符优先级高于联合操作符
type UnionIntersectionB =
  | ('px' | 'em' | 'rem' | '%')
  | ('vh' | 'em' | 'rem' | 'pt') // 调整优先级
```

进而，我们也可以把分配率、交换律等基本规则引入类型组合中，然后优化出更简洁、清晰的类型，如下代码所示：

```ts
type UnionIntersectionC = (
  | ({ id: number } & { name: string })
  | { id: string }
) & { name: number }
type UnionIntersectionD =
  | ({ id: number } & { name: string } & { name: number })
  | ({ id: string } & { name: number }) // 满足分配率
type UnionIntersectionE = (
  | { id: string }
  | ({ id: number } & { name: string })
) & { name: number } // 满足交换律
```

# 类型缩减

如果将 string 原始类型和“string 字面量类型”组合成联合类型会是什么效果？效果就是类型缩减成 string 了。同样，对于 number、boolean（其实还有枚举类型）也是一样的缩减逻辑，如下所示示例：

```ts
type URStr = 'string' | string // 类型是 string
type URNum = 2 | number // 类型是 number
type URBoolen = true | boolean // 类型是 boolean
enum EnumUR {
  ONE,
  TWO,
}
type URE = EnumUR.ONE | EnumUR // 类型是 EnumUR
```

TypeScript 对这样的场景做了缩减，它把字面量类型、枚举成员类型缩减掉，只保留原始类型、枚举类型等父类型，这是合理的“优化”。可是这个缩减，却极大地削弱了 IDE 自动提示的能力，如下代码所示：

```ts
type BorderColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | string // 类型缩减成 string
```

在上述代码中，我们希望 IDE 能自动提示显示注解的字符串字面量，但是因为类型被缩减成 string，所有的字符串字面量 black、red 等都无法自动提示出来了。不要慌，TypeScript 官方其实还提供了一个黑魔法，它可以让类型缩减被控制。如下代码所示，我们只需要给父类型添加“& {}”即可。

```ts
type BorderColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | (string & {}) // 字面类型都被保留
```

此时，其他字面量类型就不会被缩减掉了，在 IDE 中字符串字面量 black、red 等也就自然地可以自动提示出来了。此外，当联合类型的成员是接口类型，如果满足其中一个接口的属性是另外一个接口属性的子集，这个属性也会类型缩减，如下代码所示：

```ts
type UnionInterce =
  | {
      age: '1'
    }
  | {
      age: '1' | '2'
      [key: string]: string
    }
```

这里因为 '1' 是 '1' | '2' 的子集，所以 age 的属性变成 '1' | '2'

如何定义如下所示 age 属性是数字类型，而其他不确定的属性是字符串类型的数据结构的对象？比如这样

```ts
{
  age: 1, // 数字类型
  anyProperty: 'str', // 其他不确定的属性都是字符串类型
  //...
}
```

想必你应该明白了，我们肯定要用到两个接口的联合类型及类型缩减，这个问题的核心在于找到一个既是 number 的子类型，这样 age 类型缩减之后的类型就是 number；同时也是 string 的子类型，这样才能满足属性和 string 索引类型的约束关系。

哪个类型满足这个条件呢？我们一起回忆一下特殊类型 never。

never 有一个特性是它是所有类型的子类型，自然也是 number 和 string 的子类型，所以答案如下代码所示：

```ts
type UnionInterce =
  | {
      age: number
    }
  | {
      age: never
      [key: string]: string
    }
const O: UnionInterce = {
  age: 2,
  string: 'string',
}
```

在上述代码中，我们在第 3 行定义了 number 类型的 age 属性，第 6 行定义了 never 类型的 age 属性，等价于 age 属性的类型是由 number 和 never 类型组成的联合类型，所以我们可以把 number 类型的值（比如说数字字面量 1）赋予 age 属性；但是不能把其他任何类型的值（比如说字符串字面量 'string' ）赋予 age。

同时，我们在第 5 行~第 8 行定义的接口类型中，还额外定义了 string 类型的字符串索引签名。因为 never 同时又是 string 类型的子类型，所以 age 属性的类型和字符串索引签名类型不冲突。如第 9 行~第 12 行所示，我们可以把一个 age 属性是 2、string 属性是 'string' 的对象字面量赋值给 UnionInterce 类型的变量 O。

# 枚举类型：详解常见枚举类型的 7 种用法

在 TypeScript 中，我们可以使用枚举定义包含被命名的常量的集合，比如 TypeScript 支持数字、字符两种常量值的枚举类型。我们也可以使用 enum 关键字定义枚举类型，格式是 enum + 枚举名字 + 一对花括弧，花括弧里则是被命名了的常量成员。下面我们把前边表示星期的联合类型示例使用枚举类型实现一遍，如下代码所示：

```ts
enum Day {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
}
```

转译为 JavaScript 后:

```ts
var Day = void 0
;(function (Day) {
  Day[(Day['SUNDAY'] = 0)] = 'SUNDAY'
  Day[(Day['MONDAY'] = 1)] = 'MONDAY'
  Day[(Day['TUESDAY'] = 2)] = 'TUESDAY'
  Day[(Day['WEDNESDAY'] = 3)] = 'WEDNESDAY'
  Day[(Day['THURSDAY'] = 4)] = 'THURSDAY'
  Day[(Day['FRIDAY'] = 5)] = 'FRIDAY'
  Day[(Day['SATURDAY'] = 6)] = 'SATURDAY'
})(Day || (Day = {}))
```

在 TypeScript 中，我们可以通过“枚举名字.常量命名”的格式获取枚举集合里的成员，如下代码所示：

```ts
function work(d: Day) {
  switch (d) {
    case Day.SUNDAY:
    case Day.SATURDAY:
      return 'take a rest'
    case Day.MONDAY:
    case Day.TUESDAY:
    case Day.WEDNESDAY:
    case Day.THURSDAY:
    case Day.FRIDAY:
      return 'work hard'
  }
}
```

效果等效于:

```ts
switch (d) {
  case 0:
  case 6:
    return 'take a rest'
  case 1:
  case 2:
  case 3:
  case 4:
  case 5:
    return 'work hard'
}
```

这就意味着在 JavaScript 中调用 work 函数时，传递的参数无论是 enum 还是数值，逻辑上将没有区别，当然这也符合 TypeScript 静态类型检测规则，如下代码所示：

```ts
work(Day.SUNDAY) // ok
work(0) // ok
```

如果我们希望枚举值从其他值开始递增，则可以通过“常量命名 = 数值” 的格式显示指定枚举成员的初始值，如下代码所示：

```ts
enum Day {
  SUNDAY = 1,
  MONDAY, // 2
  TUESDAY, // 3
  WEDNESDAY, // ...
  THURSDAY,
  FRIDAY,
  SATURDAY, // 7
}
```

当然我们也可以给任意位置的成员指定值，如下所示示例：

```ts
enum Day {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY = 5,
}
// 转移后
//...
Day[(Day['FRIDAY'] = 5)] = 'FRIDAY'
Day[(Day['SATURDAY'] = 5)] = 'SATURDAY'
//...
```

我们可以看到 MyDay.FRIDAY 和 MyDay.SATURDAY 的值都是数字 5，这就导致使用 Day 枚举作为 switch 分支条件的函数 work，在接收 MyDay.SATURDAY 作为入参时，也会进入 MyDay.FRIDAY 的分支，从而出现逻辑错误。

这个经验告诉我们，由于枚举默认的值自递增且完全无法保证稳定性，所以给部分数字类型的枚举成员显式指定数值或给函数传递数值而不是枚举类型作为入参都属于不明智的行为。

此外，常量命名、结构顺序都一致的两个枚举，即便转译为 JavaScript 后，同名成员的值仍然一样（满足恒等 === ）。但在 TypeScript 看来，它们不相同、不满足恒等，如下代码所示：

```ts
enum MyDay {
  SUNDAY,
  //...
}

Day.SUNDAY === MyDay.SUNDAY // ts(2367) 两个枚举值恒不相等
work(MyDay.SUNDAY) // ts(2345) 'MyDay.SUNDAY' 不能赋予 'Day'
```

## 字符串枚举

在 TypeScript 中，我们将定义值是字符串字面量的枚举称之为字符串枚举，字符串枚举转译为 JavaScript 之后也将保持这些值，我们来看下如下所示示例：

```ts
enum Day {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  // ...
}
// 转译后
var Day
;(function (Day) {
  Day['SUNDAY'] = 'SUNDAY'
  Day['MONDAY'] = 'MONDAY'
})(Day || (Day = {}))
```

这里我们定义了成员 SUNDAY 的值是 'SUNDAY'、MONDAY 的值是 'MONDAY'。

## 异构枚举（Heterogeneous enums）

从技术上来讲，TypeScript 支持枚举类型同时拥有数字和字符类型的成员，这样的枚举被称之为异构枚举。

当然，异构枚举也被认为是很“鸡肋”的类型。比如如下示例中，我们定义了成员 SUNDAY 是 'SUNDAY'、MONDAY 是 2，很抱歉，我也不知道这样的枚举能在哪些有用的场合进行使用。

```ts
enum Day {
  SUNDAY = 'SUNDAY',
  MONDAY = 2,
}
```

## 常量成员和计算（值）成员

在前边示例中，涉及的枚举成员的值都是字符串、数字字面量和未指定初始值从 0 递增数字常量，都被称作常量成员。

另外，在转译时，通过被计算的常量枚举表达式定义值的成员，也被称作常量成员，比如如下几种情况：

- 引用来自预先定义的常量成员，比如来自当前枚举或其他枚举；
- 圆括弧 () 包裹的常量枚举表达式；
- 在常量枚举表达式上应用的一元操作符 +、 -、~ ；
- 操作常量枚举表达式的二元操作符 +、-、\*、/、%、<<、>>、>>>、&、|、^。

除以上这些情况之外，其他都被认为是计算（值）成员。

```ts
enum FileAccess {
  // 常量成员
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write,
  // 计算成员
  G = '123'.length,
}
```

> 注意：关于常量成员和计算成员的划分其实比较难理解，实际上它们也并没有太大的用处，只是告诉我们通过这些途径可以定义枚举成员的值。因此，我们只需记住缺省值（从 0 递增）、数字字面量、字符串字面量肯定是常量成员就够了。

## 枚举成员类型和联合枚举

枚举成员和枚举类型之间的关系分两种情况： 如果枚举的成员同时包含字面量和非字面量枚举值，枚举成员的类型就是枚举本身（枚举类型本身也是本身的子类型）；如果枚举成员全部是字面量枚举值，则所有枚举成员既是值又是类型，如下代码所示：

```ts
enum Day {
  SUNDAY,
  MONDAY,
}
enum MyDay {
  SUNDAY,
  MONDAY = Day.MONDAY,
}
const mondayIsDay: Day.MONDAY = Day.MONDAY // ok: 字面量枚举成员既是值，也是类型
const mondayIsSunday = MyDay.SUNDAY // ok: 类型是 MyDay，MyDay.SUNDAY 仅仅是值
const mondayIsMyDay2: MyDay.MONDAY = MyDay.MONDAY // ts(2535)，MyDay 包含非字面量值成员，所以 MyDay.MONDAY 不能作为类型，应该是MyDay类型
```

另外，如果枚举仅有一个成员且是字面量成员，那么这个成员的类型等于枚举类型，如下代码所示：

```ts
enum Day {
  MONDAY,
}
export const mondayIsDay: Day = Day.MONDAY // ok
export const mondayIsDay1: Day.MONDAY = mondayIsDay // ok
```

联合类型使得 TypeScript 可以更清楚地枚举集合里的确切值，从而检测出一些永远不会成立的条件判断（俗称 Dead Code），如下所示示例（援引自官方恒为真的示例）：

```ts
enum Day {
  SUNDAY,
  MONDAY,
}

const work = (x: Day) => {
  if (x !== Day.SUNDAY || x !== Day.MONDAY) {
    // ts(2367)
  }
}
```

在上边示例中，TypeScript 确定 x 的值要么是 Day.SUNDAY，要么是 Day.MONDAY。因为 Day 是纯字面量枚举类型，可以等价地看作联合类型 Day.SUNDAY | Day.MONDAY，所以我们判断出第 7 行的条件语句恒为真，于是提示了一个 ts(2367) 错误。

不过，如果枚举包含需要计算（值）的成员情况就不一样了。如下示例中，TypeScript 不能区分枚举 Day 中的每个成员。因为每个成员类型都是 Day，所以无法判断出第 7 行的条件语句恒为真，也就不会提示一个 ts(2367) 错误。

```ts
enum Day {
  SUNDAY = +'1',
  MONDAY = 'aa'.length,
}

const work = (x: Day) => {
  if (x !== Day.SUNDAY || x !== Day.MONDAY) {
    // ok
  }
}
```

此外，字面量类型所具有的类型推断、类型缩小的特性，也同样适用于字面量枚举类型，如下代码所示：

```ts
enum Day {
  SUNDAY,
  MONDAY,
}
let SUNDAY = Day.SUNDAY // 类型是 Day
const SUNDAY2 = Day.SUNDAY // 类型 Day.SUNDAY
const work = (x: Day) => {
  if (x === Day.SUNDAY) {
    x // 类型缩小为 Day.SUNDAY
  }
}
```

## 常量枚举（const enums）

我们可以通过添加 const 修饰符定义常量枚举，常量枚举定义转译为 JavaScript 之后会被移除，并在使用常量枚举成员的地方被替换为相应的内联值，因此常量枚举的成员都必须是常量成员（字面量 + 转译阶段可计算值的表达式），如下代码所示：

```ts
const enum Day {
  SUNDAY,
  MONDAY,
}
const work = (d: Day) => {
  switch (d) {
    case Day.SUNDAY:
      return 'take a rest'
    case Day.MONDAY:
      return 'work hard'
  }
}
// 转译后
const work = (d) => {
  switch (d) {
    case 0 /* SUNDAY */:
      return 'take a rest'
    case 1 /* MONDAY */:
      return 'work hard'
  }
}
```

## 外部枚举（Ambient enums）

在 TypeScript 中，我们可以通过 declare 描述一个在其他地方已经定义过的变量，如下代码所示：

```ts
declare let $: any
$('#id').addClass('show') // ok
```

第 1 行我们使用 declare 描述类型是 any 的外部变量 $，在第 2 行则立即使用 $ ，此时并不会提示一个找不到 $ 变量的错误。

同样，我们也可以使用 declare 描述一个在其他地方已经定义过的枚举类型，通过这种方式定义出来的枚举类型，被称之为外部枚举，如下代码所示：

```ts
declare enum Day { // 转译成js后抹除掉
  SUNDAY,
  MONDAY,
}
const work = (x: Day) => {
  if (x === Day.SUNDAY) {
    x // 类型是 Day
  }
}
```

外部枚举和常规枚举的差异在于以下几点：

- 在外部枚举中，如果没有指定初始值的成员都被当作计算（值）成员，这跟常规枚举恰好相反；
- 即便外部枚举只包含字面量成员，这些成员的类型也不会是字面量成员类型，自然完全不具备字面量类型的各种特性。

我们可以一起使用 declare 和 const 定义外部常量枚举，使得它转译为 JavaScript 之后仍像常量枚举一样。在抹除枚举定义的同时，我们可以使用内联枚举值替换对枚举成员的引用。外部枚举的作用在于为两个不同枚举（实际上是指向了同一个枚举类型）的成员进行兼容、比较、被复用提供了一种途径，这在一定程度上提升了枚举的可用性，让其显得不那么“鸡肋”。

# 泛型：如何正确使用泛型约束类型变量？

接下来就是 ts 类型的精华：泛型

## 什么是泛型？

关于什么是泛型这个问题不是太好回答，比如在面试中，如果有候选人反过来问我这个问题，可能我也给不出一个特别标准的答案。

不过，我们可以借用 Java 中泛型的释义来回答这个问题：泛型指的是类型参数化，即将原来某种具体的类型进行参数化。和定义函数参数一样，我们可以给泛型定义若干个类型参数，并在调用时给泛型传入明确的类型参数。设计泛型的目的在于有效约束类型成员之间的关系，比如函数参数和返回值、类或者接口成员和方法之间的关系。

## 泛型类型参数

泛型最常用的场景是用来约束函数参数的类型，我们可以给函数定义若干个被调用时才会传入明确类型的参数。比如以下定义的一个 reflect 函数 ，它可以接收一个任意类型的参数，并原封不动地返回参数的值和类型，那我们该如何描述这个函数呢？好像得用上 unknown 了（其实我想说的是 any，因为 any is 魔鬼，所以还是用 unknown 吧）。

```ts
function reflect(param: unknown) {
  return param
}
const str = reflect('string') // str 类型是 unknown
const num = reflect(1) // num 类型 unknown
```

这时候可以用泛型来约束：

```ts
function reflect<P>(param: P): P {
  return param
}
const reflectStr = reflect<string>('string') // str 类型是 string
const reflectNum = reflect<number>(1) // num 类型 number

// 如果调用泛型函数时受泛型约束的参数有传值，泛型参数的入参可以从参数的类型中进行推断，而无须再显式指定类型（可缺省）
const reflectStr2 = reflect('string') // str 类型是 string
const reflectNum2 = reflect(1) // num 类型 number
```

泛型不仅可以约束函数整个参数的类型，还可以约束参数属性、成员的类型，比如参数的类型可以是数组、对象，如下示例：

```ts
function reflectArray<P>(param: P[]) {
  return param
}
const reflectArr = reflectArray([1, '1']) // reflectArr 是 (string | number)[]
```

> 注意：函数的泛型入参必须和参数/参数成员建立有效的约束关系才有实际意义。

我们可以给函数定义任何个数的泛型入参，如下：

```ts
function reflectExtraParams<P, Q>(p1: P, p2: Q): [P, Q] {
  return [p1, p2]
}
```

## 泛型类

在类的定义中，我们还可以使用泛型用来约束构造函数、属性、方法的类型，如下代码所示：

```ts
class Memory<S> {
  store: S
  constructor(store: S) {
    this.store = store
  }
  set(store: S) {
    this.store = store
  }
  get() {
    return this.store
  }
}
const numMemory = new Memory<number>(1) // <number> 可缺省
const getNumMemory = numMemory.get() // 类型是 number
numMemory.set(2) // 只能写入 number 类型
const strMemory = new Memory('') // 缺省 <string>
const getStrMemory = strMemory.get() // 类型是 string
strMemory.set('string') // 只能写入 string 类型
```

## 泛型类型

我们可以使用 Array<类型> 的语法来定义数组类型，这里的 Array 本身就是一种类型。在 TypeScript 中，类型本身就可以被定义为拥有不明确的类型参数的泛型，并且可以接收明确类型作为入参，从而衍生出更具体的类型，如下代码所示：

```ts
const reflectFn: <P>(param: P) => P = reflect // ok
```

我们也可以把 reflectFn 的类型注解提取为一个能被复用的类型别名或者接口，如下代码所示：

```ts
type ReflectFuncton = <P>(param: P) => P
interface IReflectFuncton {
  <P>(param: P): P
}
const reflectFn2: ReflectFuncton = reflect
const reflectFn3: IReflectFuncton = reflect
```

将类型入参的定义移动到类型别名或接口名称后，此时定义的一个接收具体类型入参后返回一个新类型的类型就是泛型类型。如下示例中，我们定义了两个可以接收入参 P 的泛型类型（GenericReflectFunction 和 IGenericReflectFunction ）。

```ts
type GenericReflectFunction<P> = (param: P) => P
interface IGenericReflectFunction<P> {
  (param: P): P
}
const reflectFn4: GenericReflectFunction<string> = reflect // 具象化泛型
const reflectFn5: IGenericReflectFunction<number> = reflect // 具象化泛型
const reflectFn3Return = reflectFn4('string') // 入参和返回值都必须是 string 类型
const reflectFn4Return = reflectFn5(1) //  入参和返回值都必须是 number 类型
```

在泛型定义中，我们甚至可以使用一些类型操作符进行运算表达，使得泛型可以根据入参的类型衍生出各异的类型，如下代码所示：

```ts
type StringOrNumberArray<E> = E extends string | number ? E[] : E
type StringArray = StringOrNumberArray<string> // 类型是 string[]
type NumberArray = StringOrNumberArray<number> // 类型是 number[]
type NeverGot = StringOrNumberArray<boolean> // 类型是 boolean
```

**发散一下，如果我们给上面这个泛型传入了一个 string | boolean 联合类型作为入参，将会得到什么类型呢？且看如下所示示例：**

```ts
type BooleanOrString = string | boolean
type WhatIsThis = StringOrNumberArray<BooleanOrString> // 好像应该是 string | boolean ?
type BooleanOrStringGot = BooleanOrString extends string | number
  ? BooleanOrString[]
  : BooleanOrString //  string | boolean
```

但是实际上 WhatIsThis 的类型是`boolean | string[]`，而 BooleanOrStringGot 变成了`string | boolean`，为什么呢？

这个就是所谓的分配条件类型（Distributive Conditional Types），官方的释义：**在条件类型判断的情况下（比如上边示例中出现的 extends），如果入参是联合类型，则会被拆解成一个个独立的（原子）类型（成员）进行类型运算。**

而 BooleanOrStringGot 并没有用到泛型，所以不会有分配条件类型。

> **注意：枚举类型不支持泛型。**

## 泛型约束

比如最前边提到的原封不动返回参数的 reflect 函数，我们希望把接收参数的类型限定在几种原始类型的集合中，此时就可以使用“泛型入参名 extends 类型”语法达到这个目的，如下代码所示：

```ts
function reflectSpecified<P extends number | string | boolean>(param: P): P {
  return param
}
reflectSpecified('string') // ok
reflectSpecified(1) // ok
reflectSpecified(true) // ok
reflectSpecified(null) // ts(2345) 'null' 不能赋予类型 'number | string | boolean'
```

我们还可以在多个不同的泛型入参之间设置约束关系，如下代码所示：

```ts
interface ObjSetter {
  <O extends {}, K extends keyof O, V extends O[K]>(obj: O, key: K, value: V): V
}
const setValueOfObj: ObjSetter = (obj, key, value) => (obj[key] = value)
setValueOfObj({ id: 1, name: 'name' }, 'id', 2) // ok
setValueOfObj({ id: 1, name: 'name' }, 'name', 'new name') // ok
setValueOfObj({ id: 1, name: 'name' }, 'age', 2) // ts(2345)
setValueOfObj({ id: 1, name: 'name' }, 'id', '2') // ts(2345)
```

泛型入参的约束与默认值还可以组合使用，如下代码所示：

```ts
interface ReduxModelMixed<State extends {} = { id: number; name: string }> {
  state: State
}
```
