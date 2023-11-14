const { ipcRenderer } = require("electron")

ipcRenderer.on("show-notification", (e, title, body, onclick = () => {}) => {
    new Notification(title, { body }).onclick = onclick
})

