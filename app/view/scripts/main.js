const marked = require("marked");
const { swapView } = require("./swap-view");
const { showOpenFileDialog, showSaveFileDialog, showSaveHtmlFileDialog } = require("./dialogs");
const { defaultTheme, nextTheme } = require("./theme")
const { extractFileName, generateHTML } = require("./text-util")
const { ipcRenderer } = require("electron")
const fs = require("fs")
const path = require("path")
const { wordcloud } = require("./word-cloud")
const hotkeys = require("hotkeys-js");
const { clearInterval } = require("timers");

const appTitle = document.querySelector("title")
const markdownView = document.querySelector("#markdown")
const htmlView = document.querySelector("#html")
const savePdfButton = document.querySelector("#save-pdf")
const showFileButton = document.querySelector("#show-file")
const openInDefaultButton = document.querySelector("#open-in-default")

let fileStatus = {
    appTitleInfo: ["Mapy", "", "", " <未保存>"],
    fileName: "",
    _name: "",
    filePath: "",
    get fileName() {
        return this._name
    },
    set fileName(value) {
        this.appTitleInfo[1] = " - "
        this.appTitleInfo[2] = value
        this.appTitleInfo[3] = " <浏览>"
        this._name = value
    },
    isTitled: false,
    isSaved: false,
    _saved: false,
    hasMonitor: false,
    get isSaved() {
        return this._saved
    },
    set isSaved(value) {
        if (value) {
            this.appTitleInfo[1] = " - "
            this.appTitleInfo[2] = this.fileName
            this.appTitleInfo[3] = " <已保存>"
        } else {
            this.appTitleInfo[3] = " <未保存>"
        }
        appTitle.innerText = this.appTitleInfo.join("")
        this._saved = value
    },
}

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

/*
 *
 * 实时保存：当持续修改文档时，每 5s 保存一次
 *
 * 保存时，isSaved = true
 * 当发生更改时，isSaved = false
 * 
 * 自首次更改时设置 5s 间隔的 monitor，同时 hasMonitor = true
 * 之后每次更改时，若 hasMonitor = true，则不设置 monitor
 * 若 monitor 发现未执行保存时 isSaved = true
 * 意味着进入慢速编辑或浏览状态
 * 于是销毁自身
 * 直至下一次更改时重新设置 monitor
 * 
 */


const toggleWordcloud = () => {}

let monitorID = null

const monitor = () => {
    if (!fileStatus.isTitled) { // 此时尚无保存路径
        return
    }
    if (fileStatus.isSaved) {   // 更改不活跃
        clearInterval(monitorID)
        fileStatus.hasMonitor = false
        return
    }
    toSaveMarkdownFile()
    fileStatus.isSaved = true
}

markdownView.addEventListener("keyup", () => {
    if (fileStatus.hasMonitor) {
        return
    }
    fileStatus.hasMonitor = true
    fileStatus.isSaved = false
    monitorID = setInterval(monitor, 5000)
})

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
    appTitle.innerText = fileStatus.appTitleInfo.join("")
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
    appTitle.innerText = fileStatus.appTitleInfo.join("")
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
