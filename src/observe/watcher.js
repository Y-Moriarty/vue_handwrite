import { popTarget, pushTarget } from './dep'

// 1. 通过 wathcer 类实现自动更新 - 区分每个组件的 watcher
let id = 0

class watcher {
  constructor(vm, updateComponent, cb, options) {
    this.vm = vm
    this.exprOrfn = updateComponent
    this.cb = cb
    this.options = options // 标识位，是否渲染
    // 每个 watcher 都有一个唯一的 id
    this.id = id++
    this.deps = [] // watcher deposit deps
    this.depsId = new Set()
    // 判断 updateComponent 的类型，是否是函数
    if (typeof updateComponent === 'function') {
      this.getter = updateComponent // 用于更新视图
    }
    // 初次渲染时更新视图
    this.get()
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
    this.getter() // 渲染页面 vm._update(vm._render())
    popTarget() // 渲染完成后从 dep 中移除
  }

  // 将 update 里的执行代码封装成函数 - 用于异步更新
  run() {
    this.get()
  }

  // * 扩展方法---------------------------------
  // 更新视图
  update() {
    // ! 注意：此时每次数据的更新都会调用 get - 性能开销大
    // this.get() // 重新渲染
    // * 解决：使用缓存
    queueWatcher(this)
  }
}

let queue = [] // 存放需要批量更新的 watcher 到一个队列中
let has = {} // 用于去重
let pending = false // 用于防抖
function queueWatcher(watcher) {
  let id = watcher.id // 每个组件都是同一个 watcher
  // console.log('🚀 ~ queueWatcher ~ id:', id)
  // 去重
  if (has[id] == null) {
    console.log('🚀 ~ I only action one time:')
    queue.push(watcher)
    has[id] = true
    // 列队处理
    // 防抖：用户触发多次
    if (!pending) {
      // 将更新变为异步，等待其他同步代码执行完毕
      setTimeout(() => {
        // 执行队列中的 watcher
        queue.forEach(item => item.run())
        // 执行完后清空队列以及其他控制变量
        queue = []
        has = {}
        pending = false
      }, 0)
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
