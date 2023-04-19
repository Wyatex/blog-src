---
title: js源码阅读（3）：mitt
date: 2023-04-14 11:01:04
tags:
  - JavaScript
  - 前端
  - 学习笔记
categories: 前端
---

mitt 是一个非常小巧的库，在写 vue3 和微信小程序的时候也经常用到，这里先上转成 js 的代码：

<!-- more -->

# 源码

```js
export default function mitt(all) {
  all = all || new Map()
  return {
    /**
     * A Map of event names to registered handler functions.
     * 从事件名到handler回调的映射
     */
    all,
    /**
     * Register an event handler for the given type.
     * 根据type注册一个handler
     * @param {string|symbol} type Type of event to listen for, or `'*'` for all events | 需要监听的事件名，`'*'`代表所有事件
     * @param {Function} handler Function to call in response to given event | 对应的回调
     * @memberOf mitt
     */
    on(type, handler) {
      const handlers = all.get(type)
      if (handlers) {
        handlers.push(handler)
      } else {
        all.set(type, [handler])
      }
    },
    /**
     * Remove an event handler for the given type.
     * 去除指定事件名的指定handler
     * If `handler` is omitted, all handlers of the given type are removed.
     * 如果不提供handler，将会去除所有该事件的hanlder
     * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
     * @param {Function} [handler] Handler function to remove
     * @memberOf mitt
     */
    off(type, handler) {
      const handlers = all.get(type)
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1)
        } else {
          all.set(type, [])
        }
      }
    },
    /**
     * Invoke all handlers for the given type.
     * 触发type的所有handler
     * If present, `'*'` handlers are invoked after type-matched handlers.
     * `'*'` 的 handler 会在type匹配的handler执行完后执行
     * Note: Manually firing '*' handlers is not supported.
     * 手动提供'*'是不不支持的
     *
     * @param {string|symbol} type The event type to invoke
     * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
     * @memberOf mitt
     */
    emit(type, evt) {
      let handlers = all.get(type)
      if (handlers) {
        handlers.slice().map((handler) => {
          handler(evt)
        })
      }
      handlers = all.get('*')
      if (handlers) {
        handlers.slice().map((handler) => {
          handler(type, evt)
        })
      }
    },
  }
}
```

# ts 版

```ts
export type EventType = string | symbol

// 普通handler
export type Handler<T = unknown> = (event: T) => void
// 通配符handler
export type WildcardHandler<T = Record<string, unknown>> = (
  type: keyof T,
  event: T[keyof T]
) => void

export type EventHandlerList<T = unknown> = Array<Handler<T>>
export type WildCardEventHandlerList<T = Record<string, unknown>> = Array<
  WildcardHandler<T>
>

export type EventHandlerMap<Events extends Record<EventType, unknown>> = Map<
  keyof Events | '*',
  EventHandlerList<Events[keyof Events]> | WildCardEventHandlerList<Events>
>

export interface Emitter<Events extends Record<EventType, unknown>> {
  all: EventHandlerMap<Events>

  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): void
  on(type: '*', handler: WildcardHandler<Events>): void

  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>): void
  off(type: '*', handler: WildcardHandler<Events>): void

  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void
  emit<Key extends keyof Events>(
    type: undefined extends Events[Key] ? Key : never
  ): void
}

/**
 * Mitt: Tiny (~200b) functional event emitter / pubsub.
 * @name mitt
 * @returns {Mitt}
 */
export default function mitt<Events extends Record<EventType, unknown>>(
  all?: EventHandlerMap<Events>
): Emitter<Events> {
  type GenericEventHandler =
    | Handler<Events[keyof Events]>
    | WildcardHandler<Events>
  all = all || new Map()

  return {
    /**
     * A Map of event names to registered handler functions.
     */
    all,

    /**
     * Register an event handler for the given type.
     * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
     * @param {Function} handler Function to call in response to given event
     * @memberOf mitt
     */
    on<Key extends keyof Events>(type: Key, handler: GenericEventHandler) {
      const handlers: Array<GenericEventHandler> | undefined = all!.get(type)
      if (handlers) {
        handlers.push(handler)
      } else {
        all!.set(type, [handler] as EventHandlerList<Events[keyof Events]>)
      }
    },

    /**
     * Remove an event handler for the given type.
     * If `handler` is omitted, all handlers of the given type are removed.
     * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
     * @param {Function} [handler] Handler function to remove
     * @memberOf mitt
     */
    off<Key extends keyof Events>(type: Key, handler?: GenericEventHandler) {
      const handlers: Array<GenericEventHandler> | undefined = all!.get(type)
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1)
        } else {
          all!.set(type, [])
        }
      }
    },

    /**
     * Invoke all handlers for the given type.
     * If present, `'*'` handlers are invoked after type-matched handlers.
     *
     * Note: Manually firing '*' handlers is not supported.
     *
     * @param {string|symbol} type The event type to invoke
     * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
     * @memberOf mitt
     */
    emit<Key extends keyof Events>(type: Key, evt?: Events[Key]) {
      let handlers = all!.get(type)
      if (handlers) {
        ;(handlers as EventHandlerList<Events[keyof Events]>)
          .slice()
          .map((handler) => {
            handler(evt!)
          })
      }

      handlers = all!.get('*')
      if (handlers) {
        ;(handlers as WildCardEventHandlerList<Events>)
          .slice()
          .map((handler) => {
            handler(type, evt!)
          })
      }
    },
  }
}
```

用法：
```ts
type Events = {
  emitString: string
  emitVoid: void
}
const emitter = mitt<Events>()
emitter.on('emitVoid', ()=>{
  console.log('emitVoid')
})
emitter.on('emitString', (str)=>{
  console.log(str)
})
emitter.emit('emitVoid')
emitter.emit('emitString', 'test')
```