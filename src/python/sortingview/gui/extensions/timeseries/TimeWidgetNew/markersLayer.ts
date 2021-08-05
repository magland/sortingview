import { funcToTransform } from 'figurl/labbox-react/components/CanvasWidget'
import { CanvasPainter, Pen } from "figurl/labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "figurl/labbox-react/components/CanvasWidget/CanvasWidgetLayer"
import { Vec2 } from "figurl/labbox-react/components/CanvasWidget/Geometry"
import { TimeWidgetLayerProps } from "./TimeWidgetLayerProps"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {

}

const initialLayerState = {}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { markers, timeRange, width, height, margins } = layerProps
    if (!timeRange) return

    painter.wipe()

    if (!markers) return

    const transformation = funcToTransform((p: Vec2): Vec2 => {
        const xfrac = (p[0] - timeRange.min) / (timeRange.max - timeRange.min)
        const yfrac = p[1]
        const x = margins.left + xfrac * (width - margins.left - margins.right)
        const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
        return [x, y]
    })

    const painter2 = painter.transform(transformation)

    for (let marker of markers) {
        const {t, color} = marker
        const pen: Pen = {color, width: 1}
        if ((timeRange.min <= t) && (t <= timeRange.max)) {
            painter2.drawLine(t, 0, t, 1, pen)
        }
    }
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
    // layer.scheduleRepaint()
    layer.repaintImmediate()
}

export const createMarkersLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(onPaint, onPropsChange, initialLayerState)
}