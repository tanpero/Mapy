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

    
    const isSuccess = document.execCommand("insertText", false, text)
    if (!isSuccess) {
        const start = input.selectionStart
        const end = input.selectionEnd
    
            const range = document.createRange()
            const textNode = document.createTextNode(text)

            if (canManipulateViaTextNodes(input)) {
                let node = input.firstChild
    
                if (!node) {
                    input.appendChild(textNode)
                } else {    
                    let offset = 0
                    let startNode = null
                    let endNode = null

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
    
                    if (start !== end) {
                        range.deleteContents()
                    }
                }
                    
            if (
                canManipulateViaTextNodes(input) &&
                range.commonAncestorContainer.nodeName === "#text"
            ) {    
                range.insertNode(textNode)
            } else {
                let value = getSource()    
                setSource(value.slice(0, start) + text + value.slice(end))
            }
        }
    
        input.setSelectionRange(start + text.length, start + text.length)
    
        const e = document.createEvent("UIEvent")
        e.initEvent("input", true, false)
        input.dispatchEvent(e)
    }
}
