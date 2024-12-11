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
export function pushTarget(watcher) {
  Dep.target = watcher
}

// 移除 watcher - 当组件 watcher 中渲染完成后移除
export function popTarget() {
  Dep.target = null
}

export default Dep
