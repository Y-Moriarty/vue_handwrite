import Dep from './observe/dep'
import { observer } from './observe/index'
import Watcher from './observe/watcher'
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

function initComputed(vm) {
  let computed = vm.$options.computed
  // console.log('🚀 ~ initComputed ~ computed:', computed)
  // 1. 需要一个 watcher
  let watcher = (vm._computedWatchers = {})
  // 2. 将 computed 属性通过 Object.defineProperty() 进行劫持
  for (let key in computed) {
    // computed 有两种方式：方法、对象 - a(){} 、a: { get, set }
    let userDef = computed[key]
    // 获取 get
    let getter = typeof userDef === 'function' ? userDef : userDef.get // watcher
    // 数据劫持，并给每一个属性添加 watcher - 无需主动更新页面，所以回调为空
    watcher[key] = new Watcher(vm, getter, () => {}, { lazy: true })
    defineComputed(vm, key, userDef)
  }
}

let sharedPropertyDefinition = {}
function defineComputed(target, key, userDef) {
  sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {}
  }
  // userDef 可能是对象或函数，Object.defineProperty() 只需要对象形式 {get,set}
  // 所以需要对 userDef 进行处理
  if (typeof userDef === 'function') {
    // sharedPropertyDefinition.get = userDef // 此时没有缓存机制
    // 使用高阶函数包装用户写的方法 - 返回用户的写的方法
    sharedPropertyDefinition.get = createComputedGetter(key)
  } else {
    // sharedPropertyDefinition.get = userDef.get
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = userDef.set
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

// 高阶函数 - 返回用户的写的方法
function createComputedGetter(key) {
  return function () {
    // 此时的 wathcer 里有 dirty，还有用户要执行的方法 getter
    // 使用 dirty 变量判断是否需要重新计算，否则使用缓存

    // 获取到计算属性的 watcher
    let watcher = this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        // 执行 求值 - 在 watcher 重新定义一个方法
        watcher.evaluate() // 执行用户传入的方法
      }
      // 判断有没有渲染的 watcher，有则执行 - 需要双向记忆
      if (Dep.target) {
        // 说明存在渲染 watcher，收集起来
        watcher.depend() // 此处的 watcher 是计算属性的 watcher，收集渲染 watcher
      }
      return watcher.value
    }
  }
}

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

    let watch = new Watcher(this, expOrFn, handler, { ...options, user: true })
    // 判断 options 是否传入
    if (options.immediate) {
      handler.call(this) // 如果有 immediate 则立即执行 handler
    }
  }
}
