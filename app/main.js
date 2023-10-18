const { app, BrowserWindow } = require("electron")
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
})
