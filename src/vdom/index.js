import utils, { isReservedTag } from "../utils";

export function createElement(vm, tag, data={}, ...children){
    // 需要对标签名做过滤，标签名可能是自定义组件
    if(isReservedTag(tag)){     // 普通标签
        return vnode(vm, tag, data, children, data.key, null);
    }else{                      // 自定义组件
        // Ctor可能是对象也可能是组件构造器函数
        // 如果是来自Vue实例对象内的component属性，则Ctor是对象
        // 如果是来自Vue.component()声明的全局组件，则Ctor是组件构造器函数
        const Ctor = vm.$options.components[tag];
        console.log('自定义组件', Ctor)
        return createComponent(vm, tag, data, children, data.key, Ctor)
    }
}

function createComponent(vm, tag, data, children, key, Ctor){
    // 需要将Ctor转换为组件构造器函数
    if(utils.isObject(Ctor)){
         Ctor = vm.$options._base.extend(Ctor);
         console.log(Ctor.options)
    }
    // 给组件添加生命周期
    data.hook = {
        init(vnode){
            const child = vnode.componentInstance = new vnode.componentOptions.Ctor({});
            child.$mount();
        }    
    }
    // 组件的虚拟节点有hook和当前组件的componentOptions 存放了Ctor组件构造函数
    return vnode(vm, `vue-component-${Ctor.cid}-${tag}`, data, undefined, key, undefined, {Ctor});
}

export function createTextNode(vm, text){
    return vnode(vm, null, null, null, null, text);
}

function vnode(vm, tag, data, children, key, text, componentOptions){
    return {
        vm,
        tag,
        data,
        children,
        key,
        text,
        componentOptions,
    }
}

export function isSameVnode(oldVnode, newVnode){
    return (oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key);
}