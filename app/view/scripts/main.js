const marked = require("marked");
const { swapView } = require("./swap-view");
const { showOpenFileDialog } = require("./dialogs");
const { defaultTheme, nextTheme } = require("./theme")
const { extractFileName } = require("./text-util")
const { ipcRenderer } = require("electron")
const fs = require("fs")
const { wordcloud } = require("./word-cloud")

let fileName = ""
let filePath = ""

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
    if (markdownView.innerText !== "") {
        saveMarkdownButton.disabled = false
    }
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
    filePath = file.path
    fileName = extractFileName(filePath)
    markdownView.innerText = file.content
    appTitle.innerText = `Mapy - ${fileName}`
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
