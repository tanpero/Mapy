const path = require("path")
const {
    app,
    clipboard,
    Menu,
    Tray,
    globalShortcut,
    BrowserWindow,
} = require("electron")

const clippings = []

let tray = null

const getIcon = () => "../tray-logo.png"

const onReady = () => {
    tray = new Tray(path.join(__dirname, getIcon()))

    if (process.platform === "win32") {
        tray.on("click", tray.popUpContextMenu)
    }

    const browserWindow = new BrowserWindow({
        show: false
    })

    browserWindow.loadFile(path.join(__dirname, "view", "components", "extractor", "index.html"))

    if (app.dock) {
        app.dock.hide()
    }

    const activationShortcut = globalShortcut.register(
        "CommandOrControl+Option+C",
        () => tray.popUpContextMenu()
    ) || console.error("Global activation shortcut failed to register")

    const newClippingShortcut = globalShortcut.register(
        "CommandOrControl+Shift+Option+C",
        () => {
            const clipping = addClipping()
            if (clipping) {

            }
        }
    ) || console.error("Global new clipping shortcut failed to register")

    updateMenu()

    tray.setToolTip("Mapy Extractor")
}

const updateMenu = () => {
    const menu = Menu.buildFromTemplate([
        {
            label: "摘录新内容",
            click () {
                addClipping()
            },
            accelerator: "CommandOrControl+Shift+C"
        },
        {
            type: "separator",
        },
        ...clippings.slice(0, 10).map(createClippingMenuItem),
        {
            type: "separator"
        },
        {
            label: "退出",
            click () {
                app.quit()
            }
        }
    ])
    
    tray.setContextMenu(menu)
}

const addClipping = () => {
    const clipping = clipboard.readText()
    if (clippings.includes(clipping)) {
        return
    }
    clippings.unshift(clipping)
    updateMenu()
    return clipping
}

const createClippingMenuItem = (clipping, index) => {
    return {
        label: clipping.length > 20
                ? clipping.slice(0, 20) + "…"
                : clipping,
        click () {
            clipboard.writeText(clipping)
        },
        accelerator: `CommandOrControl+${index}`
    }
}

module.exports = {
    onReady,
}
