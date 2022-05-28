---
title: js面向对象笔记-1
date: 2020-07-27 20:36:46
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---
面向对象篇开始
<!-- more -->

# es6
## 类
在es6中可以使用 `class` 关键字声明一个类，后面可以使用这个类进行实例化。
语法：
```js
class NameOfClass {
    // class body
}
```
## 类 constructor 构造函数
用于传递参数然后返回实例对象，使用 `new` 关键字时自动使用这个构建函数。比如:
```js
class Game {
    constructor(name, type, price) {
        this.name = name;
        this.type = type;
        this.price = price;
    }
}
var residentEvil = new Game('Resident Evil 3', 'AVG', '414￥');
```

## 类中公用方法
```js
class Game {
    // constructor和上面一样
    describe() {
        console.log('游戏名：' + this.name);
        console.log('游戏类型：' + this.type);
        console.log('游戏售价：' + this.price);
    }
}
var residentEvil = new Game('Resident Evil 3', 'AVG', '414￥');
residentEvil.describe();
```

## 类的继承
子类可以继承父类的属性和方法
```js
// 父类
class Game {
    constructor() {
        // ...
    }
    price() {
        console.log('游戏价格：100￥');
    }
}
class AVGGame extends Game {

}
var son = new AVGGame();
son.price();
```

## super 关键字
`super` 关键字用于访问父类和调用父类上的函数（构造函数和普通函数）。比如：
```js
class Game {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    getPrice() {   
        console.log('游戏售价：' + this.price);
    }
    retName() {
        return this.name;
    }
}
class AVGGame extends Game {
    constructor(name, price) {
        super(name, price);
    }
    getName() {
        console.log(super.retName());
    }
}
var residentEvil = new AVGGame('Resident Evil 3','414￥');
residentEvil.getPrice();
residentEvil.getName();
```
> 注意：super必须要在this之前

## 三个注意点
1. 在ES6中类没有变量提升，需要先定义后使用。
2. 类里面共有的属性和方法要加this进行使用，比如
```js
class Game {
    constructor(name, price) {
        this.name = name;
        this.price = price;
        this.fn = this.getPrice;
    }
    getPrice() {   
        console.log('游戏售价：' + this.price);
    }
}
```
3. 类里的this指向问题：谁调用某个方法，那么那个方法里面的this指向的是调用者，而构建函数指向的是实例化的对象。

# es5
## 创建对象方法
创建对象有三种方法：
1. 对象字面量
2. new Object();
3. 自定义构造函数
```js
// 1.
var obj1 = {};
// 2.
var obj2 = new Object();
// 3. 
function Game(name) {
    this.name = name;
}
var gta = new Game('Grand Theft Auto');
```
## 实例成员和静态成员
实例成员只能通过实例化对象来访问，比如上面 `Game` 中的name，不可以直接通过 `Game.name` 访问。而静态成员是在构造函数本身上添加的成员，可以同构造函数访问但是不能通过实例对象进行访问，比如在上面的代码基础上：
```js
console.log(Game.name); //undefined
Game.type = 'AVG';
console.log(Game.type); //AVG
console.log(gta.type);  //undefined
```
## 构造函数原型 prototype
如果在构造函数中把函数赋值给实例对象，会因为每次实例化对象时都会分配空间给相同的对象，所以会造成空间浪费，这时候就需要用到原型了。

构造函数通过原型分配的函数是所有对象共享的。
```js
// 同样是上面的代码
Game.prototype.getName = function() {
    console.log(this.name);
}
var gta = new Game('Grand Theft Auto');
gta.getName();  //Grand Theft Auto
```
这样上面的 `getName` 就不用每次实例化对象时都分配一段空间给这个函数。

## 对象原型 __proto__
上面实例化对象可以使用 `getName` 是因为对象中有一个 `__proto__` 对象，他等价于构造函数的 `prototype` ，所以只有构造函数的原型中有这个方法就可以在实例对象中使用

## constructor 构造函数
对象原型 `__proto__` 和 构造函数原型 `prototype` 里面都有一个constructor属性，同时指回构造函数本身。

## 继承父类的属性
这里需要用到 `call` 调用父类的构造函数。
```js
function Father(name) {
    this.name = name;
}
function Son(name) {
    Father.call(this, name)
}
var son = new Son('son');
```

## 继承父类的方法
根据原型链的原理，只需要实例化一个父类的对象赋值给子类对象的 `prototype` 就可以通过原型链访问到父类的方法了。
```js
function Father(name) {
    this.name = name;
}
Father.prototype.getName = function() {
    console.log(this.name);
}
function Son(name) {
    Father.call(this, name);
}
Son.prototype = new Father();
var son = new Son('son');
son.getName();  // son
```


# 类的本质
在es6之前可以通过构造函数+原型实现面向对象编程，es6之后可以通过类进行面向对象编程。类其实可以看做是构造函数和原型结合的语法糖。