const WordCloud = require("wordcloud")

const words = [["生命", 28], ["希望", 30]]

WordCloud(document.querySelector("#word-cloud"), {
    list: words,
    gridSize: 8,
    weightFactor: 5,
    fontFamily: "Impact",
    color: "random-dark"
})
