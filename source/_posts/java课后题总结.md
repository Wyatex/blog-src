---
title: java课后题总结
date: 2021-01-07 17:31:21
tags:
---
自己写的垃圾代码(下面只给出主体代码)

<!-- more -->

# 基础

## 输出全部大写字母
```java
//1、快速打印：
System.out.println("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
//2、循环打印
final char upperCharStart = 'A', upperCharEnd = 'Z';
for (char i = upperCharStart; i <= upperCharEnd; i++) {
    System.out.print(i);
}
```

## 猜数字
```java
import java.util.*;
// ....
Scanner reader = new Scanner(System.in);
Random random = new Random();
System.out.println("猜一个1到100之间的整数");
int realNum = random.nextInt(100) + 1;

int guess = 0;
System.out.print("请输入您的猜测：");
guess = reader.nextInt();
while (guess != realNum) {
    if (guess > realNum) {
        System.out.println("猜大了，请再输入");
        guess = reader.nextInt();
    } else {
        System.out.println("猜小了，请再输入");
        guess = reader.nextInt();
    }
}
System.out.println("猜对了");
```

## 求1000以内的完数

```java
System.out.print("一千以内的完数是：");
final int range = 1000;
for (int i = 1; i <= range; i++) {
    // sum用于记录真因子的和
    int sum = 0;
    for (int j = 1; j < i; j++) {
        if (i % j == 0) {
            sum += j;
        }
    }
    // 判断是否为完数，是则输出
    if (sum == i) {
        System.out.print(i + "  ");
    }
}
```

## 求最大整数
求满足1!+2!+3!+…+n!≤9876的最大整数n 
```java
int result = 0;
for (int i = 1;; i++) {
    // sum记录阶乘的和
    int sum = 0;
    for (int j = 1; j <= i; j++) {
        // factorial记录阶乘的值
        int factorial = 1;
        for (int k = 1; k <= j; k++) {
            factorial *= k;
        }
        sum += factorial;
    }

    // 当达到要求后
    if (sum > 9876) {
        // 因为已经超出要求值，所以最大值为当前循环量减一
        result = i - 1;
        break;
    }
}
System.out.println("最大整数n为：" + result);
```

## 冒泡排序
```java
int[] arr = {10, 8, 3, 6, 1, 7, 4, 2, 5, 9};
for (int i = 0; i < arr.length - 1; i++) {
    for (int j = 0; j < arr.length - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {
            arr[j] = arr[j] ^ arr[j+1];
            arr[j+1] = arr[j] ^ arr[j+1];
            arr[j] = arr[j] ^ arr[j+1];
        }
    }
}
```

## 水仙花数
```java
for (int i = 100; i < 1000; i++) {
    int hundred = i / 100;
    int ten = (i - hundred * 100) / 10;
    int one = i % 10;
    if (one*one*one+ten*ten*ten+Math.pow(hundred, 3) == i) {
        System.out.println(i);
    }
}
```

# 进阶
## 获取字符串中第一个和最后一个字符
```java
// 假设有字符串str
char start = str.charAt(0);
char end = str.charAt(str.length() - 1);
System.out.println("首个字符是："+start+"\n"+"最后一个字符是："+end);
```

## 剔除字符串中全部非数字字符
```java
import java.util.regex.Matcher;
import java.util.regex.Pattern;
// ...
String s = "ab123cd45";
Matcher m = Pattern.compile("\\D+").matcher(s);
System.out.println(m.replaceAll(""));   //输出：12345
```

## 解析字符串中的数字
```java
Scanner s = (new Scanner("数学87分，物理76分，英语96分")).useDelimiter("\\D+");
int sum = 0;
while (s.hasNext()) {
    try {
        sum += s.nextInt();
    } catch (InputMismatchException e) {
        System.out.println(e.getMessage());
    }
}
System.out.println("总成绩为：" + sum + "\n" + "平均分为：" + sum/3.0);
```

## 了解打印流
```java
try {
    File file = new File("p.txt");
    FileOutputStream out = new FileOutputStream(file);
    PrintStream ps = new PrintStream(out);
    ps.print(12345.6789);
    ps.println("how are you");
    ps.println(true);
    ps.close();
} catch(IOException ignored) {}
```

## 解析文件中的数字
```java
import java.io.File;
import java.io.FileNotFoundException;
import java.util.InputMismatchException;
import java.util.Scanner;
// ...
File file = new File("cost.txt");
double sum = 0;
int count = 0;
try {
    Scanner sc = new Scanner(file);
    sc.useDelimiter("[^0-9.]+");
    while (sc.hasNext()) {
        try {
            double price = sc.nextDouble();
            sum += price;
            count++;
        } catch (InputMismatchException ignored) {
            String t = sc.next();
        }
    }
    System.out.println("平均价格为：" + sum/count);
} catch (FileNotFoundException e) {
    e.printStackTrace();
}
```

# 高级
## 线程sleep打断
有三个线程student1、student2、teacher，student1准备睡10分钟再上课，student2准备睡一个小时后上课，teacher输出三句“上课”后吵醒student1，student1被吵醒后负责吵醒student2.
```java
import java.util.HashMap;
import java.util.Map;

public class MainClass {
    public static void main(String[] args) {
        ClassRoom classRoom = new ClassRoom();
        classRoom.map.get("student1").start();
        classRoom.map.get("student2").start();
        classRoom.map.get("teacher").start();
    }
}

class ClassRoom implements Runnable {
    Thread attachThread;
    Map<String, Thread> map = new HashMap<String, Thread>(3);

    ClassRoom() {
        Thread teacher = new Thread(this);
        teacher.setName("teacher");
        Thread student1 = new Thread(this);
        student1.setName("student1");
        Thread student2 = new Thread(this);
        student2.setName("student2");
        map.put("teacher", teacher);
        map.put("student1", student1);
        map.put("student2", student2);
    }

    @Override
    public void run() {
        String name = Thread.currentThread().getName();
        //字符串放前面避免空指报空指针异常
        if ("student1".equals(name)) {
            try {
                System.out.println("student1先睡10分钟再上课");
                Thread.sleep(1000 * 60 * 10);
            } catch (InterruptedException e) {
                System.out.println("student1被叫醒了\nstudent1正在叫醒student2");
                map.get("student2").interrupt();
            }
        } else if ("student2".equals(name)) {
            try {
                System.out.println("student2先睡一个小时再上课");
                Thread.sleep(1000 * 60 * 60);
            } catch (InterruptedException e) {
                System.out.println("student2被叫醒了");
            }
        } else {
            for (int i = 0; i < 3; i++) {
                System.out.println("上课");
            }
            map.get("student1").interrupt();
        }
    }
}
```

## 线程联合
创建三个线程：运货司机、装运工、仓库管理员。要求运货司机占有CPU后立刻联合装运工（也就是等到装运工完成后开车），装运工占有CPU后立刻联合仓库管理员（等到仓库管理员打开仓库后开始装运）。
```java
public class MainClass {
    public static void main(String[] args) {
        ThreadJoin a = new ThreadJoin();
        Thread driver = new Thread(a);
        driver.setName("运货司机");
        driver.start();
    }
}

class ThreadJoin implements Runnable {
    Map<String, Thread> map = new HashMap<String, Thread>(2);

    ThreadJoin() {
        Thread porter = new Thread(this);
        porter.setName("搬运工");
        Thread storekeeper = new Thread(this);
        storekeeper.setName("仓库管理员");
        map.put("搬运工", porter);
        map.put("仓库管理员",storekeeper);
    }

    @Override
    public void run() {
        if ("运货司机".equals(Thread.currentThread().getName())) {
            try {
                System.out.println("运货司机：等待搬运工");
                map.get("搬运工").start();
                map.get("搬运工").join();
                System.out.println("运货司机：开始发车");
            } catch (InterruptedException ignored) {}
        }
        if ("搬运工".equals(Thread.currentThread().getName())) {
            try {
                System.out.println("搬运工：等待仓库管理员打开仓库");
                map.get("仓库管理员").start();
                map.get("仓库管理员").join();
                System.out.println("搬运工:开始搬运....\n搬运工:搬运完成");
            } catch (InterruptedException ignored) {}
        }
        if ("仓库管理员".equals(Thread.currentThread().getName())) {
            System.out.println("仓库管理员：正在打开仓库...");
        }
    }
}
```

## 套接字
使用套接字编写网络程序，客户输入三角形的三边并发送给服务器，服务器把计算得到的结果返回。
### 服务端
```java
public class ServerClass {
    public static void main(String[] args) {
        try {
            int port = 8082;
            ServerSocket serverSocket = new ServerSocket(port);
            System.out.println("服务器启动成功，绑定端口：" + port);
            // 创建线程池
            ExecutorService es = Executors.newFixedThreadPool(50);
            while (true) {
                //获得socket并生成对于的handle
                Handle handle = new Handle(serverSocket.accept());
                //提交任务给线程池，让线程池自行管理线程，通过线程复用提高性能
                es.execute(handle);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

class Handle implements Runnable {
    Socket socket = null;

    Handle(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        while (true) {
            double firstSide = 0;
            double secondSide = 0;
            double thirdSide = 0;
            try {
                // 获得输入输出流接口
                DataOutputStream out = new DataOutputStream(socket.getOutputStream());
                DataInputStream in = new DataInputStream(socket.getInputStream());
                // 输入边长
                out.writeUTF("请输入第一条边长:");
                firstSide = Double.parseDouble(in.readUTF());
                out.writeUTF("请输入第二条边长:");
                secondSide = Double.parseDouble(in.readUTF());
                out.writeUTF("请输入第三条边长:");
                thirdSide = Double.parseDouble(in.readUTF());
                //计算面积并让用户决定是否继续
                if (firstSide + secondSide > thirdSide &&
                    firstSide + thirdSide > secondSide &&
                    secondSide + thirdSide > firstSide) {
                    //半周长
                    double l = (firstSide + secondSide + thirdSide) / 2;
                    //面积
                    double area = Math.sqrt(l * (l - firstSide) * (l - secondSide) * (l - thirdSide));
                    String str = "可以构成三角形，" + "三角形面积为：" + area + "\n是否退出？（Y：退出，N：继续，默认：退出）";
                    out.writeUTF(str);
                } else {
                    out.writeUTF("不能构成三角形!" + "\n是否退出？（Y：退出，N：继续，默认：退出）");
                }
                //判断是否退出
                int check = 1;
                if ("N".equals(in.readUTF())) {
                    check = 0;
                }
                if (check == 1) {
                    in.close();
                    return;
                }
            } catch (IOException e) {
                e.printStackTrace();
                // 抛出异常后应该立刻退出，不然会因为while而无限循环无法退出而且不能将资源让给其他用户
                return;
            }
        }
    }
}
```

### 客户端
```java
public class ClientClass {
    public static void main(String[] args) {
        try {
            // 下面的ip请改成你的服务端ip，如果在本地运行则使用127.0.1.1
            Socket clientSocket = new Socket("123.123.123.123", 8082);
            System.out.println("服务器连接成功");
            DataInputStream in = new DataInputStream(clientSocket.getInputStream());
            DataOutputStream out = new DataOutputStream(clientSocket.getOutputStream());
            while (true) {
                System.out.print(in.readUTF());
                Scanner scanner = new Scanner(System.in);
                out.writeUTF(scanner.nextLine());
            }
        } catch (IOException e) {
            System.out.println("已关闭连接");
            return;
        }
    }
}
```

<== to be continued