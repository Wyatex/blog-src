---
title: js笔记：类
date: 2020-10-29 21:39:42
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---

es5的基础基本上学完了，继续学习es6中的类

<!-- more -->

# 简介
因为在js中生成实例对象的方法是直接通过构造函数，和c++和java有较大出入，所以es6提供了更接近传统语言的写法，通过`class`关键字，可以直接定义类

不过这个`class`只是一个语法糖，例如
```js
class Foo {
  // ...
}

console.log(typeof Foo);
console.log(Foo === Foo.prototype.constructor); // true
```
可以知道其实类就是一个函数，类本身指向构造函数，而且定义在“类”上的方法其实也都是定义在构造函数的`prototype`属性上
```
class Foo {
    constructor() {
        // ...
    }

    toString() {
        // ...
    }

    toValue() {
        // ...
    }
}
// 等同于
Foo.prototype = {
    constructor() {},
    toString() {},
    toValue() {}
};
```
想往类添加其他的方法除了在使用class定义时也可以像[原型与继承](/JavaScript/js笔记：原型与继承/#Mixin模式)中Mixin模式那样直接使用`Object.assign`进行添加
```
class Foo {
    constructor() {
        // ...
    }
}
Object.assign(Foo.prototype, {
    toString() {},
    toValue() {}
})
```

注意：和ES5不同的地方是类内部定义的方法是不可枚举的，而es5是可枚举的
```
class Foo {
    constructor() {

    }
    toString() {

    }
}
function Bar() {

}
Bar.prototype.toString = function() {}
console.log(Object.keys(Foo.prototype));            //[]
console.log(Object.keys(Bar.prototype));            //["toString"]
console.log(Object.getOwnPropertyNames(Foo.prototype)); //["constructor","toString"]
console.log(Object.getOwnPropertyNames(Bar.prototype)); //["constructor","toString"]
```

还有个不同点是`class`必须使用`new`调用，否则会报错，这也是和普通构造函数不同的地方

## constructor方法
用法在 [js面向对象笔记](/JavaScript/js面向对象笔记-1/#类-constructor-构造函数) 里写有。

`constructor` 方法如果没有显式定义，则会默认添加一个空的 `constructor` 

`constructor` 默认返回实例对象，也就是 `this` ，也可以指定返回另一个对象，不过会导致实例对象不是该类。

类和普通的构造函数不一样的就是类必须要用 `new` 来调用否则报错。

## 类的实例
生成类的实例的写法，与ES5一样，需要用 `new` ，和上面说的一样如果不加 `new` 调用 `class` 会产生报错

和ES5差不多如果实例的属性除非是显式定义在其本身（即定义在 `this` 对象上），否则都是定义在原型上（即定义在 `class` 上）。

与 ES5 一样，类的所有实例共享一个原型对象。
```js
var p1 = new Point(2,3);
var p2 = new Point(3,2);

p1.__proto__ === p2.__proto__
//true
```

> `__proto__` 并不是语言本身的特性，这是各大厂商具体实现时添加的私有属性，虽然目前很多现代浏览器的 JS 引擎中都提供了这个私有属性，但依旧不建议在生产中使用该属性，避免对环境产生依赖。生产环境中，我们可以使用 `Object.getPrototypeOf` 方法来获取实例对象的原型，然后再来为原型添加方法/属性。

但是一旦修改 `__proto__` 后可能会影响后面实例化的所有实例

## getter和setter
在前面的es5里面有为单个实例对象添加getter和setter的方法：[js笔记：对象](/JavaScript/js笔记：对象-2/#getter-setter)

ES6和ES5差不多，可以在类内部使用 `get` 和 `set` 关键字，对某个属性设置存值函数和取值函数，拦截该属性的存取行为。
```js
class CustomHTMLElement {
  constructor(element) {
    this.element = element;
  }

  get html() {
    return this.element.innerHTML;
  }

  set html(value) {
    this.element.innerHTML = value;
  }
}

var descriptor = Object.getOwnPropertyDescriptor(
  CustomHTMLElement.prototype, "html"
);

"get" in descriptor  // true
"set" in descriptor  // true
```

## 属性表达式
类的属性名，可以采用表达式
```js
let foo = 'getName'

class Student {
    constructor(name) {
        //...
    }

    [foo]() {
        //...
    }
}
```

## Class 表达式
类也可以像函数一样通过表达式赋值给变量
```js
const MyClass = class Me {
  getClassName() {
    return Me.name;
  }
};
```
上面代码使用表达式定义了一个类。需要注意的是，这个类的名字是Me，但是Me只在 Class 的内部可用，指代当前类。在 Class 外部，这个类只能用MyClass引用。

采用 Class 表达式，可以写出立即执行的 Class。
```js
let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('张三');

person.sayName(); // "张三"
```

## 注意点
### 严格模式
类和模块的内部，默认就是严格模式，所以不需要使用use strict指定运行模式。只要你的代码写在类或模块之中，就只有严格模式可用。考虑到未来所有的代码，其实都是运行在模块之中，所以 ES6 实际上把整个语言升级到了严格模式。

### 不存在提升
类不存在变量提升（hoist），这一点与 ES5 完全不同。
```
new Foo(); // ReferenceError
class Foo {}
```

### name 属性
由于本质上，ES6 的类只是 ES5 的构造函数的一层包装，所以函数的许多特性都被Class继承，包括name属性。
```js
class Point {}
Point.name // "Point"
```
name属性总是返回紧跟在class关键字后面的类名。

### Generator 方法
如果某个方法之前加上星号（*），就表示该方法是一个 Generator 函数。
```js
class Foo {
  constructor(...args) {
    this.args = args;
  }
  * [Symbol.iterator]() {
    for (let arg of this.args) {
      yield arg;
    }
  }
}

for (let x of new Foo('hello', 'world')) {
  console.log(x);
}
// hello
// world
```