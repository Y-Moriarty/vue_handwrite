import { nextTick } from '../utils/nextTick'
import { popTarget, pushTarget } from './dep'

// 1. 通过 wathcer 类实现自动更新 - 区分每个组件的 watcher
let id = 0

class watcher {
  constructor(vm, exprOrfn, cb, options) {
    this.vm = vm
    this.exprOrfn = exprOrfn
    this.cb = cb
    this.options = options // 标识位，是否渲染

    // computed 相关
    this.lazy = options.lazy // 如果这个 watcher 上有 lazy，说明他是计算属性
    this.dirty = this.lazy // 取值的时候表示用户是否执行

    // 每个 watcher 都有一个唯一的 id
    this.id = id++
    this.user = !!options.user
    // console.log('🚀 ~ watcher ~ constructor ~ user:', this.user)
    this.deps = [] // watcher deposit deps
    this.depsId = new Set()
    // 判断 exprOrfn 的类型，是否是函数
    if (typeof exprOrfn === 'function') {
      this.getter = exprOrfn // 用于更新视图
    } else {
      // watch 中监听的属性(字符串) - a a.c ...
      // 将表达式转换成函数
      this.getter = function () {
        let path = exprOrfn.split('.')
        // console.log('🚀 ~ watcher ~ constructor ~ path:', path)
        let obj = vm
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj // * 此时返回的值是初始值
      }
    }
    // 初次渲染时更新视图，默认执行
    // this.value = this.get() // 保存 watch 初始值
    // computed 属性不一定需要默认执行
    this.value = this.lazy ? void 0 : this.get() // 保存 watch 初始值
  }

  addDep(dep) {
    // 1. Deduplication
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }
  }

  // 初次渲染
  get() {
    pushTarget(this) // 将当前 wathcer 添加到 dep 中
    const value = this.getter.call(this.vm) // 渲染页面 vm._update(vm._render())
    popTarget() // 渲染完成后从 dep 中移除
    return value
  }

  // 将 update 里的执行代码封装成函数 - 用于异步更新
  run() {
    let value = this.get() // 得到 newValue
    let oldValue = this.value // oldValue
    this.value = value
    // 执行 handler，如果 user 为 true 则表示 cb 是用户传入的
    if (this.user) {
      this.cb.call(this.vm, value, oldValue)
    }
  }

  // * 扩展方法---------------------------------
  // 更新视图
  update() {
    // ! 注意：此时每次数据的更新都会调用 get - 性能开销大
    // this.get() // 重新渲染
    // * 解决：使用缓存
    // queueWatcher(this)
    // * 解决：计算属性不重新渲染的问题
    if (this.lazy) {
      // 判断当前是计算属性的 watcher
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }

  // computed - 执行用户传入的方法
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }

  // 双向记忆
  depend() {
    // 收集 watcher，存放到 dep 中，dep 中会存放我的 watcher
    // 通过这个 watcher 找到对应的所有 dep，再让所有的 dep 都记住这个渲染 wathcer
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
}

let queue = [] // 存放需要批量更新的 watcher 到一个队列中
let has = {} // 用于去重
let pending = false // 用于防抖
// 优化：封装计时器里的代码
function flushWatcher() {
  queue.forEach(item => {
    item.run()
    // - 转到 run 函数内执行
    // item.cb() // 执行回调(传入的 cb - updated - 页面定义的 updated 函数)
  })
  queue = []
  has = {}
  pending = false
}
function queueWatcher(watcher) {
  let id = watcher.id // 每个组件都是同一个 watcher
  // console.log('🚀 ~ queueWatcher ~ id:', id)
  // 去重
  if (has[id] == null) {
    // console.log('🚀 ~ I only action one time')
    queue.push(watcher)
    has[id] = true
    // 列队处理
    // 防抖：用户触发多次
    if (!pending) {
      // 将更新变为异步，等待其他同步代码执行完毕
      // setTimeout(() => {
      //   // 执行队列中的 watcher
      //   queue.forEach(item => item.run())
      //   // 执行完后清空队列以及其他控制变量
      //   queue = []
      //   has = {}
      //   pending = false
      // }, 0)

      // * 优化：将上面的代码封装成 nextTick - 相当于定时器
      nextTick(flushWatcher)
    }
    pending = true
  }
}

export default watcher

// * 依赖收集
// dep 和 data 中的属性是一一对应的 - 会为每一个属性添加一个 dep
// watcher: 在视图上用了几个，就有几个 watcher
// dep-watcher: 多对多  deep.name = [watcher1, watcher2]

// * nextTick 原理
