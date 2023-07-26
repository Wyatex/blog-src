---
title: 为什么Object.keys不能正确地类型推导
date: 2023-07-25 17:55:56
tags:
  - TypeScript
  - 翻译
categories: TypeScript
---

原文：[Why doesn't TypeScript properly type Object.keys](https://alexharri.com/blog/typescript-structural-typing)


如果你写过一段时间的TypeScript，你可能会遇到这种情况

```ts
interface Options {
  hostName: string;
  port: number;
}

function validateOptions (options: Options) {
  Object.keys(options).forEach(key => {
    if (options[key] == null) { // Expression of type 'string' can't be used to index type 'Options'.
      throw new Error(`Missing option ${key}`);
    }
  });
}
```

这个错误似乎毫无意义。我们使用`options`的键来访问`options`。为什么TypeScript不能解决这个问题呢?

我们可以通过 `Object.keys(options)` 到 `(keyof typeof options)[]` 的强制转换来规避这个问题

```ts
const keys = Object.keys(options) as (keyof typeof options)[];
keys.forEach(key => {
  if (options[key] == null) {
    throw new Error(`Missing option ${key}`);
  }
});
```

但为什么这是一个问题呢?

如果我们访问`Object.keys`的类型定义，能看到：

```ts
// typescript/lib/lib.es5.d.ts


interface Object {
  keys(o: object): string[];
}
```

类型定义非常简单。接受`object`并返回`string[]`。

让这个方法接受一个泛型参数`T`并返回`(keyof T)[]`是非常容易的。

```ts
class Object {
  keys<T extends object>(o: T): (keyof T)[];
}
```

如果`Object.keys`是这样定义的，我们就不会遇到类型错误。

看起来我们应该将`Object`定义这样。但是TypeScript有很好的理由不这样做。原因与TypeScript的[结构类型系统](https://en.wikipedia.org/wiki/Structural_type_system)有关。

## TypeScript中的结构类型

当属性丢失或类型错误时，TypeScript会发出警告。

```ts
function saveUser(user: { name: string, age: number }) {}


const user1 = { name: "Alex", age: 25 };
saveUser(user1); // OK!


const user2 = { name: "Sarah" };
saveUser(user2); // Property 'age' is missing in type { name: string }.

const user3 = { name: "John", age: '34' };
saveUser(user3); // Types of property 'age' are incompatible. Type 'string' is not assignable to type 'number'.
```

然而，如果我们提供了多余的属性，TypeScript也不会报错。

```ts
function saveUser(user: { name: string, age: number }) {}

const user = { name: "Alex", age: 25, city: "Reykjavík" };
saveUser(user); // Not a type error
```

这是结构类型系统的预期行为,如果`A`是`B`的超集，类型`A`可赋值给`B`（即`A`包含`B`中的所有属性）。

然而，如果A是B的真超集(即A比B有更多的属性),那么A可以赋值给B，但是B不能赋给A。

这些都很抽象，所以让我们来看一个具体的例子。

```
type A = { foo: number, bar: number };
type B = { foo: number };


const a1: A = { foo: 1, bar: 2 };
const b1: B = { foo: 3 };


const b2: B = a1;
const a2: A = b1; // Property 'bar' is missing in type 'B' but required in type 'A'.
```

关键的结论是，当我们有一个`T`类型的对象时，我们所知道的关于这个对象的一切就是它至少包含了`T`中的属性。

我们不知道我们是否有确切的`T`，这就是为什么`Object.keys`的类型会是这样。让我们举个例子。

### 不安全地使用Object.keys
假设我们正在为创建一个新用户注册的界面。我们有一个现有的`User`接口，看起来像这样:

```ts
interface User {
  name: string;
  password: string;
}
```

在将用户保存到数据库之前，我们要确保用户对象是有效的。

- `name`不能为空。
- `password`至少为6个字符。

因此，我们创建一个`validators`对象，其中包含`User`中的每个属性的验证函数

```ts
const validators = {
  name: (name: string) => name.length < 1
    ? "Name must not be empty"
    : "",
  password: (password: string) => password.length < 6
    ? "Password must be at least 6 characters"
    : "",
};
```

然后，我们创建一个 `validateUser` 函数，通过这些验证器运行 `User` 对象

```ts
function validateUser(user: User) {
  // Pass user object through the validators
}
```

因为我们想要验证`user`中的每个属性，所以可以使用`Object.keys`遍历`user`中的属性

```ts
function validateUser(user: User) {
  let error = "";
  for (const key of Object.keys(user)) {
    const validate = validators[key];
    error ||= validate(user[key]);
  }
  return error;
}
```

> 注意:在这个代码块中有类型错误，我现在隐藏。我们稍后再谈。

这种方法的问题是，`user`对象可能包含`validators`中不存在的属性。

```ts
interface User {
  name: string;
  password: string;
}


function validateUser(user: User) {}


const user = {
  name: 'Alex',
  password: '1234',
  email: "alex@example.com",
};
validateUser(user); // OK!
```

即使`User`没有指定`email`属性，这也不是类型错误，因为结构类型允许提供无关的属性。

在运行时，`email`属性将导致`validators`未定义，并在调用时抛出错误。

```ts
for (const key of Object.keys(user)) {
  const validate = validators[key];
  error ||= validate(user[key]); // TypeError: 'validate' is not a function.
}
```

幸运的是，TypeScript在这段代码有机会运行之前就发出了类型错误。


```ts
for (const key of Object.keys(user)) {
  const validate = validators[key]; // Expression of type 'string' can't be used to index type '{ name: ..., password: ... }'.
  error ||= validate(user[key]); // Expression of type 'string' can't be used to index type 'User'.
}
```

现在我们知道为什么`Object.keys`的类型是这样了。它迫使我们承认对象可能包含类型系统不知道的属性。

有了关于结构类型及其缺陷的新知识，让我们来看看如何有效地利用结构类型。

### 利用结构类型
结构类型提供了很大的灵活性。它允许接口准确地声明它们所需要的属性。我想通过一个例子来说明这一点。

假设我们编写了一个函数，解析`KeyboardEvent`并返回要触发的快捷方式。

```ts
function getKeyboardShortcut(e: KeyboardEvent) {
  if (e.key === "s" && e.metaKey) {
    return "save";
  }
  if (e.key === "o" && e.metaKey) {
    return "open";
  }
  return null;
}
```

为了确保代码按预期工作，我们编写了一些单元测试

```ts
expect(getKeyboardShortcut({ key: "s", metaKey: true }))
  .toEqual("save");


expect(getKeyboardShortcut({ key: "o", metaKey: true }))
  .toEqual("open");


expect(getKeyboardShortcut({ key: "s", metaKey: false }))
  .toEqual(null);
```

看起来不错，但是TypeScript会报错


```ts
getKeyboardShortcut({ key: "s", metaKey: true });
// Type '{ key: string; metaKey: true; }' is missing the following properties from type 'KeyboardEvent': altKey, charCode, code, ctrlKey, and 37 more.
```

指定所有37个附加属性将会非常杂乱，所以这是不可能的。

我们可以通过将参数强制转换为`KeyboardEvent`来解决这个问题


```ts
getKeyboardShortcut({ key: "s", metaKey: true } as KeyboardEvent);
```

但这可能会掩盖可能发生的其他类型错误。

相反，我们可以更新`getKeyboardShortcut`，只声明它需要从事件中获取的属性。

```ts
interface KeyboardShortcutEvent {
  key: string;
  metaKey: boolean;
}


function getKeyboardShortcut(e: KeyboardShortcutEvent) {}
```

测试代码现在只需要满足这个更小的接口，这使得它更加简洁。

我们的函数与全局`KeyboardEvent`类型的耦合也更少，可以在更多的上下文中使用。现在灵活多了。

这是不会报错的，因为结构类型`KeyboardEvent`可以分配给`KeyboardShortcutEvent`，因为它是一个超集，尽管`KeyboardEvent`有37个不相关的属性。

```ts
window.addEventListener("keydown", (e: KeyboardEvent) => {
  const shortcut = getKeyboardShortcut(e); // This is OK!
  if (shortcut) {
    execShortcut(shortcut);
  }
});
```

Evan Martin在一篇精彩的文章中探讨了这个想法:[界面通常属于用户](https://neugierig.org/software/blog/2019/11/interface-pattern.html)。我强烈建议大家读一读!它改变了我编写和思考TypeScript代码的方式。
