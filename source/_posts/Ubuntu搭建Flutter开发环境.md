---
title: Ubuntu搭建Flutter开发环境
date: 2022-10-23 10:41:44
tags:
  - Flutter
  - 前端
categories: Flutter
---

公司业务需要开发一个 Flutter 应用，记录一下如何搭建一个 Ubuntu 的开发环境

<!-- more -->

# 序

首先我这里选择 Android Studio 作为开发 IDE，因为如果编译到安卓，使用 AS 能非常方便的配置 Android SDK，以及基于 intelliJ 强大的功能，能够非常方便的对代码进行重构。

# flutter
安装flutter的话可以使用snap，不过使用snap国内速度可能非常慢，需要魔法，下面推荐两个个人觉得好用的魔法（非广告）：
```
akkcloud点com  这个需要付费，节点多而且稳定
tls点com  这个不需要付费，需要签到领流量，开始送2g，也够安装所有的环境了
```

ubuntu配置好系统代理后：
```
sudo snap install flutter --classic
sudo nano ~/.bashrc
```
加入两行：
```
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```
然后运行：`flutter doctor`，让flutter初始化一次

# AS 安装配置

依然还是先配置好 DNS，找到一个能用的 dl.google.com 对应的 ip，然后修改 host 文件（如果拿不到国内能用的ip的话，只能使用魔法了，就不需要修改hosts）

```sh
sudo vim /etc/hosts

加入一行：203.208.39.225 dl.google.com
```

如果是不熟悉 vim 的可以使用 nano:

```sh
sudo vim /etc/hosts
```
加入一行后使用ctrl+o，回车保存，ctrl+x退出

接下来安装AS，打开后按照推荐安装Android SDK，建议选择custom，不安装android image，因为尽量使用真机进行调试会更方便，性能也更好。

> 如果不打算使用安卓机进行调试，也可以不选择AS，但是下面我会用安卓和linux桌面应用进行解说。

# 创建项目
先在as安装flutter插件、重启、创建flutter项目。

# linux
如果你的项目目录下没有linux文件夹，那么在项目目录执行：`flutter create --platforms=linux .`，这时候as就能选择linux运行了。我在ubuntu桌面应用上能够直接运行，应该不需要安装一些额外的编译工具，使用系统自带的编译工具就能直接构建运行。

# 配置安卓打包
修改项目下的android/build.gradle
```
buildscript {
    ext.kotlin_version = '1.6.10'
    repositories {
//        google()
//        mavenCentral()
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'https://maven.aliyun.com/nexus/content/groups/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    }

    dependencies {
        classpath 'com.android.tools.build:gradle:7.1.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
//        google()
//        mavenCentral()
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'https://maven.aliyun.com/nexus/content/groups/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    }
}
```
使用阿里云的maven仓库，这时候其实还不算行，可能会报错，还需要设置flutter下的gradle配置，打开home下的snap/flutter/common/flutter/packages/flutter_tools/flutter.gradle，同样修改buildscript：
```gradle
buildscript {
    repositories {
//        google()
//        mavenCentral()
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
    }
}
```

这时候打包可能还会报找不到BuildTool和CompileSdk

在AS上我下载的SDK版本是33，但是创建的项目使用31, 所以会报`Failed to find Platform SDK with path: platforms;android-XXX`，继续修改上面的flutter.gradle文件，在上面找到`compileSdkVersion`，改成你安装的sdk版本，比如我安装的SDK是33就改成33，如果你下载的版本和flutter.gradle配置的一样就不需要修改。

不一致的还可能包括`buildToolsVersion`，如果打包时报：`Failed to find Build Tools revision xxx`，需要看一下Android SDK下的Android SDK Build-Tools，我安装的是更高版本的33，所以会报错，修改项目目录/android/app/build.gradle，添加下面配置

```gradle
android {
    buildToolsVersion = "33"
    // ...
}
```

这样应该就能成功在安卓上面跑起来