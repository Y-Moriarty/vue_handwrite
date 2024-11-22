import { initState } from './initState'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // console.log('🚀 ~ Vue.prototype._init ~ options:', options)
    // * 先获取 vue 实例
    let vm = this
    // 将传入配置项挂载到实例上
    vm.$options = options
    // 初始化状态
    initState(vm)
  }
}
