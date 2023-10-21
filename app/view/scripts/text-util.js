const extractFileName = filePath => {
    
    // 使用正斜杠或反斜杠作为分隔符来匹配文件名
    const regex = /[\\/]/g // 匹配正斜杠和反斜杠
    const parts = filePath.split(regex)
  
    // 从分割后的数组中获取最后一个元素，即文件名
    const fileName = parts[parts.length - 1]
  
    return fileName
}

module.exports = {
    extractFileName,
}
