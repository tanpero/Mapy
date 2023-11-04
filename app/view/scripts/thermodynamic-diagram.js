const checkoutColorByFrequency = (value, levels) => {

    // 将频度区间的下界按从小到大排序
    const sortedLevels = Object.keys(levels).sort((a, b) => levels[a] - levels[b])

    // 查找小于等于 value 的最大频度区间下界
    let selectedColor = sortedLevels[0]
    for (let i = 0; i < sortedLevels.length; i++) {
        const level = sortedLevels[i]
        if (value >= levels[level]) {
            selectedColor = level
        } else {
            break
        }
    }

    return selectedColor
}

const divideIntervalByMaximumValue = (value, _colors) => {

    const colors = [..._colors]

    // 创建一个对象用于存储区间下界和颜色的映射
    const intervalColors = {}

    // 如果颜色数组为空或频度值小于等于0，返回空对象
    if (colors.length === 0 || value <= 0) {
        return intervalColors
    }

    const numColors = colors.length
    const intervalLength = Math.floor(value / numColors)
    const boundaries = []

    for (let i = 0; i < numColors - 1; i++) {
        boundaries.push((i + 1) * intervalLength)
    }

    // 计算最后一个区间的下界
    const lastBoundary = value;
  
    // 添加最小的下界为1和最大的下界为频度值
    boundaries.unshift(1);
    boundaries.push(lastBoundary);
  
    // 处理重复的下界值并均匀分布颜色
    const uniqueBoundaries = Array.from(new Set(boundaries));
  
    if (uniqueBoundaries.length < numColors) {

        // 获取需要剔除的颜色
        const colorsToRemove = colors.slice(uniqueBoundaries.length - 1);
        for (const color of colorsToRemove) {

            // 从原本的颜色数组中剔除重复的颜色
            const index = colors.indexOf(color);
            if (index !== -1) {
                colors.splice(index, 1);
            }
        }
    }
  
    // 重新计算区间长度
    const newIntervalLength = Math.floor(value / colors.length);
  
    // 逐个调整区间下界以满足均等分布
    for (let i = 0; i < uniqueBoundaries.length - 1; i += 1) {
        
        // 获取需要剔除的颜色
        const adjustedBoundary = i * newIntervalLength + 1

        // 将颜色和区间下界的映射添加到结果对象中
        intervalColors[colors[i]] = adjustedBoundary
    }

    return intervalColors
}

const selectColor = (frequency, maxFrequency, colorNames) => {
    if (frequency <= 0 || maxFrequency <= 0 || frequency > maxFrequency || colorNames.length === 0) {
        return null
    }
    
    return checkoutColorByFrequency(frequency,
            divideIntervalByMaximumValue(maxFrequency, colorNames))
}

const generateDataset = (forwardMonth, options = {}) => {
    const config = Object.assign({}, {
        endDate: null,
        fill: {},
    }, options)

    const months = []
    const days = []

    // 计算需要填充的日期
    for (let i = forwardMonth; i > 0; i -= 1) {
        let referDate = config.endDate
            ? new Date(config.endDate)
            : new Date()

        referDate.setMonth(referDate.getMonth() - i + 2)
        referDate.setDate(0)

        let month = referDate.getMonth()+1
        month = month < 10 ? `0${month}` : month

        for (let d = 1; d <= referDate.getDate(); d++) {
            let day = d < 10 ? `0${d}` : d
            let data = {
                date: `${referDate.getFullYear()}-${month}-${day}`,
            }

            if (config.fill.hasOwnProperty(data.date)) {
                data.total = config.fill[data.date]
            }

            days.push(data)
        }

        months.push(`${referDate.getFullYear()}-${month}`)
    }

    // 确保第一个日期是从星期一开始
    // 不是星期一就向前追加相应的天数
    let firstDate = days[0].date

    let d = new Date(firstDate)
    let day = d.getDay()
    if (day == 0) {
        day = 7
    }

    for (let i = 1; i < day; i += 1) {
        let d = new Date(firstDate)
        d.setDate(d.getDate() - i)

        let v = [d.getFullYear(), d.getMonth() + 1, d.getDate()]

        if (v[1] < 10) {
            v[1] = `0${v[1]}`
        }

        if (v[2] < 10) {
            v[2] = `0${v[2]}`
        }

        days.unshift({date: v.join('-')})
    }

    return { days, months }
}

const drawMonths = (svg, dataset, width, height, margin, 
                    weekBoxWidth, monthBoxHeight,
                    fontSize = '0.9em', fontFamilly  = 'monospace', fillColor = '#999',
                    ) => {
    
    svg.attr('width', width).attr('height', height)

    // 绘制月份坐标
    const monthBox = svg.append('g').attr(
        'transform',
        `translate(${margin + weekBoxWidth}, ${margin})`)
    const monthScale = d3.scaleLinear()
        .domain([0, dataset.months.length])
        .range([0, width - margin - weekBoxWidth + 10])

    monthBox.selectAll('text').data(dataset.months).enter()
        .append('text')
        .text(v => v)
        .attr('font-size', fontSize)
        .attr('font-family', fontFamilly)
        .attr('fill', fillColor)
        .attr('x', (v, i) => monthScale(i))

}

const drawWeeks = (svg, dataset, width, height, margin, 
                    weekBoxWidth, monthBoxHeight,
                    fontSize = '0.85em', fillColor = '#CCC', weeks = ['一', '三', '五', '日']
                    ) => {

    const weekBox = svg.append('g').attr(
        'transform',
        `translate(${margin - 10}, ${margin + monthBoxHeight})`)
    const weekScale = d3.scaleLinear()
        .domain([0, weeks.length])
        .range([0, height - margin - monthBoxHeight + 14])

    weekBox.selectAll('text').data(weeks).enter()
        .append('text')
        .text(v => v)
        .attr('font-size', fontSize)
        .attr('fill', fillColor)
        .attr('y', (v, i) => weekScale(i))
}

const drawDays = (svg, dataset, width, height, margin, 
                    weekBoxWidth, monthBoxHeight,
                    fontSize = '0.85em', fillColor = '#CCC', weeks,
                    cellMargin = 3,
                    defaultColor = '#EFEFEF', maxValue, colorNames
                    ) => {
                        
    // 绘制日期方块
    const cellBox = svg.append('g').attr(
        'transform',
        `translate(${margin + weekBoxWidth}, ${margin + 10})`)

    // 计算方块大小
    const cellSize = (height - margin - monthBoxHeight - cellMargin * 6 - 10) / 7
    // 方块列计数器
    let cellCol = 0

    let cell = cellBox.selectAll('rect').data(dataset.days).enter()
        .append('rect')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('rx', 3)
        .attr('fill', v => {
            if (!v.total) {
                return defaultColor
            }
            return selectColor(v.total, maxValue, colorNames)
        })
        .attr('x', (v, i) => {
            if (i % 7 === 0) {
                cellCol += 1
            }
            let x = (cellCol - 1) * cellSize
            return cellCol > 1 ? x + cellMargin * (cellCol - 1) : x
        })
        .attr('y', (v, i) => {
            let y = i % 7
            return y > 0 ? y * cellSize + cellMargin * y : y * cellSize
        })
}

class Thermodynamic {
    #svg = null
    #width = 1000
    #height = 180
    #margin = 30
    #weekBoxWidth = 20
    #monthBoxHeight = 20
    #dataSet
    #frequencyRecord = 0
    #weeks = ['一', '三', '五', '日']
    #months_style = {}
    #weeks_style = {}
    #days_style = {}
    #colorLevels = []

    constructor (id, forwardMonth = 6, dataSet) {
        this.#dataSet = generateDataset(forwardMonth, {
            fill: dataSet
        })
        this.#frequencyRecord = Math.max(...Object.values(dataSet))
        this.#svg = d3.select(`#${id}`)        
    }
    width (n) {
        this.#width = n
        return this
    }
    height (n) {
        this.#height = n
        return this
    }
    margin (n) {
        this.#margin = n
        return this
    }
    weekBoxWidth (n) {
        this.#weekBoxWidth = n
        return this
    }
    monthBoxHeight (n) {
        this.#monthBoxHeight = n
        return this
    }
    monthsStyle (option) {
        this.#months_style = option
        return this
    }
    weeksStyle (option) {
        this.#weeks_style = option
        return this
    }
    daysStyle (option) {
        this.#days_style = option
        return this
    }
    weekTitle (weeks) {
        this.#weeks = weeks
        return this
    }
    colorLevels (colors) {
        this.#colorLevels = colors
        return this
    }
    drawMonths () {
        drawMonths(this.#svg, this.#dataSet,
                    this.#width, this.#height, this.#margin,
                    this.#weekBoxWidth, this.#monthBoxHeight,
                    this.#months_style.size, this.#months_style.familly,
                    this.#months_style.color
        )
        return this
    }
    drawWeeks () {
        drawWeeks(this.#svg, this.#dataSet,
                    this.#width, this.#height, this.#margin,
                    this.#weekBoxWidth, this.#monthBoxHeight,
                    this.#weeks_style.size, this.#weeks_style.color,
                    this.#weeks
        )
        return this
    }
    drawDays () {
        drawDays(this.#svg, this.#dataSet,
                this.#width, this.#height, this.#margin,
                this.#weekBoxWidth, this.#monthBoxHeight,
                this.#days_style.size, this.#days_style.color,
                this.#weeks, this.#days_style.margin,
                this.#days_style.defaultColor,
                this.#frequencyRecord, this.#colorLevels
        )
        return this
    }
    draw () {
        this.drawMonths().drawWeeks().drawDays()
        return this
    }
}
