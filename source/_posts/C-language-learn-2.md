---
title: 简单易懂的C语言-2
date: 2019-01-30 11:29:08
tags: 
- 教程
- C语言
categories: C语言
copyright: true
---


# 安装环境

## 安装VScode
好的回到课程，这次我们来讲一下安装环境。

<!-- more -->

就像我们玩游戏，有时候想玩新的3A大作，但是下载回来后发现 “缺少XXX文件”，这就是因为没有装运行环境造成的（好像跑远了）。总之，这里就教一下如何安装VScode，打开[官网](https://code.visualstudio.com/),我知道你们懒得百度，直接点开左边的链接就是了。
{% asset_img vscode1.png 这就是官网了 %}

然后就是下载安装，安装就是同意啊，下一步啊这些，不存在难度吧。
{% asset_img vscode2.png 打开就是酱紫滴 %}

但是你会发现一个问题，为什么界面是英文的，不要慌！问题不大，就算你慌也没用，跟着我操作就能设置成中文。

请看下面这张图——>

{% asset_img 中文.png 装汉化 %}

点击第一个右下角的安装，然后重启VScode（也就是关闭后再打开），然后你的中文界面就出来了。

最后一个步骤，安装C/C++的插件，步骤如下
{% asset_img vscode3.png 安装插件 %}
安装之后重新加载就能用了。

## 安装GCC编译器
由于GCC原本是Linux系统的软件，这里我们需要用到Windows版本的GCC——MinGW，这里我就帮你们找到最新版，[微云](https://share.weiyun.com/5KGXixT)
如果你的电脑是32位就下载i686开头的文件，64位就下载x86_64开头的文件（如果不懂的话可以百度一下：怎么知道电脑是32位还是64位，我知道有些人会懒得查，那就下载32位的吧）
下载之后就需要解压，找一个你喜欢的位置（也就是哪里都行，比如D盘根目录），比如我的是64位，解压到E盘，位置就是 E:\mingw64 ，记住这个位置，就可以开始配置环境变量。
课外知识：
[环境变量](https://www.baidu.com/s?wd=环境变量)

如果你的电脑是win10就好办了，打开搜索：
{% asset_img 搜索.png  %}
或者这样
{% asset_img 搜索1.png  %}

然后开始安装图片操作吧
{% asset_img 环境变量1.png  %}
{% asset_img 环境变量2.png  %}
{% asset_img 环境变量3.png  %}
{% asset_img 环境变量4.png  %}

最后确定

[Win7环境变量设置](https://jingyan.baidu.com/article/b24f6c82cba6dc86bfe5da9f.html)
XP也是差不多的

到这里我们打开cmd（WIN键+R，输入cmd，确认打开），输入
`gcc -v`
显示下面信息就说明全部完成了
{% asset_img 环境变量5.png  %}

# 第一个程序

## helloworld
输出一句hello world是学习每一门语言都会做的一步，那跟着我来写出你的第一个程序吧！
* 当你上面的步骤都做完之后，重启VScode
{% asset_img vscode4.png ，点击文件——打开文件夹 %}
* 找一个你喜欢的位置，新建一个文件夹，写上你喜欢的名字，比如找到D盘——新建一个文件夹——沙雕游戏
{% asset_img 新建文件夹.png  %}
* 然后新建一个文件，沙雕程序.c
{% asset_img 新建文件.png  %}
* 复制这段代码到右边窗口
```C
#include<stdio.h>

int main()
{
	printf("HelloWorld!");		//打印HelloWorld
	return 0;
}
```
* 然后保存（上面说过了 快捷键是 Ctrl + S）
最后就是运行了，这里其实不需要向之前一样打开cmd，有一个很快捷的方法就是：
找到 终端 —— 新建终端，输入`gcc 沙雕程序.c`进行编译，得出一个a.exe文件，直接输入a.exe打开这个程序，终端就会打印出HelloWorld！
{% asset_img 新建终端.png  %}

好了你写的第一个沙雕程序就完成了（此处应有掌声）

> ***获得成就***
获得开发环境：掌握如何搭建一个开发环境
