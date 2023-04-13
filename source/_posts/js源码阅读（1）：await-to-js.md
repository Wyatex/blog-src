---
title: js源码阅读（1）：await-to-js
date: 2023-04-12 09:45:47
tags:
  - JavaScript
  - 前端
  - 学习笔记
categories: 前端
---

今天继续看若川大佬发起的 js 源码共读活动，这次来看一个小工具：`await-to-js`

<!-- more -->

# 源码简介

在 es7 中，我们能够使用 await 和 async 语法更方便的执行异步方法，但是有个缺点是如果 reject 了之后，需要 try catch 进行捕获，那有没有方法像 Go 语言一样，同时拿到数据和是否报错：

```go
data, err := db.Query("SELECT ...")
if err != nil { return err }
```

那么其实很简单的封装一下就能实现这种方式的错误处理。

## 用法
我们先看一下await-to-js的用法：
```js
import to from 'await-to-js';
// 如果你在node运行而且是commonJs模式运行，需要改成这样:
// const to = require('await-to-js').default;

async function asyncTaskWithCb(cb) {
     let err, user, savedTask, notification;

     [ err, user ] = await to(UserModel.findById(1));
     if(!user) return cb('No user found');

     [ err, savedTask ] = await to(TaskModel({userId: user.id, name: 'Demo Task'}));
     if(err) return cb('Error occurred while saving task');

    if(user.notificationsEnabled) {
       [ err ] = await to(NotificationService.sendNotification(user.id, 'Task Created'));
       if(err) return cb('Error while sending notification');
    }

    if(savedTask.assignedUser.id !== user.id) {
       [ err, notification ] = await to(NotificationService.sendNotification(savedTask.assignedUser.id, 'Task was created for you'));
       if(err) return cb('Error while sending notification');
    }

    cb(null, savedTask);
}

async function asyncFunctionWithThrow() {
  const [err, user] = await to(UserModel.findById(1));
  if (!user) throw new Error('User not found');
}
```

可以看到我们用解构的方法也能实现类似go的错误处理语法。

## 实现源码
源码不多，我们直接上全部的源码
```ts
/**
 * @param { Promise } promise
 * @param { Object= } errorExt - 向返回的err里注入额外的报错数据
 * @return { Promise }
 */
export function to<T, U = Error> (
  promise: Promise<T>,
  errorExt?: object
): Promise<[U, undefined] | [null, T]> {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, undefined]>((err: U) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt);
        return [parsedError, undefined];
      }
      return [err, undefined];
    });
}
```
实际的代码就15行左右，如果对ts不了解的，可以先看去掉类型的js代码：
```js
function to(promise, errorExt) {
  return promise
    .then((data) => [null, data])
    .catch((err) => {
      if (errorExt) {
        const parsedError = Object.assign({}, err, errorExt);
        return [parsedError, undefined];
      }
      return [err, undefined];
    });
}
```

实际主要代码就是第三行的then，将原来的promise的resolve数据封装成一个数组，并且用null代表没有错误。

然后就是第4行开始的catch，通过判断是否有传入额外的报错信息，如果有就将promise的reject数据和传入的额外信息进行合并，然后将错误信息也封装成一个数组进行返回，用undefined代表没有数据。

