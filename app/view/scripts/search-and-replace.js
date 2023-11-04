const markdownIt = require("markdown-it")
const { envFromTerms, plugin } = require("markdown-it-marked")

const isVisible = box => {
    return box?.style?.display === "block"
}

const triggerBox = (box, input) => {
    if (box?.style?.display) {
        box.style.display = isVisible(box) ? "none" :  (setTimeout(() => input.focus(), 100), "block")
    }    
    return isVisible(box)
}

let removeInputListener = () => {}
let listener = e => {}

/*
 * input: 输入框
 * getMD: function getMarkdown
 * setHTML: function markdown.render
 */
const setInputListener = (input, getMD, setHTML) => {
    listener = e => {
        if (e.key === "Enter") {
            setHTML(getMD(), envFromTerms([input.value]))
        }
    }

    input.addEventListener("keydown", listener)
        
    removeInputListener = input => {
        input.removeInputListener("keydown", listener)
    }
}

module.exports = {
    triggerBox,
    searchHighlightPlugin: plugin,
    setInputListener,
    removeInputListener,
}
