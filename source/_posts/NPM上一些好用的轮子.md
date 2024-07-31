---
title: NPM上一些好用的轮子
date: 2023-05-22 09:58:53
tags:
- JavaScript
- NPM
categories: JavaScript
---

一些工具类：

- p-limit：promise 并发限制
- await-to-js：Async await包装器，便于错误处理
- delay：将setTimeout promise化
- yocto-queue： 简单的队列数据结构，（入队出队时间O(1)）
- mitt：简单实用的事件总线工具
- autofit.js：自适应屏幕大小
- class-transformer: 将object转成class
- class-validator: 简化验证的库

适合node：

- consola 日志、提示库
- chokidar：跨平台的文件监听库
- walkdir: 遍历文件夹
- fast-glob：轻量快速的遍历文件夹


一些cli工具：

- npkill：快速删除node_modules目录
- npm-check-updates：检查项目依赖更新（快捷命令ncu）
- nvm-windows：windows下的node版本管理工具（设置淘宝镜像下载更快：https://npmmirror.com/mirrors/node/）

## cli

- prompts：命令行提示工具，可以用来写交互式cli
- cac: 命令行参数提示、解析工具