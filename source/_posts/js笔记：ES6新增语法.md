---
title: js笔记：ES6新增语法
date: 2020-08-01 16:54:11
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---
记录下ES6新增的语法

<!-- more -->

# let关键字
let有以下几个特性：
* let声明的变量只在所在的块级有效（也就是在{}中）
* 不存在变量提升（要先声明后使用）
* 具有暂时性死区

```js
//暂时性死区情况
var num = 10;
if (true) {
    console.log(num);
    let num = 20;
}
//由于在块里面存在let关键字，所以使用num时不会在外部寻找num，而且因为先定义后使用的原因，在let上面调用num会报错
```

> var关键字不具备上述特点

经典面试题：
```js
var arr = [];
for (var i = 0; i < 2; i++) {
    arr[i] = function() {
        console.log(i);
    }
}
arr[0]();   //2
arr[1]();   //2
```
```js
let arr = [];
for (let i = 0; i < 2; i++) {
    arr[i] = function() {
        console.log(i);
    }
}
arr[0]();   //0
arr[1]();   //1
```

# const关键字
作用：声明常量，即内存地址不能改变的值

特点：
* 使用const关键字声明的常量也具有块级作用域。
* 声明时必须赋值
* 赋值后不能修改

# var、let、const比较
var | let | const
- | - | -
函数级作用域 | 块级作用域 | 块级作用域
变量提升 | 不存在变量提升 | 不存在变量提升
值可更改 | 值可更改 | 地址值不可更改

> 还有一些其他的移步到：[十个实用的ES6特性](/JavaScript/十个实用的ES6特性/)