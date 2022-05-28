---
title: ts笔记（2）：函数、类、接口类型和类型别名
date: 2021-10-31 20:58:14
tags:
  - TypeScript
  - 前端
  - 学习笔记
categories: TypeScript
---

这章讲解函数类型、类类型、接口类型、类型别名、

<!-- more -->

# 函数类型

在 TypeScript 里我们可以显式指定函数参数和返回值的类型，如下：

```ts
const add = (a: number, b: number): number => {
  return a + b
}
```

## 返回值类型

在 JavaScript 中，我们知道一个函数可以没有显式 return，此时函数的返回值应该是 undefined，而**函数的返回类型是 void 类型**。

> 需要注意的是，在 TypeScript 中，如果我们显式声明函数的返回值类型为 undfined，将会得到如下所示的错误提醒。

```ts
// ts(2355) A function whose declared type is neither 'void' nor 'any' must return a value
function fn(): undefined {
  // TODO
}
```

按照上一章，如果函数不需要返回值应该使用 void 来表示返回值类型，这应该算是 void 类型的唯一用处了。

```ts
function fn1(): void {}
fn1().doSomething() // ts(2339) Property 'doSomething' does not exist on type 'void'.
```

我们可以使用类似定义箭头函数的语法来表示函数类型的参数和返回值类型，此时=> 类型仅仅用来定义一个函数类型而不用实现这个函数。**需要注意的是，这里的=>与 ES6 中箭头函数的=>有所不同。TypeScript 函数类型中的=>用来表示函数的定义，其左侧是函数的参数类型，右侧是函数的返回值类型；而 ES6 中的=>是函数的实现**。如下：

```ts
type Adder = (a: number, b: number) => number // TypeScript 函数类型定义
const add: Adder = (a, b) => a + b // ES6 箭头函数
```

在对象中，除了使用这种声明语法，我们还可以使用类似对象属性的简写语法来声明函数类型的属性，如下代码所示：

```ts
interface Entity {
  add: (a: number, b: number) => number
  del(a: number, b: number): number
}
const entity: Entity = {
  add: (a, b) => a + b,
  del(a, b) {
    return a - b
  },
}
```

## 可缺省和可推断的返回值类型

幸运的是，函数返回值的类型可以在 TypeScript 中被推断出来，即可缺省。

函数内是一个相对独立的上下文环境，我们可以根据入参对值加工计算，并返回新的值。从类型层面看，我们也可以通过类型推断（回想一下 04 讲中的类型推断、上下文类型推断）加工计算入参的类型，并返回新的类型，示例如下：

```ts
function computeTypes(one: string, two: number) {
  const nums = [two]
  const strs = [one]
  return {
    nums,
    strs,
  } // 返回 { nums: number[]; strs: string[] } 的类型
}
```

一般情况下，TypeScript 中的函数返回值类型是可以缺省和推断出来的，但是有些特例需要我们显式声明返回值类型，比如 Generator 函数的返回值。

## Generator 函数的返回值

Generator 函数返回的是一个 Iterator 迭代器对象，我们可以使用 Generator 的同名接口泛型或者 Iterator 的同名接口泛型表示返回值的类型，示例如下：

```ts
type AnyType = boolean
type AnyReturnType = string
type AnyNextType = number
function* gen(): Generator<AnyType, AnyReturnType, AnyNextType> {
  const nextValue = yield true // nextValue 类型是 number，yield 后必须是 boolean 类型
  return `${nextValue}` // 必须返回 string 类型
}
```

## 可选参数和默认参数

在实际情况中可能会遇到函数参数可以可传或不传的情况，在 ts 中也一样可以表达

```ts
function log(x?: string) {
  // function log(x?: string | undefined): string | undefined
  return x
}
log() // => undefined
log('hello world') // => hello world
```

如果在类型标注的`:`前加上`?`表示 log 函数的参数 x 就是可缺省的，也就是说 x 的类型可能是`undefined`

但是并不意味着可缺省和类型是 `undefined` 等价的：

```ts
function log(x?: string) {
  console.log(x)
}
function log1(x: string | undefined) {
  console.log(x)
}
log()
log(undefined)
log1() // ts(2554) Expected 1 arguments, but got 0
log1(undefined)
```

显然这里的`?:`表示参数可以缺省、可以不传，也就是说调用函数时，我们可以不显式传入参数。但是，如果我们声明了参数类型为 xxx | undefined，就表示函数参数是不可缺省且类型必须是 xxx 或者 undfined。

在 ES6 中支持函数默认参数的功能，而 TypeScript 会根据函数的默认参数的类型来推断函数参数的类型，示例如下：

```ts
function log(x = 'hello') {
  console.log(x)
}

log() // => 'hello'

log('hi') // => 'hi'

log(1) // ts(2345) Argument of type '1' is not assignable to parameter of type 'string | undefined'
```

在上述示例中，根据函数的默认参数 'hello' ，TypeScript 推断出了 x 的类型为 string | undefined。

## 剩余参数

在 ES6 中，JavaScript 支持函数参数的剩余参数，它可以把多个参数收集到一个变量中。同样，在 TypeScript 中也支持这样的参数类型定义，如下代码所示：

```ts
function sum(...nums: number[]) {
  return nums.reduce((a, b) => a + b, 0)
}

sum(1, 2) // => 3

sum(1, 2, 3) // => 6

sum(1, '2') // ts(2345) Argument of type 'string' is not assignable to parameter of type 'number'
```

如果我们将函数参数 nums 聚合的类型定义为 (number | string)[]，如下代码所示：

```ts
function sum(...nums: (number | string)[]): number {
  return nums.reduce<number>((a, b) => a + Number(b), 0)
}

sum(1, '2', 3) // 6
```

那么，函数的每一个参数的类型就是联合类型 number | string，因此 sum(1, '2', 3) 的类型检查也就通过了。

## this

使用了 TypeScript 后，通过指定 this 的类型（严格模式下，必须显式指定 this 的类型），当我们错误使用了 this，TypeScript 就会提示我们，如下代码所示：

```ts
function say() {
  console.log(this.name) // ts(2683) 'this' implicitly has type 'any' because it does not have a type annotation
}
say()
```

在上述代码中，如果我们直接调用 say 函数，this 可能指向全局 window 或 global（Node 中）或 undefined（浏览器 js 脚本开启 strict）。但是，在 strict 模式下的 TypeScript 中，它会提示 this 的类型是 any，此时就需要我们手动显式指定类型了。

```ts
function say(this: Window, name: string) {
  console.log(this.name)
}

window.say = say

window.say('hi')

const obj = {
  say,
}

obj.say('hi') // ts(2684) The 'this' context of type '{ say: (this: Window, name: string) => void; }' is not assignable to method's 'this' of type 'Window'.

say('captain') // ts(2684) The 'this' context of type 'void' is not assignable to method's 'this' of type 'Window'
```

> 需要注意的是，如果我们直接调用 say()，this 实际上应该指向全局变量 window，但是因为 TypeScript 无法确定 say 函数被谁调用，所以将 this 的指向默认为 void，也就提示了一个 ts(2684) 错误。

同样，定义对象的函数属性时，只要实际调用中 this 的指向与指定的 this 指向不同，TypeScript 就能发现 this 指向的错误，示例代码如下：

```ts
interface Person {
  name: string
  say(this: Person): void
}

const person: Person = {
  name: 'captain',
  say() {
    console.log(this.name)
  },
}

const fn = person.say
fn() // ts(2684) The 'this' context of type 'void' is not assignable to method's 'this' of type 'Person'
```

> 注意：显式注解函数中的 this 类型，它表面上占据了第一个形参的位置，但并不意味着函数真的多了一个参数，因为 TypeScript 转译为 JavaScript 后，“伪形参” this 会被抹掉。

同样，我们也可以显式限定类函数属性中的 this 类型，TypeScript 也能检查出错误的使用方式，如下代码所示：

```ts
class Component {
  onClick(this: Component) {}
}
const component = new Component()
interface UI {
  addClickListener(onClick: (this: void) => void): void
}
const ui: UI = {
  addClickListener() {},
}
ui.addClickListener(new Component().onClick) // ts(2345)
```

此外，在链式调用风格的库中，使用 this 也可以很方便地表达出其类型，如下代码所示：

```ts
class Container {
  private val: number

  constructor(val: number) {
    this.val = val
  }

  map(cb: (x: number) => number): this {
    this.val = cb(this.val)
    return this
  }

  log(): this {
    console.log(this.val)
    return this
  }
}

const instance = new Container(1)
  .map((x) => x + 1)
  .log() // => 2
  .map((x) => x * 3)
  .log() // => 6
```

因为 Container 类中 map、log 等函数属性（方法）未显式指定 this 类型，默认类型是 Container，所以以上方法在被调用时返回的类型也是 Container，this 指向一直是类的实例，它可以一直无限地被链式调用。

## 函数重载

下面代码通过 convert 函数将 string 类型的值转换为 number 类型，number 类型转换为 string 类型，而将 null 类型转换为数字 -1。此时， x1、x2、x3 的返回值类型都会被推断成 string | number

```ts
function convert(x: string | number | null): string | number | -1 {
  if (typeof x === 'string') {
    return Number(x)
  }
  if (typeof x === 'number') {
    return String(x)
  }
  return -1
}
const x1 = convert('1') // => string | number
const x2 = convert(1) // => string | number
const x3 = convert(null) // => string | number
```

如果想要精确的描述参数和返回值关系的话，就需要用到函数重载。

```ts
function convert(x: string): number
function convert(x: number): string
function convert(x: null): -1
function convert(x: string | number | null): any {
  if (typeof x === 'string') {
    return Number(x)
  }
  if (typeof x === 'number') {
    return String(x)
  }
  return -1
}
const x1 = convert('1') // => number
const x2 = convert(1) // => string
const x3 = convert(null) // -1
```

示例中 1~3 行定义了三种各不相同的函数类型列表，并描述了不同的参数类型对应不同的返回值类型，而从第 4 行开始才是函数的实现。

> 注意：函数重载列表的各个成员（即示例中的 1 ~ 3 行）必须是函数实现（即示例中的第 4 行）的子集，例如 “function convert(x: string): number”是“function convert(x: string | number | null): any”的子集。

在 convert 函数被调用时，TypeScript 会从上到下查找函数重载列表中与入参类型匹配的类型，并优先使用第一个匹配的重载定义。因此，我们需要把最精确的函数重载放到前面。比如下面实例：

```ts
interface P1 {
  name: string
}
interface P2 extends P1 {
  age: number
}
function convert(x: P1): number
function convert(x: P2): string
function convert(x: P1 | P2): any {}
const x1 = convert({ name: '' } as P1) // => number
const x2 = convert({ name: '', age: 18 } as P2) // number
```

因为 P2 继承自 P1，所以类型为 P2 的参数会和类型为 P1 的参数一样匹配到第一个函数重载，此时 x1、x2 的返回值都是 number。

```ts
function convert(x: P2): string
function convert(x: P1): number
function convert(x: P1 | P2): any {}
const x1 = convert({ name: '' } as P1) // => number
const x2 = convert({ name: '', age: 18 } as P2) // => string
```

而我们只需要将函数重载列表的顺序调换一下，类型为 P2 和 P1 的参数就可以分别匹配到正确的函数重载了

## 类型谓词（is）

示例：

```ts
function isString(s): s is string {
  // 类型谓词

  return typeof s === 'string'
}

function isNumber(n: number): boolean {
  return typeof n === 'number'
}

function operator(x: unknown) {
  if (isString(x)) {
    // ok x 类型缩小为 string
  }

  if (isNumber(x)) {
    // ts(2345) unknown 不能赋值给 number
  }
}
```

# 类类型

## 类

在实际业务中，任何实体都可以被抽象为一个使用类表达的类似对象的数据结构，且这个数据结构既包含属性，又包含方法，比如我们在下方抽象了一个狗的类。

```ts
class Dog {
  name: string
  constructor(name: string) {
    this.name = name
  }

  bark() {
    console.log('Woof! Woof!')
  }
}

const dog = new Dog('Q')
dog.bark() // => 'Woof! Woof!'
```

如果使用传统的 ES5 或者 ES3 代码定义类，我们需要使用函数+原型链的形式进行模拟，如下代码所示：

```ts
function Dog(name: string) {
  this.name = name // ts(2683) 'this' implicitly has type 'any' because it does not have a type annotation.
}
Dog.prototype.bark = function () {
  console.log('Woof! Woof!')
}

const dog = new Dog('Q') // ts(7009) 'new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
dog.bark() // => 'Woof! Woof!'
```

## 继承

在 TypeScript 中，使用 extends 关键字就能很方便地定义类继承的抽象模式，如下代码所示：

```ts
class Animal {
  type = 'Animal'

  say(name: string) {
    console.log(`I'm ${name}!`)
  }
}

class Dog extends Animal {
  bark() {
    console.log('Woof! Woof!')
  }
}

const dog = new Dog()
dog.bark() // => 'Woof! Woof!'
dog.say('Q') // => I'm Q!
dog.type // => Animal
```

> 说明：派生类通常被称作子类，基类也被称作超类（或者父类）。

> 这里的 Dog 基类与第一个例子中的类相比，少了一个构造函数。**这是因为派生类如果包含一个构造函数，则必须在构造函数中调用 super() 方法，这是 TypeScript 强制执行的一条重要规则**。

如果不调用 super：

```ts
class Dog extends Animal {
  name: string
  constructor(name: string) {
    // ts(2377) Constructors for derived classes must contain a 'super' call.
    this.name = name
  }

  bark() {
    console.log('Woof! Woof!')
  }
}
```

## 公共、私有与受保护的修饰符

属性和方法除了可以通过 extends 被继承之外，还可以通过修饰符控制可访问性。在 TypeScript 中就支持 3 种访问修饰符，分别是 public、private、protected。

- public 修饰的是在任何地方可见、公有的属性或方法；
- private 修饰的是仅在同一类中可见、私有的属性或方法；
- protected 修饰的是仅在类自身及子类中可见、受保护的属性或方法。

```ts
class Son {
  public firstName: string

  private lastName: string = 'Stark'

  constructor(firstName: string) {
    this.firstName = firstName

    this.lastName // ok
  }
}

const son = new Son('Tony')
console.log(son.firstName) //  => "Tony"
son.firstName = 'Jack'
console.log(son.firstName) //  => "Jack"
console.log(son.lastName) // ts(2341) Property 'lastName' is private and only accessible within class 'Son'.
```

> 注意：TypeScript 中定义类的私有属性仅仅代表静态类型检测层面的私有。如果我们强制忽略 TypeScript 类型的检查错误，转译且运行 JavaScript 时依旧可以获取到 lastName 属性，这是因为 JavaScript 并不支持真正意义上的私有属性。

接下来我们再看一下受保护的属性和方法，如下代码所示：

```ts
class Son {
  public firstName: string
  protected lastName: string = 'Stark'
  constructor(firstName: string) {
    this.firstName = firstName
    this.lastName // ok
  }
}

class GrandSon extends Son {
  constructor(firstName: string) {
    super(firstName)
  }

  public getMyLastName() {
    return this.lastName
  }
}

const grandSon = new GrandSon('Tony')
console.log(grandSon.getMyLastName()) // => "Stark"
grandSon.lastName // ts(2445) Property 'lastName' is protected and only accessible within class 'Son' and its subclasses.
```

> 虽然我们不能通过派生类的实例访问 protected 修饰的属性和方法，但是可以通过派生类的实例方法进行访问。比如示例中的第 21 行，通过实例的 getMyLastName 方法获取受保护的属性 lastName 是 ok 的，而第 22 行通过实例直接获取受保护的属性 lastName 则提示了一个 ts(2445) 的错误。

## 只读修饰符

在前面的例子中，Son 类 public 修饰的属性既公开可见，又可以更改值，如果我们不希望类的属性被更改，则可以使用 readonly 只读修饰符声明类的属性，如下代码所示：

```ts
class Son {
  public readonly firstName: string
  constructor(firstName: string) {
    this.firstName = firstName
  }
}
const son = new Son('Tony')
son.firstName = 'Jack' // ts(2540) Cannot assign to 'firstName' because it is a read-only property.
```

## 存取器

除了上边提到的修饰符之外，在 TypeScript 中还可以通过 getter、setter 截取对类成员的读写访问。

```ts
class Son {
  public firstName: string
  protected lastName: string = 'Stark'
  constructor(firstName: string) {
    this.firstName = firstName
  }
}
class GrandSon extends Son {
  constructor(firstName: string) {
    super(firstName)
  }
  get myLastName() {
    return this.lastName
  }
  set myLastName(name: string) {
    if (this.firstName === 'Tony') {
      this.lastName = name
    } else {
      console.error('Unable to change myLastName')
    }
  }
}
const grandSon = new GrandSon('Tony')
console.log(grandSon.myLastName) // => "Stark"
grandSon.myLastName = 'Rogers'
console.log(grandSon.myLastName) // => "Rogers"
const grandSon1 = new GrandSon('Tony1')
grandSon1.myLastName = 'Rogers' // => 控制台err: "Unable to change myLastName"
```

## 静态属性

因为这些属性存在于类这个特殊的对象上，而不是类的实例上，所以我们可以直接通过类访问静态属性，如下代码所示：

```ts
class MyArray {
  static displayName = 'MyArray'
  static isArray(obj: unknown) {
    return Object.prototype.toString.call(obj).slice(8, -1) === 'Array'
  }
}
console.log(MyArray.displayName) // => "MyArray"
console.log(MyArray.isArray([])) // => true
console.log(MyArray.isArray({})) // => false
```

这里分别调用了类的静态属性和静态方法。

> 注意：上边我们提到了不依赖实例 this 上下文的方法就可以定义成静态方法，这就意味着需要显式注解 this 类型才可以在静态方法中使用 this；非静态方法则不需要显式注解 this 类型，因为 this 的指向默认是类的实例。

## 抽象类

抽象类是一种不能被实例化仅能被子类继承的特殊类。

```ts
abstract class Adder {
  abstract x: number
  abstract y: number
  abstract add(): number
  displayName = 'Adder'
  addTwice(): number {
    return (this.x + this.y) * 2
  }
}
class NumAdder extends Adder {
  x: number
  y: number
  constructor(x: number, y: number) {
    super()
    this.x = x
    this.y = y
  }
  add(): number {
    return this.x + this.y
  }
}
const numAdder = new NumAdder(1, 2)
console.log(numAdder.displayName) // => "Adder"
console.log(numAdder.add()) // => 3
console.log(numAdder.addTwice()) // => 6
```

实际上，我们也可以定义一个描述对象结构的接口类型抽象类的结构，并通过 implements 关键字约束类的实现。使用接口与使用抽象类相比，区别在于接口只能定义类成员的类型，如下代码所示：

```ts
interface IAdder {
  x: number
  y: number
  add: () => number
}
class NumAdder implements IAdder {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  add() {
    return this.x + this.y
  }
  addTwice() {
    return (this.x + this.y) * 2
  }
}
```

> interface 会在转移成 js 时抹除掉，而抽象类则会留下来。

## 类的类型

类的最后一个特性——类的类型和函数类似，即在声明类的时候，其实也同时声明了一个特殊的类型（确切地讲是一个接口类型），这个类型的名字就是类名，表示类实例的类型；在定义类的时候，我们声明的除构造函数外所有属性、方法的类型就是这个特殊类型的成员。如下代码所示：

```ts
class A {
  name: string
  constructor(name: string) {
    this.name = name
  }
}
const a1: A = {} // ts(2741) Property 'name' is missing in type '{}' but required in type 'A'.
const a2: A = { name: 'a2' } // ok
```

# 接口类型与类型别名

## Interface 接口类型

TypeScript 不仅能帮助前端改变思维方式，还能强化面向接口编程的思维和能力，而这正是得益于 Interface 接口类型。通过接口类型，我们可以清晰地定义模块内、跨模块、跨项目代码的通信规则。

TypeScript 对对象的类型检测遵循一种被称之为“鸭子类型”（duck typing）或者“结构化类型（structural subtyping）”的准则，即只要两个对象的结构一致，属性和方法的类型一致，则它们的类型就是一致的。

```ts
function Study(language: { name: string; age: () => number }) {
  console.log(
    `ProgramLanguage ${language.name} created ${language.age()} years ago.`
  )
}
Study({
  name: 'TypeScript',
  age: () => new Date().getFullYear() - 2012,
})
Study({
  name: 2, // ts(2322) number 不能赋值给 string
  age: () => new Date().getFullYear() - 2012,
})
Study({
  // ts(2345) 实参(Argument)与形参(Parameter)类型不兼容，缺少必需的属性 age
  name: 'TypeScript',
})
Study({
  id: 2, // ts(2345) 实参(Argument)与形参(Parameter)类型不兼容，不存在的属性 id
  name: 'TypeScript',
  age: () => new Date().getFullYear() - 2012,
})
```

有意思的是，在上边的示例中，如果我们先把这个对象字面量赋值给一个变量，然后再把变量传递给函数进行调用，那么 TypeScript 静态类型检测就会仅仅检测形参类型中定义过的属性类型，而包容地忽略任何多余的属性，此时也不会抛出一个 ts(2345) 类型错误。

```ts
let ts = {
  id: 2,
  name: 'TypeScript',
  age: () => new Date().getFullYear() - 2012,
}
Study(ts) // ok
```

这并非一个疏忽或 bug，而是有意为之地将对象字面量和变量进行区别对待，我们把这种情况称之为对象字面量的 freshness。

内联形式的接口类型定义在语法层面与熟知的 JavaScript 解构颇为神似，所以要分清楚它们的区别：

```ts
/** 纯 JavaScript 解构语法 */
function StudyJavaScript({ name, age }) {
  console.log(name, age)
}
/** TypeScript 里解构与内联类型混用 */
function StudyTypeScript({ name, age }: { name: string; age: () => number }) {
  console.log(name, age)
}
/** 纯 JavaScript 解构语法，定义别名 */
function StudyJavaScript({ name: aliasName }) {
  // 定义name的别名
  console.log(aliasName)
}
/** TypeScript */
function StudyTypeScript(language: { name: string }) {
  // console.log(name); // 不能直接打印name
  console.log(language.name)
}
```

在 TypeScript 中，接口的语法和其他类型的语言并没有太大区别，我们通过如下所示代码一起看看接口是如何定义的：

```ts
;/ ** 关键字 接口名称 */
interface ProgramLanguage {
  /** 语言名称 */
  name: string
  /** 使用年限 */
  age: () => number
}
```

在前边示例中，通过内联参数类型定义的 Study 函数就可以直接使用 ProgramLanguage 接口来定义参数 language 的类型了，或者定义变量。

```ts
function NewStudy(language: ProgramLanguage) {
  console.log(
    `ProgramLanguage ${language.name} created ${language.age()} years ago.`
  )
}
let TypeScript: ProgramLanguage
```

接着，我们把满足接口类型约定的一个对象字面量赋值给了这个变量:

```ts
TypeScript = {
  name: 'TypeScript',
  age: () => new Date().getFullYear() - 2012,
}
// ok

TypeScript = {}
// 提示对象字面量类型 {} 缺少 name 和 age 属性的 ts(2739) 错误

TypeScript = {
  name: 'TypeScript',
}
// 提示对象字面量类型 { name: string; } 缺少必需的 age 属性的 ts( 2741) 错误。

TypeScript = {
  name: 2,
  age: 'Wrong Type',
}
// ts(2322) number 类型不能赋值给 string，第 3 行会提示错误：ts(2322)string 不能赋值给函数类型

TypeScript = {
  name: 'TypeScript',
  age: () => new Date().getFullYear() - 2012,
  id: 1,
}
// ts(2322) 错误：对象字面量不能赋值给 ProgramLanguage 类型的变量 TypeScript，id在ProgramLanguage类型里不存在
```

## 可缺省属性

如果某个属性需要时可缺省，那么可以使用`?`语法来标注：

```ts
/** 关键字 接口名称 */
interface OptionalProgramLanguage {
  /** 语言名称 */
  name: string
  /** 使用年限 */
  age?: () => number
}
let OptionalTypeScript: OptionalProgramLanguage = {
  name: 'TypeScript',
} // ok
```

当属性被标注为可缺省后，它的类型就变成了显式指定的类型与 undefined 类型组成的联合类型，比如示例中 OptionalTypeScript 的 age 属性类型就变成了`(() => number) | undefined`

但是和前面的可缺省参数一样，可缺省属性并不等同于`xxx | undefined`。

既然值可能是 undefined ，如果我们需要对该对象的属性或方法进行操作，就可以使用类型守卫或 Optional Chain，如下代码所示：

```ts
if (typeof OptionalTypeScript.age === 'function') {
  OptionalTypeScript.age()
}
// or
OptionalTypeScript.age?.()
```

## 只读属性

我们可能还会碰到这样的场景，希望对对象的某个属性或方法锁定写操作，这时，我们可以在属性名前通过添加 readonly 修饰符的语法来标注其为只读属性：

```ts
interface ReadOnlyProgramLanguage {
  /** 语言名称 */
  readonly name: string
  /** 使用年限 */
  readonly age: (() => number) | undefined
}

let ReadOnlyTypeScript: ReadOnlyProgramLanguage = {
  name: 'TypeScript',
  age: undefined,
}
/** ts(2540)错误，name 只读 */
ReadOnlyTypeScript.name = 'JavaScript'
```

> 需要注意的是，这仅仅是静态类型检测层面的只读，实际上并不能阻止对对象的篡改。因为在转译为 JavaScript 之后，readonly 修饰符会被抹除。因此，任何时候与其直接修改一个对象，不如返回一个新的对象，这会是一种比较安全的实践。

## 定义函数类型

除了对象还可以定义函数的类型：

```ts
interface StudyLanguage {
  (language: ProgramLanguage): void
}
/** 单独的函数实践 */
let StudyInterface: StudyLanguage = (language) =>
  console.log(`${language.name} ${language.age()}`)
```

实际上，我们很少使用接口类型来定义函数的类型，更多使用内联类型或类型别名配合箭头函数语法来定义函数类型，比如：`type StudyLanguageType = (language: ProgramLanguage) => void`

## 索引签名

在实际工作中我们经常会把对象当 Map 映射使用，比如下边代码示例中定义了索引是任意数字的对象 LanguageRankMap 和索引是任意字符串的对象 LanguageMap。

```ts
let LanguageRankMap = {
  1: 'TypeScript',
  2: 'JavaScript',
  //...
}
let LanguageMap = {
  TypeScript: 2012,
  JavaScript: 1995,
  //...
}
```

这个时候，我们需要使用索引签名来定义上边提到的对象映射结构，并通过 “[索引名: 类型]”的格式约束索引的类型。

```ts
interface LanguageRankInterface {
  [rank: number]: string
}
interface LanguageYearInterface {
  [name: string]: number
}
{
  let LanguageRankMap: LanguageRankInterface = {
    1: 'TypeScript', // ok
    2: 'JavaScript', // ok
    WrongINdex: '2012', // ts(2322) 不存在的属性名
  }

  let LanguageMap: LanguageYearInterface = {
    TypeScript: 2012, // ok
    JavaScript: 1995, // ok
    1: 1970, // ok
  }
}
```

> 注意：在上述示例中，数字作为对象索引时，它的类型既可以与数字兼容，也可以与字符串兼容，这与 JavaScript 的行为一致。因此，使用 0 或 '0' 索引对象时，这两者等价。

同样，我们可以使用 readonly 注解索引签名，此时将对应属性设置为只读就行，如下代码所示：

```ts
interface LanguageRankInterface {
  readonly [rank: number]: string
}

interface LanguageYearInterface {
  readonly [name: string]: number
}
```

> 注意：虽然属性可以与索引签名进行混用，但是属性的类型必须是对应的数字索引或字符串索引的类型的子集，否则会出现错误提示。

```ts
interface StringMap {
  [prop: string]: number
  age: number // ok
  name: string // ts(2411) name 属性的 string 类型不能赋值给字符串索引类型 number
}
interface NumberMap {
  [rank: number]: string
  1: string // ok
  0: number // ts(2412) 0 属性的 number 类型不能赋值给数字索引类型 string
}
```

另外，由于上边提到了数字类型索引的特殊性，所以我们不能约束数字索引属性与字符串索引属性拥有截然不同的类型，具体示例如下：

```ts
interface LanguageRankInterface {
  [rank: number]: string // ts(2413) 数字索引类型 string 类型不能赋值给字符串索引类型 number
  [prop: string]: number
}
```

如果我们确实需要使用 age 是 number 类型、其他属性类型是 string 的对象数据结构，应该如何定义它的类型且不提示错误呢？那么就需要使用到多个接口了，用法在下一章讲到。

## 继承

在 TypeScript 中，接口类型可以继承和被继承，比如我们可以使用如下所示的 extends 关键字实现接口的继承。

```ts
interface DynamicLanguage extends ProgramLanguage {
  rank: number // 定义新属性
}

interface TypeSafeLanguage extends ProgramLanguage {
  typeChecker: string // 定义新的属性
}
/** 继承多个 */
interface TypeScriptLanguage extends DynamicLanguage, TypeSafeLanguage {
  name: 'TypeScript' // 用原属性类型的兼容的类型(比如子集)重新定义属性
}
```

**注意：我们仅能使用兼容的类型覆盖继承的属性**:

```ts
/** ts(6196) 错误的继承，name 属性不兼容 */
interface WrongTypeLanguage extends ProgramLanguage {
  name: number
}
```

在上述代码中，因为 ProgramLanguage 的 name 属性是 string 类型，WrongTypeLanguage 的 name 属性是 number，二者不兼容，所以不能继承，也会提示一个 ts(6196) 错误。

## 实现

我们还可与让类实现某个接口

```ts
class LanguageClass implements ProgramLanguage {
  name: string = ''
  age = () => new Date().getFullYear() - 2012
}
```

# Type 类型别名

接口类型的一个作用是将内联类型抽离出来，从而实现类型可复用。其实，我们也可以使用类型别名接收抽离出来的内联类型实现复用。此时，我们可以通过如下所示“type 别名名字 = 类型定义”的格式来定义类型别名。

```ts
type LanguageType = {
  /** 以下是接口属性 */
  /** 语言名称 */
  name: string
  /** 使用年限 */
  age: () => number
}
```

此外，针对接口类型无法覆盖的场景，比如组合类型、交叉类型（下一章讲到），我们只能使用类型别名来接收，如下代码所示：

```ts
/** 联合 */
type MixedType = string | number
/** 交叉 */
type IntersectionType = { id: number; name: string } & {
  age: number
  name: string
}
/** 提取接口属性类型 */
type AgeType = ProgramLanguage['age']
```

> 注意：类型别名，诚如其名，即我们仅仅是给类型取了一个新的名字，并不是创建了一个新的类型。

## Interface 与 Type 的区别

实际上，在大多数的情况下使用接口类型和类型别名的效果等价，但是在某些特定的场景下这两者还是存在很大区别。比如，重复定义的接口类型，它的属性会叠加，这个特性使得我们可以极其方便地对全局变量、第三方库的类型做扩展，如下代码所示：

```ts
interface Language {
  id: number
}

interface Language {
  name: string
}

let lang: Language = {
  id: 1, // ok
  name: 'name', // ok
}
```

在上述代码中，先后定义的两个 Language 接口属性被叠加在了一起，此时我们可以赋值给 lang 变量一个同时包含 id 和 name 属性的对象。不过，如果我们重复定义类型别名，如下代码所示，则会提示一个 ts(2300) 错误。

```ts
/** ts(2300) 重复的标志 */
type Language = {
  id: number
}

/** ts(2300) 重复的标志 */
type Language = {
  name: string
}
let lang: Language = {
  id: 1,
  name: 'name',
}
```

> 下一章讲解：联合类型、交叉类型、枚举类型、泛型
