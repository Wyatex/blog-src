---
title: Rust圣经学习笔记（2）
date: 2024-01-11 16:12:15
tags:
  - Rust
  - 学习笔记
categories: Rust
---

记录一下学习 course.rs 过程中容易忘记的点，内容包括基础入门方法到格式化输出

<!-- more -->

## 方法

实现私有属性

```rust
// lib.rs
pub struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    pub fn new(width: u32, height: u32) -> Self {
        Rectangle { width, height }
    }
    pub fn width(&self) -> u32 {
        return self.width;
    }
}

// main.rs
use grep_rs::Rectangle;
fn main() {
    let rect1 = Rectangle::new(30, 50);

    println!("{}", rect1.width());
}
```

impl 可以存在多个，目的是提供更多的灵活性和代码组织性，例如当方法多了后，可以把相关的方法组织在同一个 impl 块中，那么就可以形成多个 impl 块，各自完成一块儿目标

不止结构体可以实现方法，枚举也可以。

## 泛型和特征

### 结构体和枚举使用泛型

```rust
struct Point<T> {
    x: T,
    y: T,
}
```

语言自带的两个常用枚举

```rust
enum Option<T> {
    Some(T),
    None,
}
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

### 泛型函数和方法

```rust
fn add<T: std::ops::Add<Output = T>>(a:T, b: T) -> T {
    a + b
}

fn find_max<T: std::cmp::Ord + Copy>(list: &Vec<T>) -> &T {
    let mut max = &list[0];
    for item in list.iter() {
        if item > max {
            max = item;
        }
    }
    max
}

fn main() {
    println!("add i8: {}", add(2i8, 3i8));
    println!("add i32: {}", add(20, 30));
    println!("add f64: {}", add(1.23, 1.23));
    println!("find_max: {}", find_max(vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
}
```

为具体的泛型类型实现方法

```rust
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 { // 只有f32类型Point才有这个方法
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

### const 泛型（Rust 1.51 版本引入的重要特性）

```rust
fn display_array(arr: [i32; 3]) {
    println!("{:?}", arr);
}
fn main() {
    let arr: [i32; 3] = [1, 2, 3];
    display_array(arr);

    let arr: [i32;2] = [1,2];
    display_array(arr); // [i32; 2] 和 [i32; 3] 是不同的数组，报错！
}
```

很简单，只要使用数组切片，然后传入 arr 的不可变引用即可。可以这样改：

```rust
fn display_array(arr: &[i32]) {
    println!("{:?}", arr);
}
```

接着，将 i32 改成所有类型的数组：

```rust
fn display_array<T: std::fmt::Debug>(arr: &[T]) {
    println!("{:?}", arr); // 因为需要 Debug trait，所以需要指定 T: std::fmt::Debug
}
fn main() {
    let arr: [i32; 3] = [1, 2, 3];
    display_array(&arr);

    let arr: [i32;2] = [1,2];
    display_array(&arr); // 编译通过啦！
}
```

不过，它们会为每个长度都单独实现一个函数。。。

现在有了const泛型，正好用于处理数组长度

```rust
fn display_array<T: std::fmt::Debug, const N: usize>(arr: [T; N]) {
    println!("{:?}", arr);
}
fn main() {
    let arr: [i32; 3] = [1, 2, 3];
    display_array(arr);

    let arr: [i32; 2] = [1, 2];
    display_array(arr);
}
```

重点在于 `N` 这个泛型参数，它是一个基于值的泛型参数！因为它用来替代的是数组的长度。

#### const 泛型表达式

假设我们某段代码需要在内存很小的平台上工作，因此需要限制函数参数占用的内存大小，此时就可以使用 const 泛型表达式来实现：

```rust
// 目前只能在nightly版本下使用
#![allow(incomplete_features)]
#![feature(generic_const_exprs)]

fn something<T>(val: T)
where
    Assert<{ core::mem::size_of::<T>() < 768 }>: IsTrue,
    //       ^-----------------------------^ 这里是一个 const 表达式，换成其它的 const 表达式也可以
{
    //
}

fn main() {
    something([0u8; 0]); // ok
    something([0u8; 512]); // ok
    something([0u8; 1024]); // 编译错误，数组长度是1024字节，超过了768字节的参数长度限制
}

// ---

pub enum Assert<const CHECK: bool> {
    //
}

pub trait IsTrue {
    //
}

impl IsTrue for Assert<true> {
    //
}
```

## 特征Trait

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
pub struct Post {
    pub title: String, // 标题
    pub author: String, // 作者
    pub content: String, // 内容
}

impl Summary for Post {
    fn summarize(&self) -> String {
        format!("文章{}, 作者是{}", self.title, self.author)
    }
}

pub struct Weibo {
    pub username: String,
    pub content: String
}

impl Summary for Weibo {
    fn summarize(&self) -> String {
        format!("{}发表了微博{}", self.username, self.content)
    }
}
```

默认实现

```rust
pub trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}
impl Summary for Weibo {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
}
println!("1 new weibo: {}", weibo.summarize());
```

使用特征作为函数参数

```rust
pub fn notify(item: &impl Summary) { // 实际上是语法糖
    println!("Breaking news! {}", item.summarize());
}
// 完整写法
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}
pub fn notify(item1: &impl Summary, item2: &impl Summary) {} // 没办法限制成相同类型
// 如果需要同一类型，则需要：
pub fn notify<T: Summary>(item1: &T, item2: &T) {}
```

多重约束

```rust
// 语法糖
pub fn notify(item: &(impl Summary + Display)) {}
// 特征约束
pub fn notify<T: Summary + Display>(item: &T) {}
```

where约束

```rust
// 太多太复杂
fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {}
// where约束改进
fn some_function<T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{}
```

使用特征约束有条件地实现方法或特征

```rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self {
            x,
            y,
        }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
```

### 返回impl Trait

```rust
fn getPostOrWeibo(switch: bool) -> Box<dyn Summary> {
    if switch {
        Box::new(Post {
            title: "Hello".to_string(),
            author: "World".to_string(),
            content: "Hello World".to_string()
        })
    } else {
        Box::new(Weibo {
            username: "Rust".to_string(),
            content: "Hello World".to_string()
        })
    }
}
```

因为要保证返回值类型统一、大小统一，所以需要Box包装。

限制：

- 方法的返回类型不能是 `Self`
- 方法没有任何泛型参数

标准库中的 `Clone` 特征就不符合对象安全的要求

```rust
pub struct Screen {
    pub components: Vec<Box<dyn Clone>>,
}
```

报错

```
error[E0038]: the trait `std::clone::Clone` cannot be made into an object
 --> src/lib.rs:2:5
  |
2 |     pub components: Vec<Box<dyn Clone>>,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `std::clone::Clone`
  cannot be made into an object
  |
  = note: the trait cannot require that `Self : Sized`
```

### 关联类型

标准库中的迭代器特征 `Iterator`

```rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```

```rust
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // --snip--
    }
}

fn main() {
    let c = Counter{..}
    c.next()
}
```

为何不用泛型，观察下面代码：

```rust
// 使用泛型
trait Container<A,B> {
    fn contains(&self,a: A,b: B) -> bool;
}

fn difference<A,B,C>(container: &C) -> i32
  where
    C : Container<A,B> {...}

// 使用关联类型
trait Container{
    type A;
    type B;
    fn contains(&self, a: &Self::A, b: &Self::B) -> bool;
}

fn difference<C: Container>(container: &C) {}
```

默认泛型类型参数

```rust
// 标准库中的 std::ops::Add 特征
trait Add<RHS=Self> {
    type Output;

    fn add(self, rhs: RHS) -> Self::Output;
}
```

相同类型相加

```rust
use std::ops::Add;

#[derive(Debug, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

impl Add for Point {
    type Output = Point;

    fn add(self, other: Point) -> Point {
        Point {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

fn main() {
    assert_eq!(Point { x: 1, y: 0 } + Point { x: 2, y: 3 },
               Point { x: 3, y: 3 });
}
```

不同类型相加

```rust
use std::ops::Add;

struct Millimeters(u32);
struct Meters(u32);

impl Add<Meters> for Millimeters {
    type Output = Millimeters;

    fn add(self, other: Meters) -> Millimeters {
        Millimeters(self.0 + (other.0 * 1000))
    }
}
```

### 调用同名的方法

```rust
trait Pilot {
    fn fly(&self);
}

trait Wizard {
    fn fly(&self);
}

struct Human;

impl Pilot for Human {
    fn fly(&self) {
        println!("This is your captain speaking.");
    }
}

impl Wizard for Human {
    fn fly(&self) {
        println!("Up!");
    }
}

impl Human {
    fn fly(&self) {
        println!("*waving arms furiously*");
    }
}

fn main() {
    let person = Human;
    Pilot::fly(&person); // 调用Pilot特征上的方法 "This is your captain speaking."
    Wizard::fly(&person); // 调用Wizard特征上的方法 "Up!"
    person.fly(); // 调用Human类型自身的方法 "*waving arms furiously*"
}
```

方法没有 self 参数，使用完全限定语法：

```rust
trait Animal {
    fn baby_name() -> String;
}

struct Dog;

impl Dog {
    fn baby_name() -> String {
        String::from("Spot")
    }
}

impl Animal for Dog {
    fn baby_name() -> String {
        String::from("puppy")
    }
}

fn main() {
    println!("A baby dog is called a {}", <Dog as Animal>::baby_name());
}
```

### 特征定义中的特征约束(supertrait)

```rust
use std::fmt::Display;

trait OutlinePrint: Display {
    fn outline_print(&self) {
        let output = self.to_string();
        let len = output.len();
        println!("{}", "*".repeat(len + 4));
        println!("*{}*", " ".repeat(len + 2));
        println!("* {} *", output);
        println!("*{}*", " ".repeat(len + 2));
        println!("{}", "*".repeat(len + 4));
    }
}
```

### 在外部类型上实现外部特征(newtype)

```rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```

## 集合类型

### Vector

```rust
// 指定类型
let v: Vec<i32> = Vec::new();
// 类型推导
let mut v = Vec::new();
v.push(1);
// 初始化值，而且带类型推导
let v = vec![1, 2, 3];
```

#### 从 Vector 中读取元素

```rust
let v = vec![1, 2, 3, 4, 5];

let does_not_exist = &v[100];
let does_not_exist = v.get(100);
```

`&v[100]` 的访问方式会导致程序无情报错退出，因为发生了数组越界访问

`v.get` 不会，它在内部做了处理，有值的时候返回 `Some(T)`，无值的时候返回 `None`


```rust
let mut v = vec![1, 2, 3, 4, 5];
let first = &v[0];
v.push(6);
println!("The first element is: {first}"); // 报错
```

push后动态数组可能回扩容重新分配空间，`&v[0]`地址可能并不是扩容后的地址。


#### 迭代遍历 Vector 中的元素

```rust
let v = vec![1, 2, 3];
for i in &v {
    println!("{i}");
}
let mut v = vec![1, 2, 3];
for i in &mut v {
    *i += 10
}
```

每次都会检测边界，比下标访问更安全，但是性能不如下标访问。

#### 存储不同类型的元素

枚举

```rust
#[derive(Debug)]
enum IpAddr {
    V4(String),
    V6(String)
}
fn main() {
    let v = vec![
        IpAddr::V4("127.0.0.1".to_string()),
        IpAddr::V6("::1".to_string())
    ];

    for ip in v {
        show_addr(ip)
    }
}

fn show_addr(ip: IpAddr) {
    println!("{:?}",ip);
}
```

特征对象

```rust
trait IpAddr {
    fn display(&self);
}

struct V4(String);
impl IpAddr for V4 {
    fn display(&self) {
        println!("ipv4: {:?}",self.0)
    }
}
struct V6(String);
impl IpAddr for V6 {
    fn display(&self) {
        println!("ipv6: {:?}",self.0)
    }
}

fn main() {
    let v: Vec<Box<dyn IpAddr>> = vec![
        Box::new(V4("127.0.0.1".to_string())),
        Box::new(V6("::1".to_string())),
    ];

    for ip in v {
        ip.display();
    }
}
```

#### 数组方法

常用方法：

- insert：在指定索引插入数据，索引值不能大于 v 的长度，比如：`v.insert(2, 3);`
- remove：移除指定位置的元素并返回
- pop：删除并返回尾部的元素
- clear：清空数组
- append：拼接数组：`v.append(&mut v2);`
- truncate：截断数组，只保留指定长度的元素
- retain：只保留满足条件的元素：`v.retain(|&mut x| x % 2 == 0);`

排序分稳定排序：`sort` 和 `sort_by` ，非稳定排序：`sort_unstable` 和 `sort_unstable_by`

```rust
fn main() {
    let mut vec = vec![1.0, 5.6, 10.3, 2.0, 15f32];    
    vec.sort_unstable(); // 报错
    assert_eq!(vec, vec![1.0, 2.0, 5.6, 10.3, 15f32]);
}
```

浮点数中可能存在 `NAN`，无法进行比较，如果确定在浮点数数组当中，不包含 `NAN` 值，可以这样写

```
fn main() {
    let mut vec = vec![1.0, 5.6, 10.3, 2.0, 15f32];    
    vec.sort_unstable_by(|a, b| a.partial_cmp(b).unwrap());    
    assert_eq!(vec, vec![1.0, 2.0, 5.6, 10.3, 15f32]);
}
```

自定义数据结构排序

```rust
#[derive(Debug, Ord, Eq, PartialEq, PartialOrd)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: String, age: u32) -> Person {
        Person { name, age }
    }
}

fn main() {
    let mut people = vec![
        Person::new("Zoe".to_string(), 25),
        Person::new("Al".to_string(), 60),
        Person::new("Al".to_string(), 30),
        Person::new("John".to_string(), 1),
        Person::new("John".to_string(), 25),
    ];

    people.sort_unstable();

    println!("{:?}", people);
}
```

### HashMap

创建

```rust
use std::collections::HashMap;

// 创建一个HashMap，用于存储宝石种类和对应的数量
let mut my_gems = HashMap::new();

// 将宝石类型和对应的数量写入表中
my_gems.insert("红宝石", 1);
my_gems.insert("蓝宝石", 2);
my_gems.insert("河边捡的误以为是宝石的破石头", 18);
```

如果 `insert` 的内容实现了 `Copy` ，该类型会被 `Copy` ，否则会移动，不能使用。 

vec转为HashMap

```rust
let teams_list = vec![
    ("中国队".to_string(), 100),
    ("美国队".to_string(), 10),
    ("日本队".to_string(), 50),
];

let teams_map: HashMap<_,_> = teams_list.into_iter().collect();
```

`HashMap<_,_>` 表示让编译器推导类型

查询

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score: Option<&i32> = scores.get(&team_name);
```

get方法返回值为 `Option<T>`，如果查找不到，返回 `None`，否则返回 `Some(T)`。   

更新

```rust
use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();
// 根据空格来切分字符串(英文单词都是通过空格切分)
for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{:?}", map);
```

`or_insert` 返回了 `&mut v` 引用，因此可以通过该可变引用直接修改 map 中对应的值

## 生命周期

```rust
use std::fmt::Display;

fn longest_with_an_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: Display,
{
    println!("Announcement! {}", ann);
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```


## 错误处理

使用 `?` 语法糖

```rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();

    File::open("hello.txt")?.read_to_string(&mut s)?;

    Ok(s)
}
```

`?` 语法糖可以链式调用，也可以进行类型隐式转换。只要函数返回的错误 `ReturnError` 实现了 `From<OtherError>` 特征，那么 `?` 就会自动把 `OtherError` 转换为 `ReturnError`。

除了`Result`，`Option`也可以用 `?` 语法糖

```rust
fn last_char_of_first_line(text: &str) -> Option<char> {
    text.lines().next()?.chars().last()
}
```

另外一种形式的main

```rust
use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt")?;

    Ok(())
}
```

## 文档

### 文档测试(Doc Test)

```rust
/// `add_one` 将指定值加1
///
/// # Examples11
///
/// ```
/// let arg = 5;
/// let answer = world_hello::compute::add_one(arg);
///
/// assert_eq!(6, answer);
/// ```
pub fn add_one(x: i32) -> i32 {
    x + 1
}
```

ide打开能看到代码左边有个运行，可以直接运行这个test

### 运行会panic的的例子

```rust
/// # Panics
///
/// The function panics if the second argument is zero.
///
/// ```rust,should_panic
/// // panics on division by zero
/// world_hello::div(10, 0);
/// ```
pub fn div(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("Divide-by-zero error");
    }

    a / b
}
```

需要加上 `rust,should_panic`

### 保留测试，隐藏文档

```rust
/// ```rust,should_panic
/// # // 使用#开头的行会在文档中被隐藏起来，但是依然会在文档测试中运行
/// # fn try_main() -> Result<(), String> {
/// let res = world_hello::compute::try_div(10, 0)?;
/// # Ok(()) // returning from try_main
/// # }
/// # fn main() {
/// #    try_main().unwrap();
/// #
/// # }
/// ```
pub fn try_div(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err(String::from("Divide-by-zero"))
    } else {
        Ok(a / b)
    }
}
```

### 文档注释中的代码跳转

跳转到标准库

```rust
/// `add_one` 返回一个[`Option`]类型
pub fn add_one(x: i32) -> Option<i32> {
    Some(x + 1)
}
```

- 在 IDE 中，使用 Command + 鼠标左键(macOS)，CTRL + 鼠标左键(Windows)
- 在文档中直接点击链接

路径跳转

```rust
use std::sync::mpsc::Receiver;

/// [`Receiver<T>`]   [`std::future`].
///
///  [`std::future::Future`] [`Self::recv()`].
pub struct AsyncReceiver<T> {
    sender: Receiver<T>,
}

impl<T> AsyncReceiver<T> {
    pub async fn recv() -> T {
        unimplemented!()
    }
}

pub mod a {
    /// `add_one` 返回一个[`Option`]类型
    /// 跳转到[`crate::MySpecialFormatter`]
    pub fn add_one(x: i32) -> Option<i32> {
        Some(x + 1)
    }
}
pub struct MySpecialFormatter;
```

同名

```rust
/// 跳转到结构体  [`Foo`](struct@Foo)
pub struct Bar;

/// 跳转到同名函数 [`Foo`](fn@Foo)
pub struct Foo {}

/// 跳转到同名宏 [`foo!`]
pub fn Foo() {}

#[macro_export]
macro_rules! foo {
  () => {}
}
```

文档搜索别名

```rust
#[doc(alias = "x")]
#[doc(alias = "big")]
pub struct BigX;

#[doc(alias("y", "big"))]
pub struct BigY;
```

## 格式化输出

```rust
println!("Hello");                 // => "Hello"
println!("Hello, {}!", "world");   // => "Hello, world!"
println!("The number is {}", 1);   // => "The number is 1"
println!("{:?}", (3, 4));          // => "(3, 4)"
println!("{value}", value=4);      // => "4"
println!("{} {}", 1, 2);           // => "1 2"
println!("{:04}", 42);             // => "0042" with leading zeros

let s1 = format!("{}, world", s);
print!("{}", s1);
print!("{}\n", "!");               // hello, world!

eprint!()    // 输出到stderr
eprintln!()  // 输出到stderr
```

### 占位符

- `{}` 适用于实现了 `std::fmt::Display` 特征的类型，用来以更优雅、更友好的方式格式化文本，例如展示给用户
- `{:?}` 适用于实现了 `std::fmt::Debug` 特征的类型，用于调试场景
- `{:#?}` 类似 `{:?}` 但是经过格式化，更加好看

实现display：

```rust
// 自实现类型
struct Person {
    name: String,
    age: u8,
}

use std::fmt;
impl fmt::Display for Person {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "大佬在上，请受我一拜，小弟姓名{}，年芳{}，家里无田又无车，生活苦哈哈",
            self.name, self.age
        )
    }
}

// 外部类型
struct Array(Vec<i32>);

use std::fmt;
impl fmt::Display for Array {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "数组是：{:?}", self.0)
    }
}

fn main() {
    let p = Person {
        name: "sunface".to_string(),
        age: 18,
    };
    println!("{}", p);
    let arr = Array(vec![1, 2, 3]);
    println!("{}", arr);
}

```

具名参数

```rust
fn main() {
    println!("{argument}", argument = "test"); // => "test"
    println!("{name} {}", 1, name = 2); // => "2 1"
    println!("{a} {c} {b}", a = "a", b = 'b', c = 3); // => "a 3 b"
    println!("{abc} {1}", abc = "def", 2); // 报错！！！
}
```

**带名称的参数必须放在不带名称参数的后面**

### 格式化参数

```rust
fn main() {
    // 数字填充:符号和 0
    // 宽度是5 => Hello     5!
    println!("Hello {:5}!", 5);
    // 显式的输出正号 => Hello +5!
    println!("Hello {:+}!", 5);
    // 宽度5，使用0进行填充 => Hello 00005!
    println!("Hello {:05}!", 5);
    // 负号也要占用一位宽度 => Hello -0005!
    println!("Hello {:05}!", -5);

    // 对齐
    // 以下全部都会补齐5个字符的长度
    // 左对齐 => Hello x    !
    println!("Hello {:<5}!", "x");
    // 右对齐 => Hello     x!
    println!("Hello {:>5}!", "x");
    // 居中对齐 => Hello   x  !
    println!("Hello {:^5}!", "x");
    // 对齐并使用指定符号填充 => Hello x&&&&!
    // 指定符号填充的前提条件是必须有对齐字符
    println!("Hello {:&<5}!", "x");

    // 精度
    let v = 3.1415926;
    // 保留小数点后两位 => 3.14
    println!("{:.2}", v);
    // 带符号保留小数点后两位 => +3.14
    println!("{:+.2}", v);
    // 不带小数 => 3
    println!("{:.0}", v);
    // 通过参数来设定精度 => 3.1416，相当于{:.4}
    println!("{:.1$}", v, 4);
    let s = "hi我是Sunface孙飞";
    // 保留字符串前三个字符 => hi我
    println!("{:.3}", s);
    // {:.*}接收两个参数，第一个是精度，第二个是被格式化的值 => Hello abc!
    println!("Hello {:.*}!", 3, "abcdefg");

    // 进制
    // 二进制 => 0b11011!
    println!("{:#b}!", 27);
    // 八进制 => 0o33!
    println!("{:#o}!", 27);
    // 十进制 => 27!
    println!("{}!", 27);
    // 小写十六进制 => 0x1b!
    println!("{:#x}!", 27);
    // 大写十六进制 => 0x1B!
    println!("{:#X}!", 27);
    // 不带前缀的十六进制 => 1b!
    println!("{:x}!", 27);
    // 使用0填充二进制，宽度为10 => 0b00011011!
    println!("{:#010b}!", 27);

    // 指数
    println!("{:2e}", 1000000000); // => 1e9
    println!("{:2E}", 1000000000); // => 1E9

    // 指针地址
    let v= vec![1, 2, 3];
    println!("{:p}", v.as_ptr()) // => 0x600002324050

    // 转义
    // "{{" 转义为 '{'   "}}" 转义为 '}'   "\"" 转义为 '"'
    // => Hello "{World}" 
    println!(" Hello \"{{World}}\" ");
    // 下面代码会报错，因为占位符{}只有一个右括号}，左括号被转义成字符串的内容
    // println!(" {{ Hello } ");
    // 也不可使用 '\' 来转义 "{}"
    // println!(" \{ Hello \} ")
}
```

### 在格式化字符串时捕获环境中的值

```rust
fn get_person() -> String {
    String::from("sunface")
}
fn main() {
    let p = get_person();
    println!("Hello, {}!", p);                // implicit position
    println!("Hello, {0}!", p);               // explicit index
    println!("Hello, {person}!", person = p);
    println!("Hello, {person}!");

    let (width, precision) = get_format();
    for (name, score) in get_scores() {
      println!("{name}: {score:width$.precision$}"); // 甚至还可以将环境中的值用于格式化参数
    }
}
```
