import { funcToTransform } from "figurl/labbox-react/components/CanvasWidget"
import { CanvasPainter } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasDragEvent, CanvasWidgetLayer, ClickEvent, ClickEventType, DiscreteMouseEventHandler, DragHandler, KeyboardEvent, KeyboardEventHandler, MousePresenceEvent, MousePresenceEventHandler, MousePresenceEventType, WheelEvent, WheelEventHandler } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { getInverseTransformationMatrix, TransformationMatrix, transformPoint, Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"
import { sleepMsec } from "../../../pluginInterface/RecordingSelection"
import { TimeWidgetLayerProps } from "./TimeWidgetLayerProps"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {
    timeRange: {min: number, max: number} | null
    transformations: TransformationMatrix[]
    yAxisTransformations: TransformationMatrix[]
    yAxisWidths: number[]
    yAxisHeights: number[]
    inverseTransformations: TransformationMatrix[]
    anchorTimepoint: number | null
    dragging: boolean
    captureWheel: boolean
    paintStatus: {
        paintCode: number,
        completenessFactor: number
    }
}

const initialLayerState = {
    timeRange: null,
    transformations: [],
    inverseTransformations: [],
    yAxisTransformations: [],
    yAxisWidths: [],
    yAxisHeights: [],
    anchorTimepoint: null,
    dragging: false,
    captureWheel: false,
    paintStatus: {
        paintCode: 0,
        completenessFactor: 0.2
    }
}

const onPaint = async (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState): Promise<void> => {
    const { panels, timeRange } = layerProps
    if (!timeRange) return
    if (panels.length === 0) return
    state.paintStatus.paintCode ++
    const paintCode = state.paintStatus.paintCode

    for (let level = 1 ; level <= 2; level++) {
        let completenessFactor = state.paintStatus.completenessFactor
        painter.useOffscreenCanvas(layerProps.width, layerProps.height)
        if (level === 1) {
            painter.wipe()
        }
        else if (level === 2) {
            completenessFactor = 1
        }
        const timer = Number(new Date())
        for (let i = 0; i < panels.length; i++) {
            const panel = panels[i]
            const painter2 = painter.transform(state.transformations[i])
            const painter3 = painter.transform(state.yAxisTransformations[i])
            panel.setTimeRange(timeRange)
            panel.paint(painter2, completenessFactor)
            panel.paintYAxis && panel.paintYAxis(painter3, state.yAxisWidths[i], state.yAxisHeights[i])
            if (level === 2) {
                await sleepMsec(0)
                if (paintCode !== state.paintStatus.paintCode) {
                    return
                }
            }
        }
        const elapsed = Number(new Date()) - timer
        if ((level === 1) && (elapsed)) {
            layerProps.onRepaintTimeEstimate(elapsed)
            // let's adjust the completeness factor based on a target elapsed time
            const targetElapsed = 40
            state.paintStatus.completenessFactor = state.paintStatus.completenessFactor * targetElapsed / elapsed
            state.paintStatus.completenessFactor = Math.min(1, Math.max(0.15, state.paintStatus.completenessFactor))
        }
        painter.transferOffscreenToPrimary()
        if (completenessFactor === 1) break
    }
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
    const { panels } = layerProps

    const { timeRange, width, height, margins } = layerProps
    if (!timeRange) return

    const transformations = panels.map((panel, i) => {
        return funcToTransform((p: Vec2): Vec2 => {
            const xfrac = (p[0] - timeRange.min) / (timeRange.max - timeRange.min)
            const yfrac = (i / panels.length) + p[1] * (1 / panels.length)
            const x = margins.left + xfrac * (width - margins.left - margins.right)
            const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
            return [x, y]
        })
    })
    const inverseTransformations = transformations.map(T => (getInverseTransformationMatrix(T)))
    const yAxisTransformations = panels.map((panel, i) => {
        return funcToTransform((p: Vec2): Vec2 => {
            return [p[0], p[1] + margins.top]
        })
    })
    const yAxisWidths = panels.map((panel, i) => {
        return margins.left
    })
    const yAxisHeights = panels.map((panel, i) => {
        return height - margins.bottom - margins.top
    })
    layer.setState({
        ...layer.getState(),
        timeRange,
        transformations,
        yAxisTransformations,
        yAxisWidths,
        yAxisHeights,
        inverseTransformations
    })
}

export const handleClick: DiscreteMouseEventHandler = (e: ClickEvent, layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>) => {
    if (e.type === ClickEventType.Move) return
    
    const props = layer.getProps()
    const state = layer.getState()
    if (!props) return
    if (!state) return
    const { inverseTransformations, dragging } = state

    for (let i = 0; i< inverseTransformations.length; i++) {
        const p = transformPoint(inverseTransformations[i], e.point)
        if ((0 <= p[1]) && (p[1] <= 1)) {
            if (e.type === ClickEventType.Press) {
                layer.setState({...state, captureWheel: true, anchorTimepoint: p[0], dragging: false})
            }
            else if (e.type === ClickEventType.Release) {
                if (!dragging) {
                    props.onClick && props.onClick({timepoint: p[0], panelIndex: i, y: p[1]})
                }
            }
            return
        }
    }
}

export const handleMouseOut: MousePresenceEventHandler = (e: MousePresenceEvent, layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>) => {
    if (e.type !== MousePresenceEventType.Leave) return
    layer.setState({...layer.getState(), captureWheel: false})
}

const shiftTimeRange = (timeRange: {min: number, max: number}, shift: number): {min: number, max: number} => {
    return {
        min: Math.floor(timeRange.min + shift),
        max: Math.floor(timeRange.max + shift)
    }
}

export const handleDrag: DragHandler = (layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>, drag: CanvasDragEvent) => {
    const props = layer.getProps()
    if (!props) return
    const state = layer.getState()
    const {anchorTimepoint, inverseTransformations, timeRange} = state
    if (timeRange === null) return
    const pos = drag.position
    if (!pos) return
    if (inverseTransformations.length === 0) return
    layer.setState({...state, dragging: true})
    const t = transformPoint(inverseTransformations[0], pos)[0]
    if (anchorTimepoint !== null) {
        const newTimeRange = shiftTimeRange(timeRange, anchorTimepoint - t)
        props.onDrag && props.onDrag({newTimeRange})
    }
    else {
        layer.setState({...state, anchorTimepoint: t})
    }
}

export const handleWheel: WheelEventHandler = (e: WheelEvent, layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>) => {
    const props = layer.getProps()
    if (!props) return
    const listening = layer.getState().captureWheel
    if (!listening) return
    if (e.deltaY > 0) {
        props.onTimeZoom && props.onTimeZoom({direction: 'out'})
    }
    else if (e.deltaY < 0) {
        props.onTimeZoom && props.onTimeZoom({direction: 'in'})
    }
}

export const handleKeyboardEvent: KeyboardEventHandler = (e: KeyboardEvent, layer: CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>): boolean => {
    const props = layer.getProps()
    if (!props) return true
    for (let a of props.customActions || []) {
        if (a.type === 'button') {
            if (a.keyCode === e.keyCode) {
                a.callback()
                return false
            }
        }
    }
    switch (e.keyCode) {
        case 37: props.onTimeShiftFrac && props.onTimeShiftFrac(-0.2); return false;
        case 39: props.onTimeShiftFrac && props.onTimeShiftFrac(+0.2); return false;
        case 187: props.onTimeZoom && props.onTimeZoom({direction: 'out'}); return false;
        case 189: props.onTimeZoom && props.onTimeZoom({direction: 'in'}); return false;
        case 35: props.onGotoEnd && props.onGotoEnd(); return false;
        case 36: props.onGotoHome && props.onGotoHome(); return false;
        default: return true; // console.info('key: ' + e.keyCode); return true;
    }
}

export const createMainLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {  
            discreteMouseEventHandlers: [handleClick],
            dragHandlers: [handleDrag],
            keyboardEventHandlers: [handleKeyboardEvent],
            mousePresenceEventHandlers: [handleMouseOut],
            wheelEventHandlers: [handleWheel],
        }
    )
}