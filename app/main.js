const { app, BrowserWindow, dialog, ipcMain } = require("electron")
const path = require("node:path")
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

    ipcMain.handle("showOpenFileDialog", options => {
        dialog.showOpenDialog(mainWindow, options || [])
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


