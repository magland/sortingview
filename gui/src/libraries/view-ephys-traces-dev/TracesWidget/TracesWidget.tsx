import { getUnitColor, idToNum } from "../../spike-sorting-views";
import { useSelectedUnitIds } from "../../spike-sorting-views/context-unit-selection/UnitSelectionContext";
import { useTimeRange } from '../../timeseries-views';
import TimeScrollView2, { useTimeScrollView2 } from '../../timeseries-views/component-time-scroll-view-2/TimeScrollView2';
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EphysTracesClient, { EphysTracesInfo } from "../EphysTracesClient";
import HoverInfoComponent from "./HoverInfoComponent";
import TracesWidgetBottomToolbar, { defaultTracesWidgetBottomToolbarOptions, tracesWidgetBottomToolbarHeight, TracesWidgetBottomToolbarOptions } from "./TracesWidgetBottomToolbar";
import { Opts, SortingUnits, SpikeMarkerLocation, TracesDataChunk } from "./WorkerTypes";

type Props = {
    ephysTracesClient: EphysTracesClient
    ephysTracesInfo: EphysTracesInfo
    sortingData: SortingData
    width: number
    height: number
}

export type SortingData = {
    samplingFrequency: number
    units: {
        unitId: string
        peakChannelId?: string | number
        spikeTrain: number[]
    }[]
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

const TracesWidget: FunctionComponent<Props> = ({ephysTracesClient, ephysTracesInfo, sortingData, width, height}) => {
    const {canvasWidth, canvasHeight, margins} = useTimeScrollView2({width, height: height - tracesWidgetBottomToolbarHeight, hideToolbar})

    const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | undefined>()

    const [zoomInRequired, setZoomInRequired] = useState(false)

    const {visibleStartTimeSec, visibleEndTimeSec} = useTimeRange()

    const [bottomToolbarOptions, setBottomToolbarOptions] = useState<TracesWidgetBottomToolbarOptions>(defaultTracesWidgetBottomToolbarOptions)

    const [spikeMarkerLocations, setSpikeMarkerLocations] = useState<SpikeMarkerLocation[]>([])

    const chunkIndicesSent = useRef<Set<number>>(new Set<number>())

    const [hoverInfoPosition, setHoverInfoPosition] = useState<{x: number, y: number}>()
    const [hoverInfoText, setHoverInfoText] = useState<string>()

    const [amplitudeScaleFactor, setAmplitudeScaleFactor] = useState(1)

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

    const spikeMarkerAtLocation = useMemo(() => (
        (p: {x: number, y: number}) => {
            for (const m of spikeMarkerLocations) {
                if ((m.rect.x <= p.x) && (p.x <= m.rect.x + m.rect.w) && (m.rect.y <= p.y) && (p.y <= m.rect.y + m.rect.h)) {
                    return m
                }
            }
            return undefined
        }
    ), [spikeMarkerLocations])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            setAmplitudeScaleFactor(x => (x / 1.3))
        }
        else if (e.key === 'ArrowUp') {
            setAmplitudeScaleFactor(x => (x * 1.3))
        }
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // const boundingRect = e.currentTarget.getBoundingClientRect()
        // const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const boundingRect = e.currentTarget.getBoundingClientRect()
        const p = {x: e.clientX - boundingRect.x, y: e.clientY - boundingRect.y}
        const marker = spikeMarkerAtLocation(p)
        if (marker) {
            setHoverInfoPosition({x: marker.rect.x + marker.rect.w / 2, y: marker.rect.y + marker.rect.h / 2})
            setHoverInfoText(`unit ${marker.unitId}`)
        }
        else {
            setHoverInfoText(undefined)
        }
    }, [spikeMarkerAtLocation])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleMouseOut = useCallback((e: React.MouseEvent) => {
        setHoverInfoText(undefined)
    }, [])

    const [worker, setWorker] = useState<Worker | null>(null)
    useEffect(() => {
        let canceled = false
        if (!canvasElement) return
        let offscreenCanvas: OffscreenCanvas
        try {
            offscreenCanvas = canvasElement.transferControlToOffscreen();
        }
        catch(err) {
            console.warn('Unable to transfer control of canvas.')
            return
        }
        const worker = new Worker(new URL('./worker', import.meta.url))
        worker.onmessage = ev => {
            if (canceled) return
            if (ev.data.spikeMarkerLocations) {
                setSpikeMarkerLocations(ev.data.spikeMarkerLocations)
            }
        }
        
        worker.postMessage({
            canvas: offscreenCanvas,
        }, [offscreenCanvas])

		setWorker(worker)

        return () => {
            chunkIndicesSent.current = new Set()
            worker.terminate()
            canceled = true
        }
    }, [canvasElement])

    const chunkSizeInFrames = useMemo(() => (
        Math.ceil(1e5 / ephysTracesInfo.numChannels)
    ), [ephysTracesInfo.numChannels])

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
            chunkSizeInFrames,
            canvasWidth,
            canvasHeight,
            margins,
            visibleStartTimeSec,
            visibleEndTimeSec,
            channels,
            samplingFrequency: ephysTracesInfo.samplingFrequency,
            zoomInRequired,
            mode: bottomToolbarOptions.mode,
            amplitudeScaleFactor
        }
        worker.postMessage({
            opts
        })
    }, [worker, ephysTracesInfo, canvasWidth, canvasHeight, visibleStartTimeSec, visibleEndTimeSec, margins, channelStats, zoomInRequired, bottomToolbarOptions, chunkSizeInFrames, amplitudeScaleFactor])

    const [sortingUnits, setSortingUnits] = useState<SortingUnits>()
    const {selectedUnitIds} = useSelectedUnitIds()
    useEffect(() => {
        if (!sortingData) {
            setSortingUnits(undefined)
            return
        }
        if (visibleStartTimeSec === undefined) return
        if (visibleEndTimeSec === undefined) return
        const units: {unitId: string | number, color: string, peakChannelId: string | number | undefined, spikeFrames: number[]}[] = sortingData.units.filter(u => (selectedUnitIds.has(u.unitId))).map(u => {
            return {
                unitId: u.unitId,
                color: getUnitColor(idToNum(u.unitId)),
                peakChannelId: u.peakChannelId,
                spikeFrames: u.spikeTrain.filter(f => {
                    const t0 = f / ephysTracesInfo.samplingFrequency
                    return (visibleStartTimeSec <= t0) && (t0 <= visibleEndTimeSec)    
                })
            }
        })
        setSortingUnits({
            units
        })
    }, [sortingData, ephysTracesInfo.samplingFrequency, visibleEndTimeSec, visibleStartTimeSec, selectedUnitIds])
    useEffect(() => {
        if (!worker) return
        worker.postMessage({
            sortingUnits
        })
    }, [worker, sortingUnits])

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
        ;(async () => {
            const startFrame = Math.round(visibleStartTimeSec * ephysTracesInfo.samplingFrequency)
            const endFrame = Math.round(visibleEndTimeSec * ephysTracesInfo.samplingFrequency)
            const i1 = Math.floor(startFrame / chunkSizeInFrames)
            const i2 = Math.ceil(endFrame / chunkSizeInFrames)
            for (let i = i1; i <= i2; i++) {
                if (!chunkIndicesSent.current.has(i)) {
                    const start = i * chunkSizeInFrames
                    const end = (i + 1) * chunkSizeInFrames
                    const traces = await ephysTracesClient.getTraces(start, end)
                    if (canceled) return
                    if (!worker) return
                    const tracesDataChunk: TracesDataChunk = {
                        chunkIndex: i,
                        data: traces
                    }
                    worker.postMessage({
                        tracesDataChunk
                    })
                    chunkIndicesSent.current.add(i)
                }
            }
        })()
        return () => {canceled = true}
    }, [worker, ephysTracesInfo, ephysTracesClient, visibleStartTimeSec, visibleEndTimeSec, maxTimeSpanSec, chunkSizeInFrames])

    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', width, height: height - tracesWidgetBottomToolbarHeight}}>
                <TimeScrollView2
                    width={width}
                    height={height - tracesWidgetBottomToolbarHeight}
                    onCanvasElement={setCanvasElement}
                    gridlineOpts={gridlineOpts}
                    onKeyDown={handleKeyDown}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseOut={handleMouseOut}
                    hideToolbar={hideToolbar}
                    yAxisInfo={yAxisInfo}
                />
            </div>
            <HoverInfoComponent
                position={hoverInfoPosition}
                text={hoverInfoText}
            />
            <div style={{position: 'absolute', width, top: height - tracesWidgetBottomToolbarHeight, height: tracesWidgetBottomToolbarHeight}}>
                <TracesWidgetBottomToolbar
                    options={bottomToolbarOptions}
                    setOptions={setBottomToolbarOptions}
                />
            </div>
        </div>
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