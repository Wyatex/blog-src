---
title: moonbit入门-1
date: 2026-10-25 17:46:29
categories: MoonBit
tags:
- MoonBit
---

作为一名资深的 JS/TS 开发者，你一定经历过这些痛点：**TypeScript 的类型在运行时被擦除（没有真正的运行时类型安全）、所有数字都是 `number`（双精度浮点）、缺乏原生的模式匹配（Pattern Matching）、错误处理里 `catch (e: unknown)` 完全丢失类型信息**；而当你看向 Rust 时，又会觉得为了写业务逻辑去伺候生命周期（`'a`）和借用检查器（Borrow Checker）心智负担过重。

**MoonBit（月兔）** 恰好站在了 TS 与 Rust 的黄金交叉点上：**它拥有类似 Rust/OCaml 的强静态类型、代数数据类型（ADT）和极致性能，但带有自动内存管理（针对 JS/Wasm-GC 复用宿主 GC，针对 Native/线性 Wasm 采用 Perceus 引用计数），且将 JavaScript 作为一等公民编译目标**。

**MoonBit `v0.10.17`** 是迈向 1.0 正式版前最成熟、语法高度收敛的版本。下文将结合你的 JS/TS 背景，从基础心智切换一路讲到 `0.10.x` 最惊艳的高阶与优雅语法。

<!-- more -->

---

## 一、 基础语法：从 TypeScript 切换心智模型

### 1. 变量绑定与“万物皆表达式”
在 TS 中，`const` 表示引用不可变，`let` 表示可变；而在 MoonBit 中：
* `let`：不可变绑定（类似 `const`）。
* `let mut`：可变绑定（类似 `let`）。**注意：`0.10.x` 极其严格，如果声明了 `let mut` 却从未修改，编译器会直接报错；如果误写 JS 的 `var x = 1`，编译器会给出迁移提示让你改用 `let mut`。**
* **万物皆表达式（Everything is an Expression）**：在 TS 里你想根据条件初始化一个 `const`，往往要写三元运算符或 IIFE（立即执行函数）。在 MoonBit 中，`if/else`、`match`、代码块 `{}` 甚至循环都是表达式，最后一个值就是返回值：

```moonbit
fn main {
  let score = 85
  // if-else 直接作为表达式返回值，无需三元运算符
  let level = if score >= 90 {
    "S"
  } else if score >= 80 {
    "A"
  } else {
    "B"
  }

  // 代码块 {} 也是表达式，内部拥有独立词法作用域
  let final_score = {
    let bonus = 10
    score + bonus // 最后一行没有分号，作为块的值返回
  }

  // 注意！MoonBit 的字符串插值是 \{expr}，而不是 JS 的 ${expr}
  println("Level: \{level}, Score: \{final_score}")
}
```

### 2. 告别 `number` 一把梭：精准数值与“字面量重载”
TS 只有 `number` 和 `bigint`，而 MoonBit 提供了精确的底层类型：`Int`（即 `Int32`）、`Int64`、`UInt`、`Double`（64位浮点）、`Float`、`BigInt`、`Byte`、`Bytes`。

写底层类型最烦的是到处写类型后缀（如 `42L`、`42U`）。MoonBit 提供了一个极其优雅的特性——**字面量重载（Overloaded Literals）**。只要上下文能推导出期望类型，字面量会自动适配，连数组和字节流都能重载：

```moonbit
test "overloaded literals" {
  let a : Int = 42          // 默认 Int32
  let b : Int64 = 42        // 自动重载为 64 位整数，无需写 42L
  let c : Double = 42       // 自动重载为浮点数 42.0
  let d : BigInt = 1_000_000 // 支持任意位置下划线分隔

  // 数组字面量默认是动态扩容的 Array[T]，但可根据类型标注自动重载为：
  let fixed : FixedArray[Int] = [1, 2, 3] // 定长数组（性能更高，0.10+ JS FFI 边界首选）
  let str : String = ['M', 'o', 'o', 'n'] // Char 数组直接重载为 String
  let bytes : Bytes = [b'h', b'i', 0x21]  // 甚至混合 Byte 与整数重载为不可变 Bytes！

  // 0.10.4 新增：Bytes 也支持原生 UTF-8 字符串插值
  let packet : Bytes = b"len=\{bytes.length()}"
  inspect(str, content="Moon")
  inspect(packet, content="b\"len=3\"")
}
```
> **⚠️ `0.10.x` 避坑指南（空大括号歧义 E0082）**：
> 在 JS 中 `{}` 是空对象，但在 MoonBit 中 `{}` 可能是空代码块、空 Map、空 Struct 或空 JSON。从 `0.10.4` 起，单独写 `{}` 会触发编译器歧义警告。请显式写出意图：
> * 空 Map：`Map([])`（非空可直接写 `{ "a": 1, "b": 2 }`）
> * 空 JSON 对象：`Json::empty_object()`
> * 空结构体：`MyStruct::{}`
> * 空 Unit 块：`{ () }`

### 3. 多行字符串与安全切片视图（Clamped Slicing）
* **原生多行字符串**：告别 JS 模板字符串缩进难看的问题，MoonBit 使用 `#|`（原始字符串，不转义）或 `$|`（支持 `\{}` 插值与转义）：
  ```moonbit
  let name = "TS Developer"
  let banner =
    $|Hello, \{name}!
    $|Welcome to MoonBit 0.10.17.
  ```
* **零拷贝视图（Views）与安全边界截断**：
  对 `Array`、`String`、`Bytes` 进行切片 `data[start:end]` 会生成零拷贝的 `ArrayView[T]`、`StringView`、`BytesView`。
  在 **`0.10.14`** 中，切片语法 `a[i:j]` 升级为了 **Clamped Slicing（安全边界收敛，类似 JS 的 `Array.prototype.slice`）**——即使索引超出范围也不会在运行时 Panic 崩溃，而是自动收敛到合法边界（如果你需要越界即崩溃的严格切片，调用 `a.exact_view(start=..., end=...)`）。

---

## 二、 函数与现代控制流：零开销的工程化表达

### 1. 顶层显式签名 vs 局部全自动推导
MoonBit 的设计哲学是**“模块边界清晰，内部实现轻快”**：
* **顶层函数**必须写明参数和返回值类型（这使得编译器能做到毫秒级增量并行编译，并自动生成 `.mbti` 公共接口文件供 Code Review）。
* **局部函数与箭头函数**完全自动推导类型，写法与 JS 箭头函数一模一样：

```moonbit
// 顶层函数：类型签名清晰（注：入口函数是无参无括号的 fn main { ... }）
pub fn process_scores(scores : Array[Int]) -> Array[Int] {
  // 箭头函数直接传给高阶方法，语法与 JS 一致
  scores.filter(x => x >= 60).map(x => x + 5)
}
```
如果在函数内部需要定义**相互递归（Mutually Recursive）**的局部函数，可以使用 `letrec ... and ...`：
```moonbit
letrec is_even = n => if n == 0 { true } else { is_odd(n - 1) }
and is_odd = n => if n == 0 { false } else { is_even(n - 1) }
```

### 2. 语言级命名参数、可选参数与调用点自动注入
在 TS 中，当函数有 3 个以上参数或可选配置时，我们通常得定义一个 `interface Options` 并传入对象 `{ width: 1920, height?: 1080 }`，这在运行时会产生一次堆对象分配。
MoonBit 在语言层面直接支持**零分配开销**的命名参数（`label~`）与可选参数：

```moonbit
// 1. port~ : Int = 80  --> 带默认值的可选命名参数
// 2. timeout? : Int    --> 无默认值的可选参数，函数内自动变为 Option[Int] (即 Int?)
// 3. #callsite(autofill(loc)) --> 编译器在调用处自动注入源码文件名和行列号！
#callsite(autofill(loc))
pub fn connect(
  host~ : String,
  port~ : Int = 80,
  timeout? : Int,
  loc~ : SourceLoc
) -> String {
  let t_info = match timeout {
    Some(t) => "\{t}ms"
    None => "default"
  }
  "[\{loc}] Connecting to \{host}:\{port} (timeout: \{t_info})"
}

test "labelled and optional args" {
  let host = "localhost"
  // 支持同名简写 `host~`（等价于 JS 对象的 `{ host }` 简写，即 `host=host`）
  // 传 `timeout=3000` 时编译器自动用 `Some(3000)` 包装！无需手动写 Some
  let log1 = connect(host~, timeout=3000)

  // 如果手里已经有一个 Option 值想透传，用 `timeout?` 语法即可转发：
  let opt_t : Int? = None
  let log2 = connect(host="example.com", port=443, timeout?=opt_t)
}
```

### 3. 函数式 `for` 循环与 `nobreak` 块
MoonBit 的 `for` 循环看起来像 C/JS，但内核其实是**纯正的函数式状态机**！
循环变量在每次迭代体内都是**不可变的（Immutable）**（彻底告别 JS 循环闭包捕获同一个变量的经典 Bug），并且支持多个状态变量**并行同步更新**，还能通过 `nobreak` 块直接返回计算结果：

```moonbit
// 用 for 循环优雅写出无可变变量的斐波那契数列
fn fib(n : Int) -> Int64 {
  // i, a, b 在每次更新时是【同时】基于上一轮的值计算的！无需中间临时变量 temp！
  for i = 0, a = 0L, b = 1L; i < n; i = i + 1, a = b, b = a + b {
    // 循环体甚至可以为空，或者通过 `continue i + 1, b, a + b` 显式跳转状态
  } nobreak {
    a // 当循环正常结束（未被 break 打断）时，返回 a 作为整个 for 表达式的值
  }
}
```
在 `0.10.x` 中，`for .. in` 循环同样极其强大：
* **范围迭代**：`for i in 0..<10`（左闭右开）、`0..<=10`（闭区间）、`10>..0`（倒序）。
* **双变量迭代与直接解构（0.10.14 增强）**：
  ```moonbit
  // 遍历数组自带索引：
  for index, item in ["a", "b", "c"] { println("\{index}: \{item}") }
  // 遍历 Map 直接拿 key, value：
  for k, v in { "x": 1, "y": 2 } { println("\{k} -> \{v}") }
  // 直接解构元组或结构体：
  for (name, count) in [("Apple", 2), ("Pear", 3)] { println("\{name}: \{count}") }
  ```

### 4. 结构化资源清理：`defer` 与 `0.10.9` 新增的 `errdefer`
在 TS 中，为了释放锁或关闭连接，你必须套一层 `try { ... } finally { ... }`，导致代码缩进加深。
MoonBit 提供了类似 Go 的 `defer`，并且在 **`0.10.9`** 中引入了类似 Zig 的王牌特性 **`errdefer`**：
* `defer <cleanup>`：无论当前作用域是正常结束、提前 `return` 还是抛出异常，离开作用域时**必定执行**（多个 `defer` 按后进先出逆序执行）。
* `errdefer <cleanup>`：**仅在后续代码抛出错误（`raise`）或异步任务被取消（Cancelled）时才触发清理！** 如果函数正常返回，把资源所有权交给了调用方，则不会触发 `errdefer`。

```moonbit
// 典型的资源构造器模式：正常返回时不关闭，初始化中途报错时自动回滚关闭！
fn open_and_init_db(path : String) -> Database raise DbError {
  let db = Database::connect(path)
  errdefer db.close() // 只有下面这行抛错时，才会自动调用 db.close() 防止泄漏！

  db.run_migrations() // 假如这里 raise DbError，上面的 errdefer 会立即执行并重抛错误
  db                  // 正常执行到这里返回 db，errdefer 不会触发
}
```

---

## 三、 代数数据类型（ADT）与神级模式匹配

### 1. Struct 与真正的 Enum（完爆 TS Discriminated Unions）
在 TS 中，我们用 `type Shape = { kind: "circle"; r: number } | { kind: "rect"; w: number; h: number }` 模拟代数数据类型。而在 MoonBit 中，`struct` 和 `enum` 是紧凑的原生类型：

```moonbit
struct User {
  id : Int
  name : String
  mut email : String // 字段级可变性控制
} derive(Eq, Debug)  // 0.10.x 推荐使用 Debug 替代已废弃的 derive(Show)

// 0.10.4+ 推荐显式将 Debug 的方法挂载到类型上（下文 Trait 章节详解）
pub extend User with Debug::{to_repr}

// 自定义构造器（0.10.4 起支持为任意类型定义 fn Type::Type 构造器）
fn User::User(id : Int, name~ : String, email~ : String = "") -> User {
  { id, name, email } // 同名字段简写，与 JS 一致
}

// Enum 支持无参、位置参数、命名参数、甚至可变字段
enum WebEvent {
  PageLoad
  Click(x~ : Int, y~ : Int)
  KeyPress(Char)
} derive(Debug)
```
Struct 同样支持类似 JS 展开运算符的**不可变更新语法**：`let updated = { ..user, name: "New Name" }`。

> **💡 `0.10.14` 库作者特性：`#non_exhaustive` 枚举与 `Type::..`**
> 如果你发布的公共库里有一个 `enum` 未来还会新增分支，可以加上 `#non_exhaustive` 注解。下游用户在跨包 `match` 时，除了匹配已知分支外，必须写上 `MyEnum::.. => fallback()` 分支；一旦你的库升级新增了枚举项，下游编译时会收到精准警告提醒补全，同时旧代码又不会崩溃。

### 2. 解构万物：Array 切片、Map 与原生 JSON 模式匹配
在 TS 里处理外部 JSON 或复杂数组结构，往往要写一堆 `Array.isArray()`、`typeof x === 'object'` 或引入 Zod。在 MoonBit 中，**`match` 可以直接对数组切片、Map 甚至 `Json` 进行深度结构化匹配**：

```moonbit
// 1. 直接对 Json 字面量进行结构化匹配与提取！
fn extract_admin_email(data : Json) -> String? {
  match data {
    // 直接按 JSON 结构匹配对象和数组切片 [首元素, ..其余]
    {
      "status": "ok",
      "users": [{ "role": "admin", "email": String(email), .. }, ..],
      ..
    } => Some(email)
    _ => None
  }
}

// 2. 数组/视图首尾解构（写 Parser 或递归算法极其清爽）
fn is_palindrome(chars : ArrayView[Char]) -> Bool {
  match chars {
    [] | [_] => true
    // 同时匹配头部第一个元素 a、尾部最后一个元素 b，中间切片自动绑定为 rest！
    [a, ..rest, b] if a == b => is_palindrome(rest)
    _ => false
  }
}
```

### 3. 消灭缩进金字塔：`is` 表达式、`guard` / `guard!` 与 `with` 默认绑定
在 TS 中我们习惯写 Early Return（卫语句）：`if (!user) return null;`。但在模式匹配语言里，如果每次解构 `Option` 或 `Enum` 都写 `match`，代码会向右缩进成“金字塔”。
MoonBit 用 **`is` 表达式 + `guard` 语句** 完美解决了这个问题：

```moonbit
// `is` 表达式可以在 if 或 guard 中直接做模式匹配，并将提取的变量注入后续作用域！
fn process_resource(map : Map[String, WebEvent], key : String) -> String {
  // 1. guard ... else：如果不满足模式，则执行 else 分支提前退出；
  //    满足则提取出的 `event` 变量在下方平级作用域直接可用！零缩进！
  guard map.get(key) is Some(event) else { return "Key not found" }

  // 2. is 表达式也可以直接用在普通 if 条件中，且支持 && 串联使用刚提取的变量！
  if event is Click(x~, y~) && x > 0 && y > 0 {
    return "Valid click at (\{x}, \{y})"
  }

  // 3. 0.10.9 新规：如果你确信某个模式必定匹配（否则直接 Panic），使用 `guard!`
  //    （不带 else 的普通 guard 现在会进行穷尽性检查，非穷尽会报警告 E0087）
  let sure_val : Int? = Some(42)
  guard! sure_val is Some(n)
  "Fallback: \{n}"
}
```

**`0.10.4` & `0.10.9` 新增：Or-Pattern 默认变量绑定（`with`）**
当多个匹配分支逻辑相同，但其中一个分支缺少某个绑定变量时，可以用 `(Pattern with var = default)` 提供默认值（`0.10.9` 起要求为带 `with` 的分支加上括号以明确优先级）：
```moonbit
fn greet(opt_name : String?) -> String {
  match opt_name {
    Some(name) | (None with name = "Anonymous") => "Hello, \{name}!"
  }
}
```

### 4. 降维打击：Bitstring 位级匹配与 `lexmatch` / `lexscan` 正则状态机
如果你需要写网络协议解析、二进制文件处理或词法分析器，MoonBit `0.10.x` 提供了两个杀手级特性：
1. **Bitstring Pattern（位串模式匹配）**：直接按比特位宽解构 `Bytes` / `BytesView`（`0.10.9` 甚至加入了提取 16 字节 SIMD 向量的 `v128le`）：
   ```moonbit
   fn parse_header(packet : BytesView) -> (Int, Int)? {
     match packet {
       // 直接按大端序提取前 4 bit 为 version，接着 12 bit 为 length，剩余字节为 payload
       [u4be(version), u12be(length), ..payload] => Some((version.to_int(), length.to_int()))
       _ => None
     }
   }
   ```
2. **`lexmatch` 与 `lexscan`（`0.10.9` 正式稳定）**：
   不同于 JS 正则表达式在运行时动态解析且存在回溯性能隐患，MoonBit 的 `re"..."` 字面量配合 `lexmatch`（针对 `String`/`StringView`）和 `lexscan`（针对流式 `Lexbuf`/`AsyncLexbuf`/`StringScanner`）会在编译期直接生成高效静态自动机，并支持 `with longest`（最长匹配原则）：
   ```moonbit
   fn split_first_line(s : StringView) -> (StringView, StringView)? {
     lexmatch s {
       // 匹配换行符，自动将匹配前的切片绑定到 line，匹配后的剩余切片绑定到 rest
       (re"\r?\n", before=line, after=rest) => Some((line, rest))
       _ => None
     }
   }
   ```

---

## 四、 Trait 系统与方法设计（`0.10.x` 核心演进）

作为 TS 开发者，你可以把 MoonBit 的 `trait` 理解为 **“无需显式 `implements` 声明、支持事后为外部类型扩展实现的 `interface`（即 Rust 的 Trait / Haskell 的 Typeclass）”**。

在 **`v0.10.0` 到 `v0.10.17`** 期间，MoonBit 的 Trait 语法完成了最关键的三项现代化改造，看懂这部分你就能写出最地道的 `0.10.17` 代码：

### 1. `trait` 与 `impl` 统一要求 `fn` 关键字，并支持多态方法
从 `0.10.0` 开始，定义和实现 Trait 方法都加上了 `fn` 关键字，这使得 **Trait 内部的方法可以拥有自己独立的泛型参数**：

```moonbit
pub(open) trait Serializer {
  // Trait 方法自身可以带泛型参数 [T : Show]
  fn[T : Show] write_item(Self, T) -> Unit
}
```

### 2. 废除隐式方法提升，引入显式 `extend Type with Trait`（重要！）
在旧版 MoonBit（以及 Rust）中，只要写了 `impl Trait for MyType`，就能直接用点语法调 `my_val.trait_method()`。但这种隐式行为会导致严重的上游重构隐患：一旦上游某个 Trait 新增了一个带默认实现的方法，下游的代码就可能因为点调用重名冲突而挂掉。

因此，在 **`0.10.4` ~ `0.10.17`** 中，隐式将 `impl` 提升为点方法已被标记为废弃警告（`implicit_impl_as_method`）。**现在的标准做法是使用 `extend`（或公开导出的 `pub extend`）显式声明哪些 Trait 方法允许通过 `.method()` 点语法调用**：

```moonbit
pub(open) trait Area {
  fn area(Self) -> Double
  // 带 `= _` 表示该方法有默认实现
  fn print_area(Self) -> Unit = _
}

// 默认实现
impl Area with fn print_area(self) {
  println("Area is \{Area::area(self)}")
}

struct Circle { r : Double }

// 1. 实现 Trait
pub impl Area for Circle with fn area(self) {
  3.14159 * self.r * self.r
}

// 2. 【0.10.x 核心规范】显式将 area 和 print_area 挂载为 Circle 的点方法！
//    如果不写这行，外部只能用 `Area::area(c)` 调用，写 `c.area()` 会触发非推荐警告
pub extend Circle with Area::{area, print_area}

// 3. 固有方法（Inherent Method）：直接用 `Type::method` 定义
pub fn Circle::scale(self : Circle, factor : Double) -> Circle {
  { r: self.r * factor }
}

test "trait and extend" {
  let c = Circle::{ r: 2.0 }
  inspect(c.scale(2.0).area(), content="50.26544")
}
```

### 3. 动态分发 Trait Object (`&Trait`) 与运算符重载
* **Trait Object (`&Trait`)**：当你需要像 TS 的 `Animal[]` 那样把不同具体类型的实例放进同一个数组时，使用 `&Trait` 即可将其擦除为胖指针（前提是该 Trait 满足对象安全：`Self` 仅作为第一个参数出现）：
  ```moonbit
  let shapes : Array[&Area] = [c1, rect1] // 自动装箱为 &Area
  for s in shapes { println(s.area()) }
  ```
* **运算符与索引重载**：实现内置的 `Add`、`Sub`、`Eq`、`Compare` 等 Trait 即可重载 `+`、`-`、`==`、`<`；通过给方法加上 `#alias("_[_]")`、`#alias("_[_]=_")`、`#alias("_[_:_]")` 属性，你可以让自定义类型支持像 JS 对象/数组一样的 `obj[key]`、`obj[key] = val` 和切片 `obj[1:5]` 语法！

---

## 五、 高阶与优雅语法：MoonBit 最令人上瘾的设计

### 1. 受检错误（Checked Errors）与“错误多态（`raise?`）”
这是 MoonBit 最惊艳的设计之一。
* 在 TS 中，`throw` 是完全不受检的，调用者根本不知道一个函数会不会抛异常。
* 在 Rust 中，`Result<T, E>` 虽然安全，但到处要写 `Ok(...)` 包装返回值，且在高阶函数（如 `map`）里混用抛错回调和不抛错回调极其痛苦（需要用 `map` vs `try_for_each` 或 `collect::<Result<Vec<_>, _>>()`）。

MoonBit 发明了一套**编译器静态追踪的受检异常系统（Checked Errors）**，兼顾了 TS 写法的直白与 Rust 的类型安全：

1. **用 `suberror` 定义强类型错误**（底层全部自动归属于顶层 `Error` 类型）：
   ```moonbit
   suberror ParseError {
     EmptyInput
     InvalidDigit(Char)
   } derive(Debug)
   pub extend ParseError with Debug::{to_repr}
   ```
2. **在函数签名用 `raise ErrorType` 声明**，正常返回时**直接裸写返回值**（不需要写 `Ok(val)`！），调子函数时**自动向上冒泡传播**（不需要写 `?` 或旧版的 `!`！）：
   ```moonbit
   fn parse_digit(c : Char) -> Int raise ParseError {
     if c >= '0' && c <= '9' {
       c.to_int() - '0'.to_int() // 直接返回 Int，无需 Ok() 包装！
     } else {
       raise InvalidDigit(c)
     }
   }

   fn parse_two_digits(s : String) -> Int raise ParseError {
     if s.length() < 2 { raise EmptyInput }
     // 调用可能抛错的函数，错误会自动向上冒泡！完全不用写 try 或 ?
     let d1 = parse_digit(s.code_unit_at(0).unsafe_to_char())
     let d2 = parse_digit(s.code_unit_at(1).unsafe_to_char())
     d1 * 10 + d2
   }
   ```
3. **拦截与处理：`try ... catch ... noraise`**（以及 `0.10.14` 新增的 `SubError::_` 类型收窄）：
   ```moonbit
   test "error handling" {
     // 1. 完整形式：try ... catch ... noraise
     let msg = try parse_two_digits("4a") catch {
       EmptyInput => "empty"
       InvalidDigit(c) => "bad char: \{c}"
     } noraise {
       num => "success: \{num}"
     }
     inspect(msg, content="bad char: a")

     // 2. 极简形式：单行表达式甚至可以省略 `try` 关键字，直接后接 `catch` 提供兜底值！
     let val = parse_two_digits("99") catch { _ => 0 }
     assert_eq(val, 99)

     // 3. 确定不会错、错就直接 Panic：使用 `try!`
     let sure = try! parse_two_digits("12")
     assert_eq(sure, 12)
   }
   ```
   > **✨ `0.10.14` 新增 `MySubError::_` 模式**：当你捕获顶层宽泛的 `Error` 时，可以用 `ParseError::_ as e => ...` 一次性匹配 `ParseError` 下的所有构造器，并将 `e` 的类型精确收窄（Narrowing）为 `ParseError`（就像 TS 的 `e instanceof ParseError` 一样丝滑，但完全是编译期静态类型检查）！

4. **高阶函数的终极优雅——错误多态（Error Polymorphism `raise?`）**：
   在 MoonBit 中，标准库的 `Array::map` 签名是：
   ```moonbit
   pub fn[T, U] Array::map(self : Array[T], f : (T) -> U raise?) -> Array[U] raise?
   ```
   看到那个 **`raise?`** 了吗？
   * 当你传给 `map` 的箭头函数**不抛错（`noraise`）**时，`arr.map(x => x + 1)` 自身就是 `noraise` 的普通调用！
   * 当你传给 `map` 的箭头函数**会抛错（`raise ParseError`）**时，`arr.map(c => parse_digit(c))` 会自动变成抛出 `ParseError` 的调用！
   一套高阶函数同时服务纯函数与异常上下文，彻底消除了“函数染色”问题！

### 2. 管道操作符（`|>` / `<|`）与级联操作符（`..`）
* **正向管道 `|>`**：将左侧的值作为**第一个参数**传给右侧的函数（`x |> f(a, b)` 等价于 `f(x, a, b)`）。在 `0.10.14` 中，管道右侧如果是匿名函数 `x |> v => { ... }`，内部甚至可以直接调用 `async` 异步函数。
* **反向管道 `<|`**：用于消除尾随括号嵌套，尤其适合写声明式 UI / HTML DSL（如 MoonBit 官方前端框架 Rabbita）：
  ```moonbit
  // div(class="card") <| [ h1 <| [text("Title")], p <| [text("Body")] ]
  ```
* **级联操作符 `..`（Cascade Operator）**：
  在 JS 中，如果一个类的 `append()` 方法返回 `void`（`Unit`），你就没法链式调用 `buf.append("a").append("b")`，除非作者特意 `return this`。
  MoonBit 提供了 Smalltalk/Dart 风格的 **`..` 级联操作符**——它会调用方法，丢弃其 `Unit` 返回值，并**继续返回原接收者对象本身**！
  ```moonbit
  let result = StringBuilder::new()
    ..write_string("Hello, ") // 返回 StringBuilder 自身
    ..write_string("MoonBit ")
    ..write_object(2026)
    .to_string()              // 最后一个用单点 `.`，返回最终的 String！
  ```

### 3. 零开销模板写入（`<+` 与 `<?`）
在写后端、编译器代码生成或拼接长文本时，频繁调用 `StringBuilder::write_string` 很啰嗦，而拼接字符串又有内存分配开销。`0.10.0` 引入了**模板写入语法 `<+` 与条件模板写入语法 `<?`**：
```moonbit
fn render_log(buf : StringBuilder, debug_logger : StringBuilder?, user : String) -> Unit {
  // `<+` 会被编译器直接展开为多次底层 write 调用，零中间字符串分配！
  buf <+ "User \{user} logged in.\n"

  // `<?` 接收一个 Option[Logger]，只有当 debug_logger 为 Some(logger) 时，
  // 才会执行右侧的格式化与写入；如果是 None，右侧连求值开销都不会发生！
  debug_logger <? "[DEBUG] Detailed state for \{user}\n"
}
```

### 4. 列表推导式、显式惰性迭代器 `[| ... |]` 与条件展开
MoonBit `0.10.x` 在集合构造上的表现力堪称艺术：
```moonbit
test "collection elegance" {
  // 1. 列表推导式（List Comprehension）：支持范围、多变量、if 守卫（甚至在守卫里用 is 解构！）
  let evens = [ for x in 0..<10 if x % 2 == 0 => x * x ]

  // 配合字面量重载，列表推导式甚至能直接生成 String 或 Bytes！
  let alphabet : String = [ for i in 0..<26 => ('a'.to_int() + i).unsafe_to_char() ]

  // 2. 0.10.4 新增：条件展开（Conditional Spread `..if`）
  //    在 JS 里要写 `[1, ...(includeExtra ? extra : []), 2]`，会产生临时空数组；
  //    在 MoonBit 里直接内联写 `..if cond { extra }`，零额外分配！
  let extra = [10, 20]
  let include_extra = true
  let list = [1, 2, ..if include_extra { extra }, 3]

  // 3. 0.10.4 新增：显式惰性迭代器字面量 `[| ... |]`
  //    普通 `[ ... ]` 是立即求值的，而 `[| ... |]` 构造的是惰性求值的 Iter[T]！
  let lazy_seq : Iter[Int] = [| for x in 0..<1_000_000 if x % 2 == 0 => x |]
  let first_three = lazy_seq.take(3).collect() // 只计算前 3 个元素！
  inspect(first_three, content="[0, 2, 4]")
}
```

---

## 六、 异步并发、JS/TS 互操作与现代工具链

### 1. 无 `await` 的结构化并发（`moonbitlang/async` v0.22.1）
在 JS/TS 中，调用异步函数要是忘写 `await`，就会拿到一个悬空的 `Promise<T>` 引发隐蔽 Bug。
MoonBit 的异步设计是：**声明异步函数用 `async fn`，但调用异步函数时不需要写 `await`！** 编译器根据被调函数的签名自动识别挂起点。
* **结构化并发**：通过 `@async.with_task_group(group => { group.spawn_bg(() => ...) })` 管理并发任务，父作用域退出前自动等待所有子任务完成或统一取消。
* **`0.10.14` (`async v0.22.1`) 取消语义升级**：异步任务的取消信号（Cancellation Signal）现在是编译器底层原语，不再是一个普通 Error——因此它**不会被业务里的 `catch { _ => ... }` 意外吞掉**，但依然能可靠触发沿途所有的 `defer` 和 `errdefer` 进行资源回收！不可取消的底层清理函数则使用新增的关键字 `nocancel` 标注。

### 2. 与 JS / TS 生态无缝互操作（FFI）
MoonBit 的 `--target js` 并不是把 Wasm 包一层胶水，而是**直接通过全局优化编译成极其干净、V8 引擎高度友好的原生 JavaScript 代码**。
* **在 MoonBit 中调用 JS**：
  ```moonbit
  // 直接内联写 JS 箭头函数绑定宿主 API
  extern "js" fn performance_now() -> Double = "() => performance.now()"
  ```
* **导出 MoonBit 函数给 TS/Vite 调用（`0.10.4` 新增 `#export_name`）**：
  在 `moon.pkg` 中配置 `pkgtype(kind: "foreign_library")` 后，使用 `#export_name` 即可导出干净的符号：
  ```moonbit
  // 注意：0.10.14 起，在 JS FFI 边界传递数组推荐使用 FixedArray[T] 而非 Array[T]
  #export_name("computeHeavyTask")
  pub fn compute_heavy_task(input : FixedArray[Double]) -> Double {
    input.fold(init=0.0, (acc, x) => acc + x * x)
  }
  ```
  在前端工程中，你可以通过社区的 `vite-plugin-moonbit` 直接在 TypeScript 中 `import` MoonBit 模块，享受强类型与高性能。

### 3. 开箱即用的测试体验与 `.mbtx` 脚本模式
作为 TS 开发者，你一定受够了配置 Jest / Vitest / ts-node / ESLint / Prettier 的繁琐。MoonBit 用一个二进制命令 `moon` 搞定了一切，并内建了三项神级工程特性：
1. **自动更新的快照测试（`inspect` / `debug_inspect`）**：
   写测试时你根本不用自己算期望输出！直接写：
   ```moonbit
   test "snapshot" {
     let result = [1, 2, 3].map(x => x * 10)
     debug_inspect(result) // 先留空 content！
   }
   ```
   然后在终端运行 **`moon test --update`**，编译器会执行测试并**自动修改你的源码文件**，把结果回填成 `debug_inspect(result, content="[10, 20, 30]")`！
2. **原生属性测试（QuickCheck + `0.10.14` `derive(Shrink)`）**：
   只需给你的数据结构加上 `derive(Arbitrary, Shrink, Debug)`，就能用 `@qc.check` 自动生成成百上千个随机边界用例进行轰炸测试，并在失败时自动把反例缩减（Shrink）到最小复现输入。
3. **配置文件去 JSON 化与 `.mbtx` 单文件脚本（`0.10.x` 新特性）**：
   * 以前的 `moon.mod.json` 和 `moon.pkg.json` 现已全面迁移为更简洁、支持注释的 `moon.mod` 和 `moon.pkg` DSL（老项目运行 `moon fmt` 可自动转换）。
   * **`0.10.14` 推出 `.mbtx` 脚本与 `moonx`**：不需要创建项目目录，新建一个 `script.mbtx` 文件，在文件顶部直接写 `import { "moonbitlang/async@0.22.1" }` 甚至声明沙盒文件读写权限策略，即可用 `moon run script.mbtx` 或 `moonx` 像写 Deno/Bun 脚本一样单文件直接运行！

---

### 💡 给资深 TS 开发者的快速上手对照表（MoonBit v0.10.17 速查）

| 场景 / 概念 | TypeScript 写法 | MoonBit `0.10.17` 现代写法 | 核心优势 / 注意点 |
| :--- | :--- | :--- | :--- |
| **字符串插值** | `` `Hello ${name}` `` | `"Hello \{name}"` 或 `$|Hello \{name}` | 注意是反斜杠 `\{}`，写 `${}` 不会插值 |
| **空字典 / 空 JSON** | `{}` | `Map([])` / `Json::empty_object()` | `0.10.4+` 裸写 `{}` 会报歧义警告 `E0082` |
| **可选类型收窄** | `if (!x) return; x.foo()` | `guard x is Some(v) else { return }` | 支持任意深度模式解构，零缩进嵌套 |
| **断言非空** | `x!.foo()` | `guard! x is Some(v)` | `0.10.9+` 显式用 `guard!` 表达不匹配即 Panic |
| **挂载接口方法** | `class A implements B` | `impl B for A with fn f(self) {...}`<br>`pub extend A with B::{f}` | `0.10.4+` 需显式 `extend` 才能用 `a.f()` 点调用 |
| **打印调试信息** | `console.log(obj)` | `derive(Debug)` + `debug_inspect(obj)` | `derive(Show)` 在 `0.10.x` 已不推荐用于调试 |
| **异常声明与兜底** | 无静态类型 / `try {} catch {}` | `-> T raise E` / `let v = f() catch { _ => 0 }` | 编译期强制检查，支持 `raise?` 高阶错误多态 |
| **异常回滚清理** | `try { ... } catch (e) { close(); throw e; }` | `errdefer res.close()` | `0.10.9+` 仅在后续抛错或异步取消时自动触发 |

如果你正在使用 Claude Code、Cursor 或 Codex 编写 MoonBit，强烈建议在项目中使用官方维护的 Agent Skills（`npx skills@latest add moonbitlang/skills`），它能让 AI 严格按照 `0.10.x` 的最新语法规范（如 `extend`、`suberror`、`errdefer` 等）为你生成代码，避免写出早期 Beta 版的废弃语法。