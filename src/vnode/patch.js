export function patch(oldVnode, vnode) {
  // console.log('🚀 ~ patch ~ oldVnode, vnode:', oldVnode, vnode)

  // * 将 vNode -> 真实 DOM
  // 1. 创建新 DOM
  let el = createEL(vnode)
  // console.log('🚀 ~ patch ~ el:', el)
  // 2. 替换 - 未使用 diff 算法的直接替换
  // 2.1 获取父节点
  let parentEL = oldVnode.parentNode // body，因为我们挂载到 app 上
  // 2.2 插入新节点
  parentEL.insertBefore(el, oldVnode.nextsibling)
  // 2.3 删除旧节点
  parentEL.removeChild(oldVnode)
  // 将新的 DOM 返回给 _update 函数
  return el
}

// 创建 DOM - vnode: { tag, data, key, children, text }
function createEL(vnode) {
  let { tag, children, data, text, key } = vnode
  // 判断是否是元素（文本内容 tag 为 undefined）
  if (typeof tag === 'string') {
    // 创建元素
    vnode.el = document.createElement(tag)
    // 创建子节点 children: [{}]
    if (children.length > 0) {
      children.forEach(child => {
        // 递归调用，子节点也需要判断是否是文本还是元素
        vnode.el.appendChild(createEL(child))
      })
    }
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

/**
 * * 面试题 - vue 渲染流程
 *  数据初始化 -> 模板编译
 *    模板编译: html -> ast -> render -> vnode -> 真实 DOM -> 渲染到页面
 *      mountComponent(vm, el): vm._update(vm._render()) -> 真实 DOM
 */
