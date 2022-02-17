import babel from 'rollup-plugin-babel'
export default{
    input: './src/index.js',    // 打包的入口
    output:{
        file: 'dist/vue.js',    // 打包的出口
        format: 'umd',          // 常见的格式 IIFE  ESM CJS UMD
        name: 'Vue',            // UMD格式需要配置name，会将导出的模块放到window上，如果在node上使用cjs，如果只是打包webpack里面导入esm模块，前端里 script iife umd
        sourcemap: true,        // 源码映射
    },
    plugins:[
        babel({
            exclude: 'node_modules/**',     // 忽略node_module下的内容
        })
    ]
}