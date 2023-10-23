const WordCloud = require("wordcloud")
const stopwords = require("./stop-words")

const processWords = segments => {
    const wordCount = {} // 用于存储单词及其出现频率的对象

    // 遍历输入的 segments 数组
    for (const segmentObj of segments) {
        const word = segmentObj.segment

        if (stopwords.includes(word)) {
            continue
        }

        // 将单词添加到 wordCount 对象中，如果已存在则增加频率
        if (word in wordCount) {
            wordCount[word] += 5
        } else {
            wordCount[word] = 5
        }
    }

    // 将结果转换为所需的数组格式
    const result = []
    for (const word in wordCount) {
        result.push([word, wordCount[word]])
    }

    // 按照出现次数降序排序
    result.sort((a, b) => b[1] - a[1])

    return result
}


const text = el.innerText
const segmenter = new Intl.Segmenter("zh", { granularity: "word" })

const wordcloud = (el, cloud, shape = "circle") => {
    

    const update = () => {
        const segments = segmenter.segment(text)
        const wordsSource = [...segments].filter(ch => ch.isWordLike)
        const words = processWords(wordsSource)
        console.log(words)
                
        WordCloud(cloud, {
            list: words,
            shape
        })
    }
    const observer = new MutationObserver(update)
    observer.observe(el, { childList:true, subtree: true, attributes: true })
    cloud.addEventListener("wordcloudstop", () => (
        setTimeout(() => Array.from(document.querySelectorAll(".word-color")).forEach(e => e.classList.add("word-animate")), 2000)
    ))
}

module.exports = {
    wordcloud,
}
