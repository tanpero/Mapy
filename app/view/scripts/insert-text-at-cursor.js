let browserSupportsTextareaTextNodes

const canManipulateViaTextNodes = input => {
        if (input.nodeName !== "TEXTAREA") {
                return false
        }
        if (typeof browserSupportsTextareaTextNodes === "undefined") {
                const textarea = document.createElement("textarea")
                textarea.value = 1
                browserSupportsTextareaTextNodes = !!textarea.firstChild
        }
        return browserSupportsTextareaTextNodes
}

module.exports = (input, text, setSource, getSource) => {
        input.focus()

        const start = input.selectionStart
        const end = input.selectionEnd
        const range = document.createRange()
        const textNode = document.createTextNode(text)

        // 如果可以通过 Text Node 操作输入框，使用 Text Node 进行插入
        if (canManipulateViaTextNodes(input)) {
            const node = input.firstChild
            const offset = 0
            const startNode = null
            const endNode = null

            while (node && (startNode === null || endNode === null)) {
                const nodeLength = node.nodeValue.length
                if (start >= offset && start <= offset + nodeLength) {
                    range.setStart((startNode = node), start - offset)
                }
                if (end >= offset && end <= offset + nodeLength) {
                    range.setEnd((endNode = node), end - offset)
                }
                offset += nodeLength
                node = node.nextSibling
            }

            // 如果开始位置和结束位置不相同，删除原有内容并插入新内容
            if (start !== end) {
                range.deleteContents()
                range.insertNode(textNode)
            } else {
                // 如果开始位置和结束位置相同，直接替换原有内容为新内容
                range.deleteContents()
                range.insertNode(textNode)
            }
        } else { // 如果不能通过 Text Node 操作输入框，使用其他方法插入文本
            const value = getSource()
            setSource(value.slice(0, start) + text + value.slice(end))
        }


    // 将光标移动到插入文本后的位置，并触发 input 事件，以便更新显示的内容和状态
    input.setSelectionRange(start + text.length, start + text.length)
    const e = document.createEvent("UIEvent")
    e.initEvent("input", true, false)
    input.dispatchEvent(e)
}
