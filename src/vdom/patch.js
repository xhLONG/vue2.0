import { isSameVnode } from "./index";

export function patch(oldVnode, vnode){     // 后续做两个虚拟节点的比对
    // 没有传oldVnode，说明可能是渲染一个组件，没有指定挂载元素
    if(!oldVnode){      // 1、组件
        return createElm(vnode);
    }

    const isRealElement =  oldVnode.nodeType; // 如果有nodeType说明是一个dom元素
    if(isRealElement){  // 2、初次渲染
        const oldEle = oldVnode;

        // 需要获取父节点，将当前节点的下一个元素作为参照参照物，之后删除老节点
        const parentNode = oldEle.parentNode;
        const el = createElm(vnode);
        parentNode.insertBefore(el, oldEle.nextSibling);
        parentNode.removeChild(oldEle);
        console.log('虚拟dom渲染出来的真实dom', el)
        return el;
    }else{              // 3、diff算法，两个虚拟节点比对
        /**
         * 1、如果两个虚拟节点的标签不一致，那就直接替换掉结束
         * 2、标签一样，但是是两个文本元素
         */
        if(oldVnode.tag !== vnode.tag){
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
        }
        if(!oldVnode.tag){
            if(oldVnode.text !== vnode.text){
                return oldVnode.el.textContent = vnode.text;
            }
        }
        /**
         * 3、元素相同，复用老节点，并且更新属性
         */
        let el = vnode.el = oldVnode.el;
        updateProperties(vnode, oldVnode.data);

        /* 4、更新儿子
         *  1、老的有儿子 新的也有儿子 dom-diff
         *  2、老的有儿子 新的没儿子 =》 删除老儿子
         *  3、新的有儿子 老的没儿子 =》老节点增加儿子
         */
        let oldChildren = oldVnode.children || [];
        let newChildren = vnode.children || [];

        if(oldChildren.length > 0 && newChildren.length > 0){
            updateChildren(el, oldChildren, newChildren);
        }else if(oldChildren.length > 0){
            el.innerHTML = '';
        }else if(newChildren.length > 0){
            newChildren.forEach(child => el.appendChild(createElm(child)))
        }
    }
}

// 根据虚拟节点创建真实节点
export function createElm(vnode){
    let {tag, data, children, text} = vnode;
    if(typeof tag === 'string'){    // 元素，可能是普通元素或者自定义组件
        if(createComponent(vnode)){
            // 返回组件的真实dom元素
            return vnode.componentInstance.$el;
        }

        // 后续需要diff算法 拿虚拟节点比对更新dom
        vnode.el = document.createElement(tag);
        updateProperties(vnode);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child)); // 递归渲染
        })
    }else{                          // 文本
        vnode.el = document.createTextNode(text);
    }
    // 虚拟节点创建真实节点
    return vnode.el;    
}

// 创建组件的真实元素
function createComponent(vnode){
    let i = vnode.data;
    if((i = i.hook) && (i = i.init)){
        i(vnode);   // 调用组件的初始方法，初始后就可以获取到的组件的dom元素vnode.componentInstance.$el
    }
    if(vnode.componentInstance){
        return true;
    }

    return false
}

// 给创建出来的dom元素添加属性
function updateProperties(vnode, oldProps = {}){
    oldProps = oldProps || {};
    const newProps = vnode.data || {};
    const el = vnode.el;

    // 1、老的属性 新的没有  -> 删除属性
    for(let key in oldProps){
        if(!newProps[key]){
            el.removeAttribute(key);
        }
    }

    let newStyle=  newProps.style || {};
    let oldStyle = oldProps.style || {};
    for(let key in oldStyle){
        if(!newStyle[key]){
            el.style[key] = '';
        }
    }

    // 2、新的属性 老的没有  -> 用新属性覆盖
    for(let key in newProps){
        if(key == 'style'){
            for(let styleName in newProps.style){
                el.style[styleName] = newProps.style[styleName];
            }
        }else{
            el.setAttribute(key, newProps[key]);
        }
    }
}

function updateChildren(parent, oldChildren, newChildren){
    let oldStartIndex = 0;                          // 老的头索引
    let oldEndIndex = oldChildren.length - 1;       // 老的尾索引
    let oldStartVnode = oldChildren[oldStartIndex]; // 老的开始节点
    let oldEndVnode = oldChildren[oldEndIndex];     // 老的结束节点

    let newStartIndex = 0;                          // 新的头索引
    let newEndIndex = newChildren.length - 1;       // 新的尾索引
    let newStartVnode = newChildren[newStartIndex]; // 新的开始节点
    let newEndVnode = newChildren[newEndIndex];     // 新的结束节点

    function makeIndexByKey(oldChildren){
        let map = {};
        oldChildren.forEach((item, index) => {
            map[item.key] = index;
        })
        return map;
    }
    let map = makeIndexByKey(oldChildren);

    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
        // 常见数据操作：尾部插入、头部插入、正序、反序
        if(!oldStartVnode){
            oldStartVnode = oldChildren[++oldStartIndex];
        }else if(!oldEndVnode){
            oldEndVnode = oldChildren[--oldEndIndex];
        }else if(isSameVnode(oldStartVnode, newStartVnode)){      // 1）头头比较 向后插入的操作
            patch(oldStartVnode, newStartVnode);            // 递归比对节点
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];
        }else if(isSameVnode(oldEndVnode, newEndVnode)){    // 2) 尾尾比较 向前插入的操作
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
        }else if(isSameVnode(oldStartVnode, newEndVnode)){  // 3) 头尾比较 头移动到尾部
            patch(oldStartVnode, newEndVnode);
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
        }else if(isSameVnode(oldEndVnode, newStartVnode)){  // 4) 尾头比较  尾移动到头部
            patch(oldEndVnode, newStartVnode);
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el);
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];
        }else{                                              // 5) 最终比较方法
            let moveIndex = map[newStartVnode.key];
            if(!moveIndex){
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
            }else{
                let moveVnode = oldChildren[moveIndex];
                oldChildren[moveIndex] = undefined;
                patch(moveVnode, newStartVnode);
                parent.insertBefore(moveVnode.el, oldStartVnode.el);
            }
            newStartVnode = newChildren[++newStartIndex];
        }
        

    }
    if(newStartIndex <= newEndIndex){               // 新的比老的多，插入新节点
        for(let i=newStartIndex; i<=newEndIndex; i++){      
            // 向前插入 向后插入

            let nextEle = newChildren[newEndIndex+1] == null ? null : newChildren[newEndIndex+1].el;
            // 如果newEndIndex的下一个元素是空的话，那就是尾部插入，反之，则是头部插入
            parent.insertBefore(createElm(newChildren[i]), nextEle);
        }
    }
    if(oldStartIndex <= oldEndIndex){               // 删除老的后面多余的节点
        for(let i=oldStartIndex; i<=oldEndIndex; i++){
            let child = oldChildren[i];
            if(child != undefined){
                parent.removeChild(child.el);
            }
        }
    }
}