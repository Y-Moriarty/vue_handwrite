import { initGlobApi } from './global-api/index'
import { initMixin } from './init'
import { stateMixin } from './initState'
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

// 给 vm 添加 $nextTick
stateMixin(Vue)

// 因为初始化后续有许多操作，所以进行模块化处理 -> init.js
// Vue.prototype._init = function (options) {
//   console.log('🚀 ~ Vue.prototype._init ~ options:', options)
// }

// 使用一些全局方法(API) Vue.mixin Vue.Component Vue.extend等
initGlobApi(Vue)
export default Vue
