---
title: Android复习题
date: 2020-12-24 13:09:38
tags:
- Android
- 复习题
categories: 复习题
---
老师发的复习题

<!-- more -->

# 选择题
1.	下列哪些语句关于内存回收的说明是正确的?(  B  ) 
A、	程序员必须创建一个线程来释放内存 
B、	内存回收程序负责释放无用内存  
C、	内存回收程序允许程序员直接释放内存  
D、	内存回收程序可以在指定的时间释放内存对象 

2.	Android 中下列属于 Intent 的作用的是(  C  ) 
A、	实现应用程序间的数据共享 
B、	是一段长的生命周期，没有用户界面的程序，可以保持应用在后台运行，而不会因为切换页面而消失 
C、	可以实现界面间的切换，可以包含动作和动作数据，连接四大组件的纽带 
D、	处理一个应用程序整体性的工作 

3.	下面在 AndroidManifest.xml 文件中注册 BroadcastReceiver 方式正确的(  A  )    
```xml
A、 <receiver android:name="NewBroad"> 
        <intent-filter> 
            <action   
                android:name="android.provider.action.NewBroad"/> 
            <action> 
        </intent-filter> 
    </receiver> 
B、	<receiver android:name="NewBroad"> 
        <intent-filter> 
            android:name="android.provider.action.NewBroad"/> 
        </intent-filter> 
    </receiver> 
C、	<receiver android:name="NewBroad"> 
        <action   
            android:name="android.provider.action.NewBroad"/>
        <action> 
    </receiver> 
D、	<intent-filter> 
        <receiver android:name="NewBroad"> 
            <action>  
                android:name="android.provider.action.NewBroad"/> 
            <action> 
        </receiver> 
    </intent-filter> 
```

4.	关于 ContenValues 类说法正确的是(  D  ) 
A、	他和 Hashtable 比较类似，也是负责存储一些名值对，但是他存储的名值对当中的名是任意类型，而值都是基本类型 
B、	他和 Hashtable 比较类似，也是负责存储一些名值对，但是他存储的名值对当中的名，可以为空，而值都是 String 类型  
C、	他和 Hashtable 比较类似，也是负责存储一些名值对，但是他存储的名值对当中的名是String 类型，而值也是 String 类型 
D、	他和 Hashtable 比较类似，也是负责存储一些名值对，但是他存储的名值对当中的名是String 类型，而值都是基本类型 

5.	下面退出 Activity 错误的方法是(  C  ) 
A、	finish() B、抛异常强制退出 	C、System.exit()  	D、onStop() 

6.	下面关于 Android dvm 的进程和 Linux 的进程,应用程序的进程说法正确的是(  D  ) 
A、	DVM 指 dalivk 的虚拟机.每一个 Android 应用程序都在它自己的进程中运行,不一定拥有一个独立的 Dalvik 虚拟机实例.而每一个 DVM 都是在 Linux 中的一个进程,所以说可以认为是同一个概念. 
B、	DVM 指 dalivk 的虚拟机.每一个 Android 应用程序都在它自己的进程中运行,不一定拥有一个独立的 Dalvik 虚拟机实例.而每一个 DVM 不一定都是在 Linux 中的一个进程,所以说不是一个概念. 
C、	DVM 指 dalivk 的虚拟机.每一个 Android 应用程序都在它自己的进程中运行,都拥有一个独立的 Dalvik 虚拟机实例.而每一个 DVM 不一定都是在 Linux 中的一个进程,所以说不是一个概念. 
D、	DVM 指 dalivk 的虚拟机.每一个 Android 应用程序都在它自己的进程中运行,都拥有一个独立的 Dalvik 虚拟机实例.而每一个 DVM 都是在 Linux 中的一个进程,所以说可以认为是同一个概念. 

7.	Android 项目工程下面的 assets 目录的作用是什么(  B  ) 
A、	放置应用到的图片资源。 	 	 	  B、主要放置多媒体等数据文件 
C、放置字符串，颜色，数组等常量数据   D、放置一些与 UI 相应的布局文件，都是 xml 文件 

8.	关于 res/raw 目录说法正确的是(  A  ) 
A、	这里的文件是原封不动的存储到设备上不会转换为二进制的格式 
B、	这里的文件是原封不动的存储到设备上会转换为二进制的格式 
C、	这里的文件最终以二进制的格式存储到指定的包中 
D、	这里的文件最终不会以二进制的格式存储到指定的包中 

9.	Android 是如何组织 Activity 的(  A  ) 
A、	以栈的方式组式 Activity 	 	 	B、 以队列的方式组织 Activity 
C、 以树形方式组织 Activity 	 	 	D、 以链式方式组织 Activity。 

10.	onPause 什么时候调用(  C  ) 
	A．当界面启动时  	 	 	 	 	B．当 onCreate 方法被执行之后 
	C．当界面被隐藏时 	 	 	 	 	D．当界面重新显示时 

11.	在 Activity 中，如何获取 service 对象(  A  ) 
	A．可以通过直接实例化得到。  	 	B．可以通过绑定得到。 
	C．通过 startService() 	 	 	 	D．通过 getService()获取。 

12.	在表格布局中，android:collapseColumns="1,2"的含义是( C ) 
A、	在屏幕中，当表格的列能显示完时，显示1，2列  
B、	在屏幕中，当表格的列显示不完时，折叠 
C、在屏幕中，不管是否能都显示完，折叠1、2列 
D、在屏幕中,动态决定是否显示表格。 

13.	绝对布局中，android:layout_x 的含义有( B ) 
A、	以手机左下为原点，组件显示到屏幕中的横向坐标值。 
B、	以手机左上为原点，组件显示到屏幕中的横向坐标值。 
C、以手机右下为原点，组件显示到屏幕中的横向坐标值。 
D、以手机右下为原点，组件显示到屏幕中的横向坐标值。 

14.	创建 Menu 需要重写的方法是( C ) 
A、	onOptionsCreateMenu（Menu menu） 
B、onOptionsCreateMenu（MenuItem menu）  
C、onCreateOptionsMenu(Menu menu) 	
D、onCreateOptionsMenu(MenuItem menu) 

15.	在使用 SQLiteOpenHelper 这个类时，它的哪一个方法是用来实现版本升级之用的( D ) 
A．onCreate()  B．onCreade()  C．onUpdate()  D． onUpgrade() 

16.	ScrollView 中，可以直接包含多少个组件( B ) 
	A．三个 B．两个  C．一个 D．无数个

17. TabHost.newTabSpec("tab1")( B ) 	 
	A．为 tab 页创建标题为 tab1 	 B．为 tab 页创建 ID 为 tab1 
	C．为 tab 页创建内容  	D．为 tab 页创建新空格

18. 关于适配器的说法正确的有( B ) 	 
	A．它主要是用来存储数据  	 	 	 	B．它主要用来把数据绑定到组件上 
	C．它主要用来解析数据   	 	 	 D．它主要用来存储 xml 数据

19. 关于 Activity 说的法不正确的是( C ) 	 
A． Activity 是为用户操作而展示的可视化用户界面 
B． 一个应用程序可以有若干个 Activity 
C． Activity 可以通过一个别名去访问 
D． Activity 可以表现为一个漂浮的窗口 

20.	service 中如何实现更改 Activity 界面元素( B ) 
A．通过把当前 actvity 对象传递给 service 对象。 
B．通过向 Activity 发送广播。 
C．通过 Context 对象更改 Act]ivity 界面元素 
D．可以在 service 中，调用 Activity 的方法实现更改界面元素。 

21.	激活 Activity 的方法是( C ) 
	A．runActivity()  	B．goActivity() 	 	C．startActivity()  	D．startActivityForIn() 

23.	关于 android 进程，说法不正确的是( C ) 
A．组件运行所在的进程，是由 androidmanifest.xml 决定，它可以指定该组件运行于哪个进程。 
B、当急需内存时，android 会决定优先关闭那些空闲的进程 
C．背景进程是不为用户所见的 Activity，但是还会有可能被用户看到，所以它不能被杀死 
D．可视进程一般不会不被系统所杀死 

24.	在 Activity 的生命周期中，当它从可见状态转向半透明状态时，它的哪个方法必须被调用( B ) 
A．onStop()   B．onPause()   C．onRestart()   D．onStart() 

25.	当 Activity 被消毁时，如何保存它原来的状态( A ) 
A．实现 Activity 的 onSaveInstanceState()方法 
B．实现 Activity 的 onSaveInstance()方法 
C．实现 Activity 的 onInstanceState()方法 
D． 实现 Activity 的 onSaveState()方法 

26.	关于 Intent 对象说法错误的是( D ) 
A．在 android 中，Intent 对象是用来传递信息的 
B．Intent 对象可以把值传递给广播或 Activity 
C．利用 Intent 传值时，可以传递一部分值类型 
D．利用 Intent 传值时，它的 key 值可以是对象 

27.	在 android 中，ArrayAdapter 类是用于( A ) 
A．用于把数据绑定到组件上 
B．它能把数据显示到 Activity 上 
C．它能把数据传递给广播 
D．它能把数据传递给服务 

28.	使进度条变横向的系统样式是( A ) 
A.	@android:style/Widget.ProgressBar.Horizontal 
B.	@android:style/ProgressBar.Horizontal 
C.	@style/Widget.ProgressBar.Horizontal 
D.	@style/ProgressBar.Horizontal 

29.	activity 对一些资源以及状态的操作保存，最好是保存在生命周期的哪个函数中进行( D ) 
A.	onPause()  	 	B、onCreate()   	C、 onResume()  	D、onStart()

33. 下面哪一个不属于 Android 体系结构中的应用程序层( C ) 		
A、电话簿 	 	 	B、日历  	 	 	C、SQLite 	 	 	D、SMS 程序 

34.	下面哪种说法不正确( B ) 
A、	Android 应用的 gen 目录下的 R.java 被删除后还能自动生成; 
B、	res 目录是一个特殊目录，包含了应用程序的全部资源，命名规则可以支持数字(0-9)下横线
(_),大小写字母(a-z , A-Z); 
C、	AndroidManifest.xml 文件是每个 Android 项目必须有的，是项目应用的全局描述。其中指定程序的包名(package=”…”)+指定 android 应用的某个组件的名字(android:name=”…”)组成了该组件类的完整路径 
D、	assets 和 res 目录都能存放资源文件，但是与 res 不同的是 assets 支持任意深度的子目录，在它里面的文件不会在 R.java 里生成任何资源 ID 

35.	在一个相对布局中怎样使一个控件居中( C ) 
A、android:gravity="center"  	 	 	 	B、android:layout_gravity="center"  
C、android:layout_centerInParent="true" 	D、android:scaleType="center" 

36.	下列说法哪个不正确( C ) 
A、	拥有 android:configChanges="orientation|keyboardHidden"标签的 Activity 在横竖屏转换时不会再执行 onCreate 方法 
B、	默认情况下对一个 Activity 的对象进行横竖屏切换，该对象的 onCreate 方法在每次切换时都会执行 
C、	一个 Activity 的对象 a1上弹出了一个模拟对话框形式的 Activity 的对象 a2，按返回键后 a1 执行了 onStart 和 onResume 方法,a2执行了 onPause,onStop 和 onDestroy 方法 
D、	一个界面上的 EditText 中输入文字后，再按下 Home，该界面消失，等再回到该界面文字内容仍在，onCreate 方法也不会执行 
> a1调用OnResume，a2调用了OnStop

37.	下列关于 Service 的描述，正确的是( D ) 
A．Servie 主要负责一些耗时比较长的操作，这说明 Service 会运行在独立的子线程中 
B．每次调用 Context 类中的 StartService()方法后都会新建一个 Service 实例 
C．每次启动一个服务时候都会先后调用 onCreate()和 onStart()方法 
D．当调用了 ConText 类中的 StopService()方法后，Serviece 中的 onDestroy()方法会自动回调 
 
38.	在 Android 中使用 Menu 时可能需要重写的方法有( AC )。[多选]
A、onCreateOptionsMenu() 	 	 	B、onCreateMenu() 
C、onOptionsItemSelected() 	 	 	D、onItemSelected() 

39.	在 Android 中使用 SQLiteOpenHelper 这个辅助类时，可以生成一个数据库，并可以对数据库版本进行管理的方法可以是( AB )[多选] 
A、	getWriteableDatabase() 	 	 	B、getReadableDatabase() 
C、getDatabase()  	 	 	 	 	D、getAbleDatabase() 

40.	Android 关于 service 生命周期的 onCreate()和 onStart()说法正确的是( AD )[多选] 
A、	当第一次启动的时候先后调用 onCreate()和 onStart()方法 
B、	当第一次启动的时候只会调用 onCreate()方法 
C、	如果 service 已经启动，将先后调用 onCreate()和 onStart()方法 
D、	如果 service 已经启动，只会执行 onStart()方法，不再执行 onCreate()方法 
 
41.	下列属于 Activity 的状态是( ABC )[多选] 
A.运行状态  B 暂停状态 C 停止状态  D 睡眠状态 

42. 关于 Handler 的说话正确的是( AB )[多选] 	
A.它实现不同线程间通信的一种机制 	 	B.它避免了新线程操作 UI 组件 
C.它采用栈的方式来组织任务的 	 	 	D.它可以属于一个新的线程 

43.	关于广播的作用，正确的说法是( ABCD ) [多选] 
A 它是用接收系统发布的一些消息的 	 	B 它可以帮助 service 修改用户界面 
C 它可以启动一个 Activity  	 	 	 	D 它可以启动一个 Service 

44.	下面属于 View 的子类的是( CD ) [多选] 
A	Activity 	 	 	B Service 	 	 	C ViewGroup 	 	D TextView 

45.	在 main.xml 中，定义一个组件时，有两个属性必须写( AB ) [多选] 
A android:layout_width   B android:layout_height 
C android:id="@+id/start" D android:text 

46.	请找出你学过的适配器类( AC ) [多选] 
A	SimpleAdapter  	 	 	 	 	 	B SimpleArrayAdapter 
C SimpleCursorAdapter 	 	 	 	 	D SimpleCursorsAdapter 

47.	关于 Sqlite 数据库，正确的说法( ABD ) [多选] 
A	SqliteOpenHelper 类主要是用来创建数据库和更新数据库 
B	SqliteDatabase 类是用来操作数据库的 
C	在每次调用 SqliteDatabase 的 getWritableDatabase()方法时，会执行 SqliteOpenHelper 的 onCreate 方法。 
D	当数据库版本发生变化时，可以自动更新数据库结构 

48.	Intent 传递数据时，下列的数据类型哪些可以被传递( ABCD )[多选] 
A	Serializable    	B、charsequence   C、Parcelable    	D、Bundle 
 
49.	下列不属于 service 生命周期的方法是( CD )
A,onCreate    
B,onDestroy   
C,onStop    
D,onStart 
> service生命周期：onCreat()、onStartCommand()、onDestroy()、onBind()、onUnbind()
 
50.	在 android 中使用 RadioButton 时，要想实现互斥的选择需要用的组件是( D )
A,ButtonGroup  B, RadioButtons  C,CheckBox  D,RadioGroup 

51.	创建子菜单的方法是( B )
A,add 	B,addSubMenu C,createSubMenu 	D,createMenu 

52.	处理菜单项单击事件的方法不包含( D )
A,使用 onOptionsItemSelected(MenuItem item)响应   
B,使用 onMenuItemSelected(int featureId ,MenuItem item) 响应 
C,使用 onMenuItemClick(MenuItem item) 响应 
D,使用 onCreateOptionsMenu(Menu menu)响应 

53.	关于 AlertDialog 的说法不正确的是( A )
A,要想使用对话框首先要使用 new 关键字创建 AlertDialog 的实例 
B,对话框的显示需要调用 show 方法 
C,setPositiveButton 方法是用来加确定按钮的 
D,setNegativeButton 方法是用来加取消按钮的 

54.	上下文菜单与其他菜单不同的是( B )
A,上下文菜单项上的单击事件可以使用 onMenuItemSelected 方法来响应 
B,上下文菜单必须注册到指定的 view 上才能显示 
C,上下文菜单的菜单项可以添加，可以删除 
D,上下文菜单的菜单项可以有子项 

55.	以下关于 Android 应用程序的目录结构描述中，不正确的是？( D )
A、 src 目录是应用程序的主要目录，由 Java 类文件文件组成 
B、	assets 目录是原始资源目录，该目录中的内容将不会被 R 类所引用 
C、	res 目录是应用资源目录，该目录中的所有资源内容都会被 R 类所索引 
D、	AndroidManifest.xml 文件是应用程序目录清单文件，该文件由 ADT 自动生成，不需要程序员手动修改   

56. 对于 XML 布局文件中的视图控件，layout_width 属性的属性值不可以是什么？ ( D )
a. match_parent
b. fill_parent
c. wrap_content
d. match_content

57. 关于 BroadcastReceiver 的说法不正确的是？  ( B )
a. 是用来接收广播 Intent 的 
b. 一个广播 Intent 只能被一个订阅了此广播的 BroadcastReceiver 所接收 
c. 对有序广播，系统会根据接收者声明的优先级别按顺序逐个执行接收者 
d. 接收者声明的优先级别在的 android:priority 属性中声明，数值越大 优先级别越高 

58. 关于 Sqlite 数据库，不正确的说法是（ C ） 选择一项： 
a. SqliteOpenHelper 类主要是用来创建数据库和更新数据库 
b. SqliteDatabase 类是用来操作数据库的 
c. 在每次调用 SqliteDatabase 的 getWritableDatabase() 方法时，会执行 teOpenHelper 的 onCreate 方法。
d. 当数据库版本发生变化时，可以自动更新数据库结构 
	
59. 下列对 SharePreferences 存、取文件的说法中正确的是：ABD
A,属于移动存储解决方案     B,sharePreferences处理的就是key-value对   
C,读取xml文件的路径是/sdcard/shared_prefx  D,信息的保存格式是xml 

62. android 数据存储与访问的方式有？( ABCD )
a.	sharedpreference 	  
b.	数据库 	  
c.	文件 	  
d.	内容提供者 	  

63. 下列说法正确的有（ABC）
A. javac.exe 能指定编译结果要置于哪个目录（directory） 
B. 在编译程序时，所能指定的环境变量不包括class path 
C. javac 一次可同时编译数个java 源文件 
D. 环境变量可在编译source code时指定

64. 下列说法错误的有（BCD）
A. Java语言中的方法必定隶属于某一类（对象），调用方法与过程或函数相同
B. Java面向对象语言容许单独的过程和函数存在 
C. Java面向对象语言容许单独的方法存在 
D. Java语言中的方法属于类的成员（member） 

65. 解析 xml 的方式有（CD）
A. 字符器类型
B. 流方式
C. DOM
D. SAX

66. Intent传递数据时，下列的哪种类型数据不可以被传递？B
A. Serializable
B. JSON对象 
C. Bundle
D. Charsequence

67. 在多个应用中读取共享存储数据时， 需要用到哪个对象的 query 方法？A
A. ContentResolver 
B. ContentProvider
C. Cursor
D. SQLiteHelper

68. 下列说法正确的是？A
A. 每个进程都运行于自己的 java 虚拟机(JVM)中。 
B. 默认情况下，每个应用程序中均运行于自己的进程中，而且此进程不会被消毁。
C. 每个应用程序会被赋予一个唯一的 linux 用户 ID，从而使得该应用程序下的文件， 其它用户也可以访问。
D. 一个应用程序数据，可以随意被其它应用程序所访问

69. 使用 AIDL 完成远程 service 方法调用下列说法不正确的是？A
选择一项：
A. aidl 对应的接口名称不能与 aidl 文件名相同 
B. aidl 的文件的内容类似 java 代码
C. 创建一个 Service（服务），在服务的 onBind(Intent intent)方法中返回实现了 aidl 接口的对象
D. aidl 对应的接口的方法前面不能加访问权限修饰符

70. 关于视图控件的常用事件描述中，不正确的是？A
A. Click事件只能使用在按钮上，表示按钮的点击动作 
B. 当TextView类视图控件失去焦点或获得焦点时，将触发FocusChange事件
C. 当单选框中某一选项被选择时，将触发CheckedChange事件
D. 当多选框中某一选项被选择时，将触发CheckedChange事件

71. 下列说法正确的有（C）
A．class中的constructor不可省略
B．constructor必须与class同名，但方法不能与class同名
C．constructor在一个对象被new时执行
D．一个class只能定义一个constructor

72. 下列语句哪一个正确（B）
A．Java程序经编译后会产生machine code
B．Java程序经编译后会产生byte code
C．Java程序经编译后会产生DLL
D．以上都不正确

73. 下列属于SAX解析xml文件的优点是（B）
A．将整个文档树存储在内存中，便于操作，支持删除，修改，重新排列等多种功能（DOM）
B．不用事先调入整个文档，占用资源少
C．整个文档调入内存，浪费时间和空间
D．不是长久驻留在内存，数据不是持久的，事件过后，若没有保存数据，数据就会消失

74. DDMS中Log信息分为几个级别（C）
A．3
B．4
C．5
D．7

75. Android下的单元测试要配置，以下说法不正确的是（A）
A．需要在manifest.xml清单文件application节点下配置instrumentation
B．需要在manifest.xml清单文件manifest节点下配置instrumentation
C．需要在manifest.xml清单文件application节点下配置uses-library
D．需要让测试类继承AndroidTestCase类

76. 下列说法错误的一项是（D）
A．Button是普通按钮组件，除此之外还有其他的按钮组件
B．TextView是显示文本的组件，TextView是EditText的父类
C．EditText是编辑文本的组件，可以使用EditText输入特定的字符
D．ImageView是显示图片的组件，可以通过设置显示局部图片

77. 下列关于XML布局文件在Java代码中被引用的说明中，不正确的是（B）
A．在Activity中，可以使用findViewById( )方法，通过资源id，获得指定视图元素
B．在Activity中，可以使用R.drawable-system.***方式引用Android系统所提供的图片资源
C．在Activity中，可以使用setContentView( )方法，确定加载哪一个布局文件
D．可以使用View类的findViewById( )方法，获得当前View对象中的某一个视图元素




# 填空题

1、 Android 中常用的五种布局是 **FrameLayout，LinearLayout，RelativeLayout，AbsoluteLayout 和 TableLayout** 。
2、 Android 的四大组件是 **activity，service，broadcast 和 contentprovide**。
3、 Android 中 service 的实现方法是：**startservice 和 bindservice**。
4、 activity 一般会重载 7 个方法用来维护其生命周期，除了 **onCreate(),onStart(),onDestory()** 外还有 **onrestart,onresume,onpause,onstop**。
5、 android 的数据存储的方式 **sharedpreference**，文件，**SQlite,contentprovider**，网络。
6、 当启动一个Activity并且新的 Activity执行完后需要返回到启动它的 Activity来执行的回调函数是 **startActivityResult()** 。
7、 属于 android 中的三种适配器 **SimpleAdapter、ArrayAdapter、 BaseAdapter** 。
8、 元素中 layout_width 的取值有 **wrap_content** 、match_parent、fill_parent。
9、 SQLite 支持五种数据类型包括 **TEXT** 、NULL、BLOB、REAL、INTEGER。
10、一个 Activity 就是一个**可视化的界面**或者看成是控件的容器。
11、onPause()方法在 activity 被暂停或收回 CPU 和其他资源时调用，该方法用于**保存活动状态的**，也是对运行时数据的现场保护。
12、onDestroy 是 activity 被干掉前最后一个被调用方法，当调用 **finish** 方法或者系统为了节省空间将它暂时性的干掉时候调用。
13、使用 **startService()** 方法启动服务后，调用者和服务间没有关联，即使调用者退出了，服务仍然进行。
14、当应用程序中某广播在 AndroidMainifest.xml 进行注册后，即使该应用程序关闭后，也可以接受操作系统发出的 **广播信息** 。
15、定义 LinearLayout 水平方向布局时至少设置的三个属性：**android:orientation**， **android:layout width 和 android:layout height** 
16、Android 平台提供了 2D，3D 的图形支持，**SQLite** 数据库支持，并且集成了浏览器
17、Android SDK 主要以 **java** 语言为基础。
18、Android.jar 是一个标准的压缩包，其内容包含的是编译后的 **class**，包含了全部的 **API**。

# 作品题
1. 导入“TextViewDemo”的安卓程序，建立如下图所示的界面，界面包含 TextView(id:TextView01)和 EditText(id:EditText01)两个控件，请分别在 main.xml 和 TextViewDemoActivity.java 补充程序：
{% asset_img 1.png %}
在XML文件里：
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:id="@+id/TextView01"
    android:text="User:"/>
<EditText
    android:layout_width="fill_parent"
    android:layout_height="wrap_content"
    android:id="@+id/EditText01" />
```

2. 导入“ButtonDemo”的安卓程序，建立如下图所示的界面，界面包含 TextView(id:TextView01)、Button(id:Button01)和 ImageButton(id:  ImageButton01)两个按钮，上方是“Button 按钮”，下方是一个 ImageButton 控件，请分别在 main.xml 和 ButtonDemoActivity.java 补充程序：
{% asset_img 2.jpg %}
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:id="@+id/TextView01"
    android:text="ButtonDemo"/>
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Button"
    android:id="@+id/Button01" />
<ImageButton
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:id="@+id/ImageButton01"
    android:src="@drawable/xxx.xxx"  />
```

3. 导入“ListViewDemo”的安卓程序，建立如下图所示的界面，界面包含 TextView(id:TextView01) 和 ListView01 (id: ListView01)两个按钮，ListView01 中所显示的内容“ListView 子项 1、ListView 子项 2 ListView 子项 3”并单击相应菜单项时 TextView 显示相应菜单名称，请分别在 main.xml 和ButtonDemoActivity.java 补充程序：
{% asset_img 3.png %}
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:id="@+id/TextView01"
    android:text="ListViewDemo!" />
    

<ListView
    android:id="@+id/ListView01"
    android:layout_width="match_parent"
    android:layout_height="wrap_content" />
```
```java
TextView textView = findViewById(R.id.TextView01);
ListView listView = findViewById(R.id.ListView01);
String[] list = {"ListView子项1", "ListView子项2", "ListView子项3"};

ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, list);
listView.setAdapter(adapter);

AdapterView.OnItemClickListener onClickListener = new AdapterView.OnItemClickListener() {
    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        if (position == 0) {
            textView.setText("点击了ListView子项1");
        } else if (position == 1) {
            textView.setText("点击了ListView子项2");
        } else {
            textView.setText("点击了ListView子项3");
        }
    }
};
listView.setOnItemClickListener(onClickListener);
```

4. 创建工程，命名为 LinearLayoutDemo，布局界面如图，A、B、C 三个按钮呈垂直线性排列，请写出相关布局文件代码。
{% asset_img 4.jpg %}
```xml
<LinearLayout
    android:layout_width="fill_parent"
    android:layout_height="fill_parent"
    android:orientation="vertical" >
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="A"
        android:layout_gravity="center" />
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="B"
        android:layout_gravity="center" />
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="C"
        android:layout_gravity="center" />
</LinearLayout>
```

5. 创建工程，命名为 TableLayoutDemo，布局界面如图，组件请使用表格布局排列，请写出相关布局文件代码。
{% asset_img 5.jpg %}
```xml
<TableLayout
    android:layout_width="wrap_content"
    android:layout_height="wrap_content">
    <TableRow
        android:id="@+id/TableRow1"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content">
        <TextView
            android:id="@+id/label"
            android:layout_height="wrap_content"
            android:layout_width="160dp"
            android:text="用户名："
            android:gravity="right"/>
        <EditText
            android:id="@+id/input"
            android:layout_height="wrap_content"
            android:layout_width="160dp"/>
    </TableRow>
    <TableRow
        android:id="@+id/TableRow2"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content">
        <Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="确定" />

        <Button
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="取消"/>
    </TableRow>
</TableLayout>
```

6. 创建工程，命名为 RelativeLayoutDemo，布局界面如图，组件请使用相对布局排列，请写出相关布局文件代码。
{% asset_img 6.png %}
```xml
<RelativeLayout
    android:layout_width="wrap_content"
    android:layout_height="wrap_content">
    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:id="@+id/label"
        android:text="用户名："/>
    <EditText
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:id="@+id/entry"
        android:layout_below="@id/label"/>
    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="确认"
        android:layout_toLeftOf="@id/cancel"
        android:layout_alignTop="@id/cancel"
        android:layout_toStartOf="@id/cancel" />
    <Button
        android:id="@+id/cancel"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="取消"
        android:layout_below="@id/entry"
        android:layout_alignParentRight="true"
        android:layout_alignParentEnd="true" />
</RelativeLayout>
```

7. 创建工程，命名为 AbsoluteLayoutDemo，布局界面如图，组件请使用绝对布局排列，请写出相关布局文件代码。
{% asset_img 7.png %}

```xml
<AbsoluteLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/absolute"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_x="89dp"
        android:layout_y="165dp"
        android:text="@string/username" />

    <EditText
        android:layout_width="218dp"
        android:layout_height="wrap_content"
        android:layout_x="89dp"
        android:layout_y="184dp"
        android:inputType="textPersonName" />

    <Button
        android:id="@+id/button3"
        android:layout_width="100dp"
        android:layout_height="wrap_content"
        android:layout_x="89dp"
        android:layout_y="246dp"
        android:text="@string/confirm"
        android:textAllCaps="false" />

    <Button
        android:id="@+id/button4"
        android:layout_width="100dp"
        android:layout_height="wrap_content"
        android:layout_x="207dp"
        android:layout_y="245dp"
        android:text="@string/cancel"
        android:textAllCaps="false" />
</AbsoluteLayout>
```

8. 导入“OptionMenu”的安卓程序，建立如下图所示的界面，界面包含 TextView(id:TextView01)控件和菜单，并单击相应菜单项时 TextView 显示相应菜单名称，请分别在 main.xml 、main_menu.xml 和 OptionMenuActivity.java 补充程序：
{% asset_img 8.jpg %}
在res/menu下的main_menu.xml:
```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android" >
    <item android:id="@+id/item0" android:title="打印"></item>
    <item android:id="@+id/item1" android:title="新建"></item>
    <item android:id="@+id/item2" android:title="邮件"></item>
    <item android:id="@+id/item3" android:title="设置"></item>
    <item android:id="@+id/item4" android:title="订阅"></item>
</menu>
```
java文件：
```java
@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.main_menu, menu);
		return super.onCreateOptionsMenu(menu);
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		TextView textView = (TextView) findViewById(R.id.TextView01);
		switch (item.getItemId()) {
		case R.id.item0:
			textView.setText("打印，菜单ID：" + item.getItemId());
			break;
		case R.id.item1:
			textView.setText("新建，菜单ID：" + item.getItemId());
			break;
		case R.id.item2:
			textView.setText("邮件，菜单ID：" + item.getItemId());
			break;
		case R.id.item3:
			textView.setText("设置，菜单ID：" + item.getItemId());
			break;
		case R.id.item4:
			textView.setText("订阅，菜单ID：" + item.getItemId());
			break;
		default:
			break;
		}
		return super.onOptionsItemSelected(item);
	}
```
布局文件：
```xml
<TextView
    android:id="@+id/TextView01"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="MenuDemo"/>
```

9. 导入“SubMenu”的安卓程序，建立如下图所示的界面，界面包含 TextView(id:TextView01)控件和菜单，菜单结构如下：
* 设置
    + 打印
* 新建
    + 邮件
    + 订阅
    
并单击相应菜单项时 TextView 显示相应菜单名称， 请分别在 main.xml 、sub_menu.xml 和SubMenuActivity.java 补充程序：
{% asset_img 9-1.jpg %}
{% asset_img 9-2.jpg %}
{% asset_img 9-3.jpg %}

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
}

@Override
public boolean onCreateOptionsMenu(Menu menu) {
    MenuInflater inflater = getMenuInflater();
    inflater.inflate(R.menu.sub_menu, menu);
    return super.onCreateOptionsMenu(menu);
}
```
菜单文件：
```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android" >
    <item android:id="@+id/item0" android:title="设置">
        <menu>
            <item android:id="@+id/item2" android:title="打印"/>
        </menu>
    </item>
    <item android:id="@+id/item1" android:title="新建">
        <menu>
            <item android:id="@+id/item3" android:title="邮件"/>
            <item android:id="@+id/item4" android:title="订阅"/>
        </menu>
    </item>
</menu>
```
布局文件
```xml
<TextView
    android:id="@+id/TextView01"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/SubMenuDemo" />
```

10. 导入“ IntentDemo ” 的安卓工程， 建立如下图所示的界面，包含两个 Activity ，分别是IntentDemoActivity 和NewActivity，程序默认启动的 Activity 是IntentDemo，在用户点击“启动 Activity”按钮后，程序启动的 Activity 是 NewActivity，请分别补充程序：
{% asset_img 10.png %}
main_activity
```xml
<Button
    android:id="@+id/Button01"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/button" />
```

main_activity2
```xml
<TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="@string/text" />
```

MainClass:
```java
Button button = (Button) findViewById(R.id.Button01);
button.setOnClickListener(new OnClickListener() {
    
    @Override
    public void onClick(View v) {
        Intent intent = new Intent(MainActivity.this, IntentDemo.class);
        startActivity(intent);
    }
});
```

11. 导入“WebViewIntentDemo”的安卓工程，建立如下图所示的界面，布局界面如图，当用户在文本框中输入 Web 地址后，通过点击“浏览此 URL”按钮，程序根据用户输入的 Web 地址生成一个Intent，并以隐式启动的方式调用 Android 内置的 Web 浏览器，并打开指定的 Web 页面。本例输入的 Web 地址 http://www.google.com.hk，打开页面后的效果如图
{% asset_img 11-1.jpg %}
{% asset_img 11-2.jpg %}
```xml
<EditText
    android:id="@+id/editText"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="@string/text"
    android:inputType="textUri" />

<Button
    android:id="@+id/button"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_alignParentStart="true"
    android:layout_below="@+id/editText"
    android:text="@string/button" />
```

```java
final EditText editText = (EditText) findViewById(R.id.editText);
Button button = (Button) findViewById(R.id.button);
button.setOnClickListener(new OnClickListener() {
    @Override
    public void onClick(View v) {
        String url = editText.getText().toString();
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
});
```

12. 导入“ActivityCommunication”的安卓工程，建立如下图所示的界面，工程将以 Sub-Activity 方式启动子Activity，及使用 Intent 进行组件间通信。
1)、当用户点击“启动 Activity1”和“启动 Activity2”按钮时，程序将分别启动子 SubActivity1 和SubActivity2。
2)、SubActivity1 提供了一个输入框，以及“接受”和“撤销”两个按钮。如果在输入框中输入信息后点击“接受”按钮，程序会把输入框中的信息传递给其父 Activity，并在父 Activity 的界面上显示。
3)、如果用户点击“撤销”按钮，则程序不会向父 Activity 传递任何信息。
4)、SubActivity2 主要是为了说明如何在父 Activity 中处理多个子 Activity，因此仅提供了用于关闭SubActivity2 的“关闭”按钮
{% asset_img 12-1.jpg %}
{% asset_img 12-2.jpg %}
main
```xml
<TextView
    android:id="@+id/text1"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="200dp"
    android:text="@string/main_activity"
    android:textSize="24sp"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toTopOf="parent" />

<TextView
    android:id="@+id/text2"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="16dp"
    android:textSize="18sp"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/text1"/>

<Button
    android:id="@+id/button1"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="32dp"
    android:text="@string/activity1"
    android:textAllCaps="false"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/text2" />

<Button
    android:id="@+id/button2"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="16dp"
    android:text="@string/activity2"
    android:textAllCaps="false"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/button1" />
```
```java
static final int SUB1 = 1;
static final int SUB2 = 2;
TextView text;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    text = findViewById(R.id.text2);

    findViewById(R.id.button1).setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            Intent intent = new Intent(MainActivity.this, SubActivity1.class);
            startActivityForResult(intent, SUB1);
        }
    });

    findViewById(R.id.button2).setOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View v) {
            Intent intent = new Intent(MainActivity.this, SubActivity2.class);
            startActivityForResult(intent, SUB2);
        }
    });
}

@SuppressLint("SetTextI18n")
@Override
protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    switch (requestCode) {
        case SUB1:
            if (resultCode == RESULT_OK) {
                text.setText("result: " + data.getData().toString());
            }
            break;
        case SUB2:
            break;
    }
}
```

activity1
```xml
<TextView
    android:id="@+id/text"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="200dp"
    android:text="@string/subactivity1"
    android:textSize="24sp"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toTopOf="parent" />

<EditText
    android:id="@+id/edit"
    android:layout_width="240dp"
    android:layout_height="wrap_content"
    android:layout_marginTop="16dp"
    android:hint="@string/enter"
    android:inputType="text"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/text"/>

<Button
    android:id="@+id/button1"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="32dp"
    android:text="@string/confirm"
    android:textAllCaps="false"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/edit" />

<Button
    android:id="@+id/button2"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="16dp"
    android:text="@string/cancel"
    android:textAllCaps="false"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/button1" />
```
```java
EditText editText = findViewById(R.id.edit);
findViewById(R.id.button1).setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        setResult(RESULT_OK, new Intent(null, Uri.parse(editText.getText().toString())));
        finish();
    }
});

findViewById(R.id.button2).setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        setResult(RESULT_CANCELED, null);
        finish();
    }
});
```

activity2
```xml
<TextView
    android:id="@+id/text"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="200dp"
    android:text="@string/subactivity2"
    android:textSize="24sp"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toTopOf="parent" />

<Button
    android:id="@+id/button"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="32dp"
    android:text="@string/close"
    android:textAllCaps="false"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toBottomOf="@+id/text" />
```
```java
findViewById(R.id.button).setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        setResult(RESULT_CANCELED, null);
        finish();
    }
});
```
manifest:
```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/Theme.ActivityCommunication">
    <activity android:name=".SubActivity2" />
    <activity android:name=".SubActivity1" />
    <activity android:name=".MainActivity">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />

            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

13. Spinner
```xml
<TextView
    android:id="@+id/tv"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Hello World!"" />

<Spinner
    android:id="@+id/spinner1"
    android:layout_width="200dp"
    android:layout_height="wrap_content"
    android:spinnerMode="dropdown"/>
```

```java
TextView textView = findViewById(R.id.tv);
Spinner spinner = findViewById(R.id.spinner1);
String[] list = {"Spinner1", "Spinner2", "Spinner3"};
ArrayAdapter<String> adapter = new ArrayAdapter<String>(this,
        android.R.layout.simple_spinner_dropdown_item, list);
adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
spinner.setAdapter(adapter);

spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
    @Override
    public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
        if (i == 0) {
            textView.setText("点击了Spinner1");
        } else if (i == 1) {
            textView.setText("点击了Spinner2");
        } else {
            textView.setText("点击了Spinner3");
        }
    }
    @Override
    public void onNothingSelected(AdapterView<?> adapterView) {

    }
});
```

项目文件：[整个](http://d0.ananas.chaoxing.com/download/5d0c3b5024bad045c70079ec9f608ba8?at_=1610294878846&ak_=86b8e2318cce2fe4e7135f92d7b7847e&ad_=0096ee08d535b1c86617b21c71d25989&fn=Android.zip) 、 [本页面源文件](http://115.159.109.73:8081/android1.txt)