const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

function genProps(attrs){
    // 返回形式 ‘{key: value, key: value}’

    let str = "";
    attrs.forEach(obj => {
        if(obj.name === 'style'){
            // 改造style的值为一个对象
            const style = {};
            obj.value.replace(/([^;:]+):([^;:]+)/g, function(){
                style[arguments[1].trim()] = arguments[2];
            })
            obj.value = style;
        }
        str += `${obj.name}:${JSON.stringify(obj.value)},`;
    });

    return `{${str.slice(0, -1)}}`;
}

function genChildren(el){
    let children = el.children;
    if(children){
        return `${children.map(item => gen(item)).join(',')}`;
    }
    return false;
}

function gen(el){
    if(el.type == 1){
        // 如果是元素就递归生成
        return generate(el);
    }else{
        let text = el.text;
        if(!defaultTagRE.test(text)) return `_v('${text}')`;    // 说明只是普通文本
        // 否者就是有表达式

        let tokens = [];
        let lastIndex = (defaultTagRE.lastIndex = 0);   // lastIndex 记录的是上一次匹配到内容的下一个坐标，所以需要重置一下
        let match = null;
        while(match = defaultTagRE.exec(text)){
            let index = match.index;
            if(index > lastIndex){
                // 匹配到 {{ ，保存前面的普通文本
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            // 匹配到表达式，保存表达式
            tokens.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length;
        }
        if(lastIndex<text.length){
            // 说明后面还有普通文本
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return `_v(${tokens.join('+')})`;
    }
}

/**
 * 
 * @param {*} ast 
 * @returns code
 * 将ast树生成代码
 */
export function generate(ast){
    let code = `_c('${ast.tag}', ${
        ast.attrs.length ? genProps(ast.attrs) : 'undefined'
    }${
        ast.children.length ? `,${genChildren(ast)}` : ''
    })`
    return code;
}