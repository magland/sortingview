import { Opts, TracesData } from "./WorkerTypes";

let canvas: HTMLCanvasElement | undefined = undefined
let opts: Opts | undefined = undefined
let tracesData: TracesData | undefined = undefined

onmessage = function (evt) {
    if (evt.data.canvas) {
        canvas = evt.data.canvas
        drawDebounced()
    }
    if (evt.data.opts) {
        opts = evt.data.opts
        drawDebounced()
    }
    if (evt.data.tracesData) {
        tracesData = evt.data.tracesData
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

const amplitudeScale = 1

let drawCode = 0
async function draw() {
    if (!canvas) return
    if (!opts) return

    const {margins, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, channels, samplingFrequency} = opts
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

    if (!tracesData) return

    canvasContext.save()
    canvasContext.beginPath()
    canvasContext.rect(margins.left, margins.top, canvasWidth - margins.left - margins.right, canvasHeight - margins.top - margins.bottom)
    canvasContext.clip()

    const channelIndexToY = (channelIndex: number) => (
        canvasHeight - margins.bottom - ((channelIndex + 0.5) - 0) / (numChannels - 0) * (canvasHeight - margins.top - margins.bottom)
    )

    const frameIndexToX = (frameIndex: number) => (
        margins.left + (frameIndex / samplingFrequency - visibleStartTimeSec) / (visibleEndTimeSec - visibleStartTimeSec) * (canvasWidth - margins.left - margins.right)
    )

    const channelPixelHeight = channelIndexToY(1) - channelIndexToY(0)

    let timer = Date.now()
    for (let i = 0; i < numChannels; i++) {
        if (thisDrawCode !== drawCode) return

        const dd = tracesData.data[i]
        if (!dd) continue

        const chan = channels[i]

        const y0 = channelIndexToY(i)
        canvasContext.strokeStyle = 'black'
        canvasContext.beginPath()
        for (let ff = tracesData.startFrame; ff < tracesData.endFrame; ff++) {
            const x0 = frameIndexToX(ff)
            const y1 = y0 - (dd[ff - tracesData.startFrame] - chan.offset) * channelPixelHeight / 2 * amplitudeScale * chan.scale
            if (ff === tracesData.startFrame) {
                canvasContext.moveTo(x0, y1)
            }
            else {
                canvasContext.lineTo(x0, y1)
            }
        }
        canvasContext.stroke()

        const elapsed = Date.now() - timer
        if (elapsed > 100) {
            timer = Date.now()
            await sleepMsec(0)
        }
    }
}

const drawDebounced = debounce(draw, 10)

function sleepMsec(msec: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, msec)
    })
}

// export { }