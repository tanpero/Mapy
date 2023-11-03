const container = require("markdown-it-container") 

module.exports = markdown => {
    markdown.use(container, "dynamic", {
        validate: () => true,
        render (tokens, idx) {
            let token = tokens[idx]
    
            if (token.nesting === 1) {
                return `<div class="${token.info.trim()}">`
            } else {
                return `</div>`
            }
        },
    })
}