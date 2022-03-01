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
const targetStack = [];     // 栈结构用来存储watcher

export function pushTarget(watcher){
    targetStack.push(watcher);
    Dep.target = watcher;   // Dep.target指向当前target       
}
export function popTarget(){
    targetStack.pop();      // 当前watcher出栈 拿到上一个watcher
    Dep.target = targetStack[targetStack.length - 1];
}

export default Dep;