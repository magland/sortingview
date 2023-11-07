export type Run = {
    start: number,
    end?: number
}
export type TimeColumn = Map<number, Run[]>

const argsort = (ary: number[], offset?: number): number[] => {
    const decorated = ary.map((v, i) => [v, i])
    const sorted = decorated.sort((a, b) => a[0] - b[0])
    const indices = sorted.map((i) => i[1] + (offset ?? 0))
    return indices
}

const openRun = (valueRects: Map<number, Run[]>, value: number, position: number) => {
    const run = valueRects.get(value)
    if (run === undefined) throw Error(`Attempted to open a run with value ${value} but that key did not exist. Shouldn't happen.`)
    // if we don't have an open run with that value, push a new one
    if (run.length === 0 || run.at(-1)?.end !== undefined) {
        run.push({start: position})
    }
}

const closeRuns = (valueRects: Map<number, Run[]>, closingPosition: number, closeAboveThisNumber?: number) => {
    const start = closeAboveThisNumber ?? 0
    for (const [keyvalue, runs] of valueRects) {
        if (keyvalue <= start || runs.length === 0) continue
        const r = runs.at(-1)
        if (r === undefined || r.end !== undefined) continue // first part can't happen, we checked against length === 0
        r.end = closingPosition
    }
}

// The data are very sparse, so we can use a set-of-runs representation effectively.
// Ideally we'd be able to use these directly as vector graphics, but this winds up being very
// challenging to integrate into the (canvas-based) TimeScrollView, and we can't use a full-resolution
// Canvas (even offscreen) because it'll be represented as bitmap and blow up the memory usage.
// Note: tried an all-for-loops version of this but it actually performed about 20% worse. (shrug.)
export const convertToOverlappingRectangles = (values: number[], positions: number[], times: number[]): TimeColumn[] => {
    const results: TimeColumn[] = []
    let dataIndex = 0
    times.forEach((t) => {
        const rangeValues = new Set(values.slice(dataIndex, dataIndex + t))
        const valueRuns = new Map<number, Run[]>([...rangeValues].map(v => [v, []]))
        const indices = argsort(positions.slice(dataIndex, dataIndex + t), dataIndex)
        let lastPosition = -1
        let lastValue = 0
        indices.forEach(i => {
            const p = positions[i]
            const v = values[i]
            if( p !== lastPosition + 1) {
                // close out all open runs
                // Open a new run with the current value
                closeRuns(valueRuns, lastPosition + 1)
                openRun(valueRuns, v, p)
            } else {
                if (v !== lastValue) {
                    // start a run with value() if it isn't already going
                    openRun(valueRuns, v, p)
                    if (v < lastValue) {
                        // value went down! Close out any run with a value in (v, lastValue]
                        closeRuns(valueRuns, p, v)
                    }
                }
                // if v === lastValue, don't need to do anything: just continue our current runs
            }
            lastPosition = p
            lastValue = v
        })
        closeRuns(valueRuns, lastPosition + 1)
        results.push(valueRuns)
        dataIndex += t
    })
    return results
}


// // For debugging
// const mapTimeColumnToString = (x: TimeColumn) => {
//     const strs: string[] = []
//     if (x === undefined) return ""
//     x.forEach((value, key, map) => {
//         strs.push(`\t${key}`)
//         const thisStr: string[] = []
//         value.forEach(r => {
//             thisStr.push(`${r.start} - ${r.end}`)
//         })
//         strs.push(thisStr.join(', '))
//     })
//     return strs.join('\n')
// }
