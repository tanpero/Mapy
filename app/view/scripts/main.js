const marked = require("marked");
const { swapView } = require("./swap-view");
const { showOpenFileDialog, showSaveFileDialog } = require("./dialogs");
const { defaultTheme, nextTheme } = require("./theme")
const { extractFileName } = require("./text-util")
const { ipcRenderer } = require("electron")
const fs = require("fs")
const path = require("path")
const { wordcloud } = require("./word-cloud")

let fileStatus = {
    fileName: "",
    filePath: "",
    isTitled: false,
}

const appTitle = document.querySelector("title")
const markdownView = document.querySelector("#markdown")
const htmlView = document.querySelector("#html")
const newFileButton = document.querySelector("#new-file")
const openFileButton = document.querySelector("#open-file")
const saveMarkdownButton = document.querySelector("#save-markdown")
const saveHtmlButton = document.querySelector("#save-html")
const savePdfButton = document.querySelector("#save-pdf")
const showFileButton = document.querySelector("#show-file")
const openInDefaultButton = document.querySelector("#open-in-default")
const swapButton = document.querySelector("#swap")
const themeButton = document.querySelector("#theme")

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

swapButton.addEventListener("click", () => swapView(markdownView, htmlView))

openFileButton.addEventListener("click", e => {
    showOpenFileDialog()
})

ipcRenderer.on("open-file", (e, file) => {
    fileStatus.filePath = file.path
    fileStatus.fileName = extractFileName(file.path)
    markdownView.innerText = file.content
    appTitle.innerText = `Mapy - ${fileStatus.fileName}`
    fileStatus.isTitled = true
})

saveMarkdownButton.addEventListener("click", e => {
    console.log(fileStatus.filePath)
    console.log(fileStatus.isTitled)
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

themeButton.addEventListener("click", async () => {
    const isDarkMode = await window.darkMode.toggle()
})

wordcloud(
    markdownView, document.getElementById("word-cloud")
)
