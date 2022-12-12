---
title: flutter的一些坑（1）
date: 2022-11-22 10:45:32
categories: Flutter
tags:
  - Flutter
  - 前端
  - 笔记
---

# 过早调用 context 报错

在 initState 里像下面这样使用 context：

```dart
@override
void initState() {
    super.initState();
    final args = ModalRoute.of(context)?.settings.arguments;
    // 使用args...
}
```

可能会导致下面报错：

```
dependOnInheritedWidgetOfExactType<_LocalizationsScope>() or dependOnInheritedElement() was called before XxxXxx.initState() completed.
```

因为 context 在 initState 调用过程中只是创建了，但是属于不可用状态，需要在 initState 执行完成之后才能正常使用，所以需要延后context的使用时间，如果只需要调用一次的话应该使用Future.delayed或者addPostFrameCallback进行调用
```dart
@override
void initState() {
    super.initState();
    Future.delayed(Duration.zero, () {
        // 这时候context已经可用
        final args = ModalRoute.of(context)?.settings.arguments;
        // ...
    });
    // 又或者这样---------------
    WidgetsBinding.instance.addPostFrameCallback((_) {
        final args = ModalRoute.of(context)?.settings.arguments;
        // ...
    });
}
```
# onGenerateRoute和routes冲突
如果在`MaterialApp`传入routes，那么`onGenerateRoute`将不会被调用