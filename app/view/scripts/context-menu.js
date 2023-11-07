const VanillaContextMenu = require("vanilla-context-menu")

const setContextMenuOnSelecting = container =>
new VanillaContextMenu({
    scope: container,
    menuItems: [
        {
            label: "剪切",
            iconHTML: `<span class="material-icons">content_cut</span>`,
            callback () {}
        }, {
            label: "复制",
            iconHTML: `<span class="material-icons">content_copy</span>`,
            callback () {}
        }, {
            label: "粘贴",
            iconHTML: `<span class="material-icons">content_paste</span>`,
            callback () {}
        }, {
            label: "删除",
            iconHTML: `<span class="material-icons">delete</span>`,
            callback () {}
        }, 
        "hr",
        {
            label: "加粗",
            iconHTML: `<span class="material-icons">format_bold</span>`,
            callback () {}
        }, {
            label: "倾斜",
            iconHTML: `<span class="material-icons">format_italic</span>`,
            callback () {}
        }, {
            label: "代码",
            iconHTML: `<span class="material-icons">code</span>`,
            callback () {}
        }, {
            label: "链接",
            iconHTML: `<span class="material-icons">link</span>`,
            callback () {}
        }, 
    ],
})

module.exports = {
    setContextMenuOnSelecting,
}
