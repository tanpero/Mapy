const { dialog } = require('electron')

const getFileFromUser = () => dialog.showOpenDialog({ properties: ["openFile"] })

module.exports = { getFileFromUser }
