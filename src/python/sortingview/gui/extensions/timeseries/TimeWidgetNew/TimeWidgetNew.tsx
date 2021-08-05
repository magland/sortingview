import React, { useCallback, useEffect, useState } from 'react'
import { CanvasPainter } from 'figurl/labbox-react/components/CanvasWidget/CanvasPainter'
import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget/CanvasWidget'
import { useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer'
import { RecordingSelection, RecordingSelectionDispatch } from '../../../pluginInterface'
import { createCursorLayer } from './cursorLayer'
import { createMainLayer } from './mainLayer'
import { createPanelLabelLayer } from './panelLabelLayer'
import { createTimeAxisLayer } from './timeAxisLayer'
import TimeSpanWidget, { SpanWidgetInfo } from './TimeSpanWidget'
import TimeWidgetBottomBar from './TimeWidgetBottomBar'
import TimeWidgetToolbarNew from './TimeWidgetToolbarNew'
import { ActionItem, DividerItem } from '../../common/Toolbars'
import { createMarkersLayer } from './markersLayer'

export type TimeWidgetAction = ActionItem | DividerItem

interface Props {
    panels: TimeWidgetPanel[]
    customActions?: TimeWidgetAction[] | null
    width: number
    height: number
    samplerate: number
    maxTimeSpan: number
    startTimeSpan: number
    numTimepoints: number
    selection: RecordingSelection
    selectionDispatch: RecordingSelectionDispatch
    markers?: {t: number, color: string}[]
}

export interface TimeWidgetPanel {
    setTimeRange: (timeRange: {min: number, max: number}) => void
    paint: (painter: CanvasPainter, completenessFactor: number) => void
    paintYAxis?: (painter: CanvasPainter, width: number, height: number) => void
    label: () => string
}

const toolbarWidth = 36 // hard-coded for now
const spanWidgetHeight = 40

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TimeState {
    numTimepoints: number
    maxTimeSpan: number
    currentTime: number | null
    timeRange: {min: number, max: number} | null
}
interface ZoomTimeRangeAction {
    type: 'zoomTimeRange'
    factor: number
}
interface SetTimeRangeAction {
    type: 'setTimeRange'
    timeRange: {min: number, max: number}
}
interface TimeShiftFrac {
    type: 'timeShiftFrac',
    frac: number
}
interface SetCurrentTime {
    type: 'setCurrentTime'
    currentTime: number | null
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TimeAction = ZoomTimeRangeAction | SetTimeRangeAction | TimeShiftFrac | SetCurrentTime | {type: 'gotoHome' | 'gotoEnd'}
// const timeReducer = (state: TimeState, action: TimeAction): TimeState => {

//     const fix = (s: TimeState): TimeState => {
//         if (s.numTimepoints === null) return s
//         let ret: TimeState = s
//         if (ret.currentTime !== null) {
//             if (ret.currentTime >= ret.numTimepoints) {
//                 ret = {
//                     ...ret,
//                     currentTime: ret.numTimepoints - 1
//                 }
//             }
//         }
//         if (ret.currentTime !== null) {
//             if (ret.currentTime < 0) {
//                 ret = {
//                     ...ret,
//                     currentTime: 0
//                 }
//             }
//         }
//         if (ret.timeRange !== null) {
//             if (ret.timeRange.max - ret.timeRange.min > ret.maxTimeSpan) {
//                 ret = {
//                     ...ret,
//                     timeRange: {min: ret.timeRange.min, max: ret.timeRange.min + ret.maxTimeSpan}
//                 }
//             }
//         }
//         if (ret.timeRange !== null) {
//             if (ret.timeRange.max > ret.numTimepoints) {
//                 const dt = ret.numTimepoints - ret.timeRange.max
//                 ret = {
//                     ...ret,
//                     timeRange: {min: ret.timeRange.min + dt, max: ret.timeRange.max + dt}
//                 }
//             }
//         }
//         if (ret.timeRange !== null) {
//             if (ret.timeRange.min < 0) {
//                 const dt = -ret.timeRange.min
//                 ret = {
//                     ...ret,
//                     timeRange: {min: ret.timeRange.min + dt, max: ret.timeRange.max + dt}
//                 }
//             }
//         }
//         return ret
//     }

//     if (action.type === 'zoomTimeRange') {
//         const currentTime = state.currentTime
//         const timeRange = state.timeRange
//         if (!timeRange) return state
//         if ((timeRange.max - timeRange.min) / action.factor > state.maxTimeSpan ) return state
//         let t: number
//         if ((currentTime === null) || (currentTime < timeRange.min))
//             t = timeRange.min
//         else if (currentTime > timeRange.max)
//             t = timeRange.max
//         else
//             t = currentTime
//         const newTimeRange = zoomTimeRange(timeRange, action.factor, t)
//         return fix({
//             ...state,
//             timeRange: newTimeRange
//         })
//     }
//     else if (action.type === 'setTimeRange') {
//         return fix({
//             ...state,
//             timeRange: action.timeRange
//         })
//     }
//     else if (action.type === 'setCurrentTime') {
//         return fix({
//             ...state,
//             currentTime: action.currentTime
//         })
//     }
//     else if (action.type === 'timeShiftFrac') {
//         const timeRange = state.timeRange
//         const currentTime = state.currentTime
//         if (!timeRange) return state
//         const span = timeRange.max - timeRange.min
//         const shift = Math.floor(span * action.frac)
//         const newTimeRange = shiftTimeRange(timeRange, shift)
//         const newCurrentTime = currentTime !== null ? currentTime + shift : null
//         return fix({
//             ...state,
//             currentTime: newCurrentTime,
//             timeRange: newTimeRange
//         })
//     }
//     else if (action.type === 'gotoHome') {
//         const timeRange = state.timeRange
//         if (!timeRange) return state
//         const span = timeRange.max - timeRange.min
//         const newTimeRange = {min: 0, max: span}
//         return fix({
//             ...state,
//             currentTime: newTimeRange.min,
//             timeRange: newTimeRange
//         })
//     }
//     else if (action.type === 'gotoEnd') {
//         const timeRange = state.timeRange
//         if (!timeRange) return state
//         const numTimepoints = state.numTimepoints
//         if (numTimepoints === null) return state
//         const span = timeRange.max - timeRange.min
//         const newTimeRange = {min: numTimepoints - span, max: numTimepoints}
//         return fix({
//             ...state,
//             currentTime: newTimeRange.max - 1,
//             timeRange: newTimeRange
//         })
//     }
//     else {
//         return state
//     }
// }

const plotMargins = {
    left: 80,
    top: 20,
    right: 40,
    bottom: 60
}

// const useTimeState = (args: {
//     numTimepoints: number,
//     maxTimeSpan: number,
//     currentTimepoint?: number | null,
//     onCurrentTimepointChanged?: (t: number | null) => void,
//     timeRange?: {min: number, max: number} | null,
//     onTimeRangeChanged?: (r: {min: number, max: number} | null) => void
// }): {timeState: TimeState, timeDispatch: React.Dispatch<TimeAction>} => {
//     const { numTimepoints, maxTimeSpan, currentTimepoint, onCurrentTimepointChanged, timeRange, onTimeRangeChanged } = args
//     const [timeState, setTimeState] = useState<TimeState>({timeRange: null, currentTime: null, numTimepoints, maxTimeSpan})
//     let newTimeState = {...timeState}
//     if (currentTimepoint !== undefined) {
//         newTimeState = {...newTimeState, currentTime: currentTimepoint}
//     }
//     if (timeRange !== undefined) {
//         newTimeState = {...newTimeState, timeRange}
//     }
//     const newTimeDispatch = useMemo(() => ((a: TimeAction) => {
//         const reducedTimeState = timeReducer(newTimeState, a)
//         if (onCurrentTimepointChanged !== undefined) {
//             if (reducedTimeState.currentTime !== currentTimepoint) {
//                 onCurrentTimepointChanged(reducedTimeState.currentTime)
//             }
//         }
//         if (onTimeRangeChanged !== undefined) {
//             if ((reducedTimeState.timeRange?.min !== timeRange?.min) || (reducedTimeState.timeRange?.max !== timeRange?.max)) {
//                 onTimeRangeChanged(reducedTimeState.timeRange)
//             }
//         }
//         setTimeState(reducedTimeState)
//     }), [currentTimepoint, ])
//     return {timeState: newTimeState, timeDispatch: newTimeDispatch}
// }\

const TimeWidgetNew = (props: Props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {panels, width, height, customActions, numTimepoints, maxTimeSpan, startTimeSpan, samplerate, selection, selectionDispatch, markers} = props

    const [spanWidgetInfo, setSpanWidgetInfo] = useState<SpanWidgetInfo>({numTimepoints})

    const mainLayer = useLayer(createMainLayer)
    const timeAxisLayer = useLayer(createTimeAxisLayer)
    const panelLabelLayer = useLayer(createPanelLabelLayer)
    const markersLayer = useLayer(createMarkersLayer)
    const cursorLayer = useLayer(createCursorLayer)

    const allLayers = useLayers([mainLayer, timeAxisLayer, panelLabelLayer, markersLayer, cursorLayer])

    // schedule repaint when panels change
    useEffect(() => {
        if (mainLayer) {
            mainLayer.scheduleRepaint()
        }
    }, [panels, mainLayer])

    // when current time or time range changes, update the span widget info
    useEffect(() => {
        setSpanWidgetInfo({
            currentTime: selection.currentTimepoint,
            timeRange: selection.timeRange,
            numTimepoints
        })
    }, [selection.currentTimepoint, selection.timeRange, setSpanWidgetInfo, numTimepoints])

    // when time range or panels change, repaint all layers
    useEffect(() => {
        allLayers.forEach(layer => {
            layer && layer.scheduleRepaint()
        })
    }, [panels, allLayers])

    const handleClick = useCallback(
        (args: {timepoint: number, panelIndex: number, y: number}) => {
            selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: args.timepoint})
        },
        [selectionDispatch]
    )
    const handleDrag = useCallback(
        (args: {newTimeRange: {min: number, max: number}}) => {
            selectionDispatch({type: 'SetTimeRange', timeRange: args.newTimeRange})
        },
        [selectionDispatch]
    )
    const handleTimeZoom = useCallback((a: {direction: 'in' | 'out'}) => {
        selectionDispatch({type: 'ZoomTimeRange', direction: a.direction})
    }, [selectionDispatch])

    const handleTimeShiftFrac = useCallback((frac: number) => {
        selectionDispatch({type: 'TimeShiftFrac', frac})
    }, [selectionDispatch])

    const handleCurrentTimeChanged = useCallback((t: number | null) => {
        selectionDispatch({type: 'SetCurrentTimepoint', currentTimepoint: t})
    }, [selectionDispatch])

    const handleTimeRangeChanged = useCallback((timeRange: {min: number, max: number}) => {
        selectionDispatch({type: 'SetTimeRange', timeRange})
    }, [selectionDispatch])

    const handleGotoHome = useCallback(() => {
        // selectionDispatch({type: 'CurrentTimepointHome'})
    }, [])

    const handleGotoEnd = useCallback(() => {
        // selectionDispatch({type: 'CurrentTimepointEnd'})
    }, [])

    const handleRepaintTimeEstimate = useCallback((ms: number) => {
        const refreshRateEstimate = 1000 / ms
        const refreshRate = refreshRateEstimate / 2
        allLayers.forEach(layer => {
            layer && layer.setRefreshRate(refreshRate)
        })
    }, [allLayers])

    const handleZoomTimeIn = useCallback(() => {
        selectionDispatch({type: 'ZoomTimeRange', direction: 'in'})
    }, [selectionDispatch])

    const handleZoomTimeOut = useCallback(() => {
        selectionDispatch({type: 'ZoomTimeRange', direction: 'out'})
    }, [selectionDispatch])

    const handleShiftTimeLeft = useCallback(() => {
        selectionDispatch({type: 'TimeShiftFrac', frac: -0.2})
    }, [selectionDispatch])

    const handleShiftTimeRight = useCallback(() => {
        selectionDispatch({type: 'TimeShiftFrac', frac: 0.2})
    }, [selectionDispatch])

    const bottomBarInfo = {
        show: true,
        currentTime: selection.currentTimepoint,
        timeRange: selection.timeRange,
        samplerate,
        statusText: ''
    }
    const showBottomBar = true
    const bottomBarHeight = showBottomBar ? 40 : 0;

    const layerProps = {
        customActions,
        panels,
        width: width - toolbarWidth,
        height: height - spanWidgetHeight - bottomBarHeight,
        timeRange: selection.timeRange,
        currentTime: selection.currentTimepoint,
        samplerate,
        margins: plotMargins,
        onClick: handleClick,
        onDrag: handleDrag,
        onTimeZoom: handleTimeZoom,
        onTimeShiftFrac: handleTimeShiftFrac,
        onGotoHome: handleGotoHome,
        onGotoEnd: handleGotoEnd,
        onRepaintTimeEstimate: handleRepaintTimeEstimate,
        markers
    }
    allLayers.forEach(L => {
        if (L) L.setProps(layerProps)
    })

    return (
        <div
            className="TimeWidget"
            style={{position: 'relative', left: 0, top: 0, width, height}}
        >
            <TimeWidgetToolbarNew
                width={toolbarWidth}
                height={height}
                top={0}
                onZoomIn={handleZoomTimeIn}
                onZoomOut={handleZoomTimeOut}
                onShiftTimeLeft={handleShiftTimeLeft}
                onShiftTimeRight={handleShiftTimeRight}
                customActions={customActions}
            />
            <div
                style={{position: 'relative', left: toolbarWidth, top: 0, width: width - toolbarWidth, height: height}}
            >
                <TimeSpanWidget
                    key='timespan'
                    width={width - toolbarWidth}
                    height={spanWidgetHeight}
                    info={spanWidgetInfo}
                    onCurrentTimeChanged={handleCurrentTimeChanged}
                    onTimeRangeChanged={handleTimeRangeChanged}
                />
                <CanvasWidget
                    key='canvas'
                    layers={allLayers}
                    preventDefaultWheel={true}
                    {...{width: width - toolbarWidth, height: layerProps.height}}
                />
                <TimeWidgetBottomBar
                    key='bottom'
                    width={width - toolbarWidth}
                    height={bottomBarHeight}
                    info={bottomBarInfo}
                    onCurrentTimeChanged={handleCurrentTimeChanged}
                    onTimeRangeChanged={handleTimeRangeChanged}
                />
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const shiftTimeRange = (timeRange: {min: number, max: number}, shift: number): {min: number, max: number} => {
    return {
        min: Math.floor(timeRange.min + shift),
        max: Math.floor(timeRange.max + shift)
    }
}

export default TimeWidgetNew