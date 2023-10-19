let themeIndex = 0;

module.exports = {
    defaultTheme () {
        return this.themes[themeIndex]
    },
    themes: ["light", "night"],
    nextTheme () {
        themeIndex += 1
        if (themeIndex === this.themes.length) {
            themeIndex = 0
        }
        return this.themes[themeIndex]
    }
}
