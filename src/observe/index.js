export function observer(data) {
  console.log('🚀 ~ observer ~ data:', data)
  // * 1、对象 vue2
  if (typeof data !== 'object' || data === null) {
    return data
  }
  return new Observer(data)
}

class Observer {
  constructor(data) {
    this.walk(data) // 遍历
  }

  walk(data) {
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      // 对每个属性进行劫持
      let key = keys[i]
      let value = data[key]
      defineReactive(data, key, value)
    }
  }
}

// 属性劫持
function defineReactive(data, key, value) {
  observer(value) // 递归判断是否是对象
  Object.defineProperty(data, key, {
    get() {
      console.log('🚀 ~ get ~ value:')
      return value
    },
    set(newValue) {
      console.log('🚀 ~ set ~ newValue:', newValue)
      if (newValue === value) return
      observer(newValue) // 递归判断是否是对象，修改后的值可能为对象，如果不递归则新值没有被劫持
      value = newValue
    }
  })
}
