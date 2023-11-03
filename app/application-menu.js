const { app, BrowserWindow, Menu, shell } = require("electron")
const mainProcess = require("./main")

const template = [
    {
        label: "编辑",
        submenu: [
            {
                label: "复制",
                accelerator: "CommandOrControl+C",
                role: "copy",
            },
            {                
                label: "粘贴",
                accelerator: "CommandOrControl+V",
                role: "paste",
            }
        ]
    }
]

if (process.platform === "darwin") {
    const name = "Mapy"
    template.unshift({ label: name })
}

module.exports = Menu.buildFromTemplate(template)
