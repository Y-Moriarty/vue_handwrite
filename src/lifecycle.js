import { patch } from './vnode/patch'

export function mountComponent(vm, el) {
  // 页面挂载前执行
  callHook(vm, 'beforeMounted')
  // 1. vm,_render 将 render 函数变成 vnode
  // 2. vm.update 将 vnode 变为真实 DOM 放到页面上
  vm._update(vm._render())

  // 挂载后执行
  callHook(vm, 'mounted')
}

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    // console.log('🚀 ~ Vue.prototype._update ~ vnode:', vnode)
    let vm = this
    // 参数：1. 旧 DOM 2. 新 DOM
    // 重新替换真实 DOM - 此时页面上的 DOM 会被新的 DOM 替换
    vm.$el = patch(vm.$el, vnode)
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
