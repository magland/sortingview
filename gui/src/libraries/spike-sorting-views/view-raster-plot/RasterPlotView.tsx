import { DefaultToolbarWidth, TimeScrollView, usePanelDimensions, useTimeseriesSelectionInitialization, useTimeRange, useTimeseriesMargins } from '../../timeseries-views'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { useSelectedUnitIds } from '..'
import { idToNum } from '../context-unit-selection'
import { convert1dDataSeries, use1dScalingMatrix } from '../util-point-projection'
import { getUnitColor } from '../view-units-table/unitColors'
import { RasterPlotViewData } from './RasterPlotViewData'

type Props = {
    data: RasterPlotViewData
    width: number
    height: number
}

export type TimeseriesLayoutOpts = {
    hideToolbar?: boolean
    hideTimeAxis?: boolean
    useYAxis?: boolean
}

type PanelProps = {
    color: string
    pixelSpikes: number[]
}

const panelSpacing = 4

const RasterPlotView: FunctionComponent<Props> = ({data, width, height}) => {
    const {selectedUnitIds} = useSelectedUnitIds()

    const timeseriesLayoutOpts = useMemo(() => ({hideToolbar: data.hideToolbar}), [data.hideToolbar])

    useTimeseriesSelectionInitialization(data.startTimeSec, data.endTimeSec)
    const { visibleStartTimeSec, visibleEndTimeSec } = useTimeRange()

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = useMemo(() => data.plots.length, [data.plots])
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)

    // We need to have the panelHeight before we can use it in the paint function.
    // By using a callback, we avoid having to complicate the props passed to the painting function; it doesn't make a big difference
    // but simplifies the prop list a bit.
    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        context.strokeStyle = props.color
        context.lineWidth = 3.0
        context.beginPath()
        for (const s of props.pixelSpikes) {
            context.moveTo(s, 0)
            context.lineTo(s, Math.max(panelHeight, 1))
        }
        context.stroke()
    }, [panelHeight])

    const timeToPixelMatrix = use1dScalingMatrix(panelWidth, visibleStartTimeSec, visibleEndTimeSec)

    const maxPointsPerUnit = 3000

    const pixelPanels = useMemo(() => (data.plots.sort((p1, p2) => (-idToNum(p1.unitId) + idToNum(p2.unitId))).map(plot => {
        const filteredSpikes = plot.spikeTimesSec.filter(t => (visibleStartTimeSec !== undefined) && (visibleStartTimeSec <= t) && (visibleEndTimeSec !== undefined) && (t <= visibleEndTimeSec))
        const pixelSpikes = subsampleIfNeeded(convert1dDataSeries(filteredSpikes, timeToPixelMatrix), maxPointsPerUnit)

        return {
            key: `${plot.unitId}`,
            label: `${plot.unitId}`,
            props: {
                color: getUnitColor(idToNum(plot.unitId)),
                pixelSpikes: pixelSpikes
            },
            paint: paintPanel
        }
    })), [data.plots, visibleStartTimeSec, visibleEndTimeSec, timeToPixelMatrix, paintPanel])

    return visibleStartTimeSec === undefined
    ? (<div>Loading...</div>)
    : (
        <TimeScrollView
            margins={margins}
            panels={pixelPanels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedUnitIds}
            highlightSpans={data.highlightIntervals}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
}

const subsampleIfNeeded = (x: number[], maxNum: number) => {
    if (x.length <= maxNum) {
        return x
    }
    const ret: number[] = []
    const incr = x.length / maxNum
    for (let i = 0; i < maxNum; i ++) {
        const j = Math.floor(i * incr)
        ret.push(x[j])
    }
    return ret
}

export default RasterPlotView