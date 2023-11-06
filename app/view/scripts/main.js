const MarkdownIt = require("markdown-it")
const hljs = require("highlight.js/lib/core")
const {
    showOpenFileDialog, showSaveFileDialog, showSaveHtmlFileDialog,
    showFileHasBeenChangedAccidentally,
} = require("./dialogs")
const { extractFileName, generateHTML, isURL } = require("./text-util")
const { ipcRenderer } = require("electron")
const fs = require("fs")
const path = require("path")
const { clearInterval } = require("timers")
const cm_lang_markdown = require("@codemirror/lang-markdown").markdown
const { oneDark } = require("@codemirror/theme-one-dark")
const { basicSetup, EditorView } = require("codemirror")
const { EditorState } = require("@codemirror/state")
const { outputPDF } = require("./output-pdf")

const {
    triggerBox, searchHighlightPlugin, setInputListener, removeInputListener
} = require("./search-and-replace")

const markdownWrapper = document.querySelector("#markdown")
const htmlView = document.querySelector("#html")
const searchBox = document.querySelector(".search")
const searchInput = document.querySelector("#search")
const isSearchBoxVisible = () => searchBox.style.display === "block"

searchBox.style.display = "none"

let updateHtml = () => {}
let setMonitor = () => {}

const cm = new EditorView({
    state: EditorState.create({
        doc: "",
        extensions: [
            basicSetup,
            cm_lang_markdown(),
            oneDark,
            EditorView.lineWrapping,
            EditorView.updateListener.of(e => {
                updateHtml()
                setMonitor()
            })
        ],
        
    }),

    parent: markdownWrapper
})

const getMarkdown = () => cm.state.doc.toString()

const setMarkdown = text => {
    cm.dispatch({
        changes: {from: 0, to: cm.state.doc.length, insert: text}
    })
}


const markdownView = document.querySelector(".cm-content")

const appTitle = document.querySelector("title")

let fileStatus = {
    appTitleInfo: ["Mapy", " - ", "新笔记", " <未保存>"],
    fileName: "",
    _name: "",
    filePath: "",
    htmlPath: "",
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

hljs.registerLanguage(
    "javascript",
    require("highlight.js/lib/languages/javascript")
)

hljs.addPlugin({
    "after:highlight": result => {
        result.value = result.value.replace(/^/gm, '<span class="line-num"></span>')
    }
})

const meetHeading = require("./markdown-plugin/heading")

const markdown = new MarkdownIt({
    html: true,
    xhtmlOut: true,
    linkify: true,
    typographer: true,
    modifyToken (token, env) {
        switch (token.type) {
        case "image":
            let _path = token.attrObj.src
            if (!isURL(_path) && !path.isAbsolute(_path)) {
                token.attrObj.src = path.resolve(path.dirname(fileStatus.filePath), _path)
            }
            break
        case "link_open":
            token.attrObj.target = '_blank'
            break
        }
    },
}).use(require("markdown-it-modify-token"))
.use(require("markdown-it-texmath"), {
    engine: require("katex"),
    delimiter: "dollars",
    katexOptions: {
        macros: {
            "\\RR": "\\mathbb{R}",
        },
    },
})
.use(require("markdown-it-highlightjs"), {
    hljs,
    register: {
        cypher: require("highlightjs-cypher")
    },
})
.use(require("markdown-it-named-code-blocks"))
.use(require("markdown-it-copy"), {
    btnText: "复制代码",
    failText: "复制失败",
    successText: "复制成功",
})
.use(require("markdown-it-codetabs"))
.use(require("markdown-it-image-caption"))
.use(require("markdown-it-html5-media").html5Media)
.use(require("markdown-it-emoji-mart"))
.use(require("markdown-it-anchor"))
.use(require("markdown-it-toc-done-right"))
.use(require("markdown-it-easy-tables"))
.use(require("markdown-it-multimd-table"), {
    multiline:  true,
    rowspan:    true,
    headerless: true,
    multibody:  true,
    aotolabel:  true,
})
.use(require("markdown-it-relativelink")({

}))
.use(require("markdown-it-colorful-checkbox"))
.use(require("markdown-it-collapsible"))
.use(require("markdown-it-ruby"))
.use(require("markdown-it-adobe-plugin"))
.use(require("markdown-it-front-matter"))
.use(require("markdown-it-checkbox"))
.use(require("@luckrya/markdown-it-link-to-card").linkToCardPlugin)
.use(require("markdown-it-ins"))
.use(require("markdown-it-abbr"))
.use(require("markdown-it-mark"))
.use(require("markdown-it-smartarrows"))
.use(require("markdown-it-sub"))
.use(require("markdown-it-sup"))
.use(require("markdown-it-footnote"))
.use(require("markdown-it-sidenote"))
.use(require("markdown-it-color").default, {
    defaultClassName: "color",
    inline: true,
})
.use(require("markdown-it-complex-table").default)
.use(require("markdown-it-small"))
.use(require("markdown-it-bidi"))
.use(require("markdown-it-inject-linenumbers"))

markdown.renderer.rules.emoji = (token, idx) =>
    `<span class="emoji emoji-"${token[idx].content}">${token[idx].content}</span>`

require("./markdown-plugin/container")(markdown)

// 指定 Bib 文件路径后可以在 Markdown 中使用 BibTex 语法
const addBibtexSupport = bibPath => {
    markdown.use(require("@arothuis/markdown-it-biblatex"), {
        bibPath
    })
}

markdownView.focus()


const renderMarkdownToHtml = source => {
    htmlView.innerHTML = markdown.render(source)
}

updateHtml = () => renderMarkdownToHtml(getMarkdown())


require("./drag-drop")


/*
 * 基本交互操作
 */

const toSaveMarkdownFile = () => {
    if (fileStatus.isTitled) {
        fs.writeFile(fileStatus.filePath, getMarkdown(), e => {
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
    const content = generateHTML(htmlView.innerHTML)

    if (!fileStatus.htmlPath) {
        ipcRenderer.send("showSaveHtmlFileDialog")        
    } else {
        ipcRenderer.send("to-save-html", { filePath: fileStatus.htmlPath, content })
    }
}


const toSavePdfFile = () => {
    if (fileStatus.isTitled) {
        const html = generateHTML(htmlView.innerHTML)
        const pdfPath = fileStatus.filePath.replace(/\.[^/.]+$/, ".pdf")
        outputPDF(html, pdfPath)
    } else {
        showSaveFileDialog()
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

setMonitor = () => {
    if (fileStatus.hasMonitor) {
        return
    }
    fileStatus.hasMonitor = true
    fileStatus.isSaved = false
    monitorID = setInterval(monitor, 5000)
}

/*
 * 基本快捷键
 */

let originalSource = ""

searchInput.addEventListener("blur", () => {
    if (isSearchBoxVisible()) triggerBox(searchBox, searchInput)
})


document.addEventListener('keydown',  event => {

    if (event.ctrlKey) {
        switch(event.key.toLocaleUpperCase()) {
            case "S": {
                if (!fileStatus.isTitled) {
                    showSaveFileDialog()
                    break
                }
                toSaveHtmlFile()
            }
            break
            case "F": {

                // 刚按下 Ctrl-F
                // 若此时搜索框不可见
                // 说明即将启动搜索框，对原始文本存档
                if (!isSearchBoxVisible()) {
                    originalSource = getMarkdown()
                } else {
                    setMarkdown(originalSource)
                }
                triggerBox(searchBox, searchInput) ?
                        setInputListener(searchInput, getMarkdown, markdown.render)
                                : removeInputListener(setInputListener)
                break
            }
            case "P": toSavePdfFile()
            break
            case "W": {

                // TODO...
                /*
                event.preventDefault()

                if (event.altKey) {
                    if (hasWordCloud) {
                        removeWordCloudElement()
                        hasWordCloud = false
                        break
                    }
                    createWordCloudElement(getMarkdown())
                    hasWordCloud = true
                    break
                }
                */
            }
        }
    }

})


/*
 * 响应交互事件
 */

ipcRenderer.on("file-has-been-opened", (e, file) => {
    fileStatus.filePath = file.path
    fileStatus.fileName = extractFileName(file.path)
    setMarkdown(file.content)
    appTitle.innerText = fileStatus.appTitleInfo.join("")
    fileStatus.isTitled = true
    // TODO...
    e.sender.send("set-pwd")
})

ipcRenderer.on("html-path-has-been-set", (e, file) => {    
    const dir = file.path

    fileStatus.htmlPath = dir
    toSaveHtmlFile()
})

ipcRenderer.on("save-file", (e, file) => {
    fs.writeFile(file.path, getMarkdown(), e => {
        if (e) {
            alert(e.message)
        }
    })
    fileStatus.filePath = file.path
    fileStatus.fileName = extractFileName(fileStatus.filePath)
    fileStatus.isTitled = true
    appTitle.innerText = fileStatus.appTitleInfo.join("")
})

let externalEditedContent = ""

ipcRenderer.on("file-has-been-changed", (e, file, content) => {
    fileStatus.isSaved = false
    clearInterval(monitorID)
    ipcRenderer.send("showFileHasBeenChangedAccidentally")
    externalEditedContent = content
})

ipcRenderer.on("reload-external-edit", e => {
    fileStatus.isSaved = true
    setMarkdown(externalEditedContent)
})

ipcRenderer.on("overwrite-external-edit", e => {
    fileStatus.isSaved = true
    toSaveMarkdownFile()
})
