---
title: js笔记：symbol、set和map
date: 2020-08-06 21:04:27
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---
记录一下symbol和set的一些知识点

<!-- more -->

# Symbol
## 使用场景
Symbol是一个新增的数据类型，下面先描述一下symbol的一个使用场景，比如在一个游戏中，用户需要选择角色的种族：
```js
var race = {
    protoss: 'protoss',   // 神族
    terran: 'terran',     // 人族
    zerg: 'zerg'          // 虫族
}

function createRole(type){
    if(type === race.protoss){
        //创建神族角色
    }
    else if(type === race.terran){
        //创建人族角色
    }
    else if(type === race.zerg){
        //创建虫族角色
    }
}
```
那么用户选择种族后，就需要调用 createRole 来创建角色：
```js
// 传入字符串
createRole('zerg') 
// 或者传入变量
createRole(race.zerg)
```
一般传入字符串被认为是不好的做法，所以使用 createRole(race.zerg) 的更多。

如果使用 createRole(race.zerg)，那么就会存在一个问题：race.protoss、race.terran、race.zerg 的值为多少并不重要。

改为如下写法，对 createRole(race.zerg) 毫无影响：
```js
var race = {
    protoss: 'askdjaslkfjas;lfkjas;flkj', // 神族
    terran: ';lkfalksjfl;askjfsfal;skfj', // 人族
    zerg: 'qwieqwoirqwoiruoiwqoisrqwroiu' // 虫族
}
```
也就是说，只要 `race.zerg` 的值和另外两个不一样就行了，而Symbol的用处就出来了，Symbol可以创建一个独一无二的值，下面可以改写成：
```js
var race = {
  protoss: Symbol(),
  terran: Symbol(),
  zerg: Symbol()
}
```
甚至可以给他起个名字：
```js
var race = {
  protoss: Symbol('protoss'),
  terran: Symbol('terran'),
  zerg: Symbol('zerg')
}
```
不给这个值只是一个描述，和Symbol没有任何关系。

## Symbol的for和keyFor方法
可以使用 `Symbol.for()` 来创建一个全局的变量，也就是说又可以能不唯一了：
```js
let a = Symbol.for("xxx")
let b = Symbol.for("xxx")
console.log(a == b)     //true
let c = Symbol()
let d = Symbol()
console.log(a !== b)    //true
```
使用 `keyFor` 可以读取使用 `Symbol.for()` 创建的变量:
```js
let a = Symbol()
let b = Symbol.for('123')
console.log(Symbol.keyFor(a))  //undefined
console.log(Symbol.keyFor(b))  //123
```
## 解决字符串耦合问题
比如有一个记录成绩的变量，但是可能在一个班里面存在两个同名的人：
```js
let user1 = '张三'
let user2 = '张三'
let grade = {
    [user1]: {c:95, sql:89},
    [user2]: {c:86,sql:78}
}
console.log(grade)  //{张三:{c:86,sql:78}}
```
因为`[user1]`和`[user2]`最终都会解析成字符串，所以相当于第二次把第一次覆盖了。可以改成这样：
```js
let user1 = {
    name: '张三',
    key: Symbol()
}
let user2 = {
    name: '张三',
    key: Symbol()
}
let grade = {
    [user1.key]: {c:95, sql:89},
    [user2.key]: {c:86,sql:78}
}
console.log(grade[user1.key])   //{c: 95, sql: 89}
console.log(grade[user2.key])   //{c: 86, sql: 78}
```


## 在缓存容器中的使用
比如在一个系统中，有很多模块，和一个为所有模块提供一个储存空间的容器，如果没有Symbol可能是这样的：
```js
class Cache{
    static data = {}
    static set(name, value) {
        return (this.data[name] = value)
    }
    static get(name) {
        return this.data[name]
    }
} 
let user = {
    name: "apple",
    desc: "用户资料"
}
let cart = {
    name: "apple",
    desc: "购物车"
}
//为了把这两个变量存进Cache里面，可能要这样：
Cache.set("user-apple", user)
Cache.set("cart-apple", cart)
console.log(Cache.get("cart-apple"));
```
当我们有symbol后可以改成这样：
```js
//省略类定义
let user = {
    name: "apple",
    desc: "用户资料",
    key: Symbol()
}
let cart = {
    name: "apple",
    desc: "购物车",
    key: Symbol()
}
Cache.set(user.key, user)
Cache.set(cart.key, cart)
console.log(Cache.get(cart.key));   //{name: "apple", desc: "购物车"...}
```

## 属性保护
Symbol有个特性就是无法用 `for in` 得到对象中的Symbol属性：
```js
let s = Symbol()
let obj = {
    
    name: "my name",
    [s]: "Symbol"
}
for (const key in obj){
    console.log(key)
}   //只输出name

``` 
可以通过 `Object.getOwnPropertySymbols` 方法获得：
```js
// 省略声明定义
for (const key of Object.getOwnPropertySymbols(obj)){
    console.log(key)
}   // Symbol()
```
但是这种情况又获取不到非隐藏的属性，可以通过反射拿到所有属性：
```js
for (const key of Reflect。ownKeys(obj)){
    console.log(key)
}
//name
//Symbol()
```

# Set
## 基本用法
ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。
```js
const s = new Set();

[2,3,5,4,5,2,2].forEach(x => s.add(x));
// Set结构不会添加重复的值

for(let i of s) {
  console.log(i);
}


// ## 初始化
// 例一 可以接受一个数组作为参数
const set = new Set([1,2,3,4,4,]);

// ...将一个数组转为用逗号分隔的参数序列
console.log([...set]);

// 例二
const items = new Set([1,2,3,4,5,5,5,5,]);
console.log(items.size);


// 例三 可以接受具有iterable接口的其他数据结构作为参数
const set2 = new Set(document.querySelectorAll('div'));
console.log(set2.size);         //一个div为1

// 类似于
const set2 = new Set();
document
    .querySelectorAll('div')
    .forEach(div => set.add(div));
console.log(set.size);

// set中NaN等于自身，其余比较相当于 ===
let set3 = new Set();
let a = NaN;
let b = NaN;
set3.add(a);
set3.add(b);
console.log(set3)   //set(1) {Nan=N}

// 两个对象总是不相等的
let set4 = new Set();
set4.add({});  
console.log(set4.size); //1

set4.add({}); 
console.log(set4.size); //2

//
let set5 = new Set("abc")
console.log(set5.size)  //3
//相当于 Set([..."abc"])

// 删除,取值，清空
let set6 = new Set("abc")
set6.delete("b")            //成功删除返回true，元素不存在返回false
console.log(set6)           //Set(2) {"a", "c"}
console.log(set6.values())  //SetIterator {"a", "c"}
set6.clear()
console.log(set6)           //Set(0) {}
```

## 类型转换
转换成数组：
```js
let set = new Set(["abc", "def"])
console.log(Array.from(set))
console.log([...set])
```
去除数组中重复的值：
```js
let arr = [1,2,3,4,3,2,1]
arr = [...new Set(arr)]
console.log(arr)            //(4) [1, 2, 3, 4]
```

## 遍历
```js
// 使用forEach
let set = new Set("12345")
set.forEach(function(value, key, set) {
    console.log(value,key,set)  //其中value和key相同
})
//使用for of
for (const value of set) {
    console.log(value)  //输出1到5
}
```

## 并集/交集/差集算法
```js
//并集
let a = new Set("12345")
let b = new Set("2478")
console.log(new Set([...a, ...b]))

//交集
console.log(
    new Set([...a].filter(function(item) {
        return b.has(item)
    }))
)

//差集
console.log(
    new Set([...a].filter(function(item) {
        return !b.has(item)
    }))
)
```

# WeakSet
因为WeakSet的弱引用特性，不能使用keys、values等方法，for of也是不能用。WeakSet与Set相比，WeakSet只能是**对象的集合**，不能是任意类型的任意值。如果没有其他的对WeakSet中对象的引用，那么这些对象会被当成垃圾回收掉。 这也意味着WeakSet中没有存储当前对象的列表。 正因为这样，WeakSet 是不可枚举的。

# Map类型
Map是ES6之后的哈希结构，算是对object类型的修补。在以往的Object类型中只是把字符串作为键名，而Map可以任意类型：
```js
let obj = {
    1: "我是1",
    "1": "我还是1"
}
console.log(obj)    //{1: "我还是1"}
let map = new Map([
    [1, "a"],
    ["1", "b"]
])
console.log(map)    //Map(2) {1 => "a", "1" => "b"}
map.set(function(){}, "我是一个函数")
map.set({}, "我是一个对象")
console.log(map)
//Map(4) {1 => "a", "1" => "b", ƒ => "我是一个函数", {…} => "我是一个对象"}
```
set方法也支持链式操作：
```js
let map = new Map()
map.set(1,"a").set(2,"b")
```

## map类型的增删改查和遍历
增删改查等操作
```js
let map = new Map();
//增&改
map.set("key", "value")
//查
map.get(key)
//删
map.delete(key)
//或者
delete map[key]
//清除
map.clear()
//查看有没有某个元素
map.has(key)
```
遍历操作
```js
let map = new Map();
//for of
for (const key of map.key()) {
    //可以拿到map的键
}
for (const key of map.value()) {
    //可以拿到map的值
}
for (const [key, value] of map.entries()) {
    //可以拿到map的键值对
}
//forEach
hd.forEach((value, key) => {
    //一样可以拿到键值对
})
```

## map的类型转换
数组转换，可以使用展开语法或者 `Array.form` 方法转换。
```js
let hd = new Map([["houdunren", "后盾人"], ["hdcms", "开源系统"]]);

console.log(...hd); //(2) ["houdunren", "后盾人"] (2) ["hdcms", "开源系统"]
console.log(...hd.entries()); //(2) ["houdunren", "后盾人"] (2) ["hdcms", "开源系统"]
console.log(...hd.values()); //后盾人 开源系统
console.log(...hd.keys()); //houdunren hdcms
```

# WeakMap
和WeakSet相似，WeakMap对键名是弱引用，键值是正常引用。
* 键名必须是对象
* 垃圾回收不考虑WeaMap的键名，不会改变引用计数器，键在其他地方不被引用时即删除
* 因为WeakMap 是弱引用，由于其他地方操作成员可能会不存在，所以不可以进行`forEach( )`遍历等操作
* 也是因为弱引用，WeaMap 结构没有keys( )，values( )，entries( )等方法和 size 属性
* 当键的外部引用删除时，希望自动删除数据时使用 `WeakMap`