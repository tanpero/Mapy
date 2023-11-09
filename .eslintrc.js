// 导入ESLint规则模块
const { rules } = require('eslint-config-standard')

// 导出ESLint配置对象
module.exports = {
  // 指定要使用的规则集
  rules: {
    // 禁止使用未定义的变量
    'no-undef': 'error',
    // 要求使用 const 声明常量
    'consistent-return': 'error',
    // 要求使用箭头函数
    'prefer-arrow-callback': 'error',
    // 要求使用模板字符串
    'template-curly-spacing': 'error',
    // 要求使用默认参数
    'default-param-style': 'error',
    // 要求使用解构赋值
    'destructuring-assignment': ['error', { 'ignoredProperty': false }],
    // 要求使用 import/export 代替 require/module.exports
    'import/no-dynamic-require': 'error',
    // 要求使用 let 或 const 声明变量
    'no-var': 'error',
    // 要求使用函数声明或命名空间
    'function-paren-newline': 'off',
    // 要求使用 === 和 !==
    'eqeqeq': 'error',
  },
}
