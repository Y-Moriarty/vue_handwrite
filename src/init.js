import { compileToFunction } from './compile/index'
import { initState } from './initState'
import { mountComponent } from './lifecycle'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // console.log("🚀 ~ Vue.prototype._init ~ options:", options);
    // * 先获取 vue 实例
    let vm = this
    // 将传入配置项挂载到实例上
    vm.$options = options
    // 初始化状态
    initState(vm)

    // * 渲染模板（需要有 el - 所需挂载的元素）
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  // 创建 $mount
  Vue.prototype.$mount = function (el) {
    console.log('🚀 ~ Vue.prototype.$mount ~ el:', el)
    // 拿到 el 后进行模板编译
    // el template render
    let vm = this
    el = document.querySelector(el) // 获取元素
    vm.$el = el // 将元素挂载到实例上，方便后续 patch 操作
    let options = vm.$options
    if (!options.render) {
      // * 没有 render 函数则获取 template
      let template = options.template
      if (!template && el) {
        // 获取 html - 上面已获取el元素，通过其 outerHTML 获取内容
        el = el.outerHTML // innerHTML 只能获取标签内部的内容
        console.log('🚀 ~ initMixin ~ el:', el) // <div id="app">hello</div>
        // 变成 AST 语法树 => render 函数 => vNode（虚拟dom）
        // 与 vNode 的区别：vNode 只能操作节点，而 AST 可以操作一切（CSS，JS等）

        // * compileToFunction: html -> ast -> render
        let render = compileToFunction(el) // 得到 render 函数
        console.log('🚀 ~ initMixin ~ render:', render)
        // 1. 将 render 函数 -> vNode
        // 2. 将 vNode -> 真实 DOM 放到页面上
        options.render = render
      }
    }
    // 2. 将 vNode -> 真实 DOM 放到页面上 - 挂载组件 - 挂载到实例上(vm)
    mountComponent(vm, el)
  }
}
