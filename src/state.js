import utils from "./utils";
import { observe } from "./observe/index";
import Watcher from "./observe/watcher";
import { watch } from "rollup";
import Dep from "./observe/dep";

export function initState(vm){
    const opts = vm.$options;

    // 初始化状态的顺序应该是 props > methods > data > computed > watch

    if(opts.data){
        initData(vm);
    }
    if(opts.computed){
        initComputed(vm);
    }
    if(opts.watch){
        initWatch(vm);
    }
}

// 初始化data
function initData(vm){
    let data = vm.$options.data;
    /**
     * vue里面的data可能是函数也可能是对象，这是vue的一个考点
     * 1、根实例的data可以是一个对象也可是函数
     * 2、vue组件里面的data是一个函数，并且返回一个对象
     * */
    data = vm._data = utils.isFunction(data) ? data.call(vm) : data;

    observe(data);

    // 给data里面的数据做个简单代理
    for(let key in data){
        proxy(vm, key, '_data');
    }
}

function proxy(obj, key, source){
    Object.defineProperty(obj, key, {
        get(){
            return obj[source][key];
        },
        set(value){
            obj[source][key] = value;
        }
    })
}

// 初始化计算属性
function initComputed(vm){
    const computed = vm.$options.computed;
    const watchers = (vm._computedWatchers = {});   // 存放计算watcher

    for(let k in computed){
        const userDef = computed[k];    // 获取用户定义的计算属性
        const getter = typeof userDef === 'function' ? userDef : userDef.get;
        // 创建计算watcher lazy设置为true
        watchers[k] = new Watcher(vm, getter, () => {}, {lazy: true});
        defineComputed(vm, k, userDef);
    }
}
// 定义普通对象用来劫持计算属性
const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {},
};
// 重新定义计算属性 对get和set劫持
function defineComputed(target, key, userDef){
    if(typeof userDef === 'function'){
        sharedPropertyDefinition.get = createComputedGetter(key);
    }else{
        sharedPropertyDefinition.get = createComputedGetter(key);
        sharedPropertyDefinition.set = userDef.set;
    }
    // 利用object.defineProperty来对计算属性的get和set进行劫持
    Object.defineProperty(target, key, sharedPropertyDefinition);
}
// 重写计算属性的get方法 来判断是否需要进行重新计算
function createComputedGetter(key){
    return function(){
        const watcher = this._computedWatchers[key];    // 获取对应的计算属性watcher
        if(watcher){
            if(watcher.dirty){
                watcher.evaluate(); // 如果是脏的 则重新计算取值
            }
            if(Dep.target){
                // 如果Dep还存在target 这个时候一般为渲染watcher 计算属性依赖的数据也需要收集
                watcher.depend();
            }
            return watcher.value;
        }
    }
}

// 初始化侦听属性
function initWatch(vm){
    let watch = vm.$options.watch;
    for(let k in watch){
        const handler = watch[k];
        if(Array.isArray(handler)){
            handler.forEach(handle => {
                createWatcher(vm, k, handle);
            })
        }else{
            createWatcher(vm, k, handler);
        }
    }
}
// 创建watcher的核心
function createWatcher(vm, exprOrFn, handler, options = {}){
    if(typeof handler === 'object'){
        options = handler;          // 保存用户传入的对象
        handler = handler.handler;  // 这个是用户真正传入的对象
    }
    if(typeof handler === 'string'){
        handler = vm[handler];      // 获取用户定义的methods方法
    }
    // 调用vm.$watch创建用户watcher
    return vm.$watch(exprOrFn, handler, options);
}

export function stateMixin(Vue){
    Vue.prototype.$watch = function(exprOrFn, cb, options){
        const vm = this;
        // user: true 表示这是一个用户watcher
        let watcher = new Watcher(vm, exprOrFn, cb, { ...options, user: true });
        // 如果immediate为true则立即执行
        if(options.immediate){
            cb();
        }
    }
}