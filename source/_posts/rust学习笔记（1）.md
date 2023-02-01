---
title: rust学习笔记（1）：Day1 Moring
date: 2023-01-02 11:19:15
tags:
- Rust
- 学习笔记
categories: Rust
---

下面笔记都是使用Windows系统

<!-- more -->

## 环境配置

首先需要安装Rustup和mingw-w64，其中Rustup用于安装Rust编译器和Cargo，编译出可执行文件还需要mingw-w64进行连接，当然如果你的电脑有装VS而且装msvc编译工具，也可以不使用mingw。

### 安装Rustup

如果你的系统已经安装了Chocolatey 或者 Scoop,可以使用他们安装Rustup，我就为了方便就用系统自带的Winget来安装了：

```
winget install rustup
```

然后安装工具链的话，如果你的电脑有msvc，就下使用msvc的工具链：

```
rustup toolchain install stable-x86_64-pc-windows-msvc
```

如果你的电脑没有msvc，推荐使用mingw，更加小巧而且安装方便：

```
rustup toolchain install stable-x86_64-pc-windows-gnu
```

工具链也可以安装多个，可以用下面的方法切换：

```
# 切到mingw
rustup default stable-x86_64-pc-windows-gnu
# 切到msvc
rustup default stable-x86_64-pc-windows-msvc
```

### 安装Mingw

如果你的电脑没有msvc，可以选择安装mingw，当然你要装msvc也可以，但是因为我是使用mingw所以下面教程都是使用mingw。

打开[mingw的github release页面](https://github.com/niXman/mingw-builds-binaries/releases)，选择最新的版本，比如写这篇笔记时最新是12.2.0，那么我们可以点击Assets下面的：`x86_64-12.2.0-release-posix-seh-msvcrt-rt_v10-rev2.7z` 进行下载。

下载完成后我们可以找个位置存放，比如我放到了：`E:\Program Files\mingw64`

然后打开环境变量配置，在Path加入：`E:\Program Files\mingw64\bin` 别漏掉最后面的bin目录哦

## 创建Rust项目

我使用的是Clion加Rust插件，当然如果没有买jetbrains产品的话也可以使用Idea社区版然后安装rust插件。

安装完Rust插件之后，新建项目就会有Rust选项，选择工具链位置，如果已经弹出来那就可以不用自己手选，如果是没有的话，应该是在：`C:\Users\你的用户名\.cargo\bin`

下面有个标准库不知道有没有用，反正我点了下面的下载按钮之后就弹出来了。

创建完成后项目有一个main.rs：

```rust
fn main() {
    println!("Hello, world!");
}
```

点击运行成功打印：`Hello, world!`

## Cargo使用

如果在终端运行的话，只需要执行：`cargo run`

如果需要构建可执行文件只需要：`cargo build`，如果需要优化可执行文件就加上选项：`cargo build --release`

## Hello World

首先看看上面提到的代码：

```rust
fn main() {
    println!("Hello 🌍!");
}
```

* 函数通过fn引入。
* 像在C和c++中一样，块由花括号分隔。
* main函数是程序的入口点。
* Rust有卫生宏，`println!`就是一个例子。
* Rust字符串是UTF-8编码的，可以包含任何Unicode字符。

### 简单示例

```rust
fn main() {              // 程序入口
    let mut x: i32 = 6;  // 可变变量绑定
    print!("{x}");       // 使用宏打印，类似printf
    while x != 1 {       // 表达式不需要圆括号
        if x % 2 == 0 {  // 像其他语言一样进行数学运算
            x = x / 2;
        } else {
            x = 3 * x + 1;
        }
        print!(" -> {x}");
    }
    println!();
}
```

## 为什么使用Rust

* 编译时内存安全。
* 缺乏未定义的运行时行为。
* 现代语言特征。

### 编译时保证

编译时的静态内存管理：

* 没有未初始化的变量。
* 基本上没有内存泄漏。
* 没有double-frees。
* 没有use-after-free。
* 没有空指针。
* 没有被遗忘的锁定互斥对象。
* 线程之间没有数据争用。
* 没有迭代器失效。

从技术上讲，在(安全的)Rust中产生内存泄漏是可能的。`Box::leak`方法允许从Box中获取原始引用，然后在不运行析构函数的情况下删除Box。这可以用于获得运行时初始化和运行时大小的静态变量。或者简单地说，`std::mem::forget`函数，它使编译器忘记一个值，这意味着析构函数永远不会运行。在安全的Rust中有许多其他的方法来创建泄漏，但是为了本课程的目的，没有内存泄漏应该被理解为几乎没有意外的内存泄漏。

### 运行时保证

运行时没有未定义的行为:

* 数组访问是边界检查。
* 定义了整数溢出。

### 现代特性

Rust是在过去40年里积累的经验。

### 语言特性

* 枚举和模式匹配。
* 泛型。
* 没有开销的FFI。

### 工具

* 非常良好的编译器错误提示。
* 内置依赖管理器。
* 内置测试支持。

## 基础语法

Rust的很多语法对您来说都是熟悉的C或c++语法：

* 块和范围由花括号分隔。
* 行注释使用 `//` 开始，块注释使用： `/* ... */`
* 关键字如if和while的作用相同。
* 变量赋值用`=`，比较用`==`。

### 基础类型

| 分类 | 类型 | 字面量 |
| - | - | - |
| 带符号整数 | i8, i16, i32, i64, i128, isize | -10, 0, 1_000, 123i64 |
| 无符号整数 | u8, u16, u32, u64, u128, usize | 0, 123, 10u16 |
| 浮点数 | f32, f64 | 3.14, -10.0e20, 2f32 |
| 字符串 | &str | "foo", `r#"\\"#` |
| Unicode标量值 | char | 'a', 'α', '∞' |
| 字节字符串 | `&[u8]` | b"abc", `br#" " "#` |
| 布尔值 | bool | true, false |

类型的宽度如下所示：

* iN、uN和fN的宽度为N位
* isize 和 usize 是指针的宽度
* char 是 32 位宽
* bool 是 8 位宽

### 复合类型

| 分类 | 类型 | 字面量 |
| - | - | - |
| 数组 | [T; N] | [20, 30, 40], [0; 3] |
| 元组 | (T1, T2, T3, ...) | ('x', 1.2, 0) |

数组分配和访问:

```rust
fn main() {
    let mut a: [i8; 10] = [42; 10];
    a[5] = 0;
    println!("a: {:?}", a);
}
```

元组分配和访问:

```rust
fn main() {
    let t: (i8, bool) = (7, true);
    println!("1st index: {}", t.0);
    println!("2nd index: {}", t.1);
}
```

### 引用

类似C++，Rust这样引用：

```rust
fn main() {
    let mut x: i32 = 10;
    let ref_x: &mut i32 = &mut x;
    *ref_x = 20;
    println!("x: {x}");
}
```

和C++不一样的地方：

* 在给`ref_x`赋值时，我们必须解引用它，类似于C指针
* Rust在某些情况下会自动解引用，特别是在调用方法时(尝试`count_ones`)。

#### 悬空引用

Rust将静态禁止悬空引用

```rust
fn main() {
    let ref_x: &i32;
    {
        let x: i32 = 10;
        ref_x = &x; // 报错：borrowed value does not live long enough
    }
    println!("ref_x: {ref_x}");
}
```

* 引用被称为借用它所引用的值。
* Rust正在跟踪所有引用的生命周期，以确保它们的生存时间足够长。
* 当我们讲到所有权时，我们会更多地讨论借用。

### 切片/Slices

切片为您提供了一个更大集合的视图

```rust
fn main() {
    let a: [i32; 6] = [10, 20, 30, 40, 50, 60];
    println!("a: {a:?}");

    let s: &[i32] = &a[2..4];
    println!("s: {s:?}");
}
```

* 切片从切片类型中借用数据
* 提问:如果修改`a[3]`会怎样

#### String vs str

现在我们可以这样理解Rust中的两种字符串类型:

```rust
fn main() {
    let s1: &str = "Hello";
    println!("s1: {s1}");

    let mut s2: String = String::from("Hello ");
    println!("s2: {s2}");
    s2.push_str(s1);
    println!("s2: {s2}");
}
```

Rust 术语：

* `&str`是对字符串片的不可变引用。
* `String`是可变字符串缓冲区。

### 函数/Functions

Rust版的著名的[FizzBuzz](https://en.wikipedia.org/wiki/Fizz_buzz)面试问题：

```rust
fn main() {
    fizzbuzz_to(20);   // 在下面定义，不需要在前面声明
}

fn is_divisible_by(lhs: u32, rhs: u32) -> bool {
    if rhs == 0 {
        return false;  // 边界情况，提前返回
    }
    lhs % rhs == 0     // 最后一个表达式是返回值
}

fn fizzbuzz(n: u32) -> () {  // 没有返回值意味着返回单元类型 `()`
    match (is_divisible_by(n, 3), is_divisible_by(n, 5)) {
        (true,  true)  => println!("fizzbuzz"),
        (true,  false) => println!("fizz"),
        (false, true)  => println!("buzz"),
        (false, false) => println!("{n}"),
    }
}

fn fizzbuzz_to(n: u32) {  // `-> ()` 通常省略
    for n in 1..=n {
        fizzbuzz(n);
    }
}
```

#### 方法/Methods

Rust有方法，它们只是与特定类型相关联的函数。方法的第一个参数是与其关联的类型的实例：

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn inc_width(&mut self, delta: u32) {
        self.width += delta;
    }
}

fn main() {
    let mut rect = Rectangle { width: 10, height: 5 };
    println!("old area: {}", rect.area());
    rect.inc_width(5);
    println!("new area: {}", rect.area());
}
```

#### 函数重载

Rust不支持重载:

* 每个函数都只有一个实现:
  * 总是接受固定数量的参数。
  * 始终接受一组参数类型。
* 不支持默认值:
  * 所有调用的地方的参数个数相同。
  * 宏有时被用作一种替代方法。

然而，函数参数可以是通用的：

```rust
fn pick_one<T>(a: T, b: T) -> T {
    if std::process::id() % 2 == 0 { a } else { b }
}

fn main() {
    println!("coin toss: {}", pick_one("heads", "tails"));
    println!("cash prize: {}", pick_one(500, 1000));
}
```

## 练习1

在这些练习中，我们将探索Rust的两个部分:

* 类型之间的隐式转换。
* 数组和 for 循环。

### 隐式转型

Rust不会自动进行类型之间的隐式转换(与c++不同)。你可以在这样的程序中看到这一点：

```rust
fn multiply(x: i16, y: i16) -> i16 {
    x * y
}

fn main() {
    let x: i8 = 15;
    let y: i16 = 1000;

    println!("{x} * {y} = {}", multiply(x, y));
                                     // ^  expected `i16`, found `i8`
}
```

Rust整数类型都实现了`From<T>`和`Into<T>`traits(翻译：特性)，以便我们在它们之间进行转换。`From<T>` trait有一个`From()`方法，类似地，`Into<T>` trait有一个`Into()`方法。实现这些特征是一种类型表示它可以转换为另一种类型的方式。

标准库有一个用于`i16`的`From<i8>`实现，这意味着我们可以通过调用`i16::from(x)`将类型为`i8`的变量x转换为`i16`。或者，更简单一点，使用`x.into()`，因为i16实现的`From<i8>`会自动为`i8`创建`Into<i16>`的实现。

1. 执行上面的程序并查看编译器错误。(报错我在上面标出来了)
2. 更新上面的代码以使用`into()`进行转换。
3. 将x和y的类型更改为其他类型(例如f32, bool, i128)，以查看哪些类型可以转换为其他类型。尝试将小类型转换为大类型，或者反过来转换。检查[标准库文档](https://doc.rust-lang.org/std/convert/trait.From.html)，查看是否为您检查的对实现了`From<T>`。

### 数组和for循环

我们看到数组可以这样声明:

```rust
let array = [10, 20, 30];
```

你可以通过 `{:?}` 来打印数组:

```rust
fn main() {
    let array = [10, 20, 30];
    println!("array: {array:?}");
}
```

Rust允许您使用`for`关键字迭代数组和范围等内容：

```rust
fn main() {
    let array = [10, 20, 30];
    print!("Iterating over array:");
    for n in array {
        print!(" {n}");
    }
    println!();

    print!("Iterating over range:");
    for i in 0..3 {
        print!(" {}", array[i]);
    }
    println!();
}
```

使用上面的方法来写一个函数`pretty_print`，它可以漂亮地打印一个矩阵，以及一个函数transpose，它将转置一个矩阵(将行转换为列)。

```c
| 1 2 3 |    | 1 4 7 |
| 4 5 6 | => | 2 5 8 |
| 7 8 9 |    | 3 6 9 |
```

硬编码两个函数操作3x3矩阵。

复制下面的代码到 [https://play.rust-lang.org/](https://play.rust-lang.org/) 并且实现功能

```rust
// TODO: 在完成实现后删除它。
#![allow(unused_variables, dead_code)]

fn transpose(matrix: [[i32; 3]; 3]) -> [[i32; 3]; 3] {
    unimplemented!()
}

fn pretty_print(matrix: &[[i32; 3]; 3]) {
    unimplemented!()
}

fn main() {
    let matrix = [
        [101, 102, 103], // <-- 该注释保证rustfmt让代码换行
        [201, 202, 203],
        [301, 302, 303],
    ];

    println!("matrix:");
    pretty_print(&matrix);

    let transposed = transpose(matrix);
    println!("transposed:");
    pretty_print(&transposed);
}
```

这是我的作业答案，聪明的小伙伴可以看看有没有值得改进的地方：

```rust
fn transpose(matrix: [[i32; 3]; 3]) -> [[i32; 3]; 3] {
    let mut new_matrix: [[i32; 3]; 3] = [[0; 3]; 3];
    for i in 0..3 {
        for j in 0..3 {
            new_matrix[j][i] = matrix[i][j]
        }
    }
    new_matrix
}

fn pretty_print(matrix: &[[i32; 3]; 3]) {
    for i in 0..3 {
        print!("|");
        for j in 0..3 {
            print!(" {} ", matrix[i][j])
        }
        println!("|");
    }
}
```

#### 附加题

你可以使用`&[i32]`片代替硬编码的 3 x 3 矩阵作为参数和返回类型吗?对于二维片中的片，类似于`&[&[i32]]`。为什么或为什么不?

有关生产质量实现，请参阅[`ndarray` crate](https://docs.rs/ndarray/)。
