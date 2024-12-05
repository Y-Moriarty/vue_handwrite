import { generate } from './generate'
import { parseHTML } from './parseAst'

// * 模板解析
export function compileToFunction(el) {
  // console.log('🚀 ~ compileToFunction ~ el:', el)
  // * 1. 将 HTML 转为 AST 语法树
  let ast = parseHTML(el)
  // console.log('🚀 ~ compileToFunction ~ ast:', ast)
  // * 2. AST -> render 函数（字符串）
  let code = generate(ast)
  // console.log('🚀 ~ compileToFunction ~ code:', code)
  // * 3. 将 render 字符串 -> render 函数
  let render = new Function(`with(this){return ${code}}`)
  // console.log('🚀 ~ compileToFunction ~ render:', render)
  return render
}

/**
 * * with() - 获取上下文（作用域）- 面试题
 * let obj = {
 *   a: 1,
 *   b: 2
 * }
 * with(obj) {
 *   console.log(a); // 1
 *   console.log(b); // 2
 * }
 */
