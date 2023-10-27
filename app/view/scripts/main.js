const marked = require("marked");
const { swapView } = require("./swap-view");
const { showOpenFileDialog, showSaveFileDialog, showSaveHtmlFileDialog } = require("./dialogs");
const { defaultTheme, nextTheme } = require("./theme")
const { extractFileName, generateHTML } = require("./text-util")
const { ipcRenderer } = require("electron")
const fs = require("fs")
const path = require("path")
const { wordcloud } = require("./word-cloud")
const hotkeys = require("hotkeys-js")

let fileStatus = {
    fileName: "",
    filePath: "",
    isTitled: false,
}

const appTitle = document.querySelector("title")
const markdownView = document.querySelector("#markdown")
const htmlView = document.querySelector("#html")
const saveHtmlButton = document.querySelector("#save-html")
const savePdfButton = document.querySelector("#save-pdf")
const showFileButton = document.querySelector("#show-file")
const openInDefaultButton = document.querySelector("#open-in-default")

/*
 * Markdown 实时渲染
 */
const renderMarkdownToHtml = markdown => htmlView.innerHTML = marked.parse(markdown, { sanitize: true })

const updateHtml = () => renderMarkdownToHtml(markdownView.innerText)

const markdownObserver = new MutationObserver(() => {
    updateHtml()
})
const markdownObserverConfig = {
    attributes: true, childList: true, subtree: true
}
markdownObserver.observe(markdownView, markdownObserverConfig)
markdownView.addEventListener("keyup", updateHtml)

/*
 * 基本交互操作
 */

const toSaveMarkdownFile = () => {
    if (fileStatus.isTitled) {
        fs.writeFile(fileStatus.filePath, markdownView.innerText, e => {
            if (e) {
                alert(e.message)
            }
        })
        fileStatus.fileName = extractFileName(fileStatus.filePath)
        fileStatus.isTitled = true 
    } else {
        showSaveFileDialog()
    }
}


// TODO:将 HTML 输出到本地
const toSaveHtmlFile = () => {
    if (fileStatus.isTitled) {
        const html = htmlView.innerHTML
        
        const path = fileStatus.filePath.replace(/\.[^/.]+$/, ".html")
        fs.writeFile(path, generateHTML(html), e => {
            if (e) {
                alert(e.message)
            }
        })
        fileStatus.fileName = extractFileName(path)
    } else {
        showSaveHtmlFileDialog()
    }
}


const toggleWordcloud = () => {}

document.addEventListener('keydown',  event => {    

    if (event.ctrlKey) {
        switch(event.key.toLocaleUpperCase()) {
            case "N": () => ipcRenderer.send("openNewBlankFileWindow")
            break
            case "O": showOpenFileDialog()
            break
            case "S": toSaveHtmlFile()
            break
            case "P": swapView(markdownView, htmlView)
            break
        }
    }

})

ipcRenderer.on("open-file", (e, file) => {
    fileStatus.filePath = file.path
    fileStatus.fileName = extractFileName(file.path)
    markdownView.innerText = file.content
    appTitle.innerText = `Mapy - ${fileStatus.fileName}`
    fileStatus.isTitled = true
    e.sender.send("set-pwd")
})


ipcRenderer.on("save-file", (e, file) => {
    const dir = path.dirname(file.path)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFile(file.path, markdownView.innerText, e => {
        if (e) {
            alert(e.message)
        }
    })
    fileStatus.filePath = file.path
    fileStatus.fileName = extractFileName(fileStatus.filePath)
    fileStatus.isTitled = true
    appTitle.innerHTML = `Mapy - ${fileStatus.fileName}`
})




ipcRenderer.on("save-html-file", e => {
    const dir = path.dirname(file.path)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFile(file.path, generateHTML(htmlView.innerHTML), e => {
        if (e) {
            alert(e.message)
        }
    })
})

// TODO:生成 PDF 并输出本地
const toSavePdfFile = () => {}

// TODO: 更换界面主题
// 涉及到 Electron API 的一些问题，暂时无法实现



/*
 * TODO: 拖拽文件
 */

markdownView.addEventListener("drop", e => {
    e.preventDefault()

    for (const file of e.dataTransfer.files) {
        if (file.type.startsWith("text/")) {
            const reader = new FileReader()
            reader.addEventListener("load", () => markdownView.innerText = reader.result)
            reader.readAsText(file)
        }
    }
})

markdownView.addEventListener("dragover", e => e.preventDefault())

/*
 * 词云
 */
wordcloud(
    markdownView, document.getElementById("word-cloud")
)
