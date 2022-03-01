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

        this.user = this.options.user;  // 标识用户watcher
        this.lazy =options.lazy;        // 表示计算属性watcher
        this.dirty = this.lazy;         // dirty可变 标识计算watcher是否需要重新取值 默认为true

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

        // (非计算属性)实例化时进行一次取值操作，进行依赖收集
        this.value = this.lazy ? undefined : this.get();
    }

    get(){
        // 在对属性取值之前先把watcher记录一下，只有在对属性取值时才有watcher
        pushTarget(this);
        // 这个方法中会对属性进行取值操作
        // 如果watcher是渲染watcher 那么就相当于执行  vm._update(vm._render()) 这个方法在render函数执行的时候会取值 从而实现依赖收集
        // 如果watcher是计算watcher 在这里执行用户定义的get函数 访问计算属性的依赖项 从而把自身计算Watcher添加到依赖项dep里面收集起来
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
        // 当计算属性依赖的值发生变化 只需要把dirty置为true  下次访问到了会重新计算
        if(this.lazy){
            this.dirty = true;
        }else{
            // 批处理更新
            queueWatcher(this); 
        }
    }

    // 计算属性重新计算进行计算 并且计算完成后把dirty置为false
    evaluate(){
        this.value = this.get();
        this.dirty = false;
    }

    depend(){
        // 计算属性的watcher存储了依赖项的dep
        let i = this.deps.length;
        while(i--){
            this.deps[i].depend();      //调用依赖项的dep去收集外层渲染watcher
        }
    }
}
// 渲染的时候会产生一个watcher，同时每个属性会增加一个dep，watcher和dep互相记住，当属性值发生变化时执行自身对应的watcher

export default Watcher;