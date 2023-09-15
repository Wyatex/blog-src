---
title: flutter快速入门笔记（1）
date: 2022-11-04 14:58:06
categories: Flutter
tags:
  - Flutter
  - 前端
  - 笔记
---

本系列不包含 Dart 语法笔记，以掌握 Dart 语法为前提记录。

<!-- more -->

# 启动

flutter 入口文件 main.dart

```dart main.dart
import 'package:flutter/material.dart'; // 导入md风格组件

void main() => runApp(MyApp()); // 启动flutter

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(home: MyHomePage(title: 'Flutter Demo Home Page'));
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  Widget build(BuildContext context) => {...};
}
```

用 vue3 项目来类比，main.dart 相当于 main.ts/js。runApp 相当于 createApp，MyApp 相当传进 createApp 的根组件，MyHomePage 相当于首页组件。

build 相当于 vue 的 h 或者 createVNode。

# flutter 的三棵树

flutter 的三棵树分别是 widget、element、renderObject 树。
用 vue 类比就是 widget->template/jsx、element->虚拟 dom、renderObject->浏览器 dom 树。

可能不太准确，但是适合对 flutter 没有概念的人理解 flutter 整个渲染原理。

# StatelessWidget

StatelessWidget 非常好理解，就是一个不可变的，没有状态的 widget，用 vue 类比就是一个.vue 文件里面只写个 template 标签，或者再 import 别的组件然后用到 template 上，而且没用 data 函数定义组件的状态。
比如上面的：

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(home: MyHomePage(title: 'Flutter Demo Home Page'));
}
```

相当于 vue 的(当然 vue 中不存在可变或者不可变的组件，简答类比理解一下)

```js MyApp.vue
<template>
    <MaterialThemeConfig>
        <MyHomePage :title="Vue Demo Home Page" />
    </MaterialThemeConfig>
</template>
<script setup>
import MaterialThemeConfig from './MaterialThemeConfig.vue' // 给子组件提供Provider，提供全局的MD样式
import MyHomePage from './MyHomePage.vue'
</script>
```

# StatefulWidget

在 flutter 中，Widget 是不可变的，发生变化时需要销毁重建，所以谈不上状态。既然 widget 不可变，那则么实现有状态的 widget 呢，那就是用另一个类帮我们代理生成 widget，每次状态发生改变，那就让代理类生成一个新的 widget。

```dart
class MyHomePage extends StatefulWidget { // 其实StatefulWidget和StatelessWidget一样不可变
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;
  @override
  _MyHomePageState createState() => _MyHomePageState(); // 但是Statefule的子widget由State代理生成，也就是Statefule的子widget可以动态切换
}

class _MyHomePageState extends State<MyHomePage> { // State类代理里如果状态发生改变就生成新的widget交给外面的StatefulWidget
  Widget build(BuildContext context) => {...};
}
```

用 vue 来理解：

```ts
import { h } from 'vue'
export default {
  setup() {
    // 类似createState
    // do sth
    return {
      // ...
    }
  },
  render: () => h('...'), // 类似build，当主动修改组件的状态时，就重新调用这个render
}
```

> 总结：**StatefulWidget 不是万金油，要慎用**。Widget 是不可变的，更新则意味着销毁 + 重建（build）。StatelessWidget 是静态的，一旦创建则无需更新；而对于 StatefulWidget 来说，在 State 类中调用 setState 方法更新数据，会触发视图的销毁和重建，也将间接地触发其每个子 Widget 的销毁和重建。

所以 StatefulWidget 要用对地方，比如如果根 Widget 是 StatefulWidget 的话，那么他状态一改变整个 widget 树都要重建，可想而知对性能的影响有多严重。

# 生命周期

对于这种数据驱动的框架，一般都会提供生命周期函数钩子，像 vue 的 onMounted、onUpdated 等等。State 的生命周期可以分为 3 个阶段：创建（插入视图树）、更新（在视图树中存在）、销毁（从视图树中移除）

## 创建

State 初始化时会依次执行 ：构造方法（上面的 createState 方法） -> initState（像 vue 的 create 过程，生命周期只调用一次，用于设置默认值） -> didChangeDependencies -> build，随后完成页面渲染。

## 更新

Widget 的状态更新，主要由 3 个方法触发：

- setState：相当于 vue 的 this.xxx = xxx，告诉代理，状态发生了改变，需要去更新视图
- didChangeDependencies：依赖值发生改变，比如 vue 的全局状态改变，如果组件依赖了全局状态，那么也需要去更新视图
- didUpdateWidget：比如父 Widget 状态发生改变，会触发子组件的这个方法，还有热更新也是系统会使用这个方法去更新视图。

一旦这三个方法被调用，Flutter 随后就会销毁老 Widget，并调用 build 方法重建 Widget。

## 销毁

组件被移除，或是页面销毁的时候，系统会调用 deactivate 和 dispose，来移除或销毁组件。相当于 vue 组件的 unmounte 过程，貌似vue组件卸载和销毁是一个周期内执行完，并提供beforeUnmount和unmounted钩子函数。

## 几种常见过程的生命周期过程

### 父 widget 状态变化

父 widget：setState -> build
子 widget: didUpdateWidget -> build

### Navigator.push

下一个 Widget：构建方法 -> (initState) -> didChangeDependencies -> build
当前 Widget: deactivate -> build

### Navigator.pop

上一个 Widget：deactivate(还是调用 deactivate，设计的有点奇怪) -> build
当前 Widget: deactivate -> dispose

# App 生命周期

除了 widget 的生命周期，app 也有生命周期，在 widget 中可以通过[WidgetsBindingObserver](https://api.flutter.dev/flutter/widgets/WidgetsBindingObserver-class.html)类来调用 App 的生命周期钩子：

```dart
abstract class WidgetsBindingObserver {
  // 页面 pop
  Future<bool> didPopRoute() => Future<bool>.value(false);
  // 页面 push
  Future<bool> didPushRoute(String route) => Future<bool>.value(false);
  // 系统窗口相关改变回调，如旋转
  void didChangeMetrics() { }
  // 文本缩放系数变化
  void didChangeTextScaleFactor() { }
  // 系统亮度变化
  void didChangePlatformBrightness() { }
  // 本地化语言变化
  void didChangeLocales(List<Locale> locale) { }
  //App 生命周期变化
  void didChangeAppLifecycleState(AppLifecycleState state) { }
  // 内存警告回调
  void didHaveMemoryPressure() { }
  //Accessibility 相关特性回调
  void didChangeAccessibilityFeatures() {}
}
```

## 生命周期回调

didChangeAppLifecycleState 回调函数中，有一个参数类型为 AppLifecycleState 的枚举类，这个枚举类是 Flutter 对 App 生命周期状态的封装。它的常用状态包括 resumed、inactive、paused 这三个。

- resumed：可见的，并能响应用户的输入。
- inactive：处在不活动状态，无法处理用户响应。
- paused：不可见并不能响应用户的输入，但是在后台继续活动中。

```dart
class _MyHomePageState extends State<MyHomePage>  with WidgetsBindingObserver{
  @override
  @mustCallSuper
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);// 注册监听器
  }
  @override
  @mustCallSuper
  void dispose(){
    super.dispose();
    WidgetsBinding.instance.removeObserver(this);// 移除监听器
  }
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    print("$state");
    if (state == AppLifecycleState.resumed) {
      //do sth
    }
  }
}
```

以上就是 flutter 的基本知识了，如果会 vue 的话入手 flutter 也是简简单单
