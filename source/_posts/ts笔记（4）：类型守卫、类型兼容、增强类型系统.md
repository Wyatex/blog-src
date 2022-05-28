---
title: ts笔记（4）：类型守卫、类型兼容、增强类型系统
date: 2021-11-06 16:54:25
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

下面是 TypeScript 进阶内容

<!-- more -->

# 类型守卫

JavaScript 作为一种动态语言，意味着其中的参数、值可以是多态（多种类型）。因此，我们需要区别对待每一种状态，以此确保对参数、值的操作合法。举一个常见的场景为例，如下我们定义了一个可以接收字符串或者字符串数组的参数 toUpperCase，并将参数转成大写格式输出的函数 convertToUpperCase。

```ts
const convertToUpperCase = (strOrArray) => {
  if (typeof strOrArray === 'string') {
    return strOrArray.toUpperCase()
  } else if (Array.isArray(strOrArray)) {
    return strOrArray.map((item) => item.toUpperCase())
  }
}
```

在 TypeScript 中，因为受静态类型检测约束，所以在编码阶段我们必须使用类似的手段确保当前的数据类型支持相应的操作。当然，前提条件是已经显式地注解了类型的多态。

```ts
const convertToUpperCase = (strOrArray: string | string[]) => {
  if (typeof strOrArray === 'string') {
    return strOrArray.toUpperCase()
  } else if (Array.isArray(strOrArray)) {
    return strOrArray.map((item) => item.toUpperCase())
  }
}
```

从示例中，我们可以看到类型守卫的作用在于触发类型缩小。实际上，它还可以用来区分类型集合中的不同成员。

## 如何区分联合类型？

首先，我们看一下如何使用类型守卫来区分联合类型的不同成员，常用的类型守卫包括 switch、字面量恒等、typeof、instanceof、in 和自定义类型守卫这几种。

### switch

```ts
const convert = (c: 'a' | 1) => {
  switch (c) {
    case 1:
      return c.toFixed() // c is 1
    case 'a':
      return c.toLowerCase() // c is 'a'
  }
}
const feat = (
  c: { animal: 'panda'; name: 'China' } | { feat: 'video'; name: 'Japan' }
) => {
  switch (c.name) {
    case 'China':
      return c.animal // c is "{ animal: 'panda'; name: 'China' }"
    case 'Japan':
      return c.feat // c is "{ feat: 'video'; name: 'Japan' }"
  }
}
```

### 字面量恒等

```ts
const convert = (c: 'a' | 1) => {
  if (c === 1) {
    return c.toFixed() // c is 1
  } else if (c === 'a') {
    return c.toLowerCase() // c is 'a'
  }
}
```

### typeof

```ts
const convert = (c: 'a' | 1) => {
  if (typeof c === 'number') {
    return c.toFixed() // c is 1
  } else if (typeof c === 'string') {
    return c.toLowerCase() // c is 'a'
  }
}
```

### instanceof

```ts
class Dog {
  wang = 'wangwang'
}
class Cat {
  miao = 'miaomiao'
}
const getName = (animal: Dog | Cat) => {
  if (animal instanceof Dog) {
    return animal.wang
  } else if (animal instanceof Cat) {
    return animal.miao
  }
}
```

### in

当联合类型的成员包含接口类型（对象），并且接口之间的属性不同，如下示例中的接口类型 Dog、Cat，我们不能直接通过“ . ”操作符获取 param 的 wang、miao 属性，从而区分它是 Dog 还是 Cat。

```ts
interface Dog {
  wang: string
}
interface Cat {
  miao: string
}
const getName = (animal: Dog | Cat) => {
  if (typeof animal.wang == 'string') {
    // ts(2339)
    return animal.wang // ts(2339)
  } else if (animal.miao) {
    // ts(2339)
    return animal.miao // ts(2339)
  }
}
// 改成这样
const getName = (animal: Dog | Cat) => {
  if ('wang' in animal) {
    // ok
    return animal.wang // ok
  } else if ('miao' in animal) {
    // ok
    return animal.miao // ok
  }
  return
}
```

### 自定义类型守卫

```ts
const isDog = function (animal: Dog | Cat): animal is Dog {
  return 'wang' in animal
}
const getName = (animal: Dog | Cat) => {
  if (isDog(animal)) {
    return animal.wang
  }
}
```

## 如何区别枚举类型？

最佳实践时，永远不要拿枚举和除了自身之外的任何枚举、类型进行比较。

```ts
enum A {
  one,
  two,
}
enum B {
  one,
  two,
}
const cpWithNumber = (param: A) => {
  if (param === 1) {
    // bad
    return param
  }
}
const cpWithOtherEnum = (param: A) => {
  if (param === (B.two as unknown as A)) {
    // ALERT bad
    return param
  }
}
const cpWithSelf = (param: A) => {
  if (param === A.two) {
    // good
    return param
  }
}
```

## 失效的类型守卫

失效的类型守卫指的是某些类型守卫应用在泛型函数中时不能缩小类型，即失效了。比如我们改造了一个可以接受泛型入参的 getName 函数，如下代码所示：

```ts
// 4.3.x前
const getName = <T extends Dog | Cat>(animal: T) => {
  if ('wang' in animal) {
    return animal.wang // ts(2339)
  }
  return animal.miao // ts(2339)
}
```

在 4.3.x 之前的版本：上述示例中，虽然我们在第 2 行使用了 in 类型守卫，但是它并没有让 animal 的类型如预期那样缩小为 Dog 的子类型，所以第 3 行的 T 类型上没有 wang 属性，从而提示一个 ts(2339) 的错误。所以第 5 行的 animal 也不会缩小为 Cat 的子类型，从而也会提示一个 ts(2339) 的错误。

4.3.x 之后的版本：可以在泛型入参的函数中使用 in 类型守卫。

4.3.x 之前的版本：我们把 in 操作换成自定义类型守卫 isDog 或者使用 instanceOf，animal 的类型就会缩小成了 Dog 的子类型（T & Dog），所以第 3 行不会提示 ts(2339) 的错误。由此可见，in 和 instanceOf、类型谓词在泛型类型缩小上是有区别的。

```ts
const getName = <T extends Dog | Cat>(animal: T) => {
  if (isDog(animal)) {
    // instanceOf 亦可
    return animal.wang // ok
  }
  return animal.miao // 4.3.x之前的版本：ts(2339)
}
```

但是，在缺省的 else 条件分支里，animal 的类型并没有缩小成 Cat 的子类型，所以第 5 行依旧会提示一个 ts(2339) 的错误，但是 4.3.x 之后的版本修复了这个问题，不会再报错。

```ts
// 4.3.x之前可以这样：
const getName = <T extends Dog | Cat>(animal: T) => {
  if (isDog(animal)) {
    // instanceOf 亦可
    return animal.wang // ok
  }
  return (animal as Cat).miao // ok
}
```

# 类型兼容：如何判断一个类型是否可以赋值给其他类型？

## 特例

1. any：any 类型可以赋值给除了 never 之外的任意其他类型，反过来其他类型也可以赋值给 any。也就是说 any 可以兼容除 never 之外所有的类型，同时也可以被所有的类型兼容（即 any 既是 bottom type，也是 top type）
2. never：never 的特性是可以赋值给任何其他类型，但反过来不能被其他任何类型（包括 any 在内）赋值（即 never 是 bottom type）。
3. unknown：unknown 的特性和 never 的特性几乎反过来，即我们不能把 unknown 赋值给除了 any 之外任何其他类型，反过来其他类型都可以赋值给 unknown（即 unknown 是 top type）。
4. void、null、undefined：void、null、undefined 这三大废材类型的兼容性也很特别，比如 void 类型仅可以赋值给 any 和 unknown 类型，反过来仅 any、never、undefined 可以赋值给 void
5. enum：最后一个特例是 enum 枚举类型，其中数字枚举和数字类型相互兼容。

```ts
enum A {
  one,
}
let num: number = A.one // ok
let fun = (param: A) => void 0
fun(1) // ok
```

## 类型兼容性

### 子类型

从子类型的角度来看，所有的子类型与它的父类型都兼容，如下代码所示：

```ts
const one = 1
let num: number = one // ok
interface IPar {
  name: string
}
interface IChild extends IPar {
  id: number
}
let Par: IPar
let Child: IChild
Par = Child // ok
class CPar {
  cname = ''
}
class CChild extends CPar {
  cid = 1
}
let ParInst: CPar
let ChildInst: CChild
ParInst = ChildInst // ok
let mixedNum: 1 | 2 | 3 = one // ok

let ICPar: IPar | CPar
let ICChild: IChild | CChild
ICPar = ICChild // ok
```

### 结构类型

类型兼容性的另一准则是结构类型，即如果两个类型的结构一致，则它们是互相兼容的。比如拥有相同类型的属性、方法的接口类型或类，则可以互相赋值。

```ts
class C1 {
  name = '1'
}
class C2 {
  name = '2'
}
interface I1 {
  name: string
}
interface I2 {
  name: string
}
let InstC1: C1
let InstC2: C2
let O1: I1
let O2: I2
InstC1 = InstC2 // ok
O1 = O2 // ok
InstC1 = O1 // ok
O2 = InstC2 // ok
```

另外一个特殊的场景：两个接口类型或者类，如果其中一个类型不仅拥有另外一个类型全部的属性和方法，还包含其他的属性和方法（如同继承自另外一个类型的子类一样），那么前者是可以兼容后者的。

```ts
interface I1 {
  name: string
}
interface I2 {
  id: number
  name: string
}
class C2 {
  id = 1
  name = '1'
}
let O1: I1
let O2: I2
let InstC2: C2
O1 = O2
O1 = InstC2
```

> 这里涉及一个需要特别注意的特性：虽然包含多余属性 id 的变量 O2 可以赋值给变量 O1，但是如果我们直接将一个与变量 O2 完全一样结构的对象字面量赋值给变量 O1，则会提示一个 ts(2322) 类型不兼容的错误，这就是对象字面的 freshness 特性。

```ts
O1 = {
  id: 2, // ts(2322)
  name: 'name',
}
let O3 = {
  id: 2,
  name: 'name',
}
O1 = O3 // ok
O1 = {
  id: 2,
  name: 'name',
} as I2 // ok
```

另外，我们还需要注意类兼容性特性：实际上，在判断两个类是否兼容时，我们可以完全忽略其构造函数及静态属性和方法是否兼容，只需要比较类实例的属性和方法是否兼容即可。如果两个类包含私有、受保护的属性和方法，则仅当这些属性和方法源自同一个类，它们才兼容。

```ts
class C1 {
    name = '1';
    private id = 1;
    protected age = 30;
  }
  class C2 {
    name = '2';
    private id = 1;
    protected age = 30;
  }
  let InstC1: C1;
  let InstC2: C2;
  InstC1 = InstC2; // ts(2322)
  InstC2 = InstC1; // ts(2322)
}
{
  class CPar {
    private id = 1;
    protected age = 30;
  }
  class C3 extends CPar {
    constructor(inital: string) {
      super();
    }
    name = '1';
    static gender = 'man';
  }
  class C4 extends CPar {
    constructor(inital: number) {
      super();
    }
    name = '2';
    static gender = 'woman';
  }
  let InstC3: C3;
  let InstC4: C4;
  InstC3 = InstC4; // ok
  InstC4 = InstC3; // ok
```

因为类 C1 和类 C2 各自包含私有和受保护的属性，且实例 InstC1 和 InstC2 不能相互赋值，所以提示了一个 ts(2322) 类型的错误。因为类 C3、类 C4 的私有、受保护属性都继承自同一个父类 CPar，所以检测类型兼容性时会忽略其类型不相同的构造函数和静态属性 gender，也因此实例 InstC3 和 实例 InstC4 之间可以相互赋值。

### 可继承和可实现

类型兼容性还决定了接口类型和类是否可以通过 extends 继承另外一个接口类型或者类，以及类是否可以通过 implements 实现接口。

```ts
interface I1 {
  name: number
}
interface I2 extends I1 {
  // ts(2430)
  name: string
}
class C1 {
  name = '1'
  private id = 1
}
class C2 extends C1 {
  // ts(2415)
  name = '2'
  private id = 1
}
class C3 implements I1 {
  name = '' // ts(2416)
}
```

## 泛型

泛型类型、泛型类的兼容性实际指的是将它们实例化为一个确切的类型后的兼容性。可以通过指定类型入参实例化泛型，且入参只有作为实例化后的类型的一部分时才能影响类型兼容性:

```ts
interface I1<T> {
  id: number
}
let O1: I1<string>
let O2: I1<number> = { id: 1 }
O1 = O2
```

因为接口泛型 I1 的入参 T 是无用的，且实例化类型 `I1<string> 和 I1<numer>` 的结构一致，即类型兼容，所以对应的变量 O2 可以给变量 O1 赋值。

而对于未明确指定类型入参泛型的兼容性，例如函数泛型（实际上仅有函数泛型才可以在不需要实例化泛型的情况下赋值），TypeScript 会把 any 类型作为所有未明确指定的入参类型实例化泛型，然后再检测其兼容性，如下代码所示：

```ts
let fun1 = <T>(p1: T): 1 => 1
let fun2 = <T>(p2: T): number => 2
fun2 = fun1 // ok？
```

这两个函数的类型兼容吗？答案：兼容。

为什么兼容呢？这就涉及接下来我们要介绍的函数类型兼容性。在此之前，我们先了解一下判定函数类型兼容性的基础理论知识：变型。

## 变型

TypeScript 中的变型指的是根据类型之间的子类型关系推断基于它们构造的更复杂类型之间的子类型关系。比如根据 Dog 类型是 Animal 类型子类型这样的关系，我们可以推断数组类型 Dog[] 和 Animal[] 、函数类型 () => Dog 和 () => Animal 之间的子类型关系。

### 协变

```ts
type isChild<Child, Par> = Child extends Par ? true : false
interface Animal {
  name: string
}
interface Dog extends Animal {
  woof: () => void
}
type Covariance<T> = T // 复杂类型构造器，原封不动返回了类型入参 T
type isCovariant = isChild<Covariance<Dog>, Covariance<Animal>> // true

type isPropAssignmentCovariant = isChild<{ type: Dog }, { type: Animal }> // true
type isArrayElementCovariant = isChild<Dog[], Animal[]> // true
type isReturnTypeCovariant = isChild<() => Dog, () => Animal> // true
```

因为 Covariant<Dog> 是 Covariant<Animal> 的子类型，所以类型 isCovariant 是 true，这就是协变。实际上接口类型的属性、数组类型、函数返回值的类型都是协变的。

### 逆变

实际场景中，在我们推崇的 TypeScript 严格模式下，函数参数类型是逆变的，具体示例如下：

```ts
type Contravariance<T> = (param: T) => void
type isNotContravariance = isChild<Contravariance<Dog>, Contravariance<Animal>> // false;
type isContravariance = isChild<Contravariance<Animal>, Contravariance<Dog>> // true;
```

TypeScript 严格模式的设定是函数参数类型是逆变的，所以 Contravariance<Animal> 会是 Contravariance<Dog> 的子类型。

为了更易于理解，我们可以从安全性的角度理解函数参数是逆变的设定。

> 如果函数参数类型是协变而不是逆变，那么意味着函数类型 (param: Dog) => void 和 (param: Animal) => void 是兼容的，这与 Dog 和 Animal 的兼容一致，所以我们可以用 (param: Dog) => void 代替 (param: Animal) => void 遍历 Animal[] 类型数组。但是，这样是不安全的，因为它不能确保 Animal[] 数组中的成员都是 Dog（可能混入 Animal 类型的其他子类型，比如 Cat），这就会导致 (param: Dog) => void 类型的函数可能接收到 Cat 类型的入参。

```ts
const visitDog = (animal: Dog) => {
  animal.woof()
}
let animals: Animal[] = [{ name: 'Cat', miao: () => void 0 }]
animals.forEach(visitDog) // ts(2345)
```

在示例中，如果函数参数类型是协变的，那么第 5 行就可以通过静态类型检测，而不会提示一个 ts(2345) 类型的错误。这样第 1 行定义的 visitDog 函数在运行时就能接收到 Dog 类型之外的入参，并调用不存在的 woof 方法，从而在运行时抛出错误。

### 双向协变

对应到实际的场景，在 TypeScript 非严格模式下，函数参数类型就是双向协变的。如前边提到函数只有在参数是逆变的情况下才安全，且本课程一直在强调使用严格模式，所以双向协变并不是一个安全或者有用的特性，因此我们不大可能遇到这样的实际场景。
但在某些资料中有提到，如果函数参数类型是双向协变，那么它是有用的，并进行了举例论证 （以下示例缩减自网络）：

```ts
interface Event {
  timestamp: number
}
interface MouseEvent extends Event {
  x: number
  y: number
}
function addEventListener(handler: (n: Event) => void) {}
addEventListener((e: MouseEvent) => console.log(e.x + ',' + e.y)) // ts(2769)
```

真正有用且安全的做法是使用泛型，如下所示：

```ts
function addEventListener<E extends Event>(handler: (n: E) => void) {}
addEventListener((e: MouseEvent) => console.log(e.x + ',' + e.y)) // ok
```

### 不变

不变即只要是不完全一样的类型，它们一定是不兼容的。

对应到实际场景，出于类型安全层面的考虑，在特定情况下我们可能希望数组是不变的（实际上是协变），见示例：

```ts
interface Cat extends Animal {
  miao: () => void
}
const cat: Cat = {
  name: 'Cat',
  miao: () => void 0,
}
const dog: Dog = {
  name: 'Dog',
  woof: () => void 0,
}
let dogs: Dog[] = [dog]
let animals: Animal[] = dogs // ok
animals.push(cat) // ok
dogs.forEach(visitDog) // 类型 ok，但运行时会抛出错误
```

因为数组是协变的，所以我们可以在第 13 行把 dogs 数组赋值给 animals 数组，并且在第 14 行把 cat 对象塞到 animals 数组中。那么问题就来了，因为 animals 和 dogs 指向的是同一个数组，所以实际上我们是把 cat 塞到了 dogs 数组中。然后，我们在第 15 行使用了 visitDog 函数遍历 dogs 数组。虽然它可以通过静态类型检测，但是运行时 visitDog 遍历数组将接收一个混入的 cat 对象并抛出错误，因为 visitDog 中调用了 cat 上没有 woof 的方法。

**因此，对于可变的数组而言，不变似乎是更安全、合理的设定。不过，在 TypeScript 中可变、不变的数组都是协变的，这是需要我们注意的一个陷阱。**

> 前面的函数类型 (p1: any) => 1 和 (param: any) => number 为什么兼容的问题已经给出答案了。因为返回值类型 1 是 number 的子类型，且返回值类型是协变的，所以 (p1: any) => 1 是 (param: any) => number 的子类型，即是兼容的。

## 函数类型兼容性

因为函数类型的兼容性、子类型关系有着更复杂的考量（它还需要结合参数和返回值的类型进行确定），所以下面我们详细介绍一下函数类型兼容性的一般规则。

### 返回值

前边我们已经讲过返回值类型是协变的，所以在参数类型兼容的情况下，函数的子类型关系与返回值子类型关系一致。也就是说返回值类型兼容，则函数兼容。

### 参数类型

前边我们也讲过参数类型是逆变的，所以在参数个数相同、返回值类型兼容的情况下，函数子类型关系与参数子类型关系是反过来的（逆变）。

### 参数个数

在索引位置相同的参数和返回值类型兼容的前提下，函数兼容性取决于参数个数，参数个数少的兼容个数多，下面我们看一个具体的示例：

```ts
let lessParams = (one: number) => void 0
let moreParams = (one: number, two: string) => void 0
lessParams = moreParams // ts(2322)
moreParams = lessParams // ok
```

> 如果你觉得参数个数少的函数兼容参数个数多的函数不好理解，那么可以试着从安全性角度理解

### 可选和剩余参数

```ts
let optionalParams = (one?: number, tow?: number) => void 0
let requiredParams = (one: number, tow: number) => void 0
let restParams = (...args: number[]) => void 0
requiredParams = optionalParams // ok
restParams = optionalParams // ok
optionalParams = restParams // ts(2322)
optionalParams = requiredParams // ts(2322)
restParams = requiredParams // ok
requiredParams = restParams // ok
```

最让人费解的是，在第 8 行中，把不可选参数 requiredParams 赋值给剩余参数 restParams 其实是不安全的（但是符合类型检测），我们需要从方便性上理解这个设定。

正是基于这个设定，我们才可以将剩余参数类型函数定义为其他所有参数类型函数的父类型，并用来约束其他类型函数的类型范围，比如说在泛型中约束函数类型入参的范围。具体实例：

```ts
type GetFun<F extends (...args: number[]) => any> = Parameters<F>
type GetRequiredParams = GetFun<typeof requiredParams>
type GetRestParams = GetFun<typeof restParams>
type GetEmptyParams = GetFun<() => void>
```

在示例中的第 1 行，我们使用剩余参数函数类型 (...args: number[]) => any 约束了入参 F 的类型，而第 2~4 行传入的函数类型入参都是这个剩余参数函数类型的子类型。

# 必备增强类型系统的方式大盘点

## 声明

### declare 变量

在运行时，前端代码 `<script>` 标签会引入一个全局的库，再导入全局变量。此时，如果你想安全地使用全局变量，那么就需要对变量的类型进行声明。

```ts
declare var val1: string
declare let val2: number
declare const val3: boolean
val1 = '1'
val2 = 1
val2 = '2' // TS2322: Type 'string' is not assignable to type 'number'.
val3 = true // TS2588: Cannot assign to 'val3' because it is a constant.
```

### 声明函数

```ts
declare function toString(x: number): string
const x = toString(1) // => string
```

**使用 declare 关键字时，不能编写声明的变量、函数、类的具体实现**

### 声明类

```ts
declare class Person {
  public name: string
  private age: number
  constructor(name: string)
  getAge(): number
}
const person = new Person('Mike')
person.name // => string
person.age // TS2341: Property 'age' is private and only accessible within class 'Person'.
person.getAge() // => number
```

### 声明枚举

```ts
declare enum Direction {
  Up,
  Down,
  Left,
  Right,
}
const directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
]
```

## declare 模块

在 JavaScript 还没有升级至 ES6 的时候，TypeScript 就提供了一种模块化方案，比如通过使用 module 关键字，我们就可以声明一个内部模块。但是由于 ES6 后来也使用了 module 关键字，为了兼容 ES6，所以 TypeScript 使用 namespace 替代了原来的 module，并更名为命名空间。

```ts lodash.d.ts
declare module 'lodash' {
  export function first<T extends unknown>(array: T[]): T
}
```

```ts index.ts
import { first } from 'lodash'
first([1, 2, 3]) // => number;
```

## declare 文件

在使用 TypeScript 开发前端应用时，我们可以通过 import 关键字导入文件，比如先使用 import 导入图片文件，再通过 webpack 等工具处理导入的文件。

但是，因为 TypeScript 并不知道我们通过 import 导入的文件是什么类型，所以需要使用 declare 声明导入的文件类型，下面看一个具体的示例：

```ts
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
```

这里标记的图片文件的默认导出的类型是 string ，通过 import 使用图片资源时，TypeScript 会将导入的图片识别为 string 类型，因此也就可以把 import 的图片赋值给 的 src 属性，因为它们的类型都是 string，是匹配的。

## declare namespace

不同于声明模块，命名空间一般用来表示具有很多子属性或者方法的全局对象变量。

我们可以将声明命名空间简单看作是声明一个更复杂的变量，如下示例：

```ts
declare namespace $ {
  const version: number
  function ajax(settings?: any): void
}
$.version // => number
$.ajax()
```

## 声明文件

在 TypeScript 中，以 .d.ts 为后缀的文件为声明文件。如果你熟悉 C/C++，那么可以把它当作 .h 文件。 在声明文件时，我们只需要定义三方类库所暴露的 API 接口即可。

在 TypeScript 中，存在类型、值、命名空间这 3 个核心概念。如果你掌握了这些核心概念，那么就能够为任何形式的类型书写声明文件了。

### 类型

- 类型别名声明
- 接口声明
- 类声明
- 枚举声明
- 导入的类型声明

上面的每一个声明都创建了一个类型名称。

### 值

我们可以通过以下 6 种方式创建值：

- var、let、const 声明
- namespace、module 包含值的声明
- 枚举声明
- 类声明
- 导入的值
- 函数声明

### 命名空间

在命名空间中，我们也可以声明类型。比如 const x: A.B.C 这个声明，这里的类型 C 就是在 A.B 命名空间下的。一个名称 A， 在 TypeScript 中可能表示一个类型、一个值，也可能是一个命名空间。通过类型、值、命名空间的组合，我们也就拥有了表达任意类型的能力。如果你想知道名称 A 代表的实际意义，则需要看它所在的上下文。

### 使用声明文件

安装 TypeScript 依赖后，一般我们会顺带安装一个 lib.d.ts 声明文件，这个文件包含了 JavaScript 运行时以及 DOM 中各种全局变量的声明，如下示例：

```ts
// typescript/lib/lib.d.ts
/// <reference no-default-lib="true"/>
/// <reference lib="es5" />
/// <reference lib="dom" />
/// <reference lib="webworker.importscripts" />
/// <reference lib="scripthost" />
```

上面的示例其实就是 TypeScript 中的 lib.d.ts 文件的内容。其中，/// 是 TypeScript 中三斜线指令，后面的内容类似于 XML 标签的语法，用来指代引用其他的声明文件。通过三斜线指令，我们可以更好地复用和拆分类型声明。no-default-lib="true" 表示这个文件是一个默认库。而最后 4 行的 lib="..." 表示引用内部的库类型声明。

[三斜线指令官方文档](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)

### 使用 @types

前面我们介绍了如何为 JavaScript 库编写类型声明，然而为库编写类型声明非常耗费精力，且难以在多个项目中复用。[Definitely Typed](https://github.com/DefinitelyTyped/DefinitelyTyped?fileGuid=xxQTRXtVcqtHK6j8) 是最流行性的高质量 TypeScript 声明文件类库，正是因为有社区维护的这个声明文件类库，大大简化了 JavaScript 项目迁移 TypeScript 的难度。

目前，社区已经记录了 90% 的 JavaScript 库的类型声明，意味着如果我们想使用的库有社区维护的类型声明，那么就可以通过安装类型声明文件直接使用 JavaScript 编写的类库了。

具体操作：首先，[点击这里的链接](https://www.typescriptlang.org/dt/search?search=&fileGuid=xxQTRXtVcqtHK6j8)搜索你想要导入的类库的类型声明，如果有社区维护的声明文件。然后，我们只需要安装 @types/xxx 就可以在 TypeScript 中直接使用它了。

然而，因为 Definitely Typed 是由社区人员维护的，如果原来的三方库升级，那么 Definitely Typed 所导出的三方库的类型定义想要升级还需要经过 PR、发布的流程，就会导致无法与原库保持完全同步。针对这个问题，在 TypeScript 中，我们可以通过类型合并、扩充类型定义的技巧临时解决。

## 类型合并

### 合并接口

```ts
interface Person {
  name: string
}
interface Person {
  age: number
}
// 相当于
interface Person {
  name: string
  age: number
}
```

对于函数成员而言，每个同名的函数声明都会被当作这个函数的重载。**需要注意的是后面声明的接口具有更高的优先级**

```ts
interface Obj {
  identity(val: any): any
}
interface Obj {
  identity(val: number): number
}
interface Obj {
  identity(val: boolean): boolean
}
// 相当于
interface Obj {
  identity(val: boolean): boolean
  identity(val: number): number
  identity(val: any): any
}
const obj: Obj = {
  identity(val: any) {
    return val
  },
}
const t1 = obj.identity(1) // => number
const t2 = obj.identity(true) // => boolean
const t3 = obj.identity('t3') // => any
```

### 合并 namespace

合并 namespace 与合并接口类似，命名空间的合并也会合并其导出成员的属性。不同的是，非导出成员仅在原命名空间内可见。

```ts
namespace Person {
  const age = 18
  export function getAge() {
    return age
  }
}
namespace Person {
  export function getMyAge() {
    return age // TS2304: Cannot find name 'age'.
  }
}
```

### 不可合并

介绍类类型时我们说过，定义一个类类型，相当于定义了一个类，又定义了一个类的类型。因此，对于类这个既是值又是类型的特殊对象不能合并。

除了可以通过接口和命名空间合并的方式扩展原来声明的类型外，我们还可以通过扩展模块或扩展全局对象来增强类型系统。

## 扩充模块

JavaScript 是一门动态类型的语言，通过 prototype 我们可以很容易地扩展原来的对象。但是，如果我们直接扩展导入对象的原型链属性，TypeScript 会提示没有该属性的错误，因此我们就需要扩展原模块的属性。

```ts person.ts
export class Person {}
```

```ts index.ts
import { Person } from './person'
declare module './person' {
  // 扩展模块的声明
  interface Person {
    greet: () => void
  }
}
Person.prototype.greet = () => {
  console.log('Hi!')
}
```

如果我们删除了扩展模块的声明，则会报出 ts(2339) 不存在 greet 属性的类型错误。

## 扩充全局

全局模块指的是不需要通过 import 导入即可使用的模块，如全局的 window、document 等。对全局对象的扩充与对模块的扩充是一样的，下面看一个具体示例：

```ts
declare global {
  interface Array<T extends unknown> {
    getLen(): number
  }
}
Array.prototype.getLen = function () {
  return this.length
}
```
