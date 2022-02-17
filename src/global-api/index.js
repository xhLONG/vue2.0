import { mergeOptions } from "../utils";

export function initGlobalAPI(Vue){
    Vue.options = {};   //用来存储全局的配置
    Vue.mixin = function(mixin){
        // 这里是已经将mixin的内容合并到Vue.options了
        Vue.options = mergeOptions(Vue.options, mixin);
        return this;
    }


    Vue.options._base = Vue;        // 用来保证子组件可以访问到Vue构造函数
    Vue.options.components = {};    // 用来存放组件的定义
    Vue.component = function(id, definition){
        definition.name = definition.name || id;
        definition = this.options._base.extend(definition);    // 通过对象产生一个组件构造函数，相当于调用Vue.extend()
        this.options.components[id] = definition;              // 把组件构造函数放在Vue.options里面，实例化Vue的时候会对components属性进行合并
    }
    let cid = 0;
    Vue.extend = function(options){
        const Super = this;         // 永远指向Vue，保证Sub永远都是继承于Vue
        const Sub = function VueComponent(options){
            this._init(options);
        }
        Sub.cid = cid++;            // 给每个组件标号，区分组件
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        Sub.component = Super.component;
        // ...

        
        console.log('---------------')
        console.log('super.options', Super.options);
        console.log('Vue.options', Vue.options);
        Sub.options = mergeOptions(Super.options, options);
        return Sub;
    }
}