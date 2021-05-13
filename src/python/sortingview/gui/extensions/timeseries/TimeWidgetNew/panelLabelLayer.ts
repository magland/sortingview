import { funcToTransform } from '../../../commonComponents/CanvasWidget'
import { CanvasPainter, Font, TextAlignment } from "../../../commonComponents/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer } from "../../../commonComponents/CanvasWidget/CanvasWidgetLayer"
import { RectangularRegion, Vec2 } from "../../../commonComponents/CanvasWidget/Geometry"
import { TimeWidgetLayerProps } from "./TimeWidgetLayerProps"

type Layer = CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>

interface LayerState {

}

const initialLayerState = {}

const onPaint = (painter: CanvasPainter, layerProps: TimeWidgetLayerProps, state: LayerState) => {
    const { panels, height, margins } = layerProps
    if (panels.length === 0) return

    painter.wipe()
    for (let i = 0; i < panels.length; i++) {
        const transformation = funcToTransform((p: Vec2): Vec2 => {
            const xfrac = p[0]
            const yfrac = (i / panels.length) + p[1] * (1 / panels.length)
            const x = 0 + xfrac * margins.left
            const y = height - margins.bottom - yfrac * (height - margins.bottom - margins.top)
            return [x, y]
        })
        const painter2 = painter.transform(transformation)
        const label: string = panels[i].label()
        let rect: RectangularRegion = {xmin: 0.2, ymin: 0.2, xmax: 0.6, ymax: 0.6}
        let alignment: TextAlignment = {Horizontal: 'AlignRight', Vertical: "AlignCenter"}
        const font: Font = {pixelSize: 12, family: 'Arial'}
        painter2.drawText({
            rect, alignment, font, pen: {color: 'black'}, brush: {color: 'black'}, text: label
        })
    }
}

const onPropsChange = (layer: Layer, layerProps: TimeWidgetLayerProps) => {
}

export const createPanelLabelLayer = () => {
    return new CanvasWidgetLayer<TimeWidgetLayerProps, LayerState>(onPaint, onPropsChange, initialLayerState)
}