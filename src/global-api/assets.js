export function initAssetRegisters(Vue){
    Vue.options.components = {};    // 用来存放组件的定义
    Vue.component = function(id, definition){
        definition.name = definition.name || id;
        definition = this.options._base.extend(definition);    // 通过对象产生一个组件构造函数，相当于调用Vue.extend()
        this.options.components[id] = definition;              // 把组件构造函数放在Vue.options里面，实例化Vue的时候会对components属性进行合并
    }
}