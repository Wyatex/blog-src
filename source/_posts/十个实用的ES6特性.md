---
title: 十个实用的ES6特性
date: 2020-06-01 08:56:20
tags:
- 学习笔记
- JavaScript
- 前端
categories: 前端
---

记录一些ES6的新特性

<!-- more -->

来源：[Vue中文社区](https://mp.weixin.qq.com/s?__biz=MzIyMDkwODczNw==&mid=2247486985&idx=1&sn=66c0f5df5f2f80df546e044b588481a8&chksm=97c593a7a0b21ab1c9816657ef42910e0bfcf84cbb77be884441c5fce1e9ecff71e262b2ecae&mpshare=1&scene=23&srcid=&sharer_sharetime=1590973043053&sharer_shareid=b7cae91520a141b16a6c7eb7f03383f1#rd)

# 展开操作符
示例:
```js
let firstHalf = [ 'one', 'two'];
let secondHalf = ['three', 'four', ...firstHalf];
```
非常简洁的一个特性。如果不用展开符的话需要这样写:
```js
let firstHalf = [ 'one', 'two'];
let secondHalf = ['three', 'four'];
for(var i=0, i <firstHalf.length; i++ ) {
  secondHalf.push(firstHalf[i]);
}
```
展开操作符也适用于合并对象的属性：
```js
const hero = {
    name: '李白',
    role: '刺客'
}
const heroWithAttackRange = {
    ...hero,
    AttackRange: '近战'
}
```
不用展开操作符的话，需要遍历对象的属性：
```js
let keys = Object.keys(hero);
let obj = {};

for(var i=0; i< keys.length; i++) {
   obj[keys[i]] = keys[props[i]];
}
```

# 剩余参数
剩余参数将剩余的参数收入数列。JavaScript 的特性是参数数目很灵活。通常会有一个 arguments 变量收集参数。直接上例子：
```js
function sum(first, second, ...remaining) {
  return first + second + remaining.reduce((acc, curr) => acc + curr, 0);
}
```
是不是很像go语言的可变参数。

# 字符串插值/模板字符串
见过这样的语句吗？
```js
class Product {
  constructor(name, description, price) {
    this.name = name;
    this.description = description;
    this.price = price;
  }
  getDescription() {
    return " Full description \n" +
    " name: " + this.name +
    " description: " + this.description
  }
}
```
当然，我指的是 getDescription() 方法中那个可读性不佳的多行长语句。大多数编程语言中都存在类似现象。一些语言提供了字符串插值，幸运的是，JavaScript 正是其中之一。
```js
getDescription() {
   return `Full description \n:
   name: ${this.name}
   description ${this.description}
   `;
}
```

# 简写属性
在 ES5 中必须这么写：
```js
function createCoord(x, y) {
  return {
    x: x,
    y: y
  }
}
```
ES6 以后可以使用简写属性：
```js
function createCoord(x, y) {
  return {
    x,
    y
  }
}
```
看起来也简洁很多了。

# 方法属性简写
方法属性是在对象中定义指向方法的属性。在ES5要这样写:
```js
const math = {
  add: function(a,b) { return a + b; },
  sub: function(a,b) { return a - b; },
  multiply: function(a,b) { return a * b; }
}
```
ES6 以后只需这么写：
```js
const math = {
  add(a,b) { return a + b; },
  sub(a,b) { return a - b; },
  multiply(a,b) { return a * b; }
}
```

# 解构赋值
大佬说：解构赋值有利于开发者本人的心理健康。先来看看代码：
```js
function handle(req, res) {
    const name = req.body.name;
    const description = req.body.description;
    const url = req.url;

    log('url endpoint', url);

    // todo:后续业务代码
}
```
不管从什么角度来看，上面的代码都不完美，但它确实体现了一种应用场景，我们想要从对象的不同层次获取数据。你也许会问，这里有什么问题？好吧，我可以不用声明这么多变量，省下一些敲击键盘的次数。
```js
function handle(req, res) {
    const { body: { name, description }, url } = req;

    log('url endpoint', url);

    // todo:后续业务代码
}
```
可以看到代码从三行缩成了一行。解构赋值并不仅仅局限于对象，它同样适用于数组：
```js
const array = [1,2,3,4,5,6];
const a = array[0];
const c = array[2];
```
可以写成：
```js
const array = [1,2,3,4,5,6];
const [a, ,c, ...another] = arr;

// another = [4,5,6]，a = 1，b = 3
```
我们可以使用上面的模式匹配分解数组的值。我们使用 , , 跳过某些值。上面提到过的剩余参数这里也能用，在这里我们通过剩余参数捕获了剩余的数组成员。

解构赋值还可以用于函数和参数。函数有不止 2-3 个参数时，使用一个对象收集所有参数是 JavaScript 的事实标准。
比如下面的一个函数：
```js
function doSomething(config) {
  if(config.a) { ... }
  if(config.b) { ... }
  if(config.c) { ... }
}
```
使用更好的写法：
```js
function doSomething({ a, b, c }) {
  if(a) { ... }
  if(b) { ... }
  if(c) { ... }
}
```

[runoob上还有其他用法](https://www.runoob.com/w3cnote/deconstruction-assignment.html)

# 数组方法
ES6 引入了许多有用的数组方法，例如：
* `find()`，查找列表中的成员，返回 null 表示没找到
* `findIndex()`，查找列表成员的索引
* `some()`，检查某个断言是否至少在列表的一个成员上为真
* `includes`，列表是否包含某项

下面的代码有助于你理解它们的用法：
```js
const arr = [{ id: 1, checked: true }, { id: 2 }];
arr.find(item => item.id === 2) // { id: 2 }
arr.findIndex(item => item.id === 2) // 1
arr.some(item => item.checked) // true

const numberArray = [1,2,3,4];
numberArray.includes(2) // true
```

Promises + Async/Await
如果你在这个圈子里呆了些年头，也许会记得曾经有一个时期我们只有回调，就像：
```js
function doSomething(cb) {
  setTimeout(() =>  {
    cb('done')
  }, 3000)
}

doSomething((arg) => {
 console.log('done here', arg);
})
```
我们使用回调是因为有些操作是异步的，需要时间来完成。后来我们有了 promise 库，人们开始使用它。然后 JavaScript 逐渐加入了对 promise 的原生支持。
```js
function doSomething() {
    return new Promise((resolve, reject) => {
        setTimeout(() =>  {
            resolve('done')
        }, 3000)
    })
}

doSomething().then(arg => {
    console.log('done here', arg);
})
```
我们甚至可以这样调用，将 promise 串起来：
```js
getUser()
    .then(getOrderByUser)
    .then(getOrderItemsByOrder)
    .then(orderItems => {
    // 处理排序后的成员
})
```
后来生活更加美好，我们有了 async/await，上面代码可以写成：
```js
async function getItems() {
    try {
        const user = await getUser();
        const order = await getOrderByUser(user);
        const items = await getOrderItemsByOrder(order);
        return items;
    } catch(err) {
        // 在这里处理错误，建议返回某个值或者重新抛出错误
    }
}

getItems().then(items => {
    // 处理排序后的成员
})
```

# 模块
大部分编程语言都支持模块这一概念（C++20标准才支持），也就是将代码分为多个文件，每个文件是一个自我包含的单元（模块）。
看看下面代码：
```js
// math.js

export function add(a,b) { return a + b; }
export function sub(a,b) { return a - b; }

export default mult(a,b) => a * b;

// main.js
import mult, { add, sub } from './math';

mult(2, 4) // 8
add(1,1)   // 2
sub(1,2)   // -1
```
我们在上面用 `export` 关键字注明了 `add` 和 `sub` 这两个结构对任何引入该模块的模块都公开可见。`export default` 关键字则注明仅仅 `import` 模块时得到的结构。在 `main.js` 中，我们将导入的 `default` 命名为 `mult`，同时指明我们引入 `add()` 和 `sub()` 这两个方法。

# 箭头函数
箭头函数和字典作用域 `this`：我在这篇文章中很多地方都用到了箭头函数，它不过是另一种函数表示法。过去我们只能这么声明函数：
```js
function printArray(arr) {
    // 一些代码
}
```
现在我们也可以这么写：
```js
const printArray = (arr) => {
    // 一些代码
}
```
也可以写成一行：
```js
const add = (a,b) => a + b
```
我们也可以采用下面的语法返回一个对象：
```js
const create = (a,b) = > ({ x: a, y: b })
```
过去会碰到搞不清 this 是什么的问题，看看下面代码：
```js
let array = [1,2,3];

function sum() {
    this.total = 0;

    arr.forEach(function(item) {
        this.total += item;  // 糟糕，`this` 是内层函数的 `this`
    })
    return total;
}
```
上面代码中的 this 指向 forEach 内部函数的 this，这可不是我们想要的。过去可以通过这个方法解决：
```js
function sum() {
    this.total = 0;
    var self = this;

    arr.forEach(function(item) {
        self.total+= item;  // 这里我们使用 `self` 来指向外层的this，它虽然能解决问题，但是感觉有点别扭
    })
    return total;
}
```
现在代码看起来是这样的：
```js
function sum() {
  this.total = 0;

  arr.forEach((item) => {
    this.total+= item;  // 一切安好，`this` 指向外层函数
  })
  return total;
}
```
ES6 方面的还有很多内容，不过这篇文章只介绍最常用的特性。我觉得你应该从今天开始使用这些特性。