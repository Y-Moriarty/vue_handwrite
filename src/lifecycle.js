import { patch } from './vnode/patch'

export function mountComponent(vm, el) {
  // 1. vm,_render 将 render 函数变成 vnode
  // 2. vm.update 将 vnode 变为真实 DOM 放到页面上
  vm._update(vm._render())
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
