import { popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./schedular";

let id = 0;
class Watcher{
    constructor(vm, exprOrfn, cb, options){
        this.vm = vm;
        this.getter = exprOrfn;
        this.cb = cb;
        this.options = options;
        this.id = id++;
        this.deps = [];             // 记录dep
        this.depsId = new Set();

        this.get();
    }

    get(){
        // 在对属性取值之前先把watcher记录一下
        pushTarget(this);
        // 这个方法中会对属性进行取值操作
        this.getter();
        popTarget();
    }

    addDep(dep){
        let id = dep.id;
        if(!this.depsId.has(id)){
            this.depsId.add(id);
            this.deps.push(dep);
            dep.addSub(this);
        }
        this.deps.push(dep);
    }

    run(){
        this.get();
    }
    update(){
        // 批处理更新
        queueWatcher(this);
    }
}
// 渲染的时候会产生一个watcher，同时每个属性会增加一个dep，watcher和dep互相记住，当属性值发生变化时执行自身对应的watcher

export default Watcher;