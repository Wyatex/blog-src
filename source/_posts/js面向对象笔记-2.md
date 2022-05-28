---
title: js面向对象笔记-2
date: 2020-07-29 11:20:38
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---
defineProperty、call、apply、bind、闭包笔记

<!-- more -->

# Object.keys获取对象属性名
Object.keys()可以用于获取对象自身的所有属性，类似与for...in，返回一个由属性名组成的数组。
```js
var obj = {
    id: 1,
    name: 'obj'
};
console.log(Object.keys(obj));  // ["id", "name"]
```

# Object.defineProperty方法
函数原型： `Object.defineProperty(obj, prop, descriptor)` 
* obj：目标对象
* prop：需要定义或者修改的名字
* descriptor：目标属性所拥有的特性

其中 `descriptor` 是一个对象，里面可以包含：
* value：设置属性的值，默认undefined
* writable：值是否可重写，默认false
* enumerable：目标属性是否可被枚举，默认false
* configurable：目标是否服用被删除或者是否可以再次修改特性，默认false

```js
var obj = {
    id: 1,
    name: 'obj'
};
Object.defineProperty(obj, 'num', {
    value: 100,
    enumerable: true,   //这里设置成true后通过keys方法遍历可以看到num属性
    configurable: true  //这里使用true下面可以再次使用defineProperty操作num属性
})
Object.defineProperty(obj, 'num', {
    value: 1000,
})
obj.num = 10000;
console.log(Object.keys(obj));  //["id", "name", "num"]
console.log(obj.num);           //1000,由于上面writable默认是false，所以无法直接修改，仍然是重定义后的1000
```
所以如果想让某个方法的属性不能被遍历出来可以将 `enumerable` 设置成 `false` 或者默认。如果让某个属性不能被修改可以设置 `writable` 或者默认。同样不想让某个属性被删除可以设置 `configurable` 

# this指向
调用方式 | this指向
- | -
普通函数 | windows
构造函数 | 实例对象，包括原型对象的方法也是
对象方法调用 | 该方法所属对象
事件绑定方法 | 绑定该方法的对象
定时器函数 | windows
立刻执行函数 | windows

# 改变this指向
## call
call()方法调用一个函数或者方法，可以通过传入值修改函数或者方法里this的指向。
函数使用: `fun.call(thisArg, arg1, arg2, ...)`
比如：
```js
var o = {
    name: 'jack'
}
function fn() {
    console.log(this);
}
fn.call(o); //this指向了o
```
## apply
和call区别只有一个，就是不能传入后面的几个参数，只能传入一个数组。
```js
fun.apply(thisArg, [arg1, arg2, ...])
```

## bind
也可以改变this指向，不过他不会立刻执行，而是返回一个修改this指向后的函数。
```js
var o = {
    name: 'jack'
}
function fn() {
    console.log(this);
}
fn.bind(o)() //输出的是对象o
```

# 高阶函数
高阶函数值这个函数能接收或者返回一个函数的函数（有套娃内味了）
比如：
```js
function calculate(op, x, y) {
    console.log(op(x,y));
}
function add(x,y) {
    return x + y;
}
calculate(add, 1, 2);   //3
```
js不愧是动态语言，使用起来比c、go方便多了，go使用高级函数还得先为一些函数定义好函数原型才能用。

# 闭包
闭包是指某个函数有权访问另一个函数作用域中变量的函数。  ——JavaScript高级程序设计
```js
function func1() {
    var num = 10;
    (function func2() {
        console.log(num);   //能访问外部的num，实现了闭包
    })()
}
func1();    //10
```
c语言不能实现闭包的原因是因为在一个函数里不能访问另一个函数内的局部变量。

