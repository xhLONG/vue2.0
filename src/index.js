import { initGlobalAPI } from "./global-api/index.js";
import { initMixin } from "./init";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./render";
import { stateMixin } from "./state.js";
// 所有功能通过原型的方式添加
function Vue(option){
    this._init(option);    // 实现vue的初始化
}

initMixin(Vue);         // 扩展初始化方法
lifecycleMixin(Vue);    // 扩展_update方法
renderMixin(Vue);       // 扩展_render方法
stateMixin(Vue);        // 扩展$watch方法

initGlobalAPI(Vue);

export default Vue;


// 1、new Vue 会调用_init方法进行初始化
// 2、会将用户的选项放到vm.$options上
// 3、会搜索当前选项上有没有data，进行观测observe
// 4、使用vue实例vm访问data中的数据，将data中的数据放到vm._data中，或者利用代理的方式使用vue.XXX访问

// 5、更新对象上不存在的属性，会导致视图不更新，如果是数组通过索引方式更新数组，也会导致视图不更新
// 6、如果是替换成一个新对象，新对象会被劫持；数组通过push()\unshift()等更新，新增内容会被劫持
// 7、用_ob_标识已经被劫持的对象，每一个被劫持的对象都会有一个_ob_属性，该属性不可遍历
// 8、如果想过通过索引修改内容，可以使用Vue.$set()


// 如果el需要挂载到页面上



// 虚拟dom比对，diff算法
// let vm1 = new Vue({
//     data(){
//         return {
//             msg: 'hello'
//         }
//     }
// })
// // 将模版变成render函数
// let render1 = complileToFunction(`
// <div>
//     <li key="a">a</li>
//     <li key="b">b</li>
// </div>
// `);
// // 老的虚拟节点
// let oldVnode = render1.call(vm1);
// // 真实节点
// let el1 = createElm(oldVnode);
// document.body.appendChild(el1);

// let vm2 = new Vue({
//     data(){
//         return {
//             msg: 'goodbye'
//         }
//     }
// })
// let render2 = complileToFunction(`
// <div>
//     <li key="d">d</li>
//     <li key="a">a</li>
//     <li key="c">c</li>
//     <li key="b">b</li>
// </div>
// `);
// let newVnode = render2.call(vm2);

// setTimeout(() => {
//     console.log('patch oldVnode, newVnode')
//     patch(oldVnode, newVnode)
// }, 2000);