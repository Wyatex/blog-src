---
title: js笔记：对象-2
date: 2020-09-11 16:55:13
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---

继续记录对象的一些特性

<!-- more -->


# 属性特征
JS中可以对属性的访问特性进行控制

## 查看对象的属性特征
使用 `Object.getOwnPropertyDescriptor` 或者 `Object.getOwnPropertyDescriptor` 查看属性的一些特征
```js
let foo = {
    name: "foo",
    age: 18
}
console.log(JSON.stringify(Object.getOwnPropertyDescriptor(foo, "name"), null, 2));
// {
//   "value": "foo",
//   "writable": true,
//   "enumerable": true,
//   "configurable": true
// }
console.log(JSON.stringify(Object.getOwnPropertyDescriptors(foo), null, 2));
// {
//   "name": {
//     "value": "foo",
//     "writable": true,
//     "enumerable": true,
//     "configurable": true
//   },
//   "age": {
//     "value": 18,
//     "writable": true,
//     "enumerable": true,
//     "configurable": true
//   }
// }
```
## 属性的四个特征

属性 | 意义 | 默认值
- | - | -
value | 当前属性的值 | undefined
writable | 是否可被修改 | false
enumerable | 是否可被for in 遍历 | false
configurable | 是否可被删除 | false

> 上面三个特征默认值为 `false` 是对于 `defineProperty` 来说的，如果只是使用点来定义的话，全部都是true。

## 设置特征
在[js面向对象笔记-2](/JavaScript/js面向对象笔记-2/#Object-defineProperty方法)中有说明

## 禁止添加
`Object.preventExtensions` 禁止向对象添加属性
```js
let foo = {
    name: "foo"
}
Object.preventExtensions(foo);
foo.age = 18; //Error
```

`Object.isExtensible` 判断是否能向对象中添加属性
```js
let foo = {
    name: "foo"
}
Object.preventExtensions(foo);
console.log(Object.isExtensible(foo)); //false
```

## 封闭对象
`Object.seal()` 方法封闭一个对象，阻止添加新属性并将所有现有属性标记为 `configurable: false` ，`Object.isSealed` 方法判断是否封闭
```js
let foo = {
    name: "foo",
    age: 18
}

Object.seal(foo);
console.log(JSON.stringify(Object.getOwnPropertyDescriptors(foo), null, 2))
// {
//   "name": {
//     "value": "foo",
//     "writable": true,
//     "enumerable": true,
//     "configurable": false
//   },
//   "age": {
//     "value": 18,
//     "writable": true,
//     "enumerable": true,
//     "configurable": false
//   }
// }
console.log(Object.isSealed(foo));  // ture
delete foo.name; //Error
```

# 冻结对象
`Object.freeze` 冻结对象后不允许添加、删除、修改属性，`writable`、`configurable`都标记为`false`
```js
let foo = {
    name: "foo"
}
Object.freeze(foo);
foo.age = 18; //Error
```

# 属性访问器
getter方法用于获得属性值，setter方法用于设置属性，这是JS提供的存取器特性即使用函数来管理属性。
* 用于避免错误的赋值
* 需要动态监测值的改变
* 属性只能在访问器和普通属性任选其一，不能共同存在

## getter/setter
```js
let user = {
    data: {name: "foo", age: null},
    set age(value) {
        if (typeof value != "number" || value > 100 || value < 10) {
        throw new Error("年龄格式错误");
        }
        this.data.age = value;
    },
    get age() {
        return `年龄是：${this.data.age}`
    }
}
user.age = 18
console.log(user.age)   //年龄是：18
```
下面使用getter设置只读的课程总价
```js
let Lesson = {
  lists: [
    { name: "js", price: 100 },
    { name: "mysql", price: 212 },
    { name: "vue.js", price: 98 }
  ],
  get total() {
    return this.lists.reduce((t, b) => t + b.price, 0);
  }
};
console.log(Lesson.total); //410
Lesson.total = 30; //无效
console.log(Lesson.total); //410
```
批量设置属性的使用
```js
const web = {
  name: "百度",
  url: "baidu.com",
  get site() {
    return `${this.name} ${this.url}`;
  },
  set site(value) {
    [this.name, this.url] = value.split(",");
  }
};
web.site = "好123,hao123.com";
console.log(web.site);
```
下面是设置token储取的示例，将业务逻辑使用 `getter/setter` 处理更方便，也方便其他业务的复用。
```js
let Request = {
  get token() {
    let con = localStorage.getItem('token');
    if (!con) {
    	alert('请登录后获取token')
    } else {
    	return con;
    }
  },
  set token(con) {
  	localStorage.setItem('token', con);
  }
};
Request.token = 'Bearer xxxxx'
console.log(Request.token);   //Bearer xxxxx
```
定义内部私有属性
```js
const user = {
  get name() {
    return this._name;
  },
  set name(value) {
    if (value.length <= 3) {
      throw new Error("用户名不能小于三位");
    }
    this._name = value;
  }
};    
user.name = "foo";          //Uncaught Error
console.log(user.name);
user.name = "foo and bar";
console.log(user.name);
```

## 访问器描述符
使用 `defineProperty` 可以模拟定义私有属性，从而使用面向对象的抽象特性。
```js
function User(name, age) {
  let data = { name, age }
  Object.defineProperties(this, {
    name: {
      get() {
        return data.name
      },
      set(value) {
        if (value.trim() == "") throw new Error("无效用户名")
        data.name = value
      }
    },
    age: {
      get() {
        return data.name;
      },
      set(value) {
        if (value.trim() == "") throw new Error("无效的用户名");
        data.name = value;
      }
    }
  })
}
let foo = new User("foo", 3)
console.log(foo.name)   //foo
foo.name = "bar"
console.log(foo.name)   //bar
```
也可以使用es6之后的class语法糖定义：
```js
const DATA = Symbol();
class User {
  constructor(name, age) {
    this[DATA] = { name, age };
  }
  get name() {
    return this[DATA].name;
  }
  set name(value) {
    if (value.trim() == "") throw new Error("无效的用户名");
    this[DATA].name = value;
  }
  get age() {
    return this[DATA].name;
  }
  set age(value) {
    if (value.trim() == "") throw new Error("无效的用户名");
    this[DATA].name = value;
  }
}
```

## 闭包访问器

```js
let data = {
  name: 'foo',
}
for (const [key, value] of Object.entries(data)) {
  observer(data, key, value)
}

function observer(data, key, v) {
  Object.defineProperty(data, key, {
    get() {
      return v
    },
    set(newValue) {
      v = newValue
    },
  })
}
data.name = 'bar'
console.dir(data.name) //bar
```

# 代理拦截
代理（拦截器）是对象的访问控制，`setter/getter` 是对单个对象属性的控制，而代理是对整个对象的控制。
## 使用方法

转到：[js元编程：代理](/JavaScript/js元编程：代理/?highlight=代理)

```js
const foo = { name: "foo"}
const proxy = new Proxy(foo, {
  get(obj, property) {
    return obj[property]
  },
  set(obj, property, value) {
    obj[property] = value
    return true                 //严格模式下 set 必须返回布尔值
  }
})
proxy.age = 10
console.log(foo)
```

## 代理函数
如果代理以函数方式执行时，会执行代理中定义 `apply` 方法。

参数说明：函数，上下文对象，参数

下面使用 apply 计算函数执行时间
```js
function factorial(num) {
  return num == 1 ? 1 : num * factorial(num - 1)
}
let proxy = new Proxy(factorial, {
  apply(func, obj, args) {
    console.time("run")
    func.apply(obj,args)
    console.timeEnd("rum")
  }
})
proxy.apply(this, [1,2,3])
```