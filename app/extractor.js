const path = require("path")
const { app, clipboard, Menu, Tray, systemPreferences } = require("electron")

const clippings = []

let tray = null

const getIcon = () => "../tray-logo.png"

const onReady = () => {
    tray = new Tray(path.join(__dirname, getIcon()))

    if (process.platform === "win32") {
        tray.on("click", tray.popUpContextMenu)
    }

    if (app.dock) {
        app.dock.hide()
    }

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
        ...clippings.map(createClippingMenuItem),
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
    clippings.push(clipping)
    updateMenu()
    return clipping
}

const createClippingMenuItem = (clipping, index) => {
    return {
        label: clipping,
        click () {
            clipboard.writeText(clipping)
        },
        accelerator: `CommandOrControl+${index}`
    }
}

module.exports = {
    onReady,
}
