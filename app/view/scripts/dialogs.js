const { dialog, ipcRenderer } = require('electron')

const showOpenFileDialog = () => {console.log("Hi");ipcRenderer.invoke("showOpenFileDialog")}

module.exports = {
    showOpenFileDialog,
}
