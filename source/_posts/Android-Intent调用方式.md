---
title: Android Intent调用方式
date: 2020-12-21 13:21:55
tags:
- 安卓
- 学习笔记
categories: 安卓
---
记录一下Intent的显式调用和隐式调用方法

<!-- more -->

> 假设现在有两个Activity，对应的java文件是MainActivity和SecondActivity

# 显式调用
## 通过class跳转
```java
Intent intent = new Intent(this, SecondActivity.class);
this.startActivity(intent);
```

## 通过包名.类名跳转
假设包名是 `com.example`
```java
Intent intent = new Intent();
intent.setClassName(this, "com.example.SecondActivity");
startActivity(intent);
```

## 通过ComponentName跳转
```java
Intent intent = new Intent();
ComponentName componentName = new ComponentName(this, SecondActivity.class);
intent.setCpmponent(componentName);
startActivity(intent);
```

# 隐式调用
首先要在 `AndroidManifest.xml` 文件中修改第二个activity的参数
```xml
<activity android:name=".SecondActivity">
    <intent-filter>
        <action android:name="android.intent.action.nextActivity" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>
```
然后在java文件里
```java
Intent intent = new Intent();
intent.setAction("android.intent.action.nextActivity");
startActivity(intent);
```
当然之间在创建对象时直接传进构建函数也是可以的
```java
Intent intent = new Intent("android.intent.action.nextActivity");
startActivity(intent);
```

