---
title: js正则表达式
date: 2020-07-31 10:11:20
tags:
- JavaScript
- 前端
- 正则表达式
- 学习笔记
categories: 前端
---

记录一下正则表达式的使用

<!-- more -->

# 创建正则表达式

使用RegExp对象来创建正则表达式
```js
var rg = new RegExp(/123/);
```
也可以使用字面量来创建正则表达式
```js
var rg = /123/
```

# 测试正则表达式
使用方法是 `regexObj.test(str)` 
```js
var rg = /123/
console.log(rg.test(123));  //ture
```

# 正则表达式中的特殊字符
## 边界符
边界符 | 说明
- | -
^ | 表示匹配行首的文本（以谁开始）
$ | 匹配以谁结束

比如：
```js
var rg = /abc/;     //表示含有abc
var rg1 = /^abc/    //表示开头是abc
var rg2 = /abc$/    //表示是以abc结束
var rg3 = /^abc$/   //精准匹配abc
```

## 字符类
使用 `[]` 表示一系列字符可供选择，比如: `/[abc]/` 表示只要有a或者有b或者有c都能匹配。比如： `/^[abc]$/` 只能匹配a或者b或者c。

在方括号里使用 `[-]` 表示范围，比如 `/[a-z]/` 表示只要有26个字母都能匹配

还可以进行字符组合：`/^[a-z0-9A-Z_-]$/` 这样只要是a到z或者0到9或者A到Z或者_或者-开头和结尾都能匹配。

在方括号里面加 `^` 表示取反的意思，比如：`/[^0-9a-z]/` 表示的是不能取0-9和a-z。

## 量词符
1. `*` 重复0次或者很多次
2. `+` 重复1次或者很多次
3. `?` 出现0次或者1次
4. `{3}` 重复三次
5. `{3,}` 大于等于三次
6. `{3,16}` 大于等于3并且小于等于16次
```js
var rg1 = /^a*$/;
console.log(rg1.test(''));      //true
console.log(rg1.test('a'));     //true
console.log(rg1.test('aaa'));   //true

var rg2 = /^a+$/;
console.log(rg2.test(''));      //false
console.log(rg2.test('a'));     //true

var rg3 = /^a?$/;   
console.log(rg3.test('aa'));    //false

var rg4 = /^a{3}$/;  
console.log(rg4.test('aa'));    //false
console.log(rg4.test('aaa'));   //true

var rg5 = /^a{2,}$/;  
console.log(rg5.test('aa'));    //true
console.log(rg5.test('a'));     //false

var rg6 = /^a{2,3}$/; 
console.log(rg6.test('a'));     //false
console.log(rg6.test('aa'));    //true
console.log(rg6.test('aaaa'));  //false
```

# 括号总结
1. 中括号 字符组合：匹配括号中的任意字符
2. 大括号 量词符：表示重复次数
3. 小括号 表示优先级
```js
var reg = /^abc{3}$/    //表示c重复三次 匹配 abccc

reg = /^(abc){3}$/      //表示abc重复三次 匹配 abcabcabc

reg = //
```

# 预定义类
预定义类指某些常见模式的简写方式

预定义类 | 说明
- | -
\d | 匹配0-9之间的任意数字，相当于[0-9]
\D | 匹配0-9以为的字符，相当于[^0-9]
\w | 匹配任意字母、数字和下划线，相当于[A-Za-z0-9_]
\W | 匹配任意字母、数字和下划线以外的字符，相当于[^A-Za-z0-9_]
\s | 匹配空格（包括换行符、制表符），相当于[\t\r\n\v\f]
\S | 匹配非空格的字符，相当于[^\t\r\n\v\f]

```js
var reg = /\d/;
console.log(reg.test('123'))  //true
console.log(reg.test('a'))  //false

//座机号码验证 比如 010-12345678或者0530-1234567
reg = /^\d{3}-\d{8}|\d{4}-\d{7}$/;
// 其中的 | 表示或者的意思
```

# 正则替换
使用 `replace` 方法可以替换字符串，替换方法可以使用正则表达式

```js
var str = 'angel和alex';
var newStr1 = str.replace('tom', 'rin');    //rin和jack
var newStr2 = str.replace(/a/, '*');    //*ngel和alex
```
可以看到只替换了第一个a，没有替换掉后面的，这时候就需要使用到匹配模式了。

> /regexp/[switch]

switch(修饰符)可以选择按照什么模式来匹配，有三个值：
* g: 全局模式
* i: 忽略大小写
* gi: 全局加忽略大小写

```js
var str = 'angel和alex';
var new = str.replace(/a|l/g, '*');  //*nge*和**ex
```