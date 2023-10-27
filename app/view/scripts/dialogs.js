const { dialog, ipcRenderer } = require('electron')

const showOpenFileDialog = () => ipcRenderer.send("showOpenFileDialog")
const showSaveFileDialog = () => ipcRenderer.send("showSaveFileDialog")
const showSaveHtmlFileDialog = () => ipcRenderer.send("showSaveHtmlFileDialog")

module.exports = {
    showOpenFileDialog,
    showSaveFileDialog,
    showSaveHtmlFileDialog,
}
