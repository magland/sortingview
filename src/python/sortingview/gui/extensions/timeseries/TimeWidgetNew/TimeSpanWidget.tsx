import React, { FunctionComponent } from 'react';
import { funcToTransform } from 'figurl/labbox-react/components/CanvasWidget';
import { CanvasPainter } from 'figurl/labbox-react/components/CanvasWidget/CanvasPainter';
import CanvasWidget from 'figurl/labbox-react/components/CanvasWidget/CanvasWidget';
import { CanvasDragEvent, CanvasWidgetLayer, ClickEvent, ClickEventType, useLayer, useLayers } from 'figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import { Vec2 } from 'figurl/labbox-react/components/CanvasWidget/Geometry';


export interface SpanWidgetInfo {
    numTimepoints: number | null
    currentTime?: number | null
    timeRange?: {min: number, max: number} | null
}

interface Props {
    width: number
    height: number
    info: SpanWidgetInfo
    onCurrentTimeChanged: (t: number | null) => void
    onTimeRangeChanged: (tr: {min: number, max: number}) => void
}

interface LayerProps {
    width: number
    height: number
    info: SpanWidgetInfo
    onCurrentTimeChanged: (t: number | null) => void
    onTimeRangeChanged: (t: {min: number, max: number}) => void
}
interface LayerState {
    dragTimeRange?: {min: number, max: number} | null
    dragging?: boolean
    anchorTimeRange?: {min: number, max: number}
    anchorCurrentTime?: number | null
}

const initialLayerState = {
}

const createTimeSpanLayer = () => {
    const onPaint = (painter: CanvasPainter, layerProps: LayerProps, state: LayerState) => {
        const { numTimepoints, timeRange, currentTime }= layerProps.info
        const { dragTimeRange } = state || {}
        if (!timeRange) return
        if (!numTimepoints) return
        painter.wipe()
        painter.fillRect({xmin: 0, ymin: 0.4, xmax: numTimepoints, ymax: 0.6}, {color: 'lightgray'});
        painter.fillRect({xmin: timeRange.min, ymin: 0.3, xmax: timeRange.max, ymax: 0.7}, {color: 'lightgray'});
        painter.drawRect({xmin: timeRange.min, ymin: 0.3, xmax: timeRange.max, ymax: 0.7}, {color: 'gray', width: 2});
        if (currentTime) {
            painter.drawLine(currentTime, 0.3, currentTime, 0.7, {color: 'blue', width: 2})
        }
        if (dragTimeRange) {
            painter.drawRect({xmin: dragTimeRange.min, ymin: 0.3, xmax: dragTimeRange.max, ymax: 0.7}, {color: 'darkgreen', width: 2});
        }
    }

    const onPropsChange = (layer: CanvasWidgetLayer<LayerProps, LayerState>, layerProps: LayerProps) => {
        const transform = (p: Vec2): Vec2 => {
            const numTimepoints = layerProps.info.numTimepoints
            if (!numTimepoints) return [0, 0]
            const margins = {left: 50, right: 50}
            const xfrac = p[0] / numTimepoints
            const yfrac = p[1]
            return [margins.left + xfrac * (layerProps.width - margins.left - margins.right), yfrac * layerProps.height]
        }
        const M = funcToTransform(transform)
        layer.setTransformMatrix(M)
        layer.scheduleRepaint()
    }

    const onMouseEvent = (e: ClickEvent, layer: CanvasWidgetLayer<LayerProps, LayerState>) => {
        const props = layer.getProps()
        const state = layer.getState()
        if (!props) return
        if (!state) return
        if (e.type === ClickEventType.Press) {
            layer.setState({
                ...layer.getState(),
                dragging: false
            })
        }
        else if (e.type === ClickEventType.Release) {
            if (!state.dragging) {
                const timeRange = props.info.timeRange
                if (!timeRange) return
                const t = e.point[0]
                props.onCurrentTimeChanged(t)
                const span = timeRange.max - timeRange.min
                props.onTimeRangeChanged({min: Math.floor(t - span / 2), max: Math.floor(t + span / 2)})
            }
        }
    }

    const onDrag = (layer: CanvasWidgetLayer<LayerProps, LayerState>, drag: CanvasDragEvent) => {
        const props = layer.getProps()
        if (!props) return
        const numTimepoints = props.info.numTimepoints
        if (!numTimepoints) return
        const {anchorCurrentTime, anchorTimeRange, dragging} = layer.getState() as LayerState
        if (!dragging) {
            const timeRange = props.info.timeRange
            if (!timeRange) return
            layer.setState({
                ...layer.getState(),
                dragging: true,
                anchorCurrentTime: props.info.currentTime || null,
                anchorTimeRange: timeRange
            })
        }
        const { position, anchor } = drag
        if (!position) return
        if (!anchor) return
        let delta = position[0] - anchor[0]
        if (!anchorTimeRange) return
        if (anchorTimeRange.max + delta > numTimepoints) {
            delta = numTimepoints - anchorTimeRange.max
        }
        if (anchorTimeRange.min + delta < 0) {
            delta = 0 - anchorTimeRange.min
        }
        if ((anchorCurrentTime !== null) && (anchorCurrentTime !== undefined)) {
            props.onCurrentTimeChanged(anchorCurrentTime + delta)
        }
        if (anchorTimeRange !== undefined) {
            props.onTimeRangeChanged({min: anchorTimeRange.min + delta, max: anchorTimeRange.max + delta})
        }
    }

    return new CanvasWidgetLayer<LayerProps, LayerState>(onPaint, onPropsChange, initialLayerState, {
        discreteMouseEventHandlers: [onMouseEvent],
        dragHandlers: [onDrag]
    })
}

const TimeSpanWidget: FunctionComponent<Props> = (props) => {

    const layerProps = {
        width: props.width,
        height: props.height,
        info: props.info,
        onCurrentTimeChanged: props.onCurrentTimeChanged,
        onTimeRangeChanged: props.onTimeRangeChanged
    }
    const timeSpanLayer = useLayer(createTimeSpanLayer, layerProps)
    const layers = useLayers([timeSpanLayer])
    return (
        <CanvasWidget
            layers={layers}
            {...{width: props.width, height: props.height}}
        />
    )
}

export default TimeSpanWidget