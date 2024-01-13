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


