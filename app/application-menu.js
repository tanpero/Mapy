const { app, BrowserWindow, Menu, shell, dialog } = require("electron")
const mainProcess = require("./main")

const template = [
    {
        label: "文件",
        submenu: [
            {
                label: "新建",
                accelerator: "CommandOrControl+N",
                click () {
                    mainProcess.createWindow()
                }
            },
            {
                label: "打开",
                accelerator: "CommandOrControl+O",
                click (item, focusedWindow) {
                    mainProcess.openFileFromUser(focusedWindow)
                }
            }
        ]
    },
    {
        label: "编辑",
        submenu: [
            {
                label: "撤销",
                accelerator: "CommandOrControl+Z",
                role: "undo",
            },
            {
                label: "重做",
                accelerator: "CommandOrControl+Y",
                role: "redo",
            },
            { type: "separator" },
            {
                label: "剪切",
                accelerator: "CommandOrControl+X",
                role: "cut",
            },
            {
                label: "复制",
                accelerator: "CommandOrControl+C",
                role: "copy",
            },
            {                
                label: "粘贴",
                accelerator: "CommandOrControl+V",
                role: "paste",
            },
            {
                label: "全选",
                accelerator: "CommandOrControl+A",
                role: "selectall",
            },
        ],
    },
    {
        label: "帮助",
        role: "help",
        submenu: [
            {
                label: "项目主页",
                click () {
                    // TODO...
                }
            },
            {
                label: "开发者工具",
                accelerator: "CommandOrControl+Shift+I",
                click (item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.webContents.toggleDevTools()
                    }
                }
            },
            { type: "separator" },
            {
                label: "关于项目",
                accelerator: "CommandOrControl+Shift+A",
                click (item, focusedWindow) {
                    if (focusedWindow) {
                        mainProcess.showAboutWindow()
                    }
                }
            }
        ]
    }
]

if (process.platform === "darwin") {
    const name = "Mapy"
    template.unshift({ label: name })
}

module.exports = Menu.buildFromTemplate(template)
