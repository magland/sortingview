export type AxisTick = {
    value: number
    label: string
}
const getAxisTicks = (min: number, max: number): {minorTicks: AxisTick[], majorTicks: AxisTick[]} => {
    const span = max - min
    if (span <= 0) return {minorTicks: [], majorTicks: []}
    let factor1 = 1
    while (span * factor1 < 10) {
        factor1 *= 10
    }
    while (span * factor1 > 100) {
        factor1 /= 10
    }
    // now span * factor1 should be between 10 and 100
    const span2 = span * factor1
    let minorStep2, majorStep2
    if (span2 >= 50) {
        majorStep2 = 20
        minorStep2 = 10
    }
    else if (span2 >= 20) {
        majorStep2 = 10
        minorStep2 = 5
    }
    else if (span2 >= 10) {
        majorStep2 = 5
        minorStep2 = 1
    }
    else throw Error('Unexpected')
    const min2 = min * factor1
    const max2 = max * factor1
    const majorValues2: number[] = []
    const minorValues2: number[] = []
    
    for (let majorIndex = Math.ceil(min2 / majorStep2); majorIndex <= Math.floor(max2 / majorStep2); majorIndex ++) {
        majorValues2.push(majorIndex * majorStep2)
    }
    for (let minorIndex = Math.ceil(min2 / minorStep2); minorIndex <= Math.floor(max2 / minorStep2); minorIndex ++) {
        if (!hasValue(majorValues2, minorIndex * minorStep2)) {
            minorValues2.push(minorIndex * minorStep2)
        }
    }
    const majorTicks: AxisTick[] = majorValues2.map(x => ({
        value: x / factor1,
        label: `${x / factor1}`
    }))
    const minorTicks: AxisTick[] = minorValues2.map(x => ({
        value: x / factor1,
        label: `${x / factor1}`
    }))
    return {majorTicks, minorTicks}
}

const hasValue = (x: number[], y: number) => {
    for (let a of x) {
        if (Math.abs(a - y) < 0.001) return true
    }
    return false
}

export default getAxisTicks