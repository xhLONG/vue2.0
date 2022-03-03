import { mergeOptions } from "../utils";

export function initMixin(Vue){
    Vue.mixin = function(mixin){
        // 这里是已经将mixin的内容合并到Vue.options了
        Vue.options = mergeOptions(Vue.options, mixin);
        return this;
    }
}