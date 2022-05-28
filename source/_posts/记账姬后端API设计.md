---
title: 记账姬后端API V1设计
date: 2020-08-21 11:01:40
tags:
- 记账姬
- 设计
- 后端
categories: 设计
---
后端的api接口全部采用RESTful API风格

<!-- more -->

# V1版本
第一个API接口版本

## 一些说明
* 除了登录和注册，其他都要在http头里加上Token做校验。比如在下面的curl示例加上 `-H 'Authorization: Bearer xxx'`
* 返回的数据遵循以下规则

数据项 | 值内容
- | -
状态码：code | 0：成功，-1：失败，-2：服务器出错
信息：msg | 返回的一些提示信息
数据：data | 返回的一些数据

## 用户

### 注册
路由地址：`/user/register`

可以采用 `GET` 或者 `POST` 方法，需要的提交的信息：

信息 | 属性名 | 要求
- | - | -
账号| passport | 长度位于4~16位之间，所有账号唯一，必填
密码 | password | 长度位于6~16位之间，支持弱密码，必填
昵称 | nickname | 长度小于16，选填，不发送则和账号相同
邮箱 | email | 用于密码找回，选填，如果填了会验证唯一性
手机 | phone | 用于密码找回，选填，如果填了会验证唯一性

实例：
使用 `POST` 方法:
```
curl -d 'passport=1234&password=123456' -X POST https://v1.jizhangji.io/user/register
```
使用 `GET` 方法:
```
curl https://v1.jizhangji.io/user/register?passport=1234&password=123456
```


例如：注册失败
```json
{
    "code": -1,
    "msg": "账号 1234 已被注册",
    "data": null
}
```
```json
{
    "code": -1,
    "msg": "邮箱 123@qq.com 已被注册",
    "data": null
}
```
```json
{
    "code": -2,
    "msg": "服务器正在开小差，请联系管理员",
    "data": null
}
```
注册成功：
```json
{
    "code": 0,
    "msg": "注册成功",
    "data": "一串登录校验用的Token"
}
```


### 登录
路由地址：`/user/login`

可以采用 `GET` 或者 `POST` 方法，需要的提交的信息：

信息 | 属性名 | 要求
- | - | -
账号| passport | 注册时的账号，必填
密码 | password | 注册时的密码，必填

实例：
使用 `POST` 方法:
```
curl -d 'passport=1234&password=123456' -X POST https://v1.jizhangji.io/user/login
```
使用 `GET` 方法:
```
curl https://v1.jizhangji.io/user/login?passport=1234&password=123456
```

响应数据：登陆失败
```json
{
    "code": -1,
    "msg": "账号或密码错误了哦",
    "data": null
}
```
```json
{
    "code": -2,
    "msg": "姬正在开小差，请联系管理员",
    "data": null
}
```
登录成功：
```json
{
    "code": 0,
    "msg": "登录成功",
    "data": "一串登录校验用的Token"
}
```

### 忘记账号
路由地址：`/user/forget-passport` , 参数带上email或者phone其中一个，即可发送账号。

### 重设密码
路由地址：`/user/set-password` ，参数带上email或者phone其中一个，发送验证码，再次带上code和验证码即可。
1. `GET https://xxx/user/set-password?email=xxx@qq.com` 或者使用POST方式发送请求
2. 得到验证码xxx， `GET https://xxx/user/set-password?code=xxx`
3. 验证码正确修改成功，否则失败

## 账本

### 新增账本
支持一个用户多账本，但一个用户只能新建6个账本。

路由地址：`/ledger/new` ,可以采用 `GET` 或者 `POST` 方法，需要的提交的信息:

信息 | 属性名 | 要求
- | - | -
账本名称:name | passport | 注册时的账号，必填

实例：
使用 `POST` 方法:
```
curl -d 'name=姬的账本' -H 'Authorization: Bearer xxx' -X POST https://v1.jizhangji.io/ledger/new
```
使用 `GET` 方法(记得加Token):
```
curl https://v1.jizhangji.io/user/ledger/new?name=姬的账本
```

响应数据：失败
```json
{
    "code": -1,
    "msg": "账本重名了哦",
    "data": null
}
```
```json
{
    "code": -1,
    "msg": "你的账本太多啦，姬的大脑记不了这么多哦",
    "data": null
}
```
```json
{
    "code": -2,
    "msg": "姬正在开小差，请联系管理员",
    "data": null
}
```
成功
```json
{
    "code": 0,
    "msg": "账本新增成功",
    "data": "账本的id"
}
```

### 获取用户拥有的账本
路由地址：`/ledger/get` ，直接访问即可获取账本的名称和id

响应数据：
```json
{
    "num": 2,
    "ledger": [
        {
            "id": 1
            "name": "我的账本",
        },
        {
            "id": 2
            "name": "姬的账本",
        }
    ]
}
```

### 清空账本
路由地址：`/ledger/clear` 发送账本的id即可清空，可以用post或者get
```
curl -d 'id=1' -X POST https://v1.jizhangji.io/ledger/clear
或者
curl http://v1.jizhangji.io/ledger/clear?id=1
```
响应数据：
```json
{
    code: -1,
    msg: "姬找不到这个账本了",
    data: null
}
```
```json
{
    code: -1,
    msg: "该账本不属于你的哦",
    data: null
}
```
```json
{
    code: 0,
    msg: "账本成功被姬清空了",
    data: null
}
```

### 删除账本
路由地址：`/ledger/delete` 发送账本的id即可删除，可以用post或者get，用法同上清除账本。

### 账本改名
路由地址：`/ledger/rename` 
```
curl -d 'id=1&newname=姬的账本' -X POST https://v1.jizhangji.io/ledger/rename 
或者
curl http://v1.jizhangji.io/ledger/clear?id=1&newname=姬的账本 
```

## 记账
### 增加记录
路由地址：`/account/new`

一个记录包括以下信息：

信息 | 属性名 | 说明和要求
- | - | -
对应账本 | ledger | 对应的账本id，必填
类型 | type | 支出还在收入，支出可以使用0或者”支出“或者”expenditure“，收入可以使用1或者”收入“或者”income“，必填
金额 | money | 对应的金额，必填
分类 | categories | 分类的id，选填，不填一概用1代替（未分类）
时间 | time | 记录时间，值为时间戳，选填，不填使用现在时刻代替。

实例：
使用 `POST` 方法:
```
curl -d 'ledger=1&type=0&money=123.12' -X POST https://v1.jizhangji.io/account/new
```
也可以使用 `GET` 方法，在路由后面带上查询即可。

### 删除一个记录
路由地址：`/account/delete` ，提交记录的id即可删除，不多赘述
```
curl -d 'id=1' -X POST https://v1.jizhangji.io/account/delete

curl http://v1.jizhangji.io/account/delete?id=1
```

### 获取账目信息
需要指定一个账本进行获取，默认获取最近30天内的记录，或者指定日期的前30天记录。

### 修改一个记录
和增加记录差不多，需要多一个记录id来指定。

## 统计

### 获取统计信息
支持日、周、月统计，月支持收入与支出统计。

（上面三天后续跟进）