---
title: Ajax学习笔记（3）：Axios进一步封装
date: 2021-09-23 13:01:18
tags:
  - JavaScript
  - 前端
  - 学习笔记
  - Axios
categories: 前端
---

这一章降幅大幅提高复杂性，而且使用到 Typescript，如果还不熟悉 ts 的小伙伴可以去 B 站查找一下教程，先掌握好 ts 基本知识。
如果之前没用过 axios 的话建议先看完前两章内容：[Axios 入门]() 、 [Axios 基本封装]()
而且将会配合 vue3 和 naiveUI 一起使用，如果不熟悉可以先去查一下文档稍微熟悉一下再回来看。

<!-- more -->

下面也是废话不多说，直接开始：
首先闯将 checkStatus.ts 文件，负责将状态码转换成对应的信息并提示出来：

```ts checkStatus.ts
// 传入响应的状态、信息、信息展示组件。对应的状态码可以根据你的项目需求修改
export function checkStatus(status: number, msg: string, message: any): void {
  switch (status) {
    case 400:
      message.error(`${msg}`)
      break
    // 401: 未登录
    // 未登录则跳转登录页面，并携带当前页面的路径
    // 在登录成功后返回当前页面，这一步需要在登录页操作。
    case 401:
      message.error('用户没有权限（令牌、用户名、密码错误）!')
      break
    case 403:
      message.error('用户得到授权，但是访问是被禁止的。!')
      break
    // 404请求不存在
    case 404:
      message.error('网络请求错误,未找到该资源!')
      break
    case 405:
      message.error('网络请求错误,请求方法未允许!')
      break
    case 408:
      message.error('网络请求超时!')
      break
    case 500:
      message.error('服务器错误,请联系管理员!')
      break
    case 501:
      message.error('网络未实现!')
      break
    case 502:
      message.error('网络错误!')
      break
    case 503:
      message.error('服务不可用，服务器暂时过载或维护!')
      break
    case 504:
      message.error('网络超时!')
      break
    case 505:
      message.error('http版本不支持该请求!')
      break
    default:
      message.error(msg)
  }
}
```

新建文件 type.ts，定义一些类型并导出

```ts type.ts
export interface RequestOptions {
  // 请求参数拼接到url
  joinParamsToUrl?: boolean
  // 格式化请求参数时间
  formatDate?: boolean
  // 是否显示提示信息
  isShowMessage?: boolean
  // 是否解析成JSON
  isParseToJson?: boolean
  // 成功的文本信息
  successMessageText?: string
  // 是否显示成功信息
  isShowSuccessMessage?: boolean
  // 是否显示失败信息
  isShowErrorMessage?: boolean
  // 错误的文本信息
  errorMessageText?: string
  // 是否加入url
  joinPrefix?: boolean
  // 接口地址， 不填则使用默认apiUrl
  apiUrl?: string
  // 错误消息提示类型
  errorMessageMode?: 'none' | 'modal'
  // 是否添加时间戳
  joinTime?: boolean
  // 进行处理还是直接返回
  isTransformResponse?: boolean
  // 是否返回原生响应头
  isReturnNativeResponse?: boolean
}

export interface Result<T = any> {
  code: number
  message: string
  data: T
}
```

然后是数据处理类：

```ts axiosTransform.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { RequestOptions, Result } from './types'

export abstract class AxiosTransform {
  /**
   * @description: 请求之前处理配置
   * @description: Process configuration before request
   */
  beforeRequestHook?: (
    config: AxiosRequestConfig,
    options: RequestOptions
  ) => AxiosRequestConfig

  /**
   * @description: 请求成功处理
   */
  transformRequestData?: (
    res: AxiosResponse<Result>,
    options: RequestOptions
  ) => any

  /**
   * @description: 请求失败处理
   */
  requestCatch?: (e: Error) => Promise<any>

  /**
   * @description: 请求之前的拦截器
   */
  requestInterceptors?: (config: AxiosRequestConfig) => AxiosRequestConfig

  /**
   * @description: 请求之后的拦截器
   */
  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>

  /**
   * @description: 请求之前的拦截器错误处理
   */
  requestInterceptorsCatch?: (error: Error) => void

  /**
   * @description: 请求之后的拦截器错误处理
   */
  responseInterceptorsCatch?: (error: Error) => void
}
```

创建一个 CreateAxiosOptions 接口

```ts createAxiosOptions.ts
import { AxiosRequestConfig } from 'axios'
import { AxiosTransform } from './axiosTransform'
import type { RequestOptions } from './types'
export interface CreateAxiosOptions extends AxiosRequestConfig {
  prefixUrl?: string
  transform?: AxiosTransform
  requestOptions?: RequestOptions
}
```

创建 axiosCancel.ts 用于处理取消请求，关于 axios 的 cancel 功能请看[官方文档](https://axios-http.com/zh/docs/cancellation)

```ts axiosCancel.ts
import axios, { AxiosRequestConfig, Canceler } from 'axios'
import qs from 'qs'

function isFunction<T = Function>(val: unknown): val is T {
  return Object.prototype.toString.call(val) === '[object Function]'
}

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
let pendingMap = new Map<string, Canceler>()

export const getPendingUrl = (config: AxiosRequestConfig) =>
  [
    config.method,
    config.url,
    qs.stringify(config.data),
    qs.stringify(config.params),
  ].join('&')

export class AxiosCanceler {
  /**
   * 添加请求
   * @param {Object} config
   */
  addPending(config: AxiosRequestConfig) {
    this.removePending(config)
    const url = getPendingUrl(config)
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!pendingMap.has(url)) {
          // 如果 pending 中不存在当前请求，则添加进去
          pendingMap.set(url, cancel)
        }
      })
  }

  /**
   * @description: 清空所有pending
   */
  removeAllPending() {
    pendingMap.forEach((cancel) => {
      cancel && isFunction(cancel) && cancel()
    })
    pendingMap.clear()
  }

  /**
   * 移除请求
   * @param {Object} config
   */
  removePending(config: AxiosRequestConfig) {
    const url = getPendingUrl(config)

    if (pendingMap.has(url)) {
      // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
      const cancel = pendingMap.get(url)
      cancel && cancel(url)
      pendingMap.delete(url)
    }
  }

  /**
   * @description: 重置
   */
  reset(): void {
    pendingMap = new Map<string, Canceler>()
  }
}
```

创建 MyAxios.ts，用于实例化 axios、设置拦截器等操作

```ts myAxios.ts
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'
import { AxiosCanceler } from './axiosCancel'
import { cloneDeep } from 'lodash-es'
import type { RequestOptions, Result } from './types'
import type { CreateAxiosOptions } from './createAxiosOptions'

function isFunction<T = Function>(val: unknown): val is T {
  return Object.prototype.toString.call(val) === '[object Function]'
}

export * from './axiosTransform'

/**
 * @description:  axios模块
 */
export class MyAxios {
  private axiosInstance: AxiosInstance
  private options: CreateAxiosOptions

  constructor(options: CreateAxiosOptions) {
    this.options = options
    this.axiosInstance = axios.create(options)
    this.setupInterceptors()
  }

  /**
   * @description:  创建axios实例
   */
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config)
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance
  }

  /**
   * @description: 重新配置axios
   */
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance) {
      return
    }
    this.createAxios(config)
  }

  private getTransform() {
    const { transform } = this.options
    return transform
  }

  /**
   * @description: 设置通用header
   */
  setHeader(headers: any): void {
    if (!this.axiosInstance) {
      return
    }
    Object.assign(this.axiosInstance.defaults.headers, headers)
  }

  /**
   * @description: 拦截器配置
   */
  private setupInterceptors() {
    const transform = this.getTransform()
    if (!transform) {
      return
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform

    const axiosCanceler = new AxiosCanceler()

    // 请求拦截器配置处理
    this.axiosInstance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const {
          headers: { ignoreCancelToken } = { ignoreCancelToken: false },
        } = config
        !ignoreCancelToken && axiosCanceler.addPending(config)
        if (requestInterceptors && isFunction(requestInterceptors)) {
          config = requestInterceptors(config)
        }
        return config
      },
      undefined
    )

    // 请求拦截器错误捕获
    requestInterceptorsCatch &&
      isFunction(requestInterceptorsCatch) &&
      this.axiosInstance.interceptors.request.use(
        undefined,
        requestInterceptorsCatch
      )

    // 响应结果拦截器处理
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      res && axiosCanceler.removePending(res.config)
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res)
      }
      return res
    }, undefined)

    // 响应结果拦截器错误捕获
    responseInterceptorsCatch &&
      isFunction(responseInterceptorsCatch) &&
      this.axiosInstance.interceptors.response.use(
        undefined,
        responseInterceptorsCatch
      )
  }

  /**
   * @description:   请求方法
   */
  request<T = any>(
    config: AxiosRequestConfig,
    options?: RequestOptions
  ): Promise<T> {
    let conf: AxiosRequestConfig = cloneDeep(config)
    const transform = this.getTransform()

    const { requestOptions } = this.options

    const opt: RequestOptions = Object.assign({}, requestOptions, options)

    const { beforeRequestHook, requestCatch, transformRequestData } =
      transform || {}

    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt)
    }
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(conf)
        .then((res: AxiosResponse<Result>) => {
          // 请求是否被取消
          const isCancel = axios.isCancel(res)
          if (
            transformRequestData &&
            isFunction(transformRequestData) &&
            !isCancel
          ) {
            const ret = transformRequestData(res, opt)
            // ret !== undefined ? resolve(ret) : reject(new Error('request error!'));
            return resolve(ret)
          }
          reject(res as unknown as Promise<T>)
        })
        .catch((e: Error) => {
          if (requestCatch && isFunction(requestCatch)) {
            reject(requestCatch(e))
            return
          }
          reject(e)
        })
    })
  }
}
```

然后是一些工具

```ts util.js
const toString = Object.prototype.toString

/**
 * @description: 判断值是否未某个类型
 */
export function is(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}

/**
 * @description:  是否为函数
 */
export function isFunction<T = Function>(val: unknown): val is T {
  return is(val, 'Function')
}

/**
 * @description:  是否为字符串
 */
export function isString(val: unknown): val is string {
  return is(val, 'String')
}

/**
 * @description: 是否为对象
 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, 'Object')
}

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';

export function joinTimestamp<T extends boolean>(
  join: boolean,
  restful: T
): T extends true ? string : object;

export function joinTimestamp<T extends boolean>(
  join: boolean,
  restful: T
): T extends true ? string : object;

export function joinTimestamp(join: boolean, restful = false): string | object {
  if (!join) {
    return restful ? '' : {};
  }
  const now = new Date().getTime();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

/**
 * @description: Format request parameter time
 */
export function formatRequestDate(params: Recordable) {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return;
  }

  for (const key in params) {
    if (params[key] && params[key]._isAMomentObject) {
      params[key] = params[key].format(DATE_TIME_FORMAT);
    }
    if (isString(key)) {
      const value = params[key];
      if (value) {
        try {
          params[key] = isString(value) ? value.trim() : value;
        } catch (error) {
          throw new Error(error);
        }
      }
    }
    if (isObject(params[key])) {
      formatRequestDate(params[key]);
    }
  }
}

/**
 * 将对象添加当作参数拼接到URL上面
 * @param baseUrl 需要拼接的url
 * @param obj 参数对象
 * @returns {string} 拼接后的对象
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: object): string {
  let parameters = '';
  let url = '';
  for (const key in obj) {
    parameters += key + '=' + encodeURIComponent(obj[key]) + '&';
  }
  parameters = parameters.replace(/&$/, '');
  if (/\?$/.test(baseUrl)) {
    url = baseUrl + parameters;
  } else {
    url = baseUrl.replace(/\/?$/, '?') + parameters;
  }
  return url;
}

```

最后写一个 index.ts，填写一些配置，然后导出这个实例。

```ts index.ts
// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
import { MyAxios } from './myAxios'
import { AxiosTransform } from './axiosTransform'
import axios, { AxiosResponse } from 'axios'
import { checkStatus } from './checkStatus'
import { joinTimestamp, formatRequestDate } from './helper'
import { RequestEnum, ResultEnum, ContentTypeEnum } from '@/enums/httpEnum'
import { PageEnum } from '@/enums/pageEnum'
import { useGlobSetting } from '@/hooks/setting'
import { isString } from '@/utils/is/'
import { setObjToUrlParams } from '@/utils/urlUtils'
import { RequestOptions, Result } from './types'
import { useUserStoreWidthOut } from '@/store/modules/user'

const globSetting = useGlobSetting()
const urlPrefix = globSetting.urlPrefix || ''

import router from '@/router'
import { storage } from '@/utils/Storage'

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据
   */
  transformRequestData: (
    res: AxiosResponse<Result>,
    options: RequestOptions
  ) => {
    // @ts-ignore
    const { $message: Message, $dialog: Modal } = window
    const {
      isShowMessage = true,
      isShowErrorMessage,
      isShowSuccessMessage,
      successMessageText,
      errorMessageText,
      isTransformResponse,
      isReturnNativeResponse,
    } = options

    const reject = Promise.reject

    const { data } = res

    if (!data) {
      // return '[HTTP] Request has no return value';
      return reject(data)
    }
    //  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code, result, message } = data

    // 登录超时
    if (code === ResultEnum.TIMEOUT) {
      const LoginName = PageEnum.BASE_LOGIN_NAME
      if (router.currentRoute.value.name == LoginName) return
      // 到登录页
      const timeoutMsg = '登录超时,请重新登录!'
      Modal.warning({
        title: '提示',
        content: '登录身份已失效，请重新登录!',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          storage.clear()
          router.replace({
            name: LoginName,
            query: {
              redirect: router.currentRoute.value.fullPath,
            },
          })
        },
        onNegativeClick: () => {},
      })
      return reject(new Error(timeoutMsg))
    }

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data
    }

    // 请求成功
    const hasSuccess =
      data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS
    // 是否显示提示信息
    if (isShowMessage) {
      if (hasSuccess && (successMessageText || isShowSuccessMessage)) {
        // 是否显示自定义信息提示
        Message.success(successMessageText || message || '操作成功！')
      } else if (!hasSuccess && (errorMessageText || isShowErrorMessage)) {
        // 是否显示自定义信息提示
        Message.error(message || errorMessageText || '操作失败！')
      } else if (!hasSuccess && options.errorMessageMode === 'modal') {
        // errorMessageMode=‘custom-modal’的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
        Modal.info({
          title: '提示',
          content: message,
          positiveText: '确定',
          onPositiveClick: () => {},
        })
      }
    }

    // 接口请求成功，直接返回结果
    if (code === ResultEnum.SUCCESS) {
      return result
    }
    // 接口请求错误，统一提示错误信息
    if (code === ResultEnum.ERROR) {
      if (message) {
        Message.error(data.message)
        Promise.reject(new Error(message))
      } else {
        const msg = '操作失败,系统异常!'
        Message.error(msg)
        Promise.reject(new Error(msg))
      }
      return reject()
    }

    // 这里逻辑可以根据项目进行修改
    if (!hasSuccess) {
      return reject(new Error(message))
    }

    return data
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const {
      apiUrl,
      joinPrefix,
      joinParamsToUrl,
      formatDate,
      joinTime = true,
    } = options

    if (joinPrefix) {
      config.url = `${urlPrefix}${config.url}`
    }

    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    const params = config.params || {}
    const data = config.data || false
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(
          params || {},
          joinTimestamp(joinTime, false)
        )
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params)
        if (
          Reflect.has(config, 'data') &&
          config.data &&
          Object.keys(config.data).length
        ) {
          config.data = data
          config.params = params
        } else {
          config.data = params
          config.params = undefined
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data)
          )
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params
        config.params = undefined
      }
    }
    return config
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config) => {
    // 请求之前处理config
    const userStore = useUserStoreWidthOut()
    const token = userStore.getToken
    if (token) {
      // jwt token
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    // @ts-ignore
    const { $message: Message, $dialog: Modal } = window
    const { response, code, message } = error || {}
    // TODO 此处要根据后端接口返回格式修改
    const msg: string =
      response && response.data && response.data.message
        ? response.data.message
        : ''
    const err: string = error.toString()
    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        Message.error('接口请求超时,请刷新页面重试!')
        return
      }
      if (err && err.includes('Network Error')) {
        Modal.info({
          title: '网络异常',
          content: '请检查您的网络连接是否正常!',
          positiveText: '确定',
          onPositiveClick: () => {},
        })
        return
      }
    } catch (error) {
      throw new Error(error)
    }
    // 请求是否被取消
    const isCancel = axios.isCancel(error)
    if (!isCancel) {
      checkStatus(error.response && error.response.status, msg, Message)
    } else {
      console.warn(error, '请求被取消！')
    }
    return error
  },
}

const Axios = new MyAxios({
  timeout: 10 * 1000,
  // 接口前缀
  prefixUrl: urlPrefix,
  headers: { 'Content-Type': ContentTypeEnum.JSON },
  // 数据处理方式
  transform,
  // 配置项，下面的选项都可以在独立的接口请求中覆盖
  requestOptions: {
    // 默认将prefix 添加到url
    joinPrefix: true,
    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    isReturnNativeResponse: false,
    // 需要对返回数据进行处理
    isTransformResponse: false,
    // post请求的时候添加参数到url
    joinParamsToUrl: false,
    // 格式化提交参数时间
    formatDate: true,
    // 消息提示类型
    errorMessageMode: 'none',
    // 接口地址
    apiUrl: globSetting.apiUrl as string,
  },
  withCredentials: false,
})

export default Axios
```

本章页面大部分代码来自项目：[Naive-Ui-Admin](https://github.com/jekip/naive-ui-admin)
正所以冤有头债有主，如果有什么问题请查看项目的介绍。