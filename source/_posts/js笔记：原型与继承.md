---
title: js笔记：原型与继承
date: 2020-10-03 17:52:18
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---

# 原型

## 原型对象
每个对象都有一个原型 `prototype` 对象，通过函数创建的对象也将拥有这个原型对象。原型是一个指向对象的指针。
* 可以将原型理解为对象的父亲，对象从原型对象继承来属性
* 原型就是对象除了是某个对象的父母外没有什么特别之处
* 所有函数的原型默认是 `Object` 的实例，所以可以使用 `toString/toValues/isPrototypeOf` 等方法的原因
* 使用原型对象为多个对象共享属性或方法
* 如果对象本身不存在属性或方法将到原型上查找
* 使用原型可以解决，通过构建函数创建对象时复制多个函数造成的内存占用问题
* 原型包含 `constructor` 属性，指向构造函数
* 对象包含 `__proto__` 指向他的原型对象

<!-- more -->

当然也可以创建一个没有原型的极简对象（原型为null）
```js
let foo = {name: 'foo'}
console.log(foo.hasOwnProperty("name"))   //true

let bar = Object.create(null, {
  name: {
    value: "bar"
  }
})
console.log(bar.hasOwnProperty("name"))   //Uncaught TypeError: bar.hasOwnProperty is not a function
```

函数拥有多个原型， `prototype` 用于实例对象使用，`__proto__` 用于函数对象使用
```js
function User() {}
User.__proto__.view = function() {
  console.log("User function view method");
};
User.view();    //User function view method

User.prototype.show = function() {
  console.log("Hello");
};
let foo = new User();
foo.show();     //Hello
console.log(User.prototype == foo.__proto__); //true
```

{% asset_img 1.png %}

使用 `setPrototypeOf` 、 `getPrototypeOf` 可以设置和获取原型，
```js
let foo = {};
let parent = { name: "parent" };
Object.setPrototypeOf(foo, parent);
console.log(foo);
console.log(Object.getPrototypeOf(foo));
```
`getPrototypeOf` 相当于将某个对象的 `__proto__` 设置成另一个对象

## 原型链

{% asset_img 2.png %}

## 原型检测
`instanceof` 检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上
```js
function A() {}
function B() {}
function C() {}

const c = new C();
B.prototype = c;
const b = new B();
A.prototype = b;
const a = new A();

console.dir(a instanceof A); //true
console.dir(a instanceof B); //true
console.dir(a instanceof C); //true
console.dir(b instanceof C); //true
console.dir(c instanceof B); //false
```
使用 `isPrototypeOf` 检测一个对象是否是另一个对象的原型链中
```js
const a = {};
const b = {};
const c = {};

Object.setPrototypeOf(a, b);
Object.setPrototypeOf(b, c);

console.log(b.isPrototypeOf(a)); //true
console.log(c.isPrototypeOf(a)); //true
console.log(c.isPrototypeOf(b)); //true
```

## 属性检测
使用in 检测原型链上是否存在属性，使用 hasOwnProperty 只检测当前对象
```js
let a = {name: "a"};
let b = {url: "baidu.com"}
Object.setPrototypeOf(a, b);
console.log("name" in a);               //true
console.log("url" in a);                //true
console.log(a.hasOwnProperty("name"));  //true
console.log(a.hasOwnProperty("url"));   //false

for (let key in a) {
	console.log(key);
}
//name
//url
```
不过看方法名就可以知道hasOwnProperty是检测对象自己的属性,而不会查找原型。

## 借用原型
使用 `call` 或 `apply` 可以借用其他原型方法完成功能。
```js
let foo = {
  data: [1,2,3,4,5]
};
Object.setPrototypeOf(foo, {
  max: function() {
    return this.data.sort((a, b) => b - a)[0];
  }
});
console.log(foo.max(foo.data));

let bar = {
  lessons: {
    js:96, php: 89, node: 90
  },
  get data() {
    return Object.values(this.lessons);
  }
}
  

console.log(foo.__proto__.max.call(bar);
```

关于改变this指向详情看：[js面向对象笔记-2#改变this指向](/JavaScript/js面向对象笔记-2/#改变this指向)

# 原型总结
## prototype
可以看到：[js面向对象笔记-1#构造函数原型 prototype](/JavaScript/js面向对象笔记-1/#构造函数原型-prototype)

## Object.create
可以创建一个新的对象，并且设置这个对象的原型和属性，第一个参数设置新对象的原型，第二个参数和 `Object.defineProperty` 的第二第三个参数类似
```js
let user = {
  getName() {
    return this.name
  }
}
let xiaoming = Object.create(user, {
  name: {
    value: "小明"
  }
})

console.log(xiaoming.getName())   //小明
```

## __proto__
实例化对象的`__proto__`记录了对象的原型，但`__proto__`不是对象属性，可以理解为`prototype`的`getter/setter`实现，所以只允许值为对象或者null
```js
let foo = {}
foo.__proto__ = "foo"
console.log(foo)        //foo.__proto__依然是一个Object

let bar = Object.create(null)
bar.__proto__ = "bar"
console.log(bar)        //{__proto__: "bar"}
```
一般通过设置`__proto__`或者使用`Object.setPrototypeOf()`修改对象的原型，或者使用`Object.create`创建一个新的对象并返回，他们效果基本一样，都是作用于`__proto__`

# 优化建议
不要在构造函数里面声明方法，不然会浪费内存，以及函数不能共享
```js
//不建议
function User(name) {
  this.name = name
  this.getName = function() {
    return this.name
  }
}
//建议
function User(name) {
  this.name = name
}
User.prototype.getName = function {
  return this.name
}
```
除了函数也可以通过原型共享属性，相当于Java的类static变量

# 继承
可以转到：[js面向对象笔记-1](/JavaScript/js面向对象笔记-1/#继承父类的方法)

不过除了上面那篇这样，也可以这样实现继承
```js
function Father(name) {
  this.name = name
}
Father.prototype.getName = function() {
  console.log(this.name)
}
function Son(name) {
  Father.call(this, name)
}
Son.prototype = Object.create(Father.prototype)
let son = new Son('son')
son.getName()   //son
```

# 原型工厂
原型工厂是将继承的过程封装，使用继承业务简单化。
```js
function extend(sub, sup) {
  sub.prototype = Object.create(sup.prototype);
  sub.prototype.constructor = sub;
}

function Access() {}
function User() {}
function Admin() {}
function Member() {}

extend(User, Access); //User继承Access
extend(Admin, User); //Admin继承User
extend(Member, Access); //Member继承Access

Access.prototype.rules = function() {};
User.prototype.getName = function() {};

console.log(new Admin()); // 继承关系: Admin>User>Access>Object
console.log(new Member()); //继承关系：Member>Access>Object
```

# 对象工厂
在原型继承基础上，将对象的生成使用函数完成，并在函数内部为对象添加属性或方法。
```js
function User(name, age) {
  this.name = name;
  this.age = age;
}
User.prototype.show = function() {
  console.log(this.name, this.age);
};

function Admin(name, age) {
  let instance = Object.create(User.prototype);
  User.call(instance, name, age);
  instance.role=function(){
    console.log('admin.role');
  }
  return instance;
}
let foo = Admin("foo", 19);
foo.show();

function member(name, age) {
  let instance = Object.create(User.prototype);
  User.call(instance, name, age);
  return instance;
}
let bar = member("bar", 28);
bar.show();
```

# Mixin模式
因为JS不能实现多继承，所以有时候想要继承多个父类时可能会把无关的类连接起来，但是这样做并不优雅也不直观，这时候可以用`Mixin`模式来组合多个父类

```js
function extend(sub, sup) {
  sub.prototype = Object.create(sup.prototype);
  sub.prototype.constructor = sub;
}
function User(name, age) {
  this.name = name;
  this.age = age;
}
User.prototype.show = function() {
  console.log(this.name, this.age);
};
const Request = {
  ajax() {
    return "请求后台";
  }
};
const Credit = {
  __proto__: Request,
  total() {
    console.log(super.ajax() + ",统计积分");
  }
};

function Admin(name, age) {
  User.call(this, name, age);
}
extend(Admin, User);
Object.assign(Admin.prototype, Request, Credit);
let foo = new Admin("foo", 19);
foo.show();
foo.total(); //统计积分
foo.ajax(); //请求后台

```
