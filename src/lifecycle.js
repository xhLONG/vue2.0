import Watcher from "./observe/watcher";
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue){
    Vue.prototype._update = function(vnode){     // 将虚拟节点变成真实节点
        // 将vnode渲染到元素中 用虚拟dom替换真实元素
        const vm = this;
        console.log('虚拟dom', vnode)

        // 第一次初始化，第二次走diff算法
        const prevVnode = vm._vnode;
        vm._vnode = vnode;              // 保存上一次的虚拟节点
        if(!prevVnode){
            vm.$el = patch(vm.$el, vnode);
        }else{
            vm.$el = patch(prevVnode, vnode);
        }
    }
}

export function callHook(vm, hook){ // 发布模式
    const handlers = vm.$options[hook];
    if(handlers){
        // 将钩子函数的this指向vm实例，并执行钩子函数，所以钩子函数不能是箭头函数
        handlers.forEach(hook => hook.call(vm));
    }
}

export function mountComponent(vm, el){
    // 实现页面的挂载流程
    vm.$el = el;
    const updateComponent = () => {
        // 调用render函数，获取虚拟节点，生成真实dom
        vm._update(vm._render())
    };
    // 默认vue是通过watcher来进行渲染 = 渲染watcher（每个组件都有一个渲染watcher）
    // 如果数据发生变化，也调用这个函数
    // updateComponent();
    new Watcher(vm, updateComponent, () => {}, true);
}