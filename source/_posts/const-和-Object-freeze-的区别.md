---
title: const 和 Object.freeze() 的区别
date: 2020-11-19 18:56:38
tags:
- JavaScript
- 前端
- 学习笔记
categories: JavaScript
---

这篇文章介绍了使用const和Object.freeze()在 JS中定义常量和配置值一些做法，以及它们之间的区别。

<!-- more -->

当我们在 JS 应用程序中定义常量和配置值时。它们应具有以下特点:
* 跨应用程序可访问
* 量的值是不可变的
* 变量的引用应该是不可变的

接下来一个一个看上面三个特征。

# 使用 let

```js
let CONFIG = 'ip: 127.0.0.1'

function getConfigCentent() {
    CONFIG = '发生修改'
    return CONFIG
}

getConfigCentent()  //'发生修改'
```
可以看到上面的值被修改了，那怎么防止值被修改呢

# 使用 const
当我们使用 `const` 来定义时

```js
const CONFIG = 'ip: 127.0.0.1'

function getConfigCentent() {
    CONFIG = '发生修改'         // Uncaught TypeError: Assignment to constant variable.
    return CONFIG               
}
```
可以看到当修改时抛出错误，但是真的能防止值被修改吗？看下面操作
```js
const fruites = ['葡萄', '哈密瓜']
fruites.push('香蕉')

console.log(fruites )       //["葡萄", "哈密瓜", "香蕉"]
```
或者使用对象
```js
const constants = {
  APP_NAME: "Foo"
}
constants.APP_NAME = "已修改"
console.log(constants.APP_NAME) //已修改
```
可以看到 `const` 的意思只是引用的地址值不能改变，但是能修改地址对应的对象的值

那怎么防止引用数据的值不被修改呢？

# 使用 Object.freeze()
 `Object.freeze()` 的作用是忽略对象或者数组的值的改变
 ```js
let constants = Object.freeze({
  APP_NAME: "foo"
})
constants.APP_NAME = "bar"
console.log(constants.APP_NAME) // foo
 ```
可以从示例中看到，如果更改值，它不会抛出任何错误，也不会影响对象状态。但是他并不能阻止引用的修改
```js
let constants = Object.freeze({
  APP_NAME: "foo"
})
constants = {
   APP_NAME : "bar"
}
console.log(constants.APP_NAME); //bar
```

看到这里，我猜善于思考的你在大脑中有答案了

# 一起使用 const 和 Object.freeze()
直接看效果：
```js
const Config = Object.freeze({
  APP_NAME : "foo"
})

Config.APP_NAME = "bar"      //依然是foo

Config = {
    APP_NAME : "bar"
}                            //抛出上面一样的TypeError
```

