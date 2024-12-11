import { popTarget, pushTarget } from './dep'

// 1. 通过 wathcer 类实现自动更新
let id = 0

class watcher {
  constructor(vm, updateComponent, cb, options) {
    this.vm = vm
    this.exprOrfn = updateComponent
    this.cb = cb
    this.options = options // 标识位，是否渲染
    // 记录用了多少次
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

  // * 扩展方法---------------------------------
  // 更新视图
  update() {
    this.getter()
  }
}

export default watcher

// * 依赖收集
// dep 和 data 中的属性是一一对应的 - 会为每一个属性添加一个 dep
// watcher: 在视图上用了几个，就有几个 watcher
// dep-watcher: 多对多  deep.name = [watcher1, watcher2]
