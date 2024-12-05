// 功能：将 HTML 转为 AST

// <div id="app">hello{{msg}}</div>
/**
 * {
 *   tag: 'div',
 *   attrs: { id: 'app' },
 *   children: [
 *    {
 *      tag: null,
 *      text: 'hello'
 *    },
 *    {
 *      tag: 'div'
 *    }
 * ]
 * }
 */

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // <div:xxx>
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则，捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾的 </div>
// 属性 - id="app"
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 属性
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的 >
// 转为 ast 语法树时使用到
// const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配 {{}}

// 遍历 - 创建 ast 语法树 - 将文件顶部的 div 转为其下面格式的 ast
function createASTElement(tag, attrs) {
  return {
    tag, // 元素
    attrs, // 属性
    children: [], // 子节点
    type: 1,
    parent: null
  }
}

let root // 根元素
let createParent // 当前元素的父亲
// 数据结构 - 栈
let stack = [] // * 当使用下方的 start、charts、end 方法遍历处理时，保存相应的元素的层级 - 明确当前元素的父亲
// 开始标签
function start(tag, attrs) {
  let element = createASTElement(tag, attrs)
  if (!root) {
    root = element
  }
  createParent = element
  stack.push(element) // 元素入栈
}
// 文本标签 - 获取文本
function charts(text) {
  // console.log('🚀 ~ text:', text)
  text = text.replace(/a/g, '') // /a 替换空格
  // console.log('🚀 ~ charts ~ text:', text)
  if (text) {
    createParent.children.push({
      type: 3,
      text
    })
  }
}
// 结束标签
function end(tag) {
  // console.log('🚀 ~ end ~ tag:', tag)
  let element = stack.pop() // 元素出栈
  createParent = stack[stack.length - 1]
  // 元素闭合
  if (createParent) {
    element.parent = createParent.tag
    createParent.children.push(element)
  }
}

// * 解析 HTML - 将 HTML 转为 AST - 遍历
export function parseHTML(html) {
  // <div id="app">hello</div> - 开始标签 文本 结束标签
  // 一边遍历一边匹配一边删除，当 html 为空则结束
  while (html) {
    // 判断标签 <>
    let textEnd = html.indexOf('<') // 0
    if (textEnd === 0) {
      // 开始标签
      const startTagMatch = parseStartTag() // 开始标签的内容
      // console.log('🚀 ~ parseHTML ~ startTagMatch:', startTagMatch)
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      // 结束标签
      let endTagMatch = html.match(endTag)
      // console.log('🚀 ~ parseHTML ~ endTagMatch:', endTagMatch)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    // 文本内容 - < 在内容之后，所以是大于 0
    let text
    if (textEnd > 0) {
      // 获取文本内容
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      charts(text)
    }
    // break
  }

  function parseStartTag() {
    // 解析开始标签
    const start = html.match(startTagOpen) // 1. 返回结束 2. false
    if (!start) return null
    // console.log('🚀 ~ parseStartTag ~ start:', start)
    // 创建 ast 语法树
    let match = {
      tagName: start[1],
      attrs: []
    }
    // 删除 开始标签
    advance(start[0].length)
    // 匹配属性并删除 - 属性可能有多个，以及结束标签 >
    let attr
    let end
    while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
      // console.log('🚀 ~ parseStartTag ~ attr:', attr)
      match.attrs.push({
        name: attr[1],
        value: attr[3] || attr[4] || attr[5]
      })
      advance(attr[0].length)
    }
    if (end) {
      // console.log('🚀 ~ parseStartTag ~ end:', end)
      advance(end[0].length)
      return match
    }
  }

  function advance(n) {
    html = html.substring(n)
    // console.log('🚀 ~ advance ~ html:', html)
  }

  // console.log('🚀 ~ parseHTML ~ root:', root)
  return root
}
