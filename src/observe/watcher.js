import utils from "../utils";
import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./schedular";

let id = 0;
class Watcher{
    // 这里源码还有最后一个参数isRenderWatcher
    constructor(vm, exprOrfn, cb, options){
        this.vm = vm;
        // this.getter = exprOrfn;
        this.cb = cb;
        this.options = options;
        this.id = id++;
        this.deps = [];             // 记录dep
        this.depsId = new Set();

        this.user = this.options.user;

        // 处理exprOrfn
        if(typeof exprOrfn == 'function'){
            this.getter = exprOrfn;
        }else{
            this.getter = function(){
                // 用户watcher传过来的可能是字符串 类似a.b.b.b
                let path = exprOrfn.split('.');
                let obj = vm;
                for(let i=0; i<path.length; i++){
                    obj = obj[path[i]];
                }
                return obj;
            }
        }

        // 实例化时进行一次取值操作，进行依赖收集
        this.value = this.get();
    }

    get(){
        // 在对属性取值之前先把watcher记录一下，只有在对属性取值时才有watcher
        pushTarget(this);
        // 这个方法中会对属性进行取值操作
        //如果watcher是渲染watcher 那么就相当于执行  vm._update(vm._render()) 这个方法在render函数执行的时候会取值 从而实现依赖收集
        const res = this.getter.call(this.vm); 
        popTarget();
        return res;
    }

    addDep(dep){
        let id = dep.id;
        if(!this.depsId.has(id)){
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
    }

    run(){
        const newVal = this.get();  // 新值
        const oldVal = this.value;  // 老值
        this.value = newVal;
        if(this.user){
            // 如果两次的值不相同  或者值是引用类型 因为引用类型新老值是相等的 他们是指向同一引用地址
            if(newVal !== oldVal || utils.isObject(newVal)){
                this.cb.call(this.vm, newVal, oldVal);
            }
        }else{
            // 渲染watcher
            this.cb.call(this.vm);
        }
    }
    update(){
        // 批处理更新
        queueWatcher(this);
    }
}
// 渲染的时候会产生一个watcher，同时每个属性会增加一个dep，watcher和dep互相记住，当属性值发生变化时执行自身对应的watcher

export default Watcher;