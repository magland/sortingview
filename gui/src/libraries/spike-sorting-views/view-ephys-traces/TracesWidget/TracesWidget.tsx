import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import EphysTracesClient, { EphysTracesInfo } from "../EphysTracesClient";
import TimeScrollView2, { useTimeScrollView2 } from '../../../timeseries-views/component-time-scroll-view-2/TimeScrollView2'
import { Opts, TracesData } from "./WorkerTypes";
import {useTimeRange} from '../../../timeseries-views'

type Props = {
    ephysTracesClient: EphysTracesClient
    ephysTracesInfo: EphysTracesInfo
    width: number
    height: number
}

const gridlineOpts = {
    hideX: false,
    hideY: true
}

const yAxisInfo = {
    showTicks: false,
    yMin: undefined,
    yMax: undefined
}

const hideToolbar = false

const TracesWidget: FunctionComponent<Props> = ({ephysTracesClient, ephysTracesInfo, width, height}) => {
    const {canvasWidth, canvasHeight, margins} = useTimeScrollView2({width, height, hideToolbar})

    const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | undefined>()

    const [zoomInRequired, setZoomInRequired] = useState(false)

    const {visibleStartTimeSec, visibleEndTimeSec} = useTimeRange()

    const maxTimeSpanSec = useMemo(() => (
        3e6 / ephysTracesInfo.numChannels / ephysTracesInfo.samplingFrequency
    ), [ephysTracesInfo])

    const [initialTraces, setInitialTraces] = useState<(Int16Array | Float32Array)[]>()
    useEffect(() => {
        ephysTracesClient.getTraces(0, 1000).then(setInitialTraces)
    }, [ephysTracesClient])
    const channelStats: {mean: number, stdev: number}[] | undefined = useMemo(() => {
        if (!initialTraces) return undefined
        return initialTraces.map(x => ({
            mean: computeMean(x),
            stdev: computeStdev(x)
        }))
    }, [initialTraces])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // const boundingRect = e.currentTarget.getBoundingClientRect()
        // const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        // const boundingRect = e.currentTarget.getBoundingClientRect()
        // const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMouseOut = useCallback((e: React.MouseEvent) => {
    }, [])

    const [worker, setWorker] = useState<Worker | null>(null)
    useEffect(() => {
        if (!canvasElement) return
        const worker = new Worker(new URL('./worker', import.meta.url))
        const offscreenCanvas = canvasElement.transferControlToOffscreen();
        worker.postMessage({
            canvas: offscreenCanvas,
        }, [offscreenCanvas])

		setWorker(worker)

        return () => {
            worker.terminate()
        }
    }, [canvasElement])

    useEffect(() => {
        if (!worker) return
        if (visibleStartTimeSec === undefined) return
        if (visibleEndTimeSec === undefined) return
        if (!channelStats) return
        const channels = channelStats.map((cs, i) => ({
            channelId: ephysTracesInfo.channelIds[i],
            offset: cs.mean,
            scale: (1 / cs.stdev) / 10
        }))
        const opts: Opts = {
            canvasWidth,
            canvasHeight,
            margins,
            visibleStartTimeSec,
            visibleEndTimeSec,
            channels,
            samplingFrequency: ephysTracesInfo.samplingFrequency,
            zoomInRequired
        }
        worker.postMessage({
            opts
        })
    }, [worker, ephysTracesInfo, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, margins, channelStats, zoomInRequired])

    useEffect(() => {
        let canceled = false
        if (visibleStartTimeSec === undefined) return
        if (visibleEndTimeSec === undefined) return
        const timeSpan = visibleEndTimeSec - visibleStartTimeSec
        if (timeSpan > maxTimeSpanSec) {
            setZoomInRequired(true)
            return
        }
        setZoomInRequired(false)
        const startFrame = Math.round(visibleStartTimeSec * ephysTracesInfo.samplingFrequency)
        const endFrame = Math.round(visibleEndTimeSec * ephysTracesInfo.samplingFrequency)
        ephysTracesClient.getTraces(startFrame, endFrame).then(traces => {
            if (canceled) return
            if (!worker) return
            const tracesData: TracesData = {
                startFrame,
                endFrame,
                data: traces
            }
            worker.postMessage({
                tracesData
            })
        })
        return () => {canceled = true}
    }, [worker, ephysTracesInfo, ephysTracesClient, visibleStartTimeSec, visibleEndTimeSec, maxTimeSpanSec])

    return (
        <TimeScrollView2
            width={width}
            height={height}
            onCanvasElement={setCanvasElement}
            gridlineOpts={gridlineOpts}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseOut={handleMouseOut}
            hideToolbar={hideToolbar}
            yAxisInfo={yAxisInfo}
        />
    )
}

function computeMean(x: Int16Array | Float32Array) {
    if (x.length === 0) return 0
    let sum = 0
    for (let i = 0; i < x.length; i++) sum += x[i]
    return sum / x.length
}

function computeStdev(x: Int16Array | Float32Array) {
    if (x.length <= 1) return 0
    const mean = computeMean(x)
    let sumsqr = 0
    for (let i = 0; i < x.length; i++) sumsqr += (x[i] - mean) * (x[i] - mean)
    return Math.sqrt(sumsqr / x.length)
}

export default TracesWidget