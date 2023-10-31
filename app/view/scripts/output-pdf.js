//require("../assets/SourceHanSerifCN-Regular-normal")
const { jsPDF } = require("jspdf")
require("jspdf-autotable")
let doc = new jsPDF({ 
    unit: "mm", // 单位，本示例为mm
    format: "a4", // 页面大小
    orientation: "portrait", // 页面方向，portrait: 纵向，landscape: 横向
    putOnlyUsedFonts: true, // 只包含使用的字体
    // compress: true, // 压缩文档
    precision: 16, // 浮点数的精度
})

//doc.setFont('SourceHanSerifCN-Regular', 'normal');

const outputPDF = (html, path) => {
    doc.html(html, {
        callback (pdf) {
            pdf.save(path)
        },
        top: 20,
        bottom: 60,
        left: 20,
        width: 600
    })
}

module.exports = {
    outputPDF,
}
