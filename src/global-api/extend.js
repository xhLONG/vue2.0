export function initExtend(Vue){
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