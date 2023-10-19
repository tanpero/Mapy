const { app, BrowserWindow, dialog, ipcMain } = require("electron")
const path = require("path")
const as = fileName => path.join('app', 'view', fileName)

app.on("ready", () => {
    let mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        show: false
    })

    mainWindow.webContents.loadFile(as('index.html'))

    mainWindow.once("ready-to-show", () => mainWindow.show())

    mainWindow.on("closed", () => mainWindow = null)

    ipcMain.handle("showOpenFileDialog", options => {
        dialog.showOpenDialog(mainWindow, options || [])
    })
})

ipcMain.on('drag-drop-text', (event, data) => {
    mainWindow.webContents.send('update-markdown', data)
})

ipcMain.on('drop-file', (event, filePath) => {
    mainWindow.webContents.send('read-file', filePath)
})


