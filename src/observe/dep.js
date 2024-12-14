let id = 0 // Identify dep IDs
class Dep {
  constructor() {
    this.id = id++
    this.subs = []
  }
  // 收集 watcher
  depend() {
    // this.subs.push(Dep.target)
    // watcher deposit dep - Two-way memory
    Dep.target.addDep(this)
  }

  // change `this.subs.push(Dep.target)` to a method
  // Convenient for two-way memory
  addSub(watcher) {
    this.subs.push(watcher)
  }
  // 更新 watcher
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

// 添加 watcher
Dep.target = null
// * 处理多个 wathcer - computed 面试题
let stack = [] // 使用栈
export function pushTarget(watcher) {
  Dep.target = watcher // 保留 watcher
  // 入栈
  stack.push(watcher) // 渲染 watcher、其他 watcher
}

// 移除 watcher - 当组件 watcher 中渲染完成后移除
export function popTarget() {
  // Dep.target = null // 清空 watcher
  // 解析完成一个 watcher 就删除一个 watcher
  stack.pop()
  Dep.target = stack[stack.length - 1] // 获取到前一个 watcher
}

export default Dep
