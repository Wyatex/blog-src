---
title: 'WebStorm2024.2解决vue语言服务器TypeError: server.watchFiles is not a function报错'
date: 2024-09-20 10:32:11
tags: 
 - WebStorm
 - Vue
categories: 前端
---

WebStorm更新到2024.2之后，自带的@vue/language-server也更新到了2.0.x，但是会提示报错无法使用，我的想法是更新到最新版本试试。

<!-- more -->

## 下载最新的language-server

切换node版本切换到20，18没试过不知道行不行，16的话会安装esbuild依赖失败

    git clone https://github.com/vuejs/language-tools.git
    cd language-tools
    pnpm install

## 在webstorm配置使用

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/bba3cd4bd57f4ffaa4b80c177ba343da~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1735785197&x-orig-sign=AAdqvTcSXbPLQiib7mUTIJBmD08%3D)

将目录指向@vue/language-server包，可以看到识别出最新的2.1.6版本，确认然后发现正常运行，成功解决问题！。
