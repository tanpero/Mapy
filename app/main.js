const { app, BrowserWindow, dialog, ipcMain } = require("electron")
const path = require("node:path")
const fs = require("fs")
const { windowManager } = require("electron-window-manager")
const as = fileName => path.join('app', 'view', fileName)

let mainWindow = null

const createWindow = () => {

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        show: false
    })

    mainWindow.webContents.loadFile(as('index.html'))

    mainWindow.once("ready-to-show", () => mainWindow.show())

    mainWindow.on("closed", () => mainWindow = null)

}

app.whenReady().then(createWindow)


ipcMain.on("openNewBlankFileWindow", e => {
    let newWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        show: false
    })

    newWindow.webContents.loadFile(as('index.html'))
    newWindow.once("ready-to-show", () => newWindow.show())

    newWindow.on("closed", () => newWindow = null)
    
})


ipcMain.on("showOpenFileDialog", e => {
    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        filters: [
            { 
                name: "Markdown 文件",
                extensions: ["md", "markdown"]
            }, {
                name: "所有文件",
                extensions: ["*"]
            }
        ]
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePaths[0]
            const fileContent = fs.readFileSync(filePath, "utf-8")
            e.reply("open-file", {
                path: filePath,
                content: fileContent
            })
        }
    })
})

ipcMain.on("showSaveFileDialog", e => {
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        filters: [
            { 
                name: "Markdown 文件",
                extensions: ["md", "markdown"]
            }, {
                name: "所有文件",
                extensions: ["*"]
            }
        ]
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePath
            e.reply("save-file", {
                path: filePath
            })
        }
    })
})

