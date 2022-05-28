---
title: js核心知识进阶笔记（1）：this指向
date: 2021-11-02 18:28:59
tags:
  - JavaScript
  - 前端
  - 学习笔记
categories: 前端
---

所有知识来自：前端开发知识进阶：从夯实基础到突破瓶颈。

<!-- more -->

# this 到底指向谁

最广为流传的说法是：“谁调用它，this 就指向谁”。这其实并不准确。准确来说是执行上下文。

在讲细节之前可以先“死记硬背”几条规则：

- 在函数体中，非显式或隐式地简单调用函数时，在严格模式下，函数内的 this 会被绑定到 undefined 上，在非严格模式下则会被绑定到全局对象 window/global 上。
- 一般使用 new 方法调用构造函数时，构造函数内的 this 会被绑定到新创建的对象上。
- 一般通过 call/apply/bind 方法显式调用函数时，函数体内的 this 会被绑定到指定参数的对象上。
- 一般通过 上下文对象调用函数时，函数体内的 this 会被绑定到该对象上。
- 在箭头函数中，this 的指向是由外层(函数或全局)作用域来决定的。

但是实际上还是得实际情况具体分析

下面的代码没有特别说明都是在浏览器环境中运行。

# 实例分析

## 例题 1：全局环境的 this

先看例题：

```js
function f1() {
  console.log(this)
}
function f2() {
  'use strict'
  console.log(this)
}
f1() // window
f2() // undefined
```

很简单，并符合你的预期，但是也会有变种

```js
const foo = {
  bar: 10,
  fn: function () {
    console.log(this)
    console.log(this.bar)
  },
}

var fn1 = foo.fn
fn1()
```

这里 fn1 执行时 this 依然是 window，因为这是在全局环境中执行的。

稍微改一下

```js
const foo = {
  bar: 10,
  fn: function () {
    console.log(this)
    console.log(this.bar)
  },
}

foo.fn()
```

这次输出：

```js
{bar: 10, fn: ƒ}
10
```

因为上下文是 foo 对象，所以毫无疑问 this 指向 foo 对象。

## 例题 2：上下文对象调用 this

根据上一个例子，我们加点嵌套：

```js
const person = {
  name: 'jack',
  brother: {
    name: 'mike',
    fn: function () {
      return this.name
    },
  },
}

console.log(person.brother.fn())
```

这里输出的是 mike，因为 this 会指向最后调用它的对象。再来看难一点的

```js
const o1 = {
  text: 'o1',
  fn: function () {
    return this.text
  },
}

const o2 = {
  text: 'o2',
  fn: function () {
    return o1.fn()
  },
}

const o3 = {
  text: 'o3',
  fn: function () {
    var fn = o1.fn
    return fn()
  },
}

console.log(o1.fn())
console.log(o2.fn())
console.log(o3.fn())
```

答案是：o1、o1、undefined

- 第一个输出 o1 应该是毫无疑问的。
- 第二个因为 o2.fn()最终还是调用了 o1.fn()，所以结果还是 o1
- 最后一个通过 var fn = o1.fn 的赋值再进行”裸奔“调用了，所以 this 指向是 window，所以结果是 undefined

面试官可能会问如何让`console.log(o2.fn())`输出 o2，一般面试者都会想到使用 bind、call、apply，面试官可能会问除此之外还有别的方法吗，其实是有的，如下：

```js
const o1 = {
  text: 'o1',
  fn: function () {
    return this.text
  },
}

const o2 = {
  text: 'o2',
  fn: o1.fn,
}

console.log(o2.fn())
```

只需要讲 o1 的 fn 挂载到 o2 上即可。

## 例题 3：通过 bind、call、apply 改变 this 指向

这三个函数都是用来改变相关函数 this 指向的，详细用法直接百度就有，这里不展开讲。
上例题：

```js
const foo = {
  name: 'jack',
  fn: function () {
    return this.name
  },
}

const bar = {
  name: 'mike',
}

console.log(foo.fn.call(bar))
```

这里打印 mike，并不难理解

## 例题 4：构造函数和 this

直接上例题：

```js
function Foo() {
  this.bar = 'jack'
}

const instance = new Foo()
console.log(instance.bar)
```

如果你看过构造函数的话就知道这里输出的是 jack，没什么问题。

课外知识：这里的 new 操作符调用构造函数具体做了什么？这里是简略的步骤

- 创建一个新的对象
- 将构造函数 this 指向这个新对象
- 为对象添加属性、方法
- 返回这个新对象

简略步骤按照代码大概是这样的：

```js
var obj = {}
obj.__proto__ = foo.prototype
Foo.call(obj)
```

当然这只是最简单的版本。

但是当构造函数中显示使用 return 的话，又分为两种情况：

场景 1：下面输出 undefined，instance 得到的是返回的空对象 o

```js
function Foo() {
  this.bar = 'jack'
  const o = {}
  return o
}

const instance = new Foo()
console.log(instance.bar)
```

场景 2： 下面输出 jack，instance 得到的是目标对象实例 this

```js
function Foo() {
  this.bar = 'jack'
  return 1
}

const instance = new Foo()
console.log(instance.bar)
```

所以，如果构造函数中显式返回一个值，且返回的是一个对象(返回复杂类型)，那么 this 就指向这个返回的对象;如果返回的不是一个对象(返回基本类型)，那么 this 仍然指向实例。

## 例题 5：箭头函数中的 this

在此之前，先重温一遍箭头函数：在箭头函数中，this 的指向是由外层(函数或全局)作用域来决定的。

就比如这个，this 出现在 setTimeout 函数中，因此 this 指向 windows 对象

```js
const foo = {
  fn: function () {
    setTimeout(function () {
      console.log(this)
    })
  },
}
console.log(foo.fn())
```

想要让这个 this 指向 foo 可以巧用箭头函数来解决：

```js
const foo = {
  fn: function () {
    setTimeout(() => {
      console.log(this)
    })
  },
}
console.log(foo.fn())
```

单纯的箭头函数中 this 指向问题非常简单，但是如果综合所有情况，并结合 this 优先级的话，this 就不那么容易确定了。

## 例题 6：this 优先级

我们常常把 call、apply、bind、new 对 this 进行绑定的情况成为显示绑定，而把根据调用关系确定 this 指向的情况称为隐式绑定。
那显示绑定和隐式绑定谁的优先级更高呢？来看看下面代码：

```js
function foo() {
  console.log(this.a)
}

const obj1 = {
  a: 1,
  foo,
}

const obj2 = {
  a: 2,
  foo,
}

obj1.foo.call(obj2)
obj2.foo.call(obj1)
```

输出分别是 2、1，也就是说 call、apply 这些显示绑定一般要比隐式绑定高。再来看另一段：

```js
function foo(a) {
  this.a = a
}

const obj1 = {}

var bar = foo.bind(obj1)
bar(2)
console.log(obj1.a)
```

输出的是：2，也就是说执行 bar(2)后 obj1 对象是:`{a:2}`

如果再将 bar 作为构造函数的话，下面代码会输出 3：

```js
var baz = new bar(3)
console.log(baz.a)
```

当 bar 再次通过 new 调用时，返回的实例就已经和 obj1 解绑了，new 修改了 bind 绑定的 this 指向，也就是说 new 绑定的优先级要比显示 bind 绑定更高。

下面我们看看箭头函数：

```js
function foo() {
  return (a) => {
    console.log(this.a)
  }
}

const obj1 = {
  a: 1,
}

const obj2 = {
  b: 2,
}

const bar = foo.call(obj1)
bar.call(obj2)
```

输出结果是 1。由于 foo 中的 this 绑定到了 obj1 上，所以 bar（引用箭头函数）中的 this 也绑定到 obj1 上，而且箭头函数的绑定是无法被修改的。

如果将 foo 完全写成箭头函数，下面代码会输出 123：

```js
var a = 123
const foo = () => {
  return (a) => {
    console.log(this.a)
  }
}

const obj1 = {
  a: 1,
}

const obj2 = {
  b: 2,
}

const bar = foo.call(obj1)
bar.call(obj2)
```

因为调用 foo 是箭头函数根据上下文已经绑定到了全局对象 window 上，下面的 call 就没办法修改 this 了。再抖个机灵，改一下变量 a 的声明：

```js
const a = 123
const foo = () => {
  return (a) => {
    console.log(this.a)
  }
}

const obj1 = {
  a: 1,
}

const obj2 = {
  b: 2,
}

const bar = foo.call(obj1)
bar.call(obj2)
```

这是输出的是 undefined，因为 const 和 let 的声明的变量都不会挂载到 window 全局对象上。不过 const 和 let 等声明变量方式不在本篇讨论范围内，后续再讲解。

# 总结

通过本篇内容的学习，我们看到 this 的用法纷繁多象，确实不容易彻底掌握。本篇尽可能系统地对 this 的用法进行讲解、说明，例题尽可能地覆盖更多场景，但还需要读者在阅读之外继续消化与吸收。只有“记死”，才能“用活”。
如果读者还有困惑，也不要灰心。事实上，资深工程师也不敢保证针对所有场景都能给出很好的解决方案，也存在理解不到位的情况。也许区别资深工程师和菜鸟工程师的点，不完全在于他们回答应试题目的准确率，更在于他们怎么思考问题、解决问题。如果不懂 this 指向，那就动手实践一下；如果不了解原理，那就翻出规范来看一下，没有什么大不了的。
