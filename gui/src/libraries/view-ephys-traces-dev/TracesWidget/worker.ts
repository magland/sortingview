import { Opts, SortingUnits, SpikeMarkerLocation, TracesDataChunk } from "./WorkerTypes";

let canvas: HTMLCanvasElement | undefined = undefined
let opts: Opts | undefined = undefined
let tracesDataChunks: {[index: number]: TracesDataChunk} = {}
let sortingUnits: SortingUnits | undefined = undefined

onmessage = function (evt) {
    if (evt.data.canvas) {
        canvas = evt.data.canvas
        drawDebounced()
    }
    if (evt.data.opts) {
        opts = evt.data.opts
        drawDebounced()
    }
    if (evt.data.tracesDataChunk) {
        const chunk: TracesDataChunk = evt.data.tracesDataChunk
        tracesDataChunks[chunk.chunkIndex] = chunk
        drawDebounced()
    }
    if (evt.data.sortingUnits) {
        sortingUnits = evt.data.sortingUnits
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

    const {margins, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, channels, samplingFrequency, chunkSizeInFrames} = opts
    const numChannels = channels.length

    // this is important because main thread no longer has control of canvas (it seems)
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const canvasContext = canvas.getContext("2d")
    if (!canvasContext) return
    drawCode += 1
    const thisDrawCode = drawCode

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)

    if (opts.zoomInRequired) {
        canvasContext.fillStyle = 'pink'
        canvasContext.textAlign = 'center'
        canvasContext.font = 'bold 26px Arial'
        canvasContext.fillText('Zoom in to view traces', canvasWidth / 2, canvasHeight / 2)
    }

    const channelIndexToY = (channelIndex: number) => (
        canvasHeight - margins.bottom - ((channelIndex + 0.5) - 0) / (numChannels - 0) * (canvasHeight - margins.top - margins.bottom)
    )

    const frameIndexToX = (frameIndex: number) => (
        margins.left + (frameIndex / samplingFrequency - visibleStartTimeSec) / (visibleEndTimeSec - visibleStartTimeSec) * (canvasWidth - margins.left - margins.right)
    )

    const drawUnitMarkers = (o: {top?: boolean, channelLocation?: boolean}) => {
        if (!sortingUnits) return
        if (!opts) return

        const spikeMarkerLocations: SpikeMarkerLocation[] = []
        for (let unit of sortingUnits.units) {
            let startAngle = 0
            let endAngle = 2 * Math.PI

            let arc = (unit.unitId + '').startsWith('A') ? 'top' : (unit.unitId + '').startsWith('B') ? 'bottom' : 'both'

            if (arc === 'top') {
                startAngle = Math.PI
                endAngle = 2 * Math.PI
            }
            else if (arc === 'bottom') {
                startAngle = 0
                endAngle = Math.PI
            }

            canvasContext.strokeStyle = unit.color
            let y0: number | undefined = undefined
            if (unit.peakChannelId !== undefined) {
                const channelIndex = opts.channels.map(c => (c.channelId)).indexOf(unit.peakChannelId)
                if (channelIndex >= 0) {
                    y0 = channelIndexToY(channelIndex)
                }
            }
            for (let ff of unit.spikeFrames) {
                const x0 = frameIndexToX(ff)
                if (o.top) {
                    canvasContext.lineWidth = 1
                    canvasContext.beginPath()
                    canvasContext.moveTo(x0, 0)
                    canvasContext.lineTo(x0, margins.top)
                    canvasContext.stroke()
                }

                if (o.channelLocation) {
                    if (y0 !== undefined) {
                        canvasContext.lineWidth = 3
                        let radius = 6
                        canvasContext.beginPath()
                        canvasContext.ellipse(x0, y0, 6, 6, 0, startAngle, endAngle, false)
                        canvasContext.stroke()
                        spikeMarkerLocations.push({
                            rect: arc === 'top' ? {x: x0 - radius, y: y0 - radius, w: radius * 2, h: radius} : arc === 'bottom' ? {x: x0 - radius, y: y0, w: radius * 2, h: radius} : {x: x0 - radius, y: y0 - radius, w: radius * 2, h: radius * 2},
                            unitId: unit.unitId
                        })
                    }
                }
            }
        }
        postMessage({spikeMarkerLocations})
        canvasContext.lineWidth = 1
    }

    drawUnitMarkers({top: true, channelLocation: true})

    canvasContext.save()
    canvasContext.beginPath()
    canvasContext.rect(margins.left, margins.top, canvasWidth - margins.left - margins.right, canvasHeight - margins.top - margins.bottom)
    canvasContext.clip()

    const i1 = Math.floor(visibleStartTimeSec * samplingFrequency / chunkSizeInFrames)
    const i2 = Math.ceil(visibleEndTimeSec * samplingFrequency / chunkSizeInFrames)
    let timer = Date.now()
    const interleavedOrdering = createInterleavedOrdering(numChannels)
    for (const interleave of interleavedOrdering) {
        const channelIndex = interleave.index
        if (thisDrawCode !== drawCode) return
        let lastChunkIndexDrawn = -99
        if (opts.mode === 'traces') {
            canvasContext.strokeStyle = 'black'
            canvasContext.beginPath()
        }
        for (let chunkIndex = i1; chunkIndex <= i2; chunkIndex++) {
            const chunk = tracesDataChunks[chunkIndex]
            if (chunk) {
                const channelPixelHeight = channelIndexToY(0) - channelIndexToY(1)

                const chunkStartFrame = chunkIndex * chunkSizeInFrames
                const chunkEndFrame = (chunkIndex + 1) * chunkSizeInFrames

                const dd = chunk.data[channelIndex]
                const chan = channels[channelIndex]

                if (opts.mode === 'traces') {
                    const y0 = channelIndexToY(channelIndex)
                    for (let ff = chunkStartFrame; ff < chunkEndFrame; ff++) {
                        const x0 = frameIndexToX(ff)
                        const y1 = y0 - (dd[ff - chunkStartFrame] - chan.offset) * channelPixelHeight / 2 * opts.amplitudeScaleFactor * chan.scale
                        if ((ff === chunkStartFrame) && (chunkIndex !== lastChunkIndexDrawn + 1)) {
                            canvasContext.moveTo(x0, y1)
                        }
                        else {
                            canvasContext.lineTo(x0, y1)
                        }
                    }
                }
                else if (opts.mode === 'heatmap') {
                    const y1 = channelIndexToY(channelIndex + interleave.increment - 0.5)
                    const y2 = channelIndexToY(channelIndex - 0.5)
                    for (let ff = chunkStartFrame; ff < chunkEndFrame; ff++) {
                        const x1 = frameIndexToX(ff)
                        const x2 = frameIndexToX(ff + 1)
                        const val = (dd[ff - chunkStartFrame] - chan.offset) * opts.amplitudeScaleFactor * chan.scale
                        canvasContext.fillStyle = val2color(val)
                        canvasContext.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1)
                    }
                }
                lastChunkIndexDrawn = chunkIndex
            }
        } // chunks
        if (opts.mode === 'traces') {
            canvasContext.stroke()
        }
        const elapsed = Date.now() - timer
        if (elapsed > 200) {
            timer = Date.now()
            await sleepMsec(0)
        }
    } // channels
    canvasContext.restore()

    drawUnitMarkers({channelLocation: true})
}

const drawDebounced = debounce(draw, 100)

function sleepMsec(msec: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, msec)
    })
}

function val2color(v: number) {
    const g = Math.min(255, Math.max(0, 128 + v * 128))
    return `rgb(${g},${g},${g})`
}

const createInterleavedOrdering = (num: number) => {
    const ret: {index: number, increment: number}[] = []
    const used = new Set<number>()
    for (const increment of [256, 128, 64, 32, 16, 8, 4, 2, 1]) {
        for (let i = 0; i < num; i += increment) {
            if (!used.has(i)) {
                ret.push({index: i, increment})
                used.add(i)
            }
        }
    }
    return ret
}

// export { }