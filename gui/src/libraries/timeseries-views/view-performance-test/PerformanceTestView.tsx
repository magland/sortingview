import { colorForUnitId } from "../../core-utils"
import { FunctionComponent, KeyboardEventHandler, useCallback, useEffect, useMemo, useState } from "react"
import { TimeScrollView, TimeScrollViewPanel, usePanelDimensions, useTimeseriesSelectionInitialization, useTimeRange, useTimeseriesMargins } from ".."
import { convert1dDataSeries, use1dScalingMatrix } from "../util-point-projection"
import { PerformanceTestViewData } from "./PerformanceTestViewData"

// https://figurl.org/f?v=http://localhost:3000&d=sha1://737495c5f42fe3e11158c15c703a7ee0d6ebb20e&label=Performance%20test

type Props = {
    data: PerformanceTestViewData
    width: number
    height: number
}

const N = 100000
const samplingFrequency = 500

const drawSquiggleLine = (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x0: number, y0: number, y1: number, numSquiggles: number) => {
    context.beginPath()
    context.moveTo(x0, y0)
    for (let i = 1; i <= numSquiggles; i++) {
        const dx = i % 2 === 0 ? 10 : -10
        context.lineTo(x0 + dx, y0 + (y1 - y0) * (i / numSquiggles))
    }
    context.stroke()
}

const usePrimes = (n: number) => {
    const [primes, setPrimes] = useState<number[] | undefined>(undefined)
    useEffect(() => {
        const worker = new Worker(new URL('./primesWorker.js', import.meta.url));
        worker.onmessage = (e: MessageEvent) => {
            if (!e.data.primes) return
            setPrimes(e.data.primes)
        }
        worker.postMessage({type: 'computePrimes', n})
        return () => {
            worker.terminate()
        }
    }, [n])

    return primes
}

const useImageData = ({filteredColors, pixelTimes, margins, numSquiggles, panelWidth, panelHeight}: {filteredColors: string[], pixelTimes: number[], margins: {left: number, top: number, right: number, bottom: number}, numSquiggles: number, panelWidth: number, panelHeight: number}) => {
    const [imageData, setImageData] = useState<ImageData | undefined>(undefined)
    useEffect(() => {
        const worker = new Worker(new URL('./getImageDataWorker.js', import.meta.url));
        worker.onmessage = (e: MessageEvent) => {
            setImageData(e.data.imageData)
        }
        worker.postMessage({filteredColors, pixelTimes, margins, numSquiggles, panelWidth, panelHeight})
        return () => {
            worker.terminate()
        }
    }, [filteredColors, pixelTimes, margins, numSquiggles, panelWidth, panelHeight])

    return imageData
}

const PerformanceTestView: FunctionComponent<Props> = ({data, width, height}) => {
    useTimeseriesSelectionInitialization(0, N / samplingFrequency)
    const [mode, setMode] = useState<number>(1)
    const [numSquiggles, setNumSqiggles] = useState<number>(10)
    const {visibleStartTimeSec, visibleEndTimeSec} = useTimeRange()
    const margins = useTimeseriesMargins(undefined)
    const toolbarWidth = 0
    const panelCount = 1
    const panelSpacing = 0
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)
    const timeToPixelMatrix = use1dScalingMatrix(panelWidth, visibleStartTimeSec, visibleEndTimeSec)
    const primes = usePrimes(N)
    const times = useMemo(() => {
        if (!primes) return []
        return primes.map(p => (p / samplingFrequency))
    }, [primes])
    const colors: string[] = useMemo(() => (
        times.map((t, i) => (colorForUnitId(i)))
    ), [times])
    const {filteredTimes, filteredColors} = useMemo(() => ({
        filteredTimes: times.filter(t => ((visibleStartTimeSec !== undefined) && (visibleEndTimeSec !== undefined) && (visibleStartTimeSec <= t) && (t <= visibleEndTimeSec))),
        filteredColors: colors.filter((c, i) => ((visibleStartTimeSec !== undefined) && (visibleEndTimeSec !== undefined) && (visibleStartTimeSec <= times[i]) && (times[i] <= visibleEndTimeSec))),
    }), [times, colors, visibleStartTimeSec, visibleEndTimeSec])
    const pixelTimes = useMemo(() => (
        convert1dDataSeries(filteredTimes, timeToPixelMatrix)
    ), [timeToPixelMatrix, filteredTimes])
    const imageData = useImageData({filteredColors, pixelTimes, margins, numSquiggles, panelWidth, panelHeight})
    
    const paint = useCallback((context: CanvasRenderingContext2D, props: {}) => {
        const timer = Date.now()
        context.clearRect(0, 0, panelWidth, panelHeight)
        if (mode === 1) {
            console.info('Rendering mode 1')
            pixelTimes.forEach((t, i) => {
                context.strokeStyle = filteredColors[i]
                drawSquiggleLine(context, t, margins.top, panelHeight - margins.bottom, numSquiggles)
            })
        }
        else if (mode === 2) {
            if (imageData) {
                context.putImageData(imageData, margins.left, margins.top)
            }
        }
        const elapsed = Date.now() - timer
        console.warn(`Elapsed time for render (ms): ${elapsed} (${Date.now()})`)
    }, [panelHeight, pixelTimes, filteredColors, margins, mode, panelWidth, numSquiggles, imageData])
    const panels: TimeScrollViewPanel<{}>[] = useMemo(() => {
        return [{
            key: 'main',
            label: 'main',
            props: {},
            paint
        }]
    }, [paint])
    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === '1') {
            setMode(1)
        }
        else if (e.key === '2') {
            setMode(2)
        }
        else if (e.key === '=') {
            setNumSqiggles(x => (x * 2))
        }
        else if (e.key === '-') {
            setNumSqiggles(x => (x / 2))
        }
    }, [setMode])
    return (
        <div
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <TimeScrollView
                panels={panels}
                panelSpacing={10}
                margins={margins}
                width={width}
                height={height}
            />
        </div>
    )
}

export const sleepMsec = async (msec: number): Promise<void> => {
    const m = msec
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, m)
    })
}

export default PerformanceTestView