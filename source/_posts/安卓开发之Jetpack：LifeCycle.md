---
title: 安卓开发之Jetpack：LifeCycle
date: 2021-05-31 20:15:38
tags:
- 安卓
- Jetpack
- 学习笔记
categories: 安卓
---

使用LifeCycle的好处
* 帮助开发者建立可感知生命周期的组件
* 组件在其内部管理自己的生命周期，降低模块耦合度
* 降低内存泄漏发生的可能性
* Activity、Fragment、Service、Application均有LifeCycle支持

<!-- more -->

# 解耦页面和组件
这里使用Chronometer组件进行演示。
创建一个自己的MyChronometer类：
```java
public class MyChronometer extends Chronometer implements LifecycleObserver {
    private long time;

    public MyChronometer(Context context, AttributeSet attributeSet) {
        super(context, attributeSet);
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    private void startMeter() {
        setBase(SystemClock.elapsedRealtime() - time);
        start();
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    private void stopMeter() {
        time = SystemClock.elapsedRealtime() - getBase();
        stop();
    }
}
```
在布局界面使用这个组件
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <com.example.lifecycle.MyChronometer
        android:id="@+id/chronometer"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        android:textSize="34sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```
在activity启动时添加监听
```java
package com.example.lifecycle;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;

public class MainActivity extends AppCompatActivity {
    private MyChronometer myChronometer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        myChronometer = findViewById(R.id.chronometer);
        getLifecycle().addObserver(myChronometer);
    }
}
```
这样组件跟activity就已经解耦了，不再需要在activity里管理组件的生命周期

# 组件与Service解耦
创建一个定位Service：
MyLocationObserver.java:
```java
package com.example.lifecycle;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

public class MyLocationObserver  implements LifecycleObserver {
    private Context context;
    private LocationListener locationListener;
    private LocationManager locationManager;

    public MyLocationObserver(Context context) {
        this.context = context;
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    private void startGetLocation() {
        Log.d("lc", "startGetLocation");
        locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        locationListener = new MyLocationListener();
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 3000, 1, locationListener);
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    private void stopGetLocation() {
        Log.d("lc", "stopGetLocation");
        locationManager.removeUpdates(locationListener);
    }

    static class MyLocationListener implements LocationListener {
        @Override
        public void onLocationChanged(@NonNull Location location) {
            Log.d("lc", "location changed: " + location.toString());
        }
    }
}
```
MyLocationService.java:
```java
package com.example.lifecycle;

import android.util.Log;
import androidx.lifecycle.LifecycleService;

public class MyLocationService extends LifecycleService {
    public MyLocationService() {
        Log.d("lc", "MyLocationService: ");
        MyLocationObserver observer = new MyLocationObserver(this);
        getLifecycle().addObserver(observer);
    }
}
```

在activity里创建两个button：
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".two">

    <Button
        android:id="@+id/button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:fontFamily="monospace"
        android:onClick="startGps"
        android:text="开始"
        android:textSize="34sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        android:id="@+id/button2"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:fontFamily="monospace"
        android:onClick="stopGps"
        android:text="停止"
        android:textSize="34sp"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/button" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

然后在activity加上两个onCLick事件：
```java
package com.example.lifecycle;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

public class two extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_two);
    }

    public void stopGps(View view) {
        stopService(new Intent(this, MyLocationService.class));
    }

    public void startGps(View view) {
        startService(new Intent(this, MyLocationService.class));
    }
}
```

# 监听应用程序生命周期
创建一个ApplicationObserver.java:
```java
package com.example.lifecycle;

import android.util.Log;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleObserver;
import androidx.lifecycle.OnLifecycleEvent;

public class ApplicationObserver implements LifecycleObserver {

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    public void onCreate(){
        Log.d("lc", "onCreate: ");
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_START)
    public void onStart(){
        Log.d("lc", "onStart: ");
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    public void onResume(){
        Log.d("lc", "onResume: ");
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    public void onPause(){
        Log.d("lc", "onPause: ");
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    public void onStop(){
        Log.d("lc", "onStop: ");
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_DESTROY)
    public void onDestroy(){
        Log.d("lc", "onDestroy: ");
    }


}
```
然后创建一个MyApplication.java:
```java
package com.example.lifecycle;

import android.app.Application;
import androidx.lifecycle.ProcessLifecycleOwner;

public class MyApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        ProcessLifecycleOwner.get().getLifecycle().addObserver(new ApplicationObserver());
    }
}
```
在manifest里的application标签添加属性：`android:name=".MyApplication"`。
至此ApplicationObserver就会监听整个Application，而且Application与Activity无关，只要有一个activity是在运行，application就是onResume之后的状态，所有的activity都onPause那么application也就onPause。
