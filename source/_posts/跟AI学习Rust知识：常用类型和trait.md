---
title: 跟AI学习Rust知识：常用类型和trait
date: 2024-06-19 09:47:32
tags:
- Rust
categories: Rust
---

> 最近在跟着Rust语言圣经学Rust，但是学完之后根本记不住那么多类型，想重新回去记下笔记又发现很多类型分散在各章实在不好找。然后突然想到现在AI都这么强了，何不向AI这个好老师学习一下呢。然后我就掏出我平时常用的DeesSeek，这个是我觉得最强的国产AI了（懒得折腾GPT4捏而且免费又够用）。下面就顺手记下AI老师的教学吧，以供后面回来查阅。

<!-- more -->

## 常用类型

**我**：可以详细说一下rust自带的一些基础封装类型有哪些吗，他们都是用来干什么的

---

**DeepSeek-Coder-V2**：

Rust 语言自带了许多基础封装类型，这些类型在标准库 `std` 中定义，用于处理各种常见的编程任务。以下是一些常见的 Rust 基础封装类型及其用途：

1. [**`Option<T>`**](https://rustwiki.org/zh-CN/std/option/enum.Option.html)

    - **用途**：表示一个值可能存在也可能不存在的情况。`Option<T>` 有两个变体：`Some(T)` 表示值存在，`None` 表示值不存在。

    - **示例**：

        ```rust
        let some_number = Some(5);
        let no_number: Option<i32> = None;
        ```

2. [**`Result<T, E>`**](https://rustwiki.org/zh-CN/std/result/enum.Result.html)

    - **用途**：表示一个操作可能成功也可能失败的情况。`Result<T, E>` 有两个变体：`Ok(T)` 表示操作成功并包含结果值，`Err(E)` 表示操作失败并包含错误信息。

    - **示例**：

        ```rust
        fn divide(a: i32, b: i32) -> Result<i32, &'static str> {
            if b == 0 {
                Err("Cannot divide by zero")
            } else {
                Ok(a / b)
            }
        }
        ```

> 和Some一样同样是个枚举，不过多了个类型泛型，用于表示Err的类型

3. [**`Vec<T>`**](https://rustwiki.org/zh-CN/std/vec/struct.Vec.html)

    - **用途**：动态数组，可以存储任意数量的元素。`Vec<T>` 在堆上分配内存，并且可以动态增长和收缩。

    - **示例**：

        ```rust
        let mut numbers = Vec::new();
        numbers.push(1);
        numbers.push(2);
        ```

> 还可以用`vec!`宏，代码`let mut numbers = vec![1,2]`经过编译展开之后就会变成和上面代码一模一样

4. [**`String`**](https://rustwiki.org/zh-CN/std/string/struct.String.html)

    - **用途**：用于处理可变的、可增长的 UTF-8 编码字符串。`String` 是 `Vec<u8>` 的封装，确保其内容是有效的 UTF-8 编码。

    - **示例**：

        ```rust
        let mut s = String::from("Hello");
        s.push_str(", world!");
        ```

5. [**`HashMap<K, V>`**](https://rustwiki.org/zh-CN/std/collections/struct.HashMap.html)

    - **用途**：键值对存储结构，提供快速的查找、插入和删除操作。`HashMap<K, V>` 使用哈希表实现，键和值的类型分别为 `K` 和 `V`。

    - **示例**：

        ```rust
        use std::collections::HashMap;

        let mut scores = HashMap::new();
        scores.insert(String::from("Blue"), 10);
        scores.insert(String::from("Yellow"), 50);
        ```

6. [**`HashSet<T>`**](https://rustwiki.org/zh-CN/std/collections/struct.HashSet.html)

    - **用途**：存储唯一值的集合，提供快速的查找、插入和删除操作。`HashSet<T>` 使用哈希表实现，元素类型为 `T`。

    - **示例**：

        ```rust
        use std::collections::HashSet;

        let mut set = HashSet::new();
        set.insert(1);
        set.insert(2);
        ```

7. [**`Box<T>`**](https://rustwiki.org/zh-CN/std/boxed/struct.Box.html)

    - **用途**：在堆上分配值的智能指针。`Box<T>` 用于在编译时无法确定大小的类型（如递归类型）或在堆上分配数据以减少栈上内存使用。

    - **示例**：

        ```rust
        let b = Box::new(5);
        ```

8. [**`Rc<T>`**](https://rustwiki.org/zh-CN/std/rc/struct.Rc.html)

    - **用途**：引用计数智能指针，允许多个所有者共享数据。`Rc<T>` 用于在堆上分配数据，并且允许多个变量引用同一个数据。

    - **示例**：

        ```rust
        use std::rc::Rc;

        let a = Rc::new(5);
        let b = Rc::clone(&a);
        ```

9. [**`Arc<T>`**](https://rustwiki.org/zh-CN/std/sync/struct.Arc.html)

    - **用途**：原子引用计数智能指针，允许多线程共享数据。`Arc<T>` 类似于 `Rc<T>`，但可以安全地在多线程环境中使用。

    - **示例**：

        ```rust
        use std::sync::Arc;
        use std::thread;

        let a = Arc::new(5);
        let b = Arc::clone(&a);

        thread::spawn(move || {
            println!("{}", b);
        });
        ```

这些基础封装类型在 Rust 编程中非常常用，它们提供了处理各种常见编程任务所需的功能和安全性。

---

**我**：可以再拓展说说其他的类型吗，比如Pin、Future，尽量多的说一下

---

**DeepSeek-Coder-V2**：

当然可以。除了之前提到的基础封装类型，Rust 还有一些更高级的类型和概念，这些在处理特定问题时非常有用。以下是一些额外的类型和概念：

1. [**`Pin<P>`**](https://rustwiki.org/zh-CN/std/pin/struct.Pin.html)

    - **用途**：用于防止指针所指向的值被移动。`Pin<P>` 确保指向的值不会被移动，这对于实现自引用结构和异步编程中的 `Future` 非常重要。

    - **示例**：

        ```rust
        use std::pin::Pin;
        use std::marker::PhantomPinned;

        #[derive(Debug)]
        struct Test {
            a: String,
            b: *const String,
            _marker: PhantomPinned,
        }

        impl Test {
            fn new(txt: &str) -> Self {
                Test {
                    a: String::from(txt),
                    b: std::ptr::null(),
                    _marker: PhantomPinned,
                }
            }

            fn init(self: Pin<&mut Self>) {
                let self_ptr: *const String = &self.a;
                let this = unsafe { self.get_unchecked_mut() };
                this.b = self_ptr;
            }

            fn a(self: Pin<&Self>) -> &str {
                &self.get_ref().a
            }

            fn b(self: Pin<&Self>) -> &String {
                assert!(!self.b.is_null(), "Test::b called without Test::init being called first");
                unsafe { &*(self.b) }
            }
        }
        ```

2. [**`Future`**](https://rustwiki.org/zh-CN/std/future/trait.Future.html)

    - **用途**：表示一个异步计算的值。`Future` 是一个 trait，定义了异步计算的生命周期和状态。

    - **示例**：

        ```rust
        use std::future::Future;
        use std::pin::Pin;
        use std::task::{Context, Poll};

        struct MyFuture {
            count: u32,
        }

        impl Future for MyFuture {
            type Output = u32;

            fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
                match self.count {
                    3 => Poll::Ready(3),
                    _ => {
                        self.count += 1;
                        cx.waker().wake_by_ref();
                        Poll::Pending
                    }
                }
            }
        }
        ```

3. **[`Mutex<T>`](https://rustwiki.org/zh-CN/std/sync/struct.Mutex.html) 和 [`RwLock<T>`](https://rustwiki.org/zh-CN/std/sync/struct.RwLock.html)**

    - **用途**：用于多线程环境中的同步。`Mutex<T>` 提供互斥锁，确保同一时间只有一个线程可以访问数据。`RwLock<T>` 提供读写锁，允许多个读取者或一个写入者访问数据。

    - **示例**：

        ```rust
        use std::sync::{Arc, Mutex};
        use std::thread;

        let counter = Arc::new(Mutex::new(0));
        let mut handles = vec![];

        for _ in 0..10 {
            let counter = Arc::clone(&counter);
            let handle = thread::spawn(move || {
                let mut num = counter.lock().unwrap();
                *num += 1;
            });
            handles.push(handle);
        }

        for handle in handles {
            handle.join().unwrap();
        }

        println!("Result: {}", *counter.lock().unwrap());
        ```

4. **`Channel`**

    - **用途**：用于线程间通信。Rust 标准库提供了多种通道类型，如 `mpsc`（多生产者单消费者）、`broadcast`（多生产者多消费者）等。

    - **示例**：

        ```rust
        use std::sync::mpsc;
        use std::thread;

        let (tx, rx) = mpsc::channel();

        thread::spawn(move || {
            let val = String::from("hi");
            tx.send(val).unwrap();
        });

        let received = rx.recv().unwrap();
        println!("Got: {}", received);
        ```

> 提一嘴常见的四种通道类型：mpsc，[标准库](https://rustwiki.org/zh-CN/std/sync/mpsc/index.html)，[tokio](https://docs.rs/tokio/1.15.0/tokio/sync/mpsc/index.html), 多生产者，单消费者模式；oneshot, 单生产者，单消费者，一次只能发送一条消息(标准库没有，只有[tokio有](https://docs.rs/tokio/1.15.0/tokio/sync/oneshot/index.html))；broadcast，多生产者，多消费者，其中每一条发送的消息都可以被所有接收者收到，因此是广播（同样是只有[tokio有](https://docs.rs/tokio/1.38.0/tokio/sync/broadcast/index.html)）；watch，单生产者，多消费者，只保存一条最新的消息，因此接收者只能看到最近的一条消息，例如，这种模式适用于配置文件变化的监听（同样是只有[tokio有](https://docs.rs/tokio/1.38.0/tokio/sync/watch/index.html)）；还有一种特殊的：多生产者、多消费者，且每一条消息只能被其中一个消费者接收，如果有这种需求，可以使用 [async-channel](https://docs.rs/async-channel/latest/async_channel/) 包。

这些类型和概念在 Rust 中用于处理更复杂和高级的编程任务，如异步编程、并发和多线程通信。理解和掌握这些工具可以帮助你更有效地编写高效且安全的 Rust 代码。

---

**我**：还有别的常用类型上面没提到的吗

---

**DeepSeek-Coder-V2**：

当然，Rust 标准库还提供了许多其他常用类型和模块，以下是一些额外的常用类型和概念：

1. **[`Cell<T>`](https://rustwiki.org/zh-CN/std/cell/struct.Cell.html) 和 [`RefCell<T>`](https://rustwiki.org/zh-CN/std/cell/struct.RefCell.html)**

    - **用途**：用于内部可变性。`Cell<T>` 提供了一种在不可变引用中修改值的方式，而 `RefCell<T>` 提供了运行时的借用检查，允许在不可变上下文中进行可变访问。

    - **示例**：

        ```rust
        use std::cell::RefCell;

        let x = RefCell::new(vec![1, 2, 3]);
        x.borrow_mut().push(4);
        ```

2. **[`Cow<T>`](https://rustwiki.org/zh-CN/std/borrow/enum.Cow.html)**

    - **用途**：写时克隆智能指针。`Cow<T>` 代表“Clone-on-Write”，允许在需要时进行数据的克隆，适用于读多写少的场景。

    - **示例**：

        ```rust
        use std::borrow::Cow;

        fn abs_all(input: &mut Cow<[i32]>) {
            for i in 0..input.len() {
                let v = input[i];
                if v < 0 {
                    input.to_mut()[i] = -v;
                }
            }
        }
        ```

3. [**`Duration`**](https://rustwiki.org/zh-CN/std/time/struct.Duration.html)

    - **用途**：表示时间间隔。`Duration` 用于处理时间相关的计算，如延迟、超时等。

    - **示例**：

        ```rust
        use std::time::Duration;

        let five_seconds = Duration::from_secs(5);
        ```

4. **[`Path`](https://rustwiki.org/zh-CN/std/path/struct.Path.html) 和 [`PathBuf`](https://rustwiki.org/zh-CN/std/path/struct.PathBuf.html)**

    - **用途**：用于处理文件系统路径。`Path` 是不可变的路径引用，而 `PathBuf` 是可变的，类似于 `&str` 和 `String` 的关系。

    - **示例**：

        ```rust
        use std::path::PathBuf;

        let mut path = PathBuf::from("/usr/bin");
        path.push("rustc");
        ```

5. **[`OsString`](https://rustwiki.org/zh-CN/std/ffi/struct.OsString.html) 和 [`OsStr`](https://rustwiki.org/zh-CN/std/ffi/struct.OsStr.html)**

    - **用途**：用于处理操作系统相关的字符串。`OsString` 和 `OsStr` 类似于 `String` 和 `&str`，但它们不要求字符串是有效的 UTF-8 编码。

    - **示例**：

        ```rust
        use std::ffi::OsString;

        let os_string = OsString::from("example");
        ```

6. [**`LinkedList<T>`**](https://rustwiki.org/zh-CN/std/collections/struct.LinkedList.html)

    - **用途**：双向链表。`LinkedList<T>` 提供了双向链表的实现，允许在链表的任意位置进行高效的插入和删除操作。

    - **示例**：

        ```rust
        use std::collections::LinkedList;

        let mut list = LinkedList::new();
        list.push_back(1);
        list.push_back(2);
        ```

这些类型和模块在 Rust 编程中也非常常用，它们提供了处理各种特定任务所需的功能和灵活性。理解和掌握这些工具可以帮助你更有效地编写 Rust 代码。

---

感觉比较常用的就这些类型了。

## 常用trait

**我**：可以说说常用的一些trait以及用法吗

---

**DeepSeek-Coder-V2**：

在 Rust 中，trait 是定义共享行为的方式。它们类似于其他语言中的接口，但提供了更多的灵活性和功能。以下是一些常用的 trait 及其用法：

1. **`Debug`**

    - **用途**：用于格式化输出调试信息。通过实现 `Debug` trait，可以在 `println!` 等宏中使用 `{:?}` 格式化字符串。

    - **示例**：

        ```rust
        #[derive(Debug)]
        struct Point {
            x: i32,
            y: i32,
        }

        let p = Point { x: 1, y: 2 };
        println!("{:?}", p);
        ```

2. **`Display`**

    - **用途**：用于格式化输出用户可读的字符串。通过实现 `Display` trait，可以在 `println!` 等宏中使用 `{}` 格式化字符串。

    - **示例**：

        ```rust
        use std::fmt;

        struct Point {
            x: i32,
            y: i32,
        }

        impl fmt::Display for Point {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, "({}, {})", self.x, self.y)
            }
        }

        let p = Point { x: 1, y: 2 };
        println!("{}", p);
        ```

3. **`Clone`**

    - **用途**：用于创建类型的深拷贝。通过实现 `Clone` trait，可以使用 `.clone()` 方法进行克隆。

    - **示例**：

        ```rust
        #[derive(Clone)]
        struct Point {
            x: i32,
            y: i32,
        }

        let p1 = Point { x: 1, y: 2 };
        let p2 = p1.clone();
        ```

4. **`Copy`**

    - **用途**：用于标记类型可以按位复制。通过实现 `Copy` trait，可以在赋值和函数调用时自动进行按位复制。

    - **示例**：

        ```rust
        #[derive(Copy, Clone)]
        struct Point {
            x: i32,
            y: i32,
        }

        let p1 = Point { x: 1, y: 2 };
        let p2 = p1;
        ```

5. **`Default`**

    - **用途**：用于提供类型的默认值。通过实现 `Default` trait，可以使用 `.default()` 方法获取默认值。

    - **示例**：

        ```rust
        #[derive(Default)]
        struct Point {
            x: i32,
            y: i32,
        }

        let p = Point::default();
        ```

6. **`PartialEq` 和 `Eq`**

    - **用途**：用于比较两个值是否相等。`PartialEq` 提供部分相等性比较，而 `Eq` 提供完全相等性比较。

    - **示例**：

        ```rust
        #[derive(PartialEq, Eq)]
        struct Point {
            x: i32,
            y: i32,
        }

        let p1 = Point { x: 1, y: 2 };
        let p2 = Point { x: 1, y: 2 };
        assert_eq!(p1, p2);
        ```

7. **`PartialOrd` 和 `Ord`**

    - **用途**：用于比较两个值的大小。`PartialOrd` 提供部分顺序比较，而 `Ord` 提供完全顺序比较。

    - **示例**：

        ```rust
        #[derive(PartialOrd, Ord, PartialEq, Eq)]
        struct Point {
            x: i32,
            y: i32,
        }

        let p1 = Point { x: 1, y: 2 };
        let p2 = Point { x: 1, y: 3 };
        assert!(p1 < p2);
        ```

8. **`Iterator`**

    - **用途**：用于定义迭代器。通过实现 `Iterator` trait，可以创建自定义的迭代器。

    - **示例**：

        ```rust
        struct Counter {
            count: u32,
        }

        impl Iterator for Counter {
            type Item = u32;

            fn next(&mut self) -> Option<Self::Item> {
                self.count += 1;
                if self.count < 6 {
                    Some(self.count)
                } else {
                    None
                }
            }
        }

        let mut counter = Counter { count: 0 };
        for i in counter {
            println!("{}", i);
        }
        ```

9. **`From` 和 `Into`**

    - **用途**：用于类型转换。`From` trait 提供了一种类型转换为另一种类型的方法，而 `Into` trait 是 `From` 的逆操作。

    - **示例**：

        ```rust
        struct Point {
            x: i32,
            y: i32,
        }

        impl From<(i32, i32)> for Point {
            fn from((x, y): (i32, i32)) -> Self {
                Point { x, y }
            }
        }

        let p: Point = (1, 2).into();
        ```

10. **`AsRef` 和 `AsMut`**

    - **用途**：用于类型之间的引用转换。`AsRef` 提供不可变引用转换，而 `AsMut` 提供可变引用转换。

    - **示例**：

        ```rust
        struct Point {
            x: i32,
            y: i32,
        }

        impl AsRef<Point> for Point {
            fn as_ref(&self) -> &Point {
                self
            }
        }

        let p = Point { x: 1, y: 2 };
        let p_ref: &Point = p.as_ref();
        ```

这些 trait 在 Rust 编程中非常常用，它们提供了处理各种常见任务所需的功能和灵活性。理解和掌握这些 trait 可以帮助你更有效地编写 Rust 代码。

---

**我**：还有没有别的常用的trait没提到，比如像Deref等等，尽可能多的说一下

---

**DeepSeek-Coder-V2**：

当然，Rust 标准库中还有许多其他常用的 trait，以下是一些额外的常用 trait 及其用法：

1. **`Deref` 和 `DerefMut`**

    - **用途**：用于实现智能指针。`Deref` trait 允许类型像引用一样工作，而 `DerefMut` 允许类型像可变引用一样工作。

    - **示例**：

        ```rust
        use std::ops::Deref;

        struct MyBox<T>(T);

        impl<T> Deref for MyBox<T> {
            type Target = T;

            fn deref(&self) -> &T {
                &self.0
            }
        }

        let x = MyBox(5);
        assert_eq!(*x, 5);
        ```

2. **`Drop`**

    - **用途**：用于定义类型的析构行为。通过实现 `Drop` trait，可以在变量离开作用域时执行自定义的清理代码。

    - **示例**：

        ```rust
        struct CustomSmartPointer {
            data: String,
        }

        impl Drop for CustomSmartPointer {
            fn drop(&mut self) {
                println!("Dropping CustomSmartPointer with data `{}`!", self.data);
            }
        }

        let c = CustomSmartPointer { data: String::from("my stuff") };
        ```

3. **`Fn`、`FnMut` 和 `FnOnce`**

    - **用途**：用于定义闭包。`Fn` trait 表示不可变闭包，`FnMut` 表示可变闭包，`FnOnce` 表示只能调用一次的闭包。

    - **示例**：

        ```rust
        fn call_with_one<F>(some_closure: F) -> i32
        where
            F: Fn(i32) -> i32,
        {
            some_closure(1)
        }

        let double = |x| x * 2;
        assert_eq!(call_with_one(double), 2);
        ```

4. **`Add`、`Sub`、`Mul`、`Div` 等算术 trait**

    - **用途**：用于定义算术运算。这些 trait 允许自定义类型进行加、减、乘、除等算术操作。

    - **示例**：

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

        let p1 = Point { x: 1, y: 0 };
        let p2 = Point { x: 2, y: 3 };
        assert_eq!(p1 + p2, Point { x: 3, y: 3 });
        ```

5. **`Index` 和 `IndexMut`**

    - **用途**：用于通过索引访问元素。`Index` trait 允许通过索引访问不可变元素，而 `IndexMut` 允许通过索引访问可变元素。

    - **示例**：

        ```rust
        use std::ops::Index;

        struct Matrix {
            data: Vec<Vec<i32>>,
        }

        impl Index<usize> for Matrix {
            type Output = Vec<i32>;

            fn index(&self, index: usize) -> &Vec<i32> {
                &self.data[index]
            }
        }

        let matrix = Matrix {
            data: vec![vec![1, 2, 3], vec![4, 5, 6]],
        };

        assert_eq!(matrix[0][1], 2);
        ```

6. **`ToOwned`**

    - **用途**：用于从借用数据创建拥有数据。`ToOwned` trait 允许从借用数据创建拥有数据，类似于 `Clone`，但更通用。

    - **示例**：

        ```rust
        use std::borrow::ToOwned;

        let s: &str = "hello";
        let owned: String = s.to_owned();
        ```

7. **`Borrow` 和 `BorrowMut`**

    - **用途**：用于获取类型的借用。`Borrow` trait 允许获取不可变借用，而 `BorrowMut` 允许获取可变借用。

    - **示例**：

        ```rust
        use std::borrow::Borrow;

        struct MyStruct {
            data: String,
        }

        impl Borrow<str> for MyStruct {
            fn borrow(&self) -> &str {
                &self.data
            }
        }

        let my_struct = MyStruct { data: String::from("hello") };
        let s: &str = my_struct.borrow();
        ```

这些 trait 在 Rust 编程中也非常常用，它们提供了处理各种特定任务所需的功能和灵活性。理解和掌握这些 trait 可以帮助你更有效地编写 Rust 代码。

---

在学习编程方面，AI确实好使，有时候Rust的报错不知道怎么改，比如所有权、生命周期之类的问题，将代码、报错丢给AI改就能改好，当然并不是所有问题都能解决，但是对于我这种入门萌新还是能解决绝大部分问题的（小声）