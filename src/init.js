
import { initState } from "./state";
import { complileToFunction } from "./compiler/index";
import { callHook, mountComponent } from "./lifecycle";
import { mergeOptions, nextTick } from "./utils";

export function initMixin(Vue){
    // 后续组件开发的时候 Vue.extend可以创造一个子组件，子组件可以继承Vue，子组件也可以调用_init方法
    Vue.prototype._init = function(options){
        const vm = this;    // 当前的vue实例对象，可能是组件
        vm.$options = mergeOptions(vm.constructor.options, options);
        console.log(vm.$options)
        //vm.$options = options;  // 方便后续其他方法访问options

        callHook(vm, 'beforeCreate');
        // 初始化状态
        initState(vm);
        callHook(vm, 'created');

        if(vm.$options.el){
            // 挂载数据到页面
            console.log('页面要挂载')

            /**
             * template -> ast语法书（用来描述代码本身形成的结构，可以描述js\html\css）->描述成一个树结构->将代码重组成js语法
             * template模版编译成render函数 -> 虚拟dom -> diff算法对比虚拟dom
             */
            vm.$mount(vm.$options.el);
        }
    }

    Vue.prototype.$nextTick = nextTick;

    /**
     * 将vue实例挂载在html模版上，通常有三种方式：1、render()函数；2、template模版；3、根据el元素路径进行挂载。优先级如顺序。
     * @param {String} el 
     * html元素路径
     */
    Vue.prototype.$mount = function(el){
        const vm = this;
        const options = vm.$options;
        el = el && document.querySelector(el);

        // 如果不存在render属性
        if(!options.render){
            let template = options.template;
            // 如果不存在tempalte，但是有el;
            if(!template && el){
                template = el.outerHTML;
            }

            // 最终还是需要将template模版转化成render函数
            if(template){
                let render = complileToFunction(template);
                options.render = render;          
            }
        }
        mountComponent(vm, el);
    }
}