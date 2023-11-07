import { Checkbox } from '@material-ui/core'
import { DefaultToolbarWidth, TimeScrollView, TimeScrollViewPanel, usePanelDimensions, useTimeseriesMargins } from '../timeseries-views'
import { useTimeseriesSelectionInitialization, useTimeRange } from '../timeseries-views'
import { useFetchCache } from '../core-utils'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { TimeseriesLayoutOpts } from 'View'

export type FetchSegmentQuery = {
    type: 'fetchSegment'
    segmentNumber: number
    segmentSize: number
    downsampleFactor: number
}

type Props = {
    fetchSegment: (query: FetchSegmentQuery) => Promise<number[][]>
    startTimeSec: number
    endTimeSec: number
    samplingFrequency: number
    numPositions: number
    linearPositions?: number[]
    segmentSize: number
    multiscaleFactor: number
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

type PanelProps = {
    offscreenCanvas?: HTMLCanvasElement
}

const panelSpacing = 4

const usePositionPdfDataModel = (fetchSegment: (q: FetchSegmentQuery) => Promise<number[][]>, numPositions: number, segmentSize: number) => {
    const fetchSegmentCache = useFetchCache<FetchSegmentQuery, number[][]>(fetchSegment)
    // The fetch cache cannot be memoized, because the 'get' depends on the state.
    // Thus it is updated every time the cache updates, including asynchronously.
    // Alternative: consider reworking this hook to A) be able to answer subset queries without
    // triggering a new query (e.g. if we have range (60, 120), we can return range (60, 100) at
    // the same downsample level without a new query) and B) using a callback to populate the
    // data rather than returning a function that returns the data (so that there won't be a need
    // to use a lookup-function update as the trigger for a rerender/data refresh).
    const get = useCallback((i1: number, i2: number, downsampleFactor: number) => {
        const s1 = Math.floor(i1 / segmentSize)
        const s2 = Math.ceil(i2 / segmentSize)
        const ret = allocate2d(i2 - i1, numPositions, undefined)
        for (let s = s1; s < s2; s++) {
            const S = fetchSegmentCache.get({type: 'fetchSegment', segmentNumber: s, segmentSize, downsampleFactor})
            if (S) {
                for (let i = 0; i < S.length; i++) {
                    const j = s * segmentSize - i1 + i
                    if ((0 <= j) && (j < i2 - i1)) {
                        for (let p = 0; p < numPositions; p++) {
                            ret[j][p] = S[i][p]
                        }
                    }
                }
            }
        }
        return ret
    }, [fetchSegmentCache, numPositions, segmentSize])
    return useMemo(() => ({ get }), [get])
}

const emptyPanelSelection = new Set<string | number>()

const PositionPdfPlotWidget: FunctionComponent<Props> = ({fetchSegment, startTimeSec, endTimeSec, samplingFrequency, numPositions, linearPositions, segmentSize, multiscaleFactor, timeseriesLayoutOpts, width, height}) => {
    useTimeseriesSelectionInitialization(startTimeSec, endTimeSec)
    const { visibleStartTimeSec, visibleEndTimeSec } = useTimeRange()
    const numTimepoints = Math.floor((endTimeSec - startTimeSec) * samplingFrequency)
    const dataModel = usePositionPdfDataModel(fetchSegment, numPositions, segmentSize)
    const [showLinearPositionsOverlay, setShowLinearPositionsOverlay] = useState<boolean>(false)
    
    const rangeStartSample = useMemo(() => {
        return visibleStartTimeSec === undefined ? 0 : Math.max(0, Math.floor(visibleStartTimeSec - startTimeSec) * samplingFrequency)
    }, [visibleStartTimeSec, startTimeSec, samplingFrequency])
    const rangeEndSample = useMemo(() => {
        return visibleEndTimeSec === undefined ? 0 : Math.min(numTimepoints, Math.ceil((visibleEndTimeSec - startTimeSec) * samplingFrequency))
    }, [visibleEndTimeSec, numTimepoints, startTimeSec, samplingFrequency])

    const downsampleFactor = useMemo(() => {
        if (visibleStartTimeSec === undefined || visibleEndTimeSec === undefined) return 1
        const target = (rangeEndSample - rangeStartSample)/width
        const factor = Math.ceil(Math.log(target)/Math.log(multiscaleFactor))
        return Math.pow(multiscaleFactor, factor)
    }, [visibleStartTimeSec, visibleEndTimeSec, rangeEndSample, rangeStartSample, width, multiscaleFactor])

    const visibleValues = useMemo(() => {
        if (visibleStartTimeSec === undefined) return undefined
        if (visibleEndTimeSec === undefined) return undefined
        if (rangeEndSample <= rangeStartSample) return undefined

        const j1 = Math.floor(rangeStartSample / downsampleFactor)
        const j2 = Math.ceil(rangeEndSample / downsampleFactor)
        const visibleValues = dataModel.get(j1, j2, downsampleFactor)
        return visibleValues
    }, [dataModel, visibleStartTimeSec, visibleEndTimeSec, downsampleFactor, rangeStartSample, rangeEndSample])
    
    const visibleLinearPositions: number[] | undefined = useMemo(() => {
        if (!linearPositions) return undefined
        if (visibleStartTimeSec === undefined) return undefined
        if (visibleEndTimeSec === undefined) return undefined
        const i1 = Math.max(0, Math.floor((visibleStartTimeSec - startTimeSec) * samplingFrequency))
        const i2 = Math.min(numTimepoints, Math.ceil((visibleEndTimeSec - startTimeSec) * samplingFrequency))
        return linearPositions.slice(i1, i2)
    }, [numTimepoints, linearPositions, samplingFrequency, startTimeSec, visibleStartTimeSec, visibleEndTimeSec])
    
    const {minValue, maxValue} = useMemo(() => {
        if (!visibleValues) return {minValue: 0, maxValue: 0}
        return {
            minValue: min(visibleValues.map(a => (min(a)))),
            maxValue: max(visibleValues.map(a => (max(a)))),
        }
    }, [visibleValues])
    
    const imageData = useMemo(() => {
        if (!visibleValues) return undefined
        if (minValue === undefined) return undefined
        if (maxValue === undefined) return undefined
        const totalTimePoints = visibleValues.length
        const totalLinearPositionBuckets = visibleValues[0].length
        const data = []
        const colorForValue = getColorForValueFn(minValue, maxValue)
        // We need to do a non-obvious transpose on the input data, because the input
        // is structured as [timeCode][linearPositionBucket] -- i.e. the left-most array index
        // describes the time point, which should be the x-axis on the visualization.
        // Unfortunately, this corresponds to a column-major order, while our graphics need
        // to be described as a one-dimensional array in row-major order (i.e. subsequent entries
        // move across rows from left to right), and we also need to invert the y-axis. So
        // we do a manual double loop here instead of just a flatmap().
        for (let positionIndex = totalLinearPositionBuckets - 1; positionIndex >= 0; positionIndex--) {
            for (let timeIndex = 0; timeIndex < totalTimePoints; timeIndex++) {
                const value = visibleValues[timeIndex][positionIndex]
                data.push(colorForValue(value))
            }
        }
        const clampedData = Uint8ClampedArray.from(data.flat())
        const imageData = new ImageData(clampedData, totalTimePoints)
        return imageData
    }, [visibleValues, minValue, maxValue])
    
    const margins = useTimeseriesMargins(timeseriesLayoutOpts)
    const adjustedHeight = linearPositions ? height - 30 : height // leave an additional margin for the checkbox if we have linear positions to display
    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, adjustedHeight, panelCount, panelSpacing, margins)
    
    const canvas = useMemo(() => {
        return document.createElement('canvas')
    }, [])

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        const canvas = props.offscreenCanvas
        if (canvas === undefined) return
        if (!imageData) return
        if (canvas === undefined)  return
        canvas.width = imageData.width
        canvas.height = imageData.height
        const c = canvas.getContext('2d')
        if (!c) return
        
        c.clearRect(0, 0, canvas.width, canvas.height)
        c.putImageData(imageData, 0, 0)
        if ((showLinearPositionsOverlay) && (visibleLinearPositions)) {
            c.fillStyle = 'white'
            c.strokeStyle = 'white'
            for (let i = 0; i < visibleLinearPositions.length; i++) {
                const xx = i / downsampleFactor
                const yy = imageData.height - 1 - visibleLinearPositions[i]
                c.fillRect(xx - 0.5, yy + 0.5, 1, 1)
            }
        }
        // Draw scaled version of image
        // See: https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas

        // Scaling the offscreen canvas can be done when it's drawn in, which avoids having to deal with transforms and some margin issues.
        context.clearRect(0, 0, context.canvas.width, context.canvas.height)
        context.drawImage(canvas, 0, 0, panelWidth, panelHeight)
    }, [imageData, showLinearPositionsOverlay, visibleLinearPositions, downsampleFactor, panelWidth, panelHeight])

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        return [{
            key: `pdf`,
            label: ``,
            props: {offscreenCanvas: canvas} as PanelProps,
            paint: paintPanel
        }]
    }, [paintPanel, canvas])
    
    return (
        <div>
            <TimeScrollView
                margins={margins}
                panels={panels}
                panelSpacing={panelSpacing}
                selectedPanelKeys={emptyPanelSelection}
                timeseriesLayoutOpts={timeseriesLayoutOpts}
                width={width}
                height={adjustedHeight}
            />
            {
                linearPositions && (
                    <span>
                        <Checkbox style={{paddingTop: 0, paddingBottom: 5}} checked={showLinearPositionsOverlay} onClick={() => {setShowLinearPositionsOverlay(a => (!a))}} />
                        Show actual position overlay
                    </span>
                )
            }
        </div>
    )
}

export const allocate2d = (N1: number, N2: number, value: number | undefined) => {
    const ret: (number | undefined)[][] = []
    for (let i1 = 0; i1 < N1; i1++) {
        ret.push(allocate1d(N2, value))
    }
    return ret
}

export const allocate1d = (N: number, value: number | undefined) => {
    const ret: (number | undefined)[] = []
    for (let i = 0; i < N; i++) ret.push(value)
    return ret
}

/**
 * Given a range of values, generates a function that maps a (possibly undefined)
 * value in that range into an RGBA color value whose R and G intensities are
 * in (0, 255) and proportional to the value's position within the range.
 * The generated function returns black transparent pixels for undefined values.
 * @param min Lowest value in the data range.
 * @param max Highest value in the data range.
 * @returns Convenience function to convert values to proportionally colored pixels.
 */
const getColorForValueFn = (min: number, max: number) => {
    const theScale = 255 / (max - min)
    return (v: number | undefined) => {
        if (v === undefined) return [0, 0, 0, 0]
        const proportion = (v - min) * theScale
        const intensity = Math.max(0, Math.min(255, 3 * Math.floor(proportion)))
        return [intensity, intensity, 60, 255]
    }
}

const min = (a: (number | undefined)[]) => {
    return a.filter(x => (x !== undefined)).reduce((prev, current) => ((prev as number) < (current as number)) ? prev : current, a[0] || 0)
}

const max = (a: (number | undefined)[]) => {
    return a.filter(x => (x !== undefined)).reduce((prev, current) => ((prev as number) > (current as number)) ? prev : current, a[0] || 0)
}

export default PositionPdfPlotWidget