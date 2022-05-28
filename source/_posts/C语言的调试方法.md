---
title: C语言的调试方法
date: 2020-05-21 17:46:22
tags: 
- 教程
- C语言
categories: C语言
copyright: true
---

为了让新手更好的学习C语言，这里手把手教你如何调试你的代码

<!-- more -->

# 当我们不会用调试但是怎么知道程序怎么运行
当我入门学习写c语言时不会调试就每一步加个输出，就知道代码运行到哪了，比如：
```c
for(int n = 0; n < 10; n++){
    do sth...
    printf("第 %d 次执行、n", n)
}
```
但是这样缺点也很明显，你需要在你的代码加入大量的垃圾代码，交作业时也要全部删除，非常麻烦。

# Clion调试
CLion是Jetbrains公司旗下的一款专为开发C/C++所设计的跨平台IDE，可以说是开发C语言的神器。安装方法也很简单，破解可以看[这篇文章](/干货/Jetbrains-crack/)。

这个IDE需要用到mingw编译器，配置方法可以看[这篇文章](/C语言/C-language-learn-2/)，找到安装GCC编译器的方法。

## 基本操作

第一次运行的时候注意配置好Toolchains，当然也可以在进入编辑界面之后配置，由于我已经配置好，所以上一张已经配置好的图片吧。
{% asset_img peizhi1.png 途中的Environment设置成mingw的路径就行了 %}
配置好之后我们新建一个工程：
{% asset_img newproj.png %}
{% asset_img newproj1.png %}
然后软件会自动生成一个输出helloworld语句，这时候我们给它打上短点然后点击右上方三角符号旁边的小甲虫开始调试：
{% asset_img debug1.png %}
就能看到已经开始调试了，而且程序停在了断点的位置：
{% asset_img debug2.png %}
可能你看到的框框和我的位置不太一样，你可以拖住框框拉到你想要的位置。上面的console就是用来输入输出的地方，frame就算函数的堆栈，variables可以看到这个函数里的变量的值。
在左下方的Debuger旁边，有几个按钮，比如蓝色箭头向下，红色箭头向下，蓝色箭头向上等等，你把鼠标放过去之后就能看到这几个按钮的名字，这里你只需要用到其中三个，分别是：
1. step into：逐步调试，遇到函数进入函数内部逐步调试
2. step over：也是逐步调试，但是遇到函数会直接执行完一个函数，直接得到结果
3. step out：当你进入一个函数时，按下这个按钮，会执行完这个函数的所有语句然后回到上一个函数。

这时候我们稍微改一下代码：
```C
#include <stdio.h>

void func1();

int main() {
    printf("Hello, World!\n");
    fflush(stdout);             // 使用fflush(stdout)是因为在debug情况下不清缓冲区是不会立刻输出上一句的内容
    func1();
    fflush(stdout);
    return 0;
}

void func1() {
    printf("This is a function!\n");
    int val = 1;
}
```
然后在第6行打上断点，进行调试，这时候就能发现代码已经来到`printf("Hello, World!\n");`这一行，但是这行还没执行，这时候我们使用step into进行逐步调试看看效果吧！
{% asset_img debug3.png %}
可以看到代码按照我们预计的步骤运行着，在Frames能看到堆栈的信息，Variables能看到堆栈（函数）内的变量信息。

> 除了`fflush(stdout);`可以让控制台及时输出之外，开可以在程序开头使用：`setbuf(stdout, 0);`，关掉缓冲区，这样每个字符都会及时打印出来

```C
#include <stdio.h>

void func1();

int main() {
    setbuf(stdout, 0);
    printf("Hello, World!\n");
    func1();
    return 0;
}

void func1() {
    printf("This is a function!\n");
    int val = 1;
}
```

## 进阶操作

此时如果我们想知道变量val的地址怎么办，没关系我们有watch，点击Variables下方的加号，添加上一个表达式：`&val`，按下回车就能得到我们的地址值了，反过来同理，当我们只有一个指针p，想知道指针指向的变量的值怎么办？那不就是加上取值符号星号：`*p`。
{% asset_img debug4.png %}
{% asset_img debug5.png %}

那么clion基本的调试方法就是这样啦，可以试试拿之前写好的代码来试试，有问题的时候就能快速定位到底是什么情况啦。
