// 以下为源码的正则
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id=true id='app' id="app"


// 将html模版解析为ast语法树
function parseHtml(html){
    html = html.trim();
    /**
     * 借用栈结构来构建父子关系，前一个元素是后一个元素的父节点。
     * 原理：
     *      假设一棵结构为：<div>
     *                          <ul>
     *                              <li> </li>
     *                          </ul>
     *                          <p></p>
     *                     </div>
     *      当遇到开始标签时，将标签压入栈中，一直到遇到结束标签之前[div, ul, li]，此时前者都是后者的父节点，在下一次操作
     *      遇到结束</li>就弹出元素，此时栈中[div, ul]，再遇到结束标签</ul>继续弹出元素，此时栈中[div]，再遇到开始标签<p>，
     *      压入栈中[div, p], 最后遇到结束标签</p></div>，依次弹出元素，最后栈为空了[]。
     */
    const stack= [];
    let root = null;    // 根节点
    function start(tagName, attrs){
        const element = createASTElement(tagName, attrs);
        if(!root){
            // 根节点为空，说明当前是根节点
            root = element;
        }else{
            const parent = stack[stack.length - 1];
            element.parent = parent;
            parent.children.push(element);
        }
        stack.push(element);
    }
    function end(tagName){
        let endTag = stack.pop();
        if(endTag.tag != tagName){
            console.log('标签出错')
        }
    }
    function text(chars){
        chars = chars.replace(/\s/g, '');       // 这里把空格替换掉了，会导致文本字符串内的空格没了，搞不懂为什么要这个操作，讲道理去掉两头空格不就好了
        const parent = stack[stack.length - 1];
        if(chars){
            parent.children.push({
                text: chars,
                type: 2,
                parent,
            });
        }
    }
    function createASTElement(tag, attrs, type = 1, parent = null){
        return {
            tag,
            type,
            children: [],
            parent,
            attrs,
        }
    }
    // 前进截取
    function advance(len){
        html = html.substring(len);
    }
    // 解析开始标签
    function parseStartTag(){
        const start = html.match(startTagOpen);
        // 没有匹配到开始标签
        if(!start) return false;
        const match = {
            tagName: start[1],
            attrs: [],
        }
        // 减掉前面已匹配过的字符串，截取剩下的字符串
        advance(start[0].length);

        let end, attr;
        while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
            // 没有匹配到开始标签的结尾 > ,并且匹配到属性
            match.attrs.push({name: attr[1], value: attr[3] || attr[4] || attr[5]});
            advance(attr[0].length);
        }
        if(end){
            advance(end[0].length);
        }

        return match;
    }

    // 不停的截取模版，直到模版为空
    while(html){
        let index = html.indexOf('<');
        if(index == 0){
            // 解析开始标签和属性
            const startTagMatch = parseStartTag();
            if(startTagMatch){                        // 开始标签
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue
            }
            let endTagMatch;
            if(endTagMatch = html.match(endTag)){     // 结束标签
                end(endTagMatch[1]);
                advance(endTagMatch[0].length);
                continue
            }
            break;
        }
                                                      // 文本
        if(index > 0){
            let chars = html.substring(0, index);
            text(chars);
            advance(chars.length)
        }
    }
    return root;
}

export default parseHtml;