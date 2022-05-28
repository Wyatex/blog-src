---
title: 设计模式：装饰者模式(Go)
date: 2020-07-06 22:40:08
tags:
- Go
- 设计模式
- 学习笔记
categories: 设计模式
---
# 什么是装饰者模式
装饰者模式有以下特点：
* 理论上它们是可以无限包装的(无限套娃)
* 装饰者和被装饰者们有相同的超类型(super)
* 想要拓展功能无需修改原有的代码, 定义一个装饰者就可以

装饰者模式使用了下面的设计原则：
* 从”包装”我们可以看到”多用组合,少用继承”
* 从”拓展”我们可以看到”开闭原则”

> 在不必改变原类文件和使用继承的情况下, 动态地扩展一个对象的功能. 它是通过创建一个包装对象, 也就是装饰来包裹真实的对象

<!-- more -->

# 描述环节
上面bb完特点和原则之后，我们开始使用这个模式来解决实际问题。

我们以游戏中角色叠buff为例，如果我们需要很多重buff，怎么用代码描述？

首先定义一个超类型，在Go中用接口实现，用来规范描述角色的几个方法。
```go
type Heros interface {
    Description()   string
    DEF()   float32
}
```
然后这两个方法一个是描述叠上什么buff，一个是叠上buff后的防御力。
```go
type mage struct {
    name    string
    def     float32
}

func (m mage) Description() string {
    return m.name
}

func (m mage) DEF() float32 {
    return m.def
}
```
首先我们上面定义了一个法师类型，下面我们再写个buff的类型
```go
type buff struct {
    heros   Heros
    name    string
    def     float32
}

func (b buff) Description() string {
    return b.heros.Description()+"+"+b.name
}

func (b buff) DEF() float32 {
    return b.heros.DEF() + b.def
}
```
好了我们写完了加防御力buff的类型，那么使用一下看看。
```go
hero := mage{name: "战斗法师", def: 10}
buff1 := buff{heros: hero, name: "魔法结界·神圣", def: 12.2}
buff2 := buff{heros: buff1, name: "生命精髓", def: 3.5}
buff3 := buff{heros: buff2, name: "高阶全属性强化", def: 8}
buff4 := buff{heros: buff3, name: "虚假情报·生命", def: 0}
buff5 := buff{heros: buff4, name: "高阶抵抗力强化", def: 15.7}
fmt.Println(buff5.Description())
fmt.Println(buff5.DEF())
```
{% asset_img 1.png %}
可以看出套了几层buff后防御力也涨了好多啊。当然如果想在这个基础上加上可以提供攻击力加成的buff的话，只需要再写一个拥有攻击力加成的结构体，然后实现上面的接口，就可以再套娃下去，这样就一个接口，只需要不断地写出装设者的结构体和方法，就能实现非常多的功能。