---
title: Ajax学习笔记（2）：Axios基本封装
date: 2021-09-22 21:30:44
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Axios
categories: 前端
---

这章简单讲解如何在 npm 项目里使用，并封装，下一章将会讲到如何配合 ts 使用，并进一步封装一些功能。

<!-- more -->

废话不多说，直接上代码：

```js axios.js
// 首先引入axios，记得提前npm或者yarn添加axios依赖哦
import axios from 'axios'

// 这里假设使用element的message组件来弹出消息提示
import { Message, MessageBox } from 'element-ui'

// 引入封装好的路由实例，详细代码到路由篇讲解
import router from '@/router'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://api-server.com', // 设置你的后端url
  timeout: 5 * 1000, // 请求超时时间，这里设置5s
})

// 假设登录过时后继续使用过时token会返回403，或者没带上token会返回401
const LOGIN_TIMEOUT = 403
const NO_LOGIN = 401

// 封装一个当后端返回错误时弹出消息提示的方法
const errMessage = (err) => {
  if (err.response) {
    const data = err.response.data
    const token = localStorage.getItem('ACCESS_TOKEN')  // 正式项目不应该直接用localstorage

    if (err.response.status === LOGIN_TIMEOUT) {
      Message.error('您的登录状态已经过时了，请重新登陆！')
    }
    if (err.response.status >= 500) {
      if (data.message.length > 0) {
        Message.error(data.message)
      }
    }
    if (err.response.status === NO_LOGIN) {
      Message.error('您还未登录！')
    }
  }
  return Promise.reject(err)
}

// 请求拦截器，这里只是为请求加上token，你还可以加上一些其他的数据
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('ACCESS_TOKEN')
  // 这里只是判断如果存在token时加上token，实际上应该加上：如果没有token，应该再次登录，这个功能下一篇实现
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
}, errMessage)

// 响应拦截器
instance.interceptors.response.use((response) => {
  // 如果响应是blob二进制数据直接返回
  if (response.request.responseType === 'blob') {
    return response
  }

  const code = response.data.code
  if (code === LOGIN_TIMEOUT || code === NO_LOGIN) {
    localStorage.clear()
    router.replace({
      name: Login,
      query: {
        redirect: router.currentRoute.value.fullPath,
      },
    })
  } else if (code === xxx /* || ... */ ) {
    message.error(response.data.message)
    return response.data
  } else {
    return response.data
  }
}, errMessage)

export default instance
```

这样基本的 axios 就封装好了，下面演示如何封装成一些方法并使用。

```js api.js
import axios from 'axios.js'

// 查询用户列表
export function list(parameter) {
  return axios({
    url: '/user/list',
    method: 'get',
    params: parameter,
  })
}

// 添加用户
export function add(parameter) {
  return axios({
    url: '/user/add',
    method: 'post',
    data: parameter,
  })
}
```

使用：

```js MainPage.vue
<script>
import { add as AddUser, list as UserList } from 'api.js'

export default {
    data() {
        return {
            userForm: {
                username: '',
                password: ''
            }
        }
    }
    methods: {
        async getUserList(params) {
            const res = await UserList(params)
            console.log(res)
        },
        async addNewUser(info) {
            const res = await AddUser(info)
            console.log(res)
        }
    }
}

</script>
```

如上，就是本章的主要内容，下一章讲解如果配合ts使用，并实现更丰富一点的功能（实际上也没多多少功能）。