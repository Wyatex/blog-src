---
title: 安卓开发之Jetpack：ViewModel
date: 2021-06-01 18:13:57
tags:
- 安卓
- Jetpack
- 学习笔记
categories: 安卓
---

ViewModel的诞生
* 瞬态数据丢失（比如屏幕旋转）
* 异步调用的内存泄漏
* 类膨胀提高维护难度和测试难度

ViewModel负责把Model中的数据提供给View

<!-- more -->

# 代码演示
先编写一个简单的演示
MyViewModel.java:
```java
package com.example.viewmodel;

import androidx.lifecycle.ViewModel;

public class MyViewModel extends ViewModel {
    public int number;
}

```

布局xml，一个textview显示数量，一个button用来加一：
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        android:textSize="34sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        android:id="@+id/button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:onClick="plusNumber"
        android:text="+1s"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/textView" />

</androidx.constraintlayout.widget.ConstraintLayout>
```
入口java：
```java
package com.example.viewmodel;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {
    private TextView textView;
    private MyViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        textView = findViewById(R.id.textView);
        viewModel = new ViewModelProvider(this, new ViewModelProvider.AndroidViewModelFactory(getApplication())).get(MyViewModel.class);
        textView.setText(String.valueOf(viewModel.number));
    }

    public void plusNumber(View view) {
        textView.setText(String.valueOf(++viewModel.number));
    }
}
```

# 生命周期特性
ViewModel独立于配置变化，生命周期与activity生命周期无关

> 注意：不要向ViewModel中传入Context，会导致内存泄漏。如果要使用Context，请使用AndroidViewModel中的Application

比如上面的MyViewModel.java:
```java
package com.example.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;

public class MyViewModel extends AndroidViewModel {
    public int number;

    public MyViewModel(@NonNull @org.jetbrains.annotations.NotNull Application application) {
        super(application);
    }
}
```
