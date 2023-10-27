const { jsPDF } = require("jspdf")

let doc = new jsPDF()

const outputPDF = (html, path) => {
    doc.html(html, {
        callback (pdf) {
            pdf.save(path)
        }
    })
}

module.exports = {
    outputPDF,
}
