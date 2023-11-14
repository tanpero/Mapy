const { NodeHtmlMarkdown } = require("node-html-markdown")
const insertTextAtCursor = require("./insert-text-at-cursor")

const { getMarkdown, setMarkdown } = require("./main")

const insertContent = (el, text) => {
    insertTextAtCursor(el, NodeHtmlMarkdown.translate(text), setMarkdown, getMarkdown)
}

const path = require("path")

// 判断传入的对象是否为本地文件（与内存中的图像相区分）
const isLocalImage = dataTransferItem => dataTransferItem.getAsFile() !== null

const processPastedItems = (el, items) => {

    const insert = text => insertContent(el, text)

    // 设置一个标志位，表示是否需要将 push 的内容内容插入到编辑器中
    const willInsert = true

    // 暂存可能被插入的内容
    const toPush = ""

    const push = text => toPush += text

    // 判断本次粘贴项中是否包含文件
    const hasFile = items.some(i => i.type === "file")

    // 若有文件
    if (hasFile) {

        // 则仅粘贴文件
        for (const item of items) {

            if (items.kind === "string") {
                continue
            }
            
            // 如果文件类型以 image 开头，即为图片文件
            if (item.type.startsWith("image")) {

                // 判断是否为本地图片文件
                const isLocalImg = isLocalImage(item)

                // 如果是本地图片文件，获取相对路径并插入
                if (isLocalImg) {
                    const relativePath = path.relative(getCurrentPath(), item.getAsFile().path)
                    insert(`![${item.getAsFile().name}](${relativePath})`)
                } else {

                    // 如果不是本地图片文件，说明是内存中的数据
                    // TODO: 如果前一项是 HTML，则说明这是来自 Internet 的图片，item.getAsString 即可获得其 Base64
                    // TODO: 出现上下文菜单，询问是否将图像写入到文档的伴随资源目录
                    insert(`![图片](${URL.createObjectURL(item.getAsFile())})`)
                }
            } else if (item.type.startsWith("video") || item.type.startsWith("audio")) {

                // 如果文件类型以 video 或 audio 开头，表示是视频或音频文件
                const relativePath = path.relative(getCurrentPath(), item.getAsFile().path)

                // 计算相对路径并插入到编辑器中
                insert(`![${item.getAsFile().name}](${relativePath})`)

                // TODO: 出现上下文菜单，询问是否将图像复制到文档的伴随资源目录
            } else {

                // 其他类型的文件，直接以链接插入到编辑器中
                const relativePath = path.relative(getCurrentPath(), item.getAsFile().path)
                insert(`[${item.getAsFile().name}](${relativePath})`)

                // TODO: 出现上下文菜单，询问是否将文件复制到文档的伴随资源目录
            }
        }
    } else {

        // 如果全为文本内容
        if (items.every(item => item.type === "text/plain")) {

            // 则直接插入
            items.forEach(item => push(item))
        } else {
            
            const willInsert = false
            items.forEach((item) => {
                if (item.type === "text/link-preview") {

                    // 如果是带预览的链接，则插入链接标题和链接地址，并且不插入伴随的其他项
                    insert(`[${item.pageTitle}](${item.url})`)
                    willInsert = false                    
                } else if (item.type === "text/html") {

                    // 如果是 HTML 类型，将其视为待选
                    push(item)
                } else {

                    // TODO: 有一些文本类型在后续特殊处理，如 text/rtf
                }            
            })
        }        
    }    
    
    if (willInsert) {
        insert(NodeHtmlMarkdown.translate(toPush))
    }    
}    


const paste = async element => {
    try {
        const clipboardItems = await navigator.clipboard.read()
        processPastedItems(element, clipboardItems)
    } catch (err) {
        alert(console.error(err))
    }
}

const link = (el, text) => {
    insertTextAtCursor(el, `[${text}](${text})`)
}

module.exports = {
    paste, link
}

