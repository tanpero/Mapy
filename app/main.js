const { app, BrowserWindow, dialog, ipcMain } = require("electron")
const path = require("node:path")
const fs = require("fs")
const as = fileName => path.join('app', 'view', fileName)

app.whenReady().then(() => {
    let mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "view", "scripts", "preload.js")
        },
        show: false
    })

    mainWindow.webContents.loadFile(as('index.html'))


    mainWindow.once("ready-to-show", () => mainWindow.show())

    mainWindow.on("closed", () => mainWindow = null)

    ipcMain.on("showOpenFileDialog", e => {
        dialog.showOpenDialog(mainWindow, {
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
                e.reply("file-content", fileContent)
            }
        })
    })

    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
            nativeTheme.themeSource = 'light'
        } else {
            nativeTheme.themeSource = 'dark'
        }
        return nativeTheme.shouldUseDarkColors
      })
})


