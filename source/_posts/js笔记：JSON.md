---
title: js笔记：JSON
date: 2020-10-03 17:21:57
tags:
- JavaScript
- 前端
- 学习笔记
categories: 前端
---

* json 是一种轻量级的数据交换格式，易于人阅读和编写。
* 使用json 数据格式是替换 xml 的最佳方式，主流语言都很好的支持json 格式。所以 json 也是前后台传输数据的主要格式。
* json 标准中要求使用双引号包裹属性，虽然有些语言不强制，但使用双引号可避免多程序间传输发生错误语言错误的发生。

<!-- more -->

# 声明定义
基本结构
```js
let foo = {
    "name": "foo",
    "age": 18,
    "father": {
        "name": "bar"
    }
}
```
数组结构
```js
let lessons = [
    {
        "title": "JavaScript入门到实战",
        "tag": [
            "前端",
            "JS"
        ]
    },
    {
        "title": "Vue入门到实战",
        "click": 12
    }
]
```

# 序列化
序列化是将 `json` 转换为字符串，一般用来向其他语言传输使用。
```js
//这里用上面的两个变量来序列化

console.log(JSON.stringify(foo))
//{"name":"foo","age":18,"father":{"name":"bar"}}

console.log(JSON.stringify(lessons))
//[{"title":"JavaScript入门到实战","tag":["前端","JS"]},{"title":"Vue入门到实战","click":12}]
```

然后可以通过在参数列表的第二个参数控制需要序列号输出的属性：
```js
console.log(JSON.stringify(lessons, ["title", "tag"]))
//[{"title":"JavaScript入门到实战","tag":["前端","JS"]},{"title":"Vue入门到实战"}]
```

第三个是参数用来控制TAB对应空格的数量，如果字符串则为前导字符。
```js
console.log(JSON.stringify(lessons, null, 4))
// [
//     {
//         "title": "JavaScript入门到实战",
//         "tag": [
//             "前端",
//             "JS"
//         ]
//     },
//     {
//         "title": "Vue入门到实战",
//         "click": 12
//     }
// ]
```

为数据添加 toJSON 方法来自定义返回格式
```js
let foo = {
    "name": "foo",
    "age": 18,
    "father": {
        "name": "bar"
    },
	"toJSON": function() {
		return {
			"name": this.name,
			"father": this.father
		}
	}
}
console.log(JSON.stringify(foo))
// {"name":"foo","father":{"name":"bar"}}
```

# 反序列化
使用 `JSON.parse` 将字符串 `json` 解析成对象
```js
// 依旧使用上面的foo对象
let jsonStr = JSON.stringify(foo)
console.log(JSON.parse(jsonStr))
```

使用第二个参数可以对返回的数据进行二次处理
```js
let jsonStr1 = JSON.stringify(lessons);
console.log(
  JSON.parse(jsonStr1, (key, value) => {
    if (key == "tag") {
      return value+",实战";
    }
    return value;
  })
);
```