import { observer } from './observe/index'
import watcher from './observe/watcher'
import { nextTick } from './utils/nextTick'

export function initState(vm) {
  let opts = vm.$options
  // console.log('🚀 ~ initState ~ ops:', opts)

  // 根据配置项进行一系列判断以及初始化操作
  if (opts.data) {
    initData(vm)
  }
  if (opts.props) {
    initProps(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
}

// 数据代理
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    }
  })
}

function initData(vm) {
  // console.log("data 初始化: ", vm.$options);
  // 因为 data 可以是一个函数，也可以是一个对象
  // 所以初始化时候需要判断
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data // ! 注意这里 data() 的 this 指向
  // console.log("🚀 ~ initData ~ data:", vm);
  // 将 data 上的所有属性代理到实例 vm 上 - 则可以通过 vm.xxx 来访问而不再需要 vm._data.xxx
  for (let key in data) {
    proxy(vm, '_data', key)
  }
  // * 对data数据进行劫持
  observer(data) // (1) 对象 (2) 数组
}

function initProps(vm) {}

function initWatch(vm) {
  // 获取 watch
  let watch = vm.$options.watch
  console.log('🚀 ~ initWatch ~ watch:', watch)
  // 遍历
  for (let key in watch) {
    // 获取属性值，判断是什么类型（watch 有多种写法）
    let handler = watch[key]
    if (Array.isArray(handler)) {
      // 数组 - item 即为函数
      handler.forEach(item => {
        createrWatcher(vm, key, item)
      })
    } else {
      // 对象，字符，函数 - 统一处理
      createrWatcher(vm, key, handler)
    }
  }
}

// 格式化处理 watch，同时处理 vm.$watch 传入的参数(表达式和回调函数)
function createrWatcher(vm, expOrFn, handler, options) {
  if (typeof handler === 'object') {
    options = handler // 用户配置项
    handler = handler.handler // 函数
  }
  if (typeof handler === 'string') {
    handler = vm[handler] // 将实例上的方法作为 handler
  }
  // 其他的都是函数
  // watch 最终通过 $watch 处理
  return vm.$watch(expOrFn, handler, options)
}

function initComputed(vm) {}

function initMethods(vm) {}

export function stateMixin(vm) {
  // - 这里是用户自行添加的 $nextTick，需要和 Vue 更新渲染时存放的 nextTick 队列合并
  vm.prototype.$nextTick = function (cb) {
    // setTimeout(cb, 0)
    nextTick(cb) // 使用封装的 nextTick 进行合并
  }
  //  - 定义 $watch 挂载到 Vue 上
  vm.prototype.$watch = function (expOrFn, handler, options = {}) {
    // console.log('🚀 ~ stateMixin ~ options:', options)
    // console.log('🚀 ~ stateMixin ~ handler:', handler)
    // console.log('🚀 ~ stateMixin ~ expOrFn:', expOrFn)

    let watch = new watcher(this, expOrFn, handler, { ...options, user: true })
    // 判断 options 是否传入
    if (options.immediate) {
      handler.call(this) // 如果有 immediate 则立即执行 handler
    }
  }
}
