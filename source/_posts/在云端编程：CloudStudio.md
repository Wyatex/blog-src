---
title: 在云端编程(1)：CloudStudio
date: 2020-10-17 18:44:57
tags:
  - 教程
  - C语言
categories: 教程
---

> 因为操作系统课程实验需要用到 Linux 系统，但是很多小伙伴不会装 Linux 系统，那有没有不用装系统和一些奇奇怪怪的软件的方法呢？还真有，用云端编程软件就可以

<!-- more -->

你需要准备的东西：

- 一台能上网的电脑（手机也可以）
- 一个浏览器
- 一个脑子

好了，我们废话不多说直接进入教程。

# 注册账号

打开[CloudStudio 官网](https://cloudstudio.net/)，点击右上方的注册。都 0202 年了大家不会连账号注册都不会吧。

# 进入 CloudStudio 页面

登录之后点击侧边栏的 CloudStudio
{% asset_img 2.png %}
点击新建 Bate 版，工作空间名称随便写写，代码来源选空
{% asset_img 3.png %}
{% asset_img 4.png %}
然后就能进入编程界面了

# 安装编译环境

在顶部菜单栏-终端-新建终端
{% asset_img 5.png %}
在下面终端输入：`apt-get update`，
然后输入：`apt install build-essential -y`
{% asset_img 7.png %}
最后输入：`gcc --version`检查是否安装成功
{% asset_img 8.png %}

# 开始写代码

在左边侧边栏右键，新建文件，回车确认
{% asset_img 9.png %}
然后我们在右边代码编辑区域随便写写：

```c
#include<stdio.h>
#include<unistd.h>
int main() {
    int p1, p2;
    while ((p1 = fork()) == -1);
    if (p1 == 0) {
        while ((p2 = fork()) == -1);
        if (p2 == 0) {
            putchar('b');
        }
        else {
            putchar('c');
        }
    } else {
        putchar('a');
    }
    return 0;
}
```

到此为止你的代码就写好了

# 编译运行

这时候我们开始编译，比如我的源码文件是 a.c 那么我们使用`gcc a.c`，就可以编译出一个 a.out 的可执行文件，当然你也可以加个参数，控制生成的可执行文件的名称，比如：`gcc a.c -o a`就可以编译成一个叫 a 的可执行文件

接下来输入：`./a`，就可以执行 a 文件
{% asset_img 10.png %}
