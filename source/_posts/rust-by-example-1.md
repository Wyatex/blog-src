---
title: 通过例子学 Rust
date: 2023-03-25 16:04:58
tags:
- Rust
- 学习笔记
categories: Rust
---

谷歌的教程没有中文而且感觉太难了点，还是试试这个教程吧orz

<!-- more -->

## HelloWorld

```rust
// 这是注释内容，将会被编译器忽略掉
// 可以单击那边的按钮 "Run" 来测试这段代码 ->
// 若想用键盘操作，可以使用快捷键 "Ctrl + Enter" 来运行
// 这段代码支持编辑，你可以自由地修改代码！
// 通过单击 "Reset" 按钮可以使代码恢复到初始状态 ->
// 这是主函数
fn main() {
    // 调用编译生成的可执行文件时，这里的语句将被运行。
    // 将文本打印到控制台
    println!("Hello World!");
}
```

`println!` 是一个[**宏**][macros]（macros），可以将文本输出到控制台（console）。

使用 Rust 的编译器 `rustc` 可以从源程序生成可执行文件：

```bash
rustc hello.rs
```

使用 `rustc` 编译后将得到可执行文件 `hello`。

```bash
$ ./hello
Hello World!
```

### 注释

注释对任何程序都不可缺少，同样 Rust 支持几种不同的注释方式。

- **普通注释**，其内容将被编译器忽略掉：
  - `// 单行注释，注释内容直到行尾。`
  - `/* 块注释，注释内容一直到结束分隔符。 */`
- **文档注释**，其内容将被解析成 HTML 帮助[文档][docs]：
  - `/// 为接下来的项生成帮助文档。`
  - `//! 为注释所属于的项（译注：如 crate、模块或函数）生成帮助文档。`

### 格式化输出

打印操作由 [`std::fmt`][fmt] 里面所定义的一系列[宏][macros]来处理，包括：

- `format!`：将格式化文本写到[字符串][string]。
- `print!`：与 `format!` 类似，但将文本输出到控制台（io::stdout）。
- `println!`: 与 `print!` 类似，但输出结果追加一个换行符。
- `eprint!`：与 `print!` 类似，但将文本输出到标准错误（io::stderr）。
- `eprintln!`：与 `eprint!` 类似，但输出结果追加一个换行符。

这些宏都以相同的做法解析文本。有个额外优点是格式化的正确性会在编译时检查。

```rust,editable,ignore,mdbook-runnable
fn main() {
    // 通常情况下，`{}` 会被任意变量内容所替换。
    // 变量内容会转化成字符串。
    println!("{} days", 31);
    // 不加后缀的话，31 就自动成为 i32 类型。
    // 你可以添加后缀来改变 31 的类型（例如使用 31i64 声明 31 为 i64 类型）。
    // 用变量替换字符串有多种写法。
    // 比如可以使用位置参数。
    println!("{0}, this is {1}. {1}, this is {0}", "Alice", "Bob");
    // 可以使用命名参数。
    println!("{subject} {verb} {object}",
             object="the lazy dog",
             subject="the quick brown fox",
             verb="jumps over");
    // 可以在 `:` 后面指定特殊的格式。
    println!("{} of {:b} people know binary, the other half don't", 1, 2);
    // 你可以按指定宽度来右对齐文本。
    // 下面语句输出 "     1"，5 个空格后面连着 1。
    println!("{number:>width$}", number=1, width=6);
    // 你可以在数字左边补 0。下面语句输出 "000001"。
    println!("{number:>0width$}", number=1, width=6);
    // println! 会检查使用到的参数数量是否正确。
    println!("My name is {0}, {1} {0}", "Bond");
    // 改正 ^ 补上漏掉的参数："James"
    // 创建一个包含单个 `i32` 的结构体（structure）。命名为 `Structure`。
    #[allow(dead_code)]
    struct Structure(i32);
    // 但是像结构体这样的自定义类型需要更复杂的方式来处理。
    // 下面语句无法运行。
    println!("This struct `{}` won't print...", Structure(3));
    // 改正 ^ 注释掉此行。
}
```

[`std::fmt`][fmt] 包含多种 [`trait`][traits]（特质）来控制文字显示，其中重要的两种 trait 的基本形式如下：

- `fmt::Debug`：使用 `{:?}` 标记。格式化文本以供调试使用。
- `fmt::Display`：使用 `{}` 标记。以更优雅和友好的风格来格式化文本。

上例使用了 `fmt::Display`，因为标准库提供了那些类型的实现。若要打印自定义类型的文本，需要更多的步骤。

### 调试（Debug）

所有的类型，若想用 `std::fmt` 的格式化打印，都要求实现至少一个可打印的 `traits`。仅有一些类型提供了自动实现，比如 `std` 库中的类型。所有其他类型都**必须**手动实现。

`fmt::Debug` 这个 `trait` 使这项工作变得相当简单。所有类型都能推导（`derive`，**即自动创建**）`fmt::Debug` 的实现。但是 `fmt::Display` 需要手动实现。

```rust
// 这个结构体不能使用 `fmt::Display` 或 `fmt::Debug` 来进行打印。
struct UnPrintable(i32);
// `derive` 属性会自动创建所需的实现，使这个 `struct` 能使用 `fmt::Debug` 打印。
#[derive(Debug)]
struct DebugPrintable(i32);
```

所有 `std` 库类型都天生可以使用 `{:?}` 来打印：

```rust,editable
// 推导 `Structure` 的 `fmt::Debug` 实现。
// `Structure` 是一个包含单个 `i32` 的结构体。
#[derive(Debug)]
struct Structure(i32);
// 将 `Structure` 放到结构体 `Deep` 中。然后使 `Deep` 也能够打印。
#[derive(Debug)]
struct Deep(Structure);
fn main() {
    // 使用 `{:?}` 打印和使用 `{}` 类似，就是使用fmt::Debug来打印。
    println!("{:?} months in a year.", 12);
    println!("{1:?} {0:?} is the {actor:?} name.",
             "Slater",
             "Christian",
             actor="actor's");
    // `Structure` 也可以打印！
    println!("Now {:?} will print!", Structure(3));
    
    // 使用 `derive` 的一个问题是不能控制输出的形式。
    // 假如我只想展示一个 `7` 怎么办？
    println!("Now {:?} will print!", Deep(Structure(7)));
}
```

所以 `fmt::Debug` 确实使这些内容可以打印，但是牺牲了一些美感。Rust 也通过 `{:#?}` 提供了 “美化打印” 的功能：

```rust,editable
#[derive(Debug)]
struct Person<'a> {
    name: &'a str,
    age: u8
}
fn main() {
    let name = "Peter";
    let age = 27;
    let peter = Person { name, age };
    // 美化打印
    println!("{:#?}", peter);
}
```

你可以通过手动实现 `fmt::Display` 来控制显示效果。

### 格式化

我们已经看到，格式化的方式是通过**格式字符串**来指定的：

- `format!("{}", foo)` -> `"3735928559"`
- `format!("0x{:X}", foo)` ->
  [`"0xDEADBEEF"`][deadbeef]
- `format!("0o{:o}", foo)` -> `"0o33653337357"`

根据使用的**参数类型**是 `X`、`o` 还是**未指定**，同样的变量（`foo`）能够格式化成不同的形式。

这个格式化的功能是通过 trait 实现的，每种参数类型都对应一种 trait。最常见的格式化 trait 就是 `Display`，它可以处理参数类型为未指定的情况，比如 `{}`。

```rust,editable
use std::fmt::{self, Formatter, Display};
struct City {
    name: &'static str,
    // 纬度
    lat: f32,
    // 经度
    lon: f32,
}
impl Display for City {
    // `f` 是一个缓冲区（buffer），此方法必须将格式化后的字符串写入其中
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let lat_c = if self.lat >= 0.0 { 'N' } else { 'S' };
        let lon_c = if self.lon >= 0.0 { 'E' } else { 'W' };
        // `write!` 和 `format!` 类似，但它会将格式化后的字符串写入
        // 一个缓冲区（即第一个参数f）中。
        write!(f, "{}: {:.3}°{} {:.3}°{}",
               self.name, self.lat.abs(), lat_c, self.lon.abs(), lon_c)
    }
}
#[derive(Debug)]
struct Color {
    red: u8,
    green: u8,
    blue: u8,
}
fn main() {
    for city in [
        City { name: "Dublin", lat: 53.347778, lon: -6.259722 },
        City { name: "Oslo", lat: 59.95, lon: 10.75 },
        City { name: "Vancouver", lat: 49.25, lon: -123.1 },
    ].iter() {
        println!("{}", *city);
    }
    for color in [
        Color { red: 128, green: 255, blue: 90 },
        Color { red: 0, green: 3, blue: 254 },
        Color { red: 0, green: 0, blue: 0 },
    ].iter() {
        // 在添加了针对 fmt::Display 的实现后，请改用 {} 检验效果。
        println!("{:?}", *color)
    }
}
```

在 [`fmt::fmt`][fmt] 文档中可以查看[格式化 traits 一览表][fmt_traits]和它们的参数类型。

## 原生类型

Rust 提供了多种原生类型（`primitives`），包括：

### 标量类型（scalar type）

- 有符号整数（signed integers）：`i8`、`i16`、`i32`、`i64`、`i128` 和 `isize`（指针宽度）
- 无符号整数（unsigned integers）： `u8`、`u16`、`u32`、`u64`、`u128` 和 `usize`（指针宽度）
- 浮点数（floating point）： `f32`、`f64`
- `char`（字符）：单个 Unicode 字符，如 `'a'`，`'α'` 和 `'∞'`（每个都是 4 字节）
- `bool`（布尔型）：只能是 `true` 或 `false`
- 单元类型（unit type）：`()`。其唯一可能的值就是 `()` 这个空元组

尽管单元类型的值是个元组，它却并不被认为是复合类型，因为并不包含多个值。

### 复合类型（compound type）

- 数组（array）：如 `[1, 2, 3]`
- 元组（tuple）：如 `(1, true)`

变量都能够显式地给出**类型说明**（type annotation）。数字还可以通过**后缀**（suffix）或**默认方式**来声明类型。整型默认为 `i32` 类型，浮点型默认为 `f64`类型。注意 Rust 还可以根据上下文来推断（infer）类型（译注：比如一个未声明类型整数和 `i64` 的整数相加，则该整数会自动推断为 `i64` 类型。仅当根据环境无法推断时，才按默认方式取整型数值为 `i32`，浮点数值为 `f64`）。

```rust,editable,ignore,mdbook-runnable
fn main() {
    // 变量可以给出类型说明。
    let logical: bool = true;
    let a_float: f64 = 1.0;  // 常规说明
    let an_integer   = 5i32; // 后缀说明
    // 否则会按默认方式决定类型。
    let default_float   = 3.0; // `f64`
    let default_integer = 7;   // `i32`
    // 类型也可根据上下文自动推断。
    let mut inferred_type = 12; // 根据下一行的赋值推断为 i64 类型
    inferred_type = 4294967296i64;
    // 可变的（mutable）变量，其值可以改变。
    let mut mutable = 12; // Mutable `i32`
    mutable = 21;
    // 报错！变量的类型并不能改变。
    mutable = true;
    // 但可以用遮蔽（shadow）来覆盖前面的变量。
    let mutable = true;
}
```

### 字面量和运算符

整数 `1`、浮点数 `1.2`、字符 `'a'`、字符串 `"abc"`、布尔值 `true` 和单元类型 `()` 可以用数字、文字或符号之类的 “字面量”（literal）来表示。

另外，通过加前缀 `0x`、`0o`、`0b`，数字可以用十六进制、八进制或二进制记法表示。

为了改善可读性，可以在数值字面量中插入下划线，比如：`1_000` 等同于 `1000`，`0.000_001` 等同于 `0.000001`。

我们需要把字面量的类型告诉编译器。如前面学过的，我们使用 `u32` 后缀来表明字面量是一个 32 位无符号整数，`i32` 后缀表明字面量是一个 32 位有符号整数。

[Rust][rust op-prec] 提供了一系列的运算符（operator），它们的优先级和[类 C 语言][op-prec]类似。（译注：类 C 语言包括 C/C++、Java、PHP 等语言）

```rust,editable
fn main() {
    // 整数相加
    println!("1 + 2 = {}", 1u32 + 2);
    // 整数相减
    println!("1 - 2 = {}", 1i32 - 2);
    // 试一试 ^ 尝试将 `1i32` 改为 `1u32`，体会为什么类型声明这么重要
    // 短路求值的布尔逻辑
    println!("true AND false is {}", true && false);
    println!("true OR false is {}", true || false);
    println!("NOT true is {}", !true);
    // 位运算
    println!("0011 AND 0101 is {:04b}", 0b0011u32 & 0b0101);
    println!("0011 OR 0101 is {:04b}", 0b0011u32 | 0b0101);
    println!("0011 XOR 0101 is {:04b}", 0b0011u32 ^ 0b0101);
    println!("1 << 5 is {}", 1u32 << 5);
    println!("0x80 >> 2 is 0x{:x}", 0x80u32 >> 2);
    // 使用下划线改善数字的可读性！
    println!("One million is written as {}", 1_000_000u32);
}
```

### 元组

元组是一个可以包含各种类型值的组合。元组使用括号 `()` 来构造（construct），而每个元组自身又是一个类型标记为 `(T1, T2, ...)` 的值，其中 `T1`、`T2` 是每个元素的类型。函数可以使用元组来返回多个值，因为元组可以拥有任意多个值。

```rust,editable
// 元组可以充当函数的参数和返回值
fn reverse(pair: (i32, bool)) -> (bool, i32) {
    // 可以使用 `let` 把一个元组的成员绑定到一些变量
    let (integer, boolean) = pair;
    (boolean, integer)
}
// 在 “动手试一试” 的练习中要用到下面这个结构体。
#[derive(Debug)]
struct Matrix(f32, f32, f32, f32);
fn main() {
    // 包含各种不同类型的元组
    let long_tuple = (1u8, 2u16, 3u32, 4u64,
                      -1i8, -2i16, -3i32, -4i64,
                      0.1f32, 0.2f64,
                      'a', true);
    // 通过元组的下标来访问具体的值
    println!("long tuple first value: {}", long_tuple.0);
    println!("long tuple second value: {}", long_tuple.1);
    // 元组也可以充当元组的元素
    let tuple_of_tuples = ((1u8, 2u16, 2u32), (4u64, -1i8), -2i16);
    // 元组可以打印
    println!("tuple of tuples: {:?}", tuple_of_tuples);
    // 但很长的元组无法打印
    // let too_long_tuple = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13);
    // println!("too long tuple: {:?}", too_long_tuple);
    // 试一试 ^ 取消上面两行的注释，阅读编译器给出的错误信息。
    let pair = (1, true);
    println!("pair is {:?}", pair);
    println!("the reversed pair is {:?}", reverse(pair));
    // 创建单元素元组需要一个额外的逗号，这是为了和被括号包含的字面量作区分。
    println!("one element tuple: {:?}", (5u32,));
    println!("just an integer: {:?}", (5u32));
    // 元组可以被解构（deconstruct），从而将值绑定给变量
    let tuple = (1, "hello", 4.5, true);
    let (a, b, c, d) = tuple;
    println!("{:?}, {:?}, {:?}, {:?}", a, b, c, d);
    let matrix = Matrix(1.1, 1.2, 2.1, 2.2);
    println!("{:?}", matrix)
}
```

### 数组和切片

数组（array）是一组拥有相同类型 `T` 的对象的集合，在内存中是连续存储的。数组使用中括号 `[]` 来创建，且它们的大小在编译时会被确定。数组的类型标记为 `[T; length]`（译注：`T` 为元素类型，`length` 表示数组大小）。

切片（slice）类型和数组类似，但其大小在编译时是不确定的。相反，切片是一个双字对象（two-word object），第一个字是一个指向数据的指针，第二个字是切片的长度。这个 “字” 的宽度和 usize 相同，由处理器架构决定，比如在 x86-64 平台上就是 64 位。slice 可以用来借用数组的一部分。slice 的类型标记为 `&[T]`。

```rust,editable,ignore,mdbook-runnable
use std::mem;
// 此函数借用一个 slice
fn analyze_slice(slice: &[i32]) {
    println!("first element of the slice: {}", slice[0]);
    println!("the slice has {} elements", slice.len());
}
fn main() {
    // 定长数组（类型标记是多余的）
    let xs: [i32; 5] = [1, 2, 3, 4, 5];
    // 所有元素可以初始化成相同的值
    let ys: [i32; 500] = [0; 500];
    // 下标从 0 开始
    println!("first element of the array: {}", xs[0]);
    println!("second element of the array: {}", xs[1]);
    // `len` 返回数组的大小
    println!("array size: {}", xs.len());
    // 数组是在栈中分配的
    println!("array occupies {} bytes", mem::size_of_val(&xs));
    // 数组可以自动被借用成为 slice
    println!("borrow the whole array as a slice");
    analyze_slice(&xs);
    // slice 可以指向数组的一部分
    println!("borrow a section of the array as a slice");
    analyze_slice(&ys[1 .. 4]);
    // 越界的下标会引发致命错误（panic）
    println!("{}", xs[5]);
}
```

## 自定义类型

Rust 自定义数据类型主要是通过下面这两个关键字来创建：

- `struct`： 定义一个结构体（structure）
- `enum`： 定义一个枚举类型（enumeration）

而常量（constant）可以通过 `const` 和 `static` 关键字来创建。

### 结构体

结构体（structure，缩写成 struct）有 3 种类型，使用 `struct` 关键字来创建：

- 元组结构体（tuple struct），事实上就是具名元组而已。
- 经典的 [C 语言风格结构体][c_struct]（C struct）。
- 单元结构体（unit struct），不带字段，在泛型中很有用。

```rust,editable
#[derive(Debug)]
struct Person {
    name: String,
    age: u8,
}
// 单元结构体
struct Unit;
// 元组结构体
struct Pair(i32, f32);
// 带有两个字段的结构体
struct Point {
    x: f32,
    y: f32,
}
// 结构体可以作为另一个结构体的字段
#[allow(dead_code)]
struct Rectangle {
    // 可以在空间中给定左上角和右下角在空间中的位置来指定矩形。
    top_left: Point,
    bottom_right: Point,
}
fn main() {
    // 使用简单的写法初始化字段，并创建结构体
    let name = String::from("Peter");
    let age = 27;
    let peter = Person { name, age };
    // 以 Debug 方式打印结构体
    println!("{:?}", peter);
    // 实例化结构体 `Point`
    let point: Point = Point { x: 10.3, y: 0.4 };
    // 访问 point 的字段
    println!("point coordinates: ({}, {})", point.x, point.y);
    // 使用结构体更新语法创建新的 point，
    // 这样可以用到之前的 point 的字段
    let bottom_right = Point { x: 5.2, ..point };
    // `bottom_right.y` 与 `point.y` 一样，因为这个字段就是从 `point` 中来的
    println!("second point: ({}, {})", bottom_right.x, bottom_right.y);
    // 使用 `let` 绑定来解构 point
    let Point { x: left_edge, y: top_edge } = point;
    let _rectangle = Rectangle {
        // 结构体的实例化也是一个表达式
        top_left: Point { x: left_edge, y: top_edge },
        bottom_right: bottom_right,
    };
    // 实例化一个单元结构体
    let _unit = Unit;
    // 实例化一个元组结构体
    let pair = Pair(1, 0.1);
    // 访问元组结构体的字段
    println!("pair contains {:?} and {:?}", pair.0, pair.1);
    // 解构一个元组结构体
    let Pair(integer, decimal) = pair;
    println!("pair contains {:?} and {:?}", integer, decimal);
}
```

### 枚举

`enum` 关键字允许创建一个从数个不同取值中选其一的枚举类型（enumeration）。任何一个在 `struct` 中合法的取值在 `enum` 中也合法。

```rust,editable
// 该属性用于隐藏对未使用代码的警告。
#![allow(dead_code)]
// 创建一个 `enum`（枚举）来对 web 事件分类。注意变量名和类型共同指定了 `enum`
// 取值的种类：`PageLoad` 不等于 `PageUnload`，`KeyPress(char)` 不等于
// `Paste(String)`。各个取值不同，互相独立。
enum WebEvent {
    // 一个 `enum` 可以是单元结构体（称为 `unit-like` 或 `unit`），
    PageLoad,
    PageUnload,
    // 或者一个元组结构体，
    KeyPress(char),
    Paste(String),
    // 或者一个普通的结构体。
    Click { x: i64, y: i64 }
}
// 此函数将一个 `WebEvent` enum 作为参数，无返回值。
fn inspect(event: WebEvent) {
    match event {
        WebEvent::PageLoad => println!("page loaded"),
        WebEvent::PageUnload => println!("page unloaded"),
        // 从 `enum` 里解构出 `c`。
        WebEvent::KeyPress(c) => println!("pressed '{}'.", c),
        WebEvent::Paste(s) => println!("pasted \"{}\".", s),
        // 把 `Click` 解构给 `x` and `y`。
        WebEvent::Click { x, y } => {
            println!("clicked at x={}, y={}.", x, y);
        },
    }
}
fn main() {
    let pressed = WebEvent::KeyPress('x');
    // `to_owned()` 从一个字符串切片中创建一个具有所有权的 `String`。
    let pasted  = WebEvent::Paste("my text".to_owned());
    let click   = WebEvent::Click { x: 20, y: 80 };
    let load    = WebEvent::PageLoad;
    let unload  = WebEvent::PageUnload;
    inspect(pressed);
    inspect(pasted);
    inspect(click);
    inspect(load);
    inspect(unload);
}
```

#### 类型别名

若使用类型别名，则可以通过其别名引用每个枚举变量。当枚举的名称太长或者太一般化，且你想要对其重命名，那么这对你会有所帮助。

```rust,editable
enum VeryVerboseEnumOfThingsToDoWithNumbers {
    Add,
    Subtract,
}
// 创建一个类型别名
type Operations = VeryVerboseEnumOfThingsToDoWithNumbers;
fn main() {
    // 我们可以通过别名引用每个枚举变量，避免使用又长又不方便的枚举名字
    let x = Operations::Add;
}
```

最常见的情况就是在 `impl` 块中使用 `Self` 别名。

```rust,editable
enum VeryVerboseEnumOfThingsToDoWithNumbers {
    Add,
    Subtract,
}
impl VeryVerboseEnumOfThingsToDoWithNumbers {
    fn run(&self, x: i32, y: i32) -> i32 {
        match self {
            Self::Add => x + y,
            Self::Subtract => x - y,
        }
    }
}
```

该功能已在 Rust 中稳定下来， 可以阅读 [stabilization report][aliasreport] 来了解更多有关枚举和类型别名的知识。
