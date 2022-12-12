---
title: ubuntu安装Python
date: 2022-12-12 11:04:25
tags:
  - Python
  - 学习笔记
categories: 笔记
---

记录一下安装 python 的两个安装方法

# apt 安装

1. 以 root 用户或具有 sudo 访问权限的用户身份运行以下命令，以更新软件包列表并安装必备组件：

```
sudo apt update
sudo apt install software-properties-common
```

2. 将 Deadsnakes PPA 添加到系统的来源列表中：

```
sudo add-apt-repository ppa:deadsnakes/ppa
```

3. 启用存储库后，请使用以下命令安装 Python 3.8：

```
sudo apt install python3.8
```

# 源码安装

1. 更新软件包列表并安装构建 Python 所需的软件包：

```
sudo apt update
sudo apt install build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev wget
```

2. 找个位置存放源码包

3.10

```
wget https://www.python.org/ftp/python/3.10.9/Python-3.10.9.tar.xz
sudo tar xvJf Python-3.10.9.tar.xz
cd Python-3.10.9
```

3.11

```
wget https://www.python.org/ftp/python/3.10.9/Python-3.11.1.tar.xz
sudo tar xvJf Python-3.11.1.tar.xz
cd Python-3.11.1
```

3. 开始生成 makefile 并且编译安装

```
./configure --enable-optimizations
make -j 2
sudo make install
```

--enable-optimizations 选项通过运行多个测试来优化 Python 二进制文件，这会使构建过程变慢。2 代表用两个线程进行 make。
