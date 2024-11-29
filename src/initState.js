import { observer } from "./observe/index";

export function initState(vm) {
  let opts = vm.$options;
  // console.log('🚀 ~ initState ~ ops:', opts)

  // 根据配置项进行一系列判断以及初始化操作
  if (opts.data) {
    initData(vm);
  }
  if (opts.props) {
    initProps(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.methods) {
    initMethods(vm);
  }
}

function initData(vm) {
  // console.log("data 初始化: ", vm.$options);
  // 因为 data 可以是一个函数，也可以是一个对象
  // 所以初始化时候需要判断
  let data = vm.$options.data;
  data = vm._data = typeof data === "function" ? data.call(vm) : data; // ! 注意这里 data() 的 this 指向
  console.log("🚀 ~ initData ~ data:", vm);
  // * 对data数据进行劫持
  observer(data); // (1) 对象 (2) 数组
}

function initProps(vm) {}

function initWatch(vm) {}

function initComputed(vm) {}

function initMethods(vm) {}
