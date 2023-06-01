---
title: 优雅的干掉不应该使用的if-else（JS版）
date: 2023-05-24 10:58:22
tags:
  - JavaScript
categories: JavaScript
---

> 这里说的是不应该使用 if-else 的地方尽量不去写 if，而不是去掉所有的 if-else

## 不必要的 else 块

```js
function func(arg) {
  if (arg) {
    // do something
  } else {
    // do something
  }
}
// 这里的else明显可以去掉
function func(arg) {
  if (arg) {
    // do something
  }
  // do something
}
```

## 价值分配

有些时候不需要生命个变量，然后再赋值返回

```js
function func(arg) {
  let gender;
  if (arg === 0) {
    gender = "woman";
  } else if (arg === 1) {
    gender = "man";
  } else {
    gender = "unknown";
  }
}
// 为什么需要多写一个gender呢
function func(arg) {
  if (arg === 0) return "woman";
  if (arg === 1) return "man";
  throw new Error("非法参数");
}
```

## 简单值多个条件，转成对象形式

```js
function func(arg) {
  if (arg === "xxx") {
    // do something
  } else if (arg === "yyy") {
    // do something
  } else {
    throw new Error("非法参数");
  }
}
// 不好修改，而且代码很丑
function func(arg) {
  const actions = {
    xxx: () => {
      /* do something */
    },
    yyy: () => {
      /* do something */
    },
    // 以后要加什么这里直接在这里加
  };
  if (actions["xxx"]) {
    actions["xxx"]();
  } else {
    throw new Error("非法参数");
  }
}
```

## 复杂条件，改用策略模式

```js
function func(arg1, arg2, arg3) {
  if ((arg1 === "xxx" && arg2 === "yyy") || arg3 === "zzz") {
    // do something
  } else if (arg1 === "xxx" || (arg2 === "yyy" && arg3 === "zzz")) {
    // do something
  } else {
    throw new Error("非法参数");
  }
}
```

如果是这种复杂的条件，对象的形式就实现不了了，这没有办法了吗？

其实有个设计模式叫策略模式，先上个策略模式的代码：

```ts
// js版：
function exeStrategyActions(actions) {
  actions.some(([flag, action]) => {
    if (flag) {
      action();
    }
    return flag;
  });
}
// ts版：
type StrategyAction = [boolean, () => void];
function exeStrategyActions(actions: StrategyAction[]) {
  actions.some((item) => {
    const [flag, action] = item;
    if (flag) {
      action();
    }
    return flag;
  });
}
```

用法也很简单，比如上面的 if 示例：

```js
function func(arg1, arg2, arg3) {
  exeStrategyActions([
    [
      (arg1 === "xxx" && arg2 === "yyy") || arg3 === "zzz",
      () => {
        /* do something */
      },
    ],
    [
      arg1 === "xxx" || (arg2 === "yyy" && arg3 === "zzz"),
      () => {
        /* do something */
      },
    ],
    [
      true,
      () => {
        throw new Error("非法参数");
      },
    ],
  ]);
}
```

exeStrategyActions 函数会一个一个寻找条件是 true 的值，直到找到 true，然后执行传进去的回调函数，
