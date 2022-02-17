const utils = {
    isFunction: function(val){
        return val instanceof Function;
    },

    isObject: function(val){
        return typeof val === 'object' && val !== null;
    },
}
export default utils;


let callbacks = [];
let waiting = false;
function flushCallbacks(){
    // 第一次cb渲染watcher更新操作
    // 第二次后面cb是用户传入的回调
    callbacks.forEach(cb => {
        cb();
    })
    callbacks = [];
    waiting = false;
}
export function nextTick(cb){
    callbacks.push(cb);     // 默认的cb是渲染逻辑  用户的逻辑放到渲染逻辑之后，就可以保证用户获取到渲染后的内容

    // 批处理，只有首次会开定时器，后续只需加入callbacks列表中
    if(!waiting){
        waiting = true;

        /**
         * vue2对异步处理的优雅降级
         * 1、promise
         * 2、mutationObserver
         * 3、setImmdiate
         * 4、setTimeout
         * vue3则直接使用promise
         */
        Promise.resolve().then(flushCallbacks);
    }
}


const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed'
]
// 合并钩子函数到一个数组里面存储
function mergeHook(parentVal, childVal){
    if(childVal){
        if(parentVal){  // 父子都有
            return parentVal.concat(childVal);
        }else{          // 父无子有
            return [childVal];
        }
    }else{
        return parentVal;
    }
}
const strats = {};
LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeHook;
})
strats.components = function(parentVal, childVal){
    const res = Object.create(parentVal);
    if(childVal){
        for(let key in childVal){
            res[key] = childVal[key];
        }
    }
    return res;
}
export function mergeOptions(parent, child){
    const options = {};
    // 1、如果父亲有的，儿子也有，应该用儿子的
    // 2、如果父亲有的，儿子没有，应该用父亲的
    for(let key in parent){
        mergeField(key);
    }
    for(let key in child){
        // 已经合并过的key就不用再考虑了
        if(!options.hasOwnProperty(key)){
            mergeField(key);
        }
    }

    function mergeField(key){
        // 策略模式
        if(strats[key]){
            return options[key] = strats[key](parent[key], child[key])
        }
        if(utils.isObject(parent[key]) && utils.isObject(child[key])){
            options[key] = {...parent[key], ...child[key]};
        }else{
            if(child[key]){
                options[key] = child[key];
            }else{
                options[key] = parent[key];
            }
        }
    }

    return options;
}


function makeUp(str){
    const map = {};
    str.split(',').forEach(tag => {
        map[tag.trim()] = true;
    })
    return (tag) => map[tag] || false;
}
export const isReservedTag = makeUp("html,body,base,head,link,meta,style,title," +
"address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section," +
"div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul," +
"a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby," +
"s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video," +
"embed,object,param,source,canvas,script,noscript,del,ins," +
"caption,col,colgroup,table,thead,tbody,td,th,tr," +
"button,datalist,fieldset,form,input,label,legend,meter,optgroup,option," +
"output,progress,select,textarea," +
"details,dialog,menu,menuitem,summary," +
"content,element,shadow,template,blockquote,iframe,tfoot");