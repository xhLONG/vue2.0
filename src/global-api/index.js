import { del, set } from "../observe/index";
import { initAssetRegisters } from "./assets";
import { initExtend } from "./extend";
import { initMixin } from "./mixin";

export function initGlobalAPI(Vue){
    Vue.options = {};   //用来存储全局的配置

    Vue.options._base = Vue;        // 用来保证子组件可以访问到Vue构造函数
    initMixin(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);

    Vue.set = set
    Vue.delete = del
}