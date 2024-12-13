export function patch(oldVnode, vnode) {
  // console.log('🚀 ~ patch ~ oldVnode, vnode:', oldVnode, vnode)

  // * 使用 diff 算法
  // 第一次渲染时的 oldVnode 是一个真实的 DOM，只有一个 DOM 无需对比
  if (oldVnode.nodeType === 1) {
    // 第一次更新
    // * 将 vNode -> 真实 DOM - 将虚拟节点转换为真实节点
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
  } else {
    // console.log('🚀 ~ patch ~ oldVnode, vnode:', oldVnode, vnode)
    // 数据更新后进行对比 - 使用 diff 算法
    // 1. 元素类型不一致 - 直接替换
    if (oldVnode.tag !== vnode.tag) {
      // 替换
      return oldVnode.el.parentNode.replaceChild(createEL(vnode), oldVnode.el)
    }
    // 2. 元素类型一致
    // 2.1 文本内容不一致 - 直接替换文本
    // 文本节点 tag 为 undefined
    if (!oldVnode.tag) {
      // console.log('🚀 ~ patch ~ oldVnode, vnode:', oldVnode, vnode)
      if (oldVnode.text !== vnode.text) {
        return (oldVnode.el.textContent = vnode.text)
      }
    }

    // 2.2 属性不一致 - 更新属性
    // 方法一：直接复制
    let el = (vnode.el = oldVnode.el)
    updateProps(vnode, oldVnode.data)

    // diff 子元素
    let oldChildren = oldVnode.children || [] // 旧的子元素
    let newChildren = vnode.children || [] // 新的子元素
    // 1. 旧元素和新元素都有子元素
    if (oldChildren.length > 0 && newChildren.length > 0) {
      updateChild(el, oldChildren, newChildren)
    } else if (oldChildren.length > 0) {
      // 2. 旧元素有子元素，新的没有
      el.innerHTML = ''
    } else if (newChildren.length > 0) {
      // 3. 旧元素没有子元素，新的有
      for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        // 添加到真实 DOM
        el.appendChild(createEL(child))
      }
    }
  }
}

// 更新子节点（当新旧元素都有子节点时）
function updateChild(parent, oldChildren, newChildren) {
  // 采用双指针进行对比
  // 1. 创建双指针 循环遍历
  let oldStartIndex = 0 // 旧的开始索引
  let oldStartVnode = oldChildren[oldStartIndex] // 旧的开始节点
  let oldEndIndex = oldChildren.length - 1 // 旧的结束索引
  let oldEndVnode = oldChildren[oldEndIndex] // 旧的结束节点

  let newStartIndex = 0 // 新的开始索引
  let newStartVnode = newChildren[newStartIndex] // 新的开始节点
  let newEndIndex = newChildren.length - 1 // 新的结束索引
  let newEndVnode = newChildren[newEndIndex] // 新的结束节点

  // 创建旧元素的映射表
  function markIndexBykey(child) {
    let map = {}
    child.forEach((item, index) => {
      // 如果没有 key 则不存入 map
      if (item.key) {
        map[item.key] = index
      }
    })
    return map
  }
  let map = markIndexBykey(oldChildren)
  // console.log("🚀 ~ updateChild ~ map:", map)

  function isSameVnode(oldVnode, newVnode) {
    // 加 key 的作用
    return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
  }

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 对比子元素
    // 判断头部元素是否是同一个元素，是则进行对比
    if (isSameVnode(oldStartVnode, newStartVnode)) {
      console.log('🚀 ~ isSameVnode ~ oldStartVnode, newStartVnode:', oldStartVnode, newStartVnode)
      // 递归
      patch(oldStartVnode, newStartVnode)
      // 移动指针
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      console.log('🚀 ~ isSameVnode ~ oldEndVnode, newEndVnode:', oldEndVnode, newEndVnode)
      // } else if ((oldEndVnode, newEndVnode)) {
      // 头部不是同一个元素，从尾部开始对比
      // 递归
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      console.log('🚀 ~ isSameVnode ~ oldStartVnode, newEndVnode:', oldStartVnode, newEndVnode)
      // 新旧的头部和尾部对应的不一样，开始交叉对比（头对尾，尾对头）
      patch(oldStartVnode, newEndVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      console.log('🚀 ~ isSameVnode ~ oldEndVnode, newStartVnode:', oldEndVnode, newStartVnode)
      patch(oldEndVnode, newStartVnode) // 此元素中有子节点
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else {
      // 子节点之间没有对应关系
      // 1. 创建旧元素的映射表
      // 2. 从旧节点中寻找元素
      let moveIndex = map[newStartVnode.key]
      if (moveIndex === undefined) {
        // 找不到
        parent.insertBefore(createEL(newStartVnode), oldStartVnode.el)
      } else {
        // 找到 - 将旧元素移动到新元素的位置
        let moveVnode = oldChildren[moveIndex] // 获取到要移动的元素
        oldChildren[moveIndex] = null // 防止数组塌陷
        // 插入
        parent.insertBefore(moveVnode.el, oldStartVnode.el)
        // - 问题：插入的元素可能存在子节点，需要递归
        patch(moveVnode, newStartVnode)
      }
      // 新元素指针位移
      newStartVnode = newChildren[++newStartIndex]
    }

    // * 面试题：为什么要加 key？
    // 若是使用 key，元素会被复用而不是重新创建
  }

  // 添加多出的子节点（如果有)
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let child = newChildren[i]
      parent.appendChild(createEL(child))
    }
  }
  // 清除多余的子节点（如果有)
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      // - 有些元素节点可能为 null - 为了防止数据塌陷
      let child = oldChildren[i]
      if (child != null) {
        parent.removeChild(child.el)
      } else {
      }
    }
  }
}

// 添加属性
function updateProps(vnode, oldProps = {}) {
  let newProps = vnode.data || {} // 获取当前新节点的属性
  let el = vnode.el // 获取当前真实节点

  // 1. 旧的有，新的没有 - 删除
  for (const key in newProps) {
    if (!oldProps[key]) {
      el.removeAttribute(key)
    }
  }
  // 2. 样式
  let newStyle = newProps.style || {} // 获取新的样式
  let oldStyle = oldProps.style || {} // 获取旧的样式
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style = ''
    }
  }
  // 2. 新的有，旧的没有 / 更新
  for (const key in newProps) {
    if (key === 'style') {
      for (const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key === 'class') {
      el.className = newProps.class
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
}

// 创建 DOM - vnode: { tag, data, key, children, text } -> 真实 DOM
export function createEL(vnode) {
  let { tag, children, data, text, key } = vnode
  // 判断是否是元素（文本内容 tag 为 undefined）
  if (typeof tag === 'string') {
    // 创建元素
    vnode.el = document.createElement(tag)
    updateProps(vnode) // 添加属性
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
