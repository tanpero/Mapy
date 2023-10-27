const extractFileName = filePath => {
    
    // 使用正斜杠或反斜杠作为分隔符来匹配文件名
    const regex = /[\\/]/g // 匹配正斜杠和反斜杠
    const parts = filePath.split(regex)
  
    // 从分割后的数组中获取最后一个元素，即文件名
    const fileName = parts[parts.length - 1]
  
    return fileName
}

const extractWorkPath = filePath => {
    const pattern = /[^\/\\]+$/
    return filePath.replace(pattern, '')
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

const generateEnglishDate = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const monthNames = ["January", "February", "March",
                        "April", "May", "June", "July",
                        "August", "September", "October",
                        "November", "December"]
    const month = monthNames[currentDate.getMonth()]
    const day = currentDate.getDate()

    let suffix = ''
    switch (day) {
        case 1: case 11: case 21:
            suffix = "st"
            break
        case 2: case 12: case 22:
            suffix = "nd"
            break
        case 3: case 13:
            suffix = "rd"
            break
        default:
            suffix = "th"
    }

    const formattedDate = `${month} ${day}${suffix}, ${year}`
    return formattedDate
}


const getTitleFromHtml = doc => {    
    const h1 = doc.querySelector("h1")
    const text = h1 && h1.innerText ?
            h1.innerText : `Mapy 笔记 - ${generateEnglishDate()}`
    return text
}

function formatNode (node /* = doc.body */, indent = "    ") {
    let output = `${indent}<${node.nodeName.toLowerCase()}`
    if (node.attributes && node.attributes.length > 0) {
        output += " " + Array.from(node.attributes).map(
                    attr => `${attr.name.toLowerCase()}="${attr.value}"`).join(" ")
    }
    if (node.childNodes && node.childNodes.length > 0) {
        output += ">\n";
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i]
            if (childNode.nodeType === Node.ELEMENT_NODE) {
                output += formatNode(childNode, indent + "    ")
            } else if (childNode.nodeType === Node.TEXT_NODE) {
                output += `${childNode.textContent}\n`;
            }
        }
        output += `${indent}</${node.nodeName.toLowerCase()}>\n`
    } else {
        output += "/>\n"
    }
    return output
}

const generateHTML = content => {
    const date = generateEnglishDate()
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")
    const title = getTitleFromHtml(doc)
    const formattedContent = formatNode(doc.body)
    const text =
    `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Note document - ${date}">
        <title>${title}</title>
    </head>
${formattedContent}
</html>
`
    return text
}


module.exports = {
    extractFileName,
    extractWorkPath,
    filterMarkdown,
    generateHTML,
}
