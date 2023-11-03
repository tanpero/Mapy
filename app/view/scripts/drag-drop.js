const { ipcRenderer } = require("electron")

document.addEventListener("dragstart", e => e.preventDefault())

document.addEventListener("dragover", e => e.preventDefault())

document.addEventListener("dragleave", e => e.preventDefault())

document.addEventListener("drop", e => e.preventDefault())

const getDraggedFile = e => e.dataTransfer.items[0]
const getDroppedFile = e => e.dataTransfer.files[0]

const fileTypeIsSupported = file => ["text/plain", "text/markdown"].includes(file.type)

const setListener = markdownView => {
    markdownView.addEventListener("dragover", e => {
        const file = getDraggedFile(e)

        if (fileTypeIsSupported(file)) {
            markdownView.classList.add("drag-over")
        } else {
            markdownView.classList.add("drag-error")
        }
    })

    markdownView.addEventListener("dragleave", () => {
        markdownView.classList.remove("drag-over")
        markdownView.classList.remove("drag-error")
    })

    markdownView.addEventListener("drop", e => {
        const file = getDroppedFile(e)

        if (fileTypeIsSupported(file)) {

            // TODO: Move the logic of manipulating file to the main process
            const fileContent = fs.readFileSync(file.path, "utf-8")
        } else {
            alert("不支持的文件类型")
        }

        markdownView.classList.remove("drag-over")
        markdownView.classList.remove("drag-error")
    })
}
