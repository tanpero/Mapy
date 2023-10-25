const { ipcMain, dialog, ipcRenderer } = require("electron")
const os = require('os')
const fs = require('fs')
const path = require('path')
let taskList = []


ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({ properties: ['openFile'] }).then((result) => {
        if (!result.canceled && result.filePaths.length > 0) {
            ipcRenderer.send('file-selected', result.filePaths[0])
        }
    })
})

// 获取所有任务
ipcMain.on('get-tasks', (event) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const tasksFile = path.join(tasksDir, 'tasks.json')
    if (fs.existsSync(tasksFile)) {
        const tasksData = fs.readFileSync(tasksFile)
        taskList = JSON.parse(tasksData)
    } else {
        taskList = []
    }

    event.sender.send('tasks-loaded', taskList)
})

// 创建新任务
ipcMain.on('create-task', (event, taskName) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const tasksFile = path.join(tasksDir, 'tasks.json')
    const tasksData = JSON.parse(fs.readFileSync(tasksFile))

    tasksData.push({ name: taskName })
    fs.writeFileSync(tasksFile, JSON.stringify(tasksData))

    event.sender.send('task-created', taskName)
})

// 更新任务
ipcMain.on('update-task', (event, taskId, taskName) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const tasksFile = path.join(tasksDir, 'tasks.json')
    const tasksData = JSON.parse(fs.readFileSync(tasksFile))

    for (let i = 0; i < tasksData.length; i++) {
        if (tasksData[i].id === taskId) {
            tasksData[i].name = taskName
            fs.writeFileSync(tasksFile, JSON.stringify(tasksData))
            break
        }
    }

    event.sender.send('task-updated', taskId, taskName)
})

// 删除任务
ipcMain.on('delete-task', (event, taskId) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const tasksFile = path.join(tasksDir, 'tasks.json')
    const tasksData = JSON.parse(fs.readFileSync(tasksFile))

    tasksData = tasksData.filter((task) => task.id !== taskId)
    fs.writeFileSync(tasksFile, JSON.stringify(tasksData))

    event.sender.send('task-deleted', taskId)
})

// 添加任务分类
ipcMain.on('add-category', (event, categoryName) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const categoriesFile = path.join(tasksDir, 'categories.json')
    if (!fs.existsSync(categoriesFile)) {
        fs.writeFileSync(categoriesFile, JSON.stringify([]))
    }

    const categoriesData = JSON.parse(fs.readFileSync(categoriesFile))
    categoriesData.push(categoryName)
    fs.writeFileSync(categoriesFile, JSON.stringify(categoriesData))

    event.sender.send('category-added', categoryName)
})

// 更新任务分类
ipcMain.on('update-category', (event, categoryId, categoryName) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const categoriesFile = path.join(tasksDir, 'categories.json')
    const categoriesData = JSON.parse(fs.readFileSync(categoriesFile))

    for (let i = 0; i < categoriesData.length; i++) {
        if (categoriesData[i].id === categoryId) {
            categoriesData[i].name = categoryName
            fs.writeFileSync(categoriesFile, JSON.stringify(categoriesData))
            break
        }
    }

    event.sender.send('category-updated', categoryId, categoryName)
})

// 删除任务分类
ipcMain.on('delete-category', (event, categoryId) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const categoriesFile = path.join(tasksDir, 'categories.json')
    const categoriesData = JSON.parse(fs.readFileSync(categoriesFile))

    categoriesData = categoriesData.filter((category) => category.id !== categoryId)
    fs.writeFileSync(categoriesFile, JSON.stringify(categoriesData))

    event.sender.send('category-deleted', categoryId)
})

// 添加任务标签
ipcMain.on('add-tag', (event, tagName) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const tagsFile = path.join(tasksDir, 'tags.json')
    if (!fs.existsSync(tagsFile)) {
        fs.writeFileSync(tagsFile, JSON.stringify([]))
    }

    const tagsData = JSON.parse(fs.readFileSync(tagsFile))
    tagsData.push(tagName)
    fs.writeFileSync(tagsFile, JSON.stringify(tagsData))

    event.sender.send('tag-added', tagName)
})

// 更新任务标签
ipcMain.on('update-tag', (event, tagId, tagName) => {
    const tasksDir = path.join(os.homedir(), 'TaskManager')
    if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir)
    }

    const tagsFile = path.join(tasksDir, 'tags.json')
    const tagsData = JSON.parse(fs.readFileSync(tagsFile))

    for (let i = 0; i < tagsData.length; i++) {
        if (tagsData[i].id === tagId) {
            tagsData[i].name = tagName
            fs.writeFileSync(tagsFile, JSON.stringify(tagsData))
            break
        }
    }

    event.sender.send('tag-updated', tagId, tagName)
})

