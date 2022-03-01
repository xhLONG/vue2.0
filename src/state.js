import utils from "./utils";
import { observe } from "./observe/index";
import Watcher from "./observe/watcher";

export function initState(vm){
    const opts = vm.$options;

    // 初始化状态的顺序应该是 props > methods > data > computed > watch

    if(opts.data){
        initData(vm);
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

// 初始化watch
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