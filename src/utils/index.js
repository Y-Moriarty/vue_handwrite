export const HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed']

// 策略模式 - 根据 key 做不同的处理 - 解决 if 判断语句过多的问题
let starts = {}
starts.data = function (parentVal, childVal) {
  return childVal
} // 合并 data
// starts.computed = function () {} // 合并 computed
// starts.watch = function () {} // 合并 watch
// starts.methods = function () {} // 合并 methods
// 遍历生命周期
HOOKS.forEach(hook => {
  starts[hook] = mergeHook
})

function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      // 如果全局 options 和 混入的 options 都有值，则拼接在一起，再更新全局 options
      // { created: [Function, Function], watch: [watch1, watch2] }
      return parentVal.concat(childVal)
    } else {
      return [childVal] // [Function, Function]
    }
  } else {
    return parentVal
  }
}

// * 合并全局的 options 和 混入的自定义 options / 自定义的 options
// 传入参数：1. 全局的 options 2. 混入的自定义 options
// 首次 parent 为空 - Vue.options = {}，后续的 parent 为数组
export function mergeOptions(parent, child) {
  // console.log('🚀 ~ mergeOptions ~ parent, child:', parent, child)
  const options = {}
  // 如果 parent 有值，则没有 child
  for (const key in parent) {
    mergeField(key)
  }
  // 如果 child 有值，则没有 parent
  for (const key in child) {
    mergeField(key)
  }

  function mergeField(key) {
    // 策略模式
    if (starts[key]) {
      options[key] = starts[key](parent[key], child[key])
    } else {
      options[key] = child[key]
    }
  }

  return options
}
