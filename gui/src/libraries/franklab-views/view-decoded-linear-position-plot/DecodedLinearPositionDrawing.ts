import { useCallback, useMemo, useRef } from 'react'
import { DownsampledData } from './DecodedLinearPositionDownsampling'

export const usePositions = (maxOffscreenCanvasHeight: number, positionsKey: number[]) => {
    return useMemo(() => {
        const halfBinWidth = positionsKey[0] // bin coordinates are actually the *midpoint* of the range
        // Note that bin widths can actually vary by segment, and the first bin need not always start from 0...
        // but we're going to not worry about that for right now.
        const lastPosition = (positionsKey.at(-1) ?? halfBinWidth) + halfBinWidth
        const vscale = Math.floor(maxOffscreenCanvasHeight/lastPosition)
        const pixelHalfBinWidth = halfBinWidth * vscale
        const canvasPositions = positionsKey.map(n => (vscale * n ) - pixelHalfBinWidth)
        const targetHeight = Math.ceil(vscale * lastPosition)
        return { canvasPositions, pixelBinWidth: pixelHalfBinWidth * 2, targetHeight }
    }, [positionsKey, maxOffscreenCanvasHeight])
}


export type OffscreenRenderProps = {
    canvas: HTMLCanvasElement | undefined
    canvasTargetWidth: number
    canvasTargetHeight: number
    painter: OffscreenPainter
    sampledData: DownsampledData
    scale: number
    downsampledRangeStart: number
    downsampledRangeEnd: number
    downsampledRangeMax: number
}
// Given a Canvas with stuff drawn on it and a data set, and a desired range of data from the data set,
// return the x-coordinate pixel range in the offscreen canvas that contains the requested data range.
export const useOffscreenCanvasRange = (props: OffscreenRenderProps): [number, number] => {
    const contentsStart = useRef<number>(0)
    const contentsEnd = useRef<number>(0)
    const currentScale = useRef<number>(0)
    const currentPainter = useRef<OffscreenPainter>()
    const { canvas, canvasTargetWidth, canvasTargetHeight, painter, scale, sampledData, downsampledRangeStart, downsampledRangeEnd, downsampledRangeMax } = props

    if (canvas === undefined) return [0, 0]

    // Checking this on a useEffect hook was not responsive enough--it wasn't updating until the *second* rerender.
    if (scale !== currentScale.current) {
        currentScale.current = scale
        contentsStart.current = 0
        contentsEnd.current = 0
    }

    // If we change the styling, we have to invalidate the whole offscreen canvas cache,
    // or else the image won't respond to the controls.
    if (currentPainter.current !== painter) {
        contentsStart.current = 0
        contentsEnd.current = 0
        currentPainter.current = painter
    }

    // NOTE: React wants to resize this canvas on every soft reload. I don't expect it to be a problem generally, but
    // when it does happen we need to invalidate the cache since the canvas contents get cleared by the resize.
    if ((canvas.width !== canvasTargetWidth || canvas.height !== canvasTargetHeight)) {
        canvas.width = canvasTargetWidth
        canvas.height = canvasTargetHeight
        contentsStart.current = 0
        contentsEnd.current = 0
    }

    console.assert(contentsStart.current <= contentsEnd.current)
    if ((Math.min(downsampledRangeEnd, downsampledRangeMax) - downsampledRangeStart) > (canvas.width)) {
        throw Error(`Impossible situation: requested window ${downsampledRangeStart}-${downsampledRangeEnd} does not fit in canvas width ${canvas.width} as allowed by current scale factor ${scale}`)
    }

    // Request can be served from cache--do so
    if (contentsStart.current <= downsampledRangeStart && downsampledRangeEnd <= contentsEnd.current) {
        const pixelStart = (downsampledRangeStart - contentsStart.current)
        const pixelEnd = (downsampledRangeEnd - contentsStart.current)
        return [pixelStart, pixelEnd]
    }

    // Request cannot be served from cache.
    const visibleRangeMidpoint = Math.floor((downsampledRangeEnd - downsampledRangeStart)/2) + downsampledRangeStart
    const {targetStart, targetEnd} = getRenderTargetRange(visibleRangeMidpoint, sampledData.downsampledTimes.length - 1, canvas.width)

    // note: theoretically this could be separate and handled asynchronously by a worker thread
    updateCachedImage(targetStart, targetEnd, contentsStart.current, contentsEnd.current, painter, sampledData, canvas)

    contentsStart.current = targetStart
    contentsEnd.current = targetEnd

    return [downsampledRangeStart - contentsStart.current, downsampledRangeEnd - contentsStart.current]
}


const updateCachedImage = (targetStart: number, targetEnd: number, currentStart: number, currentEnd: number, painter: OffscreenPainter, sampledData: DownsampledData, canvas: HTMLCanvasElement) => {
    const c = canvas.getContext('2d')
    if (!c) {
        console.warn(`Problem getting drawing context for offscreen canvas.`)
        return
    }

    if (targetStart >= currentEnd || targetEnd <= currentStart) {
        painter(targetStart, targetEnd - targetStart, 0, sampledData, c)
    } else {
        const uncopyableLeftWidth = Math.max(0, currentStart - targetStart)
        const copyRange = [Math.max(targetStart, currentStart), Math.min(targetEnd, currentEnd)]
        if (copyRange[0] === copyRange[1]) {
            console.warn(`Should not reach this branch: if there's nothing to copy we should've replaced the full cache.`)
        }
        const copyWidth = 1 + copyRange[1] - copyRange[0]
        const uncopyableRightWidth = Math.max(0, targetEnd - currentEnd)
        // The copy has to happen first, or we'll start overwriting the data we want to keep.
        if (copyRange[0] < copyRange[1]) {
            const copyStart = copyRange[0] - currentStart
            const copyTarget = uncopyableLeftWidth
            c.drawImage(canvas, copyStart, 0, copyWidth, canvas.height, copyTarget, 0, copyWidth, canvas.height)
        }
        if (uncopyableLeftWidth > 0) {
            painter(targetStart, uncopyableLeftWidth, 0, sampledData, c)
        }
        if (uncopyableRightWidth > 0) {
            painter(targetEnd - uncopyableRightWidth, uncopyableRightWidth, canvas.width - uncopyableRightWidth - 1, sampledData, c)
        }
    }
}

type OffscreenPainter = (startInclusive: number, width: number, pixelXOffset: number, sampleData: DownsampledData, c: CanvasRenderingContext2D) => void
export const useOffscreenPainter = (styles: string[], height: number, binWidth: number, myPositions: number[]) => {
    const drawTimeIndex = useCallback((data: DownsampledData, firstDataIndex: number, timeIndex: number, xPosition: number, c: CanvasRenderingContext2D) => {
        const lastIndex = firstDataIndex + data.downsampledTimes[timeIndex]
        for (let dataIndex = firstDataIndex; dataIndex < lastIndex; dataIndex++) {
            const position = data.downsampledPositions[dataIndex]
            const value = data.downsampledValues[dataIndex]
            c.strokeStyle = styles[value]
            c.beginPath()
            const startPixel = myPositions[position]
            const endPixel = startPixel + binWidth
            c.moveTo(xPosition, height - startPixel)
            c.lineTo(xPosition, height - endPixel)
            c.stroke()
        }
    }, [styles, height, myPositions, binWidth])

    const clearRect = useCallback((width: number, pixelOffset: number, c: CanvasRenderingContext2D) => {
        c.fillStyle = styles[0]
        c.fillRect(pixelOffset, 0, width, height)
    }, [styles, height])

    const offscreenPainter = useCallback((startInclusive: number, width: number, pixelXOffset: number, sampledData: DownsampledData, c: CanvasRenderingContext2D) => {
        if (startInclusive + width >= sampledData.downsampledTimes.length) {
            console.warn(`offscreenPainter called with end (${startInclusive + width} ${startInclusive} ${width}) outside the data range (${sampledData.downsampledTimes.length}).`)
            return
        }
        clearRect(width, pixelXOffset, c)
        let dataIndex = 0
        for (let timeIndex = 0; timeIndex < startInclusive; timeIndex++) {
            dataIndex += sampledData.downsampledTimes[timeIndex]
        }

        for (let timeIndex = startInclusive; timeIndex < startInclusive + width; timeIndex++) {
            const xPosition = timeIndex - startInclusive + pixelXOffset
            drawTimeIndex(sampledData, dataIndex, timeIndex, xPosition, c)
            dataIndex += sampledData.downsampledTimes[timeIndex]
        }
    }, [clearRect, drawTimeIndex])

    return offscreenPainter
}


// TODO: Harmonize with other implementations of this
const getRenderTargetRange = (midpoint: number, dataWidth: number, canvasWidth: number) => {
    // if all the data fits on the canvas, no need to clip anything
    // (Remember canvas widths are NOT inclusive of 0, while the returned value here WILL be.)
    if (canvasWidth > dataWidth) return {targetStart: 0, targetEnd: dataWidth}
    const halfCanvasWidth = canvasWidth / 2
    if (midpoint <= halfCanvasWidth) {
        return {targetStart: 0, targetEnd: canvasWidth - 1}
    }
    if ((midpoint + halfCanvasWidth) > dataWidth) { // hard > b/c we used a floor
        return {targetStart: dataWidth - canvasWidth + 1, targetEnd: dataWidth}
    }
    // entire canvas width will not run out the data width; just return either side of the midpoint
    const targetStart = Math.ceil(midpoint - halfCanvasWidth)
    const targetEnd = Math.floor(midpoint + halfCanvasWidth) - 1
    return { targetStart, targetEnd }
}
