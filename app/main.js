const { app, BrowserWindow } = require("electron")
const path = require("path")
const as = fileName => path.join('app', 'view', fileName)

app.on("ready", () => {
    let mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    mainWindow.webContents.loadFile(as('index.html'))
})
