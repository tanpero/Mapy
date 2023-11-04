const { dialog, ipcRenderer } = require('electron')

const showOpenFileDialog = () => ipcRenderer.send("showOpenFileDialog")
const showSaveFileDialog = () => ipcRenderer.send("showSaveFileDialog")
const showSaveHtmlFileDialog = () => ipcRenderer.send("showSaveHtmlFileDialog")
const showFileHasBeenChangedAccidentally = () => ipcRenderer.send("showFileHasBeenChangedAccidentally")

module.exports = {
    showOpenFileDialog,
    showSaveFileDialog,
    showSaveHtmlFileDialog,
    showFileHasBeenChangedAccidentally,
}
