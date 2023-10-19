const d3 = require("d3")

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
        month = month < 10 ? `${0}month` : month

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

    return {days: days, months: months}
}

const drawMonths = (svg, width, height, margin, 
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

const drawWeeks = (svg, width, height, margin, 
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

const drawDays = (svg, width, height, margin, 
                    weekBoxWidth, monthBoxHeight,
                    fontSize = '0.85em', fillColor = '#CCC', weeks,
                    cellMargin = 3,
                    defaultColor = '#EFEFEF', deepColor = '#f96', lightColor = '#fc9'
                    ) => {

    // 绘制日期方块
    const cellBox = svg.append('g').attr(
        'transform',
        `translate(${margin + weekBoxWidth}, '${margin + 10})`)

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
            if (v.total == undefined) {
                return defaultColor
            }
            if (v.total > 1) {
                return deepColor
            }
            return lightColor
        })
        .attr('x', (v, i) => {
            if (i % 7 == 0) {
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
    #container = null
    #svg = null
    #width = 1000
    #height = 180
    #margin = 30
    #weekBoxWidth = 20
    #monthBoxHeight = 20
    #dataSet
    #weeks = ['一', '三', '五', '日']
    #months_style = {}
    #weeks_style = {}
    #days_style = {}

    constructor (container, forwardMonth = 6, dataSet) {
        this.#container = container
        this.#dataSet = generateDataset(forwardMonth, {
            fill: dataSet
        })
        this.#svg = this.#container.append("svg")
        
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
    }
    drawMonths () {
        drawMonths(this.#svg,
                    this.#width, this.#height, this.#margin,
                    this.#weekBoxWidth, this.#monthBoxHeight,
                    this.#months_style.size, this.#months_style.familly,
                    this.#months_style.color
        )
        return this
    }
    drawWeeks () {
        drawWeeks(this.#svg,
                    this.#width, this.#height, this.#margin,
                    this.#weekBoxWidth, this.#monthBoxHeight,
                    this.#weeks_style.size, this.#weeks_style.color,
                    this.#weeks
        )
        return this
    }
    drawDays () {
        drawDays(this.#svg,
            this.#width, this.#height, this.#margin,
            this.#weekBoxWidth, this.#monthBoxHeight,
            this.#days_style.size, this.#days_style.color,
            this.#weeks, this.#days_style.margin,
            this.#days_style.defaultColor,
            this.#days_style.deepColor, this.#days_style.lightColor
        )
        return this
    }
    draw () {
        this.drawMonths().drawWeeks.drawDays()
        return this
    }
}

module.export = Thermodynamic
