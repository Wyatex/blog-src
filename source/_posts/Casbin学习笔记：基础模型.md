---
title: Casbin学习笔记：基础模型
date: 2021-03-18 20:54:48
tags:
- Golang
- 后端
- 学习笔记
- Casbin
categories: 学习笔记
---

[casbin官网](https://casbin.org/zh-CN/)

# 概述
Casbin是一个强大的、高效的开源访问控制框架，其权限管理机制支持多种访问控制模型。

<!-- more -->

# 工作原理
在 Casbin 中, 访问控制模型被抽象为基于 PERM (Policy, Effect, Request, Matcher) 的一个文件。 因此，切换或升级项目的授权机制与修改配置一样简单。 您可以通过组合可用的模型来定制您自己的访问控制模型。 例如，可以在一个model中获得RBAC角色和ABAC属性，并共享一组policy规则。

## Policy 策略
p={sub, obj, act, eft}，策略一般存到数据，因为项目会很多

定义：
```
[policy_definition]
p = sub,obj,act
```


## Matchers 匹配规则
Request和Policy的匹配规则

比如(r请求 p策略)：`m= r.sub == p.sub && r.act == p.act && r.obj == p.obj`

这时候会把r和p按照上述描述进行匹配，从而返回匹配结果（eft）。如果不定义会返回allow，如果定义过就返回定义过的结果

## Effact 影响
决定是否放行

比如：`e = some(where(p.eft == allow))` 这种情况下，我们的一个matcher匹配完成，得到allow那么这条请求将被放行

或者： e = some(where(p.eft == allow)) && !some(where(p.eft == deny))

这里的规则是定死的

## Request 请求
r = {sub, obj, act}

# 例子
