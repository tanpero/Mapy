const { app, BrowserWindow, dialog, ipcMain, shell, nativeTheme } = require("electron")
const path = require("node:path")
const fs = require("fs")
const HotKey = require("hotkeys-js")
const as = fileName => path.join('app', 'view', fileName)

const windowInitSettings = {
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
    },
}

const windows = new Set()

const randomOffset = () => {
    let signX = Math.random() >= 0.5 ? 1 : -1    
    let signY = Math.random() >= 0.5 ? 1 : -1
    let incrementX = Math.random() * 10
    let incrementY = Math.random() * 10
    return [signX * (10 + incrementX), signY * (10 + incrementY)]
}

const createWindow = () => {

    nativeTheme.themeSource = "dark"

    let x, y

    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow) {
        const [ currentWindowX, currentWindowY ] = currentWindow.getPosition()
        const [ offsetX, offsetY ] = randomOffset()
        x = currentWindowX + offsetX
        y = currentWindowY + offsetY
    }

    let newWindow = new BrowserWindow(Object.assign(windowInitSettings, {
        x, y, show: false
    }))

    newWindow.webContents.loadFile(as('index.html'))

    newWindow.once("ready-to-show", () => newWindow.show())

    newWindow.on("closed", () => {
        windows.delete(newWindow)
        newWindow = null
    })

    newWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: "deny" }
    })

    windows.add(newWindow)
    return newWindow
}

app.whenReady().then(createWindow)

app.on("activate", (e, hasVisibleWindows) => !hasVisibleWindows && createWindow())

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit())


ipcMain.on("openNewBlankFileWindow", (e, options) => {
    let newWindow = new BrowserWindow(windowInitSettings)

    newWindow.webContents.loadFile(as('index.html'))
    newWindow.once("ready-to-show", () => newWindow.show())

    newWindow.on("closed", () => newWindow = null)

    if (options?.filePath) {
        newWindow.webContents.on("did-finish-load", () => {
            e.reply("append-file-path", options.filePath) // 将 "hello world" 消息发送给渲染进程
        })
    }
    
})



ipcMain.on("showOpenFileDialog", e => {
    dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        filters: [{
                name: "Markdown",
                extensions: ["md", "markdown"]
            }, {
                name: "纯文本",
                extensions: ["txt"]
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

ipcMain.on("showSaveHtmlFileDialog", e => {
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        filters: [
            { 
                name: "HTML 文件",
                extensions: ["html"]
            }, {
                name: "所有文件",
                extensions: ["*"]
            }
        ]
    }).then(result => {
        if (!result.canceled) {
            const filePath = result.filePath
            e.reply("save-html-file", {
                path: filePath
            })
        }
    })
})

