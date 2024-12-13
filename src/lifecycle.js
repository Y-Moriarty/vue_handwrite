import watcher from './observe/watcher'
import { patch } from './vnode/patch'

export function mountComponent(vm, el) {
  // 页面挂载前执行
  callHook(vm, 'beforeMounted')
  // 1. vm,_render 将 render 函数变成 vnode
  // 2. vm.update 将 vnode 变为真实 DOM 放到页面上
  // vm._update(vm._render())
  // * 将视图更新封装成函数，存入到 wathcer 中，在数据变化的时候调用 - 数据变化，视图自动更新
  let updateComponent = () => {
    vm._update(vm._render())
  }

  // * 给组件创建 watcher - 每个组件都有自己的 watcher
  new watcher(
    vm,
    updateComponent,
    // 组件更新完成后执行 - updated
    () => {
      callHook(vm, 'updated')
    },
    true
  )

  // 挂载后执行
  callHook(vm, 'mounted')
}

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    // console.log('🚀 ~ Vue.prototype._update ~ vnode:', vnode)
    let vm = this
    // 参数：1. 旧 DOM 2. 新 DOM
    // 重新替换真实 DOM - 此时页面上的 DOM 会被新的 DOM 替换
    // 需要区分是首次渲染还是数据更新
    let prevVnode = vm._vnode // 如果是首次渲染，值为 null
    if (!prevVnode) {
      vm.$el = patch(vm.$el, vnode) // 获取到最新的渲染值
      vm._vnode = vnode // 此时 vnode 是当前的新值，也是下次更新的旧值 -> prevVnode
    } else {
      patch(prevVnode, vnode)
    }
  }
}

// * 生命周期调用（订阅-发布模式）
export function callHook(vm, hook) {
  // 此时生命周期函数已经挂载到 vm.$options 上（_init()中）
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm) // 改变生命周期的 this 指向问题
    }
  }
}
