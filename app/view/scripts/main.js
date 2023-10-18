const marked = require('marked');

const markdownView = document.querySelector("#markdown")
const htmlView = document.querySelector("#html")
const newFileButton = document.querySelector("#new-file")
const openFileButton = document.querySelector("#open-file")
const saveMarkdownButton = document.querySelector("#save-markdown")
const saveHtmlButton = document.querySelector("#save-html")
const savePdfButton = document.querySelector("#save-pdf")
const showFileButton = document.querySelector("#show-file")
const openInDefaultButton = document.querySelector("#open-in-default")

const renderMarkdownToHtml = markdown => htmlView.innerHTML = marked.parse(markdown, { sanitize: true })

markdownView.addEventListener('keyup', e => renderMarkdownToHtml(e.target.innerText))
