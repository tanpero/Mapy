const MarkdownIt = require("markdown-it")

module.exports = md => {
  const headingRegex = /^(#+)\s+(.*)$/gm

  md.core.ruler.push("headingSpan", state => {
    let i = state.tokens.length - 1
    while (i >= 0 && state.tokens[i].type !== "inline") {
      i--
    }

    if (i === -1) {
      return
    }

    const token = state.tokens[i]
    const match = headingRegex.exec(token.content)

    if (match) {
      const level = match[1].length
      const text = match[2]
      const spanClass = `heading-${level}`

      const replacementToken = [
        "inline",
        spanClass,
        [ "text", text ],
        "span_close",
      ]

      const newToken = Object.assign({}, token, replacementToken)

      state.tokens.splice(i + 1, 0, newToken)
      state.tokens.splice(i, 1)
    }
  })
}
