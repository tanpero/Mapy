const { NodeHtmlMarkdown } = require("node-html-markdown")
const insertTextAtCursor = require("./insert-text-at-cursor")

const { getMarkdown, setMarkdown } = require("./main")

const insertContent = (el, text) => {
    insertTextAtCursor(el, NodeHtmlMarkdown.translate(text), setMarkdown, getMarkdown)
}

const paste = async element => {
    try {
        const clipboardItems = await navigator.clipboard.read()
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                const blob = await clipboardItem.getType(type)
                const reader = new FileReader()
                reader.onload = e => insertContent(element, e.target.result)
                reader.readAsText(blob)
            }
        }
    } catch (err) {
        alert(console.error(err))
    }
}

const link = (el, text) => {
    insertTextAtCursor(el, `[${text}](${text})`)
}

module.exports = {
    paste, link
}

