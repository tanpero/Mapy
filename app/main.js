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
    let incrementX = Math.random() * 100
    let incrementY = Math.random() * 100
    return [signX * incrementX, signY * incrementY]
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

app.on("open-file", (event, filePath) => {
    const targetWindow = windows.values().next().value
    openFile(targetWindow, filePath)
})

app.on("will-finish-launching", () => {
    app.on("open-file", (e, file) => {
        const win = createWindow()
        win.once("ready-to-show", () => {
            openFile(win, file)
        })
    })
})


const openFile = module.exports.openFile = (targetWindow, path) => {
    const content = fs.readFileSync(path).toString()
    app.addRecentDocument(path)
    targetWindow.setRepresentedFilename(path)
    targetWindow.webContents.send("file-has-been-opened", { path, content })
}

ipcMain.on("openNewBlankFileWindow", e => {
    createWindow().focus()   
})

ipcMain.on("showOpenFileDialog", e => {
    const win = BrowserWindow.getFocusedWindow()
    dialog.showOpenDialog(win, {
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
            openFile(win, filePath)
        }
    })
})

ipcMain.on("showSaveFileDialog", e => {
    dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
        filters: [
            { 
                name: "Markdown",
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
        title: "保存预览",
        defaultPath: app.getPath("desktop"),
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
            e.reply("html-path-has-been-set", {
                path: filePath
            })
        }
    })
})

ipcMain.on("to-save-html", (e, { filePath, content }) => {
    fs.writeFile(filePath, content, e => { if (e) console.error(e) })
})
