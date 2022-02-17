// 保存原数组上的方法
const newArray = Object.create(Array.prototype);

// 以下方法会改变原数组，只需对以下方法进行重写
const methodList = [
    'shift',
    'unshift',
    'splice',
    'pop',
    'push',
    'reverse',
    'sort',
]

// 只需重写vue data里面的数组的原型方法，不需对其他数组造成影响
methodList.forEach(method => {
    newArray[method] = function(...args){
        // 执行原数组的函数逻辑
        let result = Array.prototype[method].apply(this, args);
        // 接下来再执行新的逻辑，这种方式也叫做切片
        let inserted = null;    // 保存插入数组中的内容
        const ob = this._ob_;
        switch(method){
            case 'splice':
                inserted = args.slice(2);
                break;
            case 'unshift':
            case 'push':
                inserted = args;
                break
            default:
                break;
        }
        if(inserted){
            ob.observeArray(inserted);
        }
        ob.dep.notify();
        return result
    }
})

export default newArray;