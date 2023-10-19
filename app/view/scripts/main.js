const marked = require("marked");
const { swapView } = require("./swap-view");
const { showOpenFileDialog } = require("./dialogs");
const { ipcRenderer } = require("electron")

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

const renderMarkdownToHtml = markdown => htmlView.innerHTML = marked.parse(markdown, { sanitize: true })

markdownView.addEventListener("keyup", e => renderMarkdownToHtml(e.target.innerText))

swapButton.addEventListener("click", () => swapView(markdownView, htmlView))

openFileButton.addEventListener("click", showOpenFileDialog)

markdownView.addEventListener("drop", (event) => {
    event.preventDefault()
    const items = event.dataTransfer.items
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file" && items[i].type.startsWith("text/")) {
            ipcRenderer.send("drag-drop-text", items[i].getAsFile().text())
        }
    }
})

markdownView.addEventListener("paste", (event) => {
    const clipboardData = event.clipboardData
    for (let i = 0; i < clipboardData.items.length; i++) {
        if (clipboardData.items[i].type.startsWith("text/")) {
            clipboardData.items[i].getAsString(text => ipcRenderer.send("drag-drop-text", text))
        }
    }
})


ipcRenderer.on('drag-drop-text', (event, data) => {
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const textNode = document.createTextNode(data)
    range.insertNode(textNode)
    selection.removeAllRanges()
    range.setStartAfter(textNode)
    range.setEndAfter(textNode)
    selection.addRange(range)
})
  
ipcRenderer.on('read-file', (event, filePath) => {
    if (is.text(filePath)) {
        const fs = require('fs')
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (!err) {
                ipcRenderer.send('drag-drop-text', data)
            }
        });
    }
})
  
ipcRenderer.on('update-markdown', (event, data) => {
    markdownView.innerText += data
})
