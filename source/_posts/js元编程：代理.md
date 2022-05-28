---
title: js元编程笔记：代理
date: 2020-09-23 17:17:11
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---

>从ECMAScript 2015 开始，JavaScript 获得了 Proxy 和 Reflect 对象的支持，允许你拦截并定义基本语言操作的自定义行为（例如，属性查找，赋值，枚举，函数调用等）。借助这两个对象，你可以在 JavaScript 元级别进行编程。    —— MDN

<!-- more -->

在 ECMAScript 6 中引入的 `Proxy` 对象可以拦截某些操作并实现自定义行为。
```js
let handler = {
    get: function(target, name) {
        return name in target ? target[name] : -1
    }
}
let p = new Proxy({}, handler)
p.a = 1
console.log(p.a, p.b)       //1 -1
```

这里Proxy对象定义了一个目标（空对象）和一个实现了 `get` 陷阱的handle对象，这时候对代理的对象未定义的属性进行 `get` 操作时不会返回 `undefined` 而是-1。

# 术语

**handler**: 包含陷阱的占位符对象。
**traps**: 提供属性访问的方法。这类似于操作系统中陷阱的概念。
**target**: 代理虚拟化的对象。它通常用作代理的存储后端。根据目标验证关于对象不可扩展性或不可配置属性的不变量（保持不变的语义）。
**invariants**: 实现自定义操作时保持不变的语义称为不变量。如果你违反处理程序的不变量，则会抛出一个 `TypeError`。

# 句柄和陷阱

## handler.get()
Handler / trap | Interceptions | Invariants
- | - | -
handler.get() | Property access: proxy[foo]and proxy.bar<br>Inherited property access: Object.create(proxy)[foo]<br>Reflect.get() | * The value reported for a property must be the same as the value of the corresponding target object property if the target object property is a non-writable, non-configurable data property. <br> * The value reported for a property must be undefined if the corresponding target object property is non-configurable accessor property that has undefined as its [[Get]] attribute.

可以看出，这个陷阱能拦截一个对象的读取属性操作，甚至对通过 `Object.create` 创建的对象使用这个陷阱。(还有`Reflect.get()`也可以)

但是在 `Invariants` 中可以看到，第一个约束是：如果属性特征的 `configurable` 或者 `writable` 设置为false而且get不返回原来的值就会导致报错。

（第二个还搞不清楚）

示例：
```js
var obj = new Proxy({name: "foo"}, {
    get(target, property) {
        if (property in target) {
            return target[property]
        } else {
            throw new ReferenceError(`property name "${property}" does not exist`)
        }
    }
})
console.log(obj.name)   //foo
console.log(obj.age)    //Uncaught ReferenceError: property name "age" does not exist

let obj1 = {}
Object.defindProperty(obj1, "name", {
    value: "foo"
})

var p = new Proxy(obj1, {
    get() {
        return "返回其他值"
    }
})
console.log(p.name);
//Uncaught TypeError: 'get' on proxy: property 'name' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value (expected 'foo1' but got '返回其他值')
```
可以看到，当writable或者configurable为false时，如果不是返回属性的值的话，会自动抛出一个TypeError。

## handler.set()
Handler / trap | Interceptions | Invariants
- | - | -
handler.get() | Property assignment: proxy[foo] = bar and proxy.foo = bar<br>Inherited property assignment: Object.create(proxy)[foo] = bar<br>Reflect.set() | Cannot change the value of a property to be different from the value of the corresponding target object property if the corresponding target object property is a non-writable, non-configurable data property.<br> Cannot set the value of a property if the corresponding target object property is a non-configurable accessor property that has undefined as its [[Set]] attribute.<br>In strict mode, a false return value from the set handler will throw a TypeError exception.

这个方法是设置属性值操作的捕获器，当使用方括号或者点为属性赋值时能捕获，当指定继承者的属性值也可以捕获（Object.create(proxy)[foo] = bar），当然`Reflect.set()`也可以。

当违背下面约束时会抛出TypeError异常：
* 若目标属性是一个不可写及不可配置的数据属性，则不能改变它的值。
* 如果目标属性没有配置存储方法，即 [[Set]] 属性的是 undefined，则不能设置它的值。
* 在严格模式下，如果 set() 方法返回 false，那么也会抛出一个 TypeError 异常。

```js
var p = new Proxy({}, {
  set: function(target, prop, value, receiver) {
    target[prop] = value;
    console.log('property set: ' + prop + ' = ' + value);
    return true;
  }
})

console.log('a' in p);  // false

p.a = 10;               // "property set: a = 10"
console.log('a' in p);  // true
console.log(p.a);       // 10
```

## handler.apply()
`handler.apply()` 方法用于拦截函数的调用。

不多说直接上例子
```js
function sum(a, b) {
  return a + b;
}

const handler = {
  apply: function(target, thisArg, argumentsList) {
    console.log(`Calculate sum: ${argumentsList}`);
    // expected output: "Calculate sum: 1,2"

    return target(argumentsList[0], argumentsList[1]) * 10;
  }
};

const proxy1 = new Proxy(sum, handler);

console.log(sum(1, 2));
// expected output: 3
console.log(proxy1(1, 2));
// expected output: 30
```
其中target是目标对象（函数），thisArg为被调用时的上下文对象(也就是this指向)，argumentsList为被调用时的参数数组。

该方法会拦截目标对象的以下操作:
* proxy(...args)


> 还有一些其他的handle，感觉不太需要，所以先放下，学习其他的内容

---

# 双向绑定
```html
<body>
<input type="text" v-model="title" />
<input type="text" v-model="title" />
<div v-bind="title"></div>
</body>
<script>
function View() {
	//设置代理拦截
  let proxy = new Proxy(
    {},
    {
      get(obj, property) {},
      set(obj, property, value) {
        obj[property] = value;
        document
          .querySelectorAll(
            `[v-model="${property}"],[v-bind="${property}"]`
          )
          .forEach(el => {
            el.innerHTML = value;
            el.value = value;
          });
      }
    }
  );
  //初始化绑定元素事件
  this.run = function() {
    const els = document.querySelectorAll("[v-model]");
    els.forEach(item => {
      item.addEventListener("keyup", function() {
        proxy[this.getAttribute("v-model")] = this.value;
      });
    });
  };
}
let view = new View().run();
</script>
```

> 未完待续