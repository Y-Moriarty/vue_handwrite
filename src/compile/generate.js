// <div id="app">hello{{msg}}</div>
/**
 * render() {
 *   return _c('div',{ id: 'app' },[
 *     _v('hello'+_s(msg)),
 *     _c('div'))
 * }
 */

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{}}

// 处理属性
function genPorps(attrs) {
  let str = ''
  // attrs 是对象的形式
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i] // {name: 'xxx', value: 'xxx'}
    // 处理 style 属性
    if (attr.name === 'style') {
      let obj = {}
      // value: "color: red; font-size: 20px" -> {style: {color: 'red', fontSize: '20px'}}
      attr.value.split(';').forEach(item => {
        let [key, val] = item.split(':')
        obj[key] = val
      })
      attr.value = obj
    }
    // 拼接字符串
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}` // 去掉最后一个逗号
}

// 处理子节点（1）判断是否存在子节点，存在则循环遍历处理每一个子节点
function genChildren(ast) {
  let children = ast.children
  if (children) {
    return children.map(child => gen(child)).join(',')
  }
}
// 处理子节点（2）判断子节点类型并进行相应处理
function gen(node) {
  // console.log('🚀 ~ gen ~ node:', node)
  // 子节点内容：1. 元素节点 3. 文本节点
  if (node.type === 1) {
    // 元素节点
    return generate(node)
  } else {
    // 文本节点
    // * 1. 纯文本  2. 差值表达式 {{msg}}
    let text = node.text // 获取文本内容
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})` // 纯文本
    }
    // 带有 差值表达式 {{msg}}
    let tokens = []
    let lastindex = (defaultTagRE.lastIndex = 0) // ! 如果不设置正则的 lastIndex 为 0，则下一次循环使用会从上一次的位置开始，导致匹配不齐全或不成功
    let match
    while ((match = defaultTagRE.exec(text))) {
      // console.log('🚀 ~ gen ~ match:', match)
      let index = match.index
      // 判断匹配的位置是否大于上一次匹配的位置，是的话就添加内容
      if (index > lastindex) {
        // 添加匹配到 {{}} 前的内容
        tokens.push(JSON.stringify(text.slice(lastindex, index)))
      }
      // {{}} 添加差值表达式里的内容
      tokens.push(`_s(${match[1].trim()})`)
      lastindex = index + match[0].length
    }
    //  判断最后一个 {{}} 后是否还有文本，是的话就添加
    if (lastindex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastindex)))
    }
    return `_v(${tokens.join('+')})`
  }
}

// * 将 AST 转为 render 函数（字符串）
// 2.1 ast 语法树变成字符串
// 2.2 字符串变成函数
export function generate(ast) {
  let children = genChildren(ast)
  // 注意元素属性
  let code = `_c('${ast.tag}',${ast.attrs.length ? `${genPorps(ast.attrs)}` : 'undefined'}${children ? `,${children}` : ''})`
  // console.log('🚀 ~ generate ~ code:', code)
  return code
}
