import { mergeOptions } from '../utils/index'

export function initGlobApi(Vue) {
  // 将全局的 mixin 混入到 options 中
  Vue.options = {}
  // mixin: {} - 传入的生命周期函数等 - 变成下面的形式
  // Vue.options = { created: [Function, Function, ...], watch:[watch1, watch2] }
  Vue.Mixin = function (mixin) {
    // 更新 options
    // 传入参数：1. 全局的 options 2. 混入的自定义 options
    this.options = mergeOptions(this.options, mixin)
    // console.log('🚀 ~ initGlobApi ~ Vue.options:', Vue.options)
  }
}
