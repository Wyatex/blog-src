---
title: 安卓开发之Jetpack：DataBinding
date: 2021-06-02 12:16:42
tags:
- 安卓
- Jetpack
- 学习笔记
categories: 安卓
---
本节内容可能非常多，请耐心看完。

<!-- more -->

# 简单案例
先在build.gradle导入DataBinding
```gradle
android {
    ...
    defaultConfig {
        ...
        dataBinding {
            enable true
        }
    }
}
```
创建一个Idol类
```java
package com.example.databinding;

public class Idol {
    public Idol(String name, String star) {
        this.name = name;
        this.star = star;
    }

    public String name;
    public String star;
}
```

在布局文件加入一个ImageView和两个TextView，然后光标移到文件开头，alt+enter，转成DataBinding布局，并在data里加入变量：
```xml
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools">

    <data>
        <variable
            name="idol"
            type="com.example.databinding.Idol" />
    </data>

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        tools:context=".MainActivity">

        <ImageView
            android:id="@+id/imageView"
            android:layout_width="300dip"
            android:layout_height="300dip"
            android:src="@mipmap/ic_launcher"
            app:layout_constraintBottom_toTopOf="@+id/guideline2"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintHorizontal_bias="0.495"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintVertical_bias="0.803"
            tools:srcCompat="@tools:sample/avatars" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.5" />

        <TextView
            android:id="@+id/textView1"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="48dp"
            android:text="@{idol.name}"
            android:textSize="24sp"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="@+id/guideline2"
            tools:text="姓名" />

        <TextView
            android:id="@+id/textView2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="48dp"
            android:text="@{idol.star}"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@+id/textView1"
            tools:text="姓名" />

    </androidx.constraintlayout.widget.ConstraintLayout>
</layout>
```
最后在activity的java文件里改成databingding模式：
```java
package com.example.databinding;

import androidx.appcompat.app.AppCompatActivity;
import androidx.databinding.DataBindingUtil;
import android.os.Bundle;
import com.example.databinding.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ActivityMainBinding activityMainBinding = DataBindingUtil.setContentView(this, R.layout.activity_main);
        Idol idol = new Idol("斋藤飞鸟", "五星");
        activityMainBinding.setIdol(idol);
    }
}
```

# import标签与事件绑定
现在需要把Idol的star从String转成int，通过传入一个数字然后界面显示x星
先创建一个转换方法，StarUtil.java
```java
package com.example.databinding;

public class StarUtil {
    public static String getStar(int star) {
        switch (star) {
            case 1:
                return "一星";
            case 2:
                return "二星";
            case 3:
                return "三星";
            case 4:
                return "四星";
            case 5:
                return "五星";
        }
        return "";
    }
}
```
然后在布局文件的variable里加入import标签，然后在TextView里直接使用这个类的方法：
```xml
<data>
    <variable
        name="idol"
        type="com.example.databinding.Idol" />
    <import type="com.example.databinding.StarUtil" />
</data>
...
<TextView
    android:id="@+id/textView2"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="48dp"
    android:text="@{StarUtil.getStar(idol.star)}"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/textView1"
    tools:text="姓名" />
```

# 事件绑定
在界面上添加一个按钮：
创建一个EventHandleListener.java:
```java
package com.example.databinding;

import android.content.Context;
import android.view.View;
import android.widget.Toast;

public class EventHandleListener {
    private Context context;

    public EventHandleListener(Context context) {
        this.context = context;
    }

    public void buttonOnClick(View view) {
        Toast.makeText(context, "喜欢成功", Toast.LENGTH_SHORT).show();
    }
}

```
然后在布局文件引入，并且设置button的onClick：


```xml
<data>
    <variable
        name="idol"
        type="com.example.databinding.Idol" />
    <variable
        name="eventHandle"
        type="com.example.databinding.EventHandleListener" />
    <import type="com.example.databinding.StarUtil" />
</data>
...
<Button
    android:id="@+id/button"
    android:layout_width="wrap_content"
    android:layout_height="0dp"
    android:layout_marginBottom="48dp"
    android:text="喜欢"
    android:onClick="@{eventHandle.buttonOnClick}"
    app:layout_constraintBottom_toBottomOf="parent"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintHorizontal_bias="0.498"
    app:layout_constraintStart_toStartOf="parent" />
```
在MainActivity创建并传入
```java
...
activityMainBinding.setEventHandle(new EventHandleListener(this));
```

# 二级页面的绑定
创建一个二级页面sub.xml，同样转成databinding:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools">

    <data>
        <variable
            name="idol"
            type="com.example.databinding2.Idol" />
        <import type="com.example.databinding2.StarUtil" />
    </data>

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:paddingBottom="16dp">


        <TextView
            android:id="@+id/textView1"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="48dp"
            android:textSize="34sp"
            tools:text="姓名"
            android:text="@{idol.name}"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="parent" />

        <TextView
            android:id="@+id/textView2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="48dp"
            tools:text="五星"
            android:text="@{StarUtil.getStar(idol.star)}"
            android:textSize="20sp"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@+id/textView1" />
    </androidx.constraintlayout.widget.ConstraintLayout>
</layout>
```
然后在主界面引入这个布局，并用app:xxx="xxx"传进去：
```xml
<include
    layout="@layout/sub"
    android:layout_width="0dp"
    android:layout_height="wrap_content"
    app:idol="@{idol}"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toTopOf="@+id/guideline2" />
```
这样子界面就能接收到传进来的对象，java代码不需要动
