import { createElement, createTextNode } from "./vdom/index"

export function renderMixin(Vue){
    Vue.prototype._c = function(){
        return createElement(this, ...arguments);
    }
    Vue.prototype._v = function(){
        return createTextNode(this, ...arguments);
    }
    Vue.prototype._s = function(value){
        if(Object.prototype.toString.call(value) === '[object Object]'){
            return JSON.stringify(value)
        }
        return value
    }

    Vue.prototype._render = function(){
        const vm = this;
        const render = vm.$options.render;
        console.log(render, vm)
        let vnode = render.call(vm);
        return vnode;
    }
}