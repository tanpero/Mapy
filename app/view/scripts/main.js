const MarkdownIt = require("markdown-it")
const hljs = require("highlight.js/lib/core")
const {
    showOpenFileDialog, showSaveFileDialog, showSaveHtmlFileDialog
} = require("./dialogs")
const { defaultTheme, nextTheme } = require("./theme")
const { extractFileName, generateHTML } = require("./text-util")
const { ipcRenderer } = require("electron")
const fs = require("fs")
const path = require("path")
//const { createWordCloudElement, removeWordCloudElement } = require("./word-cloud")
const { clearInterval } = require("timers")
const cm_lang_markdown = require("@codemirror/lang-markdown").markdown
const { basicSetup, EditorView } = require("codemirror")
const { EditorState } = require("@codemirror/state")
const { outputPDF } = require("./output-pdf")

const markdownWrapper = document.querySelector("#markdown")
const htmlView = document.querySelector("#html")

//const wordcloudContainer = document.getElementById("word-cloud")
let hasWordCloud = false

const { oneDark } = require("@codemirror/theme-one-dark")

const cm = new EditorView({
    state: EditorState.create({
        doc: "",
        extensions: [
            basicSetup,
            cm_lang_markdown(),
            oneDark,
            EditorView.lineWrapping,
            //EditorView.updateListener.of(e => wordcloud(getMarkdown, wordcloudContainer)())
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

/*
 * TODO: 为代码块添加特殊样式
 * 目前无法工作
 */
hljs.addPlugin({
    "after:highlight": ({ code, language }) => {
    const className = `language-${language}`;
    return `
      <div class="codeblock">
        <div class="codeblock-top">
          <div class="circle-red"></div>
          <div class="circle-yellow"></div>
          <div class="circle-green"></div>
          <span class="language-title"><b>${language.toUpperCase()}</b></span>
        </div>
        <div class="codeblock-body">
          <pre><code class="${className}">${code}</code></pre>
        </div>
      </div>
    `;
  },
});

const isurl = require("isurl")

const markdown = new MarkdownIt({
    html: true,
    xhtmlOut: true,
    linkify: true,
    modifyToken (token, env) {
        switch (token.type) {
        case "image": // set all images to 200px width
            let _path = token.attrObj.src
            if (!isurl(_path) && !path.isAbsolute(_path)) {
                token.attrObj.src = path.resolve(path.dirname(fileStatus.filePath), _path)
                
            }
            break
        case "link_open":
            token.attrObj.target = '_blank'
            break
        }
    },
}).use(require("markdown-it-modify-token"))
.use(require("markdown-it-highlightjs"), {
    hljs,
    register: {
        cypher: require("highlightjs-cypher")
    },
    inline: false,
})
.use(require("markdown-it-texmath"), {
    engine: require("katex"),
    delimiter: "dollars",
    katexOptions: {
        macros: {
            "\\RR": "\\mathbb{R}",
        },
    },
})
.use(require("markdown-it-anchor"))
.use(require("markdown-it-toc-done-right"))
.use(require("markdown-it-emoji", {
    "smile": [ ":)", ":-)" ],
    "laughing": ":D",
}))
.use(require("markdown-it-easy-tables"))
.use(require("markdown-it-multimd-table"), {
    multiline:  true,
    rowspan:    true,
    headerless: true,
    multibody:  true,
    aotolabel:  true,
})
.use(require("markdown-it-task-lists"))
.use(require("markdown-it-named-code-blocks"))
.use(require("markdown-it-collapsible"))
.use(require("markdown-it-ruby"))
.use(require("markdown-it-adobe-plugin"))
.use(require("markdown-it-front-matter"))
.use(require("markdown-it-deflist"))
.use(require("markdown-it-ins"))
.use(require("markdown-it-abbr"))
.use(require("markdown-it-mark"))
.use(require("markdown-it-smartarrows"))
.use(require("markdown-it-sub"))
.use(require("markdown-it-sup"))
.use(require("markdown-it-footnote"))
.use(require("@gerhobbelt/markdown-it-inline-text-color"))
.use(require("markdown-it-complex-table").default)
.use(require("markdown-it-small"))

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

const updateHtml = () => renderMarkdownToHtml(getMarkdown())

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


const toSavePdfFile = () => {
    if (fileStatus.isTitled) {
        const html = htmlView.innerHTML
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


/*
 * 基本快捷键
 */


document.addEventListener('keydown',  event => {

    if (event.ctrlKey) {
        switch(event.key.toLocaleUpperCase()) {
            case "N": () => ipcRenderer.send("openNewBlankFileWindow")
            break
            case "O": showOpenFileDialog()
            break
            case "S": {
                if (!fileStatus.isTitled) {
                    showSaveFileDialog()
                    break
                }
                toSaveHtmlFile()
            }
            break
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

ipcRenderer.on("open-file", (e, file) => {
    fileStatus.filePath = file.path
    fileStatus.fileName = extractFileName(file.path)
    setMarkdown(file.content)
    appTitle.innerText = fileStatus.appTitleInfo.join("")
    fileStatus.isTitled = true
    e.sender.send("set-pwd")
})


ipcRenderer.on("save-file", (e, file) => {
    const dir = path.dirname(file.path)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
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

