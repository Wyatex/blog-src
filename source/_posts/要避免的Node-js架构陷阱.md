---
title: 要避免的Node.js架构陷阱
date: 2022-12-17 13:38:34
tags:
  + JavaScript
  + 翻译
categories: 翻译
---

原文：[Node.js Architecture Pitfalls to Avoid](https://blog.appsignal.com/2022/11/23/nodejs-architecture-pitfalls-to-avoid.html)

构建高可维护、可读和可靠的代码库不仅对后来维护你的代码的人很重要，而且也是为了您自己的心智负担。

我已经处理了数十个生产 Node.js 后端服务，并将分享我的经验，构建您的架构陷阱时应该避免什么。

本文中的示例是为 JavaScript 和 TypeScript 量身定制的，以及一些问题（如依赖管理）需要在 Node.js 项目比其他语言中应该更得到更多关注。但是，其中许多原则也适用于其他语言。

让我们开始吧！

<!-- more -->

## 为什么要担心 Node.js 架构？
当我开始我的第一份中级开发人员工作时，我已经离开了一家为每个项目都使用框架的公司。 并加入了一个在 Node.js 胡乱拼凑出每个后端服务的部门。

我想很多开发人员都经历过这种情况。初级程序员通常在已建立的代码库中工作，或者较小的项目，其大小和简单性使事情处于控制之中。

但有一天，你需要启动一个新项目，您在开始时做出的决定可能会影响您品牌未来几年的可靠性、收入和客户体验。项目早期经常有深思熟虑的编码和架构对开发体验的影响大于特定的库或框架。

## JavaScript 中的全局变量：你被警告是有原因的！
如果你曾经上过一门正式的计算机科学课程，你的教授可能会警告你避免使用全局变量，但可能没有解释原因。

全局变量是危险的，原因有几个。假设您导入了一个依赖于全局的函数，例如，从一个模块到另一个模块的变量。该全局变量对你的函数来说就像一个看不见的参数，作为调用方是不知道的或无法控制的。

更糟糕的是，如果一个程序改变了该全局变量，那么每次访问变量都需要考虑到该全局变量的状态和代码的执行顺序。我发现将变量传递给函数或类构造函数几乎总是比依赖全局变量更安全。

## 全局变量的问题：一个例子
参数比全局参数有更明确。函数的调用方将更好地理解数据在变量中的重要性，因为它就在具有非常相关的名称的方法签名中。 这里想象一个向系统管理员发出某些事件警报的函数：

```js
const adminEmail = "admin@example.com";
 
// 向管理员通知一个低优先级的问题
export function notifyAdmin(subject, message) {
  emailClient.send(
    { subject, message, recipient: adminEmail },
    (error, result) => {
      if (error) {
        return console.error(error);
      }
      console.log("Email sent successfully!");
    }
  );
}
 
// ...
 
// 严重错误，需要现在注意。通知负责人！
export function wakeOwnerUp(subject, message) {
  pagerClient.wakeUp(
    {
      user: adminEmail,
      priority: "high",
      respectQuietHours: false,
    },
    (error, result) => console.log({ error, result })
  );
}
```

不可否认，这是一个可笑的例子。任何调用notifyAdmin的代码都无法控制联系的对象。

当然，更改 `adminEmail` 的值和重新代码部署很容易，但由于该全局至少用于一个其他函数，因此此更改可能会产生级联影响。如果所有者和管理员不再是同一个人怎么办？我们不想在凌晨3点把老板叫醒，而这是一些可怜的开发者的工作。

此外，如果我们需要向多个地址发送电子邮件怎么办?我们不能简单地将adminEmail更改为数组并期望一切都能正常工作。

to be continued...