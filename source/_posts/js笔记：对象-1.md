---
title: js笔记：对象-1
date: 2020-08-19 17:50:23
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---
这个系列详细的记录对象相关的知识点

<!-- more -->

# 函数编程和面向对象对比
函数编程可能编写出来的方法可能不简练
```js
let user = []
function add(user, name) {
    user.push(name)
}
function edit(user, index, rename) {
    if(index < user.length) {
        user[index] = rename
    }
}

```
面向对象就可省略很多的代码，比如下面的对象
```js
function genUser() {
    this.name = []
}
genUser.prototype.add = function(name) {
    this.name.push(name)
}
genUser.prototype.edit = function(index, rename) {
    this.name[index] = rename
}
let userA = new genUser()
```
或者直接写成es6的代码
```js
class genUser {
    constructor() {
        this.name = []
    }
    add() {
        //...
    }
    edit() {

    }
}
```
这样感觉更优雅了


# 引用传址
因为对象是引用类型，直接赋值只会复制地址：
```js
let user = {}
let otherUser = user
user.name = "张三"
console.log(otherUser.name)     //张三
```

# 展开语法实现参数合并
比如：
```js
function upload(params) {
    let config = {
        type: "*.jpeg,*.png",
        size: 100000
    }
    config = {...config, ...params}
    console.log(config)
}
console.log(upload({size: 9999}))   
//{type: "*.jpeg,*.png", size: 9999}
console.log(upload({size: 9999, type: "*.gif"}))    
//{type: "*.gif", size: 9999}
```

# 解析赋值
跳转到[十个实用的ES6特性:解构赋值](/JavaScript/十个实用的ES6特性/#解构赋值)

# 函数参数解构
```js
function foo([name, age]) {}
foo(["Handsome Jack", 18])

function bar(name, {sex, age})      //只解析部分
bar("Handsome Jack", {sex: "male", age: 18})
```

# 对象属性的增删查改

## 查
使用 `hasOwnProperty()` 方法可以查看是否存在某个属性：
```js
let foo = {}
foo.name = "Handsome Jack"
console.log(foo.hasOwnProperty("name"))     //true
console.log(foo.hasOwnProperty("age"))      //false
```
如果想要检查原型 `__proto__` 中是否拥有某个属性就需要用到 `in` 关键字：
```js
let foo = []
console.log(foo.hasOwnProperty("length"))   //true
console.log(foo.hasOwnProperty("push"))     //false
console.log("push" in foo)                  //true

```

## 读取
可以用点语法或者中括号都能访问到对象里面的某个成员。（特殊的成员只能用中括号）
```js
let user = {
    name: "张三",
    "my age": 18
}
console.log(user.name);				//张三
console.log(user["name"]);			//张三
console.log(user.my age);			//Uncaught SyntaxError: missing ) after argument list
console.log(user["my age"]);		//18
```
不过一般都不会用上面那么奇怪的写法，而且点会更加常用

## 遍历
可以用 `for in` 遍历,这种情况下就只能用中括号了：
```js
let user = {
    name: "张三",
    "my age": 18
}
for (const key in user) {
    console.log(user[key])
}
```

## 新增或者删除属性
也是直接用点语法或者中括号就行了
```js
let user = {}
user["name"] = '张三'
user.age = 19;
user.get = function() {
	return `${this.name}的年龄是${this.age}`
}
console.log(user.get())     //张三的年龄是19
delete user.age
console.log(user.get())     //张三的年龄是undefined
```

# 对象浅拷贝
浅拷贝的意思是：不能深层次的拷贝，只能拷贝第一层的基本属性（不包括对象）
## 使用循环

```js
let foo = {
    name: "foo",
    url: "foo.com"
}
let bar = {}
for (const key in foo) {
    bar[key] = hd[key]
}
bar[name] = "bar"           //foo中的name不会发生改变
```

## 使用assign方法
```js
let foo = {
    name: "foo",
    url: "foo.com"
}
let bar = Object.assign({}, foo)
bar[name] = "bar"           //foo中的name不会发生改变
```

## 展开语法
```js
let foo = {
    name: "foo",
    url: "foo.com"
}
let bar = {...foo}
bar[name] = "bar"           //foo中的name不会发生改变
```

# 深拷贝

## 递归实现
```js
function DeepCopy(obj) {
    let res = {}
    for (const key in obj) {
        res[key] = typeof obj[key] == "object" ? DeepCopy(obj[key]) : obj[key]
    }
    return res
}
```
不过这个只是考虑到对象并没有考虑到数组，继续优化一下
```js
function DeepCopy(obj) {
    let res = obj instanceof Array ? [] : {}
    for (const [key, value] of Object.entries(obj)) {
        res[key] = typeof value == "object" ? DeepCopy(value) : value
    }
    return res
}
```
