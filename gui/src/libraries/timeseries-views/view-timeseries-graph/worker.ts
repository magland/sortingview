import { Opts, ResolvedSeries } from "./WorkerTypes";

let canvas: HTMLCanvasElement | undefined = undefined
let opts: Opts | undefined = undefined
let resolvedSeries: ResolvedSeries[] | undefined = undefined
let plotSeries: PlotSeries[] | undefined = undefined

onmessage = function (evt) {
    if (evt.data.canvas) {
        canvas = evt.data.canvas
        drawDebounced()
    }
    if (evt.data.opts) {
        opts = evt.data.opts
        drawDebounced()
    }
    if (evt.data.resolvedSeries) {
        resolvedSeries = evt.data.resolvedSeries
        drawDebounced()
    }
}

function debounce(f: () => void, msec: number) {
    let scheduled = false
    return () => {
        if (scheduled) return
        scheduled = true
        setTimeout(() => {
            scheduled = false
            f()
        }, msec)
    }
}

let drawCode = 0
async function draw() {
    if (!canvas) return
    if (!opts) return
    if (!resolvedSeries) return

    const {margins, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, minValue, maxValue} = opts

    // this is important because main thread no longer has control of canvas (it seems)
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const canvasContext = canvas.getContext("2d")
    if (!canvasContext) return
    drawCode += 1
    const thisDrawCode = drawCode

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const pass of (plotSeries ? [1, 2] : [1])) {
        if (thisDrawCode !== drawCode) return

        const timer = Date.now()
        if ((pass === 2) || (!plotSeries)) {
            plotSeries = computePlotSeries(resolvedSeries)
        }
        const coordToPixel = (p: {x: number, y: number}): {x: number, y: number} => {
            return {
                x: margins.left + (p.x - visibleStartTimeSec) / (visibleEndTimeSec - visibleStartTimeSec) * (canvasWidth - margins.left - margins.right),
                y: canvasHeight - margins.bottom - (p.y - minValue) / (maxValue - minValue) * (canvasHeight - margins.top - margins.bottom)
            }
        }
        
        const pixelZero = coordToPixel({x: 0, y: 0}).y
        const pixelData = plotSeries.map((s, i) => {
            return {
                dimensionIndex: i,
                dimensionLabel: `${i}`,
                pixelTimes: s.times.map(t => coordToPixel({x: t, y: 0}).x),
                pixelValues: s.type === 'interval' ? s.values : s.values.map(y => coordToPixel({x: 0, y}).y),
                type: s.type,
                attributes: s.attributes
            }
        })
        const panelProps: PanelProps = {
            pixelZero: pixelZero,
            dimensions: pixelData
        }
        paintPanel(canvasContext, panelProps)
        
        // the wait time is equal to the render time
        const elapsed = Date.now() - timer
        await sleepMsec(elapsed)
    }
}

const drawDebounced = debounce(draw, 10)

const paintLegend = (context: CanvasRenderingContext2D) => {
    if (!opts) return
    if (opts.hideLegend) return
    if (!resolvedSeries) return
    const { legendOpts, margins, canvasWidth } = opts
    const seriesToInclude = resolvedSeries.filter(s => (s.title)).filter(s => (s.type !== 'interval'))
    if (seriesToInclude.length === 0) return
    const { location } = legendOpts
    const entryHeight = 18
    const entryFontSize = 12
    const symbolWidth = 50
    const legendWidth = 200
    const margin = 10
    const legendHeight = 20 + seriesToInclude.length * entryHeight
    const R = location === 'northwest' ? { x: margins.left + 20, y: margins.top + 20, w: legendWidth, h: legendHeight } :
        location === 'northeast' ? { x: canvasWidth - margins.right - legendWidth - 20, y: margins.top + 20, w: legendWidth, h: legendHeight } : undefined
    if (!R) return //unexpected
    context.fillStyle = 'white'
    context.strokeStyle = 'gray'
    context.lineWidth = 1.5
    context.fillRect(R.x, R.y, R.w, R.h)
    context.strokeRect(R.x, R.y, R.w, R.h)

    seriesToInclude.forEach((s, i) => {
        const y0 = R.y + margin + i * entryHeight
        const symbolRect = { x: R.x + margin, y: y0, w: symbolWidth, h: entryHeight }
        const titleRect = { x: R.x + margin + symbolWidth + margin, y: y0, w: legendWidth - margin - margin - symbolWidth - margin, h: entryHeight }
        const title = s.title || 'untitled'
        context.fillStyle = 'black'
        context.font = `${entryFontSize}px Arial`
        context.fillText(title, titleRect.x, titleRect.y + titleRect.h / 2 + entryFontSize / 2)
        if (s.type === 'line') {
            applyLineAttributes(context, s.attributes)
            context.beginPath()
            context.moveTo(symbolRect.x, symbolRect.y + symbolRect.h / 2)
            context.lineTo(symbolRect.x + symbolRect.w, symbolRect.y + symbolRect.h / 2)
            context.stroke()
            context.setLineDash([])
        }
        else if (s.type === 'marker') {
            applyMarkerAttributes(context, s.attributes)
            const radius = entryHeight * 0.3
            const shape = s.attributes['shape'] ?? 'circle'
            const center = { x: symbolRect.x + symbolRect.w / 2, y: symbolRect.y + symbolRect.h / 2 }
            if (shape === 'circle') {
                context.beginPath()
                context.ellipse(center.x, center.y, radius, radius, 0, 0, 2 * Math.PI)
                context.fill()
            }
            else if (shape === 'square') {
                context.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2)
            }
        }
    })
}

type PanelProps = {
    pixelZero: number
    dimensions: {
        dimensionIndex: number
        dimensionLabel: string
        pixelTimes: number[]
        pixelValues: number[]
        type: string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attributes: {[key: string]: any}
    }[]
}

const paintPanel = (context: CanvasRenderingContext2D, props: PanelProps) => {
    if (!opts) return
    const { margins, canvasWidth, canvasHeight } = opts

    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.save()
    context.beginPath()
    context.rect(margins.left, margins.top, canvasWidth - margins.left - margins.right, canvasHeight - margins.top - margins.bottom)
    context.clip()

    // don't display dashed zero line (Eric's request)
    // context.strokeStyle = 'black'
    // context.setLineDash([5, 15]);
    // context.lineWidth = 1
    // context.beginPath()
    // context.moveTo(0, props.pixelZero)
    // context.lineTo(panelWidth, props.pixelZero)
    // context.stroke()
    // context.setLineDash([]);

    // eslint-disable-next-line react/prop-types
    props.dimensions.forEach(dim => {
        if (dim.type === 'line') {
            applyLineAttributes(context, dim.attributes)
            context.beginPath()
            dim.pixelTimes.forEach((x, ii) => {
                const y = dim.pixelValues[ii]
                ii === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
            })
            context.stroke()
            context.setLineDash([])
        }
        else if (dim.type === 'marker') {
            applyMarkerAttributes(context, dim.attributes)
            const radius = dim.attributes['radius'] ?? 2
            const shape = dim.attributes['shape'] ?? 'circle'
            if (shape === 'circle') {
                dim.pixelTimes.forEach((t, ii) => {
                    context.beginPath()
                    context.ellipse(t, dim.pixelValues[ii], radius, radius, 0, 0, 2 * Math.PI)
                    context.fill()
                })
            }
            else if (shape === 'square') {
                dim.pixelTimes.forEach((t, ii) => {
                    context.fillRect(t - radius, dim.pixelValues[ii] - radius, radius * 2, radius * 2)
                })
            }
        }
        else if (dim.type === 'interval') {
            applyLineAttributes(context, dim.attributes)
            applyMarkerAttributes(context, dim.attributes)
            for (let i = 0; i < dim.pixelTimes.length - 1; i ++) {
                if (dim.pixelValues[i] === 0) {
                    const tStart = dim.pixelTimes[i]
                    const tEnd = dim.pixelTimes[i + 1]
                    context.fillRect(tStart, margins.top, tEnd - tStart, canvasHeight - margins.top - margins.bottom - 1)
                }
            }
        }
    })

    paintLegend(context)

    context.restore()
}

type PlotSeries = {type: string, times: number[], values: number[], attributes: {[key: string]: any}}

const computePlotSeries = (resolvedSeries: ResolvedSeries[]): PlotSeries[] => {
    const plotSeries: PlotSeries[] = []

    if (!opts) return plotSeries
    const {visibleStartTimeSec, visibleEndTimeSec} = opts

    if ((visibleStartTimeSec === undefined) || (visibleEndTimeSec === undefined)) {
        return plotSeries
    }
    resolvedSeries.forEach(rs => {
        const tt = rs.t
        const yy = rs.y
        let filteredTimeIndices: number[] = tt.flatMap((t: number, ii: number) => (visibleStartTimeSec <= t) && (t <= visibleEndTimeSec) ? ii : [])

        // need to prepend an index before and append an index after so that lines get rendered properly
        if ((filteredTimeIndices[0] || 0) > 0) {
            filteredTimeIndices = [filteredTimeIndices[0] - 1, ...filteredTimeIndices]
        }
        if ((filteredTimeIndices[filteredTimeIndices.length - 1] || tt.length) < tt.length - 1) {
            filteredTimeIndices.push(filteredTimeIndices[filteredTimeIndices.length - 1] + 1)
        }
        ////////////////////////////////////////////////////////////////////////////////

        const filteredTimes = filteredTimeIndices.map(i => tt[i])
        const filteredValues = filteredTimeIndices.map(index => yy[index])
        plotSeries.push({
            type: rs.type,
            times: filteredTimes,
            values: filteredValues,
            attributes: rs.attributes
        })
    })
    return plotSeries
}

const applyLineAttributes = (context: CanvasRenderingContext2D, attributes: any) => {
    context.strokeStyle = attributes['color'] ?? 'black'
    context.lineWidth = attributes['width'] ?? 1.1 // 1.1 hack--but fixes the 'disappearing lines' issue
    attributes['dash'] && context.setLineDash(attributes['dash'])
}

const applyMarkerAttributes = (context: CanvasRenderingContext2D, attributes: any) => {
    context.fillStyle = attributes['color'] ?? 'black'
}

function sleepMsec(msec: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, msec)
    })
}

// export { }