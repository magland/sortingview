import { DefaultToolbarWidth, TimeScrollView, TimeScrollViewPanel, usePanelDimensions, useTimeRange, useTimeseriesMargins, useTimeseriesSelectionInitialization } from '../../timeseries-views'
import { Checkbox } from '@material-ui/core'
import { FunctionComponent, useCallback, useMemo, useState } from 'react'
import { useStyleSettings } from '../context-style-settings/StyleSettingsContext'
import ColorControl from '../util-color-scales/ColorControl'
import { useColorStyles8Bit } from '../util-color-scales/ColorScales'
import { computeScaleFactor, getDownsampledRange, getVisibleFrames, staticDownsample } from './DecodedLinearPositionDownsampling'
import { OffscreenRenderProps, useOffscreenCanvasRange, useOffscreenPainter, usePositions } from './DecodedLinearPositionDrawing'
import { DecodedLinearPositionPlotData } from './DecodedLinearPositionPlotViewData'

// TODO: Make these configurable?
const BASE_SCALE_FACTOR = 3
const MAX_WIDTH_FOR_SCALING = 2000
const MAX_OFFSCREEN_CANVAS_WIDTH = 2000
const MAX_OFFSCREEN_CANVAS_HEIGHT = 1000
const DEFAULT_SAMPLES_PER_SECOND = 1000

// THIS SHOULD BE AN IMPORT FROM TIMESERIES-VIEWS
type TimeseriesLayoutOpts = {
    hideToolbar?: boolean
    hideTimeAxis?: boolean
    useYAxis?: boolean
}

type DecodedLinearPositionProps = {
    data: DecodedLinearPositionPlotData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    controlsSatisfied?: boolean
    width: number
    height: number
}

type PanelProps = {
    displayRange: [number, number]
    showObservedPositionsOverlay: boolean
    scaledObservedPositions: number[] | undefined
    observedPositionsStyle: string | undefined
    downsampledStart: number
    downsampledEnd: number // the end of the window into the data, in downsampled terms
    downsampledMax: number // the end of extant data, when there isn't enough data to fill the viewing area
}

const panelSpacing = 4
const emptyPanelSelection = new Set<number | string>()


const DecodedLinearPositionPlotView: FunctionComponent<DecodedLinearPositionProps> = (props: DecodedLinearPositionProps) => {
    const { data, timeseriesLayoutOpts, controlsSatisfied, width, height } = props
    const { values, positions, frameBounds, positionsKey, startTimeSec, samplingFrequencyHz, observedPositions } = data
    const _startTimeSec = startTimeSec ?? 0
    const _samplingFrequencyHz = samplingFrequencyHz ?? DEFAULT_SAMPLES_PER_SECOND
    const endTimeSec = _startTimeSec + frameBounds.length / _samplingFrequencyHz
    useTimeseriesSelectionInitialization(_startTimeSec, endTimeSec)
    const { visibleStartTimeSec, visibleEndTimeSec } = useTimeRange()
    const [showObservedPositionsOverlay, setShowObservedPositionsOverlay] = useState<boolean>(true)
        
    const { colorStyles, primaryContrastColor: contrastColorStyle } = useColorStyles8Bit()

    const { firstFrame, lastFrame, lastExtantFrame } = getVisibleFrames({
        _startTimeSec,
        _samplingFrequencyHz,
        dataLength: frameBounds.length,
        visibleTimeStartSeconds: visibleStartTimeSec,
        visibleTimeEndSeconds: visibleEndTimeSec,
        dataEndSeconds: endTimeSec})
    const visibleFrameRange = lastFrame - firstFrame
    
    const scaleFactor = computeScaleFactor(BASE_SCALE_FACTOR, visibleFrameRange, MAX_WIDTH_FOR_SCALING)
    const { downsampledStart, downsampledEnd, downsampledLastExtant } = getDownsampledRange(scaleFactor, firstFrame, lastFrame, lastExtantFrame)

    // Possibility: would it be reasonable to cache every downsampling level we touch? Could become memory-prohibitive...
    const sampledData = useMemo(() => staticDownsample(values, positions, frameBounds, scaleFactor), [values, positions, frameBounds, scaleFactor])
    const lastPosition = useMemo(() => (positionsKey.at(-1) ?? 0) + positionsKey[0], [positionsKey])
    const scaledObserved = useMemo(() => observedPositions === undefined ? undefined : observedPositions.map(p => 1 - (p/lastPosition)), [lastPosition, observedPositions])

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)
    // add in buffer for color control and observed-positions checkbox
    // const heightOffset = (observedPositions ? 30 : 0) + (controlsSatisfied ? 0 : 70)
    const heightOffset = ((observedPositions || !controlsSatisfied) ? 35 : 0)
    const adjustedHeight = height - heightOffset
    const panelCount = 1
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, adjustedHeight, panelCount, panelSpacing, margins)
    
    const canvas = useMemo(() => {
        const canvas = document.createElement('canvas')
        return canvas
    }, [])

    const { canvasPositions, pixelBinWidth, targetHeight } = usePositions(MAX_OFFSCREEN_CANVAS_HEIGHT, positionsKey)
    const canvasTargetWidth = useMemo(() => Math.min(MAX_OFFSCREEN_CANVAS_WIDTH, sampledData.downsampledTimes.length), [sampledData.downsampledTimes.length])
    const painter = useOffscreenPainter(colorStyles, targetHeight, pixelBinWidth, canvasPositions)
    const offscreenRenderProps = useMemo(() => {
        const props: OffscreenRenderProps = {
            canvas,
            canvasTargetWidth,
            canvasTargetHeight: targetHeight,
            painter,
            scale: scaleFactor,
            sampledData,
            downsampledRangeStart: downsampledStart,
            downsampledRangeEnd: downsampledEnd,
            downsampledRangeMax: downsampledLastExtant
        }
        return props
    }, [canvas, targetHeight, scaleFactor, sampledData, downsampledStart, downsampledEnd, downsampledLastExtant, canvasTargetWidth, painter])
    const displayRange = useOffscreenCanvasRange(offscreenRenderProps)

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        if (canvas === undefined) return
        const {displayRange, showObservedPositionsOverlay, scaledObservedPositions, observedPositionsStyle, downsampledStart, downsampledEnd, downsampledMax} = props
        context.clearRect(0, 0, context.canvas.width, context.canvas.height)
        context.imageSmoothingEnabled = false
        context.drawImage(canvas, displayRange[0], 0, displayRange[1] - displayRange[0], canvas.height, 0, 0, panelWidth, panelHeight)
        if (showObservedPositionsOverlay && scaledObservedPositions !== undefined) {
            const verticalEpsilonPx = 4
            const alignedStart = downsampledStart * scaleFactor
            const alignedEnd = downsampledEnd * scaleFactor
            // handle the case where we run out of data before we run out of canvas
            const usablePanelShare = (downsampledMax - downsampledStart) / (downsampledEnd - downsampledStart)
            const visibleObserved = scaledObservedPositions.slice(alignedStart, alignedEnd + 1)
            const xStepSize = visibleObserved.length > 0 ? panelWidth * usablePanelShare / (visibleObserved.length) : 1
            context.strokeStyle = (observedPositionsStyle ?? '#000000')
            context.lineWidth = 2
            let lastY = -5
            let lastX = -5   // avoids performance loss from drawing sub-pixel points on top of each other. Negative value to handle first point right
            context.beginPath()
            visibleObserved.forEach((v, i) => {
                const x = i * xStepSize
                const y = (panelHeight * v) + 2
                const deltaY = Math.abs(Math.floor(y) - Math.floor(lastY))
                if ((Math.floor(lastX) !== Math.floor(x)) || (Math.floor(y) !== Math.floor(lastY))) {
                    deltaY > (verticalEpsilonPx) ? context.moveTo(x, y) : context.lineTo(x, y)
                }
                lastX = x
                lastY = y
            })
            context.stroke()
        }
    }, [canvas, panelWidth, panelHeight, scaleFactor])

    const { styleSettings, styleSettingsDispatch } = useStyleSettings()
    const colorControls = ColorControl({dispatch: styleSettingsDispatch, colorMap: styleSettings.colorMap, rangeMax: styleSettings.colorMapRangeMax})
    const controlSection = heightOffset === 0 ? <span/> : <div style={{height: "35px", display: "flex"}}>
            {
                observedPositions && (
                    <span style={{paddingTop: '5px', paddingLeft: '30px'}}>
                        <Checkbox style={{paddingTop: 0, paddingBottom: 5}} checked={showObservedPositionsOverlay} onClick={() => {setShowObservedPositionsOverlay(a => (!a))}} />
                        Show actual position overlay
                    </span>
                )
            }
            {
                !controlsSatisfied && (
                    <span style={{paddingLeft: '10px'}}>
                        {colorControls}
                    </span>
                )
            }
        </div>

    const panels: TimeScrollViewPanel<PanelProps>[] = useMemo(() => {
        return [{
            key: `pdf`,
            label: ``,
            props: {
                displayRange,
                showObservedPositionsOverlay,
                scaledObservedPositions: scaledObserved,
                observedPositionsStyle: contrastColorStyle,
                downsampledStart,
                downsampledEnd,
                downsampledMax: downsampledLastExtant } as PanelProps,
            paint: paintPanel
        }]
    }, [paintPanel, displayRange, downsampledStart, downsampledEnd, downsampledLastExtant, showObservedPositionsOverlay, scaledObserved, contrastColorStyle])
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
            {controlSection}
        </div>
    )
}

export default DecodedLinearPositionPlotView