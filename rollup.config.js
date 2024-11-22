// RollUp 打包配置文件
import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
  input: './src/index.js', // 打包入口文件
  output: {
    file: 'dist/vue.js', // 打包出口文件
    format: 'umd', // 采用什么模块打包 - umd 模式 - 支持前端和后端 - 需要配置 name
    name: 'Vue',
    sourcemap: true // 将转换后的代码进行映射（vue.js.map）
  },
  // 使用插件
  plugins: [
    // 将 ES6 语法转为 ES5 语法
    // 默认会将所有文件解析 - 包括node_modules - 需要配置 exclude
    babel({
      exclude: 'node_modules/**'
    }),
    // 开启服务，并指定端口号和打开的文件
    serve({
      open: true,
      port: 3000,
      contentBase: '', // 为空则表示在当前目录
      openPage: '/index.html'
    })
  ]
}
