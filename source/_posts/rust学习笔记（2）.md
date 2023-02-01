---
title: rust学习笔记（2）：Day1 Afternoon
date: 2023-01-02 16:00:25
tags:
- Rust
- 学习笔记
categories: Rust
---

继续第一天学习：

<!-- more -->

## 变量

Rust通过静态类型提供类型安全性。默认情况下变量绑定是不可变的：

```rust
fn main() {
    let x: i32 = 10;
    println!("x: {x}");
    // x = 20; 这里如果重新赋值就会报错
    // println!("x: {x}");
}
```

### 类型推导

Rust将根据如何使用变量来确定类型：

```rust
fn takes_u32(x: u32) {
    println!("u32: {x}");
}

fn takes_i8(y: i8) {
    println!("i8: {y}");
}

fn main() {
    let x = 10;
    let y = 20;

    takes_u32(x);
    takes_i8(y);
    // takes_u32(y); // expected `u32`, found `i8`
}
```

### 静态变量和恒变量 / Static and Constant Variables

全局状态由静态变量和常量变量管理。

#### const

您可以声明编译时常量：

```rust
const DIGEST_SIZE: usize = 3;
const ZERO: Option<u8> = Some(42);

fn compute_digest(text: &str) -> [u8; DIGEST_SIZE] {
    let mut digest = [ZERO.unwrap_or(0); DIGEST_SIZE];
    for (idx, &b) in text.as_bytes().iter().enumerate() {
        digest[idx % DIGEST_SIZE] = digest[idx % DIGEST_SIZE].wrapping_add(b);
    }
    digest
}

fn main() {
    let digest = compute_digest("Hello");
    println!("Digest: {digest:?}");
}
```

#### static

您还可以声明静态变量:

```rust
static BANNER: &str = "Welcome to RustOS 3.14";

fn main() {
    println!("{BANNER}");
}
```

我们将在不安全Rust一章中介绍静态数据的突变。

### Scopes and Shadowing

你可以隐藏变量，包括来自外部作用域的变量和来自同一作用域的变量：

```ts
fn main() {
    let a = 10;
    println!("before: {a}");

    {
        let a = "hello";
        println!("inner scope: {a}");

        let a = true;
        println!("shadowed in inner scope: {a}");
    }

    println!("after: {a}");
}
```

## 内存管理

传统上，语言可以分为两大类：

* 通过手动内存管理完全控制:C, C++, Pascal...
* 运行时通过自动内存管理实现完全安全:Java, Python, Go, Haskell...

Rust 提供了一个新的组合：

> 完全控制和安全通过编译时执行正确的内存管理。

它通过一个明确的所有权概念来做到这一点。首先，让我们回顾一下内存管理是如何工作的。

### 堆和栈 / The Stack vs The Heap

* 栈:局部变量的连续内存区域。
  * 值在编译时具有固定的大小。
  * 非常快:只需移动一个栈指针。
  * 易于管理:遵循函数调用。
  * 完全的内存局部性。
* 堆:函数调用之外的值的存储。
  * 值具有在运行时确定的动态大小。
  * 比栈稍慢:需要向系统借取。
  * 不保证内存局部性。

### 栈内存

创建Strings时将固定大小的数据放在堆栈上，并将动态大小的数据放在堆上：

```rust
fn main() {
    let s1 = String::from("Hello");
}
```

[这里有个图](https://google.github.io/comprehensive-rust/memory-management/stack.html)

### 手动内存管理

您自己分配和释放堆内存。

#### C语言的例子

你必须对使用`malloc`分配的每个指针调用`free`：

```c
void foo(size_t n) {
    int* int_array = (int*)malloc(n * sizeof(int));
    //
    // ... lots of code
    //
    free(int_array);
}
```

如果函数在`malloc`和`free`之间提前返回，内存就会泄漏:指针丢失，我们无法释放内存。

### 基于作用域的内存管理

构造函数和析构函数让您可以钩子到对象的生命周期中。

通过将指针包装在对象中，可以在对象被销毁时释放内存。编译器保证这种情况发生，即使引发了异常。

这通常称为资源获取初始化(RAII)，并为您提供智能指针。

#### C++例子

```cpp
void say_hello(std::unique_ptr<Person> person) {
  std::cout << "Hello " << person->name << std::endl;
}
```

* `std::unique_ptr`对象分配在栈上，指向分配在堆上的内存。
* 在`say_hello`结束时，`std::unique_ptr`析构函数将运行。
* 析构函数释放它所指向的`Person`对象。

在将所有权传递给函数时，使用特殊的move构造函数:

```cpp
std::unique_ptr<Person> person = find_person("Carla");
say_hello(std::move(person));
```

### 自动内存管理

手动和基于作用域的内存管理的替代方案是自动内存管理

* 程序员从不显式地分配或释放内存。
* 垃圾收集器找到未使用的内存并为程序员释放它。

#### Java例子

在`sayHello`返回后，`person`对象没有被释放:

```java
void sayHello(Person person) {
  System.out.println("Hello " + person.getName());
}
```

### Rust中的内存管理

Rust中的内存管理是一种混合模式:

* 像Java一样安全正确，但是没有垃圾收集器。
* 像C++一样基于作用域，但是编译器强制完全遵循。
* 没有像C和C++那样的运行时开销。

它通过显式地对所有权建模来实现这一点。

## 对比

下面是内存管理技术的一个粗略比较。

### 不同内存管理技术的优点

* 像 C 一样手动
  * 无运行时开销。
* 像Java一样自动
  * 全自动的
  * 安全且正确。
* 基于作用域，如C++
  * 部分自动
  * 无运行时开销。
* 编译器强制的基于作用域的，像Rust
  * 由编译器强制执行。
  * 无运行时开销。
  * 安全且正确。

### 不同内存管理技术的缺点

* 像 C 一样手动
  * free后使用。
  * 重复free
  * 内存泄漏
* 像Java一样自动
  * 垃圾收集时程序暂停。
  * 析构函数延迟。
* 基于作用域，如C++
  * 复杂，由程序员选择。
  * 存在free后使用。
* 编译器强制的基于作用域的，像Rust
  * 一些前期的复杂性。（应该是前期学习上比较难？）
  * 可以拒绝有效的程序。（应该是可以拒绝编译器进行安全检查）

## 所有权

所有变量绑定都有一个有效的作用域，使用超出其作用域的变量是错误的

```rust
struct Point(i32, i32);

fn main() {
    {
        let p = Point(3, 4);
        println!("x: {}", p.0);
    }
    println!("y: {}", p.1); // 报错：not found in this scope
} 
```

* 在作用域的末尾，删除变量并释放数据。
* 析构函数可以在这里运行以释放资源。
* 我们说变量拥有值。

### 转移语义

赋值操作将在变量之间转移所有权

```rust
fn main() {
    let s1: String = String::from("Hello!");
    let s2: String = s1;
    println!("s2: {s2}");
    // println!("s1: {s1}"); // 报错：value borrowed here after move
}
```

* `s1`到`s2`的分配转移了所有权。
* 数据从`s1`移动，`s1`不再可访问。
* 当`s1`超出作用域时，什么都不会发生:它没有所有权。
* 当`s2`超出作用域时，字符串数据被释放。
* 总是只有一个变量绑定拥有一个值。

### 在 Rust 中移动的字符串

```rust
fn main() {
    let s1: String = String::from("Rust");
    let s2: String = s1;
}
```

* `s1`中的堆数据被`s2`重用。
* 当s1超出作用域时，什么都不会发生(它已被移出)。

[这里有个图](https://google.github.io/comprehensive-rust/ownership/moved-strings-rust.html)

#### 在现代C++中重复free

现代C++以不同的方式解决这个问题：

```cpp
std::string s1 = "Cpp";
std::string s2 = s1;  // Duplicate the data in s1.
```

* s1中的堆数据被复制，s2得到它自己的独立副本。
* 当`s1`和`s2`超出作用域时，它们各自释放自己的内存。

[这里有个图](https://google.github.io/comprehensive-rust/ownership/double-free-modern-cpp.html)

### 函数调用中的移动

将值传递给函数时，值被赋给函数形参。这就转移了所有权:

```rust
fn say_hello(name: String) {
    println!("Hello {name}")
}

fn main() {
    let name = String::from("Alice");
    say_hello(name);
    // say_hello(name); // 再次调用报错：value used here after move
}
```

### 复制与克隆

虽然move语义是默认的，但默认情况下会复制某些类型

```rust
fn main() {
    let x = 42;
    let y = x;
    println!("x: {x}");
    println!("y: {y}");
}
```

这些类型实现了Copy trait。

您可以选择自己的类型来使用复制语义：

```rust
#[derive(Copy, Clone, Debug)]
struct Point(i32, i32);

fn main() {
    let p1 = Point(3, 4);
    let p2 = p1;
    println!("p1: {p1:?}");
    println!("p2: {p2:?}");
}
```

* 赋值之后，p1和p2都拥有自己的数据。
* 我们还可以使用`p1.clone()`显式复制数据。

### 借用 / Borrowing

在调用函数时，可以让函数借用值，而不是转移所有权：

```rust
#[derive(Debug)]
struct Point(i32, i32);

fn add(p1: &Point, p2: &Point) -> Point {
    Point(p1.0 + p2.0, p1.1 + p2.1)
}

fn main() {
    let p1 = Point(3, 4);
    let p2 = Point(10, 20);
    let p3 = add(&p1, &p2);
    println!("{p1:?} + {p2:?} = {p3:?}");
}
```

* add函数借用两个点并返回一个新点。
* 调用方保留输入的所有权。

#### 共享和独特的借用

Rust限制了借用值的方式：

* 在任何给定时间都可以有一个或多个&T值，或者
* 你只能有一个`&mut`值。

```rust
fn main() {
    let mut a: i32 = 10;
    let b: &i32 = &a;

    {
        let c: &mut i32 = &mut a; // 报错：mutable borrow occurs here
        *c = 20;
    }

    println!("a: {a}");
    println!("b: {b}");
}
```

### 生命周期

借来的值是有生命周期的：

* 寿命可以省略: `add(p1: &Point, p2: &Point) -> Point`
* 生命周期也可以是明确的: `&'a Point`, `&'document str`
* 读取 `&'a Point` 如同 “在a的最后生命周期前 a 借用 `Point`是有效的”
* 生命周期总是由编译器推断出来的:你不能自己分配一个生命周期。
  * 生命周期注解创建约束;编译器验证是否存在有效的解决方案。（应该是说可以用注解控制生命周期）

### 函数调用中的生存期

除了借用实参外，函数还可以返回一个借来的值:

```rust
#[derive(Debug)]
struct Point(i32, i32);

fn left_most<'a>(p1: &'a Point, p2: &'a Point) -> &'a Point {
    if p1.0 < p2.0 { p1 } else { p2 }
}

fn main() {
    let p1: Point = Point(10, 10);
    let p2: Point = Point(20, 20);  // Put into different scope
    let p3: &Point = left_most(&p1, &p2);
    println!("left-most point: {:?}", p3);
}
```

* `'a`是一个泛型参数，由编译器推断。
* 生命周期以`'`和`'a`开头，a是典型的默认名称。
* 读取 `&'a Point` 如同 “在a的最后生命周期前 a 借用 `Point`是有效的”
  * 当参数在不同的作用域时，最后部分是重要的。

### 数据结构（Data Structures）中的生命周期

如果数据类型存储借来的数据，则必须使用生命期对其进行注释

```rust
#[derive(Debug)]
struct Highlight<'doc>(&'doc str);

fn erase(text: String) {
    println!("Bye {text}!");
}

fn main() {
    let text = String::from("The quick brown fox jumps over the lazy dog.");
    let fox = Highlight(&text[4..19]);
    let dog = Highlight(&text[35..43]);
    // erase(text); // 报错：move out of `text` occurs here
    println!("{fox:?}");
    println!("{dog:?}");
}
```

## 练习

### 设计库

明天我们将学习更多关于结构体和`Vec<T>`类型的知识。现在，您只需要知道它的API的一部分:

```rust
fn main() {
    let mut vec = vec![10, 20];
    vec.push(30);
    println!("middle value: {}", vec[vec.len() / 2]);
    for item in vec.iter() {
        println!("item: {item}");
    }
}
```

使用它来创建库应用程序。复制下面代码并完善它：

```rust
// TODO: remove this when you're done with your implementation.
#![allow(unused_variables, dead_code)]

struct Library {
    books: Vec<Book>,
}

struct Book {
    title: String,
    year: u16,
}

impl Book {
    // This is a constructor, used below.
    fn new(title: &str, year: u16) -> Book {
        Book {
            title: String::from(title),
            year,
        }
    }
}

// This makes it possible to print Book values with {}.
impl std::fmt::Display for Book {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} ({})", self.title, self.year)
    }
}

impl Library {
    fn new() -> Library {
        unimplemented!()
    }

    //fn len(self) -> usize {
    //    unimplemented!()
    //}

    //fn is_empty(self) -> bool {
    //    unimplemented!()
    //}

    //fn add_book(self, book: Book) {
    //    unimplemented!()
    //}

    //fn print_books(self) {
    //    unimplemented!()
    //}

    //fn oldest_book(self) -> Option<&Book> {
    //    unimplemented!()
    //}
}

fn main() {
    // This shows the desired behavior. Uncomment the code below and
    // implement the missing methods. You will need to update the
    // method signatures, including the "self" parameter!
    let library = Library::new();

    //println!("Our library is empty: {}", library.is_empty());
    //
    //library.add_book(Book::new("Lord of the Rings", 1954));
    //library.add_book(Book::new("Alice's Adventures in Wonderland", 1865));
    //
    //library.print_books();
    //
    //match library.oldest_book() {
    //    Some(book) => println!("My oldest book is {book}"),
    //    None => println!("My library is empty!"),
    //}
    //
    //println!("Our library has {} books", library.len());
}
```

我的答案:
```rust
struct Library {
    books: Vec<Book>,
}

struct Book {
    title: String,
    year: u16,
}

impl Book {
    // This is a constructor, used below.
    fn new(title: &str, year: u16) -> Book {
        Book {
            title: String::from(title),
            year,
        }
    }
}

// This makes it possible to print Book values with {}.
impl std::fmt::Display for Book {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} ({})", self.title, self.year)
    }
}

impl Library {
    fn new() -> Library {
        Library {
            books: vec![]
        }
    }

    fn is_empty(&self) -> bool {
       self.books.is_empty()
    }

    fn add_book(&mut self, book: Book) {
       self.books.push(book)
    }

    fn print_books(&self) {
        for item in self.books.iter() {
            println!("book: {item}")
        }
    }

    fn len(&self) -> usize {
        return self.books.len()
    }

    fn oldest_book(&self) -> Option<&Book> {
        self.books.iter().min_by_key(|x| x.year)
    }
}

// This shows the desired behavior. Uncomment the code below and
// implement the missing methods. You will need to update the
// method signatures, including the "self" parameter! You may
// also need to update the variable bindings within main.
fn main() {
    let mut library = Library::new();

    println!("Our library is empty: {}", library.is_empty());

    library.add_book(Book::new("Lord of the Rings", 1954));
    library.add_book(Book::new("Alice's Adventures in Wonderland", 1865));

    library.print_books();

    match library.oldest_book() {
       Some(book) => println!("My oldest book is {book}"),
       None => println!("My library is empty!"),
    }

    println!("Our library has {} books", library.len());
}
```

### 迭代器和所有权(难)

Rust的所有权模型影响许多api。一个例子就是[`Iterator`](https://doc.rust-lang.org/std/iter/trait.Iterator.html)和[`IntoIterator`](https://doc.rust-lang.org/std/iter/trait.IntoIterator.html) traits。

#### Iterator

Traits 类似于接口:它们描述类型的行为(方法)。`Iterator` trait只是说，您可以调用`next`，直到返回`None`为止:

```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

你可以这样使用这个trait:

```rust
fn main() {
    let v: Vec<i8> = vec![10, 20, 30];
    let mut iter = v.iter();

    println!("v[0]: {:?}", iter.next());
    println!("v[1]: {:?}", iter.next());
    println!("v[2]: {:?}", iter.next());
    println!("No more items: {:?}", iter.next());
}
```

迭代器返回的类型是什么?在这里测试你的答案:

```rust
fn main() {
    let v: Vec<i8> = vec![10, 20, 30];
    let mut iter = v.iter();

    let v0: Option<..> = iter.next();
    println!("v0: {v0:?}");
}
```

为什么使用这种类型？

#### IntoIterator

`Iterator` traut告诉您在创建迭代器后如何进行*迭代*。相关的trait `IntoIterator`告诉你如何创建迭代器:

```rust
pub trait IntoIterator {
    type Item;
    type IntoIter: Iterator<Item = Self::Item>;

    fn into_iter(self) -> Self::IntoIter;
}
```

这里的语法意味着`IntoIterator`的每个实现都必须声明两种类型:

* `Item`:迭代的类型，比如`i8`
* `IntoIter`:由`into_iter`方法返回的`Iterator`类型。

注意，IntoIter和Item是关联的:迭代器必须具有相同的`Item`类型，这意味着它返回`Option<Item>`

和前面一样，迭代器返回的类型是什么?

```rust
fn main() {
    let v: Vec<String> = vec![String::from("foo"), String::from("bar")];
    let mut iter = v.into_iter();

    let v0: Option<..> = iter.next();
    println!("v0: {v0:?}");
}
```

#### for循环

现在我们知道了`Iterator`和`IntoIterator`，我们可以构建`for`循环。它们在表达式上调用`into_iter()`并遍历得到的迭代器:

```rust
fn main() {
    let v: Vec<String> = vec![String::from("foo"), String::from("bar")];

    for word in &v {
        println!("word: {word}");
    }

    for word in v {
        println!("word: {word}");
    }
}
```

每个循环中`word`的类型是什么?

> 我的想法：如果是for in遍历变量的引用，那只是借用，而for in变量变量本身则会转移所有权，所有第一次循环的是&String类型，第二次是String类型。（复制到ide就能看到类型）

尝试上面的代码，然后查阅文档中的[`impl IntoIterator for &Vec<T>`](https://doc.rust-lang.org/std/vec/struct.Vec.html#impl-IntoIterator-2)和[`impl IntoIterator for Vec<T>`](https://doc.rust-lang.org/std/vec/struct.Vec.html#impl-IntoIterator-1)来检查您的答案。
