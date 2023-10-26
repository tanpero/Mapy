const extractFileName = filePath => {
    
    // 使用正斜杠或反斜杠作为分隔符来匹配文件名
    const regex = /[\\/]/g // 匹配正斜杠和反斜杠
    const parts = filePath.split(regex)
  
    // 从分割后的数组中获取最后一个元素，即文件名
    const fileName = parts[parts.length - 1]
  
    return fileName
}

const filterMarkdown = text => {
    const regexes = [
        (/\n?\$\$[^$\$]*\$\$/gm), // 公式块语法 $$ ... $$
        (/\$[^$]*\$/gm), // 行内公式语法：$ ... $
        (/<http[s]?:\/\/.*?>/gm), // 链接
        (/`([^`]+)`/gm), // 行内代码语法：` ... `
        (/\`\``[^`]*?\`\`\`/gm), // 代码块语法：```... ```
        (/\[([^\]]+)\]\(([^)]+)\)/gm), // 行内链接语法：[]()
        (/\<code\>(.*?)\<\/code\>/gm), // 代码块语法：<code>...</code>

        (/!\[.*?\]\((.*?)(?:"(.*?)")?\)/gm), // 图片语法：![...](...)
    ]
  
    let filteredText = text
  
    regexes.forEach((regex) => {
        filteredText = filteredText.replace(regex, '')
    })
  
    return filteredText
}
  

module.exports = {
    extractFileName,
    filterMarkdown,
}
