---
title: JS装饰器(Decorators)Stage3提案翻译
date: 2024-09-25 10:37:35
tags:
- JavaScript
categories: JavaScript
---

> 关注了这么久的装饰器提案终于进入到Stage3阶段了，掘金站内也有简单用法介绍版本：[JS装饰器(Decorators)用法-Stage3(新)](https://juejin.cn/post/7262270605851836471)，这篇就根据提案详情翻译一下。

# 装饰器(Decorators)

**Stage**: 3

装饰器是一项用于扩展 JavaScript 类的提案，在转译器环境中得到了开发者的广泛采用，并且在标准化方面引起了广泛兴趣。TC39 已经在装饰器提案上迭代了五年多。本文档描述了一个基于所有过去提案元素的新装饰器提案。

本 README 文件描述了当前的装饰器提案，该提案仍在进行中。有关该提案之前的迭代版本，请参阅本仓库的[提交历史](https://github.com/tc39/proposal-decorators/commits/master/)。

<!-- more -->

## 简介

装饰器是在定义时对类、类元素或其他 JavaScript 语法形式进行调用的函数。

```js
@defineElement("my-class")
class C extends HTMLElement {
  @reactive accessor clicked = false;
}
```

装饰器具有三种主要能力：

1. 它们可以用具有相同语义的匹配值替换正在装饰的值。（例如，装饰器可以用另一个方法替换一个方法，用另一个字段替换一个字段，用另一个类替换一个类，等等）。
2. 它们可以通过访问器函数访问正在装饰的值，然后可以选择共享这些访问器函数。
3. 它们可以初始化正在装饰的值，在值完全定义后运行额外的代码。在值是类的成员的情况下，初始化会在每个实例上发生一次。

本质上，装饰器可以用于元编程，并为一个值添加功能，而不会从根本上改变其外部行为。

与之前的迭代不同，之前的装饰器可以用完全不同类型的值替换被装饰的值。要求装饰器只能用与原始值具有相同语义的值进行替换，满足了两个主要设计目标：

* 使用装饰器和编写自己的装饰器都应该很容易。之前的迭代，如静态装饰器提案，对作者和实现者来说特别复杂。在这个提案中，装饰器是普通的函数，易于访问和编写。
* 装饰器应该影响它们所装饰的东西，并避免产生令人困惑的/非局部的影响。以前，装饰器可以用不可预测的方式改变被装饰的值，并且还可以添加完全不相关的全新值。这对运行时和开发者来说都是一个问题，因为这意味着被装饰的值不能被静态分析，而且开发者无法察觉被装饰的值可能会变成完全不同类型的值。

在这个提案中，装饰器可以应用于以下现有类型的值：

* 类
* 类字段（公共、私有和静态）
* 类方法（公共、私有和静态）
* 类访问器（公共、私有和静态）

此外，这个提案引入了一种新的可以被装饰的类元素：

通过将 `accessor` 关键字应用于类字段来定义的类自动访问器。这些访问器具有 getter 和 setter，与字段不同，它们默认在私有存储槽上进行获取和设置（相当于私有类字段）：

```js
class Example {
  @reactive accessor myBool = false;
}
```

这种新的元素类型可以独立使用，并且具有与装饰器使用无关的独立语义。将其包含在此提案中的主要原因是，有许多装饰器的用例需要其语义，因为装饰器只能用具有相同语义的相应元素替换元素。这些用例在现有的装饰器生态系统中很常见，表明它们提供的功能是必要的。

## 动机

你可能会问：“我们为什么需要这些？”装饰器是一种强大的元编程特性，可以显著简化代码，但它们也可能让人感觉“神奇”，因为它们隐藏了用户的细节，使得底层发生的事情更难理解。像所有抽象一样，在某些情况下，装饰器可能会带来比它们价值更多的问题。

然而，装饰器今天仍然被追求的主要原因之一，特别是类装饰器作为重要语言特性的主要原因之一，是因为它们填补了 JavaScript 中元编程能力存在的空白。

思考以下函数：

```js
function logResult(fn) {
  return function(...args) {
    let result;
    try {
      result = fn.call(this, ...args);
      console.log(result);
    } catch (e) {
      console.error(e);
      throw e;
    }
    return result;
  }
}

const plusOne = logResult((x) => x + 1);

plusOne(1); // 2
```

这是 JavaScript 中每天都在使用的常见模式，也是支持闭包的语言中的基本功能。这是一个在普通 JavaScript 中实现装饰器模式的示例。你可以使用它轻松地为任何函数定义添加日志记录，并且你可以使用任意数量的“装饰器”函数：`logResult`

```js
const foo = bar(baz(qux(() => /* 做一些很酷的事 */)))
```

在其他一些语言中，如 Python，装饰器是这种模式的语法糖——它们是可以通过 `@` 符号或直接调用应用于其他函数的函数，以添加额外的行为。

因此，就目前而言，在 JavaScript 中使用装饰器模式是可能的，只是没有那么好的 `@` 语法。这种模式也是声明性的，这很重要——在函数定义和装饰之间没有步骤。这意味着某人不可能意外使用未装饰版本的函数，这可能会导致重大错误，并且非常难以调试！

然而，有一个地方我们根本无法使用这种模式——对象和类。思考以下类：

```js
class MyClass {
  x = 0;
}
```

我们如何为 `x` 添加日志记录功能，以便在我们获取或设置它时记录该访问？你可以手动完成：

```js
class MyClass {
  #x = 0;

  get x() {
    console.log('getting x');
    return this.#x;
  }

  set x(v) {
    console.log('setting x');
    this.#x = v;
  }
}
```

但如果我们经常这样做，在每个地方添加所有这些 getter 和 setter 会很麻烦。我们可以编写一个辅助函数，在定义类之后为我们完成这项工作：

```
function logResult(Class, property) {
  Object.defineProperty(Class.prototype, property, {
    get() {
      console.log(`getting ${property}`);
      return this[`_${property}`];
    },

    set(v) {
      console.log(`setting ${property}`);
      this[`_${property}`] = v;
    }
  })
}

class MyClass {
  constructor() {
    this.x = 0;
  }
}

logResult(MyClass, 'x');
```

这可以实现需求，但如果我们使用类字段，它会覆盖我们在原型上定义的 getter/setter，所以我们必须将赋值移到构造函数中。它也是在多个语句中完成的，因此定义本身是随时间发生的，而不是声明性的。想象一下调试一个在多个文件中“定义”的类，每个文件在应用程序启动时添加不同的装饰。这听起来可能是一个非常糟糕的设计，但在引入类之前，这在过去并不罕见！最后，我们无法对私有字段或方法执行此操作。我们不能只是替换定义。

方法稍微好一些，我们可以这样做：

```js
function logResult(fn) {
  return function(...args) {
    const result = fn.call(this, ...args);
    console.log(result);
    return result;
  }
}

class MyClass {
  x = 0;
  plusOne = logResult(() => this.x + 1);
}
```

虽然这是声明性的，但它也为类的每个实例创建了一个新的闭包，这在规模上会产生大量的额外开销。

通过将类装饰器作为语言特性，我们填补了这个空白，并为类方法、字段、访问器和类本身启用了装饰器模式。这使得开发者能够轻松地为常见任务编写抽象，例如调试日志记录、响应式编程、动态类型检查等。

## 细节设计

装饰器评估的三个步骤：

1. 装饰器表达式（`@` 后面的内容）与计算属性名称交错进行评估。
2. 装饰器在类定义期间被调用（作为函数），在方法被评估之后但在构造函数和原型组合之前。
3. 所有装饰器在调用后一次性应用（修改构造函数和原型）。

这里的语义通常遵循 2016 年 5 月在慕尼黑举行的 TC39 会议上的共识。

### 1. 评估装饰器

装饰器作为表达式进行评估，与计算属性名称一起排序。这从左到右，从上到下进行。装饰器的结果存储在相当于局部变量的位置，以便在类定义初始执行完成后稍后调用。

### 2. 调用装饰器

当调用装饰器时，它们接收两个参数：

1. 被装饰的值，或者在类字段的情况下为 `undefined`，因为类字段是一个特殊情况。
2. 一个包含有关被装饰值信息的上下文对象

为了简洁和清晰，使用 TypeScript 接口表示，这是 API 的一般形状：

```ts
type Decorator = (value: Input, context: {
  kind: string;
  name: string | symbol;
  access: {
    get?(): unknown;
    set?(value: unknown): void;
  };
  private?: boolean;
  static?: boolean;
  addInitializer(initializer: () => void): void;
}) => Output | void;
```

这里的 `Input` 和 `Output` 分别表示传递给某个装饰器的值以及从该装饰器返回的值。每种类型的装饰器都有不同的输入和输出，这些将在下面更详细地介绍。所有装饰器都可以选择不返回任何内容，此时默认使用原始的、未装饰的值。

上下文对象也会根据被装饰的值的不同而有所变化。下面分解其属性：

* `kind`：被装饰值的种类。这可以用来断言装饰器的使用是否正确，或者为不同类型的值采取不同的行为。它的值可以是以下之一：
    -   `"class"`
    -   `"method"`
    -   `"getter"`
    -   `"setter"`
    -   `"field"`
    -   `"accessor"`
* `name`：值的名称，或者在私有元素的情况下，是其描述（例如，可读名称）。
* `access`：一个包含访问值方法的对象。这些方法还可以获取实例上元素的最终值，而不是传递给装饰器的当前值。这对于涉及访问的大多数用例（如类型验证器或序列化器）非常重要。有关更多详细信息，请参阅下面的“访问”部分。
* `static`：值是否为静态类元素。仅适用于类元素。
* `private`：值是否为私有类元素。仅适用于类元素。
* `addInitializer`：允许用户向元素或类添加额外的初始化逻辑。

有关每种装饰器的详细分解以及如何应用它们的详细信息，请参阅下面的“装饰器API”部分。

### 3. 应用装饰器

装饰器在所有装饰器都被调用后应用。装饰器应用算法的中间步骤是不可观察的——新构造的类在所有方法和非静态字段装饰器被应用之前是不可用的。

类装饰器只有在所有方法和字段装饰器被调用和应用后才会被调用。

最后，静态字段被执行并应用。

### Syntax

这个装饰器提案使用了之前Stage 2装饰器提案的语法。这意味着：

* 装饰器表达式被限制为一系列变量、带 `.` 的属性访问（但不能是 `[]` ）和调用（`()`）。要使用任意表达式作为装饰器，可以使用 `@(expression)` 作为转译机制。
* 类表达式可以被装饰，而不仅仅是类声明。
* 类装饰器可以独占地出现在 `export` / `export default` 之前或之后。

没有定义装饰器的特殊语法；任何函数都可以作为装饰器应用。

### Decorator APIs

#### Class Methods

```ts
type ClassMethodDecorator = (value: Function, context: {
  kind: "method";
  name: string | symbol;
  access: { get(): unknown };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

类方法装饰器接收正在装饰的方法作为第一个值，并且可以选择返回一个新方法来替换它。如果返回了一个新方法，它将替换原型（或类本身，在静态方法的情况下）上的原始方法。如果返回了其他类型的值，将会抛出一个错误。

一个方法装饰器的例子是 `@logged` 装饰器。这个装饰器接收原始函数，并返回一个新函数，该函数包装了原始函数并在调用前后进行日志记录。

```js
function logged(value, { kind, name }) {
  if (kind === "method") {
    return function (...args) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @logged
  m(arg) {}
}

new C().m(1);
// starting m with arguments 1
// ending m
```

这个例子大致“脱糖”为以下内容（即，可以这样转译）：

```
class C {
  m(arg) {}
}

C.prototype.m = logged(C.prototype.m, {
  kind: "method",
  name: "m",
  static: false,
  private: false,
}) ?? C.prototype.m;
```

#### Class Accessors

```ts
type ClassGetterDecorator = (value: Function, context: {
  kind: "getter";
  name: string | symbol;
  access: { get(): unknown };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;

type ClassSetterDecorator = (value: Function, context: {
  kind: "setter";
  name: string | symbol;
  access: { set(value: unknown): void };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

访问器装饰器接收原始的底层getter/setter函数作为第一个值，并且可以选择返回一个新的getter/setter函数来替换它。与方法装饰器类似，这个新函数被放置在原型上以替代原始函数（或者在类上，对于静态访问器），如果返回了其他类型的值，将会抛出一个错误。

访问器装饰器分别应用于getter和setter。在以下示例中，`@foo`仅应用于`get x()` - `set x()`未被装饰：

```js
class C {
  @foo
  get x() {
    // ...
  }

  set x(val) {
    // ...
  }
}
```

我们可以将之前为方法定义的 `@logged` 装饰器扩展为也处理访问器。代码基本上是相同的，我们只需要处理额外的 `kind` 。

```js
function logged(value, { kind, name }) {
  if (kind === "method" || kind === "getter" || kind === "setter") {
    return function (...args) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @logged
  set x(arg) {}
}

new C().x = 1
// starting x with arguments 1
// ending x
```

这个示例大致“去糖化”为以下内容（即可以这样转译）：

```js
class C {
  set x(arg) {}
}

let { set } = Object.getOwnPropertyDescriptor(C.prototype, "x");
set = logged(set, {
  kind: "setter",
  name: "x",
  static: false,
  private: false,
}) ?? set;

Object.defineProperty(C.prototype, "x", { set });
```

#### Class Fields

```ts
type ClassFieldDecorator = (value: undefined, context: {
  kind: "field";
  name: string | symbol;
  access: { get(): unknown, set(value: unknown): void };
  static: boolean;
  private: boolean;
  addInitializer(initializer: () => void): void;
}) => (initialValue: unknown) => unknown | void;
```

与方法和访问器不同，类字段在被装饰时没有直接的输入值。相反，用户可以选择返回一个初始化函数，该函数在字段被赋值时运行，接收字段的初始值并返回一个新的初始值。如果返回的值不是函数类型，则会抛出错误。

我们可以扩展我们的 `@logged` 装饰器，使其也能处理类字段，记录字段被赋值的时间以及赋值的内容。

```js
function logged(value, { kind, name }) {
  if (kind === "field") {
    return function (initialValue) {
      console.log(`initializing ${name} with value ${initialValue}`);
      return initialValue;
    };
  }

  // ...
}

class C {
  @logged x = 1;
}

new C();
// initializing x with value 1
```

这个示例大致“去糖化”为以下内容（即可以这样转译）：

```js
let initializeX = logged(undefined, {
  kind: "field",
  name: "x",
  static: false,
  private: false,
}) ?? (initialValue) => initialValue;

class C {
  x = initializeX.call(this, 1);
}
```

初始化函数以类的实例作为 `this` 调用，因此字段装饰器也可以用于引导注册关系。例如，你可以在父类上注册子类：

```js
const CHILDREN = new WeakMap();

function registerChild(parent, child) {
  let children = CHILDREN.get(parent);

  if (children === undefined) {
    children = [];
    CHILDREN.set(parent, children);
  }

  children.push(child);
}

function getChildren(parent) {
  return CHILDREN.get(parent);
}

function register() {
  return function(value) {
    registerChild(this, value);

    return value;
  }
}

class Child {}
class OtherChild {}

class Parent {
  @register child1 = new Child();
  @register child2 = new OtherChild();
}

let parent = new Parent();
getChildren(parent); // [Child, OtherChild]
```

#### Classes

```ts
type ClassDecorator = (value: Function, context: {
  kind: "class";
  name: string | undefined;
  addInitializer(initializer: () => void): void;
}) => Function | void;
```

类装饰器接收正在被装饰的类作为第一个参数，并且可以选择返回一个新的可调用对象（类、函数或代理）来替换它。如果返回的值不是可调用对象，则会抛出错误。

我们可以进一步扩展我们的 `@logged` 装饰器，以便在创建类的实例时记录日志：

```js
function logged(value, { kind, name }) {
  if (kind === "class") {
    return class extends value {
      constructor(...args) {
        super(...args);
        console.log(`constructing an instance of ${name} with arguments ${args.join(", ")}`);
      }
    }
  }

  // ...
}

@logged
class C {}

new C(1);
// constructing an instance of C with arguments 1
```

这个示例大致“去糖化”为以下内容（即可以这样转译）：

```js
class C {}

C = logged(C, {
  kind: "class",
  name: "C",
}) ?? C;

new C(1);
```

如果被装饰的类是匿名类，那么 `context` 对象的 `name` 属性是 `undefined`。

### 新的类元素

#### Class Auto-Accessors

类自动访问器是一种新的构造，通过在类字段前添加 `accessor` 关键字来定义：

```js
class C {
  accessor x = 1;
}
```

自动访问器与常规字段不同，它们在类原型上定义了一个 getter 和 setter。这个 getter 和 setter 默认在私有槽上获取和设置值。上述内容大致去糖化为：

```js
class C {
  #x = 1;

  get x() {
    return this.#x;
  }

  set x(val) {
    this.#x = val;
  }
}
```

静态和私有自动访问器也可以定义：

```js
class C {
  static accessor x = 1;
  accessor #y = 2;
}
```

自动访问器可以被装饰，自动访问器装饰器具有以下签名：

```ts
type ClassAutoAccessorDecorator = (
  value: {
    get: () => unknown;
    set(value: unknown) => void;
  },
  context: {
    kind: "accessor";
    name: string | symbol;
    access: { get(): unknown, set(value: unknown): void };
    static: boolean;
    private: boolean;
    addInitializer(initializer: () => void): void;
  }
) => {
  get?: () => unknown;
  set?: (value: unknown) => void;
  init?: (initialValue: unknown) => unknown;
} | void;
```

与字段装饰器不同，自动访问器装饰器接收一个值，该值是一个包含在类原型（或静态自动访问器情况下的类本身）上定义的 `get` 和 `set` 访问器的对象。装饰器可以包装这些访问器并返回新的 `get` 和/或 `set`，从而允许装饰器拦截对属性的访问。这是字段无法实现的功能，但自动访问器可以实现。此外，自动访问器可以返回一个初始化函数，该函数可以用于更改私有槽中后备值的初始值，类似于字段装饰器。如果返回一个对象，但省略了任何值，则省略值的默认行为是使用原始行为。如果返回的值不是包含这些属性的对象，则会抛出错误。

进一步扩展 `@logged` 装饰器，我们可以使其也能处理自动访问器，记录自动访问器初始化的时间以及每次访问的时间：

```js
function logged(value, { kind, name }) {
  if (kind === "accessor") {
    let { get, set } = value;

    return {
      get() {
        console.log(`getting ${name}`);

        return get.call(this);
      },

      set(val) {
        console.log(`setting ${name} to ${val}`);

        return set.call(this, val);
      },

      init(initialValue) {
        console.log(`initializing ${name} with value ${initialValue}`);
        return initialValue;
      }
    };
  }

  // ...
}

class C {
  @logged accessor x = 1;
}

let c = new C();
// initializing x with value 1
c.x;
// getting x
c.x = 123;
// setting x to 123
```

这个示例大致“去糖化”为以下内容：

```js
class C {
  #x = initializeX.call(this, 1);

  get x() {
    return this.#x;
  }

  set x(val) {
    this.#x = val;
  }
}

let { get: oldGet, set: oldSet } = Object.getOwnPropertyDescriptor(C.prototype, "x");

let {
  get: newGet = oldGet,
  set: newSet = oldSet,
  init: initializeX = (initialValue) => initialValue
} = logged(
  { get: oldGet, set: oldSet },
  {
    kind: "accessor",
    name: "x",
    static: false,
    private: false,
  }
) ?? {};

Object.defineProperty(C.prototype, "x", { get: newGet, set: newSet });
```

### 使用 `addInitializer` 添加初始化逻辑

`addInitializer` 方法可用于上下文对象，该对象是为每种类型的值提供的装饰器。可以调用此方法将初始化函数与类或类元素关联起来，该函数可用于在值定义后运行任意代码以完成设置。这些初始化函数的时机取决于装饰器的类型：

* 类装饰器：在类完全定义后，并且在类静态字段赋值后。
* 类静态元素
    * 方法和 `Getter/Setter` 装饰器：在类定义期间，在静态类方法赋值后，在任何静态类字段初始化之前  
    * 字段和访问器装饰器：在类定义期间，在它们应用到的字段或访问器初始化后立即执行
* 类非静态元素
    * 方法和 Getter/Setter 装饰器：在类构造期间，在任何类字段初始化之前  
    * 字段和访问器装饰器：在类构造期间，在它们应用到的字段或访问器初始化后立即执行


#### 例子: `@customElement`

我们可以在类装饰器中使用 `addInitializer` 来创建一个装饰器，该装饰器在浏览器中注册一个 Web 组件。

```js
function customElement(name) {
  return (value, { addInitializer }) => {
    addInitializer(function() {
      customElements.define(name, this);
    });
  }
}

@customElement('my-element')
class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ['some', 'attrs'];
  }
}
```

这个示例大致“去糖化”为以下内容（即可以这样转译）：

```js
class MyElement {
  static get observedAttributes() {
    return ['some', 'attrs'];
  }
}

let initializersForMyElement = [];

MyElement = customElement('my-element')(MyElement, {
  kind: "class",
  name: "MyElement",
  addInitializer(fn) {
    initializersForMyElement.push(fn);
  },
}) ?? MyElement;

for (let initializer of initializersForMyElement) {
  initializer.call(MyElement);
}
```

#### 例子: `@bound`

我们也可以在方法装饰器中使用 `addInitializer` 来创建一个 `@bound` 装饰器，该装饰器将方法绑定到类的实例：

```js
function bound(value, { name, addInitializer }) {
  addInitializer(function () {
    this[name] = this[name].bind(this);
  });
}

class C {
  message = "hello!";

  @bound
  m() {
    console.log(this.message);
  }
}

let { m } = new C();

m(); // hello!
```

这个示例大致“去糖化”为以下内容：

```js
class C {
  constructor() {
    for (let initializer of initializersForM) {
      initializer.call(this);
    }

    this.message = "hello!";
  }

  m() {}
}

let initializersForM = []

C.prototype.m = bound(
  C.prototype.m,
  {
    kind: "method",
    name: "m",
    static: false,
    private: false,
    addInitializer(fn) {
      initializersForM.push(fn);
    },
  }
) ?? C.prototype.m;
```

### Access and Metadata Sidechanneling / 访问和元数据侧通道

到目前为止，我们已经看到了如何使用装饰器来替换一个值，但我们还没有看到如何使用装饰器的访问对象。以下是一个依赖注入装饰器的示例，它通过元数据侧通道使用此对象在实例上注入值。

```js
const INJECTIONS = new WeakMap();

function createInjections() {
  const injections = [];

  function injectable(Class) {
    INJECTIONS.set(Class, injections);
  }

  function inject(injectionKey) {
    return function applyInjection(v, context) {
      injections.push({ injectionKey, set: context.access.set });
    };
  }

  return { injectable, inject };
}

class Container {
  registry = new Map();

  register(injectionKey, value) {
    this.registry.set(injectionKey, value);
  }

  lookup(injectionKey) {
    this.registry.get(injectionKey);
  }

  create(Class) {
    let instance = new Class();

    for (const { injectionKey, set } of INJECTIONS.get(Class) || []) {
      set.call(instance, this.lookup(injectionKey));
    }

    return instance;
  }
}

class Store {}

const { injectable, inject } = createInjections();

@injectable
class C {
  @inject('store') store;
}

let container = new Container();
let store = new Store();

container.register('store', store);

let c = container.create(C);

c.store === store; // true
```

访问通常基于值是用于读取还是写入。字段和自动访问器可以被读取和写入。访问器在 getter 的情况下可以被读取，在 setter 的情况下可以被写入。方法只能被读取。

## 可能的扩展

在 [EXTENSIONS.md](https://github.com/tc39/proposal-decorators/blob/master/EXTENSIONS.md) 中调查了进一步构造的装饰器。

## 标准化计划

- [x] 在提案中迭代开放问题，向 TC39 展示并在每两周一次的装饰器电话会议上进一步讨论，以便在未来会议上向委员会得出结论。
    - 状态：开放问题已解决，装饰器工作组在设计方面达成了总体共识。
- [x] 编写规范文本
    - 状态：已完成，[可在此处获取](https://arai-a.github.io/ecma262-compare/?pr=2417)。
- [x] 在实验性转译器中实现
    - 状态：已创建实验性实现，可供一般使用。正在 Babel 中进行实现工作，并获取更多反馈。
        - [x] 独立实现：<https://javascriptdecorators.org/>
        - [x] Babel 插件实现 ([docs](https://babeljs.io/docs/en/babel-plugin-proposal-decorators#options))
- [x] 收集测试转译器实现的 JavaScript 开发者的反馈
- [x] 提议进入第 3 阶段。

## FAQ

### 今天我应该如何在转译器中使用装饰器？

由于装饰器已经达到第 3 阶段并接近完成，现在建议新项目使用最新的第 3 阶段装饰器转换。这些在 Babel、TypeScript 和其他流行的构建工具中可用。

现有项目应开始为其生态系统制定升级计划。在大多数情况下，通过匹配传递给装饰器的参数，应该可以同时支持旧版和第 3 阶段版本。在少数情况下，由于两个版本之间的功能差异，这可能不可行。如果你遇到这种情况，请在此仓库中打开一个问题进行讨论！

### 这个提案与其他版本的装饰器相比如何？

#### 与 Babel “旧版”装饰器的比较

Babel 旧版模式装饰器基于 2014 年 JavaScript 装饰器提案的状态。除了上述语法变化外，Babel 旧版装饰器的调用约定与本提案不同：

- 旧版装饰器使用“目标”（正在构造的类或原型）调用，而本提案中正在构造的类不会提供给装饰器。  
- 旧版装饰器使用完整的属性描述符调用，而本提案仅使用“被装饰的事物”和上下文对象调用装饰器。这意味着，例如，无法更改属性属性，并且 getter 和 setter 不会“合并”，而是分别装饰。  

尽管存在这些差异，但通常可以使用本装饰器提案实现与 Babel 旧版装饰器相同的功能。如果你在本提案中看到重要的缺失功能，请提交一个问题。

#### 与 TypeScript “实验性”装饰器的比较

TypeScript 实验性装饰器与 Babel 旧版装饰器大致相似，因此该部分的评论也适用。此外：

- 本提案不包括参数装饰器，但它们可能由未来的内置装饰器提供，请参阅 [EXTENSIONS.md](https://github.com/tc39/proposal-decorators/blob/master/EXTENSIONS.md)。  
- TypeScript 装饰器在所有静态装饰器之前运行所有实例装饰器，而本提案中的评估顺序基于程序中的顺序，无论它们是静态的还是实例的。  

尽管存在这些差异，但通常可以使用本装饰器提案实现与 TypeScript 实验性装饰器相同的功能。如果你在本提案中看到重要的缺失功能，请提交一个问题。

#### 与之前的第 2 阶段装饰器提案的比较

之前的第 2 阶段装饰器提案比本提案功能更全面，包括：

- 所有装饰器添加任意“额外”类元素的能力，而不仅仅是包装/更改被装饰的元素。  
- 声明新私有字段的能力，包括在多个类中重用私有名称  
- 类装饰器访问以操作类中的所有字段和方法  
- 更灵活的初始化处理，将其视为“thunk”

之前的第 2 阶段装饰器提案基于描述符的概念，这些描述符代表各种类元素。此类描述符在本提案中不存在。然而，这些描述符为类形状提供了太多的灵活性/动态性，以便进行高效的优化。

本装饰器提案故意省略了这些功能，以保持装饰器的“范围明确”和直观，并简化实现，无论是在转译器还是原生引擎中。

#### 与“静态装饰器”提案的比较

静态装饰器是一种包含一组内置装饰器的想法，并支持从它们派生的用户定义装饰器。静态装饰器位于单独的命名空间中，以支持静态可分析性。

静态装饰器提案存在过度复杂性和优化不足的问题。本提案通过回归装饰器作为普通函数的常见模型来避免这种复杂性。

有关静态装饰器提案优化不足的更多信息，请参阅 [V8 对装饰器可优化性的分析](https://docs.google.com/document/d/1GMp938qlmJlGkBZp6AerL-ewL1MWUDU8QzHBiNvs3MM/edit)，本提案旨在解决这个问题。

### 如果之前的 TC39 装饰器提案没有成功，为什么不回到标准化的 TS/Babel 旧版装饰器？

可优化性：本装饰器提案和旧版装饰器在装饰器作为函数方面是共同的。然而，本提案的调用约定旨在通过以下更改比旧版装饰器更具可优化性：

正在构造的不完整类不会暴露给装饰器，因此在类定义评估期间不需要可观察到的形状变化。  
只能更改被装饰构造的内容；属性描述符的“形状”不能改变。  
与 `[[Define]]` 字段语义不兼容：当应用于字段声明时，旧版装饰器深度依赖于字段初始化器调用setter的语义。TC39得出[结论](https://github.com/tc39/proposal-class-fields/blob/master/README.md#public-fields-created-with-objectdefineproperty)，字段声明的行为类似于`Object.defineProperty`。这一决定使得许多使用旧版装饰器的模式不再有效。尽管Babel提供了一种通过将初始化器作为thunk使其可用的方法，但这些语义已被实现者拒绝，因为增加了运行时成本。 `[[Define]]` 字段语义不兼容：当应用于字段声明时，旧版装饰器深度依赖于字段初始化器调用setter的语义。TC39得出结论，字段声明的行为类似于`Object.defineProperty`。这一决定使得许多使用旧版装饰器的模式不再有效。尽管Babel提供了一种通过将初始化器作为thunk使其可用的方法，但这些语义已被实现者拒绝，因为增加了运行时成本

### 为什么优先考虑“旧版”装饰器的功能，如类，而不是装饰器可以提供的其他功能？

“旧版”装饰器在 JavaScript 生态系统中已经变得非常流行。这证明它们确实解决了许多人面临的问题。本提案以此为基础，并在 JavaScript 语言中构建了原生支持。它以一种方式进行，为将来使用相同语法扩展许多不同类型的扩展留下了机会，如 [EXTENSIONS.md](https://github.com/tc39/proposal-decorators/blob/master/EXTENSIONS.md) 中所述。

### 我们可以支持装饰对象、参数、块、函数等吗？

是的！一旦我们验证了这种核心方法，本提案的作者计划回来提出更多类型的装饰器。特别是，鉴于 TypeScript 参数装饰器的流行，我们正在考虑在本提案的初始版本中包含参数装饰器。请参阅 [EXTENSIONS.md](https://github.com/tc39/proposal-decorators/blob/master/EXTENSIONS.md)。

### 装饰器能让你访问私有字段和方法吗？

是的，私有字段和方法可以像普通字段和方法一样被装饰。唯一的区别是上下文对象上的 `name` 键只是元素的描述，而不是可以用来访问它的东西。相反，提供了一个带有 `get` / `set` 函数的访问对象。请参阅标题“访问”下的示例。

### 在本提案实现后，如何在转译器中使用它？

本装饰器提案需要与之前的旧版/实验性装饰器语义分开实现。可以通过构建时选项（例如命令行标志或配置文件中的条目）切换到这些语义。请注意，在进入第 3 阶段之前，本提案预计将继续进行重大更改，不应依赖其稳定性。

导出装饰器的模块可以通过检查它们的第二个参数是否是对象（在本提案中，总是是；以前，总是否）来轻松检查它们是否以旧版/实验性的方式或本提案中描述的方式调用。因此，应该可以维护适用于这两种方法的装饰器库。

### 是什么让这个装饰器提案比以前的提案更具静态可分析性？尽管本提案基于运行时值，但它仍然是静态可分析的吗？

在本装饰器提案中，每个装饰器位置对去糖化后生成的代码形状都有一致的影响。系统不会调用带有属性属性动态值的 `Object.defineProperty`，用户定义的装饰器也不太可能进行此类调用，因为“目标”不会提供给装饰器；只有函数的实际内容。

### 静态可分析性如何帮助转译器和其他工具？

静态可分析的装饰器帮助工具从构建工具生成更快、更小的 JavaScript，使装饰器能够被转译掉，而不会导致在运行时创建和操作额外的数据结构。工具更容易理解发生了什么，这有助于树摇、类型系统等。

LinkedIn 尝试使用之前的第 2 阶段装饰器提案时发现，它导致了显著的性能开销。Polymer 和 TypeScript 团队的成员也注意到这些装饰器生成的代码大小显著增加。

相比之下，本装饰器提案应该被编译成在特定位置简单地调用函数，并用另一个类元素替换一个类元素。我们正在通过在 Babel 中实现提案来证明这一好处，以便在提议进入第 3 阶段之前进行有根据的比较。

静态可分析性对工具有用的另一个例子是 ES 模块的命名导出。命名导入和导出的固定性质有助于树摇、类型导入和导出，以及这里，作为组合装饰器可预测性质的基础。尽管生态系统仍然从完全动态对象的导出过渡，但 ES 模块已经在工具中扎根，并被发现有用，正是因为它们的静态性质。

### 静态可分析性如何帮助原生 JS 引擎？

虽然 [JIT](https://en.wikipedia.org/wiki/Just-in-time_compilation) 可以优化几乎任何东西，但它只能在程序“预热”后进行优化。也就是说，当典型的 JavaScript 引擎启动时，它不使用 JIT——相反，它将 JavaScript 编译为字节码并直接执行。稍后，如果代码运行多次，JIT 将启动并优化程序。

对流行 Web 应用程序执行跟踪的研究表明，启动页面的大部分时间通常用于解析和通过字节码执行，通常只有较小比例的代码运行 JIT 优化代码。这意味着，如果我们希望 Web 快速，我们不能依赖花哨的 JIT 优化。

装饰器，尤其是之前的第 2 阶段提案，增加了各种开销，无论是执行类定义还是使用类，如果没有被 JIT 优化掉，都会使启动变慢。相比之下，组合装饰器总是以固定的方式简化为内置装饰器，可以直接由字节码生成处理。

### getter/setter 的合并发生了什么？

本装饰器提案基于一个通用模型，其中每个装饰器只影响一个语法元素——字段、方法、getter、setter 或类。立即可以看到正在装饰的内容。

之前的“第 2 阶段”装饰器提案有一个“合并” getter/setter 对的步骤，最终与旧版装饰器对属性描述符的操作有些相似。然而，由于访问器的计算属性名称的动态性，这种合并非常复杂，无论是在规范还是实现中。合并是“第 2 阶段”装饰器填充实现中的一个主要开销来源（例如，代码大小方面）。

尚不清楚哪些用例从 getter/setter 合并中受益。移除 getter/setter 合并大大简化了规范，我们预计它也会简化实现。

如果你有进一步的想法，请参与问题跟踪器上的讨论：[#256](https://github.com/tc39/proposal-decorators/issues/256)。

### 为什么装饰器花了这么长时间？

我们真的很抱歉延迟了。我们理解这给 JavaScript 生态系统带来了实际问题，并且正在尽我们所能尽快找到解决方案。

我们花了很长时间才让每个人在框架、工具和原生实现的要求上达成一致。只有在各个具体方向上努力之后，我们才全面了解了本提案旨在满足的要求。

我们正在努力改进 TC39 内部以及与更广泛的 JavaScript 社区之间的沟通，以便在未来能够更快地纠正此类问题。





