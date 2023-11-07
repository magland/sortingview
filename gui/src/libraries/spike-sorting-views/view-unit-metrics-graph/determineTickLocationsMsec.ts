const determineTickLocationsMsec = (xMin: number, xMax: number): number[] => {
    const xSpan = xMax - xMin
    let interval: number
    if (xSpan <= 30) interval = 10
    else if (xSpan <= 120) interval = 20
    else if (xSpan <= 300) interval = 50
    else if (xSpan <= 600) interval = 100
    else if (xSpan <= 1000) interval = 150
    else interval = 100
    const ret: number[] = []
    let a = Math.ceil(xMin / interval)
    while (a * interval <= xMax) {
        ret.push(a * interval)
        a ++
    }
    return ret
}

export default determineTickLocationsMsec