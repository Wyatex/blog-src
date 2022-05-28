---
title: git学习笔记（1）
date: 2020-02-17 18:01:09
categories: 学习笔记
tags: 
- 学习笔记
- Git
copyright: true
---

可能是比较详细的git笔记

<!-- more -->

# 第一步：安装和配置

## 安装
在Debian系上安装：
```
$ apt-get install libcurl4-gnutls-dev libexpat1-dev gettext libz-dev libssl-dev
$ apt-get install git
$ git --version
git version xxxxx
```

在红帽系上安装：
```
$ yum -y install curl-devel expat-devel gettext-devel openssl-devel zlib-devel

$ yum -y install git-core

$ git --version
git version xxxxx
```

## 配置

```
$ git config --global user.name "name"
$ git config --global user.email abc@abc.com
```

除了global还有local（针对某仓库）和system。

# 简单使用

## 仓库初始化和简单使用

使用 `git init` 初始化一个仓库，init后可以加一个目录可以自定在某个目录初始化。
使用 `git add` 对文件进行跟踪。
使用 `git commit` 进行提交。

例如：
```
$ git add *.c
$ git add README
$ git commit -m '第一次提交'
```

## git mv

如果想修改一个文件的名称，不需要 `git add` 和 `git rm` ，使用一个`git mv name rename` 就可以了，然后commit一次就完成更名操作。

## git clone
`git clone [url]`可以克隆某个网上的仓库
比如：
```
$ git clone https://github.com/someone/somelib
...

```
这样就会在当前目录下创建一个somelib目录，并在该目录下初始化一个.git文件夹,从远程仓库拉取下所有数据放入 .git 文件夹，然后从中读取最新版本的文件的拷贝。

当已经存在同名目录，可以在url后加一个不太的名字，就可以自定义本地仓库名字。

## git log

`git log` 能查看每一次提交的用户、邮箱地址、提交时间、提交说明。

`git log --oneline` 能查看简洁的列表

`git log -n 数字` 能查看最近的几个

--online 和 -n 可以合并使用

`git log --all` 可以查看所有分支的log，不使用--all只输出当前head指向的分支的log。

如果使用--all加-n就会在--all基础上限制只输出几个。

## git branch 
使用`git branch`可以查看本地所有分支，`git branch -av` 还可以查看分支最新的commit和提交说明

使用 `git branch -d/D [分支名]` 可以删除某个分支，当用-d无法删除时要用-D删除。

## git checkout
`git checkout [分支名]` 可以切换到某个分支 

`git checkout -b [分支名] [基于某个分支]`可以先基于某个分支创建一个新的分支并且切换到那个分支。

# .git目录内容

## HEAD
文件里的内容是：`ref: refs/heads/xxx`
说明现在的head指向的是哪一个分支

## config 
里面储存的是当前仓库的一些设置，如果通过上面的 `git config --local` 修改了这个仓库的的user.name和email，那么这个文件下会有`[user]`字段，当在这里修改了name或者email的值时，使用`git config --local --list`可以看出修改后的值。

反之亦然，使用 `git config --global user.name "xxx"` 后可以发现config里面的内容也修改了。

> ps. 使用 `git config --local user.name` 可以查看当前仓库的用户 

## refs目录

refs目录包括了heads和tags目录

### heads目录

这个目录存放的是仓库的分支，比如仓库初始化后默认只有一个master分支，那么这个heads目录下就有一个名为master文件。

而master里面是一个40位的哈希值（也是一个对象），我们可以使用`git cat-file -t xxx`查看他的类型：
比如我的某个仓库

```
$ cd .git/refs/heads

$ ls
master

$ cat master
59c56a87fcf4debcdcb794acad72b0613d838611

$ git cat-file -t 59c56
commit
```

通过这个操作可以看出这个master里的一串哈希值是一个commit，而且是当前分支最新的一个commit

### tags目录
存放的是所有

## objects
放的是各种对象，使用 `find .git/objects -type f` 可以查看各个文件。

```
$ find .git/objects -type f
.git/objects/4d/18ac21026a0e9fa0681ea72c3c1ac4a597bbea
.git/objects/59/c56a87fcf4debcdcb794acad72b0613d838611
.git/objects/6b/21cfcbab815ab0495b8a2d427ab97528ef56da


```

通过上面的cat-file命令进行查看：

```
$ git cat-file -t 4d18ac21026
tree

$ git cat-file -p 4d18ac21026
100644 blob e69de29bb2d1d6434b8b29ae775ad8c2e48c5391    readme.md
100644 blob f2ba8f84ab5c1bce84a7b441cb1959cfc7093b7f    test.txt

```

# commit对象的结构

{% asset_img commit.png commit结构图 %}

可以使用 `git cat-file -p` 可以查看各个对象的内容

比如上面objects里的那个test.txt：
```
$ git cat-file -p f2ba8f84
abc
```
可以直接查看文件（blob）的内容