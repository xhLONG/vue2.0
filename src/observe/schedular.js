import { nextTick } from "../utils";

let has = {};
let queue = [];
let pending = false;        
function flushSchedularQueue(){
    console.log('更新页面');
    queue.forEach(watcher => {
        watcher.run();
    })
    has = {};
    queue = [];
    pending = false;
}


export function queueWatcher(watcher){
    let id = watcher.id;
    if(!has[id]){
        queue.push(watcher);
        has[id] = true;

        // 多次调用queuewatcher，如果watcher不是同一个，就会调用多次nextTick，所以加入pending控制一下，只调用一次nextTick，其他watcher只需加入列表queue
        if(!pending){
            pending = true;
            // 异步更新页面
            nextTick(flushSchedularQueue);
        }
    }
}