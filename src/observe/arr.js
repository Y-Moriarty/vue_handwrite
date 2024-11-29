// 重写数组方法
// 1. 获取原来的数组方法
let oldArrayProtoMethods = Array.prototype;
// 2. 继承
export let ArrMethods = Object.create(oldArrayProtoMethods);
// 3. 劫持
let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

methods.forEach((method) => {
  ArrMethods[method] = function (...args) {
    // 添加业务逻辑
    // 如果数组里有对象
    let result = oldArrayProtoMethods[method].apply(this, args); // this 指向数组
    // 问题：数组追加对象时，对象的属性没有被劫持
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2); // arr.spilce(start, deleteCount, item1, item2, ...)
        break;
    }
    console.log("inserted: ", inserted);
    let ob = this.__ob__; // 这里的 this 指向 Observer constructor 的 data - data 中自定义了 __ob__
    if (inserted) {
      ob.observeArray(inserted); // 对添加的对象进行劫持
    }
    return result;
  };
});
