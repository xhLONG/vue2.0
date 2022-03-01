/**
 * vue响应式原理
 */
import utils from "../utils"
import newArray from "./array";
import Dep from "./dep";

class Observe{
    constructor(data){
        this.dep = new Dep();   // 给数组本身或对象本身增加一个dep属性
        Object.defineProperty(data, '_ob_', {
            value: this,        // 给监听的对象添加_ob_属性，一方面是为了标志已监听，另一方面是为了方便监听数组插入的内容
            enumerable: false,  // 设置不可枚举，防止遍历时递归死循环
        })
        // 数组和对象的监听方式不一样
        if(Array.isArray(data)){
            data.__proto__ = newArray;    // 改变数组的原型对象，从而重写数组方法
            this.observeArray(data);      // 如果数组里面是对象，就会递归进行监听
        }else{
            this.walk(data);
        }
    }
    observeArray(arr){
        arr.forEach(item => observe(item));
    }
    walk(data){
        // 循环遍历data的key值进行观测
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key]);
        })
    }
}

// 让里层数组收集外层数组的依赖，这样修改里层数组也可以更新视图
function dependArray(value){
    for(let i=0; i< value.length; i++){
        let current = value[i];
        current._ob_ && current._ob_.dep.depend();  // 让里层和外层都是收集同一个watcher
        if(Array.isArray(current)){
            dependArray(current);
        }
    }
}

/**
 * vue2慢的一个原因就是这里，数据劫持，首先是用了Object.defineProperty，对每一个属性都进行了监听，并且又对每一层进行了递归监听，
 * 而在监听的过程中又用了闭包（可能会产生过多的闭包）;只是对已有属性进行监听。所以只能监听已有属性，不能监听数组通过下标修改、添加的值，
 * 不能监听对象新增的属性，可以通过Vue.$set()进行设置监听。这是vue2的一个考点
 * 优化：
 *  1、减少data中的属性，
 *  2、不要在data中写层级过深的对象
 *  3、不需要监听的数据可以使用冻结Object.freez()
 */
function defineReactive(obj, key, value){
    let childOb = observe(value);   // 递归每一层，监听每一层对象
    let dep = new Dep()     // 每次都给属性创建一个dep，每个dep都对应相应的渲染组件watcher
    Object.defineProperty(obj, key, {
        get(){
            if(Dep.target){
                dep.depend();   // 只有存在watcher才进行依赖收集，避免外部其他地方访问属性也进行了依赖收集。让这个属性的dep记住watcher,也要让watcher记住dep
                if(childOb){    // 如果对数组取值 会将当前的watcher和数组关联
                    childOb.dep.depend();
                    if(Array.isArray(value)){
                        dependArray(value);
                    }
                }
            }
            return value;   // 这里实际上就是闭包的作用了，也就是说每次监听都会产生一个闭包
        },
        set(newValue){
            if(value === newValue) return;
            observe(newValue);      // 如果新修改的值为对象，则对该对象继续监听
            value = newValue;
            dep.notify();           // 当值发生变化时，让dep通知watcher去执行
        }
    })
}

export function observe(data){
    if(!utils.isObject(data)){
        return ;
    }
    if(data._ob_){
        return ;
    }

    // 对对象进行观测，且最外一层是{}，不是[]

    // 如果一个对象已经被观测过了，就不需要再次观测，可以用一个标示符来判断

    return new Observe(data);
}
/**
 * 观察者模式、依赖收集、发布订阅。
 * 使用object.definedProperty实现了数据劫持，观察每一个属性，给每个一个属性都添加了一个dep实例；
 * 当获取属性时就会触发getter方法，收集依赖，此时会将watcher实例（每个组件对应一个watcher实例）和dep实例联系起来，
 * watcher也是作为一个订阅者加入到dep的订阅者列表中，一个watcher会对应多个dep，一个dep也可能会对应多个watcher(渲染watcher、计算watcher)；
 * 当修改某个属性值时就会触发setter方法，dep发布通知，订阅者列表中的订阅者就会被执行。
 * 
 * 所以说vue也是组件级更新，属性值发生改变，只会更新相应的组件
 */