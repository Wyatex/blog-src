---
title: 安卓开发之Jetpack：MVVM
date: 2021-06-05 09:50:45
tags:
- 安卓
- Jetpack
- 学习笔记
categories: 安卓
---

这章讲解如何将DataBinding、ViewModel、LiveData一起使用

<!-- more -->

# 篮球比赛计分板
先创建一个ViewModel，然后加入需要的数据和方法。
```java DataViewModel.java
package com.example.mvvm;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class MyViewModel extends ViewModel {

    private MutableLiveData<Integer> aTeamScore;    // a队分数
    private MutableLiveData<Integer> bTeamScore;    // b队分数
    private Integer aLast;                          // a队上一次的分数
    private Integer bLast;                          // b队上一次的分数

    public MutableLiveData<Integer> getaTeamScore() {
        if(aTeamScore == null){
            aTeamScore = new MutableLiveData<>();
            aTeamScore.setValue(0);
        }
        return aTeamScore;
    }

    public MutableLiveData<Integer> getbTeamScore() {
        if(bTeamScore == null){
            bTeamScore = new MutableLiveData<>();
            bTeamScore.setValue(0);
        }
        return bTeamScore;
    }

    public void aTeamAdd(int i){
        saveLastScore();
        aTeamScore.setValue(aTeamScore.getValue() + i);
    }

    public void bTeamAdd(int i){
        saveLastScore();
        bTeamScore.setValue(bTeamScore.getValue() + i);
    }

    public void undo(){
        aTeamScore.setValue(aLast);
        bTeamScore.setValue(bLast);
    }

    public void reset(){
        aTeamScore.setValue(0);
        bTeamScore.setValue(0);
    }


    //记录上一次的分数
    private void saveLastScore(){
        this.aLast = aTeamScore.getValue();
        this.bLast = bTeamScore.getValue();
    }
}
```
布局xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        tools:context=".MainActivity">

        <Button
            android:id="@+id/button1"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_margin="8dp"
            android:background="@android:color/holo_red_light"
            android:onClick="@{()->viewModel.aTeamAdd(1)}"
            android:shadowColor="@android:color/background_light"
            android:text="@string/button1"
            android:textColor="#FFFFFF"
            app:layout_constraintBottom_toTopOf="@+id/guideline9"
            app:layout_constraintEnd_toStartOf="@+id/guideline3"
            app:layout_constraintHorizontal_bias="0.423"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="@+id/guideline8"
            app:layout_constraintVertical_bias="0.564" />

        <Button
            android:id="@+id/button4"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_margin="8dip"
            android:background="@color/colorAccent"
            android:onClick="@{()->viewModel.bTeamAdd(1)}"
            android:shadowColor="@android:color/background_light"
            android:text="@string/button1"
            android:textColor="#FFFFFF"
            app:layout_constraintBottom_toTopOf="@+id/guideline9"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintHorizontal_bias="0.0"
            app:layout_constraintStart_toStartOf="@+id/guideline3"
            app:layout_constraintTop_toTopOf="@+id/guideline8"
            app:layout_constraintVertical_bias="0.564" />

        <Button
            android:id="@+id/button2"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_margin="8dp"
            android:background="@android:color/holo_red_light"
            android:onClick="@{()->viewModel.aTeamAdd(2)}"
            android:shadowColor="@android:color/background_light"
            android:text="@string/button2"
            android:textColor="#FFFFFF"
            app:layout_constraintBottom_toTopOf="@+id/guideline10"
            app:layout_constraintEnd_toStartOf="@+id/guideline3"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="@+id/guideline9" />

        <Button
            android:id="@+id/button3"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_margin="8dp"
            android:background="@android:color/holo_red_light"
            android:onClick="@{()->viewModel.aTeamAdd(3)}"
            android:shadowColor="@android:color/background_light"
            android:text="@string/button3"
            android:textColor="#FFFFFF"
            app:layout_constraintBottom_toTopOf="@+id/guideline11"
            app:layout_constraintEnd_toStartOf="@+id/guideline3"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="@+id/guideline10" />

        <Button
            android:id="@+id/button6"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_margin="8dp"
            android:background="@color/colorAccent"
            android:onClick="@{()->viewModel.bTeamAdd(3)}"
            android:shadowColor="@android:color/background_light"
            android:text="@string/button3"
            android:textColor="#FFFFFF"
            app:layout_constraintBottom_toTopOf="@+id/guideline11"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="@+id/guideline3"
            app:layout_constraintTop_toTopOf="@+id/guideline10" />

        <Button
            android:id="@+id/button5"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_margin="8dp"
            android:background="@color/colorAccent"
            android:onClick="@{()->viewModel.bTeamAdd(2)}"
            android:shadowColor="@android:color/background_light"
            android:text="@string/button2"
            android:textColor="#FFFFFF"
            app:layout_constraintBottom_toTopOf="@+id/guideline10"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="@+id/guideline3"
            app:layout_constraintTop_toTopOf="@+id/guideline9" />

        <ImageButton
            android:id="@+id/imageButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:contentDescription="@string/undoButton"
            android:onClick="@{()->viewModel.undo()}"
            app:layout_constraintBottom_toTopOf="@+id/guideline12"
            app:layout_constraintEnd_toStartOf="@+id/guideline3"
            app:layout_constraintHorizontal_bias="0.8"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="@+id/guideline11"
            app:srcCompat="@drawable/ic_undo_black_24dp" />

        <ImageButton
            android:id="@+id/imageButton2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:contentDescription="@string/resetButton"
            android:onClick="@{()->viewModel.reset()}"
            app:layout_constraintBottom_toTopOf="@+id/guideline12"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintHorizontal_bias="0.2"
            app:layout_constraintStart_toStartOf="@+id/guideline3"
            app:layout_constraintTop_toTopOf="@+id/guideline11"
            app:srcCompat="@drawable/ic_refresh_black_24dp" />

        <TextView
            android:id="@+id/textView1"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Team A"
            android:textSize="@dimen/teamTextSize"
            app:layout_constraintBottom_toTopOf="@+id/guideline7"
            app:layout_constraintEnd_toStartOf="@+id/guideline3"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="@+id/guideline2" />

        <TextView
            android:id="@+id/textView2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Team B"
            android:textSize="@dimen/teamTextSize"
            app:layout_constraintBottom_toTopOf="@+id/guideline7"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="@+id/guideline3"
            app:layout_constraintTop_toTopOf="@+id/guideline2" />

        <TextView
            android:id="@+id/scoreA"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{String.valueOf(viewModel.getaTeamScore())}"
            android:textColor="@android:color/holo_red_light"
            android:textSize="@dimen/scoreTextSize"
            app:layout_constraintBottom_toTopOf="@+id/guideline8"
            app:layout_constraintEnd_toStartOf="@+id/guideline3"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="@+id/guideline7"
            tools:text="120" />

        <TextView
            android:id="@+id/scoreB"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@{String.valueOf(viewModel.getbTeamScore())}"
            android:textColor="@color/colorAccent"
            android:textSize="@dimen/scoreTextSize"
            app:layout_constraintBottom_toTopOf="@+id/guideline8"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="@+id/guideline3"
            app:layout_constraintTop_toTopOf="@+id/guideline7"
            tools:text="100" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline2"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.05" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline3"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            app:layout_constraintGuide_percent="0.5" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline4"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            app:layout_constraintGuide_end="-220dp" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline7"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.15" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline8"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.35" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline9"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.5" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline10"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.65" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline11"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.8" />

        <androidx.constraintlayout.widget.Guideline
            android:id="@+id/guideline12"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            app:layout_constraintGuide_percent="0.9" />
    </androidx.constraintlayout.widget.ConstraintLayout>

    <data>
        <variable
            name="viewModel"
            type="com.example.mvvm.MyViewModel" />
    </data>
</layout>
```
Activity的onCreate：
```java
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    ActivityMainBinding mainBinding = DataBindingUtil.setContentView(this, R.layout.activity_main);
    MyViewModel viewModel = new ViewModelProvider(this, new ViewModelProvider.AndroidViewModelFactory(getApplication())).get(MyViewModel.class);
    mainBinding.setViewModel(viewModel);
    mainBinding.setLifecycleOwner(this);        // 监听数据变化，实时改变数据
}
```
可以看到使用setLifecycleOwner就不需要自己写observe来监听数据变化，还能实现数据双向绑定。