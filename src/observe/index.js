import { ArrMethods } from "./arr";

export function observer(data) {
  // console.log("🚀 ~ observer ~ data:", data);
  // * 1、对象 vue2
  if (typeof data !== "object" || data === null) {
    return data;
  }
  return new Observer(data);
}

class Observer {
  constructor(data) {
    // console.log("🚀 ~ Observer ~ data:", data);
    // 为 data 定义一个属性
    Object.defineProperty(data, "__ob__", {
      enumerable: false, // 不可枚举
      value: this, // 指向返回的实例
    });
    // 观测数据 - 判断是数组还是对象
    if (Array.isArray(data)) {
      // 数组数据劫持 - 切片思想 - 函数劫持，重写数组方法(push pop ...)
      data.__proto__ = ArrMethods;
      // 如果数组里有对象
      this.observeArray(data); // 处理数组对象
      console.log("Is Array");
    } else {
      this.walk(data); // 遍历
    }
  }

  walk(data) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      // 对每个属性进行劫持
      let key = keys[i];
      let value = data[key];
      defineReactive(data, key, value);
    }
  }

  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observer(items[i]);
    }
  }
}

// 对象属性劫持
function defineReactive(data, key, value) {
  observer(value); // 递归判断是否是对象
  Object.defineProperty(data, key, {
    get() {
      console.log("🚀 ~ get ~ value:", value);
      return value;
    },
    set(newValue) {
      console.log("🚀 ~ set ~ newValue:", newValue);
      if (newValue === value) return;
      observer(newValue); // 递归判断是否是对象，修改后的值可能为对象，如果不递归则新值没有被劫持
      value = newValue;
    },
  });
}
