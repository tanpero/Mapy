const fs = require("fs")
const path = require("path")

let style = 
`
        body {
            background-color: #23241f;
            color: antiquewhite;
            padding: 1em;
            max-width: 50%;
            flex-grow: 1;
            overflow-y: scroll;
            font-size: 16px;
            letter-spacing: 1px;
            line-height: 1.5;
            text-indent: 2em;
            text-align: left;
            word-break: break-all;
            width: 80cqw;
        }
            
        ::-webkit-scrollbar {
            width: 5px;
            height: 0;
        }

        ::-webkit-scrollbar-track {
            background-color: rgb(40, 44, 52)
        }

        ::-webkit-scrollbar-thumb {
            background-color: #abb09f;
        }

`

fs.readFile(path.join(__dirname, "..", "styles", "article.css"), "utf8", (e, data) => {
    style += data
})

fs.readFile(path.join(__dirname, "..", "styles", "codeblock.css"), "utf8", (e, data) => {
    style += data
})

fs.readFile(path.join(__dirname, "..", "styles", "detail-tag.css"), "utf8", (e, data) => {
    style += data
})

/*
 * TODO...
fs.readFile(path.join(__dirname, "..", "..", "..", "node_modules", "highlight.js", "styles", "monokai-sublime.min.css"), "utf8", (e, data) => {
    style += data
})

fs.readFile(path.join(__dirname, "..", "..", "..", "node_modules", "katex", "dist", "katex.min.css"), "utf8", (e, data) => {
    style += data
})

fs.readFile(path.join(__dirname, "..", "..", "..", "node_modules", "markdown-it-texmath", "css", "texmath.css"), "utf8", (e, data) => {
    style += data
})
*/
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

function formatNode(node, indent = "") {
    let output = indent
    if (node.nodeName.toLowerCase() === "body") {
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i]
            if (childNode.nodeType === Node.ELEMENT_NODE) {
                output += formatNode(childNode, indent + "    ")
            } else if (childNode.nodeType === Node.TEXT_NODE) {
                output += indent + childNode.textContent
            }
        }
        
        return output
    } else {
        const tagName = node.nodeName.toLowerCase();
        let output = `${indent}<${node.nodeName.toLowerCase()}`;
        if (node.attributes && node.attributes.length > 0) {
            output += " " + Array.from(node.attributes).map(
                attr => `${attr.name.toLowerCase()}="${attr.value}"`
            ).join(" ")
        }
        if (node.childNodes && node.childNodes.length > 0) {
            output += ">\n"
            for (let i = 0; i < node.childNodes.length; i++) {
                const childNode = node.childNodes[i]
                if (childNode.nodeType === Node.ELEMENT_NODE) {
                    output += formatNode(childNode, indent + "    ")
                } else if (childNode.nodeType === Node.TEXT_NODE) {
                    output += `${indent}${childNode.textContent}\n`
                }
            }
            output += `${indent}</${node.nodeName.toLowerCase()}>\n`
        } else {
            output += "/>\n"
        }
        return output
    }
    
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
        <style>
            ${style}
        </style>
        <title>${title}</title>
    </head>
    <body>
        <div class="content">
        ${formattedContent}
        </div>
    </body>
</html>
`
    return text
}


const simplifyIndent = preTagId => {
    const preTag = document.getElementById(preTagId)
    if (!preTag) return
  
    // 获取所有代码行
    const codeLines = preTag.innerHTML.split('\n')
  
    // 找到缩进最少的行数和缩进空格数
    let minIndent = Infinity
    let minIndentSpaces = 0
    for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i]
        const match = line.match(/^\s+/)
        if (match) {
            const spaces = match[0].length
            if (spaces < minIndent) {
                minIndent = spaces
                minIndentSpaces = line.length - spaces
            }
        }
    }
  
    // 将每行开头的空格替换为指定数量的空格
    for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i]
        const newLine = line.substring(minIndentSpaces)
        codeLines[i] = newLine
    }
  
    // 将修改后的代码重新赋值给 pre 标签
    preTag.innerHTML = codeLines.join('\n')
}
  

module.exports = {
    extractFileName,
    extractWorkPath,
    filterMarkdown,
    generateHTML,
    simplifyIndent,
}
