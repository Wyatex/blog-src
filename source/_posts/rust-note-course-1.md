---
title: Rust圣经学习笔记（1）
date: 2024-01-03 17:05:45
tags:
  - Rust
  - 学习笔记
categories: Rust
---

记录一下学习 course.rs 过程中容易忘记的点

## 解构式赋值

```rust
struct Struct {
    e: i32
}

fn main() {
    let (a, b, c, d, e);

    (a, b) = (1, 2);
    // _ 代表匹配一个值，但是我们不关心具体的值是什么，因此没有使用一个变量名而是使用了 _
    [c, .., d, _] = [1, 2, 3, 4, 5];
    Struct { e, .. } = Struct { e: 5 };

    assert_eq!([1, 2, 1, 4, 5], [a, b, c, d, e]);
}
```

## 基本类型

### 数值类型

#### 整数

| 长度       | 有符号类型 | 无符号类型 |
| ---------- | ---------- | ---------- |
| 8 位       | `i8`       | `u8`       |
| 16 位      | `i16`      | `u16`      |
| 32 位      | `i32`      | `u32`      |
| 64 位      | `i64`      | `u64`      |
| 128 位     | `i128`     | `u128`     |
| 视架构而定 | `isize`    | `usize`    |

类型定义的形式统一为：**有无符号 + 类型大小(位数)**。

整形字面量可以用下表的形式书写：

| 数字字面量          | 示例          |
| ------------------- | ------------- |
| 十进制              | `98_222`      |
| 十六进制            | `0xff`        |
| 八进制              | `0o77`        |
| 二进制              | `0b1111_0000` |
| 字节 (仅限于  `u8`) | `b'A'`        |

整型溢出：

在当使用 --release 参数进行 release 模式构建时，Rust 不检测溢出。

要显式处理可能的溢出，可以使用标准库针对原始数字类型提供的这些方法：

- 使用 `wrapping_*` 方法在所有模式下都按照补码循环溢出规则处理，例如 `wrapping_add`
- 如果使用 `checked_*` 方法时发生溢出，则返回 None 值
- 使用 `overflowing_*` 方法返回该值和一个指示是否存在溢出的布尔值
- 使用 `saturating_*` 方法使值达到最小值或最大值

#### 浮点

在 Rust 中浮点类型数字也有两种基本类型： `f32` 和 `f64`，分别为 32 位和 64 位大小。默认浮点类型是 `f64`。

```rust
fn main() {
    let x = 2.0; // f64

    let y: f32 = 3.0; // f32
}
```

浮点数陷阱:

- 浮点数往往是你想要数字的近似表达
- 浮点数在某些特性上是反直觉的，比如某些情况不能比较，因为 `f32` ， `f64` 上的比较运算实现的是 `std::cmp::PartialEq` 特征(类似其他语言的接口)，但是并没有实现 `std::cmp::Eq` 特征，所以 `HashMap` 不能以浮点作为 key。

#### NaN

所有跟 `NaN` 交互的操作，都会返回一个 `NaN`，而且 NaN 不能用来比较。可以使用 `is_nan()` 等方法来判断一个数值是否是 `NaN`

#### 序列(Range)

Rust 中序列(Range)的定义形式为：

```rust
let x = 1..=5; // 包含 1 到 5
let y = 1..10; // 包含 1 到 9
let z = 'a'..='z'; // 包含字符 a 到 z
```

序列的类型为 `std::ops::Range`，它实现了 `Iterator` 特征，因此可以用 `for` 循环来

### 字符

```rust
fn main() {
    let c = 'z';
    let z = 'ℤ';
    let g = '国';
    let heart_eyed_cat = '😻';
}
```

Rust 的字符不仅仅是 ASCII，所有的 Unicode 值都可以作为 Rust 字符，包括单个的中文、日文、韩文、emoji 表情符号等等。

由于 Unicode 都是 4 个字节编码，因此字符类型也是占用 4 个字节

### 语句

if 和 match 表达式可以作为值，赋值给变量

```rust
let a = if true {
    1
} else {
    2
};
// 类似三元运算符写成一行
let b = if x % 2 == 1 { "odd" } else { "even" };
let c = match 1 {
    1 => 1,
    2 => 2,
    _ => 3,
};
```

## 所有权

### 拷贝

可以 `Copy` 的类型：任何基本类型的组合可以 Copy ，不需要分配内存或某种形式资源的类型是可以 Copy 的。

例子：

- 所有整数类型，比如 `u32`
- 布尔类型，`bool`，它的值是 `true` 和 `false`
- 所有浮点数类型，比如 `f64`
- 字符类型，`char`
- 元组，当且仅当其包含的类型也都是 Copy 的时候。比如，`(i32, i32)` 是 `Copy` 的，但 `(i32, String)` 就不是
- 不可变引用 &T ，但是注意: 可变引用 &mut T 是不可以 Copy 的

## 符合类型

### 字符串和切片

#### 切片

```rust
let s = String::from("hello world");

let hello = &s[0..5];
let hello1 = &s[..5]; // 缩写
let world = &s[6..11];
let len = s.len();
let helloWorld = &[0..len];  // 截取整个字符串
let helloWorld = &s[..]; // 缩写
```

切片是以字节为单位的，但是对于 UTF8 字符串来说要注意字符边界，下面会报错

```rust
let s = "中国人";
let a = &s[0..2];
println!("{}",a);
```

要操作字符串可以用以下方法：

```rust
for c in "中国人".chars() { // 字符分割
    println!("{}", c);
}
for b in "中国人".bytes() { // 字节分割
    println!("{}", b);
}
```

#### String 与 &str 的转换

`&str` 转 `String` :

- `String::from("hello,world")`
- `"hello,world".to_string()`

反过来

```rust
fn main() {
    let s = String::from("hello,world!");
    say_hello(&s);
    say_hello(&s[..]);
    say_hello(s.as_str());
}

fn say_hello(s: &str) {
    println!("{}",s);
}
```

这是基于 `deref` 隐式转换实现

#### 字符串操作

追加、插入、替换

```rust
fn main() {
    let mut s = String::from("Hello ");

    s.push_str("rust");
    println!("追加字符串 push_str() -> {}", s);
    s.push('!');
    println!("追加字符 push() -> {}", s);

    s.insert(5, ',');
    println!("插入字符 insert() -> {}", s);
    s.insert_str(6, " I like");
    println!("插入字符串 insert_str() -> {}", s);

    let new_string_replace = s.replace("rust", "RUST");
    // new_string_replace = "I like RUST. Learning RUST is my favorite!"
    let new_string_replacen = s.replacen("rust", "RUST", 1);
    // new_string_replacen = "I like RUST. Learning rust is my favorite!"
    let mut string_replace_range = String::from("I like rust!"); // 需要mut才能调用replace_range
    string_replace_range.replace_range(7..8, "R");
    // string_replace_range = "I like Rust!"
}
```

删除

```rust
fn main() {
    let mut string_pop = String::from("rust pop 中文!");
    let p1 = string_pop.pop();
    let p2 = string_pop.pop();
    dbg!(p1);
    // p1 = Some('!')
    dbg!(p2);
    // p2 = Some('文')
    dbg!(string_pop);
    // string_pop = "rust pop 中"
}
```

```rust
fn main() {
    let mut string_remove = String::from("测试remove方法");
    println!(
        "string_remove 占 {} 个字节",
        std::mem::size_of_val(string_remove.as_str())
    );
    // string_remove 占 18 个字节
    // 删除第一个汉字
    string_remove.remove(0);
    // 下面代码会发生错误
    // string_remove.remove(1);
    // 直接删除第二个汉字
    // string_remove.remove(3);
    dbg!(string_remove);
    // string_remove = "试remove方法"
}
```

```rust
fn main() {
    let mut string_truncate = String::from("测试truncate");
    // truncate —— 删除字符串中从指定位置开始到结尾的全部字符
    string_truncate.truncate(3);
    dbg!(string_truncate);
    // string_truncate = "测"
    // clear —— 清空字符串
    string_truncate.clear();
    dbg!(string_truncate);
    // string_truncate = ""
}
```

连接：

使用 `+` 或者 `+=` 连接字符串，要求右边的参数必须为字符串的切片引用（Slice）类型。其实当调用 + 的操作符时，相当于调用了 `std::string` 标准库中的 `add()` 方法，这里 `add()` 方法的第二个参数是一个引用的类型。因此我们在使用 `+` ， 必须传递切片引用类型。不能直接传递 `String` 类型。**`+` 是返回一个新的字符串，所以变量声明可以不需要 `mut` 关键字修饰。**

```rust
fn main() {
    let string_append = String::from("hello ");
    let string_rust = String::from("rust");
    // &string_rust会自动解引用为&str
    let result = string_append + &string_rust;
    let mut result = result + "!"; // `result + "!"` 中的 `result` 是不可变的
    result += "!!!";

    println!("连接字符串 + -> {}", result);
    // 连接字符串 + -> hello rust!!!!
}
```

add() 方法的定义：

```rust
fn add(self, s: &str) -> String
```

关于所有权

```rust
fn main() {
    let s1 = String::from("hello,");
    let s2 = String::from("world!");
    // 在下句中，s1的所有权被转移走了，因此后面不能再使用s1
    let s3 = s1 + &s2;
    assert_eq!(s3,"hello,world!");
    // 下面的语句如果去掉注释，就会报错
    // println!("{}",s1);
}
```

#### 字符串转义

```rust
fn main() {
    // 通过 \ + 字符的十六进制表示，转义输出一个字符
    let byte_escape = "I'm writing \x52\x75\x73\x74!";
    println!("What are you doing\x3F (\\x3F means ?) {}", byte_escape);

    // \u 可以输出一个 unicode 字符
    let unicode_codepoint = "\u{211D}";
    let character_name = "\"DOUBLE-STRUCK CAPITAL R\"";

    println!(
        "Unicode character {} (U+211D) is called {}",
        unicode_codepoint, character_name
    );

    // 换行了也会保持之前的字符串格式
    // 使用\忽略换行符
    let long_string = "String literals
                        can span multiple lines.
                        The linebreak and indentation here ->\
                        <- can be escaped too!";
    println!("{}", long_string);
}
```

### 元组和结构体

```rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
}
```

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}
```

结构体都需要有初始值

结构体更新：

```rust
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
let user2 = User {
    active: user1.active,
    username: user1.username,
    email: String::from("another@example.com"),
    sign_in_count: user1.sign_in_count,
};
println!("{}", user1.active);
// 下面这行会报错
println!("{:?}", user1);
```

元组结构体(Tuple Struct):

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);
let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

单元结构体(Unit-like Struct):

```rust
struct AlwaysEqual;

let subject = AlwaysEqual;

// 我们不关心 AlwaysEqual 的字段数据，只关心它的行为，因此将它声明为单元结构体，然后再为它实现某个特征
impl SomeTrait for AlwaysEqual {

}
```

使用 `#[derive(Debug)]` 来打印结构体的信息

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!("rect1 is {:?}", rect1);
}
```

当结构体较大时，我们可能希望能够有更好的输出表现，此时可以使用 `{:#?}` 来替代 `{:?}`

还有一个简单的输出 debug 信息的方法，那就是使用 `dbg!` 宏，它会拿走表达式的所有权，然后打印出相应的文件名、行号等 debug 信息，当然还有我们需要的表达式的求值结果。除此之外，它最终还会把表达式值的所有权返回！`dbg!` 输出到标准错误输出 `stderr`，而 `println!` 输出到标准输出 `stdout`。

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let scale = 2;
    let rect1 = Rectangle {
        width: dbg!(30 * scale),
        height: 50,
    };

    dbg!(&rect1);
}
```

### 枚举

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let m1 = Message::Quit;
    let m2 = Message::Move{x:1,y:1};
    let m3 = Message::ChangeColor(255,255,0);
}
```

和 C 语言的联合体类似。

用 Option 枚举处理空值

```rust
// Option的定义
enum Option<T> {
    Some(T),
    None,
}

// 使用
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

#### 数组、动态数组

在 Rust 中，最常用的数组有两种，第一种是速度很快但是长度固定的 `array`，第二种是可动态增长的但是有性能损耗的 `Vector`，在本书中，我们称 `array` 为数组，`Vector` 为动态数组。

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let a: [i32; 5] = [1, 2, 3, 4, 5];
    let a = [3; 5]; // a 数组包含 5 个元素，这些元素的初始化值为 3
    let a = [0u8; 3]; //声明数组类型时同时初始化
}
```

## 流程控制

| 使用方法                      | 等价使用方式                                      | 所有权     |
| ----------------------------- | ------------------------------------------------- | ---------- |
| `for item in collection`      | `for item in IntoIterator::into_iter(collection)` | 转移所有权 |
| `for item in &collection`     | `for item in collection.iter()`                   | 不可变借用 |
| `for item in &mut collection` | `for item in collection.iter_mut()`               | 可变借用   |

两种循环方式优劣对比：

```rust
// 第一种
let collection = [1, 2, 3, 4, 5];
for i in 0..collection.len() {
  let item = collection[i];
  // ...
}

// 第二种
for item in collection {

}
```

- **性能**：第一种使用方式中  `collection[index]`  的索引访问，会因为边界检查(Bounds Checking)导致运行时的性能损耗 —— Rust 会检查并确认  `index`  是否落在集合内，但是第二种直接迭代的方式就不会触发这种检查，因为编译器会在编译时就完成分析并证明这种访问是合法的
- **安全**：第一种方式里对  `collection`  的索引访问是非连续的，存在一定可能性在两次访问之间，`collection`  发生了变化，导致脏数据产生。而第二种直接迭代的方式是连续访问，因此不存在这种风险( 由于所有权限制，在访问过程中，数据并不会发生变化)。

`while` 和 `loop` 循环

```rust
let mut n = 0;
while n <= 5  {
    println!("{}!", n);
    n = n + 1;
}

let mut n = 0;
loop {
    if n > 5 {
        break
    }
    println!("{}", n);
    n+=1;
}
```

## 模式匹配

### match

```rust
match target {
    模式1 => 表达式1,
    模式2 => {
        语句1;
        语句2;
        表达式2
    },
    _ => 表达式3
}

#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // --snip--
}
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState), // 25美分硬币
}
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        },
    }
}
enum Action {
    Say(String),
    MoveTo(i32, i32),
    ChangeColorRGB(u16, u16, u16),
}
fn main() {
    let actions = [
        Action::Say("Hello Rust".to_string()),
        Action::MoveTo(1,2),
        Action::ChangeColorRGB(255,255,0),
    ];
    for action in actions {
        match action {
            Action::Say(s) => {
                println!("{}", s);
            },
            Action::MoveTo(x, y) => {
                println!("point from (0, 0) move to ({}, {})", x, y);
            },
            Action::ChangeColorRGB(r, g, _) => {
                println!("change color into '(r:{}, g:{}, b:0)', 'b' has been ignored",
                    r, g,
                );
            }
        }
    }
}
```

### if let 匹配

```rust
let v = Some(3u8);
match v {
    Some(3) => println!("three"),
    _ => (),
}
if let Some(3) = v {
    println!("three");
}
```

当你只要匹配一个条件，且忽略其他条件时就用 if let ，否则都用 match。

### matches!宏

```rust
enum MyEnum {
    Foo,
    Bar
}

fn main() {
    let v = vec![MyEnum::Foo,MyEnum::Bar,MyEnum::Foo];
}
```

现在如果想对 v 进行过滤，只保留类型是 MyEnum::Foo 的元素，你可能想这么写：

```rust
v.iter().filter(|x| x == MyEnum::Foo);
```

但是，实际上这行代码会报错，因为你无法将 x 直接跟一个枚举成员进行比较。改成：

```rust
v.iter().filter(|x| matches!(x, MyEnum::Foo));
```

很简单也很简洁，再来看看更多的例子：

```rust
let foo = 'f';
assert!(matches!(foo, 'A'..='Z' | 'a'..='z'));

let bar = Some(4);
assert!(matches!(bar, Some(x) if x > 2));
```
