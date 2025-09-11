---
title: 我的Windows系统开发环境
date: 2024-11-22 10:41:09
tags:
- windows
categories: 开发
---

虽然说很多人喜欢MacBookPro来做开发，但是对于很多人来说MBP的价格可不便宜，而MBA我觉得又是个电子垃圾，那么Windows的选择也很不错。我现在用的鸡哥的14X，机子本身3200，64G内存条1200，机子本身自带24G的两根内存条，如果需要加内存可以咸鱼300-400左右出掉，然后整机基本4000出头（上一个本子是ThinkBook14p 13500h 32g因为内存不够用所以换了）

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/e60834a262934ad4b99455bfb1791a35~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=QR7ZM5tX%2BbyLrXoJrxhLxxGddvE%3D)

## 基础美化

首先是Win11的任务栏默认居中，我不太习惯，可以右键任务栏-任务栏设置-任务栏对齐，选择靠左

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/6f9741d4c24f4575b3ef6db325974b28~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=pIkg6gB%2BbylkfXgzZn6iW11umlI%3D)

然后是终端，终端推荐使用Terminal，然后安装oh-my-posh，主题我选择的是owl-night，字体是JetBrain Mono NF，记得字体需要下载NF字体，否则图标不能正常显示，当然Terminal还可以设置一些背景图片啥的，把二次元老婆/女神放上去也不错

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/9cb1b04087a74a9097c39bdf18642008~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=av3rwDin5A9ZWW5RFLImFJDaKyA%3D)

安装方法如没有魔法的话可以从Windows的应用商店下载安装：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/972d3a43659a40b59b72c0d899131b4b~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=itoh%2FX%2B8b9Zqxj7TQh%2FVehsv8rI%3D)

对于大部分开发者来说终端美化基本就够了，如果大家有什么好的建议可以评论区说一下。

## 基础开发环境

### 前端

因为我主要还是前端开发，所有这里重点说说前端我用到的一些软件，首先重中之重就是nvm-windows，下载地址是：<https://github.com/coreybutler/nvm-windows/releases>

然后我安装的时候会选择node下载到D盘，然后node的链接也是D盘：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/2917c5bade4c4cdaa463d57732b14515~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=KFh%2BEy0YGqb6y90nJmvITQZ4CmE%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/9149f6db209243ab87f0345d8b2358c7~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=hHGgF2IDqG1OqET3fhs86svnIw8%3D)

安装完成之后可以设置下淘宝源下载node和npm:

    nvm node_mirror https://npmmirror.com/mirrors/node/
    nvm npm_mirror https://npmmirror.com/mirrors/npm/

装完node之后可以安装一些常用工具：npkill、tsx、taze、nrm

然后开发软件我喜欢WebStorm，WS已经在10月份公布免费非商用了（可以不用破解了），因为我喜欢JB全家桶，如果你也喜欢的话推荐使用JetBrainsToolbox

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/897de15a0f48430a8b3c8bba1d4e5c3d~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=%2B%2BcfBJMgxOwttPHr5btZq%2Fv6Kqc%3D)

然后如果你的C盘比较少的话，推荐把全家桶安装在其他盘：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/39483ca00e3141d4b02389c48e0898fd~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=p9r4uez7XwwSIMMSG0s1BnM0srU%3D)

## Java、Go等开发

对于这些我的推荐都是使用JB全家桶，因为他们都自带了对应的开发环境配置功能：

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/448d953792fa49758d1ccde99d1cb33c~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=OTFzA5M8ZNO81ch3WO8MnNdYNaA%3D)

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/7032b1565960475aa0f32d518a263819~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=0ZikdhR91%2BolMIR8I0ngeXtWaSs%3D)

对应的java、go版本都可以直接在IDE里面去下载使用，不用自己跑到网上下载安装，而且这样安装我感觉是非常绿色的，洁癖狂喜！

对于rust开发的话可以用rustup安装，编译后端推荐使用msvc生成工具而不是VS：

<https://visualstudio.microsoft.com/zh-hans/downloads/>

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/ba6b7e5e73574f85bce5b97447a883eb~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=FuSoDDacxDswemGAS0ZtRaAxdRk%3D)

## 其他的一些常用开发软件

ssh软件可以选择Xshell，自从6以后Xshell已经可以免费使用了，只需要邮箱校验一下就能一直用了。

全盘搜索我推荐Everything，如果你用Everything比较多的话可以安装个Everything Toolbar，将Toolbar加到任务栏会更加方便。

如果本地需要跑nginx、mysql、redis这些我常用的是小皮面板，安装方便只需要一个软件就给你把所有基础中间件跑起来，如果是新手的话强烈推荐！

![image.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/efbd7ecf18a54afabebd29282ea98896~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5qGc5ZC56Zuq:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMTE3OTA5MTkwMTA5ODI2OSJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1758205919&x-orig-sign=bOTc7K0qZfittfj0HK9dRr%2F2oMM%3D)

虚拟机我更喜欢的是Vmware Workstation Pro而不是WSL/Hyper-V，这个软件也是从17开始就可以免费用了，不需要输入注册码了，然后Linux我可能比较喜欢Ubuntu、Deepin、Fedora这些开箱即用的。

Api调试、Api文档管理、Api自动化测试/压测：Apifox

## 其他的一些日常软件

办公三件套软件我推荐MS office，因为我对WPS的印象是很多东西需要收费而且有广告而且界面不好看所有推荐MS office，可以使用Office Plus Tools安装:<https://otp.landian.vip/zh-cn/>

解压缩软件推荐：7-Zip、Bindizip6.25版本（新版本有广告）

视频播放器：PotPlayer，官网：<https://potplayer.daum.net/?lang=zh_CN>

图片预览：HoneyView，官网：<https://www.bandisoft.com/honeyview/>

各种各样的工具集合：uTools
