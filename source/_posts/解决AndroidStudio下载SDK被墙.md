---
title: 解决AndroidStudio下载SDK被墙
date: 2022-03-05 16:00:24
categories: 教程
tags:
  - 教程
---

众所周知，谷歌的国内服务经常被墙，有时候会导致 android studio 里无法正常下载 sdk，这里简单讲解一下原因和解决方法

# 原因

因为 as 里下载 sdk 是直接访问 dl.google.com 这个域名的，而国内的有些运行商可能会直接屏蔽了这个域名的 DNS 解析，导致没办法正确解析出 IP。

# 解决办法

解决办法很简单，就是通过 [http://ping.chinaz.com/](http://ping.chinaz.com/) 该检测网站对进行域名 dl.google.com 进行解析，找出能用国内 IP。

只需要打开这个网页，将 dl.google.com 复制进去点击 Ping 检测，就能拿到很多国内的谷歌服务 IP，比如我拿到一个： 180.163.151.161 ，然后打开命令行工具使用`ping 180.163.151.161` 进行检测，如果能正常 ping 通就说明该 ip 可以使用

接下来就是使用这个 ip 了，windows 用户打开：`C:\Windows\System32\drivers\etc` 文件夹，可以看到 hosts 文件，使用记事本之类的工具打开进行编辑，添加上一行：`180.163.151.161 dl.google.com` 然后保存。这时候只需要再`ping dl.google.com`就能发现这时候是直接 ping 180.163.151.161 这个 ip，不在需要 DNS 解析。

然后重新打开你点 as 就能发现可以正常下载 sdk 了。
