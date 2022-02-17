import parseHtml from "./parser";
import { generate } from "./generate";



/**
 * 模版编译
 */
export function complileToFunction(template){
    console.log('编译模版', template)
    // 1、将模版编译为ast语法树
    let ast = parseHtml(template);
    console.log('ast语法树', ast)

    // 2、代码生成
    let code = generate(ast);
    console.log('生成代码', code)

    // 使用with语法改变作用域为this  之后调用render函数可以使用call改变this 方便code里面的变量取值 比如 name值就变成了this.name
    let renderFn = new Function(`with(this){return ${code}}`);
    return renderFn;
}