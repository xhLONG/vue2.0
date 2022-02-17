import utils from "./utils";
import { observe } from "./observe/index";

export function initState(vm){
    const opts = vm.$options;

    if(opts.data){
        initData(vm);
    }
}

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