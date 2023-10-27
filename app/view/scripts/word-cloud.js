const WordCloud = require("wordcloud")
const stopwords = require("./stop-words")
const { filterMarkdown } = require("./text-util")

const TEXT_SCALE_BASELINE = 200
const LOWEREST_LIMIT_OF_FREQUENCY = 5
const ZIPF_EXPONENT = 1.5

function calculateOptimalN(wordFrequencyList) {
    // 计算信息熵
    const totalWords = wordFrequencyList.reduce((sum, [, frequency]) => sum + frequency, 0);
    let entropy = 0;
    for (const [, frequency] of wordFrequencyList) {
        const probability = frequency / totalWords;
        entropy -= probability * Math.log2(probability);
    }

    // 齐普夫定律中的指数参数，通常在1.5到2.0之间
    const zipfExponent = ZIPF_EXPONENT;

    // 根据信息熵和齐普夫定律计算N
    /*
     * Math.pow(2, entropy) -> 文本不确定度
     * Math.pow(totalWords, 1 / zipfExponent) -> 词频分类可能性
     * 
     */
    console.log("信息熵：" + Math.pow(2, entropy) / 100)
    console.log("词频种类可能性：" + Math.pow(totalWords, 1 / zipfExponent) / 100)
    const optimalN = Math.round(Math.pow(2, entropy) * Math.pow(totalWords, 1 / zipfExponent) / 10000);

    return optimalN;
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

const wordcloud = (fn, cloud, shape = "circle") => {
    
    const update = () => {
        const text = filterMarkdown(fn())
        const segments = segmenter.segment(text)
        const wordsSource = [...segments].filter(ch => ch.isWordLike)
        const words = processWords(wordsSource)
                
        WordCloud(cloud, {
            list: words,
            shape
        })

    }

    return update    
}

module.exports = {
    wordcloud,
}
