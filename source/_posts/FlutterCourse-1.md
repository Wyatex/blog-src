---
title: 面向Vue开发者的Flutter教程（1）
date: 2023-10-28 23:35:18
tags:
categories: Flutter
tags:
  - Flutter
  - 前端
  - 笔记
---

虽说这是第一篇，但还是建议先看看前置教程：

[flutter快速入门笔记（1）](/Flutter/flutterNote1/) 和 [环境搭建教程](https://book.flutterchina.club/chapter1/install_flutter.html)

上面提到的环境搭建教程基于安卓和iOS用户来讲解，但是既然看到咱们这个标题点进来的应该大部分掘友都是网页前端开发，那么咱们后续的讲解都以**Web**的方式来运行Flutter项目啦，所以请各位掘友准备好一个比较新的**Chrome浏览器**哦，当然对于Windows10或者Windows11的开发者来说，系统自带有新版Edge也可以不需要安装Chrome。

当然如果是客户端开发的掘友也可以选择自己熟悉的客户端，比如安卓、iOS甚至是Windows、Linux、Mac OS客户端来运行，这些都是支持的，而且不涉及和系统之间的调用的话，所有方式的开发都是能保持一致的，这就是Flutter这个大前端框架的强大能力哦！

## 从官方Demo跑起来吧

从这里开始就默认大家已经搭建好开发环境，也就是安装好Android Studio（加上Flutter插件）、Flutter工具链。

那么开始新建项目吧！The World！establish！

New Flutter Project => 选择Flutter => 选择Flutter安装目录 => 修改项目名称、调整项目目录 => Create!

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/682d7e48ce204e2a97f6cd1d21bf7a03~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=800&h=650&s=45191&e=png&b=3c3f41)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff053d2a123b4c6bb177f0af920e38bc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=800&h=618&s=48245&e=png&b=3e4143)

Nice！创建一个Flutter项目就这么简单，接下来就是，Flutter，启动！

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6637e3abf8754dc68aacaa649242f655~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1396&h=994&s=231390&e=png&b=2a2c2f)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7d119a9cfd6463a98b3a65068524492~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1920&h=1031&s=346310&e=png&b=2a2c2f)

不出意外的话，咱们的Flutter项目就跑起来辣！是不是很简单捏。

## Demo代码解析

那么先来看看main.dart里面都有些啥吧！

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // 项目根组件
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}
```

和我们的Vue项目不一样，在Vue项目里的main.js代码会从头到尾执行，比如导入我们的Vue、导入根组件、导入一些资源、执行createApp()构建SPA应用。

在dart里面，程序的入口只有main函数，这一点和C语言很像。这这里面的runApp你就可以理解成咱们Vue项目的createApp啦。

Vue的createApp需要我们传入一个根组件，Flutter也一样，需要传入咱们的的根组件，在这里MyAPP就是咱们的根组件了。MyApp是一个类，那么我们就需要new一个，在Dart中new是可以省略的，那么`MyApp()`其实就是`new MyApp()`的缩写，而前面的const表明咱们new出来的这个实例是一个常量，不允许修改值。

咱们的前置教程讲到，Flutter的组件有两种一种是可变另一种是不可变组件，那么这里的MyApp继承了`StatelessWidget`，说明他是一个不可变组件，咱们需要定义它的build方法，返回这个组件的界面构建方法。从Vue来理解就类似：

```js
// app.vue
<template>
    <MaterialApp :theme="theme">
        <MyHomePage :title="Flutter Demo Home Page" />
    </MaterialApp>
</template>
<script>
import {MaterialApp, ThemeData, Colors} from 'flutter'
import MyHomePage from './MyHomePage.vue'
export default {
    components: {
      MaterialApp,
      MyHomePage
    }
    data() {
     return {
       theme: ThemeData({primarySwatch: Colors.blue,})
     }
    }
}
</script>
```

是不是一下子就理解了，十分甚至九分眼熟有没有。

假如你用过NaiveUI、Vant或者Element-Plus这种组件库，那么你应该见过xxx-config-provider，这个组件，这里的MaterialApp其实是同样的东西，可以用来配置你整个应用的样式、模式、翻译等等。

那么让我们目光继续往下看：

```dart
class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'You have pushed the button this many times:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ), 
    );
  }
}
```

这里我们继续用Vue的伪代码方式来写一下：

```js
<template>
  <Scaffold>
    <AppBar #appbar :title="title" />
    <Center>
      <Column :mainAxisAlignment="MainAxisAlignment.center">
        <p>You have pushed the button this many times:</p>
        <p style="headline4">{{ _counter }}</p>
      </Column>
    </Center>
    <FloatingActionButton #floatingActionButton @click="_incrementCounter" tooltip="Increment">
        <Icon icon="add" />
    </FloatingActionButton>
  </Scaffold>
</template>

<script>
import * as FlutterComponent from "flutter/material";
export default {
  components: {
    ...FlutterComponent,
  },
  props: {
    title: {
      type: String,
      require: true,
    },
  },
  data() {
    return {
      _counter: 0,
    };
  },
  methods: {
    _incrementCounter() {
      this._counter++;
    },
  },
};
</script>
```

欸是不是一下子就懂了！有些小伙伴可能会问，flutter是两个类啊怎么还是一个组件？确实是这样没错，我们需要将`StatefulWidget`和`State`合起来一起看，我们需要在`StatefulWidget`的类的`createState`方法里返回我们的`State`实例。至于为什么，在上一章也有提到，如果看不懂咱们可以先按下不表，先死记硬背一下，后面再详细介绍，当然有求知欲的小伙伴也可以自己寻找答案，那对你来说会更好。

Flutter中有个一行代码是setState，他只有一个作用，那就是告诉flutter框架：我要修改状态啦，你需要给我更新界面！你可以尝试去掉那层setState，再点击按钮看看会有什么反应。

小伙伴可能还对Center、Column这些组件有疑惑，这里简单的说一下，这些是布局组件，比如Center可以将元素居中，类似css的flex水平垂直居中，Column相当于flex的flex-direction设置成column。

如此一来相信你也能很清晰的理解官方demo代码的逻辑了。下面不如来布置个作业吧！

1. 将标题改成：我的第一个Flutter项目！
2. 点击加号按钮，数值+2
3. `_counter`最大值只能加到10，继续按加号没有反应
4. 加多一个按钮，按一下数值-2，最小值减到-10

加油！
