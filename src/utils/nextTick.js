let callback = []
let pending = false

function flush() {
  callback.forEach(cb => cb())
  pending = false
}

let timerFunc
// 异步执行并处理兼容问题
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flush)
  }
} else if (MutationObserver) {
  // H5 API - 异步方法，可以监听 DOM 变化，监控完毕之后再进行异步更新
  let observe = new MutationObserver(flush)
  let textNode = document.createTextNode(1) // 创建文本节点
  // 观测文本内容
  observe.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    textNode.textContent = 2
  }
} else if (setImmediate) {
  // ie
  timerFunc = () => {
    setImmediate(flush)
  }
}

export function nextTick(cb) {
  // console.log('🚀 ~ nextTick ~ cb:', cb)
  // 列队
  callback.push(cb)
  if (!pending) {
    timerFunc() // 异步方法：用于执行列队中的函数
    pending = true
  }
}
