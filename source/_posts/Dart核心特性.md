---
title: Dart核心特性
date: 2020-09-20 19:01:04
categories: 学习笔记
tags: 
- 学习笔记
- Dart
---

记录Dart的一些特性

<!-- more -->

# 案例介绍
这里选择的是一段购物车程序，先不使用Dart独有的特性，然后逐步加入Dart语言特性。

首先在不使用任何Dart语法特性的情况下，一个有着基本功能的购物车程序如下：
```dart
// 定义商品 Item 类
class Item {
  double price;
  String name;
  Item(name, price) {
    this.name = name;
    this.price = price;
  }
}
 
// 定义购物车类
class ShoppingCart {
  String name;
  DateTime date;
  String code;
  List<Item> bookings;
 
  price() {
    double sum = 0.0;
    for(var i in bookings) {
      sum += i.price;
    }
    return sum;
  }
 
  ShoppingCart(name, code) {
    this.name = name;
    this.code = code;
    this.date = DateTime.now();
  }
 
  getInfo() {
    return '购物车信息:' +
          '\n-----------------------------' +
          '\n 用户名: ' + name+ 
          '\n 优惠码: ' + code + 
          '\n 总价: ' + price().toString() +
          '\n 日期: ' + date.toString() +
          '\n-----------------------------';
  }
}
 
void main() {
  ShoppingCart sc = ShoppingCart('张三', '123456');
  sc.bookings = [Item('苹果',10.0), Item('鸭梨',20.0)];
  print(sc.getInfo());
}
```

这段代码看上去和Java或者JS都没有太大的差异，接下来从表达信息入手，优化这段代码

# 类抽象改造
在Item类和ShoppingCart类的构造函数中，他们都只是将main函数传入的参数进行属性赋值。

在Dart中使用语法糖和初始化列表进行简化：
```js
class Item {
  double price;
  String name;
  Item(this.name, this.price);
}
 
class ShoppingCart {
  String name;
  DateTime date;
  String code;
  List<Item> bookings;
  price() {...}
  // 删掉了构造函数函数体
  ShoppingCart(this.name, this.code) : date = DateTime.now();
...
}
```
然后我们发现：Item类和ShoppingCart类中都有一个name属性，都有一个price属性/方法，既然他们的类型和名称都一样，那么可以抽象出一个Meta基类，用于存放这两个属性。

因为在ShoppingCart中price只是用于计算购物车中商品的价格，那么继承Meta类后需要改写price属性的get方法：
```js
class Meta {
  double price;
  String name;
  Meta(this.name, this.price);
}
class Item extends Meta{
  Item(name, price) : super(name, price);
}
 
class ShoppingCart extends Meta{
  DateTime date;
  String code;
  List<Item> bookings;
  
  double get price {...}
  ShoppingCart(name, this.code) : date = DateTime.now(),super(name,0);
  getInfo() {...}
}
```
不过ShoppingCart类中的price属性的get方法和打印购物车基本信息的getinfo方法都显得冗长，接下来改进一下这两个方法。

# 方法改造
我们需要重载Item类的“+”运算符，并通过对列表对象进行归纳合并操作即可
```dart
class Item extends Meta{
  ...
  // 重载了 + 运算符，合并商品为套餐商品
  Item operator+(Item item) => Item(name + item.name, price + item.price); 
}
 
class ShoppingCart extends Meta{
  ...
  // 把迭代求和改写为归纳合并
  double get price => bookings.reduce((value, element) => value + element).price;
  ...
  getInfo() {...}
}
```
顺便修改getInfo方法，因为字符串拼接实在是太不美观了。
```dart
getInfo () => '''
购物车信息:
-----------------------------
  用户名: $name
  优惠码: $code
  总价: $price
  Date: $date
-----------------------------
''';
```

# 对象初始化方式的优化
因为有可能用户没有优惠券，所以我们需要对构造函数进行改进
```dart
class ShoppingCart extends Meta{
  ...
  // 默认初始化方法，转发到 withCode 里
  ShoppingCart({name}) : this.withCode(name:name, code:null);
  //withCode 初始化方法，使用语法糖和初始化列表进行赋值，并调用父类初始化方法
  ShoppingCart.withCode({name, this.code}) : date = DateTime.now(), super(name,0);
 
  //?? 运算符表示为 code 不为 null，则用原值，否则使用默认值 " 没有 "
  getInfo () => '''
购物车信息:
-----------------------------
  用户名: $name
  优惠码: ${code??" 没有 "}
  总价: $price
  Date: $date
-----------------------------
''';
}
 
void main() {
  ShoppingCart sc = ShoppingCart.withCode(name:'张三', code:'123456');
  sc.bookings = [Item('苹果',10.0), Item('鸭梨',20.0)];
  print(sc.getInfo());
 
  ShoppingCart sc2 = ShoppingCart(name:'李四');
  sc2.bookings = [Item('香蕉',15.0), Item('西瓜',40.0)];
  print(sc2.getInfo());
}
```
因为打印这个行为非常通用，可能后面需要打印Item，所以我们需要把打印信息单独封装成一个类：PrintHelper。因为ShoppingCart 类本身已经继承自 Meta 类，考虑到 Dart 并不支持多继承，所以我们使用混合（Mixin）
```dart
abstract class PrintHelper {
  printInfo() => print(getInfo());
  getInfo();
}
 
class ShoppingCart extends Meta with PrintHelper{
...
}
```

最后在main里面使用级联操作符，这样就不需要创建临时变量了，下面是完整代码

```dart
class Meta {
  double price;
  String name;
  // 成员变量初始化语法糖
  Meta(this.name, this.price);
}
 
class Item extends Meta{
  Item(name, price) : super(name, price);
  // 重载 + 运算符，将商品对象合并为套餐商品
  Item operator+(Item item) => Item(name + item.name, price + item.price); 
}
 
abstract class PrintHelper {
  printInfo() => print(getInfo());
  getInfo();
}
 
//with 表示以非继承的方式复用了另一个类的成员变量及函数
class ShoppingCart extends Meta with PrintHelper{
  DateTime date;
  String code;
  List<Item> bookings;
  // 以归纳合并方式求和
  double get price => bookings.reduce((value, element) => value + element).price;
  // 默认初始化函数，转发至 withCode 函数
  ShoppingCart({name}) : this.withCode(name:name, code:null);
  //withCode 初始化方法，使用语法糖和初始化列表进行赋值，并调用父类初始化方法
  ShoppingCart.withCode({name, this.code}) : date = DateTime.now(), super(name,0);
 
  //?? 运算符表示为 code 不为 null，则用原值，否则使用默认值 " 没有 "
  @override
  getInfo() => '''
购物车信息:
-----------------------------
  用户名: $name
  优惠码: ${code??" 没有 "}
  总价: $price
  Date: $date
-----------------------------
''';
}
 
void main() {
  ShoppingCart.withCode(name:'张三', code:'123456')
  ..bookings = [Item('苹果',10.0), Item('鸭梨',20.0)]
  ..printInfo();
 
  ShoppingCart(name:'李四')
  ..bookings = [Item('香蕉',15.0), Item('西瓜',40.0)]
  ..printInfo();
}
```