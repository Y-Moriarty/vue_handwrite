import { compileToFunction } from './compile/index'
import { initGlobApi } from './global-api/index'
import { initMixin } from './init'
import { stateMixin } from './initState'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from './vnode/index'
import { createEL, patch } from './vnode/patch'

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

// 创建 vNode
// let vm1 = new Vue({ data: { name: '张三' } })
// // let render1 = compileToFunction(`<div id="a" style="color: red"></div>`)
// let render1 = compileToFunction(`<ul>
//   <li style="color: red" key="a">a</li>
//   <li style="color: pink" key="b">b</li>
//   <li style="color: blue" key="c">c</li>
//   </ul>`)
// let vnode1 = render1.call(vm1)
// document.body.appendChild(createEL(vnode1))
// // 数据更新
// let vm2 = new Vue({ data: { name: '李四' } })
// // let render2 = compileToFunction('<div id="b">{{name}}</div>')
// // let render2 = compileToFunction(`<ul>
// //   <li id="a" style="color: red" key="a">a</li>
// //   <li id="b" style="color: pink" key="b">b</li>
// //   <li id="c" style="color: blue" key="c">c</li>
// //   <li id="d" style="color: yellow" key="d">d</li>
// //   </ul>`)

// let render2 = compileToFunction(`<ul>
//   <li style="color: yellow" key="d">d</li>
//   <li style="color: blue" key="c">c</li>
//   <li style="color: pink" key="b">b</li>
//     <li style="color: red" key="a">a</li>
//     </ul>`)

// // let render2 = compileToFunction(`<ul>
// //   <li id="d" style="color: yellow" key="e">e</li>
// //   <li id="c" style="color: blue" key="f">f</li>
// //   <li id="b" style="color: pink" key="g">g</li>
// //     <li id="a" style="color: red" key="h">h</li>
// //     </ul>`)
// let vnode2 = render2.call(vm2)
// // patch 对比
// console.log('🚀 ~ vnode1:', vnode1)
// console.log('🚀 ~ vnode2:', vnode2)
// setTimeout(() => {
//   patch(vnode1, vnode2)
// }, 1000)

export default Vue
