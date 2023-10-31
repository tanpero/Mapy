const insert = (dest, target) => target.insertAdjacentElement("beforeBegin", dest)

const swapView = (el1, el2) => {
    const medium = document.createElement("label")
    insert(medium, el2)
    insert(el2, el1)
    insert(el1, medium)
    document.body.removeChild(medium)
}

module.exports = { swapView }
