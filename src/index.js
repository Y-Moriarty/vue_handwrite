import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './vnode/index'

function Vue(options) {
  // 拿到 new Vue 时传入的数据对象
  // console.log('🚀 ~ Vue ~ options:', options)
  // 初始化
  this._init(options)
}

initMixin(Vue)

// 添加 生命周期函数
lifecycleMixin(Vue)

// 添加 _render
renderMixin(Vue)

// 因为初始化后续有许多操作，所以进行模块化处理 -> init.js
// Vue.prototype._init = function (options) {
//   console.log('🚀 ~ Vue.prototype._init ~ options:', options)
// }

export default Vue
