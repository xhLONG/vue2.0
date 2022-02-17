let id = 0;
// 把当前的watcher放到一个全局变量
class Dep{
    constructor(){
        this.id = id++;
        this.subs = [];     // 让属性记住watcher
    }
    depend(){
        // 让watcher记住dep
        Dep.target.addDep(this);
    }
    addSub(watcher){
        this.subs.push(watcher);
    }

    notify(){
        // 通知watcher去更新
        this.subs.forEach(sub => sub.update())
    }
}
Dep.target = null;

export function pushTarget(watcher){
    Dep.target = watcher
}
export function popTarget(){
    Dep.target = null
}

export default Dep;