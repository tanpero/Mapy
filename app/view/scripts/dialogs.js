const { dialog, ipcRenderer } = require('electron')

const showOpenFileDialog = () => ipcRenderer.send("showOpenFileDialog")
const showSaveFileDialog = () => ipcRenderer.send("showSaveFileDialog")

module.exports = {
    showOpenFileDialog,
    showSaveFileDialog,
}
