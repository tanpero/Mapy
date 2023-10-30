const D3 = require("d3")
const Cloud = require("d3-cloud")
const stopwords = require("./stop-words")
const { filterMarkdown } = require("./text-util")

const cloud = (words, canvas) => {
    const layout =
    Cloud()
    .size([500, 500])
    .words([
      "Hello", "world", "normally", "you", "want", "more", "words",
      "than", "this"].map(function(d) {
      return {text: d, size: 10 + Math.random() * 90, test: "haha"}    
    }))
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90     })
    .font("Impact")
    .fontSize(function(d) { return d.size     })
    .on("end", draw)    

    layout.start()
}



function draw(words) {
  d3.select("body").append("svg")
      .attr("width", layout.size()[0])
      .attr("height", layout.size()[1])
    .append("g")
      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
    .selectAll("text")
      .data(words)
    .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"     })
      .style("font-family", "Impact")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"    
      })
      .text(function(d) { return d.text     })    
}

const TEXT_SCALE_BASELINE = 200
const LOWEREST_LIMIT_OF_FREQUENCY = 5
const ZIPF_EXPONENT = 1.5

function calculateOptimalN(wordFrequencyList) {
    // 计算信息熵
    const totalWords = wordFrequencyList.reduce((sum, [, frequency]) => sum + frequency, 0)    
    let entropy = 0    
    for (const [, frequency] of wordFrequencyList) {
        const probability = frequency / totalWords    
        entropy -= probability * Math.log2(probability)    
    }

    // 齐普夫定律中的指数参数，通常在1.5到2.0之间
    const zipfExponent = ZIPF_EXPONENT    

    // 根据信息熵和齐普夫定律计算N
    /*
     * Math.pow(2, entropy) -> 文本不确定度
     * Math.pow(totalWords, 1 / zipfExponent) -> 词频分类可能性
     * 
     */
    console.log("信息熵：" + Math.pow(2, entropy) / 100)
    console.log("词频种类可能性：" + Math.pow(totalWords, 1 / zipfExponent) / 100)
    const optimalN = Math.round(Math.pow(2, entropy) * Math.pow(totalWords, 1 / zipfExponent) / 10000)    

    return optimalN    
}

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

const segmenter = new Intl.Segmenter("zh", { granularity: "word" })

const wordcloud = (source, cloud, shape = "circle") => {
    const text = filterMarkdown(source)
    const segments = segmenter.segment(text)
    const wordsSource = [...segments].filter(ch => ch.isWordLike)
    const words = processWords(wordsSource)

    console.log(words)
    WordCloud(cloud, {
        list: words,
        shape

    })
}



const wordCloudElement = document.createElement("div")

wordCloudElement.id = "word-cloud"
wordCloudElement.innerHTML = "<b>Hello</b>"

const createWordCloudElement = source => {
    wordcloud(source, wordCloudElement)
    wordCloudElement.style.position = "absolute"

    document.body.appendChild(wordCloudElement)
}

const removeWordCloudElement = () => {
    document.body.removeChild(wordCloudElement)
}

module.exports = {
    wordcloud,
    createWordCloudElement,
    removeWordCloudElement,
}
