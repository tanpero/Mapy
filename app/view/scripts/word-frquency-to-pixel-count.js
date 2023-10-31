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
    const optimalN = Math.round(Math.pow(2, entropy) * Math.pow(totalWords, 1 / zipfExponent));

    return optimalN;
}

// 计算频度分布函数
function calculateFrequencyDistribution(wordFrequencyList) {

    // 给定的词频列表已先行进行降序处理

    const N = optimalN(wordFrequencyList)

    // 选择前N个高频词
    const topNWords = wordFrequencyList.slice(0, Math.min(N, wordFrequencyList.length));

    // 计算高频词的总频度
    const totalHighFrequency = topNWords.reduce(
            (sum, [, frequency]) => sum + frequency, 0);

    // 构建频度分布，表示每个高频词的频度占总频度的比例
    const frequencyDistribution = topNWords.map(
            ([word, frequency]) => [word, frequency / totalHighFrequency]);

    return frequencyDistribution;
}

// 计算文本规模函数，基于明确定义的 frequencyDistribution
function calculateScale(varietyCount, frequencyDistribution) {
    // 基本规模
    let baseScale = 1;

    // 根据词汇种类和高频词频度分布调整规模
    if (varietyCount < 50) {
        // 对于较少的词汇种类，适度增加规模
        baseScale *= 2;
    }

    // 计算总频度分布，表示所有高频词的总频度占总频度的比例
    const totalFrequencyDistribution = frequencyDistribution.reduce(
        (sum, [, frequency]) => sum + frequency, 0);

    if (totalFrequencyDistribution > 0.3) {
        // 对于较高的高频词总频度占比，适度降低规模
        baseScale *= 0.5;
    }

    return baseScale;
}

function projectFrequencyToPixelCount(wordsMap, textScale) {
    const result = [];

    // 计算平均词频
    let totalFrequency = 0;
    for (const [, frequency] of wordsMap) {
        totalFrequency += frequency;
    }
    const averageFrequency = totalFrequency / wordsMap.length;

    // 根据文本长度和平均词频动态调整像素数
    for (const [word, frequency] of wordsMap) {
        let pixelCount;

        if (textScale < TEXT_SCALE_BASELINE && frequency < averageFrequency) {
            // 对于较短文本和低于平均词频的词，增加像素数
            pixelCount = frequency * 10;
        } else if (textScale > 1000) {
            // 对于较长文本，降低像素数
            pixelCount = Math.max(1, Math.floor(frequency / 10));
        } else {
            // 其他情况，按默认像素数
            pixelCount = frequency;
        }

        // 剔除频度极低的词汇
        if (pixelCount >= LOWEREST_LIMIT_OF_FREQUENCY) {
            result.push([word, pixelCount]);
        }
    }

    return result;
}

// 示例用法
const wordsMap = [
    ["生活", 20],
    ["希望", 16],
    // 更多词语...
];
const textScale = 500; // 文本长度，根据实际情况设置

const pixelCountResult = projectFrequencyToPixelCount(wordsMap, textScale);
console.log(pixelCountResult);




